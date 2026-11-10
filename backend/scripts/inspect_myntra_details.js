async function inspectMyntraDetails() {
  const res = await fetch('https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json');
  const data = await res.json();

  console.log('--- WOMENS SAMPLE (from 234) ---');
  data.womens.slice(0, 5).forEach(w => console.log(w.brand, '|', w.title || w.product, '|', w.imagehref));

  console.log('\n--- MENS SAMPLE (from 269) ---');
  data.mens.slice(0, 5).forEach(m => console.log(m.brand, '|', m.title || m.product, '|', m.imagehref));

  console.log('\n--- KIDS SAMPLE (from 100) ---');
  data.kids.slice(0, 5).forEach(k => console.log(k.brand, '|', k.title || k.product, '|', k.imagehref));
}

inspectMyntraDetails().catch(console.error);

