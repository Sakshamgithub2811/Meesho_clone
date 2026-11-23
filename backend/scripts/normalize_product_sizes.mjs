import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../src/config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function normalize() {
  console.log('--- Starting Product Sizes Normalization ---');

  // 1. Beauty & Personal Care (perfumes, face wash, lipstick, creams, hair oil): No clothing sizes!
  const beautyRes = await prisma.product.updateMany({
    where: { categorySlug: 'beauty-health' },
    data: { sizes: [] }
  });
  console.log(`Updated ${beautyRes.count} beauty & personal care products to sizes=[]`);

  // 2. Electronics (audio, earbuds, gadgets): No clothing sizes!
  const elecRes = await prisma.product.updateMany({
    where: { categorySlug: 'electronics' },
    data: { sizes: [] }
  });
  console.log(`Updated ${elecRes.count} electronics products to sizes=[]`);

  // 3. Footwear (shoes, sandals, loafers, chappals): Authentic Indian shoe sizes 6-10!
  const footRes = await prisma.product.updateMany({
    where: { categorySlug: 'footwear' },
    data: { sizes: ['IND-6', 'IND-7', 'IND-8', 'IND-9', 'IND-10'] }
  });
  console.log(`Updated ${footRes.count} footwear products to sizes=['IND-6', 'IND-7', 'IND-8', 'IND-9', 'IND-10']`);

  // 4. Sarees & Dupattas (women-ethnic): Authentic Indian 'Free Size'!
  const sareeRes = await prisma.product.updateMany({
    where: {
      categorySlug: 'women-ethnic',
      OR: [
        { title: { contains: 'saree', mode: 'insensitive' } },
        { title: { contains: 'sari', mode: 'insensitive' } },
        { subCategory: { contains: 'saree', mode: 'insensitive' } }
      ]
    },
    data: { sizes: ['Free Size'] }
  });
  console.log(`Updated ${sareeRes.count} sarees to sizes=['Free Size']`);

  // 5. Readymade Apparel (Shirts, T-shirts, Tops, Kurtis, Dresses): Standard apparel sizing!
  const apparelRes = await prisma.product.updateMany({
    where: {
      AND: [
        {
          OR: [
            { categorySlug: 'women-western' },
            { categorySlug: 'men' },
            {
              AND: [
                { categorySlug: 'women-ethnic' },
                {
                  NOT: [
                    { title: { contains: 'saree', mode: 'insensitive' } },
                    { subCategory: { contains: 'saree', mode: 'insensitive' } }
                  ]
                }
              ]
            }
          ]
        },
        {
          OR: [
            { sizes: { equals: ['Standard'] } },
            { sizes: { equals: [] } }
          ]
        }
      ]
    },
    data: { sizes: ['S', 'M', 'L', 'XL', 'XXL'] }
  });
  console.log(`Updated ${apparelRes.count} clothing items to sizes=['S', 'M', 'L', 'XL', 'XXL']`);

  // 6. Jewellery & Home-Kitchen: 'Free Size'
  const miscRes = await prisma.product.updateMany({
    where: {
      categorySlug: { in: ['jewellery', 'home-kitchen', 'accessories'] },
      sizes: { equals: ['Standard'] }
    },
    data: { sizes: ['Free Size'] }
  });
  console.log(`Updated ${miscRes.count} jewellery/home products to sizes=['Free Size']`);

  console.log('--- Product Sizes Normalization Complete! ---');
  process.exit(0);
}

normalize().catch((err) => {
  console.error('Normalization error:', err);
  process.exit(1);
});
