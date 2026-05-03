import express from 'express';
import { getSessions, createSession, getSessionMessages, deleteSession, updateSession } from '../controllers/chatSession.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(auth);

router.get('/:agentId', getSessions);
router.post('/', createSession);
router.patch('/:sessionId', updateSession);
router.get('/:sessionId/messages', getSessionMessages);
router.delete('/:sessionId', deleteSession);

export default router;
