import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function inspectCategories() {
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    const prods = await prisma.product.findMany({
      where: { categorySlug: c.slug },
      select: { title: true, subCategory: true, images: true }
    });
    console.log(`\n================== ${c.name} (${c.slug}): ${prods.length} products ==================`);
    const subCounts = {};
    for (const p of prods) {
      subCounts[p.subCategory] = (subCounts[p.subCategory] || 0) + 1;
    }
    console.log('Subcategories:', subCounts);
    console.log('Sample 10 items:');
    prods.slice(0, 10).forEach(p => {
      console.log(`- [${p.subCategory}] "${p.title}" -> ${p.images[0]?.slice(0, 60)}...`);
    });
  }
  process.exit(0);
}

inspectCategories().catch(console.error);

