import express from 'express';
import { addTool, getToolsByAgent, deleteTool, updateTool, testTool } from '../controllers/tool.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(auth);

router.post('/test', testTool);
router.post('/', addTool);
router.get('/agent/:agentId', getToolsByAgent);
router.patch('/:id', updateTool);
router.delete('/:id', deleteTool);

export default router;
