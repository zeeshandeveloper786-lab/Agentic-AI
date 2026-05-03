import ragService from '../services/rag.service.js';
import prisma from '../prisma/client.js';

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { agentId } = req.body;
        const userId = req.user.id;

        if (!agentId) return res.status(400).json({ error: 'Agent ID is required' });

        const agent = await prisma.agent.findFirst({ where: { id: agentId, userId } });
        if (!agent) return res.status(404).json({ error: 'Agent not found or unauthorized' });

        process.stdout.write(`📤 Uploading: ${req.file.originalname} for agent ${agent.agentName}... `);

        const document = await ragService.processDocument(
            req.file.path,
            req.file.originalname,
            req.file.mimetype,
            agentId,
            userId
        );

        console.log('✅ Done');

        res.status(201).json({
            message: 'Document processed successfully',
            document
        });
    } catch (error) {
        console.error('\n❌ Upload Error:', error.message);
        res.status(500).json({
            error: 'Failed to process document',
            message: error.message
        });
    }
};

export const getAgentDocuments = async (req, res) => {
    try {
        const { agentId } = req.params;
        const userId = req.user.id;

        const agent = await prisma.agent.findFirst({ where: { id: agentId, userId } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        const documents = await prisma.document.findMany({ where: { agentId } });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const document = await prisma.document.findUnique({
            where: { id },
            include: { agent: true }
        });

        if (!document || document.agent.userId !== userId) {
            return res.status(404).json({ error: 'Document not found' });
        }

        await prisma.document.delete({ where: { id } });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
};
