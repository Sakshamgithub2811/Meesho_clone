async function readRobiReadme() {
  const u = 'https://raw.githubusercontent.com/robi-369/meesho-product-search-scraper/main/README.md';
  const res = await fetch(u);
  const text = await res.text();
  console.log(text.slice(0, 2000));
}
readRobiReadme();

