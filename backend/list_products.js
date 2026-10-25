import prisma from './src/config/prisma.js';

async function listAll() {
  const prods = await prisma.product.findMany({
    select: { id: true, title: true, categorySlug: true, images: true }
  });
  console.log(`TOTAL PRODUCTS: ${prods.length}`);
  prods.forEach((p, idx) => {
    console.log(`\n--- ${idx + 1}. [${p.id}] ---`);
    console.log(`Title: ${p.title}`);
    console.log(`Category: ${p.categorySlug}`);
    console.log(`Images (${p.images.length}):`);
    p.images.forEach((img, i) => console.log(`   [${i + 1}] ${img}`));
  });
  await prisma.$disconnect();
}

listAll();
