import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function countAfterDeduplication() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, images: true, categorySlug: true, subCategory: true }
  });

  const seenProductRoots = new Set();
  const kept = [];
  const duplicates = [];

  for (const p of products) {
    const img = p.images?.[0] || '';
    // If it's a meesho URL, root is the meesho product id folder
    const match = img.match(/images\/products\/(\d+)\//);
    const root = match ? `meesho-${match[1]}` : img;

    if (seenProductRoots.has(root)) {
      duplicates.push(p);
    } else {
      seenProductRoots.add(root);
      kept.push(p);
    }
  }

  console.log(`Total products in DB: ${products.length}`);
  console.log(`Kept (Unique physical products): ${kept.length}`);
  console.log(`Duplicates to remove: ${duplicates.length}`);

  const byCat = {};
  for (const k of kept) {
    if (!byCat[k.categorySlug]) byCat[k.categorySlug] = {};
    byCat[k.categorySlug][k.subCategory || 'EMPTY'] = (byCat[k.categorySlug][k.subCategory || 'EMPTY'] || 0) + 1;
  }
  console.log('\nKept products by category & subcategory:');
  console.log(JSON.stringify(byCat, null, 2));

  process.exit(0);
}

countAfterDeduplication().catch(console.error);

