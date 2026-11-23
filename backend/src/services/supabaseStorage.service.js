import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import defaultSupabaseClient from '../config/supabaseClient.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabase.hrgroupco.in';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Cog63mSnnN3QNlVxNPvftt_XFjmviEv';

export const DEFAULT_BUCKET = 'dropshipper-assets';
export const IMAGE_BUCKET = 'images';

// Supabase Storage Client
let supabaseStorageClient = defaultSupabaseClient;
if (!supabaseStorageClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseStorageClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn("⚠️ Failed to initialize Supabase Storage Client:", err?.message || err);
  }
}
export const supabase = supabaseStorageClient;

/**
 * Universal upload function supporting both Dropshipper Assets and Supplier Images
 * @param {Object} params
 * @param {Buffer} [params.fileBuffer] - In-memory buffer
 * @param {Buffer} [params.buffer] - In-memory buffer (alias)
 * @param {string} [params.originalFilename] - Original filename
 * @param {string} [params.originalname] - Original filename (alias)
 * @param {string} [params.mimeType] - MIME type
 * @param {string} [params.mimetype] - MIME type (alias)
 * @param {string} [params.folder='general'] - Subfolder inside the bucket
 * @param {string} [params.bucket] - Supabase bucket ('dropshipper-assets' | 'images' | etc.)
 * @returns {Promise<{ success: boolean, url: string, path: string, fullPath?: string, bucket: string }>}
 */
export async function uploadFileToSupabase({
  fileBuffer,
  buffer,
  originalFilename = 'asset.png',
  originalname,
  mimeType,
  mimetype = 'image/png',
  folder = 'general',
  bucket
}) {
  const activeBuffer = fileBuffer || buffer;
  if (!activeBuffer) {
    throw new Error('No file buffer provided for Supabase upload.');
  }
  if (!supabase) {
    throw new Error('Supabase Storage Client is not available or configured.');
  }

  const activeName = originalname || originalFilename;
  const activeMime = mimetype || mimeType || 'image/png';

  // Automatically route to appropriate bucket if not explicitly passed
  let targetBucket = bucket;
  if (!targetBucket) {
    if (['banners', 'categories', 'products', 'supplier'].includes(folder.toLowerCase())) {
      targetBucket = IMAGE_BUCKET;
    } else {
      targetBucket = DEFAULT_BUCKET;
    }
  }

  try {
    const safeFolder = folder.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'general';
    const ext = path.extname(activeName) || (activeMime.includes('png') ? '.png' : activeMime.includes('webp') ? '.webp' : activeMime.includes('pdf') ? '.pdf' : '.jpg');
    const cleanBase = path.basename(activeName, ext).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const remotePath = `${safeFolder}/${cleanBase}_${uniqueSuffix}${ext}`;

    const { data, error } = await supabase.storage.from(targetBucket).upload(remotePath, activeBuffer, {
      contentType: activeMime,
      cacheControl: '31536000',
      upsert: true
    });

    if (error) {
      console.error(`[SupabaseStorage] Upload error in bucket "${targetBucket}":`, error.message);
      throw error;
    }

    const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(remotePath);
    const publicUrl = urlData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${targetBucket}/${remotePath}`;

    return {
      success: true,
      url: publicUrl,
      path: remotePath,
      fullPath: data?.fullPath || `${targetBucket}/${remotePath}`,
      bucket: targetBucket
    };
  } catch (err) {
    console.error(`[SupabaseStorage] Failed to upload asset to "${targetBucket}":`, err.message);
    throw err;
  }
}

/**
 * Upload a Base64 data string to Supabase Storage Bucket
 * @param {Object} params
 * @param {string} params.base64Data - Data URL string (e.g. data:image/png;base64,...)
 * @param {string} [params.filename] - Custom file name
 * @param {string} [params.folder='uploads'] - Subfolder destination
 * @param {string} [params.bucket] - Supabase bucket name
 * @returns {Promise<{ success: boolean, url: string, path: string }>}
 */
export async function uploadBase64ToSupabase({
  base64Data,
  filename = 'file.png',
  folder = 'uploads',
  bucket = DEFAULT_BUCKET
}) {
  try {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 data string provided.');
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 format. Expected "data:<mime-type>;base64,<encoded-data>"');
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return await uploadFileToSupabase({
      fileBuffer: buffer,
      originalFilename: filename,
      mimeType,
      folder,
      bucket
    });
  } catch (err) {
    console.error('[SupabaseStorage] Base64 upload failed:', err.message);
    throw err;
  }
}

/**
 * Delete a file from Supabase Storage by its bucket path
 * @param {string} filePath - Path inside bucket (e.g. 'banners/hero_123.jpg')
 * @param {string} [bucket=IMAGE_BUCKET] - Target bucket
 */
export async function deleteFileFromSupabase(filePath, bucket = IMAGE_BUCKET) {
  if (!filePath) return;
  try {
    let cleanPath = filePath;
    const bucketPrefix = `/storage/v1/object/public/${bucket}/`;
    if (cleanPath.includes(bucketPrefix)) {
      cleanPath = cleanPath.split(bucketPrefix)[1];
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([cleanPath]);

    if (error) {
      console.warn('⚠️ Supabase file delete warning:', error.message);
    }
  } catch (err) {
    console.warn('⚠️ Failed to delete file from Supabase:', err.message);
  }
}

export default {
  uploadFileToSupabase,
  uploadBase64ToSupabase,
  deleteFileFromSupabase,
  supabase,
  DEFAULT_BUCKET,
  IMAGE_BUCKET
};
