async function check() {
  const files = ['index.html', 'product.html', 'products.html', 'script.js', 'products.js', 'data.js', 'db.json'];
  for (const f of files) {
    try {
      const u = 'https://raw.githubusercontent.com/tanviSAM/Meesho-Clone/main/' + f;
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        const imgs = [...text.matchAll(/https:\/\/images\.meesho\.com\/[^\s"'<>)]+/g)].map(m => m[0]);
        console.log('tanviSAM', f, text.length, 'imgs:', imgs.length);
      }
    } catch(e) {}
  }
}
check();

