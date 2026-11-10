async function inspectCloneTrees() {
  const repos = [
    { repo: 'vikasdev8/MyntraClone', branch: 'main' },
    { repo: 'KeyurDiwan/myntra-clone', branch: 'main' },
    { repo: 'ChandelAnish/myntra-clone', branch: 'master' },
    { repo: 'Htripathi07/Myntra-Ecommerce-Clone', branch: 'main' },
    { repo: 'suFi7867/Bewakoof.com-Clone', branch: 'main' },
    { repo: 'vshubhams/Ajio-clone', branch: 'master' },
    { repo: 'arghadipmanna101/Flipkart_Clone', branch: 'main' },
    { repo: 'sijeeshmiziha/flipkart', branch: 'main' },
    { repo: 'AshokPrjapati/Meesho-clone', branch: 'main' },
    { repo: 'vaibhavaher04/meesho-clone', branch: 'main' }
  ];

  for (const r of repos) {
    try {
      const res = await fetch(`https://api.github.com/repos/${r.repo}/git/trees/${r.branch}?recursive=1`);
      const data = await res.json();
      if (data.tree) {
        const matches = data.tree.map(t => t.path).filter(p => p.endsWith('.json') || p.includes('data/') || p.includes('product'));
        console.log(`\n=== [${r.repo}] ===`);
        console.log(matches.slice(0, 10));
      }
    } catch (e) {
      console.log(`Error ${r.repo}:`, e.message);
    }
  }
}

inspectCloneTrees().catch(console.error);

