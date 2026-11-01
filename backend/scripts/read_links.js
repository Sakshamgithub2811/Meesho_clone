async function readLinks() {
  const u = 'https://raw.githubusercontent.com/soumyashisk/meesho-product-details-scraper/main/links.txt';
  const res = await fetch(u);
  if (res.ok) {
    const text = await res.text();
    console.log('links.txt length:', text.length);
    console.log(text.slice(0, 1000));
  }
}
readLinks();

