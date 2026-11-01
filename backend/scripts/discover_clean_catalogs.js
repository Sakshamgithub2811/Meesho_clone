async function searchRepos() {
  const clones = [
    // Myntra clones
    'https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json',
    'https://raw.githubusercontent.com/Siddharth-k-70/Nykaa-Clone-FullStack/main/server/db.json',
    'https://raw.githubusercontent.com/ipenywis/React-Shopping-Cart/master/src/static/data/products.json',
    'https://raw.githubusercontent.com/uttam-singh/Myntra-Clone/master/db.json',
    'https://raw.githubusercontent.com/Tanvi-Poddar/myntra-clone/main/db.json',
    'https://raw.githubusercontent.com/im-pankaj/myntra-clone/main/db.json',
    'https://raw.githubusercontent.com/Robi-369/Meesho-Clone/master/db.json',
    // Flipkart clones
    'https://raw.githubusercontent.com/kunalkeshan/Flipkart-Clone/main/client/src/data/products.json',
    'https://raw.githubusercontent.com/Akash-D-K/Flipkart-Clone/master/db.json',
    'https://raw.githubusercontent.com/Harshita-K/Flipkart-Clone/main/db.json',
    // Bewakoof clones
    'https://raw.githubusercontent.com/gautamverma-07/bewakoof-clone/main/db.json',
    'https://raw.githubusercontent.com/Anandhu-R/Bewakoof-Clone/master/db.json',
    'https://raw.githubusercontent.com/mohit-99/Bewakoof-Clone/main/db.json',
    // Tata Cliq / AJIO clones
    'https://raw.githubusercontent.com/kalyani710/tata-cliq-clone/master/db.json',
    'https://raw.githubusercontent.com/Aditya-rawat07/Tata-Cliq-Clone/main/db.json',
    'https://raw.githubusercontent.com/shashi-09/Ajio-Clone/main/db.json',
    'https://raw.githubusercontent.com/anurag-singh01/Ajio-Clone/master/db.json'
  ];

  for (const url of clones) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        console.log(`[SUCCESS] ${url} (length: ${text.length})`);
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            console.log(`   Array of ${json.length} items`);
            if (json[0]) console.log('   Sample:', Object.keys(json[0]).slice(0, 5));
          } else {
            console.log('   Keys:', Object.keys(json).map(k => `${k} (${Array.isArray(json[k]) ? json[k].length : typeof json[k]})`));
          }
        } catch(e) {
          console.log('   JSON parse error:', e.message);
        }
      } else {
        console.log(`[FAILED ${res.status}] ${url}`);
      }
    } catch (e) {
      console.log(`[ERROR] ${url}: ${e.message}`);
    }
  }
}

searchRepos().catch(console.error);

