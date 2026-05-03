import express from 'express';
import { addApiKey, getApiKeys, deleteApiKey } from '../controllers/apiKey.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(auth);

router.post('/', addApiKey);
router.get('/', getApiKeys);
router.delete('/:provider', deleteApiKey);

export default router;
