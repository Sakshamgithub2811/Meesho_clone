import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function finalCatalogAudit() {
  const allProds = await prisma.product.findMany({
    include: {
      category: { select: { name: true, slug: true } }
    }
  });

  console.log(`\n======================================================`);
  console.log(`📊 FINAL CATALOG AUDIT SUMMARY`);
  console.log(`======================================================`);
  console.log(`Total Products in Database: ${allProds.length}`);

  // 1. Image uniqueness
  const imgSet = new Set();
  const duplicateImages = [];
  for (const p of allProds) {
    const img = p.images?.[0];
    if (imgSet.has(img)) duplicateImages.push({ id: p.id, title: p.title, img });
    else imgSet.add(img);
  }
  console.log(`Unique Primary Product Images: ${imgSet.size}`);
  console.log(`Duplicate Images: ${duplicateImages.length}`);

  // 2. Physical item root uniqueness
  const rootSet = new Set();
  const duplicateRoots = [];
  for (const p of allProds) {
    const img = p.images?.[0] || '';
    const mMatch = img.match(/images\/products\/(\d+)\//);
    const root = mMatch ? `meesho-${mMatch[1]}` : (img.match(/assets\/images\/(\d+)\//) ? `myntra-${img.match(/assets\/images\/(\d+)\//)[1]}` : img);
    if (rootSet.has(root)) duplicateRoots.push({ id: p.id, title: p.title, root });
    else rootSet.add(root);
  }
  console.log(`Unique Physical Products (No Angle Multiples): ${rootSet.size}`);
  console.log(`Duplicate Physical Products: ${duplicateRoots.length}`);

  // 3. Category & Subcategory breakdown
  const catTree = {};
  for (const p of allProds) {
    const cSlug = p.categorySlug;
    if (!catTree[cSlug]) catTree[cSlug] = {};
    const s = p.subCategory || 'Other';
    catTree[cSlug][s] = (catTree[cSlug][s] || 0) + 1;
  }
  console.log(`\nBreakdown by Category & Subcategories:`);
  for (const [cat, subMap] of Object.entries(catTree)) {
    const totalInCat = Object.values(subMap).reduce((a, b) => a + b, 0);
    console.log(`\n📁 ${cat} (${totalInCat} products):`);
    for (const [sub, count] of Object.entries(subMap)) {
      console.log(`   - ${sub}: ${count}`);
    }
  }

  // 4. Sample Jewellery items to confirm 72972721 is non-repeating
  const jew = allProds.filter(p => p.categorySlug === 'jewellery');
  console.log(`\nSample Jewellery First 6:`);
  jew.slice(0, 6).forEach((j, i) => console.log(`   ${i + 1}. [${j.subCategory}] "${j.title}" -> ${j.images[0]}`));

  process.exit(0);
}

finalCatalogAudit().catch(console.error);

