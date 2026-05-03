import express from 'express';
import { chatWithAgent, getChatHistory } from '../controllers/chat.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(auth);

router.post('/', chatWithAgent);
router.get('/:agentId', getChatHistory);

export default router;
