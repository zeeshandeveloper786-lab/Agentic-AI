import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicTool } from "@langchain/core/tools";
import prisma from "../prisma/client.js";
import { decrypt } from "../utils/encryption.js";
import ragService from "./rag.service.js";
import sandboxService from "./sandbox.service.js";
import builtInToolsService from "./builtInTools.service.js";
import { MODEL_DEFAULTS, APP_CONFIG } from "../config/constants.js";

class AIService {
    async getModel(agent, apiKey) {
        const modelProvider = (agent.modelProvider || '').toLowerCase();
        let modelName = agent.modelName || agent.model || MODEL_DEFAULTS.GEMINI_FLASH;

        if (!apiKey) throw new Error(`API Key for ${modelProvider} is missing.`);

        const config = { temperature: MODEL_DEFAULTS.TEMPERATURE };

        switch (modelProvider) {
            case 'openai':
                if (modelName.includes('gpt-3.5')) modelName = 'gpt-3.5-turbo';
                else if (modelName.includes('gpt-4o-mini')) modelName = 'gpt-4o-mini';
                else if (modelName.includes('gpt-4o')) modelName = 'gpt-4o';
                else if (modelName.includes('gpt-4')) modelName = 'gpt-4-turbo';
                return new ChatOpenAI({ ...config, model: modelName, openAIApiKey: apiKey });

            case 'gemini':
                modelName = modelName.trim().toLowerCase();
                if (modelName === 'flash' || modelName === 'gemini-flash') modelName = MODEL_DEFAULTS.GEMINI_FLASH;
                else if (modelName === 'pro' || modelName === 'gemini-pro') modelName = MODEL_DEFAULTS.GEMINI_PRO;
                else if (!modelName.startsWith('gemini-') && !modelName.startsWith('models/')) modelName = `gemini-${modelName}`;
                return new ChatGoogleGenerativeAI({ ...config, model: modelName, apiKey });

            case 'anthropic':
                if (modelName.includes('claude-3-5-sonnet')) modelName = 'claude-3-5-sonnet-20240620';
                else if (modelName.includes('claude-3-opus')) modelName = 'claude-3-opus-20240229';
                else if (modelName.includes('claude-3-haiku')) modelName = 'claude-3-haiku-20240307';
                return new ChatAnthropic({ ...config, model: modelName, anthropicApiKey: apiKey });

            default:
                throw new Error(`Unsupported provider: ${modelProvider}`);
        }
    }

    async getAgentInstance(agentId, userId) {
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId },
            include: { tools: true, documents: true }
        });

        if (!agent) throw new Error("Agent not found");

        const providerKey = await prisma.apiKey.findUnique({
            where: { userId_provider: { userId, provider: agent.modelProvider } }
        });

        if (!providerKey) throw new Error(`API Key for ${agent.modelProvider} not found.`);

        const model = await this.getModel(agent, decrypt(providerKey.encryptedKey));

        const customTools = agent.tools
            .filter(t => t.toolType === 'CUSTOM')
            .map(t => new DynamicTool({
                name: t.name.replace(/[^a-zA-Z0-9_-]/g, '_'),
                description: t.description || `Custom tool: ${t.name}`,
                func: (input) => sandboxService.runTool(t.code, input).catch(e => `Tool error: ${e.message}`)
            }));

        const builtInNames = agent.tools.filter(t => t.toolType === 'BUILT_IN').map(t => t.name);
        const builtInTools = await builtInToolsService.getTools(userId, builtInNames);

        const tools = [...customTools, ...builtInTools];

        if (agent.documents && agent.documents.length > 0) {
            tools.push(new DynamicTool({
                name: "search_knowledge_base",
                description: "Searches uploaded documents for specific information.",
                func: async (query) => {
                    const results = await ragService.searchSimilar(agentId, query, userId);
                    return results.length === 0 ? "No information found." : results.map(r => r.content).join("\n\n");
                }
            }));
        }

        return createReactAgent({ llm: model, tools, messageModifier: agent.systemPrompt || "" });
    }

    async runAgent(agentId, userId, message, history = [], sessionId = null) {
        try {
            let activeSessionId = sessionId;

            if (!activeSessionId) {
                const recentSession = await prisma.chatSession.findFirst({
                    where: {
                        agentId,
                        userId,
                        createdAt: { gte: new Date(Date.now() - APP_CONFIG.SESSION_AUTO_ATTACH_WINDOW) },
                        messages: { none: {} }
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (recentSession) {
                    activeSessionId = recentSession.id;
                } else {
                    const newSession = await prisma.chatSession.create({
                        data: { agentId, userId, title: message.substring(0, 30) || 'New Conversation' }
                    });
                    activeSessionId = newSession.id;
                }
            }

            const [savedMsg, dbHistory, agentInstance] = await Promise.all([
                prisma.chatMessage.create({
                    data: { agentId, userId, sessionId: activeSessionId, role: 'user', content: message }
                }),
                prisma.chatMessage.findMany({
                    where: { sessionId: activeSessionId },
                    orderBy: { createdAt: 'asc' },
                    take: 20
                }),
                this.getAgentInstance(agentId, userId)
            ]);

            const historyContext = dbHistory
                .filter(m => m.id !== savedMsg.id)
                .map(m => ({ role: m.role, content: m.content }));

            const response = await agentInstance.invoke({
                messages: [...historyContext, { role: "user", content: message }]
            });

            const responseContent = response.messages[response.messages.length - 1].content;

            await Promise.all([
                prisma.chatMessage.create({
                    data: { agentId, userId, sessionId: activeSessionId, role: 'assistant', content: responseContent }
                }),
                prisma.chatSession.update({
                    where: { id: activeSessionId },
                    data: { updatedAt: new Date() }
                })
            ]);

            return { response: responseContent, sessionId: activeSessionId };
        } catch (error) {
            console.error('❌ Run Agent Error:', error.message);
            throw error;
        }
    }
}

export default new AIService();
