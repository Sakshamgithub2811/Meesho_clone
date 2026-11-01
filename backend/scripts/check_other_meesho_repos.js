async function checkRepos() {
  const sources = [
    { name: 'madhurn29', url: 'https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/db.json' },
    { name: 'darkwingpatil', url: 'https://raw.githubusercontent.com/darkwingpatil/MeeshoClone/main/clone/src/db.json' },
    { name: 'GovindPullagura', url: 'https://raw.githubusercontent.com/GovindPullagura/Meesho.com-clone/main/indi_shop/db.json' },
    { name: 'palabhi017', url: 'https://raw.githubusercontent.com/palabhi017/Demo-Me/main/db.json' },
    { name: 'Rshukla12', url: 'https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json' }
  ];

  for (const s of sources) {
    try {
      const res = await fetch(s.url);
      if (!res.ok) {
        console.log(`[${s.name}] HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      console.log(`\n=== [${s.name}] ===`);
      if (Array.isArray(data)) {
        console.log(`Array of ${data.length} items`);
      } else {
        console.log('Keys:', Object.keys(data).map(k => `${k} (${Array.isArray(data[k]) ? data[k].length : typeof data[k]})`));
      }
    } catch (e) {
      console.log(`[${s.name}] Error:`, e.message);
    }
  }
}

checkRepos().catch(console.error);

