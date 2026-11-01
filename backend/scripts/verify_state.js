import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function verify() {
  const topProducts = await prisma.product.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: {
      title: true,
      categorySlug: true,
      subCategory: true,
      rating: true,
      reviewsCount: true
    }
  });

  console.log('--- TOP 12 PRODUCTS (for ALL Categories) ---');
  topProducts.forEach((p, i) => {
    console.log(`${i + 1}. [${p.categorySlug} -> ${p.subCategory}] ${p.title} (★ ${p.rating}, ${p.reviewsCount} reviews)`);
  });

  // Verify Reviews on a sample product
  const sample = topProducts[0];
  const reviews = await prisma.review.findMany({
    where: { productId: (await prisma.product.findFirst({ where: { title: sample.title } })).id },
    include: { user: true }
  });

  console.log(`\n--- REVIEWS FOR TOP PRODUCT (${reviews.length} reviews) ---`);
  reviews.forEach(r => {
    console.log(`- ${r.user.fullName} (★ ${r.rating}): "${r.title}" - ${r.comment}`);
  });

  process.exit(0);
}

verify().catch(console.error);

