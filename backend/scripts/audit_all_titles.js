import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function auditAllTitles() {
  const prods = await prisma.product.findMany({
    select: { id: true, title: true, categorySlug: true, subCategory: true, images: true }
  });

  console.log(`Auditing ${prods.length} products...`);
  const beauty = prods.filter(p => p.categorySlug === 'beauty-health');
  console.log('\n--- Beauty & Health Products (Total: ' + beauty.length + ') ---');
  beauty.forEach((p, i) => {
    console.log(`${i + 1}. [${p.subCategory}] "${p.title}"`);
  });

  const electronics = prods.filter(p => p.categorySlug === 'electronics');
  console.log('\n--- Electronics Products (Total: ' + electronics.length + ') ---');
  electronics.slice(0, 30).forEach((p, i) => {
    console.log(`${i + 1}. [${p.subCategory}] "${p.title}"`);
  });

  const footwear = prods.filter(p => p.categorySlug === 'footwear');
  console.log('\n--- Footwear Products (Total: ' + footwear.length + ') ---');
  footwear.forEach((p, i) => {
    console.log(`${i + 1}. [${p.subCategory}] "${p.title}"`);
  });

  const kids = prods.filter(p => p.categorySlug === 'kids');
  console.log('\n--- Kids Products (Total: ' + kids.length + ') ---');
  kids.forEach((p, i) => {
    console.log(`${i + 1}. [${p.subCategory}] "${p.title}"`);
  });

  const home = prods.filter(p => p.categorySlug === 'home-kitchen');
  console.log('\n--- Home & Kitchen Products (Total: ' + home.length + ') ---');
  home.forEach((p, i) => {
    console.log(`${i + 1}. [${p.subCategory}] "${p.title}"`);
  });

  process.exit(0);
}

auditAllTitles().catch(console.error);

