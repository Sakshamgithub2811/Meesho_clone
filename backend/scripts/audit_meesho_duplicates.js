import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function auditMeeshoDuplicates() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, images: true, categorySlug: true, subCategory: true }
  });
  console.log(`Total products in DB: ${products.length}`);

  const meeshoIds = {};
  for (const p of products) {
    const img = p.images?.[0] || '';
    // Extract Meesho product folder id like 72972721 or 72509771
    const match = img.match(/images\/products\/(\d+)\//);
    if (match) {
      const pid = match[1];
      if (!meeshoIds[pid]) meeshoIds[pid] = [];
      meeshoIds[pid].push({ id: p.id, title: p.title, cat: p.categorySlug, sub: p.subCategory, img });
    }
  }

  const multi = Object.entries(meeshoIds).filter(([k, v]) => v.length > 1);
  console.log(`Meesho product folders with multiple products in DB: ${multi.length}`);
  multi.sort((a, b) => b[1].length - a[1].length);

  let totalDuplicateEntries = 0;
  for (const [pid, list] of multi) {
    totalDuplicateEntries += (list.length - 1);
    console.log(`\nMeesho Product ID [${pid}] has ${list.length} duplicate products:`);
    list.forEach(l => console.log(`  - [${l.cat} / ${l.sub}] "${l.title}" -> ${l.img}`));
  }
  console.log(`\nTotal redundant duplicate items across DB: ${totalDuplicateEntries}`);
  process.exit(0);
}

auditMeeshoDuplicates().catch(console.error);

