async function checkRobi() {
  const files = ['products.json', 'data.json', 'output.json', 'meesho.json', 'result.json', 'README.md'];
  for (const f of files) {
    try {
      const u = `https://raw.githubusercontent.com/robi-369/meesho-product-search-scraper/main/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        console.log('robi', f, text.length);
        const imgs = [...text.matchAll(/https:\/\/images\.meesho\.com\/[^\s"'<>)]+/g)].map(m => m[0]);
        console.log('robi imgs:', imgs.length);
      }
    } catch(e) {}
  }
}
checkRobi();

