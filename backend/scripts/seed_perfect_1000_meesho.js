import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';
import redisClient from '../src/config/redisClient.js';

// Verified Customer Profiles
const CUSTOMER_PROFILES = [
  { id: 'usr_cust_01', fullName: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+919876543210' },
  { id: 'usr_cust_02', fullName: 'Sneha Patel', email: 'sneha.patel@example.com', phone: '+919876543211' },
  { id: 'usr_cust_03', fullName: 'Rohit Mehta', email: 'rohit.mehta@example.com', phone: '+919876543212' },
  { id: 'usr_cust_04', fullName: 'Pooja Joshi', email: 'pooja.joshi@example.com', phone: '+919876543213' },
  { id: 'usr_cust_05', fullName: 'Vikram Rao', email: 'vikram.rao@example.com', phone: '+919876543214' },
  { id: 'usr_cust_06', fullName: 'Ananya Verma', email: 'ananya.verma@example.com', phone: '+919876543215' },
  { id: 'usr_cust_07', fullName: 'Rahul Kapoor', email: 'rahul.kapoor@example.com', phone: '+919876543216' },
  { id: 'usr_cust_08', fullName: 'Neha Singh', email: 'neha.singh@example.com', phone: '+919876543217' },
  { id: 'usr_cust_09', fullName: 'Amit Deshmukh', email: 'amit.deshmukh@example.com', phone: '+919876543218' },
  { id: 'usr_cust_10', fullName: 'Kavita Nair', email: 'kavita.nair@example.com', phone: '+919876543219' },
  { id: 'usr_cust_11', fullName: 'Manish Gupta', email: 'manish.gupta@example.com', phone: '+919876543220' },
  { id: 'usr_cust_12', fullName: 'Ritu Chauhan', email: 'ritu.chauhan@example.com', phone: '+919876543221' },
  { id: 'usr_cust_13', fullName: 'Deepak Yadav', email: 'deepak.yadav@example.com', phone: '+919876543222' },
  { id: 'usr_cust_14', fullName: 'Sunita Agarwal', email: 'sunita.agarwal@example.com', phone: '+919876543223' },
  { id: 'usr_cust_15', fullName: 'Arjun Nair', email: 'arjun.nair@example.com', phone: '+919876543224' }
];

const REVIEW_TEMPLATES = [
  { rating: 5, title: 'Amazing Quality!', comment: 'Fabric is very soft and pure. Exact color match as shown in photos. Worth every rupee!' },
  { rating: 5, title: 'Loved it ❤️', comment: 'Superb fitting and stitching is flawless. Delivered within 3 days. Thank you Meesho!' },
  { rating: 4, title: 'Good Product for this Price', comment: 'Comfortable to wear and look is elegant. Color is slightly darker than picture but very pretty.' },
  { rating: 5, title: 'Must Buy 👍', comment: 'Received lots of compliments when I wore this. Premium look and feel at budget price.' },
  { rating: 4, title: 'Value for Money', comment: 'Good quality material. Packaging was neat and delivery was on time. Recommended.' },
  { rating: 5, title: 'Highly Recommended!', comment: 'Exceeded my expectations! Very stylish and comfortable. Will definitely order more.' }
];

const CATEGORIES_DATA = [
  { slug: 'women-ethnic', name: 'Women Ethnic' },
  { slug: 'women-western', name: 'Women Western' },
  { slug: 'men', name: 'Men' },
  { slug: 'kids', name: 'Kids' },
  { slug: 'home-kitchen', name: 'Home & Kitchen' },
  { slug: 'beauty-health', name: 'Beauty & Health' },
  { slug: 'jewellery', name: 'Jewellery & Accessories' },
  { slug: 'footwear', name: 'Footwear' },
  { slug: 'electronics', name: 'Electronics & Gadgets' }
];

async function collectAllProducts() {
  const allImages = new Set();
  const allProducts = [];

  function addProduct(item) {
    if (!item.title || !item.categorySlug || !item.image) return;
    const cleanImg = item.image.trim();
    if (!cleanImg.startsWith('http')) return;
    if (allImages.has(cleanImg)) return;
    allImages.add(cleanImg);

    allProducts.push({
      title: item.title.trim().replace(/&amp;/g, '&'),
      categorySlug: item.categorySlug,
      subCategory: item.subCategory || 'General',
      price: Math.max(99, Math.round(item.price || 299)),
      originalPrice: Math.max(Math.round(item.price || 299) + 60, Math.round(item.originalPrice || ((item.price || 299) * 1.5))),
      discountPercentage: Math.max(10, Math.min(75, Math.round((1 - (item.price || 299) / (item.originalPrice || (item.price || 299) * 1.5)) * 100))),
      images: [cleanImg],
      sizes: ['S', 'M', 'L', 'XL', 'Free Size'],
      stock: 45 + Math.floor(Math.random() * 55),
      isFreeDelivery: true,
      supplierName: 'Verified Meesho Supplier'
    });
  }

  console.log('1. Harvesting SauravSamui categories...');
  const sauravFiles = [
    { file: 'womenEthenic.js', catSlug: 'women-ethnic', defaultSubcat: 'Saree' },
    { file: 'womenWestern.js', catSlug: 'women-western', defaultSubcat: 'Dress' },
    { file: 'menproduct.js', catSlug: 'men', defaultSubcat: 'Shirt' },
    { file: 'kids.js', catSlug: 'kids', defaultSubcat: 'Toys' },
    { file: 'homeKitchen.js', catSlug: 'home-kitchen', defaultSubcat: 'Bedsheet' },
    { file: 'beautyandhealth.js', catSlug: 'beauty-health', defaultSubcat: 'Lipstick' },
    { file: 'jewellery.js', catSlug: 'jewellery', defaultSubcat: 'Necklace' },
    { file: 'bagFootware.js', catSlug: 'footwear', defaultSubcat: 'Flats' },
    { file: 'electronics.js', catSlug: 'electronics', defaultSubcat: 'Earbuds' },
    { file: 'landingpageproduct.js', catSlug: 'women-ethnic', defaultSubcat: 'Saree' }
  ];

  for (const sf of sauravFiles) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/${sf.file}`);
      const text = await res.text();
      const blocks = text.split(/\{\s*image_url\s*:/);
      for (let i = 1; i < blocks.length; i++) {
        const b = blocks[i];
        const imgMatch = b.match(/["']\s*(https:\/\/[^"'\s]+)\s*["']/);
        const nameMatch = b.match(/name\s*:\s*["']([^"']+)["']/);
        const priceMatch = b.match(/price\s*:\s*([0-9.]+)/);
        const oldPriceMatch = b.match(/oldprice\s*:\s*([0-9.]+)/);

        if (imgMatch && nameMatch) {
          const t = nameMatch[1].trim();
          let subCat = sf.defaultSubcat;
          const tLower = t.toLowerCase();

          if (sf.catSlug === 'women-ethnic') {
            if (tLower.includes('saree')) subCat = 'Saree';
            else if (tLower.includes('kurti') || tLower.includes('kurta')) subCat = 'Kurti';
            else if (tLower.includes('anarkali')) subCat = 'Anarkali';
            else if (tLower.includes('lehenga')) subCat = 'Lehenga';
            else if (tLower.includes('suit') || tLower.includes('dress material')) subCat = 'Salwar Suit';
            else if (tLower.includes('dupatta')) subCat = 'Dupatta';
            else if (tLower.includes('gown')) subCat = 'Ethnic Gown';
          } else if (sf.catSlug === 'women-western') {
            if (tLower.includes('dress')) subCat = 'Dress';
            else if (tLower.includes('top') || tLower.includes('tunic')) subCat = 'Top';
            else if (tLower.includes('jean') || tLower.includes('denim')) subCat = 'Jeans';
            else if (tLower.includes('skirt')) subCat = 'Skirt';
            else if (tLower.includes('jacket') || tLower.includes('shrug')) subCat = 'Jacket';
            else if (tLower.includes('jumpsuit')) subCat = 'Jumpsuit';
            else if (tLower.includes('t-shirt') || tLower.includes('tee')) subCat = 'T-Shirt';
          } else if (sf.catSlug === 'men') {
            if (tLower.includes('shirt')) subCat = 'Shirt';
            else if (tLower.includes('t-shirt') || tLower.includes('tee') || tLower.includes('tshirt')) subCat = 'T-Shirt';
            else if (tLower.includes('jean') || tLower.includes('denim')) subCat = 'Jeans';
            else if (tLower.includes('kurta')) subCat = 'Kurta';
            else if (tLower.includes('jacket') || tLower.includes('blazer')) subCat = 'Jacket';
            else if (tLower.includes('trouser') || tLower.includes('pant')) subCat = 'Trousers';
            else if (tLower.includes('track') || tLower.includes('jogger')) subCat = 'Track Pants';
          } else if (sf.catSlug === 'kids') {
            if (tLower.includes('frock')) subCat = 'Frock';
            else if (tLower.includes('set') || tLower.includes('suit')) subCat = 'Boys Set';
            else if (tLower.includes('romper') || tLower.includes('baby')) subCat = 'Infant Romper';
            else if (tLower.includes('toy') || tLower.includes('bear') || tLower.includes('game')) subCat = 'Toys';
            else if (tLower.includes('dress')) subCat = 'Princess Dress';
          } else if (sf.catSlug === 'home-kitchen') {
            if (tLower.includes('bedsheet')) subCat = 'Bedsheet';
            else if (tLower.includes('curtain')) subCat = 'Curtain';
            else if (tLower.includes('cushion')) subCat = 'Cushion';
            else if (tLower.includes('towel')) subCat = 'Bath Towel';
            else if (tLower.includes('clock')) subCat = 'Wall Clock';
            else if (tLower.includes('pan') || tLower.includes('cookware') || tLower.includes('kadai')) subCat = 'Cookware';
            else if (tLower.includes('bottle')) subCat = 'Water Bottle';
            else if (tLower.includes('decor') || tLower.includes('wall')) subCat = 'Wall Decor';
          } else if (sf.catSlug === 'beauty-health') {
            if (tLower.includes('lipstick') || tLower.includes('lip')) subCat = 'Lipstick';
            else if (tLower.includes('serum')) subCat = 'Serum';
            else if (tLower.includes('face') || tLower.includes('wash') || tLower.includes('pack')) subCat = 'Face Wash';
            else if (tLower.includes('kajal') || tLower.includes('eye')) subCat = 'Kajal';
            else if (tLower.includes('perfume') || tLower.includes('scent')) subCat = 'Perfume';
            else if (tLower.includes('lotion') || tLower.includes('cream')) subCat = 'Body Lotion';
          } else if (sf.catSlug === 'jewellery') {
            if (tLower.includes('earring') || tLower.includes('jhumka')) subCat = 'Earrings';
            else if (tLower.includes('choker')) subCat = 'Choker';
            else if (tLower.includes('necklace') || tLower.includes('jewellery set') || tLower.includes('chain')) subCat = 'Necklace';
            else if (tLower.includes('bangle') || tLower.includes('kada')) subCat = 'Bangles';
            else if (tLower.includes('ring')) subCat = 'Rings';
            else if (tLower.includes('watch')) subCat = 'Women Watch';
            else if (tLower.includes('bracelet')) subCat = 'Bracelet';
          } else if (sf.catSlug === 'footwear') {
            if (tLower.includes('sneaker') || tLower.includes('running') || tLower.includes('shoe')) subCat = 'Sneakers';
            else if (tLower.includes('jutti') || tLower.includes('mojari')) subCat = 'Jutti';
            else if (tLower.includes('flat')) subCat = 'Flats';
            else if (tLower.includes('heel')) subCat = 'Heels';
            else if (tLower.includes('slider') || tLower.includes('slipper') || tLower.includes('flip')) subCat = 'Sliders';
            else if (tLower.includes('loafer')) subCat = 'Loafers';
          } else if (sf.catSlug === 'electronics') {
            if (tLower.includes('earbud') || tLower.includes('airpod') || tLower.includes('tws')) subCat = 'Earbuds';
            else if (tLower.includes('watch') || tLower.includes('smartwatch')) subCat = 'Smartwatch';
            else if (tLower.includes('charger') || tLower.includes('adapter')) subCat = 'Charger';
            else if (tLower.includes('cable') || tLower.includes('wire') || tLower.includes('usb')) subCat = 'Cable';
            else if (tLower.includes('speaker') || tLower.includes('bluetooth speaker')) subCat = 'Speaker';
            else if (tLower.includes('headphone')) subCat = 'Headphones';
          }

          addProduct({
            title: t,
            categorySlug: sf.catSlug,
            subCategory: subCat,
            price: priceMatch ? parseFloat(priceMatch[1]) : 299,
            originalPrice: oldPriceMatch ? parseFloat(oldPriceMatch[1]) : 499,
            image: imgMatch[1].trim()
          });
        }
      }
    } catch (e) {}
  }
  console.log('After Saurav:', allProducts.length);

  console.log('2. Harvesting Santosh-Konappanavar categories & image variants...');
  const santoshFiles = [
    { file: 'sari.json', catSlug: 'women-ethnic', subCat: 'Saree' },
    { file: 'kurti.json', catSlug: 'women-ethnic', subCat: 'Kurti' },
    { file: 'men.json', catSlug: 'men', subCat: 'Shirt' },
    { file: 'jwellary.json', catSlug: 'jewellery', subCat: 'Necklace' },
    { file: 'electronic.json', catSlug: 'electronics', subCat: 'Earbuds' }
  ];

  for (const sf of santoshFiles) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/${sf.file}`);
      const data = await res.json();
      for (const item of data) {
        const title = item.Name || item.name || item.title;
        const pStr = (item.price || '').replace(/[^0-9.]/g, '');
        const origStr = (item.Main_price || '').replace(/[^0-9.]/g, '');
        const price = parseFloat(pStr) || 349;
        const origPrice = parseFloat(origStr) || Math.round(price * 1.4);

        const imgs = [item.img1, item.img2, item.img3, item.img4].filter(u => u && u.startsWith('http'));

        let subCat = sf.subCat;
        const tLower = (title || '').toLowerCase();
        if (sf.catSlug === 'women-ethnic') {
          if (tLower.includes('kurti') || tLower.includes('kurta')) subCat = 'Kurti';
          else if (tLower.includes('anarkali')) subCat = 'Anarkali';
          else if (tLower.includes('lehenga')) subCat = 'Lehenga';
          else if (tLower.includes('suit')) subCat = 'Salwar Suit';
          else subCat = 'Saree';
        } else if (sf.catSlug === 'men') {
          if (tLower.includes('t-shirt') || tLower.includes('tee') || tLower.includes('tshirt')) subCat = 'T-Shirt';
          else if (tLower.includes('jean')) subCat = 'Jeans';
          else if (tLower.includes('kurta')) subCat = 'Kurta';
          else if (tLower.includes('track')) subCat = 'Track Pants';
          else subCat = 'Shirt';
        } else if (sf.catSlug === 'jewellery') {
          if (tLower.includes('earring') || tLower.includes('jhumk')) subCat = 'Earrings';
          else if (tLower.includes('bangle') || tLower.includes('kada')) subCat = 'Bangles';
          else if (tLower.includes('choker')) subCat = 'Choker';
          else if (tLower.includes('ring')) subCat = 'Rings';
          else subCat = 'Necklace';
        } else if (sf.catSlug === 'electronics') {
          if (tLower.includes('earbud') || tLower.includes('airpod') || tLower.includes('tws')) subCat = 'Earbuds';
          else if (tLower.includes('watch') || tLower.includes('smartwatch')) subCat = 'Smartwatch';
          else if (tLower.includes('speaker')) subCat = 'Speaker';
          else if (tLower.includes('charger') || tLower.includes('cable')) subCat = 'Charger';
          else subCat = 'Phone Covers';
        }

        imgs.forEach((img, idx) => {
          const variantTitle = idx === 0 ? title : `${title} (${['Sky Blue', 'Teal Green', 'Royal Maroon', 'Coral Pink'][idx - 1] || 'Edition'})`;
          addProduct({
            title: variantTitle,
            categorySlug: sf.catSlug,
            subCategory: subCat,
            price: price + (idx * 15),
            originalPrice: origPrice + (idx * 25),
            image: img
          });
        });
      }
    } catch (e) {}
  }
  console.log('After Santosh:', allProducts.length);

  console.log('3. Harvesting Rshukla12...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json');
    const text = await res.text();
    const blocks = text.split(/\{\s*"id"\s*:/);
    for (let i = 1; i < blocks.length; i++) {
      const b = blocks[i];
      const titleMatch = b.match(/"title"\s*:\s*"([^"]+)"/);
      const catMatch = b.match(/"category"\s*:\s*"([^"]+)"/);
      const priceMatch = b.match(/"discounted_price"\s*:\s*([0-9.]+)/) || b.match(/"original_price"\s*:\s*([0-9.]+)/);
      const origPriceMatch = b.match(/"original_price"\s*:\s*([0-9.]+)/);
      const imgMatches = [...b.matchAll(/"(https:\/\/images\.meesho\.com\/[^"]+)"/g)].map(m => m[1]);

      if (titleMatch && imgMatches.length > 0) {
        const title = titleMatch[1].trim();
        const rawCat = catMatch ? catMatch[1] : '';
        let catSlug = 'women-ethnic';
        let subCat = 'Saree';

        if (rawCat === 'Sarees') {
          catSlug = 'women-ethnic';
          subCat = 'Saree';
        } else if (rawCat === 'Dresses') {
          catSlug = 'women-western';
          subCat = 'Dress';
        } else if (rawCat === 'Jewellery') {
          catSlug = 'jewellery';
          subCat = title.toLowerCase().includes('earring') ? 'Earrings' : 'Necklace';
        } else if (rawCat === 'Mens Top Were') {
          catSlug = 'men';
          subCat = title.toLowerCase().includes('t-shirt') ? 'T-Shirt' : 'Shirt';
        } else if (rawCat === 'Beauty and health') {
          catSlug = 'beauty-health';
          subCat = 'Lipstick';
        } else if (rawCat === 'Bags and Footwear') {
          catSlug = 'footwear';
          subCat = 'Flats';
        } else if (rawCat === 'Home and Kitchen') {
          catSlug = 'home-kitchen';
          subCat = 'Bedsheet';
        }

        const price = priceMatch ? parseFloat(priceMatch[1]) : 399;
        const origPrice = origPriceMatch ? parseFloat(origPriceMatch[1]) : 599;

        imgMatches.forEach((img, idx) => {
          addProduct({
            title: idx === 0 ? title : `${title} - Style ${idx + 1}`,
            categorySlug: catSlug,
            subCategory: subCat,
            price: price + (idx * 20),
            originalPrice: origPrice + (idx * 30),
            image: img
          });
        });
      }
    }
  } catch (e) {}
  console.log('After Rshukla:', allProducts.length);

  console.log('4. Harvesting palabhi017...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/palabhi017/Demo-Me/master/db.json');
    const data = await res.json();
    for (const item of (data.products || [])) {
      const title = item.title;
      const imgs = [item.image, item.image2].filter(u => u && u.startsWith('http'));
      imgs.forEach((img, idx) => {
        const tLower = (title || '').toLowerCase();
        let catSlug = 'women-ethnic';
        let subCat = 'Saree';
        if (tLower.includes('tshirt') || tLower.includes('t-shirt') || tLower.includes('shirt') || tLower.includes('men')) {
          catSlug = 'men';
          subCat = tLower.includes('shirt') ? 'Shirt' : 'T-Shirt';
        } else if (tLower.includes('kurti')) {
          catSlug = 'women-ethnic';
          subCat = 'Kurti';
        } else if (tLower.includes('dress') || tLower.includes('top')) {
          catSlug = 'women-western';
          subCat = 'Dress';
        }
        addProduct({
          title: idx === 0 ? title : `${title} - Variant ${idx + 1}`,
          categorySlug: catSlug,
          subCategory: subCat,
          price: parseFloat(item.price) || 299,
          originalPrice: Math.round((parseFloat(item.price) || 299) * 1.5),
          image: img
        });
      });
    }
  } catch (e) {}
  console.log('After palabhi017:', allProducts.length);

  console.log('5. Harvesting madhurn29...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/product.json');
    const data = await res.json();
    for (const d of data) {
      const img = d.src || d.images;
      const title = (d.name || d.title || '').replace(/&amp;/g, '&');
      if (img && title) {
        let catSlug = 'women-western';
        let subCat = 'Dress';
        const tLower = title.toLowerCase();
        if (tLower.includes('saree')) { catSlug = 'women-ethnic'; subCat = 'Saree'; }
        else if (tLower.includes('kurti')) { catSlug = 'women-ethnic'; subCat = 'Kurti'; }
        else if (tLower.includes('shirt')) { catSlug = 'men'; subCat = 'Shirt'; }
        else if (tLower.includes('jewel') || tLower.includes('earring')) { catSlug = 'jewellery'; subCat = 'Earrings'; }
        else if (tLower.includes('shoe') || tLower.includes('flat')) { catSlug = 'footwear'; subCat = 'Flats'; }
        addProduct({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price: parseFloat(d.price) || 299,
          originalPrice: Math.round((parseFloat(d.price) || 299) * 1.5),
          image: img
        });
      }
    }
  } catch (e) {}
  console.log('After madhurn29:', allProducts.length);

  console.log('6. Harvesting Ashok kids...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/AshokPrjapati/Meesho-clone/main/db.json');
    const data = await res.json();
    for (const k of ['kids_dresses', 'kids_rampers']) {
      for (const d of (data[k] || [])) {
        const img = d.image || d.images;
        if (img && (d.title || d.name)) {
          addProduct({
            title: d.title || d.name,
            categorySlug: 'kids',
            subCategory: k === 'kids_rampers' ? 'Infant Romper' : 'Frock',
            price: parseFloat(d.price) || 249,
            originalPrice: Math.round((d.price || 249) * 1.5),
            image: img
          });
        }
      }
    }
  } catch (e) {}
  console.log('After Ashok kids:', allProducts.length);

  console.log('7. Harvesting GovindPullagura...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/GovindPullagura/Meesho.com-clone/main/indi_shop/db.json');
    const data = await res.json();
    for (const d of (data.men || [])) {
      if (d.image) {
        addProduct({
          title: d.description || `${d.brand} Men's ${d.category}`,
          categorySlug: 'men',
          subCategory: 'T-Shirt',
          price: d.price || 299,
          originalPrice: Math.round((d.price || 299) * 1.5),
          image: d.image
        });
      }
    }
    for (const d of (data.women || [])) {
      if (d.image) {
        addProduct({
          title: d.description || `${d.brand} Women's ${d.category}`,
          categorySlug: 'women-western',
          subCategory: 'Top',
          price: d.price || 299,
          originalPrice: Math.round((d.price || 299) * 1.5),
          image: d.image
        });
      }
    }
  } catch (e) {}
  console.log('After Govind:', allProducts.length);

  console.log(`\nTOTAL UNIQUE HARVESTED: ${allProducts.length}`);
  return allProducts;
}

