async function run() {
  const sources = [
    'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/landingpageproduct.js',
    'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/menproduct.js',
    'https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/product.json',
    'https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/db.json',
    'https://raw.githubusercontent.com/AshokPrjapati/Meesho-clone/main/db.json'
  ];

  const allImages = new Set();
  const products = [];

  for (const s of sources) {
    try {
      const res = await fetch(s);
      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // try extracting with regex
        const matches = [...text.matchAll(/image(?:_url)?:\s*["'](https:\/\/[^"']+)["']/g)];
        for (const m of matches) {
          allImages.add(m[1]);
        }
      }

      if (data) {
        if (Array.isArray(data)) {
          for (const item of data) {
            const img = item.src || item.images || item.image || item.image_url;
            if (img && typeof img === 'string') allImages.add(img);
          }
        } else if (typeof data === 'object') {
          for (const k of Object.keys(data)) {
            if (Array.isArray(data[k])) {
              for (const item of data[k]) {
                const img = item.src || item.images || item.image || item.image_url;
                if (img && typeof img === 'string') allImages.add(img);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching', s, err.message);
    }
  }

  console.log('Total unique images gathered from real Meesho clones:', allImages.size);
  console.log('Sample images:', [...allImages].slice(0, 10));
}

run();

