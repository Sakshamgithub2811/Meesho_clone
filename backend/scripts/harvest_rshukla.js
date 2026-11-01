async function harvestRshukla() {
  const url = 'https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json';
  const res = await fetch(url);
  const text = await res.text();
  const matches = [...text.matchAll(/image(?:_url)?:\s*["'](https:\/\/images\.meesho\.com\/[^"']+)["']/g)];
  console.log('Rshukla matches:', matches.length);

  const nameMatches = [...text.matchAll(/name\s*:\s*["']([^"']+)["']/g)];
  console.log('Rshukla name matches:', nameMatches.length);
}
harvestRshukla();

