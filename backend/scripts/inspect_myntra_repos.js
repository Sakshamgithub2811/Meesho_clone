async function checkMyntraRepos() {
  const urls = [
    'https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json',
    'https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/main/db.json',
    'https://raw.githubusercontent.com/salil-01/Myntra-Clone/master/db.json',
    'https://raw.githubusercontent.com/salil-01/Myntra-Clone/main/db.json',
    'https://raw.githubusercontent.com/Priyanshu-Tyagi/Unit-3-Myntra-clone/main/db.json',
    'https://raw.githubusercontent.com/Priyanshu-Tyagi/Unit-3-Myntra-clone/master/db.json',
    'https://raw.githubusercontent.com/pawan62003/myntra-clone/main/db.json',
    'https://raw.githubusercontent.com/pawan62003/myntra-clone/master/db.json'
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
    } catch(e) {}
  }
}

checkMyntraRepos();

