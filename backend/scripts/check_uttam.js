import fs from 'fs';

async function checkUttam() {
  const res = await fetch('https://raw.githubusercontent.com/uttamkrshaw/sore-sugar-4125-Meesho-/main/db.json');
  const d = await res.json();
  console.log('Total items in uttam data:', d.data.length);
  const categories = {};
  for (const item of d.data) {
    categories[item.category || item.name] = (categories[item.category || item.name] || 0) + 1;
  }
  console.log('Categories:', categories);
  console.log('Sample item:', d.data[0]);
  console.log('Sample item 100:', d.data[100]);
  console.log('Sample item 200:', d.data[200]);
}

checkUttam();

