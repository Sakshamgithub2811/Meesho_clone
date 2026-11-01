import fs from 'fs';

async function testCleanCatalogAssembly() {
  const masterFile = 'd:/Meesho/Meesho_clone/backend/scripts/meesho_master_catalog.json';
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8'));

  // Track unique product image and product ID
  const seenProductKeys = new Set();
  const catalogByCategory = {
    'women-ethnic': [],
    'women-western': [],
    'men': [],
    'kids': [],
    'home-kitchen': [],
    'beauty-health': [],
    'jewellery': [],
    'footwear': [],
    'electronics': []
  };

  function getProductKey(img) {
    if (!img) return null;
    const meeshoMatch = img.match(/images\/products\/(\d+)\//);
    if (meeshoMatch) return `meesho-${meeshoMatch[1]}`;
    const myntraMatch = img.match(/assets\/images\/(\d+)\//);
    if (myntraMatch) return `myntra-${myntraMatch[1]}`;
    // otherwise fallback to basename
    const parts = img.split('/');
    return parts[parts.length - 1].split('?')[0];
  }

  function tryAdd(item) {
    const img = (item.images && item.images[0]) || item.image;
    if (!img) return false;
    const key = getProductKey(img);
    if (!key || seenProductKeys.has(key)) return false;

    const cat = item.categorySlug;
    if (!catalogByCategory[cat]) return false;

    seenProductKeys.add(key);
    catalogByCategory[cat].push(item);
    return true;
  }

  // 1. First add from master catalog
  console.log(`Master catalog items: ${master.length}`);
  for (const m of master) {
    tryAdd(m);
  }
  console.log('After master catalog:');
  for (const [k, v] of Object.entries(catalogByCategory)) {
    console.log(`  ${k}: ${v.length}`);
  }

  // 2. Fetch Myntra catalog
  console.log('\nFetching Myntra catalog...');
  const mRes = await fetch('https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json');
  const myntra = await mRes.json();

  // Beauty from Myntra
  const beauty = myntra.beautyproduct || [];
  for (const b of beauty) {
    const title = b.title || b.product;
    const img = b.imagehref;
    if (!title || !img) continue;
    const t = title.toLowerCase();

    let sub = null;
    if (t.includes('lipstick') || t.includes('lip color') || t.includes('liquid lipstick')) sub = 'Lipstick';
    else if (t.includes('face wash') || t.includes('cleanser') || t.includes('foaming wash')) sub = 'Face Wash';
    else if (t.includes('serum') || t.includes('facial oil')) sub = 'Serum';
    else if (t.includes('sunscreen') || t.includes('sun block') || t.includes('spf')) sub = 'Sunscreen';
    else if (t.includes('perfume') || t.includes('edp') || t.includes('eau de parfum') || t.includes('deodorant')) sub = 'Perfume';
    else if (t.includes('lotion') || t.includes('body butter') || t.includes('moisturizer')) sub = 'Body Lotion';
    else if (t.includes('kajal') || t.includes('eyeliner') || t.includes('kohl')) sub = 'Kajal';

    if (sub) {
      tryAdd({
        title,
        categorySlug: 'beauty-health',
        subCategory: sub,
        price: b.price || 349,
        originalPrice: b.mrp || 599,
        image: img,
        images: [img]
      });
    }
  }

  console.log('\nAfter adding Myntra beauty products:');
  for (const [k, v] of Object.entries(catalogByCategory)) {
    console.log(`  ${k}: ${v.length}`);
  }
}

testCleanCatalogAssembly().catch(console.error);

