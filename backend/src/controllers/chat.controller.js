import aiService from '../services/ai.service.js';
import prisma from '../prisma/client.js';

export const chatWithAgent = async (req, res) => {
    try {
        const { agentId, message, history, sessionId } = req.body;
        const userId = req.user.id;

        if (!agentId || !message) {
            return res.status(400).json({ error: 'Agent ID and message are required' });
        }

        console.log(`🤖 Agent Request: ${agentId} | User: ${userId} | Session: ${sessionId || 'New'}`);

        // Validate history
        const validHistory = Array.isArray(history) ? history : [];

        // Execute Agent
        const result = await aiService.runAgent(agentId, userId, message, validHistory, sessionId);

        res.json({
            response: result.response,
            sessionId: result.sessionId
        });
    } catch (error) {
        console.error('❌ Chat Error:', error.message);

        res.status(500).json({
            error: 'Failed to get response from agent',
            message: error.message,
            errorType: error.name
        });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { agentId } = req.params;
        const userId = req.user.id;

        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        const history = await prisma.chatMessage.findMany({
            where: { agentId, userId },
            orderBy: { createdAt: 'asc' },
        });

        res.json({ history });
    } catch (error) {
        console.error('❌ Get chat history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};
