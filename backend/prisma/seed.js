import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding comprehensive real Meesho products and categories...");

  // 1. Categories
  const categories = [
    {
      name: "Women Ethnic",
      slug: "women-ethnic",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Women Western",
      slug: "women-western",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Men",
      slug: "men",
      imageUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Kids",
      slug: "kids",
      imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Beauty & Health",
      slug: "beauty-health",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Jewellery & Accessories",
      slug: "jewellery",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Footwear",
      slug: "footwear",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, imageUrl: cat.imageUrl },
      create: cat,
    });
  }
  console.log("✅ Categories seeded successfully!");

  // 2. Comprehensive Real Products Catalog
  const products = [
    // ── Women Ethnic ──
    {
      title: "Royal Orchid Embroidered Banarasi Silk Kurta Set",
      description: "Premium pure Banarasi Art Silk woven straight kurta with matching pant and rich zari border dupatta. Breathable lining fabric ideal for festivals, weddings, and parties.",
      price: 1249,
      originalPrice: 2499,
      discountPercentage: 50,
      rating: 4.6,
      reviewsCount: 1420,
      categorySlug: "women-ethnic",
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 85,
      isFreeDelivery: true,
      supplierName: "Surat Silk Mills",
    },
    {
      title: "Aakarsha Attractive Kurti & Pant Set",
      description: "Soft rayon embroidered regular fit calf-length kurti with elasticated waistband trouser. Intricate neck embroidery for festive and daily comfort.",
      price: 449,
      originalPrice: 899,
      discountPercentage: 50,
      rating: 4.3,
      reviewsCount: 892,
      categorySlug: "women-ethnic",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["M", "L", "XL", "XXL"],
      stock: 120,
      isFreeDelivery: true,
      supplierName: "Shree Ganesh Textiles",
    },
    {
      title: "Kanjeevaram Soft Zari Woven Saree with Blouse Piece",
      description: "Luxurious jacquard woven border saree with rich pallu design. Comes with matching unstitched blouse piece in premium jacquard silk blend.",
      price: 899,
      originalPrice: 2499,
      discountPercentage: 64,
      rating: 4.7,
      reviewsCount: 2150,
      categorySlug: "women-ethnic",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["Free Size"],
      stock: 160,
      isFreeDelivery: true,
      supplierName: "Kanchipuram Silks Direct",
    },
    {
      title: "Handblock Pure Cotton Flared Anarkali Kurti",
      description: "100% pure Cambric cotton full flared Anarkali with traditional floral Sanganeri handblock print and gota patti border embellishments.",
      price: 699,
      originalPrice: 1599,
      discountPercentage: 56,
      rating: 4.5,
      reviewsCount: 1120,
      categorySlug: "women-ethnic",
      images: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 90,
      isFreeDelivery: true,
      supplierName: "Jaipur Handlooms Co.",
    },

    // ── Women Western ──
    {
      title: "Stylish Floral Print Georgette Flared Maxi Dress",
      description: "Trendy western tier dress with elasticated smocking bodice, sheer puffed sleeves, and lightweight inner lining for casual dinners & brunches.",
      price: 399,
      originalPrice: 999,
      discountPercentage: 60,
      rating: 4.4,
      reviewsCount: 540,
      categorySlug: "women-western",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 75,
      isFreeDelivery: true,
      supplierName: "Urban Chic Boutique",
    },
    {
      title: "Women High-Rise Stretchable Slim Fit Denim Jeans",
      description: "Premium cotton-elastane blend 5-pocket denim jeans with clean rinse wash, high-rise waist, and ankle-length stretch fit.",
      price: 549,
      originalPrice: 1399,
      discountPercentage: 61,
      rating: 4.2,
      reviewsCount: 980,
      categorySlug: "women-western",
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["28", "30", "32", "34"],
      stock: 110,
      isFreeDelivery: true,
      supplierName: "Denim Works Ahmedabad",
    },
    {
      title: "Oversized Cotton Casual Drop Shoulder T-Shirt",
      description: "Heavyweight 220 GSM bio-washed pre-shrunk cotton oversized t-shirt with aesthetic typography graphic print.",
      price: 299,
      originalPrice: 699,
      discountPercentage: 57,
      rating: 4.5,
      reviewsCount: 1650,
      categorySlug: "women-western",
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 140,
      isFreeDelivery: true,
      supplierName: "Vibe Streetwear",
    },

    // ── Men Fashion ──
    {
      title: "Men Regular Fit Solid Casual Spread Collar Shirt",
      description: "100% combed cotton casual shirt with spread collar, chest pocket, and curved hem. Suitable for office, college, and weekend wear.",
      price: 329,
      originalPrice: 699,
      discountPercentage: 53,
      rating: 4.1,
      reviewsCount: 890,
      categorySlug: "men",
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 80,
      isFreeDelivery: true,
      supplierName: "Fashion Hub Surat",
    },
    {
      title: "Men's Vintage Washed Denim Jacket",
      description: "Classic blue stonewashed denim jacket with metal button closures, twin flap chest pockets, and durable twin-needle stitching.",
      price: 899,
      originalPrice: 2499,
      discountPercentage: 64,
      rating: 4.6,
      reviewsCount: 940,
      categorySlug: "men",
      images: [
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["M", "L", "XL", "XXL"],
      stock: 65,
      isFreeDelivery: true,
      supplierName: "Rugged Apparel Co.",
    },
    {
      title: "Men Pure Cotton Festive Mandarin Collar Kurta",
      description: "Textured slub cotton ethnic short kurta featuring side pockets, full sleeves, and wooden finished buttons for festive occasions.",
      price: 499,
      originalPrice: 1199,
      discountPercentage: 58,
      rating: 4.4,
      reviewsCount: 680,
      categorySlug: "men",
      images: [
        "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["M", "L", "XL", "XXL"],
      stock: 95,
      isFreeDelivery: true,
      supplierName: "Desi Heritage Lucknow",
    },

    // ── Kids ──
    {
      title: "Kids Boys Printed T-Shirt & Denim Shorts Set (Pack of 2)",
      description: "Super soft combed cotton t-shirt with cute dinosaur print and washed denim shorts with elastic drawcord waist for active boys.",
      price: 349,
      originalPrice: 799,
      discountPercentage: 56,
      rating: 4.5,
      reviewsCount: 710,
      categorySlug: "kids",
      images: [
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["2-3 Y", "3-4 Y", "4-5 Y", "5-6 Y"],
      stock: 130,
      isFreeDelivery: true,
      supplierName: "Tiny Tots India",
    },
    {
      title: "Kids Girls Cotton Floral Tiered Party Frock",
      description: "Breathable pure cotton floral printed knee-length dress with ruffled cap sleeves and sash bow at waist.",
      price: 389,
      originalPrice: 899,
      discountPercentage: 57,
      rating: 4.6,
      reviewsCount: 840,
      categorySlug: "kids",
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["3-4 Y", "4-5 Y", "6-7 Y", "7-8 Y"],
      stock: 105,
      isFreeDelivery: true,
      supplierName: "Little Angel Apparels",
    },

    // ── Home & Kitchen ──
    {
      title: "Stainless Steel Airtight Kitchen Storage Containers (Pack of 4)",
      description: "Grade 304 food-safe stainless steel containers with transparent see-through airtight lids for pulses, grains, and spices.",
      price: 279,
      originalPrice: 599,
      discountPercentage: 53,
      rating: 4.5,
      reviewsCount: 1240,
      categorySlug: "home-kitchen",
      images: [
        "/products/steel_containers_1.jpg",
        "/products/steel_containers_2.jpg",
      ],

      sizes: ["Free Size"],
      stock: 150,
      isFreeDelivery: true,
      supplierName: "Homeware Essentials",
    },
    {
      title: "Glance Pure Cotton Double Bedsheet with 2 Pillow Covers",
      description: "100% micro-satin pure cotton 210 TC queen size bedsheet with modern geometric print and deep corner tuck-in edges.",
      price: 349,
      originalPrice: 899,
      discountPercentage: 61,
      rating: 4.3,
      reviewsCount: 2300,
      categorySlug: "home-kitchen",
      images: [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["Queen Size"],
      stock: 180,
      isFreeDelivery: true,
      supplierName: "Jaipur Tex Fab",
    },

    // ── Footwear ──
    {
      title: "Pro-Flex Ultra Lightweight Air Cushion Men's Sneakers",
      description: "Ergonomic breathable mesh upper with responsive shock-absorbing air cushioning sole. Anti-skid grip for running, gym, and daily casual walking.",
      price: 799,
      originalPrice: 2199,
      discountPercentage: 63,
      rating: 4.7,
      reviewsCount: 2310,
      categorySlug: "footwear",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["6 UK", "7 UK", "8 UK", "9 UK", "10 UK"],
      stock: 120,
      isFreeDelivery: true,
      supplierName: "Fleet Footwear Agra",
    },
    {
      title: "Women's Ethnic Handcrafted Embroidered Mojari Jutti",
      description: "Genuine cushioned memory-foam sole with intricate thread & sequin embroidery on velvet base. Comfortable bite-free soft insole.",
      price: 399,
      originalPrice: 999,
      discountPercentage: 60,
      rating: 4.4,
      reviewsCount: 780,
      categorySlug: "footwear",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["36 EU", "37 EU", "38 EU", "39 EU", "40 EU"],
      stock: 90,
      isFreeDelivery: true,
      supplierName: "Punjab Jutti House",
    },

    // ── Jewellery & Accessories ──
    {
      title: "Traditional German Silver Oxidised Choker Necklace Set",
      description: "Vintage antique silver finished choker necklace with matching dangling jhumkas. Intricate temple motifs for festive and ethnic wear.",
      price: 199,
      originalPrice: 599,
      discountPercentage: 67,
      rating: 4.6,
      reviewsCount: 3120,
      categorySlug: "jewellery",
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["Free Size"],
      stock: 200,
      isFreeDelivery: true,
      supplierName: "Shilpkar Jewellers Jaipur",
    },
    {
      title: "Handcrafted Vegan Leather Crossbody Sling Bag",
      description: "Dual zipped spacious compartment with adjustable shoulder strap and premium gold-toned metallic hardware accents.",
      price: 450,
      originalPrice: 1299,
      discountPercentage: 65,
      rating: 4.5,
      reviewsCount: 1540,
      categorySlug: "jewellery",
      images: [
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["Free Size"],
      stock: 110,
      isFreeDelivery: true,
      supplierName: "Urban Craft Accessories",
    },

    // ── Electronics & Gadgets ──
    {
      title: "boAt Rockerz 450 Bluetooth On-Ear Headphones with 15H Playtime",
      description: "40mm dynamic drivers with high definition immersive audio, adaptive earcups, and dual connectivity via Bluetooth v5.0 and AUX.",
      price: 1499,
      originalPrice: 3990,
      discountPercentage: 62,
      rating: 4.5,
      reviewsCount: 4210,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["Free Size"],
      stock: 70,
      isFreeDelivery: true,
      supplierName: "ElectroPrime India",
    },
    {
      title: "Retro Square Polarized UV400 Sunglasses",
      description: "Lightweight polycarbonate frame with scratch-resistant TAC polarized lenses providing complete UV400 glare protection.",
      price: 249,
      originalPrice: 999,
      discountPercentage: 75,
      rating: 4.3,
      reviewsCount: 520,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["Free Size"],
      stock: 140,
      isFreeDelivery: true,
      supplierName: "OptiVision Direct",
    },

    // ── Beauty & Health ──
    {
      title: "Matte Liquid Lipstick Gift Box (Pack of 4 Nude Shades)",
      description: "Transfer-proof, waterproof, 12-hour long stay non-drying enriched with Vitamin E and almond oil for silky smooth lips.",
      price: 299,
      originalPrice: 799,
      discountPercentage: 63,
      rating: 4.6,
      reviewsCount: 1890,
      categorySlug: "beauty-health",
      images: [
        "/products/nude_lipstick_1.jpg",
        "/products/nude_lipstick_2.jpg",
      ],
      sizes: ["Pack of 4"],
      stock: 150,
      isFreeDelivery: true,
      supplierName: "Glam Naturals",
    },
    {
      title: "Glow Boost Vitamin C Brightening Face Serum (30ml)",
      description: "Potent 10% Vitamin C serum with hyaluronic acid and ferulic acid. Fades dark spots, boosts collagen, and evens skin tone.",
      price: 349,
      originalPrice: 899,
      discountPercentage: 61,
      rating: 4.5,
      reviewsCount: 1420,
      categorySlug: "beauty-health",
      images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
      ],
      sizes: ["30 ml"],
      stock: 120,
      isFreeDelivery: true,
      supplierName: "DermaPure Labs",
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({
      where: { title: prod.title },
    });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: prod,
      });
    } else {
      await prisma.product.create({ data: prod });
    }
  }

  console.log(`✅ ${products.length} products seeded successfully!`);
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
