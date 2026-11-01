async function inspectSiddharthRepo() {
  const files = [
    'data.js', 'script.js', 'jewellery.html', 'beauty.html', 'footwear.html', 
    'kids.html', 'home.html', 'women.html', 'men.html', 'electronics.html'
  ];

  for (const f of files) {
    try {
      const u = `https://raw.githubusercontent.com/SIDDHARTHSINGHSHAKYA/meesho/main/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        const imgs = [...new Set([...text.matchAll(/https:\/\/images\.meesho\.com\/[^\s"'<>)]+/g)].map(m => m[0]))];
        console.log(`[${f}] length: ${text.length}, unique meesho images: ${imgs.length}`);
        if (f.endsWith('.js') && text.length < 5000) {
          console.log(text.slice(0, 300));
        }
      }
    } catch (e) {}
  }
}

inspectSiddharthRepo().catch(console.error);

