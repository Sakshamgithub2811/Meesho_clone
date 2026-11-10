async function checkRepos() {
  const repos = [
    'uttamkrshaw/sore-sugar-4125-Meesho-',
    'darkwingpatil/MeeshoClone',
    'vaibhavaher04/meesho-clone',
    'GovindPullagura/Meesho.com-clone',
    'mrahulyadav/meesho-clone',
    'Harsh-R-16/Meesho-Clone',
    'Santosh-Konappanavar/meesho.com',
    'palabhi017/Demo-Me'
  ];

  for (const r of repos) {
    for (const b of ['main', 'master']) {
      try {
        const res = await fetch(`https://api.github.com/repos/${r}/git/trees/${b}?recursive=1`, {
          headers: { 'User-Agent': 'node' }
        });
        const d = await res.json();
        if (d.tree) {
          const files = d.tree.filter(f => f.path.endsWith('.json') || (f.path.endsWith('.js') && (f.path.includes('data') || f.path.includes('product')))).map(f => f.path);
          if (files.length > 0) {
            console.log(`${r} (${b}):`, files);
          }
        }
      } catch (e) {}
    }
  }
}

checkRepos();

