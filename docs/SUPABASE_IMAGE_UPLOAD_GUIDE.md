# 📸 Supabase Cloud Image Upload — Team Integration Guide

This guide explains how any developer (Shruti, Mehak, Kunal, Saksham) can upload images directly to the central **Supabase Storage `images` bucket** across their respective modules.

---

## 🌐 1. Central API Endpoint

- **Method:** `POST`
- **Endpoint:** `/api/v1/upload` (or `/api/v1/upload/single`)
- **Query Parameter:** `?folder=<module_name>` (e.g., `banners`, `categories`, `products`, `returns`, `kyc`, `avatars`)
- **Content-Type:** `multipart/form-data`
- **Field Name:** `image` or `file`

### Sample Response:
```json
{
  "success": true,
  "message": "Image uploaded successfully to Supabase Storage!",
  "url": "https://acwpkfwqkktjuezwbxkt.supabase.co/storage/v1/object/public/images/banners/sale_banner_1793889020.webp",
  "path": "banners/sale_banner_1793889020.webp",
  "filename": "sale_banner.png",
  "size": 245120,
  "mimetype": "image/png"
}
```

---

## 📦 2. Multiple Images Upload (e.g. Products / Reviews)

- **Method:** `POST`
- **Endpoint:** `/api/v1/upload/multiple?folder=products`
- **Field Name:** `images` (Up to 8 files)

### Sample Response:
```json
{
  "success": true,
  "count": 3,
  "urls": [
    "https://.../images/products/img1.webp",
    "https://.../images/products/img2.webp",
    "https://.../images/products/img3.webp"
  ]
}
```

---

## 🎨 3. Frontend Reusable Dropzone Component

Import the ready-made dropzone component anywhere in React:

```jsx
import ImageUploadDropzone from '@/components/common/ImageUploadDropzone';

// Inside your component:
<ImageUploadDropzone
  label="Product Image"
  value={formData.imageUrl}
  onChange={(uploadedUrl) => setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }))}
  folder="products"          // Subfolder inside 'images' bucket
  aspectRatio="1/1"          // '1/1' for products, '16/9' for banners
  recommendedSize="Recommended: 800x800px, max 10MB"
/>
```

---

## 👥 4. Module Folder Conventions

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
