import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function syncAllReviews() {
  const profiles = await prisma.profile.findMany();
  if (profiles.length === 0) {
    console.log('No profile found to associate reviews with!');
    process.exit(1);
  }

  const productsWithoutReviews = await prisma.product.findMany({
    where: {
      reviews: {
        none: {}
      }
    },
    select: { id: true, title: true, rating: true, reviewsCount: true }
  });

  console.log(`Products without reviews in DB: ${productsWithoutReviews.length}`);

  const reviewTemplates = [
    { rating: 5, comment: "Superb quality! Exceeded my expectations. Packaging was great too." },
    { rating: 4, comment: "Nice product, exactly as described. Worth the price." },
    { rating: 5, comment: "Very happy with the purchase. Beautiful finish and genuine quality." },
    { rating: 4, comment: "Value for money. Prompt delivery and good condition." },
    { rating: 5, comment: "Authentic item, lovely texture and great fabric. Will buy again!" },
    { rating: 4, comment: "Good quality, perfect fitting and looks elegant." }
  ];

  const reviewsToInsert = [];
  for (const prod of productsWithoutReviews) {
    // 1 review per profile per product to respect unique(user_id, product_id)
    for (let pIdx = 0; pIdx < Math.min(profiles.length, 3); pIdx++) {
      const prof = profiles[pIdx];
      const tmpl = reviewTemplates[(prod.title.length + pIdx) % reviewTemplates.length];
      reviewsToInsert.push({
        productId: prod.id,
        userId: prof.id,
        rating: tmpl.rating,
        comment: tmpl.comment
      });
    }
  }

  console.log(`Inserting ${reviewsToInsert.length} reviews...`);
  for (let i = 0; i < reviewsToInsert.length; i += 100) {
    await prisma.review.createMany({
      data: reviewsToInsert.slice(i, i + 100),
      skipDuplicates: true
    });
  }

  // Also sync rating and reviewsCount on product
  console.log('Updating product review counts...');
  await prisma.$executeRawUnsafe(`
    UPDATE products p
    SET 
      reviews_count = sub.cnt,
      rating = sub.avg_rating
    FROM (
      SELECT product_id, COUNT(*) as cnt, ROUND(AVG(rating)::numeric, 1) as avg_rating
      FROM reviews
      GROUP BY product_id
    ) sub
    WHERE p.id = sub.product_id;
  `);

  const finalReviewCount = await prisma.review.count();
  console.log(`Total reviews in DB now: ${finalReviewCount}`);
  process.exit(0);
}

syncAllReviews().catch(console.error);
