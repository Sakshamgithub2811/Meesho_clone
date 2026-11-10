async function countAllAvailable() {
  const allImages = new Set();
  const allProducts = [];

  // 1. Saurav
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
          const img = imgMatch[1].trim();
          if (!allImages.has(img)) {
            allImages.add(img);
            allProducts.push({
              title: nameMatch[1].trim(),
              categorySlug: sf.catSlug,
              subCategory: sf.defaultSubcat,
              price: priceMatch ? parseFloat(priceMatch[1]) : 299,
              originalPrice: oldPriceMatch ? parseFloat(oldPriceMatch[1]) : 499,
              rating: ratingMatch ? parseFloat(ratingMatch[1]) : 4.2,
              image: img
            });
          }
        }
      }
    } catch(e) {}
  }
  console.log('After Saurav:', allProducts.length);

  // 2. Santosh (Include all individual unique photo variants as standalone unique product listings)
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
        const rStr = (item.Rating || '').replace(/[^0-9.]/g, '');
        const price = parseFloat(pStr) || 349;
        const origPrice = parseFloat(origStr) || Math.round(price * 1.4);
        const rating = parseFloat(rStr) || 4.1;

        const imgs = [item.img1, item.img2, item.img3, item.img4].filter(u => u && u.startsWith('http'));

        // Let's create entries for each distinct photo variant!
        imgs.forEach((img, idx) => {
          if (!allImages.has(img)) {
            allImages.add(img);
            const variantTitle = idx === 0 ? title : `${title} - Style Edition ${idx + 1}`;
            allProducts.push({
              title: variantTitle,
              categorySlug: sf.catSlug,
              subCategory: sf.subCat,
              price: price + (idx * 20),
              originalPrice: origPrice + (idx * 30),
              rating: Math.min(5, Math.max(3.8, rating + (idx * 0.1))),
              image: img
            });
          }
        });
      }
    } catch(e) {}
  }
  console.log('After Santosh (with all unique photo variants):', allProducts.length);

  // 3. Rshukla (Include all unique image variants as well)
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
          if (!allImages.has(img)) {
            allImages.add(img);
            allProducts.push({
              title: idx === 0 ? title : `${title} - Trend Edition ${idx + 1}`,
              categorySlug: catSlug,
              subCategory: subCat,
              price: price + (idx * 15),
              originalPrice: origPrice + (idx * 20),
              rating: 4.2,
              image: img
            });
          }
        });
      }
    }
  } catch(e) {}
  console.log('After Rshukla:', allProducts.length);

  // 4. palabhi017
  try {
    const res = await fetch('https://raw.githubusercontent.com/palabhi017/Demo-Me/master/db.json');
    const data = await res.json();
    for (const item of (data.products || [])) {
      const title = item.title;
      const imgs = [item.image, item.image2].filter(u => u && u.startsWith('http'));
      imgs.forEach((img, idx) => {
        if (!allImages.has(img)) {
          allImages.add(img);
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
          allProducts.push({
            title: idx === 0 ? title : `${title} - Classic View ${idx + 1}`,
            categorySlug: catSlug,
            subCategory: subCat,
            price: parseFloat(item.price) || 299,
            originalPrice: Math.round((parseFloat(item.price) || 299) * 1.5),
            rating: parseFloat(item.rating) || 4.1,
            image: img
          });
        }
      });
    }
  } catch(e) {}
  console.log('After palabhi017:', allProducts.length);

  // 5. madhurn29
  try {
    const res = await fetch('https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/product.json');
    const data = await res.json();
    for (const d of data) {
      const img = d.src || d.images;
      const title = (d.name || d.title || '').replace(/&amp;/g, '&');
      if (img && title && !allImages.has(img)) {
        allImages.add(img);
        let catSlug = 'women-western';
        let subCat = 'Dress';
        const tLower = title.toLowerCase();
        if (tLower.includes('saree')) { catSlug = 'women-ethnic'; subCat = 'Saree'; }
        else if (tLower.includes('kurti')) { catSlug = 'women-ethnic'; subCat = 'Kurti'; }
        else if (tLower.includes('shirt')) { catSlug = 'men'; subCat = 'Shirt'; }
        else if (tLower.includes('jewel') || tLower.includes('earring')) { catSlug = 'jewellery'; subCat = 'Earrings'; }
        else if (tLower.includes('shoe') || tLower.includes('flat')) { catSlug = 'footwear'; subCat = 'Flats'; }
        allProducts.push({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price: parseFloat(d.price) || 299,
          originalPrice: Math.round((parseFloat(d.price) || 299) * 1.5),
          rating: parseFloat(d.rating) || 4.2,
          image: img
        });
      }
    }
  } catch(e) {}
  console.log('After madhurn29:', allProducts.length);

  // 6. AshokPrjapati kids
  try {
    const res = await fetch('https://raw.githubusercontent.com/AshokPrjapati/Meesho-clone/main/db.json');
    const data = await res.json();
    for (const k of ['kids_dresses', 'kids_rampers']) {
      for (const d of (data[k] || [])) {
        const img = d.image || d.images;
        if (img && !allImages.has(img)) {
          allImages.add(img);
          allProducts.push({
            title: d.title || d.name,
            categorySlug: 'kids',
            subCategory: k === 'kids_rampers' ? 'Infant Romper' : 'Frock',
            price: parseFloat(d.price) || 249,
            originalPrice: Math.round((d.price || 249) * 1.5),
            rating: 4.3,
            image: img
          });
        }
      }
    }
  } catch(e) {}
  console.log('After Ashok:', allProducts.length);

  // 7. GovindPullagura (Myntra live products)
  try {
    const res = await fetch('https://raw.githubusercontent.com/GovindPullagura/Meesho.com-clone/main/indi_shop/db.json');
    const data = await res.json();
    for (const d of (data.men || [])) {
      if (d.image && !allImages.has(d.image)) {
        allImages.add(d.image);
        allProducts.push({
          title: d.description || `${d.brand} Men's ${d.category}`,
          categorySlug: 'men',
          subCategory: 'T-Shirt',
          price: d.price || 299,
          originalPrice: Math.round((d.price || 299) * 1.5),
          rating: 4.2,
          image: d.image
        });
      }
    }
    for (const d of (data.women || [])) {
      if (d.image && !allImages.has(d.image)) {
        allImages.add(d.image);
        allProducts.push({
          title: d.description || `${d.brand} Women's ${d.category}`,
          categorySlug: 'women-western',
          subCategory: 'Top',
          price: d.price || 299,
          originalPrice: Math.round((d.price || 299) * 1.5),
          rating: 4.2,
          image: d.image
        });
      }
    }
  } catch(e) {}
  console.log('After Govind:', allProducts.length);

  console.log('\n========================================');
  console.log(`TOTAL UNIQUE PRODUCTS: ${allProducts.length}`);
  console.log(`TOTAL UNIQUE IMAGES: ${allImages.size}`);
  const catBreakdown = {};
  for (const p of allProducts) {
    catBreakdown[p.categorySlug] = (catBreakdown[p.categorySlug] || 0) + 1;
  }
  console.log('Category breakdown:', catBreakdown);
}

countAllAvailable();

