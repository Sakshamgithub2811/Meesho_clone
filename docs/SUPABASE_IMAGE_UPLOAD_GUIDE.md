# 📸 Supabase Cloud Image Upload — Team Integration Guide

This guide explains how any developer (**Shruti, Mehak, Kunal, Saksham**) can upload images directly to the central **Supabase Storage `images` bucket** across their respective modules with **Zero Orphan Files** standard (Upload on Save).

---

## ⚡ 1. Standard Best Practice: "Upload on Save" (Deferred Upload)

To prevent orphan / ghost files in Supabase Storage when users close or cancel forms:
1. **Selection / Drop:** Instant local visual preview in browser memory (`0` network calls).
2. **On Submit:** The image File is uploaded to Supabase Storage only after form validation passes, and the returned public CDN URL is saved directly into the database.

---

## 🛠️ 2. Frontend Helper Service (`uploadService.js`)

Import the centralized helper anywhere in your components:

```javascript
import { uploadImageToSupabase, uploadMultipleImagesToSupabase } from '../../services/uploadService';

// Single image upload (e.g. Banner, Category, Avatar, KYC document):
const cdnUrl = await uploadImageToSupabase(imageFile, 'products');

// Multiple images upload (e.g. Product Gallery, Customer Reviews):
const cdnUrls = await uploadMultipleImagesToSupabase(imageFilesArray, 'products');
```

---

## 🎨 3. Dropzone Integration in Forms (Copy-Paste Template)

```jsx
import React, { useState } from 'react';
import ImageUploadDropzone from '@/components/common/ImageUploadDropzone';
import { uploadImageToSupabase } from '@/services/uploadService';

export default function MyFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ title: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalImageUrl = formData.imageUrl;

    // 🚀 Upload to Supabase only on Save if user selected a new file
    if (selectedFile) {
      try {
        setIsUploading(true);
        finalImageUrl = await uploadImageToSupabase(selectedFile, 'products');
      } catch (err) {
        alert('Image upload failed: ' + err.message);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Save to Database API with clean Supabase CDN URL
    onSubmit({ ...formData, imageUrl: finalImageUrl });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Universal Dropzone */}
      <ImageUploadDropzone
        label="Product Image (1:1 Square)"
        value={formData.imageUrl}
        onChange={(previewOrUrl, file) => {
          setSelectedFile(file || null);
          setFormData(prev => ({ ...prev, imageUrl: previewOrUrl }));
        }}
        folder="products"
        aspectRatio="1/1"
        recommendedSize="Recommended: 800x800px, max 10MB"
        disabled={isUploading}
      />

      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading to Supabase...' : 'Save Product'}
      </button>
    </form>
  );
}
```

---

## 🌐 4. Central Backend API Endpoints (Under the Hood)

### A. Single File Upload
- **Method:** `POST`
- **Endpoint:** `/api/v1/upload?folder=<folder_name>`
- **Content-Type:** `multipart/form-data`
- **Field Name:** `image` or `file`

### B. Multiple Files Upload
- **Method:** `POST`
- **Endpoint:** `/api/v1/upload/multiple?folder=<folder_name>`
- **Content-Type:** `multipart/form-data`
- **Field Name:** `images` (Up to 8 files)

### C. Delete File from Storage
- **Method:** `DELETE`
- **Endpoint:** `/api/v1/upload`
- **Body:** `{ "url": "https://..." }` or `{ "path": "banners/file.png" }`

---

## 👥 5. Module Folder Conventions

| Developer | Module | Folder Parameter | Example URL |
| :--- | :--- | :--- | :--- |
| **Saksham** | Admin Banners | `?folder=banners` | `.../images/banners/...` |
| **Saksham** | Admin Categories | `?folder=categories` | `.../images/categories/...` |
| **Shruti** | Supplier Products | `?folder=products` | `.../images/products/...` |
| **Shruti** | Supplier Store Banner | `?folder=supplier_stores` | `.../images/supplier_stores/...` |
| **Mehak** | Customer Returns | `?folder=returns` | `.../images/returns/...` |
| **Mehak** | Customer Reviews | `?folder=reviews` | `.../images/reviews/...` |
| **Kunal** | Dropshipper KYC | `?folder=kyc` | `.../images/kyc/...` |
| **All** | User Avatars | `?folder=avatars` | `.../images/avatars/...` |
