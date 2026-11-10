import fs from 'fs';

async function harvestAll() {
  const products = [];
  const imageSet = new Set();
  const titleSet = new Set();

  function addProduct({ title, categorySlug, subCategory, price, originalPrice, rating, reviewsCount, images }) {
    if (!title || !categorySlug || !images || images.length === 0) return;
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length < 3) return;
    
    // Check main image uniqueness
    const mainImg = images[0];
    if (imageSet.has(mainImg)) return;
    
    // Also avoid exact duplicate titles
    if (titleSet.has(cleanTitle.toLowerCase())) return;

    imageSet.add(mainImg);
    titleSet.add(cleanTitle.toLowerCase());

    products.push({
      title: cleanTitle,
      categorySlug,
      subCategory: subCategory || 'General',
      price: Math.max(99, Math.round(price || 299)),
      originalPrice: Math.max(Math.round(price || 299) + 50, Math.round(originalPrice || (price ? price * 1.5 : 499))),
      rating: parseFloat((rating || (4.0 + Math.random() * 0.9)).toFixed(1)),
      reviewsCount: parseInt(reviewsCount) || Math.floor(Math.random() * 80) + 10,
      images
    });
  }

  console.log('--- 1. Fetching sauravsamui/meesho-clone ---');
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
        const ratingMatch = b.match(/rating\s*:\s*([0-9.]+)/);

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
            rating: ratingMatch ? parseFloat(ratingMatch[1]) : 4.2,
            images: [imgMatch[1].trim()]
          });
        }
      }
    } catch (e) {
      console.warn('saurav error:', e.message);
    }
  }
  console.log('After Saurav:', products.length);

  console.log('--- 2. Fetching Santosh-Konappanavar/meesho.com ---');
  const santoshFiles = [
    { file: 'sari.json', catSlug: 'women-ethnic', defaultSubcat: 'Saree' },
    { file: 'kurti.json', catSlug: 'women-ethnic', defaultSubcat: 'Kurti' },
    { file: 'men.json', catSlug: 'men', defaultSubcat: 'Shirt' },
    { file: 'jwellary.json', catSlug: 'jewellery', defaultSubcat: 'Necklace' },
    { file: 'electronic.json', catSlug: 'electronics', defaultSubcat: 'Earbuds' }
  ];

  for (const sf of santoshFiles) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/${sf.file}`);
      const data = await res.json();
      for (const item of data) {
        const title = item.Name || item.name || item.title;
        const pStr = (item.price || '').replace(/[^0-9.]/g, '');
        const origStr = (item.Main_price || '').replace(/[^0-9.]/g, '');
        const rStr = (item.Rating || '').replace(/[^0-9.]/g, '');
        const price = parseFloat(pStr) || 349;
        const origPrice = parseFloat(origStr) || Math.round(price * 1.4);
        const rating = parseFloat(rStr) || 4.1;

        const imgs = [item.img1, item.img2, item.img3, item.img4].filter(u => u && u.startsWith('http'));

        let subCat = sf.defaultSubcat;
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
          else subCat = 'Earbuds';
        }

        if (title && imgs.length > 0) {
          addProduct({
            title,
            categorySlug: sf.catSlug,
            subCategory: subCat,
            price,
            originalPrice: origPrice,
            rating,
            images: imgs
          });
        }
      }
    } catch (e) {
      console.warn('santosh error:', e.message);
    }
  }
  console.log('After Santosh:', products.length);

  console.log('--- 3. Fetching Rshukla12/Meesho ---');
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

        addProduct({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price: priceMatch ? parseFloat(priceMatch[1]) : 399,
          originalPrice: origPriceMatch ? parseFloat(origPriceMatch[1]) : 599,
          images: imgMatches
        });
      }
    }
  } catch (e) {
    console.warn('Rshukla error:', e.message);
  }
  console.log('After Rshukla:', products.length);

  console.log('--- 4. Fetching palabhi017/Demo-Me ---');
  try {
    const res = await fetch('https://raw.githubusercontent.com/palabhi017/Demo-Me/master/db.json');
    const data = await res.json();
    for (const item of (data.products || [])) {
      const title = item.title;
      const imgs = [item.image, item.image2].filter(u => u && u.startsWith('http'));
      if (title && imgs.length > 0) {
        const tLower = title.toLowerCase();
        let catSlug = 'women-ethnic';
        let subCat = 'Saree';

        if (tLower.includes('tshirt') || tLower.includes('t-shirt') || tLower.includes('shirt') || tLower.includes('men')) {
          catSlug = 'men';
          subCat = tLower.includes('shirt') ? 'Shirt' : 'T-Shirt';
        } else if (tLower.includes('kurti')) {
          catSlug = 'women-ethnic';
          subCat = 'Kurti';
        } else if (tLower.includes('saree') || tLower.includes('shapewear')) {
          catSlug = 'women-ethnic';
          subCat = 'Saree';
        } else if (tLower.includes('dress') || tLower.includes('top')) {
          catSlug = 'women-western';
          subCat = 'Dress';
        } else if (tLower.includes('earring') || tLower.includes('jewel')) {
          catSlug = 'jewellery';
          subCat = 'Earrings';
        } else if (tLower.includes('shoe') || tLower.includes('slipper') || tLower.includes('sandal')) {
          catSlug = 'footwear';
          subCat = 'Flats';
        }

        const price = parseFloat(item.price) || 299;
        const rating = parseFloat(item.rating) || 4.1;
        const reviewsCount = parseInt((item.reviews || '').replace(/[^0-9]/g, '')) || 45;

        addProduct({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price,
          originalPrice: Math.round(price * 1.45),
          rating,
          reviewsCount,
          images: imgs
        });
      }
    }
  } catch (e) {
    console.warn('palabhi error:', e.message);
  }
  console.log('After palabhi017:', products.length);

  console.log('--- 5. Fetching madhurn29/Meesho-clone ---');
  try {
    const res = await fetch('https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/product.json');
    const data = await res.json();
    for (const d of data) {
      const img = d.src || d.images;
      const title = (d.name || d.title || '').replace(/&amp;/g, '&');
      if (img && title) {
        const price = parseFloat(d.price) || 299;
        let catSlug = 'women-western';
        let subCat = 'Dress';
        const tLower = title.toLowerCase();
        if (tLower.includes('saree')) { catSlug = 'women-ethnic'; subCat = 'Saree'; }
        else if (tLower.includes('kurti')) { catSlug = 'women-ethnic'; subCat = 'Kurti'; }
        else if (tLower.includes('suit') || tLower.includes('ethnic')) { catSlug = 'women-ethnic'; subCat = 'Salwar Suit'; }
        else if (tLower.includes('dress')) { catSlug = 'women-western'; subCat = 'Dress'; }
        else if (tLower.includes('top') || tLower.includes('tunic')) { catSlug = 'women-western'; subCat = 'Top'; }
        else if (tLower.includes('shirt')) { catSlug = 'men'; subCat = 'Shirt'; }
        else if (tLower.includes('tshirt') || tLower.includes('t-shirt')) { catSlug = 'men'; subCat = 'T-Shirt'; }
        else if (tLower.includes('shoe') || tLower.includes('flat') || tLower.includes('heel')) { catSlug = 'footwear'; subCat = 'Flats'; }
        else if (tLower.includes('jewel') || tLower.includes('earring')) { catSlug = 'jewellery'; subCat = 'Earrings'; }

        addProduct({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price,
          originalPrice: Math.round(price * 1.5),
          rating: parseFloat(d.rating) || 4.2,
          images: [img]
        });
      }
    }
  } catch (e) {
    console.warn('madhurn29 error:', e.message);
  }
  console.log('After madhurn29:', products.length);

  console.log('--- 6. Fetching AshokPrjapati/Meesho-clone kids ---');
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
            rating: 4.3,
            images: [img]
          });
        }
      }
    }
  } catch (e) {}
  console.log('After Ashok kids:', products.length);

  console.log('--- 7. Fetching darkwingpatil/MeeshoClone ---');
  try {
    const res = await fetch('https://raw.githubusercontent.com/darkwingpatil/MeeshoClone/main/clone/src/db.json');
    const data = await res.json();
    for (const item of (data.jeans || [])) {
      if (item.imgUrl) {
        addProduct({
          title: item.type || 'Embroidered Rayon Straight Kurti',
          categorySlug: 'women-ethnic',
          subCategory: 'Kurti',
          price: item.rate || 258,
          originalPrice: 358,
          rating: 4.2,
          images: [item.imgUrl]
        });
      }
    }
    for (const item of (data.mensTshirt || [])) {
      if (item.imgUrl) {
        addProduct({
          title: 'Comfortable Cotton Casual Men T-Shirt',
          categorySlug: 'men',
          subCategory: 'T-Shirt',
          price: item.rate || 258,
          originalPrice: 358,
          rating: 4.2,
          images: [item.imgUrl]
        });
      }
    }
  } catch (e) {}
  console.log('After darkwingpatil:', products.length);

  console.log('\n=======================================');
  console.log(`TOTAL UNIQUE PRODUCTS HARVESTED: ${products.length}`);
  console.log(`TOTAL UNIQUE IMAGES: ${imageSet.size}`);
  
  const catBreakdown = {};
  for (const p of products) {
    catBreakdown[p.categorySlug] = (catBreakdown[p.categorySlug] || 0) + 1;
  }
  console.log('Category breakdown:', catBreakdown);

  fs.writeFileSync('d:/Meesho/Meesho_clone/backend/scripts/meesho_master_catalog.json', JSON.stringify(products, null, 2));
  console.log('Saved to meesho_master_catalog.json!');
}

harvestAll().catch(console.error);

