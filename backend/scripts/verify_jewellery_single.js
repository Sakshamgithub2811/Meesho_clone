import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function verifyJewellerySingle() {
  const allProds = await prisma.product.findMany({
    select: { id: true, title: true, images: true, categorySlug: true, subCategory: true }
  });

  const matching721 = allProds.filter(p => (p.images || []).some(img => img.includes('72972721')));
  console.log(`\n=== 72972721 IN DB ===`);
  console.log(`Number of products with 72972721 in DB: ${matching721.length}`);
  for (const m of matching721) {
    console.log(`Product: "${m.title}" (Subcategory: ${m.subCategory})`);
    console.log(`Total images consolidated in this single product gallery: ${m.images.length}`);
    m.images.forEach((img, idx) => console.log(`   Photo ${idx + 1}: ${img}`));
  }

  // Check all Jewellery products
  const jew = allProds.filter(p => p.categorySlug === 'jewellery');
  console.log(`\n=== ALL JEWELLERY PRODUCTS (${jew.length}) ===`);
  const first10 = jew.slice(0, 10);
  first10.forEach((j, idx) => console.log(`${idx + 1}. [${j.subCategory}] "${j.title}" -> ${j.images[0]}`));

  process.exit(0);
}

verifyJewellerySingle().catch(console.error);

