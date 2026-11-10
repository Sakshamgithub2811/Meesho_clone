async function readSoumyaMain() {
  const u = 'https://raw.githubusercontent.com/soumyashisk/meesho-product-details-scraper/main/main.py';
  const res = await fetch(u);
  const text = await res.text();
  console.log(text);
}
readSoumyaMain();

