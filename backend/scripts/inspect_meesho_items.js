async function inspect() {
  const sources = [
    { url: 'https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/product.json', type: 'json' },
    { url: 'https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/db.json', type: 'db' },
    { url: 'https://raw.githubusercontent.com/AshokPrjapati/Meesho-clone/main/db.json', type: 'ashok' }
  ];

  const items = [];

  for (const s of sources) {
    const res = await fetch(s.url);
    const data = await res.json();
    if (s.type === 'json') {
      for (const d of data) {
        items.push({
          title: d.name || d.title,
          price: d.price,
          image: d.src || d.images,
          source: 'product.json'
        });
      }
    } else if (s.type === 'db') {
      for (const d of (data.women || [])) {
        items.push({
          title: d.title,
          price: d.price,
          image: d.images,
          source: 'db.json'
        });
      }
    } else if (s.type === 'ashok') {
      for (const k of ['Beauty & Health', 'products', 'kids_dresses', 'kids_rampers']) {
        for (const d of (data[k] || [])) {
          items.push({
            title: d.title || d.name,
            price: d.price,
            image: d.image || d.images,
            category: k,
            source: 'ashok'
          });
        }
      }
    }
  }

  console.log('Total items gathered:', items.length);
  console.log('Sample item:', items[0]);
  console.log('Sample kids:', items.find(i => i.category === 'kids_dresses'));
  console.log('Sample beauty:', items.find(i => i.category === 'Beauty & Health'));
}

inspect();

