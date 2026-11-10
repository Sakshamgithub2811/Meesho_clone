import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function inspect() {
  // 1. Inspect supplier names
  const products = await prisma.product.findMany({
    select: { id: true, title: true, supplierName: true, categorySlug: true, subCategory: true, images: true }
  });

  const supplierCounts = {};
  for (const p of products) {
    supplierCounts[p.supplierName || 'null'] = (supplierCounts[p.supplierName || 'null'] || 0) + 1;
  }
  console.log('Supplier names count in DB:', supplierCounts);

  // 2. Inspect Footwear products
  const footwear = products.filter(p => p.categorySlug === 'footwear');
  console.log(`\n=== FOOTWEAR PRODUCTS (${footwear.length}) ===`);
  footwear.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.subCategory}] "${f.title}" (supplier: ${f.supplierName}) -> ${f.images[0]}`);
  });

  process.exit(0);
}

inspect().catch(console.error);

