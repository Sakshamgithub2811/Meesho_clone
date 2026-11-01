async function inspectSantoshAndOthers() {
  const santoshFiles = ['electronic.json', 'jwellary.json', 'kurti.json', 'men.json', 'sari.json'];
  for (const f of santoshFiles) {
    try {
      const r = await fetch(`https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/${f}`);
      const d = await r.json();
      console.log(`Santosh ${f}:`, d.length, d[0]?.name || d[0]?.title, d[0]?.images?.[0] || d[0]?.image || d[0]?.src);
    } catch (e) {
      console.log(`Santosh ${f} err:`, e.message);
    }
  }

  const darkwing = await fetch('https://raw.githubusercontent.com/darkwingpatil/MeeshoClone/main/db.json').then(r => r.json());
  console.log('darkwing keys:', Object.keys(darkwing));
  for (const k of Object.keys(darkwing)) {
    if (Array.isArray(darkwing[k])) {
      console.log(`darkwing ${k}:`, darkwing[k].length, darkwing[k][0]?.title || darkwing[k][0]?.name, darkwing[k][0]?.images || darkwing[k][0]?.image);
    }
  }
}

inspectSantoshAndOthers();

