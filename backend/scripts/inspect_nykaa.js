async function inspectNykaa() {
  const urls = [
    'https://raw.githubusercontent.com/dev-rushi-parte/React-Nykaa-U4/main/db.json',
    'https://raw.githubusercontent.com/dev-rushi-parte/React-Nykaa-U4/master/db.json',
    'https://raw.githubusercontent.com/almightycoder4/nykaa-clone/main/db.json',
    'https://raw.githubusercontent.com/almightycoder4/nykaa-clone/master/db.json'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        console.log(`[FOUND]: ${u} (${text.length} bytes)`);
        const json = JSON.parse(text);
        console.log('Keys:', Object.keys(json));
        for (const k of Object.keys(json)) {
          if (Array.isArray(json[k])) {
            console.log(`- ${k}: ${json[k].length} items. Sample:`, json[k][0]);
          }
        }
      }
    } catch(e) {
      console.log('err:', e.message);
    }
  }
}

inspectNykaa();

