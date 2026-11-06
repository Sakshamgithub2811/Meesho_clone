import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { uploadImageToSupabase } from '../../services/uploadService';

/**
 * Universal Drag-and-Drop Image Uploader with Supabase Storage Integration
 * Supports "Deferred Upload on Save" (prevents orphan files) and Manual URL fallback.
 * 
 * @param {Object} props
 * @param {string} props.value - Currently selected/uploaded image URL (CDN URL or local blob URL)
 * @param {function} props.onChange - Callback: (urlOrPreview: string, file: File|null) => void
 * @param {string} [props.folder='general'] - Destination Supabase folder (e.g. 'banners', 'categories', 'products', 'kyc')
 * @param {string} [props.label='Image'] - Label displayed above the input
 * @param {string} [props.aspectRatio='16/9'] - Visual aspect ratio (e.g. '16/9', '1/1', '4/3', '16/7')
 * @param {string} [props.recommendedSize='Max size: 10MB (JPEG, PNG, WEBP)'] - Helper guide
 * @param {boolean} [props.disabled=false] - Disable interactions during form submit
 * @param {string} [props.error] - Validation error message to display
 * @param {boolean} [props.deferUpload=true] - When true, delays cloud upload until form submit (zero orphan files)
 */
export default function ImageUploadDropzone({
  value = '',
  onChange,
  folder = 'general',
  label = 'Image',
  aspectRatio = '16/9',
  recommendedSize = 'Max size: 10MB (JPEG, PNG, WEBP)',
  disabled = false,
  error = '',
  deferUpload = true,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);
  const lastBlobUrlRef = useRef(null);

  // Clean up any generated blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
    };
  }, []);

  // Handle Drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Direct file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Process File selection
  const processSelectedFile = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Only image files (JPEG, PNG, WEBP, SVG) are allowed.');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      return;
    }

    setUploadError('');

    // Revoke previous blob if any
    if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(lastBlobUrlRef.current);
      lastBlobUrlRef.current = null;
    }

    // 1. Solution 1 (Default): Deferred Upload on Save
    // Create instant local memory preview (0 network call, 0 orphan files)
    if (deferUpload) {
      const localPreviewUrl = URL.createObjectURL(file);
      lastBlobUrlRef.current = localPreviewUrl;
      if (onChange) {
        onChange(localPreviewUrl, file);
      }
      return;
    }

    // 2. Immediate Upload mode (if deferUpload explicitly set to false)
    setIsUploading(true);
    try {
      const cdnUrl = await uploadImageToSupabase(file, folder);
      if (onChange) {
        onChange(cdnUrl, null);
      }
    } catch (err) {
      console.error('Image Upload Error:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(lastBlobUrlRef.current);
      lastBlobUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange('', null);
    }
    setUploadError('');
  };

  const isLocalBlob = Boolean(value && value.startsWith('blob:'));
  const isCloudUrl = Boolean(value && (value.includes('supabase') || value.startsWith('http')));

  return (
    <div className="space-y-2">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UploadCloud className="w-3 h-3 inline mr-1" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'url'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LinkIcon className="w-3 h-3 inline mr-1" />
            Paste URL
          </button>
        </div>
      </div>

      {/* Mode A: Direct Cloud Upload / Dropzone */}
      {mode === 'upload' && (
        <div>
          {value ? (
            // Uploaded / Selected Preview Card
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-950 group shadow-sm">
              <div style={{ aspectRatio }} className="w-full relative">
                <img
                  src={value}
                  alt="Selected Asset Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="px-3.5 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold shadow-md hover:bg-gray-100 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled || isUploading}
                    className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                {isLocalBlob ? (
                  <span className="px-2 py-0.5 bg-purple-600/90 text-white rounded-md text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-sm backdrop-blur-xs">
                    <Clock className="w-3 h-3" />
                    Ready to Upload on Save
                  </span>
                ) : isCloudUrl ? (
                  <span className="px-2 py-0.5 bg-emerald-500/90 text-white rounded-md text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-sm backdrop-blur-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Supabase CDN Live
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            // Empty Dropzone
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/50 scale-[0.99]'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50/60'
              } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-4 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-gray-700">Uploading to Supabase Cloud...</p>
                  <p className="text-[11px] text-gray-400">Saving high-res CDN asset in /{folder}</p>
                </div>
              ) : (
                <div className="py-2 flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      <span className="text-purple-600 hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{recommendedSize}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode B: Manual URL Paste */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or CDN link"
              value={value}
              onChange={(e) => {
                if (onChange) onChange(e.target.value, null);
              }}
              disabled={disabled || isUploading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {value && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900" style={{ aspectRatio }}>
              <img
                src={value}
                alt="URL Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {(uploadError || error) && (
        <p className="text-xs text-rose-500 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
