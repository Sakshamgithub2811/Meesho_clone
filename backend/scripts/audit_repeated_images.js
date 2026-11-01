import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function auditRepeatedImages() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, images: true, categorySlug: true, subCategory: true }
  });
  console.log(`Total products in DB: ${products.length}`);

  const imgCounts = {};
  for (const p of products) {
    const img = p.images?.[0];
    if (img) {
      if (!imgCounts[img]) imgCounts[img] = [];
      imgCounts[img].push({ id: p.id, title: p.title, cat: p.categorySlug, sub: p.subCategory });
    }
  }

  const duplicates = Object.entries(imgCounts).filter(([img, items]) => items.length > 1);
  console.log(`Unique images count: ${Object.keys(imgCounts).length}`);
  console.log(`Duplicate image URLs count: ${duplicates.length}`);

  let totalDuplicateProducts = 0;
  duplicates.sort((a, b) => b[1].length - a[1].length);

  for (const [img, items] of duplicates) {
    totalDuplicateProducts += items.length;
    console.log(`\n❌ Image used by ${items.length} products: ${img}`);
    items.forEach(it => console.log(`   - [${it.cat} / ${it.sub}] "${it.title}" (ID: ${it.id})`));
  }
  console.log(`\nTotal products sharing duplicated images: ${totalDuplicateProducts}`);
  process.exit(0);
}

auditRepeatedImages().catch(console.error);

