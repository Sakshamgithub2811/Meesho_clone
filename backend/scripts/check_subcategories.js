import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/config/prisma.js';

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const subs = await prisma.product.groupBy({
    by: ['categorySlug', 'subCategory'],
    where: {
      subCategory: { not: null }
    },
    _count: {
      id: true
    }
  });

  const map = {};
  for (const item of subs) {
    if (!map[item.categorySlug]) {
      map[item.categorySlug] = [];
    }
    map[item.categorySlug].push({ subCategory: item.subCategory, count: item._count.id });
  }

  console.log('Categories with subcategories:');
  for (const cat of categories) {
    console.log(`\nCategory: ${cat.name} (${cat.slug})`);
    console.log(map[cat.slug] || 'No subcategories');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
