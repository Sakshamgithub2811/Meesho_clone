async function testMoreNykaa() {
  const candidates = [
    'Ankit-Mishra07/NykaaCloneWithBackend',
    'OfficialSiddharthBisht/nykaa-clone',
    'tushar-kanti-paul/Nykaa-Clone',
    'surajk-07/Nykaa-clone',
    'Nileshkp/Nykaa-Clone',
    'SagarBisht/Nykaa-Clone',
    'ayushisaxena21/Nykaa-clone'
  ];

  for (const c of candidates) {
    for (const b of ['main', 'master']) {
      for (const f of ['db.json', 'products.json', 'data.json', 'src/db.json']) {
        try {
          const u = `https://raw.githubusercontent.com/${c}/${b}/${f}`;
          const res = await fetch(u, { method: 'HEAD' });
          if (res.ok) console.log(`FOUND: ${u}`);
        } catch(e) {}
      }
    }
  }
}

testMoreNykaa();

