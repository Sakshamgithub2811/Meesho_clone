import fs from 'fs';

async function checkLocalFiles() {
  const masterFile = 'd:/Meesho/Meesho_clone/backend/scripts/meesho_master_catalog.json';
  if (fs.existsSync(masterFile)) {
    const raw = fs.readFileSync(masterFile, 'utf8');
    const data = JSON.parse(raw);
    console.log(`meesho_master_catalog.json has ${data.length} items`);
    const cats = {};
    for (const d of data) {
      cats[d.categorySlug || d.category || 'none'] = (cats[d.categorySlug || d.category || 'none'] || 0) + 1;
    }
    console.log('Categories in meesho_master_catalog.json:', cats);
  }

  const realFile = 'd:/Meesho/Meesho_clone/backend/scripts/meesho_real_products.json';
  if (fs.existsSync(realFile)) {
    const raw = fs.readFileSync(realFile, 'utf8');
    const data = JSON.parse(raw);
    console.log(`\nmeesho_real_products.json has ${data.length} items`);
    const cats = {};
    for (const d of data) {
      cats[d.categorySlug || d.category || 'none'] = (cats[d.categorySlug || d.category || 'none'] || 0) + 1;
    }
    console.log('Categories in meesho_real_products.json:', cats);
  }
}

checkLocalFiles().catch(console.error);

