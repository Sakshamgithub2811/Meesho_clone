async function parseSaurav() {
  const sources = [
    'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/landingpageproduct.js',
    'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/menproduct.js'
  ];

  const items = [];

  for (const s of sources) {
    const res = await fetch(s);
    const text = await res.text();
    // Parse object blocks
    const blocks = text.split(/\{\s*image_url\s*:/);
    for (let i = 1; i < blocks.length; i++) {
      const b = blocks[i];
      const imgMatch = b.match(/^["'](https:[^"']+)["']/);
      const nameMatch = b.match(/name\s*:\s*["']([^"']+)["']/);
      const priceMatch = b.match(/price\s*:\s*([0-9.]+)/);
      const ratingMatch = b.match(/rating\s*:\s*([0-9.]+)/);

      if (imgMatch && nameMatch) {
        items.push({
          title: nameMatch[1],
          price: priceMatch ? priceMatch[1] : 299,
          rating: ratingMatch ? ratingMatch[1] : 4.2,
          image: imgMatch[1],
          source: s.includes('men') ? 'men' : 'landing'
        });
      }
    }
  }

  console.log('Parsed Saurav items:', items.length);
  console.log('Sample men item:', items.find(i => i.source === 'men'));
  console.log('Sample landing item:', items[0]);
}

parseSaurav();

