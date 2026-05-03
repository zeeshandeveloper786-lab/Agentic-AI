import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import apiKeyRoutes from './routes/apiKey.routes.js';
import agentRoutes from './routes/agent.routes.js';
import toolRoutes from './routes/tool.routes.js';
import chatRoutes from './routes/chat.routes.js';
import chatSessionRoutes from './routes/chatSession.routes.js';
import documentRoutes from './routes/document.routes.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { REQUEST_LIMITS } from './config/constants.js';

dotenv.config();

const app = express();

// Security and Utility Middlewares
app.use((req, res, next) => {
    // Standard headers for Google/Firebase Auth popups
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Fallback for missing /api prefix in frontend requests
    const pathParts = req.path.split('/');
    const firstPart = pathParts[1];
    const apiRoutes = ['auth', 'keys', 'agents', 'tools', 'chat', 'documents', 'health'];

    if (apiRoutes.includes(firstPart) && !req.path.startsWith('/api/')) {
        req.url = `/api${req.url}`;
    }
    next();
});

// Middleware
app.use(cors({
    origin: true, // Allow all origins (reflects the request origin)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
}));

app.use(express.json({ limit: REQUEST_LIMITS.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_LIMITS.URL_ENCODED_LIMIT }));

// Detailed request/response logging
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat/sessions', chatSessionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Agentic AI Platform' });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
