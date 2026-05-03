import ivm from 'isolated-vm';
import { SANDBOX_CONFIG } from '../config/constants.js';

class SandboxService {
    async runTool(code, input, options = {}) {
        const isolate = new ivm.Isolate({ memoryLimit: options.memoryLimit || SANDBOX_CONFIG.MEMORY_LIMIT });

        try {
            const context = await isolate.createContext();
            const jail = context.global;

            // Required for global access
            await jail.set('global', jail.derefInto());

            /* -------------------- Console bridge -------------------- */
            const consoleRef = new ivm.Reference({
                log: (...args) => console.log('[SANDBOX LOG]', ...args),
                error: (...args) => console.error('[SANDBOX ERROR]', ...args),
                warn: (...args) => console.warn('[SANDBOX WARN]', ...args),
            });

            await jail.set('_console', consoleRef);

            await isolate.compileScript(`
        global.console = {
          log: (...a) => _console.getSync('log').applySync(undefined, a, { arguments: { copy: true } }),
          error: (...a) => _console.getSync('error').applySync(undefined, a, { arguments: { copy: true } }),
          warn: (...a) => _console.getSync('warn').applySync(undefined, a, { arguments: { copy: true } })
        };
        // Backward compatibility for log()
        global.log = global.console.log;
      `).then(s => s.run(context));

            /* -------------------- Safe fetch (Bridge) -------------------- */
            // We create a host-side fetcher that handles the network call and parsing
            // This avoids issues with passing complex Response objects across the boundary
            const fetchHost = async (url, options) => {
                const res = await fetch(url, options);
                const contentType = res.headers.get('content-type') || '';
                const isJson = contentType.includes('application/json');
                const body = isJson ? await res.json() : await res.text();

                return {
                    ok: res.ok,
                    status: res.status,
                    statusText: res.statusText,
                    body: body,
                    isJson: isJson
                };
            };

            const fetchRef = new ivm.Reference(fetchHost);
            await jail.set('_fetch', fetchRef);

            await isolate.compileScript(`
                global.fetch = async (...args) => {
                    const res = await _fetch.apply(undefined, args, { 
                        arguments: { copy: true }, 
                        result: { promise: true, copy: true } 
                    });
                    
                    return {
                        ok: res.ok,
                        status: res.status,
                        statusText: res.statusText,
                        json: async () => res.isJson ? res.body : JSON.parse(res.body),
                        text: async () => res.isJson ? JSON.stringify(res.body) : res.body
                    };
                };
            `).then(s => s.run(context));

            /* -------------------- Execute user code -------------------- */
            const wrappedScript = `
                const input = ${JSON.stringify(input)};

                async function __run() {
                    ${code}

                    // Smart detection of different tool patterns
                    if (typeof tool === 'function') return await tool(input);
                    if (typeof handler === 'function') return await handler(input);
                    if (typeof exports?.default === 'function') return await exports.default(input);
                    if (typeof module?.exports === 'function') return await module.exports(input);
                    if (typeof module?.exports?.default === 'function') return await module.exports.default(input);

                    // Fallback to variables if no function pattern matched
                    if (typeof result !== 'undefined') return result;
                    if (typeof output !== 'undefined') return output;

                    return undefined;
                }

                __run();
            `;

            const script = await isolate.compileScript(wrappedScript);

            let result = await script.run(context, {
                timeout: SANDBOX_CONFIG.EXECUTION_TIMEOUT,
                promise: true,
                copy: true
            });

            return result;

        } catch (error) {
            console.error('Sandbox Execution Error:', error);

            // Format the error message to be more helpful for the user
            let errorMessage = error.message;
            if (error.message.includes('timed out')) {
                errorMessage = `Timeout: Tool execution exceeded ${SANDBOX_CONFIG.EXECUTION_TIMEOUT / 1000}s limit.`;
            } else if (error.stack && error.stack.includes('SyntaxError')) {
                errorMessage = `Syntax Error: ${error.message}`;
            } else {
                errorMessage = `Execution Error: ${error.message}`;
            }

            throw new Error(errorMessage);
        } finally {
            isolate.dispose();
        }
    }
}

export default new SandboxService();
