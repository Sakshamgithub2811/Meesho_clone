import { API_V1_BASE } from '../config/apiConfig';

/**
 * Universal Service to upload a single image File to Supabase Storage Bucket ('images')
 * @param {File} file - Browser File object from file input
 * @param {string} [folder='general'] - Subfolder inside the bucket (e.g. 'banners', 'categories', 'products', 'kyc')
 * @returns {Promise<string>} Public CDN URL
 */
export async function uploadImageToSupabase(file, folder = 'general') {
  if (!file) throw new Error('No file provided for upload.');

  const formData = new FormData();
  formData.append('image', file);

  const endpoint = `${API_V1_BASE}/upload?folder=${encodeURIComponent(folder)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.url) {
    throw new Error(data.message || data.error || 'Failed to upload image to Supabase cloud storage.');
  }

  return data.url;
}

/**
 * Upload multiple images concurrently to Supabase Storage Bucket
 * @param {File[]} files - Array of File objects
 * @param {string} [folder='products'] - Subfolder inside bucket
 * @returns {Promise<string[]>} Array of Public CDN URLs
 */
export async function uploadMultipleImagesToSupabase(files, folder = 'general') {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }

  const endpoint = `${API_V1_BASE}/upload/multiple?folder=${encodeURIComponent(folder)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.urls) {
    throw new Error(data.message || data.error || 'Failed to upload images to Supabase cloud storage.');
  }

  return data.urls;
}

/**
 * Delete an image from Supabase Storage by its public URL or path
 * @param {string} pathOrUrl - File path inside bucket or public URL
 * @returns {Promise<boolean>}
 */
export async function deleteImageFromSupabase(pathOrUrl) {
  if (!pathOrUrl) return false;

  try {
    const endpoint = `${API_V1_BASE}/upload`;
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: pathOrUrl }),
    });

    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn('Failed to delete image from Supabase storage:', err);
    return false;
  }
}

export default {
  uploadImageToSupabase,
  uploadMultipleImagesToSupabase,
  deleteImageFromSupabase,
};
