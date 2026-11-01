async function inspectOtherMyntra() {
  const u = 'https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json';
  const res = await fetch(u);
  const data = await res.json();
  console.log('Mens count:', (data.mens || []).length);
  console.log('Womens count:', (data.womens || []).length);
  console.log('Kids count:', (data.kids || []).length);

  const sampleMen = (data.mens || [])[0];
  console.log('Sample Men:', sampleMen.title, sampleMen.handle, sampleMen.type, sampleMen.images?.[0]);

  const sampleWomen = (data.womens || [])[0];
  console.log('Sample Women:', sampleWomen ? Object.keys(sampleWomen) : null, sampleWomen?.title || sampleWomen?.name || sampleWomen?.product);

  const sampleKids = (data.kids || [])[0];
  console.log('Sample Kids:', sampleKids ? Object.keys(sampleKids) : null, sampleKids?.title || sampleKids?.name || sampleKids?.product);
}

inspectOtherMyntra();

