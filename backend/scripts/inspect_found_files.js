async function inspectFoundFiles() {
  const urls = [
    { name: 'AshokPrjapati meesho', url: 'https://raw.githubusercontent.com/AshokPrjapati/Meesho-clone/main/db.json' },
    { name: 'KeyurDiwan myntra', url: 'https://raw.githubusercontent.com/KeyurDiwan/myntra-clone/main/db.json' },
    { name: 'arghadipmanna flipkart plus', url: 'https://raw.githubusercontent.com/arghadipmanna101/Flipkart_Clone/main/plus/products.json' },
    { name: 'arghadipmanna flipkart cat', url: 'https://raw.githubusercontent.com/arghadipmanna101/Flipkart_Clone/main/js/categoryData.json' },
    { name: 'sijeeshmiziha flipkart constant', url: 'https://raw.githubusercontent.com/sijeeshmiziha/flipkart/main/server/constants/product.js' }
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u.url);
      if (res.ok) {
        const text = await res.text();
        console.log(`\n=== [${u.name}] (length: ${text.length}) ===`);
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            console.log(`Array of ${json.length} items`);
            console.log('Sample item:', json[0]);
          } else {
            console.log('Keys:', Object.keys(json).map(k => `${k} (${Array.isArray(json[k]) ? json[k].length : typeof json[k]})`));
          }
        } catch (e) {
          console.log('Not direct JSON, first 300 chars:', text.slice(0, 300));
        }
      }
    } catch(e) {}
  }
}

inspectFoundFiles().catch(console.error);

