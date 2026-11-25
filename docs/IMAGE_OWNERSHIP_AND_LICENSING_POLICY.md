# 📸 Platform Image Ownership, Licensing & Hosting Requirements

**Document Version:** 1.0.0  
**Effective Date:** November 2026  
**Scope:** MShoppy Core Engineering, Catalog Teams, Suppliers, Dropshippers, and Admin Moderation  

---

## 🎯 1. Core Purpose & Policy Overview

To ensure customer trust, legal compliance, peak mobile performance, and complete autonomy over platform assets, **MShoppy prohibits reliance on direct third-party image URLs / external hotlinks** across all public catalogs, categories, banners, and product detail pages.

Every image presented on the MShoppy platform must be **owned, properly licensed, and hosted on our own dedicated storage infrastructure**.

---

## 🛡️ 2. Approved Image Sourcing Approaches

All product and catalog imagery on MShoppy must strictly follow one of the two authorized pathways:

### Approach 1: High-Quality, Royalty-Free Stock Images
* **Permitted Sources:**
  - Commercially licensed stock libraries (e.g., Unsplash Commercial License, Pexels, Pixabay, Freepik Commercial, Shutterstock, Adobe Stock).
  - Supplier original in-house product photography.
* **Licensing Requirements:**
  - Must grant perpetual, worldwide, royalty-free commercial rights to use, reproduce, and display the assets on e-commerce platforms.
  - Zero watermarks, stock site copyright overlays, or proprietary brand logos belonging to unrelated third parties.
* **Product Relevance:**
  - Stock images must strictly match the product category, type, and appearance. Generic placeholders (e.g., displaying a poetry book photo for a finance book) are strictly classified as catalog violations and will be rejected.

### Approach 2: AI-Generated Product Images
* **Permitted Generation Platforms:**
  - Professional AI generation models granting full commercial exploitation rights (e.g., Midjourney Pro/Business, OpenAI DALL-E 3 Commercial, Google Imagen, Flux Commercial).
* **Fidelity & Truthfulness Standard:**
  - AI-generated assets must accurately represent the physical product being delivered to the customer (including correct form factor, color palette, dimensions, and materials).
  - Deceptive feature hallucinations (e.g., depicting non-existent functions, misleading gold/diamond purity, or altered fabric textures) violate Consumer Protection (E-Commerce) Rules and are strictly prohibited.
* **Commercial Exclusivity:**
  - Sellers must retain verifiable commercial usage rights and intellectual property indemnity from their AI provider.

---

## ☁️ 3. Self-Hosted Storage Mandate (Zero External Hotlinking)

### 3.1 Strict Prohibition of External Hotlinking
* **Forbidden Domains in Production:**
  - Direct hotlinking to external third-party servers (e.g., `images.unsplash.com`, `pinterest.com`, `myntassets.com`, `flixcart.com`, `media-amazon.com`) is strictly prohibited in live catalog entries.
* **Risks Eliminated by Self-Hosting:**
  - **404 Broken Images:** External hosts modify paths or delete assets without notice.
  - **Rate Limiting & CORS Blocks:** Third-party CDNs throttle high-traffic marketplace requests.
  - **Security & Privacy:** Eliminates third-party tracking cookies and referrer leakage.
  - **Licensing Revocation:** Third-party hosts can alter terms or remove access unpredictably.

### 3.2 Platform Storage Architecture
* All catalog assets must be uploaded to and served from the platform's self-hosted **Supabase Storage Engine** (or local S3-compatible production CDN):
  - **Root URL Format:** `https://supabase.hrgroupco.in/storage/v1/object/public/images/products/...`
  - **Category Visuals:** `https://supabase.hrgroupco.in/storage/v1/object/public/images/categories/...`
  - **Promotional Banners:** `https://supabase.hrgroupco.in/storage/v1/object/public/images/banners/...`
* Automated ingestion scripts (`migrate_all_assets_to_supabase.js`) fetch approved stock buffers, optimize them, upload them to our bucket, and store clean permanent URLs in PostgreSQL.

---

## 📐 4. Technical Specifications & Image Standards

| Parameter | Specification | Recommendation |
| :--- | :--- | :--- |
| **File Format** | WebP (preferred), JPEG, PNG | WebP for maximum compression and mobile speed |
| **Resolution** | Minimum: 800 × 800 px | 1200 × 1200 px (1:1) or 900 × 1200 px (3:4 portrait) |
| **Max File Size** | 2.0 MB per image | Compressed between 80 KB – 300 KB |
| **Color Profile** | sRGB | Standard web sRGB color gamut |
| **Background** | Clean white (`#FFFFFF`), neutral gray (`#F8F9FA`), or clean studio contextual setting | Seamless white studio backdrop for main card; lifestyle for gallery |
| **Gallery Depth** | 1 to 8 images per product | Front, Back, Close-up/Texture, Dimensions/Packaging |

---

## ⚖️ 5. Legal Warranties, Copyright & DMCA Takedown

1. **Supplier Warranty:**
   By uploading or supplying any media asset to MShoppy, the seller/merchant expressly warrants that:
   - They hold the copyright, or have secured explicit written commercial licensing, for all submitted photos, logos, and graphics.
   - The media does not infringe upon any third party's copyright, trademark, privacy, or intellectual property rights.

2. **Indemnification:**
   The seller agrees to indemnify and hold harmless MShoppy, its parent entities, directors, and technical operators against any third-party claims, liabilities, damages, or legal costs arising from copyright infringement related to uploaded catalog media.

3. **Notice and Takedown Procedure:**
   - Any copyright owner may submit an infringement notice to `legal@mshoppy.in` or via the Admin Telephony & Support Portal.
   - Upon receipt of a valid notice (under the Indian Copyright Act, 1957 or DMCA equivalent), the platform will disable or remove the disputed media within 24 hours pending review.
   - Repeat infringers face permanent catalog suspension, wallet commission withholding, and supplier account termination.

---

## 🛠️ 6. Engineering Integration Checklist

- [x] Database records (`products.images`, `categories.image_url`, `banners.image_url`) use self-hosted `supabase.hrgroupco.in` URLs.
- [x] Zero direct third-party `unsplash.com` links remaining in the active product or category catalog.
- [x] Mismatched book and product covers replaced with genuine high-resolution matching covers.
- [x] Category visual cards in `Original Brands` and Home Explorer bound to validated self-hosted images.
- [x] Upload on Save dropzone pattern standard in `SellerAddProduct1.jsx` enforcing self-hosted Supabase uploads.
