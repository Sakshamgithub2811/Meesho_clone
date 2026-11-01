import fs from 'fs';

async function build1000UniqueCatalog() {
  const masterFile = 'd:/Meesho/Meesho_clone/backend/scripts/meesho_master_catalog.json';
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8'));

  const seenRoots = new Set();
  const catalog = [];

  function getRoot(img) {
    if (!img) return null;
    const mMatch = img.match(/images\/products\/(\d+)\//);
    if (mMatch) return `meesho-${mMatch[1]}`;
    const myMatch = img.match(/assets\/images\/(\d+)\//);
    if (myMatch) return `myntra-${myMatch[1]}`;
    return img.split('?')[0];
  }

  function addClean(item) {
    const img = (item.images && item.images[0]) || item.image;
    if (!img) return false;
    const root = getRoot(img);
    if (!root || seenRoots.has(root)) return false;

    seenRoots.add(root);
    catalog.push({
      title: item.title,
      categorySlug: item.categorySlug,
      subCategory: item.subCategory || 'Other',
      price: item.price || 399,
      originalPrice: item.originalPrice || Math.round((item.price || 399) * 1.4),
      rating: item.rating || 4.2,
      reviewsCount: item.reviewsCount || Math.floor(Math.random() * 50) + 10,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [img]
    });
    return true;
  }

  // 1. Add current unique DB items (the 732 unique physical products)
  const dotenv = await import('dotenv');
  const { pathToFileURL } = await import('url');
  dotenv.config({ path: 'd:/Meesho/Meesho_clone/backend/.env' });
  const prismaUrl = pathToFileURL('d:/Meesho/Meesho_clone/backend/src/config/prisma.js').href;
  const { default: prisma } = await import(prismaUrl);
  const currentDb = await prisma.product.findMany();
  console.log(`Current DB items: ${currentDb.length}`);

  let addedFromDb = 0;
  for (const p of currentDb) {
    if (addClean(p)) addedFromDb++;
  }
  console.log(`Added from current DB (unique roots): ${addedFromDb}`);

  // 2. Add extra items from Rshukla meesho
  console.log('Fetching Rshukla...');
  try {
    const rRes = await fetch('https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json');
    const rText = await rRes.text();
    const blocks = rText.split(/\{\s*"id"\s*:/);
    let addedR = 0;
    for (let i = 1; i < blocks.length; i++) {
      const b = blocks[i];
      const titleMatch = b.match(/"title"\s*:\s*"([^"]+)"/);
      const catMatch = b.match(/"category"\s*:\s*"([^"]+)"/);
      const imgMatch = b.match(/"(https:\/\/images\.meesho\.com\/[^"]+)"/);
      const pMatch = b.match(/"discounted_price"\s*:\s*([0-9.]+)/) || b.match(/"original_price"\s*:\s*([0-9.]+)/);
      if (titleMatch && imgMatch) {
        const title = titleMatch[1];
        const rawCat = catMatch ? catMatch[1] : '';
        let catSlug = 'women-ethnic';
        let subCat = 'Saree';
        if (rawCat.includes('Jewellery')) {
          catSlug = 'jewellery';
          subCat = title.toLowerCase().includes('earring') ? 'Earrings' : title.toLowerCase().includes('choker') ? 'Choker' : 'Necklace';
        } else if (rawCat.includes('Dresses')) {
          catSlug = 'women-western';
          subCat = 'Dress';
        } else if (rawCat.includes('Mens')) {
          catSlug = 'men';
          subCat = 'Shirt';
        } else if (rawCat.includes('Footwear')) {
          catSlug = 'footwear';
          subCat = 'Flats';
        } else if (rawCat.includes('Home')) {
          catSlug = 'home-kitchen';
          subCat = 'Bedsheet';
        }
        if (addClean({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price: pMatch ? parseFloat(pMatch[1]) : 399,
          originalPrice: Math.round((pMatch ? parseFloat(pMatch[1]) : 399) * 1.4),
          image: imgMatch[1],
          images: [imgMatch[1]]
        })) {
          addedR++;
        }
      }
    }
    console.log(`Added from Rshukla: ${addedR}`);
  } catch(e) {
    console.log('Rshukla error:', e.message);
  }

  // 3. Add extra items from Myntra
  console.log('Fetching Myntra...');
  const mRes = await fetch('https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json');
  const myntra = await mRes.json();

  let addedBeauty = 0;
  for (const b of (myntra.beautyproduct || [])) {
    const title = b.product || b.title;
    const img = b.image;
    const href = b.imagehref || '';
    if (!title || !img || !img.startsWith('http')) continue;
    const t = (title + ' ' + href).toLowerCase();

    let subCat = null;
    if (t.includes('face-wash') || t.includes('face wash')) subCat = 'Face Wash';
    else if (t.includes('lipstick')) subCat = 'Lipstick';
    else if (t.includes('serum')) subCat = 'Serum';
    else if (t.includes('sunscreen')) subCat = 'Sunscreen';
    else if (t.includes('perfume') || t.includes('deodorant')) subCat = 'Perfume';
    else if (t.includes('body-lotion') || t.includes('body lotion')) subCat = 'Body Lotion';
    else if (t.includes('kajal') || t.includes('eyeliner')) subCat = 'Kajal';

    if (subCat) {
      if (addClean({
        title: `${b.brand ? b.brand + ' ' : ''}${title}`,
        categorySlug: 'beauty-health',
        subCategory: subCat,
        price: parseFloat(b.discountedPrice) || 299,
        originalPrice: parseFloat(b.strike) || 499,
        image: img,
        images: [img]
      })) {
        addedBeauty++;
      }
    }
  }
  console.log(`Added from Myntra Beauty: ${addedBeauty}`);

  // 4. Add extra items from Myntra Mens & Kids & Womens
  let addedMen = 0;
  for (const m of (myntra.mens || [])) {
    const title = m.handle || m.title;
    const img = m.images?.[0];
    if (!title || !img || !img.startsWith('http')) continue;
    const t = (title + ' ' + (m.type || '')).toLowerCase();
    let subCat = 'Shirt';
    if (t.includes('t-shirt') || t.includes('tee')) subCat = 'T-Shirt';
    else if (t.includes('jogger') || t.includes('track')) subCat = 'Track Pants';

    if (addClean({
      title: `${m.title} ${m.handle}`.replace(/\s+/g, ' ').trim(),
      categorySlug: 'men',
      subCategory: subCat,
      price: parseFloat(m.price_min) || 499,
      originalPrice: parseFloat(m.price) || 899,
      image: img,
      images: m.images.slice(0, 4)
    })) {
      addedMen++;
    }
  }
  console.log(`Added from Myntra Men: ${addedMen}`);

  let addedKids = 0;
  for (const k of (myntra.kids || [])) {
    const title = k.handle || k.title;
    const img = k.images?.[0];
    if (!title || !img || !img.startsWith('http')) continue;
    const t = (title + ' ' + (k.type || '')).toLowerCase();
    let subCat = 'Toys';
    if (t.includes('romper') || t.includes('infant')) subCat = 'Infant Romper';
    else if (t.includes('set') || t.includes('suit') || t.includes('track')) subCat = 'Boys Set';

    if (addClean({
      title: `${k.title} ${k.handle}`.replace(/\s+/g, ' ').trim(),
      categorySlug: 'kids',
      subCategory: subCat,
      price: parseFloat(k.price_min) || 399,
      originalPrice: parseFloat(k.price) || 699,
      image: img,
      images: k.images.slice(0, 4)
    })) {
      addedKids++;
    }
  }
  console.log(`Added from Myntra Kids: ${addedKids}`);

  console.log(`\n========================================`);
  console.log(`TOTAL 100% UNIQUE PRODUCTS: ${catalog.length}`);
  console.log(`TOTAL UNIQUE ROOTS (NO ANGLE REPEATS): ${seenRoots.size}`);
  console.log(`========================================`);

  const catCounts = {};
  for (const c of catalog) {
    if (!catCounts[c.categorySlug]) catCounts[c.categorySlug] = {};
    catCounts[c.categorySlug][c.subCategory] = (catCounts[c.categorySlug][c.subCategory] || 0) + 1;
  }
  console.log('\nCatalog distribution:');
  console.log(JSON.stringify(catCounts, null, 2));

  process.exit(0);
}

build1000UniqueCatalog().catch(console.error);
