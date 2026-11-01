async function searchMyntraCatalog() {
  console.log('Fetching Myntra db.json...');
  const res = await fetch('https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json');
  const data = await res.json();
  const bp = data.beautyproduct || [];
  console.log(`beautyproduct has ${bp.length} items`);

  // Let's inspect unique product types / categories in beautyproduct
  const types = {};
  for (const item of bp) {
    const href = item.imagehref || '';
    // Extract category from href like /face-wash/ or /lipstick/ or /perfume-and-body-mist/
    const m = href.match(/myntassets\.com\/.*\/assets\/images\/.*-(.*)-1\.jpg/) || href.match(/images\/\d+\/\d+\/\d+\/[a-f0-9-]+([A-Za-z0-9]+)1\.jpg/);
    const title = item.title || item.product || '';
    // Let's classify by title keywords
    const t = title.toLowerCase();
    let cat = 'Other';
    if (t.includes('lipstick') || t.includes('lip color') || t.includes('lip gloss') || t.includes('lip crayon')) cat = 'Lipstick';
    else if (t.includes('face wash') || t.includes('cleanser') || t.includes('cleansing')) cat = 'Face Wash';
    else if (t.includes('serum') || t.includes('essence') || t.includes('facial oil')) cat = 'Serum';
    else if (t.includes('sunscreen') || t.includes('sun block') || t.includes('spf')) cat = 'Sunscreen';
    else if (t.includes('perfume') || t.includes('edp') || t.includes('edt') || t.includes('eau de') || t.includes('cologne') || t.includes('deodorant') || t.includes('body spray') || t.includes('deo')) cat = 'Perfume';
    else if (t.includes('lotion') || t.includes('body butter') || t.includes('moisturizer') || t.includes('moisturiser') || t.includes('cream')) cat = 'Body Lotion';
    else if (t.includes('kajal') || t.includes('eyeliner') || t.includes('kohl') || t.includes('mascara') || t.includes('eye liner')) cat = 'Kajal';
    else if (t.includes('shampoo') || t.includes('conditioner') || t.includes('hair oil')) cat = 'Haircare';

    types[cat] = (types[cat] || 0) + 1;
  }
  console.log('Breakdown of beautyproduct items:', types);
}

searchMyntraCatalog().catch(console.error);

