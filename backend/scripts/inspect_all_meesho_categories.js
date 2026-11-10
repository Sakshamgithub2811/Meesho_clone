async function inspectAllCategories() {
  const catFiles = [
    { file: 'womenEthenic.js', catSlug: 'women-ethnic' },
    { file: 'womenWestern.js', catSlug: 'women-western' },
    { file: 'menproduct.js', catSlug: 'men' },
    { file: 'kids.js', catSlug: 'kids' },
    { file: 'homeKitchen.js', catSlug: 'home-kitchen' },
    { file: 'beautyandhealth.js', catSlug: 'beauty-health' },
    { file: 'jewellery.js', catSlug: 'jewellery' },
    { file: 'bagFootware.js', catSlug: 'footwear' },
    { file: 'electronics.js', catSlug: 'electronics' },
    { file: 'landingpageproduct.js', catSlug: 'landing' }
  ];

  let totalItems = 0;
  for (const c of catFiles) {
    const url = `https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/${c.file}`;
    const res = await fetch(url);
    const text = await res.text();
    const blocks = text.split(/\{\s*image_url\s*:/);
    const count = blocks.length - 1;
    totalItems += count;
    console.log(`${c.catSlug} (${c.file}): ${count} items`);
    if (count > 0) {
      const sample = blocks[1];
      const imgMatch = sample.match(/^["'](https:[^"']+)["']/);
      const nameMatch = sample.match(/name\s*:\s*["']([^"']+)["']/);
      console.log(`   Sample: "${nameMatch ? nameMatch[1] : 'N/A'}" -> ${imgMatch ? imgMatch[1] : 'N/A'}`);
    }
  }

  console.log(`\n🎉 Total real Meesho items from sauravsamui: ${totalItems}`);
}

inspectAllCategories();

