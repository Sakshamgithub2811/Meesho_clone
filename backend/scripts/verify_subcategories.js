import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function verifySubcategories() {
  console.log('==================================================');
  console.log('       SUBCATEGORY ACCURACY AUDIT REPORT          ');
  console.log('==================================================\n');

  // 1. Audit Beauty & Health subcategories
  const beautyLipsticks = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Lipstick' },
    select: { title: true, images: true }
  });
  console.log(`💄 BEAUTY & HEALTH -> "Lipstick" (${beautyLipsticks.length} items):`);
  beautyLipsticks.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  const beautyPerfumes = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Perfume' },
    select: { title: true, images: true }
  });
  console.log(`\n🌸 BEAUTY & HEALTH -> "Perfume" (${beautyPerfumes.length} items):`);
  beautyPerfumes.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  const beautySerums = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Serum' },
    select: { title: true, images: true }
  });
  console.log(`\n✨ BEAUTY & HEALTH -> "Serum" (${beautySerums.length} items):`);
  beautySerums.forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  const beautyFaceWash = await prisma.product.findMany({
    where: { categorySlug: 'beauty-health', subCategory: 'Face Wash' },
    select: { title: true, images: true }
  });
  console.log(`\n🧼 BEAUTY & HEALTH -> "Face Wash" (${beautyFaceWash.length} items):`);
  beautyFaceWash.forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  // 2. Audit Footwear subcategories
  const footSneakers = await prisma.product.findMany({
    where: { categorySlug: 'footwear', subCategory: 'Sneakers' },
    select: { title: true, images: true }
  });
  console.log(`\n👟 FOOTWEAR -> "Sneakers" (${footSneakers.length} items):`);
  footSneakers.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  const footFlats = await prisma.product.findMany({
    where: { categorySlug: 'footwear', subCategory: 'Flats' },
    select: { title: true, images: true }
  });
  console.log(`\n👡 FOOTWEAR -> "Flats" (${footFlats.length} items):`);
  footFlats.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  // 3. Audit Electronics subcategories
  const electCovers = await prisma.product.findMany({
    where: { categorySlug: 'electronics', subCategory: 'Phone Covers' },
    select: { title: true, images: true }
  });
  console.log(`\n📱 ELECTRONICS -> "Phone Covers" (${electCovers.length} items):`);
  electCovers.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. "${p.title}" -> ${p.images[0].slice(0, 60)}...`);
  });

  process.exit(0);
}

verifySubcategories().catch(console.error);

