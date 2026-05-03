import prisma from '../prisma/client.js';
import { APP_CONFIG } from '../config/constants.js';

export const getSessions = async (req, res) => {
    try {
        const { agentId } = req.params;
        const userId = req.user.id;

        const sessions = await prisma.chatSession.findMany({
            where: { agentId, userId },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { messages: true } } }
        });

        // Auto-cleanup stale empty sessions
        const cleanupWindow = new Date(Date.now() - APP_CONFIG.SESSION_CLEANUP_WINDOW);
        const filteredSessions = sessions.filter(s => s._count.messages > 0 || s.createdAt > cleanupWindow);

        res.json(filteredSessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
};

export const createSession = async (req, res) => {
    try {
        const { agentId, title } = req.body;
        const userId = req.user.id;

        if (!agentId) return res.status(400).json({ error: 'Agent ID is required' });

        // Prevent rapid duplicate sessions
        const preventWindow = new Date(Date.now() - APP_CONFIG.DUPLICATE_SESSION_PREVENTION_WINDOW);
        const existingSession = await prisma.chatSession.findFirst({
            where: { agentId, userId, title: title || 'New Chat', createdAt: { gte: preventWindow } }
        });

        if (existingSession) return res.status(200).json(existingSession);

        const session = await prisma.chatSession.create({
            data: { agentId, userId, title: title || 'New Chat' }
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create chat session' });
    }
};

export const getSessionMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (!session || session.userId !== userId) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ history: session.messages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session messages' });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
        if (!session || session.userId !== userId) return res.status(404).json({ error: 'Session not found' });

        await prisma.chatSession.delete({ where: { id: sessionId } });
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete chat session' });
    }
};

export const updateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;

        const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
        if (!session || session.userId !== userId) return res.status(404).json({ error: 'Session not found' });

        const updatedSession = await prisma.chatSession.update({
            where: { id: sessionId },
            data: { title: title || session.title }
        });

        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update chat session' });
    }
};
