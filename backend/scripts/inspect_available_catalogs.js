async function explore() {
  console.log('Fetching Myntra db.json index...');
  const res = await fetch('https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json');
  const myntra = await res.json();
  console.log('\n--- MYNTRA KEYS & ITEM COUNTS ---');
  for (const k of Object.keys(myntra)) {
    if (Array.isArray(myntra[k])) {
      console.log(`${k}: ${myntra[k].length} products`);
    }
  }

  // Let's also check nykaa
  console.log('\nFetching Nykaa db.json index...');
  try {
    const nRes = await fetch('https://raw.githubusercontent.com/almightycoder4/nykaa-clone/main/db.json');
    const nykaa = await nRes.json();
    console.log('\n--- NYKAA KEYS & ITEM COUNTS ---');
    for (const k of Object.keys(nykaa)) {
      if (Array.isArray(nykaa[k])) {
        console.log(`${k}: ${nykaa[k].length} products`);
      }
    }
  } catch (e) {
    console.log('Nykaa fetch error:', e.message);
  }
}

explore().catch(console.error);

