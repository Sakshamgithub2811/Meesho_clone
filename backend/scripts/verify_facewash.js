import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function verifyAllFaceWash() {
  const fw = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Face Wash' },
    select: { title: true, images: true }
  });
  console.log(`\n=== ALL ${fw.length} PRODUCTS IN "Face Wash" ===`);
  fw.forEach((item, i) => {
    console.log(`${i + 1}. "${item.title}" -> ${item.images[0]}`);
  });

  const ss = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Sunscreen' },
    select: { title: true, images: true }
  });
  console.log(`\n=== ALL ${ss.length} PRODUCTS IN "Sunscreen" ===`);
  ss.forEach((item, i) => {
    console.log(`${i + 1}. "${item.title}" -> ${item.images[0]}`);
  });

  const sr = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Serum' },
    select: { title: true, images: true }
  });
  console.log(`\n=== ALL ${sr.length} PRODUCTS IN "Serum" ===`);
  sr.forEach((item, i) => {
    console.log(`${i + 1}. "${item.title}" -> ${item.images[0]}`);
  });

  process.exit(0);
}

verifyAllFaceWash().catch(console.error);

