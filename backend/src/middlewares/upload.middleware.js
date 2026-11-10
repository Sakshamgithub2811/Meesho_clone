import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Determine safe upload directory (portable across local development and Vercel serverless)
export const getUploadDir = (subfolder = '') => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  // In serverless environments (e.g. Vercel), /tmp is the only writable directory
  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'uploads', subfolder);
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch (e) {
      return os.tmpdir();
    }
  }

  // Local development environment
  const localDir = path.resolve('uploads', subfolder);
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch (err) {
    // Fallback to os.tmpdir if local directory is read-only
    const fallbackTmp = path.join(os.tmpdir(), 'uploads', subfolder);
    try {
      if (!fs.existsSync(fallbackTmp)) {
        fs.mkdirSync(fallbackTmp, { recursive: true });
      }
      return fallbackTmp;
    } catch (e) {
      return os.tmpdir();
    }
  }
};

// Storage configuration with dynamic destination resolution (no top-level mkdirSync)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dest = getUploadDir();
      cb(null, dest);
    } catch (err) {
      cb(null, os.tmpdir());
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter (accept images only)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp) are allowed!'), false);
  }
};

export const uploadProductMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 8, // Up to 8 images
  },
});

// Dedicated Avatar Storage (uploads/avatars/)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dest = getUploadDir('avatars');
      cb(null, dest);
    } catch (err) {
      cb(null, os.tmpdir());
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for profile avatars
    files: 1,
  },
});

export default {
  uploadProductMedia,
  uploadAvatar,
  getUploadDir
};
