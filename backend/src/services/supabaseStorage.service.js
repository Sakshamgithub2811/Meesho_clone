import path from 'path';
import supabase from '../config/supabaseClient.js';

const BUCKET_NAME = 'images';

/**
 * Upload a memory buffer file to Supabase Storage Bucket ('images')
 * @param {Object} params
 * @param {Buffer} params.buffer - In-memory file buffer from multer
 * @param {string} params.originalname - Original uploaded file name
 * @param {string} params.mimetype - MIME type (e.g. 'image/jpeg', 'image/png')
 * @param {string} [params.folder='general'] - Subfolder inside the bucket (e.g. 'banners', 'categories', 'products', 'kyc')
 * @returns {Promise<{success: boolean, url: string, path: string}>}
 */
export async function uploadFileToSupabase({ buffer, originalname, mimetype, folder = 'general' }) {
  if (!buffer) {
    throw new Error('No file buffer provided for Supabase upload.');
  }

  // Sanitize folder name
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'general';

  // Extract and sanitize extension
  const ext = path.extname(originalname || '').toLowerCase() || (mimetype?.includes('png') ? '.png' : mimetype?.includes('webp') ? '.webp' : '.jpg');
  const baseName = path.basename(originalname || 'image', ext).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const uniqueKey = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const filePath = `${safeFolder}/${baseName}_${uniqueKey}${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimetype || 'image/jpeg',
      cacheControl: '31536000', // 1 year CDN cache
      upsert: true
    });

  if (error) {
    console.error('❌ Supabase Storage Upload Error:', error);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Get public CDN URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const publicUrl = urlData?.publicUrl;

  return {
    success: true,
    url: publicUrl,
    path: filePath,
    bucket: BUCKET_NAME
  };
}

/**
 * Delete a file from Supabase Storage by its bucket path
 * @param {string} filePath - Path inside bucket (e.g. 'banners/hero_123.jpg')
 */
export async function deleteFileFromSupabase(filePath) {
  if (!filePath) return;
  try {
    // If a full public URL was provided, extract the path relative to the bucket
    let cleanPath = filePath;
    const bucketPrefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
    if (cleanPath.includes(bucketPrefix)) {
      cleanPath = cleanPath.split(bucketPrefix)[1];
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([cleanPath]);

    if (error) {
      console.warn('⚠️ Supabase file delete warning:', error.message);
    }
  } catch (err) {
    console.warn('⚠️ Failed to delete file from Supabase:', err.message);
  }
}

