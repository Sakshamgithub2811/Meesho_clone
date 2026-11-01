async function checkSiddharth() {
  const files = [
    'jewellery.html', 'beauty.html', 'footwear.html', 'kids.html', 'home.html', 
    'women.html', 'men.html', 'electronics.html', 'data.js', 'script.js'
  ];

  for (const f of files) {
    try {
      const u = `https://raw.githubusercontent.com/SIDDHARTHSINGHSHAKYA/meesho/main/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        console.log(`[FOUND siddharth ${f}]: ${text.length} bytes`);
        const imgs = [...text.matchAll(/https:\/\/images\.meesho\.com\/[^\s"'<>)]+/g)].map(m => m[0]);
        console.log(`  Found ${imgs.length} meesho images in ${f}`);
      }
    } catch(e) {}
  }
}

checkSiddharth();

