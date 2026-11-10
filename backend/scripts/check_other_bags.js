import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function checkOtherBags() {
  const prods = await prisma.product.findMany({
    select: { id: true, title: true, categorySlug: true, subCategory: true, images: true }
  });

  const bagKeywords = ['backpack', 'handbag', 'bag pack', 'sling bag', 'tote bag', 'wallet', 'purse', 'lightwbag'];
  const matched = [];
  for (const p of prods) {
    const t = p.title.toLowerCase();
    for (const kw of bagKeywords) {
      if (t.includes(kw)) {
        matched.push(p);
        break;
      }
    }
  }

  console.log(`Found ${matched.length} bag items across the whole DB:`);
  matched.forEach(m => console.log(`  - [${m.categorySlug} / ${m.subCategory}] "${m.title}" (ID: ${m.id})`));
  process.exit(0);
}

checkOtherBags().catch(console.error);

