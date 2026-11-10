import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function main() {
  const prods = await prisma.product.findMany({ select: { id: true, title: true, images: true, categorySlug: true, subCategory: true } });
  console.log('Total products in DB:', prods.length);
  const images = prods.map(p => p.images && p.images[0]).filter(Boolean);
  const uniqueImages = new Set(images);
  console.log('Total images:', images.length, 'Unique images:', uniqueImages.size);
  
  // Show image frequencies
  const imgCounts = {};
  images.forEach(img => {
    imgCounts[img] = (imgCounts[img] || 0) + 1;
  });
  const sorted = Object.entries(imgCounts).sort((a,b) => b[1] - a[1]);
  console.log('Most repeated images:');
  sorted.slice(0, 10).forEach(([img, count]) => {
    console.log(`Count ${count}: ${img}`);
  });

  process.exit(0);
}

main().catch(console.error);

