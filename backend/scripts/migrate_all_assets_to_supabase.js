import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { uploadFileToSupabase } from '../src/services/supabaseStorage.service.js';

const prisma = new PrismaClient();

// 1. Dedicated Book Cover Maps (Verified High-Res exact covers from OpenLibrary)
const BOOK_COVERS = {
  'The Psychology of Money by Morgan Housel': {
    sourceUrl: 'https://covers.openlibrary.org/b/id/6694177-L.jpg',
    filename: 'the_psychology_of_money_cover.jpg'
  },
  'Rich Dad Poor Dad by Robert T. Kiyosaki': {
    sourceUrl: 'https://covers.openlibrary.org/b/id/8315603-L.jpg',
    filename: 'rich_dad_poor_dad_cover.jpg'
  },
  'Atomic Habits by James Clear': {
    sourceUrl: 'https://covers.openlibrary.org/b/id/12539702-L.jpg',
    filename: 'atomic_habits_cover.jpg'
  },
  'Grandmas Bag of Stories by Sudha Murty': {
    sourceUrl: 'https://covers.openlibrary.org/b/id/13189254-L.jpg',
    filename: 'grandmas_bag_of_stories_cover.jpg'
  },
  'Sudha Murty - Wise and Otherwise: A Salute to Life': {
    sourceUrl: 'https://covers.openlibrary.org/b/id/10795720-L.jpg',
    filename: 'wise_and_otherwise_cover.jpg'
  },
  'Ikigai: The Japanese Secret to a Long and Happy Life': {
    sourceUrl: 'https://covers.openlibrary.org/b/id/11300391-L.jpg',
    filename: 'ikigai_cover.jpg'
  }
};

// 2. High-Quality Category Visuals to ingest and self-host
const CATEGORY_ASSETS = [
  { slug: 'women-ethnic', name: 'Women Ethnic', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80' },
  { slug: 'women-western', name: 'Women Western', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'men', name: 'Men', url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'kids', name: 'Kids', url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80' },
  { slug: 'home-kitchen', name: 'Home & Kitchen', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80' },
  { slug: 'beauty-health', name: 'Beauty & Health', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jewellery', name: 'Jewellery & Accessories', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'footwear', name: 'Footwear', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { slug: 'electronics', name: 'Electronics & Gadgets', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'accessories', name: 'accessories', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'skincare', name: 'skincare', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80' }
];

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buffer = await res.buffer();
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, contentType };
}

async function runMigration() {
  console.log('🚀 Starting Asset Migration to Supabase Self-Hosted Storage...\n');

  // PHASE 1: Migrate Category Visuals
  console.log('--- PHASE 1: CATEGORY ASSETS ---');
  for (const cat of CATEGORY_ASSETS) {
    try {
      console.log(`Ingesting category "${cat.name}" (${cat.slug})...`);
      const { buffer, contentType } = await fetchBuffer(cat.url);
      const filename = `cat_${cat.slug}.jpg`;
      const uploaded = await uploadFileToSupabase({
        fileBuffer: buffer,
        originalFilename: filename,
        mimeType: contentType,
        folder: 'categories'
      });
      console.log(`✅ Uploaded to: ${uploaded.url}`);

      // Update in DB
      await prisma.category.update({
        where: { slug: cat.slug },
        data: { imageUrl: uploaded.url }
      });
      console.log(`Updated DB Category "${cat.slug}" with self-hosted URL.\n`);
    } catch (err) {
      console.error(`❌ Failed category ${cat.slug}:`, err.message);
    }
  }

  // PHASE 2: Migrate & Fix Mismatched Book Covers
  console.log('--- PHASE 2: BOOK PRODUCTS (FIX MISMATCHED IMAGES) ---');
  for (const [title, bookInfo] of Object.entries(BOOK_COVERS)) {
    try {
      console.log(`Ingesting genuine cover for "${title}"...`);
      const { buffer, contentType } = await fetchBuffer(bookInfo.sourceUrl);
      const uploaded = await uploadFileToSupabase({
        fileBuffer: buffer,
        originalFilename: bookInfo.filename,
        mimeType: contentType,
        folder: 'products'
      });
      console.log(`✅ Uploaded to: ${uploaded.url}`);

      const updated = await prisma.product.updateMany({
        where: { title: { equals: title, mode: 'insensitive' } },
        data: {
          images: [uploaded.url]
        }
      });
      console.log(`Updated ${updated.count} product(s) titled "${title}".\n`);
    } catch (err) {
      console.error(`❌ Failed book "${title}":`, err.message);
    }
  }

  // PHASE 3: Migrate remaining Unsplash Product Images to Supabase
  console.log('--- PHASE 3: REMAINING UNPLASH PRODUCTS ---');
  const unsplashProducts = await prisma.product.findMany({
    select: { id: true, title: true, images: true }
  });

  for (const p of unsplashProducts) {
    if (!p.images || !p.images.some(u => u.includes('unsplash.com'))) continue;

    console.log(`Migrating product: "${p.title}" (${p.id})...`);
    const newImages = [];
    for (let i = 0; i < p.images.length; i++) {
      const imgUrl = p.images[i];
      if (imgUrl.includes('unsplash.com')) {
        try {
          const { buffer, contentType } = await fetchBuffer(imgUrl);
          const cleanName = p.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
          const uploaded = await uploadFileToSupabase({
            fileBuffer: buffer,
            originalFilename: `${cleanName}_${i}.jpg`,
            mimeType: contentType,
            folder: 'products'
          });
          newImages.push(uploaded.url);
          console.log(`  Uploaded [${i}] -> ${uploaded.url}`);
        } catch (e) {
          console.warn(`  Failed img [${i}] (${imgUrl}): ${e.message}`);
          newImages.push(imgUrl); // keep old if failed
        }
      } else {
        newImages.push(imgUrl);
      }
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { images: newImages }
    });
    console.log(`Product "${p.title}" updated with self-hosted images.\n`);
  }

  console.log('🎉 Migration Completed successfully!');
  await prisma.$disconnect();
}

runMigration().catch(console.error);
