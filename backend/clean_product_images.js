import prisma from './src/config/prisma.js';

async function cleanImages() {
  console.log('--- Starting Product Images Clean Up ---');

  // 1. First ensure Lipstick has the 2 matching images
  await prisma.product.update({
    where: { id: 'aac58d6e-0131-4bbe-a749-a0d3fe15a8d0' },
    data: {
      images: [
        '/products/nude_lipstick_1.jpg',
        '/products/nude_lipstick_2.jpg'
      ]
    }
  });
  console.log('Updated Lipstick product with matching nude lipstick images');

  // 2. Ensure Stainless Steel Containers has the 2 matching images
  await prisma.product.update({
    where: { id: 'b70e283a-9e8b-4054-8647-e739bf9cbbcf' },
    data: {
      images: [
        '/products/steel_containers_1.jpg',
        '/products/steel_containers_2.jpg'
      ]
    }
  });
  console.log('Updated Kitchen Containers with matching steel container images');

  // Multi-image verified products (that have genuine same-product photos)
  const preserveMultiImageIds = [
    'aac58d6e-0131-4bbe-a749-a0d3fe15a8d0', // Lipstick (both generated matching)
    'b70e283a-9e8b-4054-8647-e739bf9cbbcf', // Steel containers (both generated matching)
    '04e1b2a7-3fc7-47c4-b2f1-6fc61b2677f4', // SIRIL saree (all 4 same saree)
    'cebf50eb-9319-4573-84d7-11a4afaf251e'  // Fastrack watch (all 4 same watch)
  ];

  // 3. For all other products that had mismatched images, keep ONLY images[0] (primary image)
  const allProducts = await prisma.product.findMany();
  let updatedCount = 0;

  for (const prod of allProducts) {
    if (preserveMultiImageIds.includes(prod.id)) {
      continue;
    }

    if (prod.images && prod.images.length > 1) {
      // Keep only the primary image
      await prisma.product.update({
        where: { id: prod.id },
        data: {
          images: [prod.images[0]]
        }
      });
      console.log(`Cleaned mismatched images for [${prod.title}] -> Kept single primary image`);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully cleaned ${updatedCount} products with mismatched images!`);
  await prisma.$disconnect();
}

cleanImages().catch(console.error);
