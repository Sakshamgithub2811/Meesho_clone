import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';
import redisClient from '../src/config/redisClient.js';

// Real Nykaa Lipsticks dataset for Beauty & Health subcategories
const REAL_LIPSTICKS = [
  {
    title: 'Nykaa All Day Matte Waterproof 12H Liquid Lipstick (Teacher Tribe)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 349,
    originalPrice: 449,
    images: ['https://images-static.nykaa.com/media/catalog/product/9/8/983b1f9nykac00000076_1.jpg']
  },
  {
    title: 'Nykaa Paintstix! Waterproof Matte Lipstick (Cheerleader Daze)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 399,
    originalPrice: 499,
    images: ['https://images-static.nykaa.com/media/catalog/product/f/b/fb292a38904245703370_1.jpg']
  },
  {
    title: 'Nykaa So Creme! Creamy Matte Lipstick (Wakeup Makeup)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 325,
    originalPrice: 425,
    images: ['https://images-static.nykaa.com/media/catalog/product/2/7/279c3ef8904245710927_1.jpg']
  },
  {
    title: 'Nykaa Matte to Last! Transfer Proof Liquid Lipstick (Kaveri 20)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 499,
    originalPrice: 650,
    images: ['https://images-static.nykaa.com/media/catalog/product/8/9/8904245706227_1_1.jpg']
  },
  {
    title: 'Nykaa Sealed with a Kiss! Lipstick Palette (Limited Edition)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 649,
    originalPrice: 899,
    images: ['https://images-static.nykaa.com/media/catalog/product/8/9/8904245714888_1.jpg']
  },
  {
    title: 'Nykaa Get Set Matte! Demi Matte Lip Cream (Goals 5ml)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 375,
    originalPrice: 475,
    images: ['https://images-static.nykaa.com/media/catalog/product/8/9/8904245707804_1_1.jpg']
  },
  {
    title: 'Nykaa Gloss it Up! High Shine Lip Gloss (Honey Boo)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 299,
    originalPrice: 399,
    images: ['https://images-static.nykaa.com/media/catalog/product/8/9/8904245705466_1_1_1.jpg']
  },
  {
    title: 'Nykaa All Day Matte Liquid Lipstick (Soul Sister 2.1ml)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 349,
    originalPrice: 449,
    images: ['https://images-static.nykaa.com/media/catalog/product/c/c/ccda1f9nykac00000072_1.jpg']
  },
  {
    title: 'Nykaa So Matte! Mini Lipstick (Regal Ruby 1.5g)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 199,
    originalPrice: 299,
    images: ['https://images-static.nykaa.com/media/catalog/product/7/8/78c94768904245707149_1.jpg']
  },
  {
    title: 'Lakme Forever Matte Liquid Lip Color (Red Carpet)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 295,
    originalPrice: 395,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/2/4/24544_h-8901030758850m.jpg']
  },
  {
    title: 'Lakme Lip Love Chapstick Tinted Lip Balm (Strawberry)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 165,
    originalPrice: 220,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/2/1/21a84538901030713958_1.jpg']
  },
  {
    title: 'Lakme Cushion Matte Lipstick (Mauve Secret)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 275,
    originalPrice: 375,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/b/d/bd180d124704_s1-8901030776533.jpg']
  },
  {
    title: 'Lakme Absolute Matte Melt Liquid Lip Color (Firestarter Red)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 525,
    originalPrice: 750,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/6/e/6e5ba2a29025_h-8901030832697.jpg']
  },
  {
    title: 'MyGlamm Hi-Shine Matte Finish Lipstick (Bare)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 395,
    originalPrice: 495,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/3/7/37d3fc18906095881734_1.jpg']
  },
  {
    title: 'MyGlamm Soft Matte Long Stay Lipstick (Mocha Magic)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 375,
    originalPrice: 475,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/3/0/300ffc18906095882847_1.jpg']
  },
  {
    title: 'MyGlamm LIT Satin Matte Lipstick (Modern Love)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 445,
    originalPrice: 595,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/8/a/8ae664e8906095882106_1.jpg']
  },
  {
    title: 'MyGlamm POSE HD Matte Lipstick (Burgundy Romance)',
    categorySlug: 'beauty-health',
    subCategory: 'Lipstick',
    price: 499,
    originalPrice: 699,
    images: ['https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/5/7/577664e8906095883196_1.jpg']
  }
];

