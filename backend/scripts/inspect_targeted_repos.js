async function testTargeted() {
  const candidates = [
    'Shivamt2107/Meesho-clone',
    'robi-369/meesho-product-search-scraper',
    'soumyashisk/meesho-product-details-scraper',
    'Aman-Sharma-1/Meesho-Clone',
    'Akshaysoni25/Meesho-Clone',
    'Adityavardhan-S/Meesho-Clone',
    'mohammad-murtaza/Meesho-Clone',
    'Chitransh-J/Meesho-Clone',
    'shubhamk-007/Meesho-Clone',
    'Prakash-K-R/meesho-clone'
  ];

  for (const c of candidates) {
    for (const b of ['main', 'master']) {
      for (const f of ['db.json', 'products.json', 'data.json', 'meesho.json', 'data/products.json']) {
        try {
          const u = `https://raw.githubusercontent.com/${c}/${b}/${f}`;
          const res = await fetch(u, { method: 'HEAD' });
          if (res.ok) {
            console.log(`[FOUND]: ${u}`);
          }
        } catch (e) {}
      }
    }
  }
}

testTargeted();

