import prisma from '../prisma/client.js';

export const createAgent = async (req, res) => {
    try {
        let p = req.body.data ? { ...req.body.data, ...req.body } : req.body;
        if (req.body.agent) p = { ...p, ...req.body.agent };
        else if (req.body.agentData) p = { ...p, ...req.body.agentData };

        const name = p.agentName || p.name;
        const provider = p.modelProvider || p.provider || (typeof p.model === 'object' ? (p.model.provider || p.model.modelProvider) : null);
        let model = p.modelName;
        if (!model) {
            if (typeof p.model === 'string') model = p.model;
            else if (typeof p.model === 'object' && p.model !== null) model = p.model.name || p.model.id || p.model.value || p.model.modelName;
        }
        const prompt = p.systemPrompt || p.instructions || p.prompt;

        if (!name || !provider || !model || !prompt) {
            return res.status(400).json({ error: 'Missing required fields (name, provider, model, prompt)' });
        }

        const agent = await prisma.agent.create({
            data: { userId: req.user.id, agentName: name, description: p.description || '', modelProvider: provider, modelName: model, systemPrompt: prompt }
        });

        res.status(201).json(agent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create agent' });
    }
};

export const getAgents = async (req, res) => {
    try {
        const agents = await prisma.agent.findMany({
            where: { userId: req.user.id, deletedAt: null },
            include: { _count: { select: { tools: true, documents: true } } }
        });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
};

export const getAgentById = async (req, res) => {
    try {
        const agent = await prisma.agent.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: { tools: true, documents: true }
        });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
};

export const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        let p = req.body.data ? { ...req.body.data, ...req.body } : req.body;
        if (req.body.agent) p = { ...p, ...req.body.agent };

        const current = await prisma.agent.findFirst({ where: { id, userId } });
        if (!current) return res.status(404).json({ error: 'Agent not found' });

        const up = {};
        if (p.agentName || p.name) up.agentName = p.agentName || p.name;
        if (p.description !== undefined) up.description = p.description;
        if (p.modelProvider || p.provider) up.modelProvider = p.modelProvider || p.provider;
        if (p.modelName || p.model) {
            const m = p.modelName || p.model;
            up.modelName = typeof m === 'object' ? (m.name || m.id || m.value) : m;
        }
        if (p.systemPrompt || p.instructions || p.prompt) up.systemPrompt = p.systemPrompt || p.instructions || p.prompt;

        if (Object.keys(up).length === 0) return res.status(400).json({ error: 'No fields to update' });

        // Handle provider change (API Key cleanup)
        if (up.modelProvider && up.modelProvider !== current.modelProvider) {
            await prisma.apiKey.deleteMany({ where: { userId, provider: current.modelProvider } }).catch(() => { });
        }

        const agent = await prisma.agent.update({ where: { id }, data: up });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update agent' });
    }
};

export const deleteAgent = async (req, res) => {
    try {
        const agent = await prisma.agent.updateMany({
            where: { id: req.params.id, userId: req.user.id },
            data: { deletedAt: new Date() }
        });
        if (agent.count === 0) return res.status(404).json({ error: 'Agent not found' });
        res.json({ message: 'Agent moved to trash (3 days)' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete agent' });
    }
};

export const getDeletedAgents = async (req, res) => {
    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const agents = await prisma.agent.findMany({
            where: { userId: req.user.id, deletedAt: { not: null, gte: threeDaysAgo } }
        });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deleted agents' });
    }
};

export const restoreAgent = async (req, res) => {
    try {
        const agent = await prisma.agent.updateMany({
            where: { id: req.params.id, userId: req.user.id },
            data: { deletedAt: null }
        });
        if (agent.count === 0) return res.status(404).json({ error: 'Agent not found' });
        res.json({ message: 'Agent restored' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restore agent' });
    }
};

export const permanentDeleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership and existence
        const agent = await prisma.agent.findFirst({
            where: { id, userId }
        });

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // Delete the agent (cascade will handle relations)
        await prisma.agent.delete({
            where: { id }
        });

        res.json({ message: 'Agent permanently deleted' });
    } catch (error) {
        console.error('Permanent delete error:', error);
        res.status(500).json({ error: 'Failed to permanently delete agent' });
    }
};
