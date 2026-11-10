import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function inspectFootwear() {
  const fw = await prisma.product.findMany({
    where: { categorySlug: 'footwear' },
    select: { id: true, title: true, subCategory: true, images: true }
  });

  console.log(`\n=== TOTAL FOOTWEAR IN DB: ${fw.length} ===`);
  fw.forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.subCategory}] "${item.title}" -> ${item.images[0]}`);
  });

  process.exit(0);
}

inspectFootwear().catch(console.error);

