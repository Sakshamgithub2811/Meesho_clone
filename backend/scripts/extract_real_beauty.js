async function extractBeautyItems() {
  const u = 'https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json';
  const res = await fetch(u);
  const data = await res.json();
  const bp = data.beautyproduct || [];

  const subcats = {
    'Face Wash': [],
    'Serum': [],
    'Sunscreen': [],
    'Lipstick': [],
    'Kajal': [],
    'Perfume': [],
    'Body Lotion': []
  };

  for (const item of bp) {
    const title = `${item.brand || ''} ${item.product || ''}`.trim();
    const href = (item.imagehref || '').toLowerCase();
    const tLower = title.toLowerCase();
    const img = item.image;
    if (!img) continue;

    if ((href.includes('face-wash') || href.includes('cleanser') || tLower.includes('face wash') || tLower.includes('foaming cleanser')) && !href.includes('mouthwash') && !tLower.includes('tooth')) {
      if (subcats['Face Wash'].length < 15) {
        subcats['Face Wash'].push({ title, img, price: item.discountedPrice || 249 });
      }
    } else if (href.includes('serum') || tLower.includes('face serum') || tLower.includes('skin serum')) {
      if (subcats['Serum'].length < 15) {
        subcats['Serum'].push({ title, img, price: item.discountedPrice || 399 });
      }
    } else if (href.includes('sunscreen') || tLower.includes('sunscreen') || tLower.includes('sun block') || tLower.includes('spf')) {
      if (subcats['Sunscreen'].length < 15) {
        subcats['Sunscreen'].push({ title, img, price: item.discountedPrice || 349 });
      }
    } else if (href.includes('lipstick') || tLower.includes('lipstick') || tLower.includes('liquid lip')) {
      if (subcats['Lipstick'].length < 15) {
        subcats['Lipstick'].push({ title, img, price: item.discountedPrice || 299 });
      }
    } else if (href.includes('kajal') || tLower.includes('kajal') || tLower.includes('kohl') || href.includes('eyeliner') || tLower.includes('eyeliner')) {
      if (subcats['Kajal'].length < 15) {
        subcats['Kajal'].push({ title, img, price: item.discountedPrice || 199 });
      }
    } else if (href.includes('perfume') || href.includes('deodorant') || tLower.includes('eau de parfum') || tLower.includes('fragrance') || tLower.includes('body mist')) {
      if (subcats['Perfume'].length < 15) {
        subcats['Perfume'].push({ title, img, price: item.discountedPrice || 499 });
      }
    } else if (href.includes('lotion') || href.includes('moisturizer') || tLower.includes('body lotion') || tLower.includes('body butter')) {
      if (subcats['Body Lotion'].length < 15) {
        subcats['Body Lotion'].push({ title, img, price: item.discountedPrice || 279 });
      }
    }
  }

  console.log('Extracted Subcategories Counts:');
  for (const k of Object.keys(subcats)) {
    console.log(`- ${k}: ${subcats[k].length} items`);
    if (subcats[k].length > 0) {
      console.log(`    Sample: "${subcats[k][0].title}" -> ${subcats[k][0].img.slice(0, 70)}...`);
    }
  }
}

extractBeautyItems();

