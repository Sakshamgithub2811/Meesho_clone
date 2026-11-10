import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function verify() {
  console.log('==================================================');
  console.log('       MEESHO CATALOG VERIFICATION REPORT         ');
  console.log('==================================================\n');

  // 1. Total counts
  const totalProducts = await prisma.product.count();
  const totalReviews = await prisma.review.count();
  console.log(`✅ Total Products in DB: ${totalProducts}`);
  console.log(`✅ Total Verified Reviews in DB: ${totalReviews}\n`);

  // 2. Image uniqueness check
  const prods = await prisma.product.findMany({
    select: { id: true, title: true, images: true, categorySlug: true, subCategory: true, rating: true, reviewsCount: true }
  });
  const allImages = prods.map(p => p.images?.[0]).filter(Boolean);
  const uniqueImages = new Set(allImages);

  console.log(`✅ Total Main Images: ${allImages.length}`);
  console.log(`✅ Unique Images Count: ${uniqueImages.size}`);
  if (allImages.length === uniqueImages.size) {
    console.log('🎉 100% UNIQUE IMAGES: ZERO DUPLICATES FOUND!\n');
  } else {
    console.warn(`⚠️ Warning: ${allImages.length - uniqueImages.size} duplicate images found!`);
  }

  // 3. Category Breakdown
  const catCounts = {};
  for (const p of prods) {
    catCounts[p.categorySlug] = (catCounts[p.categorySlug] || 0) + 1;
  }
  console.log('📦 Category Distribution:');
  for (const [slug, count] of Object.entries(catCounts)) {
    console.log(`   - ${slug.padEnd(25)}: ${count} products`);
  }
  console.log('');

  // 4. Check Top 18 products on Home page (interleaving check)
  const top18 = await prisma.product.findMany({
    take: 18,
    orderBy: { createdAt: 'desc' },
    select: { title: true, categorySlug: true, subCategory: true, rating: true, reviewsCount: true, images: true }
  });

  console.log('🏠 Top 18 Products Displayed on Home Page ("All Categories"):');
  top18.forEach((p, i) => {
    console.log(`   ${(i + 1).toString().padStart(2, ' ')}. [${p.categorySlug}] (${p.subCategory}) "${p.title.slice(0, 45)}" ★ ${p.rating} (${p.reviewsCount} reviews)`);
    console.log(`       Img: ${p.images[0].slice(0, 65)}...`);
  });
  console.log('');

  // 5. Review Integrity Check on Top 3 Products
  console.log('⭐ Review & Rating Integrity Verification:');
  for (let i = 0; i < 3; i++) {
    const sample = top18[i];
    const dbProduct = await prisma.product.findFirst({ where: { title: sample.title } });
    const reviews = await prisma.review.findMany({
      where: { productId: dbProduct.id },
      include: { user: true }
    });

    const calculatedAvg = parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1));
    console.log(`   Product: "${sample.title.slice(0, 40)}"`);
    console.log(`   - Product Table: ★ ${sample.rating} (${sample.reviewsCount} reviews)`);
    console.log(`   - Reviews Table: ★ ${calculatedAvg} (${reviews.length} reviews)`);
    const match = (sample.reviewsCount === reviews.length && Math.abs(sample.rating - calculatedAvg) < 0.05);
    console.log(`   - Consistency Status: ${match ? 'MATCHED 100% ✅' : 'MISMATCH ❌'}`);
    reviews.forEach(r => {
      console.log(`       * ${r.user.fullName} (★ ${r.rating}): "${r.title}" - ${r.comment.slice(0, 50)}...`);
    });
    console.log('');
  }

  process.exit(0);
}

verify().catch(console.error);

