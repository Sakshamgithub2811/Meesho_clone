async function searchRepos() {
  const queries = [
    'meesho+clone',
    'myntra+clone',
    'nykaa+clone',
    'bewakoof+clone',
    'ajio+clone',
    'flipkart+clone'
  ];

  for (const q of queries) {
    try {
      const res = await fetch(`https://api.github.com/search/repositories?q=${q}+forks:>2&sort=stars&order=desc&per_page=10`);
      const data = await res.json();
      if (data.items) {
        console.log(`\n=== TOP REPOS FOR [${q}] ===`);
        for (const item of data.items) {
          console.log(`${item.full_name} (${item.stargazers_count}★, default_branch: ${item.default_branch})`);
        }
      }
    } catch (e) {
      console.log(`Error searching ${q}:`, e.message);
    }
  }
}

searchRepos().catch(console.error);