async function seed() {
  console.log('--- STARTING 1000 PRODUCT MEESHO SEED ---');

  // 1. Ensure Categories exist in DB
  for (const cat of CATEGORIES_DATA) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name }
    });
  }
  console.log('Categories synced.');

  // 2. Ensure Verified Customer Profiles exist
  for (const p of CUSTOMER_PROFILES) {
    await prisma.profile.upsert({
      where: { id: p.id },
      update: { fullName: p.fullName, email: p.email, phone: p.phone, role: 'CUSTOMER' },
      create: { id: p.id, fullName: p.fullName, email: p.email, phone: p.phone, role: 'CUSTOMER' }
    });
  }
  console.log('15 Customer profiles verified.');

  // 3. Harvest raw catalog
  const rawCatalog = await collectAllProducts();

  // Group by category
  const catBuckets = {};
  for (const c of CATEGORIES_DATA) {
    catBuckets[c.slug] = [];
  }
  for (const p of rawCatalog) {
    if (catBuckets[p.categorySlug]) {
      catBuckets[p.categorySlug].push(p);
    }
  }

  console.log('Bucket sizes:');
  for (const c of CATEGORIES_DATA) {
    console.log(`- ${c.slug}: ${catBuckets[c.slug].length}`);
  }

  // Interleave across categories in round-robin order to guarantee even distribution
  const final1000 = [];
  let round = 0;
  while (final1000.length < 1000) {
    let addedThisRound = 0;
    for (const c of CATEGORIES_DATA) {
      if (final1000.length >= 1000) break;
      const bucket = catBuckets[c.slug];
      if (bucket && bucket.length > 0) {
        const item = bucket.shift();
        final1000.push(item);
        addedThisRound++;
      }
    }
    // If all buckets ran dry before 1000 (unlikely with 1337 items), break
    if (addedThisRound === 0) break;
    round++;
  }

  console.log(`\nSelected exactly ${final1000.length} products for DB insertion!`);

  // Verify unique images count
  const uniqueImgs = new Set(final1000.map(p => p.images[0]));
  console.log(`Unique images count: ${uniqueImgs.size} (Must be exactly ${final1000.length})`);
  if (uniqueImgs.size !== final1000.length) {
    throw new Error('Duplicate images found in final selection!');
  }

  // 4. Clean old products and reviews
  console.log('Cleaning existing products and reviews...');
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('Cleaned old table rows.');

  // 5. Insert Products in batches of 100
  console.log('Inserting 1000 unique products with staggered timestamps...');
  const baseTime = Date.now();
  const insertedProducts = [];

  for (let i = 0; i < final1000.length; i += 100) {
    const chunk = final1000.slice(i, i + 100);
    const created = await Promise.all(
      chunk.map((p, idx) => {
        const itemIndex = i + idx;
        const staggeredDate = new Date(baseTime - (itemIndex * 60 * 1000)); // Every item 1 min earlier
        return prisma.product.create({
          data: {
            title: p.title,
            categorySlug: p.categorySlug,
            subCategory: p.subCategory,
            price: p.price,
            originalPrice: p.originalPrice,
            discountPercentage: p.discountPercentage,
            images: p.images,
            sizes: p.sizes,
            stock: p.stock,
            isFreeDelivery: true,
            supplierName: p.supplierName,
            createdAt: staggeredDate,
            updatedAt: staggeredDate,
            rating: 0, // will be updated from real reviews
            reviewsCount: 0
          }
        });
      })
    );
    insertedProducts.push(...created);
    console.log(`Inserted ${insertedProducts.length}/1000 products...`);
  }

  // 6. Generate Reviews and update product ratings
  console.log('\nSeeding 2-4 verified customer reviews for each product...');
  const allReviewsToInsert = [];
  const productRatingUpdates = [];

  for (let i = 0; i < insertedProducts.length; i++) {
    const prod = insertedProducts[i];
    // Pick 2 or 3 distinct reviewers from CUSTOMER_PROFILES
    const numReviews = (i % 2 === 0) ? 3 : 2;
    const reviewerOffset = (i * 3) % CUSTOMER_PROFILES.length;

    let ratingSum = 0;
    const prodReviews = [];

    for (let r = 0; r < numReviews; r++) {
      const user = CUSTOMER_PROFILES[(reviewerOffset + r) % CUSTOMER_PROFILES.length];
      const template = REVIEW_TEMPLATES[(i + r) % REVIEW_TEMPLATES.length];

      prodReviews.push({
        userId: user.id,
        productId: prod.id,
        rating: template.rating,
        title: template.title,
        comment: template.comment,
        images: []
      });
      ratingSum += template.rating;
    }

    allReviewsToInsert.push(...prodReviews);

    const avgRating = parseFloat((ratingSum / numReviews).toFixed(1));
    productRatingUpdates.push({
      id: prod.id,
      rating: avgRating,
      reviewsCount: numReviews
    });
  }

  // Batch insert reviews in chunks of 200
  console.log(`Inserting ${allReviewsToInsert.length} verified reviews...`);
  for (let i = 0; i < allReviewsToInsert.length; i += 200) {
    const chunk = allReviewsToInsert.slice(i, i + 200);
    await prisma.review.createMany({
      data: chunk
    });
  }
  console.log('Reviews inserted successfully.');

  // Update products with exact rating and reviewsCount
  console.log('Updating products with calculated ratings and review counts...');
  for (let i = 0; i < productRatingUpdates.length; i += 50) {
    const chunk = productRatingUpdates.slice(i, i + 50);
    await Promise.all(
      chunk.map(u =>
        prisma.product.update({
          where: { id: u.id },
          data: {
            rating: u.rating,
            reviewsCount: u.reviewsCount
          }
        })
      )
    );
  }
  console.log('All product ratings and review counts synchronized!');

  // 7. Flush Redis cache
  if (redisClient?.isOpen) {
    try {
      await redisClient.flushAll();
      console.log('Redis cache flushed successfully!');
    } catch (e) {
      console.warn('Redis flush error:', e.message);
    }
  }

  console.log('\n🎉 ALL DONE! 1000 unique products seeded with 1000 unique images and verified reviews!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal Seed Error:', err);
  process.exit(1);
});

