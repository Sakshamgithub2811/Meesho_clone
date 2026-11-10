async function testSantoshImgs() {
  const imgs = [
    'https://images.meesho.com/images/products/72509816/jvhzf_512.jpg',
    'https://images.meesho.com/images/products/72509816/zllxt_512.jpg',
    'https://images.meesho.com/images/products/60766541/b0jrg_512.jpg',
    'https://images.meesho.com/images/products/60766541/jehxg_512.jpg'
  ];

  for (const img of imgs) {
    const res = await fetch(img, { method: 'HEAD' });
    console.log(`[STATUS ${res.status}] ${img}`);
  }
}

testSantoshImgs();

