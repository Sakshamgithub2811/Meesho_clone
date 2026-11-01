async function inspectUniqueJewellery() {
  const masterFile = 'd:/Meesho/Meesho_clone/backend/scripts/meesho_master_catalog.json';
  const fs = await import('fs');
  const master = JSON.parse(fs.readFileSync(masterFile, 'utf8'));

  const jew = master.filter(m => m.categorySlug === 'jewellery' || m.category === 'Jewellery');
  console.log(`Total jewellery in master: ${jew.length}`);

  const seenIds = new Set();
  const uniqueJew = [];
  for (const j of jew) {
    const img = (j.images && j.images[0]) || j.image || '';
    const match = img.match(/images\/products\/(\d+)\//);
    const pid = match ? match[1] : img;
    if (!seenIds.has(pid)) {
      seenIds.add(pid);
      uniqueJew.push({ title: j.title, subCategory: j.subCategory, img });
    }
  }
  console.log(`TRULY UNIQUE jewellery products: ${uniqueJew.length}`);
  uniqueJew.slice(0, 10).forEach(u => console.log(u.subCategory, '|', u.title, '|', u.img));

  // Let's also check Rshukla jewellery
  const rRes = await fetch('https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json');
  const rText = await rRes.text();
  const blocks = rText.split(/\{\s*"id"\s*:/);
  const rJew = [];
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.includes('"Jewellery"')) {
      const titleMatch = b.match(/"title"\s*:\s*"([^"]+)"/);
      const imgMatch = b.match(/"(https:\/\/images\.meesho\.com\/[^"]+)"/);
      if (titleMatch && imgMatch) {
        const img = imgMatch[1];
        const match = img.match(/images\/products\/(\d+)\//);
        const pid = match ? match[1] : img;
        if (!seenIds.has(pid)) {
          seenIds.add(pid);
          rJew.push({ title: titleMatch[1], img });
        }
      }
    }
  }
  console.log(`Additional unique jewellery from Rshukla: ${rJew.length}`);
}

inspectUniqueJewellery().catch(console.error);

