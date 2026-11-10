async function inspectAmanastel() {
  const categories = [
    'BagsFootwear.js',
    'BeautyHealth.js',
    'Electronic.js',
    'HomeAndKitchen.js',
    'JewelleryAccessories.js',
    'Kids.js',
    'Men.js',
    'WomenEthnic.js',
    'WomenWestern.js'
  ];

  for (const f of categories) {
    try {
      const u = `https://raw.githubusercontent.com/Amanastel/Meesho-Clone/main/scripts/data/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        const imgs = [...new Set([...text.matchAll(/https:\/\/images\.meesho\.com\/[^\s"'<>)]+/g)].map(m => m[0]))];
        console.log(`[Amanastel ${f}]: ${text.length} chars, ${imgs.length} unique images`);
      }
    } catch(e) {}
  }
}

inspectAmanastel().catch(console.error);

