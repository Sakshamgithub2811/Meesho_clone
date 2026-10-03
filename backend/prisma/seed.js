import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Meesho database...");

  // 1. Create Categories
  const categories = [
    {
      name: "Women Ethnic",
      slug: "women-ethnic",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
    },
    {
      name: "Women Western",
      slug: "women-western",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300",
    },
    {
      name: "Men",
      slug: "men",
      imageUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=300",
    },
    {
      name: "Kids",
      slug: "kids",
      imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300",
    },
    {
      name: "Beauty & Health",
      slug: "beauty-health",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded successfully!");

  // 2. Create Sample Products
  const products = [
    {
      title: "Aakarsha Attractive Kurti & Pant Set",
      description: "Premium Rayon Embroidered Kurti with Pant and Dupatta set for festive and daily wear.",
      price: 449,
      originalPrice: 899,
      discountPercentage: 50,
      rating: 4.3,
      reviewsCount: 452,
      categorySlug: "women-ethnic",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
      ],
      sizes: ["M", "L", "XL", "XXL"],
      stock: 100,
      isFreeDelivery: true,
      supplierName: "Shree Ganesh Textiles",
    },
    {
      title: "Men Regular Fit Solid Casual Shirt",
      description: "Breathable cotton blend stylish spread collar casual shirt suitable for all occasions.",
      price: 329,
      originalPrice: 699,
      discountPercentage: 53,
      rating: 4.1,
      reviewsCount: 890,
      categorySlug: "men",
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 80,
      isFreeDelivery: true,
      supplierName: "Fashion Hub Surat",
    },
    {
      title: "Stylish Floral Print Georgette Maxi Dress",
      description: "Trendy western wear gown dress with elasticated waist and flared hem.",
      price: 399,
      originalPrice: 999,
      discountPercentage: 60,
      rating: 4.4,
      reviewsCount: 310,
      categorySlug: "women-western",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
      ],
      sizes: ["S", "M", "L"],
      stock: 50,
      isFreeDelivery: true,
      supplierName: "Urban Chic Boutique",
    },
    {
      title: "Stainless Steel Kitchen Container Set (Pack of 4)",
      description: "Airtight leak-proof storage containers for spices and pulses with transparent lids.",
      price: 279,
      originalPrice: 599,
      discountPercentage: 53,
      rating: 4.5,
      reviewsCount: 1240,
      categorySlug: "home-kitchen",
      images: [
        "https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=600",
      ],
      sizes: ["Free Size"],
      stock: 150,
      isFreeDelivery: true,
      supplierName: "Homeware Essentials",
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({
      where: { title: prod.title },
    });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }

  console.log("✅ Products seeded successfully!");
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
