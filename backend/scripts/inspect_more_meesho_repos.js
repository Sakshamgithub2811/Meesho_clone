async function findFiles() {
  const urls = [
    'https://raw.githubusercontent.com/uttamkrshaw/sore-sugar-4125-Meesho-/main/Scripts/cartproductinfo.js',
    'https://raw.githubusercontent.com/Harsh-R-16/Meesho-Clone/main/src/Components/Navbar/data.js',
    'https://raw.githubusercontent.com/Akash-0511/meesho-clone/master/data.json',
    'https://raw.githubusercontent.com/Akash-0511/meesho-clone/main/data.json',
    'https://raw.githubusercontent.com/Akash-0511/meesho-clone/master/db.json',
    'https://raw.githubusercontent.com/sneha-ghosh/meesho-clone/main/db.json',
    'https://raw.githubusercontent.com/sneha-ghosh/meesho-clone/master/db.json',
    'https://raw.githubusercontent.com/sumit-kushwah/meesho-clone/main/db.json',
    'https://raw.githubusercontent.com/sumit-kushwah/meesho-clone/master/db.json',
    'https://raw.githubusercontent.com/Pranav108/Meesho-Clone/main/db.json',
    'https://raw.githubusercontent.com/Pranav108/Meesho-Clone/master/db.json',
    'https://raw.githubusercontent.com/im-sachin-k/meesho_clone/main/db.json',
    'https://raw.githubusercontent.com/im-sachin-k/meesho_clone/master/db.json',
    'https://raw.githubusercontent.com/Ankitk24/Meesho_clone/main/db.json',
    'https://raw.githubusercontent.com/Ankitk24/Meesho_clone/master/db.json',
    'https://raw.githubusercontent.com/shivam-mehta/meesho-clone/main/db.json',
    'https://raw.githubusercontent.com/shivam-mehta/meesho-clone/master/db.json',
    'https://raw.githubusercontent.com/bhumikashrimali/Meesho-Clone/main/db.json',
    'https://raw.githubusercontent.com/bhumikashrimali/Meesho-Clone/master/db.json',
    'https://raw.githubusercontent.com/Anup-Shaw/meesho-clone/main/db.json',
    'https://raw.githubusercontent.com/Anup-Shaw/meesho-clone/master/db.json'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (res.ok) {
        const text = await res.text();
        console.log(`[FOUND ${text.length} bytes]: ${u}`);
      }
    } catch (e) {}
  }
}

findFiles();

