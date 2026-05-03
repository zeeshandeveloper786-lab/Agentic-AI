import express from 'express';
import upload, { handleUploadError } from '../middlewares/upload.middleware.js';
import { uploadDocument, getAgentDocuments, deleteDocument } from '../controllers/document.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(auth);

router.post('/upload', upload.single('file'), handleUploadError, uploadDocument);
router.get('/agent/:agentId', getAgentDocuments);
router.delete('/:id', deleteDocument);

export default router;
