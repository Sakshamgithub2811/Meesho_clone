async function checkSoumya() {
  for (const f of ['scraper.py', 'main.py', 'app.py', 'data.json', 'products.csv', 'meesho.py']) {
    try {
      const u = `https://raw.githubusercontent.com/soumyashisk/meesho-product-details-scraper/main/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        console.log('soumya', f, (await res.text()).length);
      }
    } catch(e) {}
  }
}
checkSoumya();

