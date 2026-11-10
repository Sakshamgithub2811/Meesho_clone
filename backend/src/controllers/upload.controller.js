import { uploadFileToSupabase, deleteFileFromSupabase } from '../services/supabaseStorage.service.js';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif'
];

/**
 * 1. Single Image Upload
 * POST /api/v1/upload (or /api/v1/upload/single)
 * Query: ?folder=banners (or categories, products, kyc, avatars, returns)
 * Body: multipart/form-data with field 'image' (or 'file')
 */
export const uploadSingleImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please send a file in the "image" or "file" field.'
      });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, SVG, GIF.`
      });
    }

    const folder = req.query.folder || req.body.folder || 'general';

    const result = await uploadFileToSupabase({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      folder
    });

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Supabase Storage!',
      url: result.url,
      path: result.path,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });
  } catch (error) {
    console.error('❌ Upload Single Image Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image to Supabase cloud storage.',
      error: error.message
    });
  }
};

/**
 * 2. Multiple Images Upload (Up to 8 files)
 * POST /api/v1/upload/multiple
 * Query: ?folder=products
 * Body: multipart/form-data with field 'images' (or 'files')
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please send files in the "images" field.'
      });
    }

    const folder = req.query.folder || req.body.folder || 'general';

    // Validate all types
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} has unsupported type: ${file.mimetype}.`
        });
      }
    }

    // Upload concurrently to Supabase
    const uploadPromises = files.map((file) =>
      uploadFileToSupabase({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        folder
      })
    );

    const results = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      count: results.length,
      urls: results.map((r) => r.url),
      data: results
    });
  } catch (error) {
    console.error('❌ Upload Multiple Images Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload images to Supabase cloud storage.',
      error: error.message
    });
  }
};

/**
 * 3. Delete Image Endpoint
 * DELETE /api/v1/upload
 * Body: { path: "banners/hero_123.jpg" } or { url: "https://..." }
 */
export const deleteImage = async (req, res) => {
  try {
    const target = req.body.path || req.body.url || req.query.path || req.query.url;
    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Path or URL of the image to delete is required.'
      });
    }

    await deleteFileFromSupabase(target);

    return res.status(200).json({
      success: true,
      message: 'Image removed from Supabase storage successfully.'
    });
  } catch (error) {
    console.error('❌ Delete Image Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete image from Supabase storage.',
      error: error.message
    });
  }
};

