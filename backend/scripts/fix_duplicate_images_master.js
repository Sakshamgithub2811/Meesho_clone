import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

// Helper to extract a unique physical product root
function getProductRoot(imgUrl) {
  if (!imgUrl) return null;
  // Meesho product folder: e.g. /images/products/72972721/t1rye_512.jpg -> meesho-72972721
  const mMatch = imgUrl.match(/images\/products\/(\d+)\//);
  if (mMatch) return `meesho-${mMatch[1]}`;
  // Myntra assets: e.g. /assets/images/20886920/... -> myntra-20886920
  const myMatch = imgUrl.match(/assets\/images\/(\d+)\//);
  if (myMatch) return `myntra-${myMatch[1]}`;
  // Fallback to URL without query params
  return imgUrl.split('?')[0];
}

async function fixDuplicateImagesMaster() {
  console.log('=== STEP 1: AUDIT & DEDUPLICATE EXISTING DB PRODUCTS ===');
  const allCurrent = await prisma.product.findMany();
  console.log(`Current DB product count: ${allCurrent.length}`);

  // Group by product root
  const rootGroups = new Map();
  for (const p of allCurrent) {
    const primaryImg = p.images?.[0];
    const root = getProductRoot(primaryImg);
    if (!root) continue;
    if (!rootGroups.has(root)) {
      rootGroups.set(root, []);
    }
    rootGroups.get(root).push(p);
  }

  console.log(`Unique physical product roots found in DB: ${rootGroups.size}`);

  const toDeleteIds = [];
  const toUpdateProducts = [];

  for (const [root, items] of rootGroups.entries()) {
    if (items.length === 1) {
      // Clean up title if it has trailing (Maroon) or - Style Edition
      const item = items[0];
      const cleanTitle = item.title
        .replace(/\s*\((Maroon|Navy|Emerald|Gold|Sky Blue|Design)\)/gi, '')
        .replace(/\s*-\s*Style Edition \d+/gi, '')
        .replace(/\s*-\s*Classic View \d+/gi, '')
        .trim();
      if (cleanTitle !== item.title) {
        toUpdateProducts.push({ id: item.id, title: cleanTitle, images: item.images });
      }
    } else {
      // Multiple records for the same physical product!
      // Keep the first item as the master product
      const master = items[0];
      // Collect all unique images from all sibling records into the master's gallery!
      const mergedImages = [];
      const seenImgs = new Set();
      for (const it of items) {
        for (const img of (it.images || [])) {
          if (img && !seenImgs.has(img)) {
            seenImgs.add(img);
            mergedImages.push(img);
          }
        }
      }

      const cleanTitle = master.title
        .replace(/\s*\((Maroon|Navy|Emerald|Gold|Sky Blue|Design)\)/gi, '')
        .replace(/\s*-\s*Style Edition \d+/gi, '')
        .replace(/\s*-\s*Classic View \d+/gi, '')
        .trim();

      toUpdateProducts.push({
        id: master.id,
        title: cleanTitle,
        images: mergedImages.slice(0, 5)
      });

      // Mark the rest for deletion!
      for (let i = 1; i < items.length; i++) {
        toDeleteIds.push(items[i].id);
      }
    }
  }

  console.log(`Updating ${toUpdateProducts.length} master products with cleaned titles & full photo galleries...`);
  for (const u of toUpdateProducts) {
    await prisma.product.update({
      where: { id: u.id },
      data: { title: u.title, images: u.images }
    });
  }

  console.log(`Deleting ${toDeleteIds.length} redundant angle-duplicate products...`);
  if (toDeleteIds.length > 0) {
    // Delete in chunks of 50
    for (let i = 0; i < toDeleteIds.length; i += 50) {
      const chunk = toDeleteIds.slice(i, i + 50);
      // Also delete any reviews associated with these duplicates
      await prisma.review.deleteMany({ where: { productId: { in: chunk } } });
      await prisma.cartItem.deleteMany({ where: { productId: { in: chunk } } });
      await prisma.product.deleteMany({ where: { id: { in: chunk } } });
    }
  }

  const remainingCount = await prisma.product.count();
  console.log(`After deduplication, unique products in DB: ${remainingCount}`);

  // Collect all existing roots in a Set so we NEVER duplicate
  const existingRoots = new Set();
  const existingTitles = new Set();
  const remainingProds = await prisma.product.findMany({ select: { title: true, images: true } });
  for (const p of remainingProds) {
    const root = getProductRoot(p.images?.[0]);
    if (root) existingRoots.add(root);
    existingTitles.add(p.title.toLowerCase().trim());
  }

  console.log(`\n=== STEP 2: HARVESTING NEW UNIQUE PRODUCTS TO REACH 1,000+ ===`);
  const needed = 1000 - remainingCount;
  console.log(`Products needed to reach 1000: ${needed}`);

  const candidatesToAdd = [];

  function tryAddCandidate(item) {
    const img = (item.images && item.images[0]) || item.image;
    if (!img || !img.startsWith('http')) return false;
    const root = getProductRoot(img);
    if (!root || existingRoots.has(root)) return false;

    const tLower = (item.title || '').toLowerCase().trim();
    if (!tLower || existingTitles.has(tLower)) return false;

    existingRoots.add(root);
    existingTitles.add(tLower);
    candidatesToAdd.push({
      title: item.title.trim(),
      description: item.description || `Premium quality ${item.title}. Verified supplier guarantee.`,
      categorySlug: item.categorySlug,
      subCategory: item.subCategory || 'Other',
      price: parseFloat(item.price) || 399,
      originalPrice: parseFloat(item.originalPrice) || Math.round((parseFloat(item.price) || 399) * 1.4),
      discountPercentage: Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) || 28,
      rating: parseFloat(item.rating) || +(3.8 + Math.random() * 1.1).toFixed(1),
      reviewsCount: parseInt(item.reviewsCount) || Math.floor(Math.random() * 60) + 12,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [img],
      sizes: ['S', 'M', 'L', 'XL', 'Free Size'],
      supplierName: item.supplierName || 'Verified Meesho Supplier',
      stock: 50 + Math.floor(Math.random() * 100),
      isFreeDelivery: true
    });
    return true;
  }

  // A. Myntra Beauty (Lipsticks, Face Wash, Sunscreen, Serums, Perfumes, Body Lotions, Kajal)
  console.log('Fetching Myntra catalog...');
  const mRes = await fetch('https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json');
  const myntra = await mRes.json();

  let beautyCount = 0;
  for (const b of (myntra.beautyproduct || [])) {
    const title = b.product || b.title;
    const img = b.image;
    const href = b.imagehref || '';
    if (!title || !img || !img.startsWith('http')) continue;
    const t = (title + ' ' + href).toLowerCase();

    let sub = null;
    if (t.includes('face-wash') || t.includes('face wash')) sub = 'Face Wash';
    else if (t.includes('lipstick') && !t.includes('remover')) sub = 'Lipstick';
    else if (t.includes('serum') && !t.includes('hair')) sub = 'Serum';
    else if (t.includes('sunscreen') || t.includes('sun block') || t.includes('spf')) sub = 'Sunscreen';
    else if (t.includes('perfume') || t.includes('eau de') || t.includes('deodorant')) sub = 'Perfume';
    else if (t.includes('body-lotion') || t.includes('body lotion')) sub = 'Body Lotion';
    else if (t.includes('kajal') || t.includes('eyeliner')) sub = 'Kajal';

    if (sub) {
      const p = parseFloat(b.discountedPrice) || 299;
      const op = parseFloat(b.strike) || Math.round(p * 1.4);
      if (tryAddCandidate({
        title: `${b.brand ? b.brand + ' ' : ''}${title}`,
        categorySlug: 'beauty-health',
        subCategory: sub,
        price: p,
        originalPrice: op,
        image: img,
        images: [img],
        supplierName: b.brand ? `${b.brand} Official Store` : 'Verified Beauty Hub'
      })) {
        beautyCount++;
      }
    }
  }
  console.log(`Added ${beautyCount} unique authentic Beauty products from Myntra.`);

  // B. Myntra Men (T-Shirts, Shirts, Track Pants)
  let menCount = 0;
  for (const m of (myntra.mens || [])) {
    const handle = m.handle || '';
    const brand = m.title || 'Brand';
    const img = m.images?.[0];
    if (!img || !img.startsWith('http') || !handle) continue;
    const t = (handle + ' ' + (m.type || '')).toLowerCase();

    let sub = 'Shirt';
    if (t.includes('t-shirt') || t.includes('tee')) sub = 'T-Shirt';
    else if (t.includes('jogger') || t.includes('track')) sub = 'Track Pants';

    const p = parseFloat(m.price_min) || 499;
    const op = parseFloat(m.price) || Math.round(p * 1.5);
    const cleanT = `${brand} ${handle.replace(/-/g, ' ')}`.replace(/\s+/g, ' ').trim();

    if (tryAddCandidate({
      title: cleanT,
      categorySlug: 'men',
      subCategory: sub,
      price: p,
      originalPrice: op,
      image: img,
      images: (m.images || []).filter(u => u && u.startsWith('http')).slice(0, 4),
      supplierName: `${brand} Direct`
    })) {
      menCount++;
    }
  }
  console.log(`Added ${menCount} unique Men apparel products from Myntra.`);

  // C. Myntra Kids (Toys, Boys Set, Infant Romper)
  let kidsCount = 0;
  for (const k of (myntra.kids || [])) {
    const handle = k.handle || '';
    const brand = k.title || 'Brand';
    const img = k.images?.[0];
    if (!img || !img.startsWith('http') || !handle) continue;
    const t = (handle + ' ' + (k.type || '')).toLowerCase();

    let sub = 'Toys';
    if (t.includes('romper') || t.includes('infant')) sub = 'Infant Romper';
    else if (t.includes('set') || t.includes('suit') || t.includes('hoodie')) sub = 'Boys Set';

    const p = parseFloat(k.price_min) || 399;
    const op = parseFloat(k.price) || Math.round(p * 1.5);
    const cleanT = `${brand} ${handle.replace(/-/g, ' ')}`.replace(/\s+/g, ' ').trim();

    if (tryAddCandidate({
      title: cleanT,
      categorySlug: 'kids',
      subCategory: sub,
      price: p,
      originalPrice: op,
      image: img,
      images: (k.images || []).filter(u => u && u.startsWith('http')).slice(0, 4),
      supplierName: `${brand} Kids Wear`
    })) {
      kidsCount++;
    }
  }
  console.log(`Added ${kidsCount} unique Kids products from Myntra.`);

  // D. Rshukla Meesho items (Sarees, Jewellery, Dresses, Bags/Footwear, Home)
  let rCount = 0;
  try {
    const rRes = await fetch('https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json');
    const rText = await rRes.text();
    const blocks = rText.split(/\{\s*"id"\s*:/);
    for (let i = 1; i < blocks.length; i++) {
      const b = blocks[i];
      const titleMatch = b.match(/"title"\s*:\s*"([^"]+)"/);
      const catMatch = b.match(/"category"\s*:\s*"([^"]+)"/);
      const imgMatch = b.match(/"(https:\/\/images\.meesho\.com\/[^"]+)"/);
      const pMatch = b.match(/"discounted_price"\s*:\s*([0-9.]+)/) || b.match(/"original_price"\s*:\s*([0-9.]+)/);
      if (titleMatch && imgMatch) {
        const title = titleMatch[1];
        const rawCat = catMatch ? catMatch[1] : '';
        let catSlug = 'women-ethnic';
        let subCat = 'Saree';
        if (rawCat.includes('Jewellery')) {
          catSlug = 'jewellery';
          subCat = title.toLowerCase().includes('earring') ? 'Earrings' : title.toLowerCase().includes('choker') ? 'Choker' : 'Necklace';
        } else if (rawCat.includes('Dresses')) {
          catSlug = 'women-western';
          subCat = 'Dress';
        } else if (rawCat.includes('Mens')) {
          catSlug = 'men';
          subCat = 'Shirt';
        } else if (rawCat.includes('Footwear') || rawCat.includes('Bags')) {
          catSlug = 'footwear';
          subCat = 'Flats';
        } else if (rawCat.includes('Home')) {
          catSlug = 'home-kitchen';
          subCat = 'Bedsheet';
        }

        const p = pMatch ? parseFloat(pMatch[1]) : 399;
        if (tryAddCandidate({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price: p,
          originalPrice: Math.round(p * 1.4),
          image: imgMatch[1],
          images: [imgMatch[1]],
          supplierName: 'Authentic Meesho Supplier'
        })) {
          rCount++;
        }
      }
    }
  } catch(e) {}
  console.log(`Added ${rCount} unique products from Rshukla.`);

  console.log(`\nTotal candidate products prepared to add: ${candidatesToAdd.length}`);

  // Insert candidates into PostgreSQL
  const toInsert = candidatesToAdd.slice(0, Math.max(needed, candidatesToAdd.length));
  console.log(`Inserting ${toInsert.length} products into DB...`);

  const createdProducts = [];
  for (let i = 0; i < toInsert.length; i += 25) {
    const chunk = toInsert.slice(i, i + 25);
    for (const item of chunk) {
      const created = await prisma.product.create({
        data: item
      });
      createdProducts.push(created);
    }
  }

  // Insert verified reviews for newly added products
  console.log(`Generating reviews for ${createdProducts.length} new products...`);
  const reviewTemplates = [
    { rating: 5, comment: "Superb quality! Exceeded my expectations. Packaging was great too." },
    { rating: 4, comment: "Nice product, exactly as described. Worth the price." },
    { rating: 5, comment: "Very happy with the purchase. Beautiful finish and genuine quality." },
    { rating: 4, comment: "Value for money. Prompt delivery and good condition." }
  ];

  const firstUser = await prisma.user.findFirst();
  if (firstUser) {
    const reviewsData = [];
    for (const cp of createdProducts) {
      const count = Math.min(cp.reviewsCount, 3);
      for (let r = 0; r < count; r++) {
        const t = reviewTemplates[r % reviewTemplates.length];
        reviewsData.push({
          productId: cp.id,
          userId: firstUser.id,
          rating: t.rating,
          comment: t.comment
        });
      }
    }
    for (let i = 0; i < reviewsData.length; i += 50) {
      await prisma.review.createMany({
        data: reviewsData.slice(i, i + 50)
      });
    }
  }

  const finalTotal = await prisma.product.count();
  console.log(`\n======================================================`);
  console.log(`🎉 Master Catalog Rebuild Complete! Final Total in DB: ${finalTotal}`);
  console.log(`======================================================`);

  process.exit(0);
}

fixDuplicateImagesMaster().catch(console.error);

