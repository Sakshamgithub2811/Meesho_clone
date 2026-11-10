async function testMore() {
  const candidates = [
    'Anup-Shaw/meesho-clone',
    'bhumikashrimali/Meesho-Clone',
    'Mohini29/Meesho_Clone',
    'sneha-ghosh/meesho-clone',
    'sumit-kushwah/meesho-clone',
    'shivam-mehta/meesho-clone',
    'Ankitk24/Meesho_clone',
    'im-sachin-k/meesho_clone',
    'Akash-0511/meesho-clone',
    'Nishikant999/meesho-clone',
    'Guddu-70/Meesho-Clone',
    'pranjalshilswal/Meesho-Clone',
    'Pranav108/Meesho-Clone'
  ];

  const filesToTry = ['db.json', 'products.json', 'src/db.json', 'Frontend/src/product.json', 'meesho.json', 'data.json'];

  for (const c of candidates) {
    for (const b of ['main', 'master']) {
      for (const f of filesToTry) {
        try {
          const url = `https://raw.githubusercontent.com/${c}/${b}/${f}`;
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) {
            console.log(`FOUND: ${url}`);
          }
        } catch (e) {}
      }
    }
  }
}

testMore();

