async function parseRshukla() {
  const url = 'https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json';
  const res = await fetch(url);
  const text = await res.text();

  // Match each product block
  const blocks = text.split(/\{\s*"id"\s*:/);
  console.log('Total blocks in Rshukla:', blocks.length - 1);

  const items = [];
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const titleMatch = b.match(/"title"\s*:\s*"([^"]+)"/);
    const catMatch = b.match(/"category"\s*:\s*"([^"]+)"/);
    const priceMatch = b.match(/"discounted_price"\s*:\s*([0-9.]+)/) || b.match(/"original_price"\s*:\s*([0-9.]+)/);
    const origPriceMatch = b.match(/"original_price"\s*:\s*([0-9.]+)/);
    const imgMatches = [...b.matchAll(/"(https:\/\/images\.meesho\.com\/[^"]+)"/g)];

    if (titleMatch && imgMatches.length > 0) {
      items.push({
        title: titleMatch[1],
        category: catMatch ? catMatch[1] : 'Sarees',
        price: priceMatch ? parseFloat(priceMatch[1]) : 399,
        originalPrice: origPriceMatch ? parseFloat(origPriceMatch[1]) : 599,
        images: imgMatches.map(m => m[1])
      });
    }
  }

  console.log('Parsed valid Rshukla products:', items.length);
  const catCounts = {};
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }
  console.log('Categories in Rshukla:', catCounts);
}

parseRshukla();

