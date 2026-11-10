import { Router } from 'express';
import multer from 'multer';
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
} from '../controllers/upload.controller.js';

// Memory storage keeps uploaded files in RAM as Buffer instead of writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 8 // Max 8 files per batch
  }
});

const router = Router();

// Handle flexible field names ('image' or 'file')
const singleUploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(err);
    if (req.file) return next();
    // Try 'file' field fallback
    upload.single('file')(req, res, next);
  });
};

// Handle flexible multiple field names ('images' or 'files')
const multipleUploadMiddleware = (req, res, next) => {
  upload.array('images', 8)(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) return next();
    // Try 'files' field fallback
    upload.array('files', 8)(req, res, next);
  });
};

// 1. Single file upload endpoint (used by Banners, Categories, Avatars, KYC)
// POST /api/v1/upload (or /api/v1/upload/single)
router.post('/', singleUploadMiddleware, uploadSingleImage);
router.post('/single', singleUploadMiddleware, uploadSingleImage);

// 2. Multiple files upload endpoint (used by Supplier Add Product, Customer Reviews)
// POST /api/v1/upload/multiple
router.post('/multiple', multipleUploadMiddleware, uploadMultipleImages);

// 3. Delete file endpoint
// DELETE /api/v1/upload
router.delete('/', deleteImage);

export default router;

