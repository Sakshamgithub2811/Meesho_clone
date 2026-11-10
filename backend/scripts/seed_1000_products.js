import prisma from '../src/config/prisma.js';
import redisClient from '../src/config/redisClient.js';
import crypto from 'crypto';

// High quality curated Unsplash images per category
const CATEGORY_IMAGES = {
  'women-ethnic': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610030469668-93510cb2866c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617627143851-bc0108e43486?w=600&auto=format&fit=crop&q=80'
  ],
  'women-western': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&auto=format&fit=crop&q=80'
  ],
  'men': [
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
  ],
  'kids': [
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop&q=80'
  ],
  'home-kitchen': [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80'
  ],
  'beauty-health': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608248597359-009c91624446?w=600&auto=format&fit=crop&q=80'
  ],
  'jewellery': [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611591475841-8664ea642142?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80'
  ],
  'footwear': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&auto=format&fit=crop&q=80'
  ],
  'electronics': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
  ]
};

// Category configurations: Subcategories, prefixes, fabrics/materials, patterns, colors, suppliers, sizes, price ranges
const CATEGORY_DEFINITIONS = {
  'women-ethnic': {
    targetCount: 112,
    subcategories: [
      { name: 'Saree', priceRange: [349, 1499], desc: 'Graceful saree with rich pallu and designer unstitched blouse piece. Perfect for festive celebrations, weddings, and family gatherings.' },
      { name: 'Kurti', priceRange: [249, 799], desc: 'Elegant straight cut kurti with intricate threadwork and breathable all-day comfort fabric.' },
      { name: 'Anarkali', priceRange: [599, 1899], desc: 'Flared anarkali gown kurta with matching dupatta, gold foil accents, and comfortable inner lining.' },
      { name: 'Silk Saree', priceRange: [599, 2199], desc: 'Royal art silk traditional woven saree with heavy golden zari border and contrasting designer blouse.' },
      { name: 'Dupatta', priceRange: [149, 499], desc: 'Lightweight sheer ethnic dupatta with golden scalloped border, mirror work, and tassel latkans.' },
      { name: 'Lehenga', priceRange: [999, 2999], desc: 'Semi-stitched designer bridal lehenga choli with heavy zari embroidery, matching blouse, and net dupatta.' },
      { name: 'Salwar Suit', priceRange: [499, 1399], desc: 'Unstitched ethnic dress material with pure cotton bottom, printed dupatta, and embroidered neckline.' },
      { name: 'Chikankari Kurti', priceRange: [399, 999], desc: 'Authentic Lucknowi chikankari hand-embroidered georgette tunic with delicate floral jaal.' },
      { name: 'Palazzo Set', priceRange: [449, 1199], desc: 'Festive kurti with flared palazzo pants and gotta patti border detailing, tailored in soft rayon.' },
      { name: 'Ethnic Gown', priceRange: [699, 1999], desc: 'Floor length designer ethnic evening gown with sequin embellishments and mandarin collar.' }
    ],
    fabrics: ['Georgette', 'Banarasi Silk', 'Chanderi Cotton', 'Mulmul Cotton', 'Rayon Slub', 'Kanjivaram Silk', 'Organza', 'Chiffon', 'Crepe', 'Tussar Silk'],
    styles: ['Royal', 'Festive', 'Traditional', 'Designer', 'Embroidered', 'Printed', 'Handcrafted', 'Zari Work', 'Gotta Patti', 'Mirror Work', 'Floral Print', 'Bandhani', 'Kalamkari'],
    colors: ['Maroon', 'Peacock Blue', 'Emerald Green', 'Mustard Yellow', 'Rani Pink', 'Wine Purple', 'Dusty Rose', 'Golden Ochre', 'Navy Blue', 'Teal Green', 'Rust Orange', 'Coral Peach'],
    suppliers: [
      { name: 'Surat Silk Mills', id: 'supplier_surat_silk_mills' },
      { name: 'Rajputana Fashions', id: 'supplier_rajputana_fashions' },
      { name: 'Jaipur Craft Villa', id: 'supplier_jaipur_craft_villa' },
      { name: 'Varanasi Weavers Hub', id: 'supplier_varanasi_weavers_hub' },
      { name: 'Lucknow Chikan Art', id: 'supplier_lucknow_chikan_art' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size']
  },

  'women-western': {
    targetCount: 111,
    subcategories: [
      { name: 'Dress', priceRange: [399, 1299], desc: 'Chic fit and flare A-line dress with flattering silhouette and soft stretchable fabric, ideal for brunches and parties.' },
      { name: 'Top', priceRange: [199, 599], desc: 'Trendy casual western top with puff sleeves, breathable fabric, and contemporary neck design.' },
      { name: 'Jeans', priceRange: [499, 1199], desc: 'High-waisted ankle-length stretch denim jeans with 5 pockets, durable wash, and contour fit.' },
      { name: 'Co-ord Set', priceRange: [549, 1499], desc: 'Matching 2-piece blazer or crop top and wide-leg trousers set, modern aesthetic for airport looks and casual outings.' },
      { name: 'Skirt', priceRange: [299, 799], desc: 'Flared accordion pleated midi skirt with elasticated waistband and flowing silhouette.' },
      { name: 'Jacket', priceRange: [599, 1699], desc: 'Stylish washed denim trucker jacket with button cuffs and chest pockets for effortless layering.' },
      { name: 'Jumpsuit', priceRange: [499, 1299], desc: 'Sophisticated belted jumpsuit with notch lapels, side pockets, and comfortable straight legs.' },
      { name: 'T-Shirt', priceRange: [199, 499], desc: 'Oversized drop-shoulder aesthetic graphic print cotton t-shirt with ribbed crew neck.' },
      { name: 'Trousers', priceRange: [399, 999], desc: 'High-rise pleated tailored trousers with relaxed wide leg, suitable for office chic and casual styling.' },
      { name: 'Crop Top', priceRange: [189, 499], desc: 'Ribbed knit short sleeve crop top with sweetheart neckline and form-fitting comfort stretch.' }
    ],
    fabrics: ['Pure Cotton', 'Ribbed Lycra', 'Washed Denim', 'Viscose Rayon', 'Polyester Crepe', 'Linen Blend', 'Satin Silk', 'French Terry', 'Fleece'],
    styles: ['Casual', 'Streetwear', 'Chic', 'Slim Fit', 'Oversized', 'Floral', 'Solid Pastel', 'Boho Chic', 'Minimalist', 'Aesthetic', 'Vintage'],
    colors: ['Sage Green', 'Lilac Lavender', 'Classic Black', 'Off White', 'Cobalt Blue', 'Mocha Brown', 'Olive Green', 'Baby Pink', 'Burgundy', 'Charcoal Grey', 'Sky Blue'],
    suppliers: [
      { name: 'Delhi Urban Trends', id: 'supplier_delhi_urban_trends' },
      { name: 'Mumbai Fashion Street', id: 'supplier_mumbai_fashion_street' },
      { name: 'Ludhiana Knitwear Syndicate', id: 'supplier_ludhiana_knitwear_syndicate' },
      { name: 'Tirupur Global Apparels', id: 'supplier_tirupur_global_apparels' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },

  'men': {
    targetCount: 111,
    subcategories: [
      { name: 'Shirt', priceRange: [349, 899], desc: 'Premium woven casual shirt with spread collar, curved hemline, and breathable cotton fabric for effortless style.' },
      { name: 'T-Shirt', priceRange: [199, 549], desc: 'Combed bio-washed cotton round neck t-shirt with premium color fastness and anti-shrink finish.' },
      { name: 'Jeans', priceRange: [549, 1299], desc: 'Durable regular slim fit denim jeans with mild whiskering effect, rivets, and flex-stretch comfort.' },
      { name: 'Kurta', priceRange: [399, 1099], desc: 'Traditional mandarin collar straight kurta with side pockets and subtle slub texture, ideal for festive celebrations.' },
      { name: 'Jacket', priceRange: [699, 1899], desc: 'Lightweight windproof bomber jacket with ribbed collar, brass zip closure, and interior pocket.' },
      { name: 'Trousers', priceRange: [449, 999], desc: 'Flat-front slim-fit stretch chino trousers with slant pockets, perfect for casual Fridays and formal meetings.' },
      { name: 'Track Pants', priceRange: [299, 749], desc: 'Athletic moisture-wicking joggers with deep zipper pockets, elasticated waistband, and cuffed ankles.' },
      { name: 'Hoodie', priceRange: [499, 1299], desc: 'Heavyweight fleece hooded sweatshirt with kangaroo pocket, drawstring hood, and warm brushed lining.' },
      { name: 'Polo T-Shirt', priceRange: [299, 699], desc: 'Pique knit short-sleeve polo shirt with ribbed contrast collar and 2-button placket.' },
      { name: 'Shorts', priceRange: [249, 599], desc: 'Casual twill cargo shorts with multi utility pockets and relaxed comfortable fit.' }
    ],
    fabrics: ['100% Bio-Wash Cotton', 'Denim Twill', 'Cotton Linen Blend', 'Poly-Cotton DryFit', 'Khadi Cotton', 'Fleece Knit', 'Pique Mesh'],
    styles: ['Casual', 'Slim Fit', 'Regular Fit', 'Classic Check', 'Striped', 'Solid Hue', 'Rugged', 'Athleisure', 'Festive Ethnic', 'Urban Streetwear'],
    colors: ['Navy Blue', 'Charcoal Grey', 'Olive Green', 'White', 'Black', 'Wine Red', 'Khaki Beige', 'Royal Blue', 'Teal', 'Maroon', 'Mustard'],
    suppliers: [
      { name: 'Tirupur Cotton Hub', id: 'supplier_tirupur_cotton_hub' },
      { name: 'Ahmedabad Mills', id: 'supplier_ahmedabad_mills' },
      { name: 'Indore Menswear Co', id: 'supplier_indore_menswear_co' },
      { name: 'Ludhiana Woollens Hub', id: 'supplier_ludhiana_woollens_hub' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL']
  },

  'kids': {
    targetCount: 111,
    subcategories: [
      { name: 'Frock', priceRange: [249, 799], desc: 'Adorable party wear flared frock with soft net flare, satin bow belt, and cotton inner lining to keep baby comfortable.' },
      { name: 'Boys Set', priceRange: [299, 899], desc: 'Handsome 2-piece clothing set including printed cotton shirt and matching denim shorts with elastic suspenders.' },
      { name: 'T-Shirt', priceRange: [149, 399], desc: 'Ultra-soft organic cotton graphic printed t-shirt with nickel-free shoulder snaps for easy dressing.' },
      { name: 'Infant Romper', priceRange: [199, 549], desc: 'Cute baby bodysuit sleepsuit with bottom snap buttons for quick diaper changes, made of chemical-free combed cotton.' },
      { name: 'Dress', priceRange: [299, 899], desc: 'Princess tulle party dress with floral lace bodice and glittering waistline for birthdays and festive events.' },
      { name: 'Toys', priceRange: [179, 699], desc: 'Non-toxic, BIS-certified developmental learning toy set that boosts hand-eye coordination and fine motor skills.' },
      { name: 'Nightwear', priceRange: [229, 599], desc: 'Soft breathable cotton pajama set with cute animal prints, elastic waistband, and ribbed ankle cuffs.' },
      { name: 'Dungaree Set', priceRange: [349, 849], desc: 'Trendy denim dungaree with adjustable shoulder buckle straps and soft striped inner tee.' },
      { name: 'Ethnic Set', priceRange: [399, 1099], desc: 'Traditional festive kurta pyjama with printed jacket set for young boys, crafted in gentle skin-friendly silk blend.' },
      { name: 'Girls Lehenga', priceRange: [449, 1299], desc: 'Ready to wear festive mini lehenga choli set with golden gotta border and lightweight organza dupatta.' }
    ],
    fabrics: ['100% Organic Combed Cotton', 'Soft Breathable Hosiery', 'Baby Soft Fleece', 'Gentle Silk Blend', 'Loomed Linen', 'Tulle Net'],
    styles: ['Cute Animal Print', 'Festive Special', 'Cartoon Hero', 'Polka Dots', 'Vibrant Pastel', 'Striped', 'Floral Garden', 'Casual Daily'],
    colors: ['Baby Pink', 'Sky Blue', 'Lemon Yellow', 'Mint Green', 'Peach Coral', 'Bright Red', 'Lavender', 'Royal Navy', 'Pure White'],
    suppliers: [
      { name: 'Little Angels Apparels', id: 'supplier_little_angels_apparels' },
      { name: 'Kiddie Joy Creations', id: 'supplier_kiddie_joy_creations' },
      { name: 'Surat Baby Garments', id: 'supplier_surat_baby_garments' }
    ],
    sizes: ['0-6 Months', '6-12 Months', '1-2 Years', '2-3 Years', '4-5 Years', '6-7 Years', '8-9 Years', '10-12 Years', 'Free Size']
  },

  'home-kitchen': {
    targetCount: 111,
    subcategories: [
      { name: 'Bedsheet', priceRange: [299, 899], desc: 'Super king size 210 TC glazed cotton double bedsheet with 2 matching pillow covers. Color fade resistant and ultra-smooth.' },
      { name: 'Curtain', priceRange: [249, 799], desc: 'Pack of 2 room darkening eyelet polyester door curtains with metal eyelet rings and elegant drape.' },
      { name: 'Cookware', priceRange: [399, 1499], desc: 'Heavy gauge non-stick induction base granite coated frying pan / kadai with heat-resistant ergonomic cool touch handle.' },
      { name: 'Storage Container', priceRange: [199, 699], desc: 'Set of airtight BPA-free modular kitchen spice and grain storage containers with clear body and airtight silicone seal.' },
      { name: 'Wall Decor', priceRange: [199, 799], desc: 'Aesthetic laser-cut wooden 3D wall art hanging panels for living room and bedroom home transformation.' },
      { name: 'Kitchen Tools', priceRange: [149, 499], desc: 'Multi-blade vegetable chopper and slicer with stainless steel blades, anti-skid base, and food-grade plastic container.' },
      { name: 'Cushion Cover', priceRange: [199, 599], desc: 'Set of 5 premium velvet decorative square cushion covers with concealed zipper and HD digital prints.' },
      { name: 'Bath Towel', priceRange: [199, 699], desc: 'Pack of 2 500 GSM 100% pure Egyptian cotton super absorbent quick-dry large bath towels.' },
      { name: 'Wall Clock', priceRange: [249, 799], desc: 'Silent sweep non-ticking minimalist decorative modern quartz wall clock for hall, office, and bedroom.' },
      { name: 'Water Bottle', priceRange: [179, 599], desc: 'Leak-proof food-grade stainless steel vacuum insulated thermal water bottle, keeps water cold for 24h and hot for 12h.' }
    ],
    fabrics: ['Glazed Cotton', 'Polyester Jacquard', 'Virgin BPA-Free Plastic', 'Stainless Steel 304', 'Microfiber Cotton', 'Engineered Wood', 'Ceramic Clay'],
    styles: ['Geometric Floral', 'Minimalist Modern', 'Vintage Floral', 'Moroccan Pattern', 'Boho Aesthetic', 'Solid Luxe', 'Scandinavian Chic'],
    colors: ['Teal Blue', 'Ivory Cream', 'Charcoal Grey', 'Pastel Pink', 'Emerald Green', 'Mustard Gold', 'Rust Maroon', 'Classic White'],
    suppliers: [
      { name: 'Panipat Home Furnishings', id: 'supplier_panipat_home_furnishings' },
      { name: 'Moradabad Metal Crafts', id: 'supplier_moradabad_metal_crafts' },
      { name: 'Jaipur Living Textiles', id: 'supplier_jaipur_living_textiles' },
      { name: 'Gujarat Kitchenware Syndicate', id: 'supplier_gujarat_kitchenware_syndicate' }
    ],
    sizes: ['Single', 'Double', 'King Size', 'Queen Size', 'Pack of 1', 'Pack of 2', 'Pack of 4', 'Pack of 6', 'Standard']
  },

  'beauty-health': {
    targetCount: 111,
    subcategories: [
      { name: 'Lipstick', priceRange: [149, 449], desc: '16-hour long stay waterproof matte liquid lipstick infused with Vitamin E, almond oil, and smudge-free formula.' },
      { name: 'Serum', priceRange: [249, 699], desc: '10% Vitamin C + Hyaluronic Acid face serum for deep glow, collagen boosting, and dark spot pigmentation reduction.' },
      { name: 'Face Wash', priceRange: [129, 349], desc: 'Gentle foaming tea tree and salicylic acid acne control face wash with built-in silicone cleansing applicator.' },
      { name: 'Kajal', priceRange: [99, 299], desc: 'Intense black 24-hour waterproof smudge-proof herbal kajal eyeliner pencil enriched with chamomile and castor oil.' },
      { name: 'Perfume', priceRange: [249, 899], desc: 'Luxury French fragrance long-lasting Eau De Parfum for women and men with notes of citrus, cedarwood, and amber vanilla.' },
      { name: 'Body Lotion', priceRange: [179, 499], desc: 'Deep nourishing shea butter and cocoa body moisturizer lotion for 48-hour ultra hydration without stickiness.' },
      { name: 'Shampoo', priceRange: [179, 499], desc: 'Red onion and black seed oil anti-hairfall shampoo for strengthening hair roots, frizz reduction, and natural shine.' },
      { name: 'Sunscreen', priceRange: [229, 599], desc: 'SPF 50 PA++++ ultralight matte gel sunscreen with zero white cast, broad spectrum UVA/UVB and blue light protection.' },
      { name: 'Hair Oil', priceRange: [149, 449], desc: 'Cold pressed rosemary and bhringraj ayurvedic hair revitalizing growth oil with essential herbal extracts.' },
      { name: 'Compact Powder', priceRange: [149, 399], desc: 'All-day matte oil-control compact powder with UV filter, velvet finish, and lightweight blendability.' }
    ],
    fabrics: ['Ayurvedic Herbal', 'Organic Vegan', 'Dermatologist Tested', 'Paraben-Free', 'Cruelty Free', 'Vitamin Enriched', 'Cold Pressed'],
    styles: ['Matte Finish', 'Radiant Glow', 'Deep Hydration', 'Anti-Aging', 'Skin Brightening', 'Herbal Therapy', 'Fresh Fragrance'],
    colors: ['Nude Brown', 'Ruby Red', 'Pink Blossom', 'Plum Wine', 'Peach Coral', 'Clear Gel', 'Golden Glow', 'Ivory Neutral'],
    suppliers: [
      { name: 'Glam Naturals Delhi', id: 'supplier_glam_naturals' },
      { name: 'DermaPure Labs Mumbai', id: 'supplier_dermapure_labs' },
      { name: 'AyurVeda Organics Kerala', id: 'supplier_ayurveda_organics' },
      { name: 'Himalayan Herbal Herbals', id: 'supplier_himalayan_herbals' }
    ],
    sizes: ['30ml', '50ml', '100ml', '200ml', '50g', '100g', 'Pack of 1', 'Pack of 2', 'Pack of 4']
  },

  'jewellery': {
    targetCount: 111,
    subcategories: [
      { name: 'Earrings', priceRange: [129, 499], desc: 'Traditional German silver oxidised jhumka earrings with pearl drops, intricate filigree, and lightweight comfortable hook.' },
      { name: 'Choker', priceRange: [249, 899], desc: 'Royal Kundan and Meenakari choker necklace set with matching dangling earrings and maang tikka for weddings.' },
      { name: 'Necklace', priceRange: [199, 799], desc: 'Elegant 18K rose gold-plated anti-tarnish stainless steel minimalist clover pendant necklace for daily wear.' },
      { name: 'Bangles', priceRange: [179, 699], desc: 'Set of 4 brass gold-plated bridal kada bangles with hand-painted enamel and sparkling micro cubic zirconia.' },
      { name: 'Rings', priceRange: [99, 399], desc: 'Set of 6 aesthetic stackable adjustable bohemian rings with turquoise gemstone and vintage engraved motifs.' },
      { name: 'Women Watch', priceRange: [299, 899], desc: 'Designer quartz analogue wrist watch with magnet mesh strap, diamond-studded bezel, and water-resistant dial.' },
      { name: 'Bracelet', priceRange: [149, 499], desc: 'Evil eye protection charm bracelet with adjustable sliding macrame knot and zircon gemstones.' },
      { name: 'Anklet', priceRange: [129, 399], desc: 'Pair of delicate silver-plated payal anklets with soothing chiming ghungroo bells and floral charms.' },
      { name: 'Mangalsutra', priceRange: [199, 649], desc: 'Traditional Maharashtrian vatana black beaded gold-plated short daily wear mangalsutra with diamond pendant.' },
      { name: 'Maang Tikka', priceRange: [129, 399], desc: 'Bridal temple jewellery kundan maang tikka with ruby pink stones and delicate hanging beads.' }
    ],
    fabrics: ['Oxidised Silver', 'Gold Plated Brass', 'Stainless Steel Anti-Tarnish', 'Kundan Crystal', 'American Diamond CZ', 'Beaded Pearl'],
    styles: ['Antique Temple', 'Minimalist Korean', 'Royal Bridal', 'Boho Gypsy', 'Contemporary Glam', 'Victorian Vintage'],
    colors: ['Oxidised Silver', 'Yellow Gold', 'Rose Gold', 'Ruby Red', 'Emerald Green', 'Pearl White', 'Sapphire Blue', 'Dual Tone Silver Gold'],
    suppliers: [
      { name: 'Shilpkar Jewellers Jaipur', id: 'supplier_shilpkar_jewellers_jaipur' },
      { name: 'Rajkot Gold Crafts', id: 'supplier_rajkot_gold_crafts' },
      { name: 'Zaveri Bazaar Gems', id: 'supplier_zaveri_bazaar_gems' },
      { name: 'Hyderabad Pearl Co', id: 'supplier_hyderabad_pearl_co' }
    ],
    sizes: ['Free Size', 'Adjustable', '2.4', '2.6', '2.8', 'Pack of 1', 'Set of 2', 'Set of 4']
  },

  'footwear': {
    targetCount: 111,
    subcategories: [
      { name: 'Sneakers', priceRange: [399, 1199], desc: 'Trendy chunky white casual sneakers with memory foam cushioned insole, breathable mesh upper, and anti-skid rubber sole.' },
      { name: 'Jutti', priceRange: [299, 849], desc: 'Authentic handcrafted Punjabi mojari jutti with rich dabka embroidery, double cushioned sole, and bite-free pure leather.' },
      { name: 'Flats', priceRange: [199, 549], desc: 'Comfortable daily wear open-toe kolhapuri flat sandals with braided straps and flexible PVC sole.' },
      { name: 'Heels', priceRange: [449, 1299], desc: 'Glamorous transparent strap block heel sandals with cushioned footbed and sturdy 2.5 inch party heels.' },
      { name: 'Sliders', priceRange: [169, 449], desc: 'Ultra-lightweight EVA cloud slides with non-slip sole and water-resistant soft arch support footbed.' },
      { name: 'Loafers', priceRange: [399, 999], desc: 'Classic penny slip-on formal loafers for men with faux leather finish and shock-absorbing TPR outsole.' },
      { name: 'Sandals', priceRange: [249, 699], desc: 'Casual outdoor sports sandals with velcro straps, cushioned footbed, and rugged all-terrain grip.' },
      { name: 'Boots', priceRange: [599, 1599], desc: 'Stylish ankle-high lace-up combat boots with side zipper, sturdy block heel, and durable faux suede.' },
      { name: 'Running Shoes', priceRange: [449, 1299], desc: 'Lightweight air-cushioned running gym shoes with responsive bounce sole and sweat-wicking knit upper.' },
      { name: 'Slippers', priceRange: [149, 399], desc: 'Soft orthopedic memory foam home bedroom slippers with textured non-slip sole for pain relief.' }
    ],
    fabrics: ['Synthetic Leather', 'Breathable Mesh Knit', 'Handcrafted Pure Leather', 'Soft EVA Foam', 'Faux Velvet Suede', 'Durable Canvas'],
    styles: ['Sporty Athletic', 'Handcrafted Ethnic', 'Minimalist Casual', 'Party Glam', 'Formal Office', 'Streetwear Chunky'],
    colors: ['Classic White', 'Jet Black', 'Tan Brown', 'Navy Blue', 'Pastel Pink', 'Beige Nude', 'Olive Drab', 'Cherry Red', 'Grey Melange'],
    suppliers: [
      { name: 'Agra Footwear Syndicate', id: 'supplier_agra_footwear_syndicate' },
      { name: 'Kanpur Leather Works', id: 'supplier_kanpur_leather_works' },
      { name: 'Jalandhar Sports Co', id: 'supplier_jalandhar_sports_co' },
      { name: 'Delhi Shoe Mart', id: 'supplier_delhi_shoe_mart' }
    ],
    sizes: ['IND-4', 'IND-5', 'IND-6', 'IND-7', 'IND-8', 'IND-9', 'IND-10', 'IND-11']
  },

  'electronics': {
    targetCount: 111,
    subcategories: [
      { name: 'Earbuds', priceRange: [499, 1499], desc: 'True wireless Bluetooth v5.3 earbuds with 40-hour playtime, environmental noise cancellation (ENC), and quad mics.' },
      { name: 'Smartwatch', priceRange: [799, 2199], desc: '1.85 inch HD curved display smartwatch with Bluetooth calling, 100+ sports modes, SpO2 & 24/7 heart rate monitor.' },
      { name: 'Cable', priceRange: [99, 299], desc: 'Fast charging 65W nylon braided Type-C to Type-C / USB cable with 480Mbps data sync and reinforced stress points.' },
      { name: 'Speaker', priceRange: [399, 1299], desc: 'Portable mini wireless Bluetooth 5.0 speaker with deep bass, RGB lighting, IPX5 waterproof rating, and 12h battery.' },
      { name: 'Headphones', priceRange: [499, 1499], desc: 'Over-ear wireless Bluetooth headphones with ultra-soft protein leather ear cushions, 40mm drivers, and AUX support.' },
      { name: 'Charger', priceRange: [199, 699], desc: 'Dual-port 30W GaN fast wall charger adapter with QC 3.0 and PD support, certified over-voltage protection.' },
      { name: 'Neckband', priceRange: [349, 899], desc: 'Magnetic in-ear wireless Bluetooth neckband with vibration alert, bass boost 10mm drivers, and 30-hour battery life.' },
      { name: 'Power Bank', priceRange: [599, 1599], desc: '10000mAh compact slim power bank with dual USB outputs, LED battery indicator, and smart IC multi-device protection.' },
      { name: 'Stand', priceRange: [129, 399], desc: '360-degree rotating foldable aluminum desktop mobile phone and tablet stand with anti-slip silicone cushions.' },
      { name: 'Mouse', priceRange: [179, 499], desc: 'Silent click 2.4GHz wireless ergonomic optical mouse with adjustable 1600 DPI and energy-saving auto sleep mode.' }
    ],
    fabrics: ['Aviation Aluminum', 'Braided Nylon', 'Matte ABS Polymer', 'Tempered Glass', 'Silicone Rubber'],
    styles: ['Sleek Modern', 'Rugged Heavy Duty', 'Ultra Slim', 'RGB Glow', 'Ergonomic Curved', 'Pocket Size Compact'],
    colors: ['Midnight Black', 'Pearl White', 'Deep Navy', 'Gunmetal Grey', 'Space Grey', 'Military Green', 'Rose Quartz'],
    suppliers: [
      { name: 'Bangalore Tech Depot', id: 'supplier_bangalore_tech_depot' },
      { name: 'Shenzhen Direct Imports', id: 'supplier_shenzhen_direct_imports' },
      { name: 'Noida Electronics Hub', id: 'supplier_noida_electronics_hub' },
      { name: 'Mumbai Gadget Zone', id: 'supplier_mumbai_gadget_zone' }
    ],
    sizes: ['Standard', 'Universal', 'Pack of 1', 'Pack of 2', '1 Meter', '2 Meter', '10000mAh', '20000mAh']
  }
};

// Distinct title patterns to make 1000 unique product titles
const TITLE_PREFIXES = [
  'Royal', 'Luxe', 'Classic', 'Premium', 'Aesthetic', 'Trendy', 'Modern', 'Vintage',
  'Urban', 'Festive', 'Designer', 'Artisanal', 'Exclusive', 'Daily', 'Signature',
  'Pure', 'Elegant', 'Comfort', 'Chic', 'Heritage', 'Glamour', 'Vibrant', 'Graceful',
  'Elite', 'Prime', 'Supreme', 'Essential', 'Smart', 'Active', 'Ultra'
];

const TITLE_SUFFIXES = [
  'Collection', 'Edition', 'Drop', 'Special', 'Series', 'Craft', 'Choice', 'Pick',
  'Style', 'Vogue', 'Essentials', 'Select', 'Line', 'Attire', 'Hub', 'Comfort'
];

function generate1000Products() {
  const products = [];
  const titleSet = new Set();
  let totalCount = 0;

  for (const [catSlug, catDef] of Object.entries(CATEGORY_DEFINITIONS)) {
    const { targetCount, subcategories, fabrics, styles, colors, suppliers, sizes } = catDef;
    const catImages = CATEGORY_IMAGES[catSlug] || [];
    let countForThisCat = 0;

    // Distribute evenly across subcategories
    const perSubcat = Math.floor(targetCount / subcategories.length);
    const remainder = targetCount % subcategories.length;

    for (let sIdx = 0; sIdx < subcategories.length; sIdx++) {
      const subcat = subcategories[sIdx];
      const itemsToMake = perSubcat + (sIdx < remainder ? 1 : 0);

      for (let i = 0; i < itemsToMake; i++) {
        // Select permutations
        const prefix = TITLE_PREFIXES[(countForThisCat * 3 + i) % TITLE_PREFIXES.length];
        const fabric = fabrics[(i + sIdx) % fabrics.length];
        const style = styles[(countForThisCat * 2 + i) % styles.length];
        const color = colors[(i * 2 + countForThisCat) % colors.length];
        const supplier = suppliers[(i + sIdx) % suppliers.length];
        const suffix = TITLE_SUFFIXES[(i + countForThisCat) % TITLE_SUFFIXES.length];

        // Format unique title
        let titleCandidate = `${prefix} ${style} ${fabric} ${subcat.name} (${color}) - ${suffix}`;
        let counter = 1;
        while (titleSet.has(titleCandidate)) {
          counter++;
          titleCandidate = `${prefix} ${style} ${fabric} ${subcat.name} in ${color} [Vol.${counter}]`;
        }
        titleSet.add(titleCandidate);

        // Price calculation
        const [minP, maxP] = subcat.priceRange;
        const step = (maxP - minP) / (itemsToMake || 1);
        const rawPrice = Math.round((minP + step * i) / 10) * 10 - 1; // e.g. 399, 449, 499
        const price = Math.max(minP, Math.min(maxP, rawPrice > 0 ? rawPrice : minP));

        // Original price with 35% - 70% discount
        const discountPercentage = Math.floor(35 + ((i * 7 + sIdx * 5) % 36)); // 35% to 70%
        const originalPrice = Math.round((price / (1 - discountPercentage / 100)) / 10) * 10 - 1;

        // Ratings & Reviews
        const rating = parseFloat((3.9 + ((i * 13 + sIdx * 7) % 11) * 0.1).toFixed(1)); // 3.9 to 4.9
        const reviewsCount = 15 + ((i * 37 + sIdx * 19) % 430);
        const stock = 30 + ((i * 23 + sIdx * 11) % 270);

        // Images - cycle through high quality pool, give 1-3 images
        const baseImgIdx = (countForThisCat + sIdx) % catImages.length;
        const nextImgIdx = (baseImgIdx + 1) % catImages.length;
        const images = [catImages[baseImgIdx]];
        if (i % 2 === 0 && catImages[nextImgIdx]) {
          images.push(catImages[nextImgIdx]);
        }

        // Subcategory description enriched with keywords
        const description = `${subcat.desc} Premium ${fabric} with ${style.toLowerCase()} design in attractive ${color} shade. Hand-inspected quality from verified hub ${supplier.name}.`;

        // Sizes: select 3 to 5 sizes
        const sizePool = sizes.slice(0, Math.min(sizes.length, 3 + (i % 3)));

        // Color variants
        const productColors = [color];
        const altColor = colors[(colors.indexOf(color) + 3) % colors.length];
        if (altColor && altColor !== color) {
          productColors.push(altColor);
        }

        products.push({
          id: crypto.randomUUID(),
          title: titleCandidate,
          description,
          price: parseFloat(price.toFixed(2)),
          originalPrice: parseFloat(originalPrice.toFixed(2)),
          discountPercentage,
          rating,
          reviewsCount,
          categorySlug: catSlug,
          images,
          sizes: sizePool.length > 0 ? sizePool : ['Free Size'],
          colors: productColors,
          stock,
          isFreeDelivery: true,
          supplierName: supplier.name,
          supplierId: supplier.id
        });

        countForThisCat++;
        totalCount++;
      }
    }
  }

  return products;
}

async function main() {
  console.log('🚀 Starting generation of 1000 Unique Meesho Products...');
  const newProducts = generate1000Products();
  console.log(`✨ Generated ${newProducts.length} unique products across 9 categories!`);

  // Verify unique titles
  const titles = new Set(newProducts.map(p => p.title));
  if (titles.size !== newProducts.length) {
    console.error(`⚠️ Title collision detected! Unique titles: ${titles.size}, Expected: ${newProducts.length}`);
    process.exit(1);
  }
  console.log(`✅ All ${newProducts.length} product titles are 100% UNIQUE!`);

  // Breakdown per category
  const breakdown = {};
  for (const p of newProducts) {
    breakdown[p.categorySlug] = (breakdown[p.categorySlug] || 0) + 1;
  }
  console.log('📊 Category Breakdown:', breakdown);

  // Database insertion in chunks of 100
  const CHUNK_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < newProducts.length; i += CHUNK_SIZE) {
    const chunk = newProducts.slice(i, i + CHUNK_SIZE);
    await prisma.product.createMany({
      data: chunk,
      skipDuplicates: true
    });
    inserted += chunk.length;
    console.log(`💾 Inserted ${inserted} / ${newProducts.length} products...`);
  }

  // Clear Redis Cache so all routes & UI fetch fresh products immediately
  if (redisClient?.isOpen) {
    try {
      await redisClient.flushAll();
      console.log('🧹 Redis product cache flushed successfully!');
    } catch (err) {
      console.warn('Notice: Could not flush Redis cache:', err.message);
    }
  }

  const finalCount = await prisma.product.count();
  console.log(`🎉 SUCCESS! Database now contains ${finalCount} total products!`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error seeding products:', err);
  process.exit(1);
});

