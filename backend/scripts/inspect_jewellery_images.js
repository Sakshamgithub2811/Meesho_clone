import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function inspectJewellery() {
  const jew = await prisma.product.findMany({
    where: { categorySlug: 'jewellery' },
    select: { id: true, title: true, images: true, subCategory: true }
  });
  console.log(`Total jewellery products: ${jew.length}`);
  jew.forEach((j, idx) => {
    console.log(`${idx + 1}. [${j.subCategory}] "${j.title}" -> ${j.images[0]}`);
  });
  process.exit(0);
}

inspectJewellery().catch(console.error);

