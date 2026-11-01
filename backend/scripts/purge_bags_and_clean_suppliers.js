import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function purgeBagsAndCleanSuppliers() {
  console.log('=== 1. PURGING BAGS / BACKPACKS / SOCKS FROM FOOTWEAR ===');
  const footwear = await prisma.product.findMany({
    where: { categorySlug: 'footwear' }
  });

  const badFootwearIds = [];
  const badKeywords = [
    'bag', 'backpack', 'handbag', 'pack', 'leathe', 'elettivo', 
    'socks', 'bello', 'purse', 'wallet', 'sling', 'premium hand', 'fashiginal'
  ];

  for (const f of footwear) {
    const t = f.title.toLowerCase();
    const isBad = badKeywords.some(kw => t.includes(kw));
    if (isBad) {
      badFootwearIds.push(f.id);
      console.log(`❌ Non-footwear item detected: "${f.title}" (ID: ${f.id})`);
    }
  }

  console.log(`Deleting ${badFootwearIds.length} non-footwear items from database...`);
  if (badFootwearIds.length > 0) {
    await prisma.review.deleteMany({ where: { productId: { in: badFootwearIds } } });
    await prisma.cartItem.deleteMany({ where: { productId: { in: badFootwearIds } } });
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: badFootwearIds } } });
    await prisma.orderItem.deleteMany({ where: { productId: { in: badFootwearIds } } });
    await prisma.product.deleteMany({ where: { id: { in: badFootwearIds } } });
  }

  // Also fix "Ladies Juti" title to "Traditional Embroidered Ladies Jutti" & subCategory to "Jutti"
  const jutiProd = await prisma.product.findFirst({
    where: { categorySlug: 'footwear', title: { contains: 'Ladies Juti', mode: 'insensitive' } }
  });
  if (jutiProd) {
    await prisma.product.update({
      where: { id: jutiProd.id },
      data: {
        title: 'Traditional Embroidered Ladies Jutti',
        subCategory: 'Jutti'
      }
    });
    console.log('Updated Ladies Juti to Jutti subcategory.');
  }

  console.log('\n=== 2. REMOVING "MEESHO SUPPLIER" STRINGS FROM DATABASE ===');
  // Update all supplier names that mention "meesho" to 'Official Store'
  const updatedSuppliers = await prisma.$executeRawUnsafe(`
    UPDATE products 
    SET supplier_name = 'Official Store' 
    WHERE supplier_name ILIKE '%meesho%';
  `);
  console.log(`Updated ${updatedSuppliers} products: replaced "Meesho Supplier" with "Official Store".`);

  console.log('\n=== 3. VERIFY FOOTWEAR ITEMS REMAINING ===');
  const cleanFootwear = await prisma.product.findMany({
    where: { categorySlug: 'footwear' },
    select: { id: true, title: true, subCategory: true, images: true, supplierName: true }
  });

  console.log(`Remaining pure footwear products: ${cleanFootwear.length}`);
  cleanFootwear.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.subCategory}] "${f.title}"`);
  });

  process.exit(0);
}

purgeBagsAndCleanSuppliers().catch(console.error);
