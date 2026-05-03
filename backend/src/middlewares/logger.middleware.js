// Request logger middleware - logs every incoming request in detail
export const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║ 📥 INCOMING REQUEST                                        ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║ Time: ${timestamp.padEnd(48)}║`);
    console.log(`║ Method: ${req.method.padEnd(50)}║`);
    console.log(`║ Path: ${req.path.padEnd(52)}║`);
    console.log(`║ URL: ${req.url.padEnd(53)}║`);
    console.log('╠═══════════════════════════════════════════════════════════╣');

    // Headers
    if (req.headers.authorization) {
        const authPreview = req.headers.authorization.substring(0, 20) + '...';
        console.log(`║ Auth: ${authPreview.padEnd(51)}║`);
    } else {
        console.log('║ Auth: None                                                ║');
    }

    console.log(`║ Content-Type: ${(req.headers['content-type'] || 'none').padEnd(42)}║`);

    // Body
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║ Body:                                                     ║');
        const bodyKeys = Object.keys(req.body);
        bodyKeys.forEach(key => {
            const value = typeof req.body[key] === 'string'
                ? req.body[key].substring(0, 30) + (req.body[key].length > 30 ? '...' : '')
                : JSON.stringify(req.body[key]).substring(0, 30);
            console.log(`║   ${key}: ${value.padEnd(48)}║`);
        });
    }

    // File
    if (req.file) {
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║ File:                                                     ║');
        console.log(`║   fieldname: ${req.file.fieldname.padEnd(43)}║`);
        console.log(`║   originalname: ${req.file.originalname.padEnd(40)}║`);
        console.log(`║   mimetype: ${req.file.mimetype.padEnd(44)}║`);
        console.log(`║   size: ${String(req.file.size).padEnd(50)}║`);
    }

    // User
    if (req.user) {
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║ User:                                                     ║');
        console.log(`║   id: ${req.user.id.padEnd(52)}║`);
        console.log(`║   email: ${(req.user.email || 'N/A').padEnd(47)}║`);
    }

    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║ 📤 OUTGOING RESPONSE                                       ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║ Status: ${String(res.statusCode).padEnd(50)}║`);
        console.log(`║ Path: ${req.path.padEnd(52)}║`);

        if (res.statusCode >= 400) {
            console.log('║ ❌ ERROR RESPONSE                                         ║');
            try {
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                if (parsed.error) {
                    console.log(`║ Error: ${String(parsed.error).substring(0, 49).padEnd(49)}║`);
                }
                if (parsed.details) {
                    console.log(`║ Details: ${String(parsed.details).substring(0, 47).padEnd(47)}║`);
                }
            } catch (e) {
                // Ignore parse errors
            }
        } else {
            console.log('║ ✅ SUCCESS RESPONSE                                       ║');
        }

        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        originalSend.call(this, data);
    };

    next();
};
