import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { FILE_UPLOAD } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    console.log('📎 File upload attempt:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        extension: ext
    });

    if (FILE_UPLOAD.ALLOWED_TYPES.includes(ext)) {
        console.log('✅ File type accepted');
        cb(null, true);
    } else {
        console.log('❌ File type rejected');
        cb(new Error(`Invalid file type. Only ${FILE_UPLOAD.ALLOWED_TYPES.join(', ')} are allowed.`));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_UPLOAD.MAX_SIZE
    }
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    console.error('📎 Upload middleware error:', err);

    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: 'Maximum file size is 20MB'
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    } else if (err) {
        // Other errors (like file type validation)
        return res.status(400).json({
            error: 'File validation error',
            details: err.message
        });
    }
    next();
};

export default upload;
