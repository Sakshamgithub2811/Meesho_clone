async function checkSantoshMore() {
  const fileNames = [
    'beauty.json', 'cosmetics.json', 'footwear.json', 'shoes.json', 'kids.json', 
    'home.json', 'kitchen.json', 'western.json', 'dress.json', 'bags.json', 'bag.json',
    'watches.json', 'toys.json', 'appliances.json'
  ];

  for (const f of fileNames) {
    try {
      const u = `https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/${f}`;
      const res = await fetch(u);
      if (res.ok) {
        console.log(`[FOUND Santosh]: ${f}`);
      }
    } catch(e) {}
  }
}

checkSantoshMore();

