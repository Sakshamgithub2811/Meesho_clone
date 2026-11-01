async function checkSauravFiles() {
  const files = [
    'bagFootware.js',
    'electronics.js',
    'homeKitchen.js',
    'jewellery.js',
    'womenWestern.js'
  ];

  for (const f of files) {
    try {
      const u = `https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        const imgs = [...new Set([...text.matchAll(/https:\/\/images\.meesho\.com\/[^\s"'<>)]+/g)].map(m => m[0]))];
        const roots = new Set(imgs.map(img => {
          const m = img.match(/images\/products\/(\d+)\//);
          return m ? m[1] : img;
        }));
        console.log(`[Saurav ${f}]: length ${text.length}, unique images ${imgs.length}, unique product roots: ${roots.size}`);
      }
    } catch(e) {}
  }
}

checkSauravFiles().catch(console.error);

