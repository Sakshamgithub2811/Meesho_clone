import fs from 'fs';

async function harvestAllMeeshoProducts() {
  const sauravCategories = [
    { file: 'womenEthenic.js', catSlug: 'women-ethnic', defaultSubcat: 'Saree' },
    { file: 'womenWestern.js', catSlug: 'women-western', defaultSubcat: 'Dress' },
    { file: 'menproduct.js', catSlug: 'men', defaultSubcat: 'Shirt' },
    { file: 'kids.js', catSlug: 'kids', defaultSubcat: 'Toys' },
    { file: 'homeKitchen.js', catSlug: 'home-kitchen', defaultSubcat: 'Bedsheet' },
    { file: 'beautyandhealth.js', catSlug: 'beauty-health', defaultSubcat: 'Lipstick' },
    { file: 'jewellery.js', catSlug: 'jewellery', defaultSubcat: 'Necklace' },
    { file: 'bagFootware.js', catSlug: 'footwear', defaultSubcat: 'Flats' },
    { file: 'electronics.js', catSlug: 'electronics', defaultSubcat: 'Charger' }
  ];

  const harvested = [];
  const imageSet = new Set();

  // 1. Harvest from sauravsamui
  for (const c of sauravCategories) {
    try {
      const url = `https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/${c.file}`;
      const res = await fetch(url);
      const text = await res.text();
      const blocks = text.split(/\{\s*image_url\s*:/);

      for (let i = 1; i < blocks.length; i++) {
        const b = blocks[i];
        const imgMatch = b.match(/["']\s*(https:\/\/[^"'\s]+)\s*["']/);
        const nameMatch = b.match(/name\s*:\s*["']([^"']+)["']/);
        const priceMatch = b.match(/price\s*:\s*([0-9.]+)/);
        const oldPriceMatch = b.match(/oldprice\s*:\s*([0-9.]+)/);
        const ratingMatch = b.match(/rating\s*:\s*([0-9.]+)/);
        const detailsMatch = b.match(/details\s*:\s*\{([^}]+)\}/);

        if (imgMatch && nameMatch) {
          const imgUrl = imgMatch[1].trim();
          if (!imageSet.has(imgUrl)) {
            imageSet.add(imgUrl);
            const title = nameMatch[1].trim();
            const price = priceMatch ? parseFloat(priceMatch[1]) : 299;
            const oldPrice = oldPriceMatch ? parseFloat(oldPriceMatch[1]) : Math.round(price * 1.5);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.2;

            // Determine subcategory from title
            let subCat = c.defaultSubcat;
            const tLower = title.toLowerCase();
            if (c.catSlug === 'women-ethnic') {
              if (tLower.includes('saree')) subCat = 'Saree';
              else if (tLower.includes('kurti') || tLower.includes('kurta')) subCat = 'Kurti';
              else if (tLower.includes('anarkali')) subCat = 'Anarkali';
              else if (tLower.includes('lehenga')) subCat = 'Lehenga';
              else if (tLower.includes('suit') || tLower.includes('dress material')) subCat = 'Salwar Suit';
              else if (tLower.includes('dupatta')) subCat = 'Dupatta';
              else if (tLower.includes('gown')) subCat = 'Ethnic Gown';
            } else if (c.catSlug === 'women-western') {
              if (tLower.includes('dress')) subCat = 'Dress';
              else if (tLower.includes('top') || tLower.includes('tunic')) subCat = 'Top';
              else if (tLower.includes('jean') || tLower.includes('denim')) subCat = 'Jeans';
              else if (tLower.includes('skirt')) subCat = 'Skirt';
              else if (tLower.includes('jacket') || tLower.includes('shrug')) subCat = 'Jacket';
              else if (tLower.includes('jumpsuit')) subCat = 'Jumpsuit';
              else if (tLower.includes('t-shirt') || tLower.includes('tee')) subCat = 'T-Shirt';
              else if (tLower.includes('trouser') || tLower.includes('pant')) subCat = 'Trousers';
            } else if (c.catSlug === 'men') {
              if (tLower.includes('shirt')) subCat = 'Shirt';
              else if (tLower.includes('t-shirt') || tLower.includes('tee') || tLower.includes('tshirt')) subCat = 'T-Shirt';
              else if (tLower.includes('jean') || tLower.includes('denim')) subCat = 'Jeans';
              else if (tLower.includes('kurta')) subCat = 'Kurta';
              else if (tLower.includes('jacket') || tLower.includes('blazer')) subCat = 'Jacket';
              else if (tLower.includes('trouser') || tLower.includes('pant')) subCat = 'Trousers';
              else if (tLower.includes('track') || tLower.includes('jogger')) subCat = 'Track Pants';
            } else if (c.catSlug === 'kids') {
              if (tLower.includes('frock')) subCat = 'Frock';
              else if (tLower.includes('set') || tLower.includes('suit')) subCat = 'Boys Set';
              else if (tLower.includes('romper') || tLower.includes('baby')) subCat = 'Infant Romper';
              else if (tLower.includes('toy') || tLower.includes('bear') || tLower.includes('game')) subCat = 'Toys';
              else if (tLower.includes('dress')) subCat = 'Princess Dress';
            } else if (c.catSlug === 'home-kitchen') {
              if (tLower.includes('bedsheet')) subCat = 'Bedsheet';
              else if (tLower.includes('curtain')) subCat = 'Curtain';
              else if (tLower.includes('cushion')) subCat = 'Cushion';
              else if (tLower.includes('towel')) subCat = 'Bath Towel';
              else if (tLower.includes('clock')) subCat = 'Wall Clock';
              else if (tLower.includes('pan') || tLower.includes('cookware') || tLower.includes('kadai')) subCat = 'Cookware';
              else if (tLower.includes('bottle')) subCat = 'Water Bottle';
              else if (tLower.includes('decor') || tLower.includes('wall')) subCat = 'Wall Decor';
              else subCat = 'Kitchen Tools';
            } else if (c.catSlug === 'beauty-health') {
              if (tLower.includes('lipstick') || tLower.includes('lip')) subCat = 'Lipstick';
              else if (tLower.includes('serum')) subCat = 'Serum';
              else if (tLower.includes('face') || tLower.includes('wash') || tLower.includes('pack')) subCat = 'Face Wash';
              else if (tLower.includes('kajal') || tLower.includes('eye')) subCat = 'Kajal';
              else if (tLower.includes('perfume') || tLower.includes('scent')) subCat = 'Perfume';
              else if (tLower.includes('lotion') || tLower.includes('cream')) subCat = 'Body Lotion';
              else if (tLower.includes('hair') || tLower.includes('shampoo')) subCat = 'Shampoo';
              else subCat = 'Compact Powder';
            } else if (c.catSlug === 'jewellery') {
              if (tLower.includes('earring') || tLower.includes('jhumka')) subCat = 'Earrings';
              else if (tLower.includes('choker')) subCat = 'Choker';
              else if (tLower.includes('necklace') || tLower.includes('jewellery set') || tLower.includes('chain')) subCat = 'Necklace';
              else if (tLower.includes('bangle') || tLower.includes('kada')) subCat = 'Bangles';
              else if (tLower.includes('ring')) subCat = 'Rings';
              else if (tLower.includes('watch')) subCat = 'Women Watch';
              else if (tLower.includes('bracelet')) subCat = 'Bracelet';
              else if (tLower.includes('anklet') || tLower.includes('payal')) subCat = 'Anklet';
              else if (tLower.includes('mangalsutra')) subCat = 'Mangalsutra';
            } else if (c.catSlug === 'footwear') {
              if (tLower.includes('sneaker') || tLower.includes('running') || tLower.includes('shoe')) subCat = 'Sneakers';
              else if (tLower.includes('jutti') || tLower.includes('mojari')) subCat = 'Jutti';
              else if (tLower.includes('flat')) subCat = 'Flats';
              else if (tLower.includes('heel')) subCat = 'Heels';
              else if (tLower.includes('slider') || tLower.includes('slipper') || tLower.includes('flip')) subCat = 'Sliders';
              else if (tLower.includes('loafer')) subCat = 'Loafers';
              else subCat = 'Sandals';
            } else if (c.catSlug === 'electronics') {
              if (tLower.includes('earbud') || tLower.includes('airpod') || tLower.includes('tws')) subCat = 'Earbuds';
              else if (tLower.includes('watch') || tLower.includes('smartwatch')) subCat = 'Smartwatch';
              else if (tLower.includes('charger') || tLower.includes('adapter')) subCat = 'Charger';
              else if (tLower.includes('cable') || tLower.includes('wire') || tLower.includes('usb')) subCat = 'Cable';
              else if (tLower.includes('speaker') || tLower.includes('bluetooth speaker')) subCat = 'Speaker';
              else if (tLower.includes('headphone')) subCat = 'Headphones';
              else if (tLower.includes('neckband')) subCat = 'Neckband';
              else if (tLower.includes('power bank')) subCat = 'Power Bank';
              else subCat = 'Stand';
            }

            harvested.push({
              title,
              categorySlug: c.catSlug,
              subCategory: subCat,
              price,
              originalPrice: oldPrice,
              rating,
              image: imgUrl
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching', c.file, e.message);
    }
  }

  // 2. Harvest from madhurn29 product.json
  try {
    const res = await fetch('https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/product.json');
    const data = await res.json();
    for (const d of data) {
      const img = d.src || d.images;
      if (img && !imageSet.has(img)) {
        imageSet.add(img);
        const title = (d.name || d.title || '').replace(/&amp;/g, '&');
        const price = parseFloat(d.price) || 299;
        const oldPrice = Math.round(price * 1.6);
        const rating = parseFloat(d.rating) || 4.1;

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

        harvested.push({
          title,
          categorySlug: catSlug,
          subCategory: subCat,
          price,
          originalPrice: oldPrice,
          rating,
          image: img
        });
      }
    }
  } catch (e) {}

  // 3. Harvest from Ashok kids dresses and rampers
  try {
    const res = await fetch('https://raw.githubusercontent.com/AshokPrjapati/Meesho-clone/main/db.json');
    const data = await res.json();
    for (const k of ['kids_dresses', 'kids_rampers']) {
      for (const d of (data[k] || [])) {
        const img = d.image || d.images;
        if (img && !imageSet.has(img)) {
          imageSet.add(img);
          harvested.push({
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
  } catch (e) {}

  console.log(`\n🎉 Total unique products harvested: ${harvested.length}`);
  console.log(`Unique images: ${imageSet.size}`);
  const catBreakdown = {};
  for (const h of harvested) {
    catBreakdown[h.categorySlug] = (catBreakdown[h.categorySlug] || 0) + 1;
  }
  console.log('Breakdown by category:', catBreakdown);

  fs.writeFileSync('d:/Meesho/Meesho_clone/backend/scripts/meesho_real_products.json', JSON.stringify(harvested, null, 2));
}

harvestAllMeeshoProducts();

