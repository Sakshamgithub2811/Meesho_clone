async function checkSiddharthNykaa() {
  const u = 'https://raw.githubusercontent.com/OfficialSiddharthBisht/nykaa-clone/main/db.json';
  const res = await fetch(u);
  const data = await res.json();
  console.log('Keys in Siddharth Nykaa:', Object.keys(data));
  for (const k of Object.keys(data)) {
    if (Array.isArray(data[k])) {
      console.log(`Key ${k}: ${data[k].length} items. Sample:`, data[k][0]);
    }
  }
}

checkSiddharthNykaa();

