import express from 'express';
import { createAgent, getAgents, getAgentById, updateAgent, deleteAgent, getDeletedAgents, restoreAgent, permanentDeleteAgent } from '../controllers/agent.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(auth);

router.post('/', createAgent);
router.get('/', getAgents);
router.get('/deleted', getDeletedAgents); // Fetch deleted agents
router.post('/:id/restore', restoreAgent); // Restore a deleted agent
router.get('/:id', getAgentById);
router.patch('/:id', updateAgent);
router.delete('/:id', deleteAgent);
router.delete('/:id/permanent', permanentDeleteAgent);

export default router;
