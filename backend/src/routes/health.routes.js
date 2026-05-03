import express from 'express';
import prisma from '../prisma/client.js';
import ragService from '../services/rag.service.js';

const router = express.Router();

// Health check for document processing
router.get('/document-health', async (req, res) => {
    try {
        const checks = {
            database: false,
            pdfParser: false,
            vectorExtension: false
        };

        // Check database connection
        try {
            await prisma.$queryRaw`SELECT 1`;
            checks.database = true;
        } catch (err) {
            console.error('Database check failed:', err.message);
        }

        // Check PDF parser
        try {
            const pdfModule = await import('pdf-parse');
            checks.pdfParser = !!pdfModule.default || !!pdfModule;
        } catch (err) {
            console.error('PDF parser check failed:', err.message);
        }

        // Check pgvector extension
        try {
            await prisma.$queryRaw`SELECT '[1,2,3]'::vector`;
            checks.vectorExtension = true;
        } catch (err) {
            console.error('Vector extension check failed:', err.message);
        }

        const allHealthy = Object.values(checks).every(v => v === true);

        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'healthy' : 'unhealthy',
            checks,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Test endpoint to verify RAG service
router.get('/test-rag', async (req, res) => {
    try {
        const result = {
            ragServiceLoaded: !!ragService,
            methods: {
                processDocument: typeof ragService.processDocument === 'function',
                searchSimilar: typeof ragService.searchSimilar === 'function',
                getEmbeddingsModel: typeof ragService.getEmbeddingsModel === 'function'
            }
        };

        res.json({
            status: 'ok',
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

export default router;
