import prisma from '../prisma/client.js';
import { encrypt } from '../utils/encryption.js';

export const addApiKey = async (req, res) => {
    try {
        const { provider, key } = req.body;
        const userId = req.user.id;

        if (!provider || !key) return res.status(400).json({ error: 'Provider and key are required' });

        const apiKey = await prisma.apiKey.upsert({
            where: { userId_provider: { userId, provider } },
            update: { encryptedKey: encrypt(key) },
            create: { userId, provider, encryptedKey: encrypt(key) }
        });

        res.status(201).json({ message: 'API key saved successfully', provider: apiKey.provider });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save API key' });
    }
};

export const getApiKeys = async (req, res) => {
    try {
        const userId = req.user.id;
        const keys = await prisma.apiKey.findMany({
            where: { userId },
            select: { provider: true, createdAt: true }
        });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
};

export const deleteApiKey = async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user.id;

        await prisma.apiKey.delete({
            where: { userId_provider: { userId, provider } }
        });

        res.json({ message: 'API key deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete API key' });
    }
};