const CUSTOMER_PROFILES = [
  'usr_cust_01', 'usr_cust_02', 'usr_cust_03', 'usr_cust_04', 'usr_cust_05',
  'usr_cust_06', 'usr_cust_07', 'usr_cust_08', 'usr_cust_09', 'usr_cust_10',
  'usr_cust_11', 'usr_cust_12', 'usr_cust_13', 'usr_cust_14', 'usr_cust_15'
];

const REVIEW_TEMPLATES = [
  { rating: 5, title: 'Amazing Quality!', comment: 'Fabric/item is very high quality and exactly as described. Worth every rupee!' },
  { rating: 5, title: 'Loved it ❤️', comment: 'Superb quality and delivered within 3 days. Thank you Meesho!' },
  { rating: 4, title: 'Good Product for this Price', comment: 'Very comfortable and looks elegant. Color is slightly darker but very pretty.' },
  { rating: 5, title: 'Must Buy 👍', comment: 'Received lots of compliments. Premium look and feel at budget price.' },
  { rating: 4, title: 'Value for Money', comment: 'Good quality material. Packaging was neat and delivery was on time.' }
];

async function reclassify() {
  console.log('--- RECLASSIFYING AND STRUCTURING 1000 PRODUCTS ---');

  const products = await prisma.product.findMany({});
  console.log(`Found ${products.length} existing products in DB.`);

  const imageSet = new Set();
  const cleanedProducts = [];

  // Re-classify function
  function classify(p) {
    const title = p.title || '';
    const tLower = title.toLowerCase();
    let cat = p.categorySlug;
    let sub = p.subCategory;

    // 1. BEAUTY & HEALTH
    if (cat === 'beauty-health') {
      if (tLower.includes('lipstick') || tLower.includes('lip balm') || tLower.includes('lip gloss') || tLower.includes('lips gloss')) {
        sub = 'Lipstick';
      } else if (tLower.includes('deodorant') || tLower.includes('parfum') || tLower.includes('perfume') || tLower.includes('spray') || tLower.includes('fogg') || tLower.includes('denver') || tLower.includes('beardo') || tLower.includes('fragrance')) {
        sub = 'Perfume';
      } else if (tLower.includes('kajal') || tLower.includes('eyeliner')) {
        sub = 'Kajal';
      } else if (tLower.includes('rose oil') || tLower.includes('serum') || tLower.includes('oil for cuticle') || tLower.includes('primer')) {
        sub = 'Serum';
      } else if (tLower.includes('face pack') || tLower.includes('mask') || tLower.includes('cleanser') || tLower.includes('blackhead') || tLower.includes('wash')) {
        sub = 'Face Wash';
      } else if (tLower.includes('cream') || tLower.includes('soap') || tLower.includes('lotion') || tLower.includes('gel')) {
        sub = 'Body Lotion';
      } else if (tLower.includes('sunscreen') || tLower.includes('sunblock') || tLower.includes('spf')) {
        sub = 'Sunscreen';
      } else {
        // Hygiene / Oral care items
        sub = 'Body Lotion';
      }
    }

    // 2. FOOTWEAR
    else if (cat === 'footwear') {
      // Remove backpacks miscategorized as footwear!
      if (tLower.includes('backpack') || tLower.includes('bag pack') || tLower.includes('bag 25 ltrs') || tLower.includes('bag 35 l')) {
        return null; // Skip this product
      }

      if (tLower.includes('sneaker') || tLower.includes('sport shoe') || tLower.includes('walking shoe') || tLower.includes('training shoe') || tLower.includes('canvas') || tLower.includes('shoes')) {
        sub = 'Sneakers';
      } else if (tLower.includes('juti') || tLower.includes('mojari')) {
        sub = 'Jutti';
      } else if (tLower.includes('heel') || tLower.includes('stiletto')) {
        sub = 'Heels';
      } else if (tLower.includes('sandal') || tLower.includes('slipper') || tLower.includes('chappal') || tLower.includes('slide') || tLower.includes('slider')) {
        sub = 'Sliders';
      } else if (tLower.includes('loafer') || tLower.includes('slip on') || tLower.includes('casual shoe')) {
        sub = 'Loafers';
      } else {
        sub = 'Flats';
      }
    }

    // 3. ELECTRONICS & GADGETS
    else if (cat === 'electronics') {
      if (tLower.includes('back cover') || tLower.includes('case cover') || tLower.includes('covers redmi') || tLower.includes('hard case') || tLower.includes('phone cover')) {
        sub = 'Phone Covers';
      } else if (tLower.includes('smart watch') || tLower.includes('smartwatch') || tLower.includes('smart band')) {
        sub = 'Smartwatch';
      } else if (tLower.includes('neckband')) {
        sub = 'Neckband';
      } else if (tLower.includes('charger') || tLower.includes('adapter')) {
        sub = 'Charger';
      } else if (tLower.includes('cable') || tLower.includes('wire') || tLower.includes('usb')) {
        sub = 'Cable';
      } else if (tLower.includes('speaker')) {
        sub = 'Speaker';
      } else if (tLower.includes('headphone')) {
        sub = 'Headphones';
      } else if (tLower.includes('earbud') || tLower.includes('airpod') || tLower.includes('tws')) {
        sub = 'Earbuds';
      } else {
        // General mobile/tech accessories
        sub = 'Phone Covers';
      }
    }

    // 4. HOME & KITCHEN
    else if (cat === 'home-kitchen') {
      if (tLower.includes('curtain') || tLower.includes('custain')) {
        sub = 'Curtain';
      } else if (tLower.includes('bedsheet') || tLower.includes('bed cover')) {
        sub = 'Bedsheet';
      } else if (tLower.includes('cushion') || tLower.includes('pillow')) {
        sub = 'Cushion';
      } else if (tLower.includes('towel')) {
        sub = 'Bath Towel';
      } else if (tLower.includes('pan') || tLower.includes('tawa') || tLower.includes('kadai') || tLower.includes('tin') || tLower.includes('mould') || tLower.includes('kitchen tool')) {
        sub = 'Cookware';
      } else if (tLower.includes('lunchbox') || tLower.includes('container') || tLower.includes('jar') || tLower.includes('bottle')) {
        sub = 'Storage Container';
      } else if (tLower.includes('wall') || tLower.includes('sticker') || tLower.includes('decal') || tLower.includes('clock') || tLower.includes('decor') || tLower.includes('idol') || tLower.includes('dream catcher')) {
        sub = 'Wall Decor';
      } else {
        sub = 'Bedsheet';
      }
    }

    // 5. MEN
    else if (cat === 'men') {
      // If footwear item was placed in Men, move to footwear category!
      if (tLower.includes('shoe') || tLower.includes('sneaker') || tLower.includes('sandal')) {
        cat = 'footwear';
        sub = 'Sneakers';
      } else if (tLower.includes('tshirt') || tLower.includes('t-shirt') || tLower.includes('tee') || tLower.includes('gym tshirt')) {
        sub = 'T-Shirt';
      } else if (tLower.includes('shirt')) {
        sub = 'Shirt';
      } else if (tLower.includes('jean') || tLower.includes('denim')) {
        sub = 'Jeans';
      } else if (tLower.includes('kurta')) {
        sub = 'Kurta';
      } else if (tLower.includes('jacket') || tLower.includes('blazer')) {
        sub = 'Jacket';
      } else if (tLower.includes('trouser') || tLower.includes('chino') || tLower.includes('pant')) {
        sub = 'Trousers';
      } else if (tLower.includes('track') || tLower.includes('jogger')) {
        sub = 'Track Pants';
      } else if (tLower.includes('hoodie') || tLower.includes('sweatshirt')) {
        sub = 'Hoodie';
      } else {
        sub = 'Shirt';
      }
    }

    // 6. WOMEN ETHNIC
    else if (cat === 'women-ethnic') {
      if (tLower.includes('saree')) {
        sub = tLower.includes('silk') ? 'Silk Saree' : 'Saree';
      } else if (tLower.includes('kurti') || tLower.includes('kurta')) {
        sub = 'Kurti';
      } else if (tLower.includes('anarkali')) {
        sub = 'Anarkali';
      } else if (tLower.includes('lehenga')) {
        sub = 'Lehenga';
      } else if (tLower.includes('suit') || tLower.includes('dress material')) {
        sub = 'Salwar Suit';
      } else if (tLower.includes('palazzo')) {
        sub = 'Palazzo Set';
      } else if (tLower.includes('dupatta')) {
        sub = 'Dupatta';
      } else {
        sub = 'Saree';
      }
    }

    // 7. WOMEN WESTERN
    else if (cat === 'women-western') {
      if (tLower.includes('dress') || tLower.includes('gown')) {
        sub = 'Dress';
      } else if (tLower.includes('crop top')) {
        sub = 'Crop Top';
      } else if (tLower.includes('top') || tLower.includes('tunic')) {
        sub = 'Top';
      } else if (tLower.includes('jean') || tLower.includes('denim')) {
        sub = 'Jeans';
      } else if (tLower.includes('co-ord') || tLower.includes('set')) {
        sub = 'Co-ord Set';
      } else if (tLower.includes('skirt')) {
        sub = 'Skirt';
      } else if (tLower.includes('jacket') || tLower.includes('shrug')) {
        sub = 'Jacket';
      } else if (tLower.includes('jumpsuit')) {
        sub = 'Jumpsuit';
      } else {
        sub = 'Dress';
      }
    }

    // 8. KIDS
    else if (cat === 'kids') {
      if (tLower.includes('toy') || tLower.includes('bear') || tLower.includes('game') || tLower.includes('writing pad') || tLower.includes('copybook')) {
        sub = 'Toys';
      } else if (tLower.includes('romper') || tLower.includes('onesie') || tLower.includes('sleep suit')) {
        sub = 'Infant Romper';
      } else if (tLower.includes('frock') || tLower.includes('gown') || tLower.includes('dress')) {
        sub = 'Frock';
      } else if (tLower.includes('set') || tLower.includes('suit') || tLower.includes('dungaree')) {
        sub = 'Boys Set';
      } else if (tLower.includes('tshirt') || tLower.includes('t-shirt') || tLower.includes('tee')) {
        sub = 'T-Shirt';
      } else if (tLower.includes('pyjama') || tLower.includes('nightsuit') || tLower.includes('nightwear')) {
        sub = 'Nightwear';
      } else {
        sub = 'Toys';
      }
    }

    // 9. JEWELLERY & ACCESSORIES
    else if (cat === 'jewellery') {
      if (tLower.includes('earring') || tLower.includes('jhumka') || tLower.includes('stud')) {
        sub = 'Earrings';
      } else if (tLower.includes('choker')) {
        sub = 'Choker';
      } else if (tLower.includes('watch')) {
        sub = 'Women Watch';
      } else if (tLower.includes('ring')) {
        sub = 'Rings';
      } else if (tLower.includes('bangle') || tLower.includes('kada')) {
        sub = 'Bangles';
      } else if (tLower.includes('bracelet')) {
        sub = 'Bracelet';
      } else {
        sub = 'Necklace';
      }
    }

    return {
      ...p,
      categorySlug: cat,
      subCategory: sub
    };
  }

  for (const p of products) {
    const classified = classify(p);
    if (classified && !imageSet.has(classified.images[0])) {
      imageSet.add(classified.images[0]);
      cleanedProducts.push(classified);
    }
  }

  console.log(`Classified existing products: ${cleanedProducts.length}`);

  // Inject real Nykaa Lipsticks so that "Lipstick" subcategory is 100% genuine Lipsticks
  for (const lip of REAL_LIPSTICKS) {
    if (!imageSet.has(lip.images[0])) {
      imageSet.add(lip.images[0]);
      cleanedProducts.unshift({
        title: lip.title,
        categorySlug: lip.categorySlug,
        subCategory: lip.subCategory,
        price: lip.price,
        originalPrice: lip.originalPrice,
        discountPercentage: Math.round((1 - lip.price / lip.originalPrice) * 100),
        images: lip.images,
        sizes: ['Standard'],
        stock: 50,
        isFreeDelivery: true,
        supplierName: 'Verified Cosmetics Hub'
      });
    }
  }

  // Ensure total is trimmed or rounded to exactly 1,000
  const final1000 = cleanedProducts.slice(0, 1000);
  console.log(`Final catalog count: ${final1000.length} unique products.`);

  // Verify unique images
  const finalImages = new Set(final1000.map(p => p.images[0]));
  console.log(`Unique images count: ${finalImages.size}`);

  // Check subcategory breakdown in Beauty & Health
  const beautySubcats = {};
  final1000.filter(p => p.categorySlug === 'beauty-health').forEach(p => {
    beautySubcats[p.subCategory] = (beautySubcats[p.subCategory] || 0) + 1;
  });
  console.log('\nNew Beauty & Health Subcategory Distribution:');
  console.log(beautySubcats);

  // Check subcategory breakdown in Footwear
  const footwearSubcats = {};
  final1000.filter(p => p.categorySlug === 'footwear').forEach(p => {
    footwearSubcats[p.subCategory] = (footwearSubcats[p.subCategory] || 0) + 1;
  });
  console.log('\nNew Footwear Subcategory Distribution:');
  console.log(footwearSubcats);

  // Check subcategory breakdown in Electronics
  const electSubcats = {};
  final1000.filter(p => p.categorySlug === 'electronics').forEach(p => {
    electSubcats[p.subCategory] = (electSubcats[p.subCategory] || 0) + 1;
  });
  console.log('\nNew Electronics Subcategory Distribution:');
  console.log(electSubcats);

  // Save to DB
  console.log('\nWriting clean 1000 products to database...');
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});

  const baseTime = Date.now();
  const inserted = [];

  for (let i = 0; i < final1000.length; i += 100) {
    const chunk = final1000.slice(i, i + 100);
    const created = await Promise.all(
      chunk.map((p, idx) => {
        const itemIndex = i + idx;
        const staggeredDate = new Date(baseTime - (itemIndex * 60 * 1000));
        return prisma.product.create({
          data: {
            title: p.title,
            categorySlug: p.categorySlug,
            subCategory: p.subCategory,
            price: p.price,
            originalPrice: p.originalPrice,
            discountPercentage: p.discountPercentage || 25,
            images: p.images,
            sizes: p.sizes || ['S', 'M', 'L', 'XL', 'Free Size'],
            stock: p.stock || 50,
            isFreeDelivery: true,
            supplierName: p.supplierName || 'Verified Supplier',
            createdAt: staggeredDate,
            updatedAt: staggeredDate,
            rating: 0,
            reviewsCount: 0
          }
        });
      })
    );
    inserted.push(...created);
    console.log(`Inserted ${inserted.length}/1000 products...`);
  }

  // Seed reviews & sync ratings
  console.log('\nInserting verified reviews...');
  const allReviewsToInsert = [];
  const ratingUpdates = [];

  for (let i = 0; i < inserted.length; i++) {
    const prod = inserted[i];
    const numReviews = (i % 2 === 0) ? 3 : 2;
    const offset = (i * 3) % CUSTOMER_PROFILES.length;
    let sum = 0;

    for (let r = 0; r < numReviews; r++) {
      const userId = CUSTOMER_PROFILES[(offset + r) % CUSTOMER_PROFILES.length];
      const template = REVIEW_TEMPLATES[(i + r) % REVIEW_TEMPLATES.length];
      allReviewsToInsert.push({
        userId,
        productId: prod.id,
        rating: template.rating,
        title: template.title,
        comment: template.comment,
        images: []
      });
      sum += template.rating;
    }

    ratingUpdates.push({
      id: prod.id,
      rating: parseFloat((sum / numReviews).toFixed(1)),
      reviewsCount: numReviews
    });
  }

  for (let i = 0; i < allReviewsToInsert.length; i += 200) {
    const chunk = allReviewsToInsert.slice(i, i + 200);
    await prisma.review.createMany({ data: chunk });
  }

  console.log('Updating product ratings...');
  for (let i = 0; i < ratingUpdates.length; i += 50) {
    const chunk = ratingUpdates.slice(i, i + 50);
    await Promise.all(
      chunk.map(u =>
        prisma.product.update({
          where: { id: u.id },
          data: { rating: u.rating, reviewsCount: u.reviewsCount }
        })
      )
    );
  }

  // Flush Redis
  if (redisClient?.isOpen) {
    await redisClient.flushAll();
  }

  console.log('\n🎉 ALL DONE! Catalog 100% synchronized with accurate subcategories!');
  process.exit(0);
}

reclassify().catch(console.error);

