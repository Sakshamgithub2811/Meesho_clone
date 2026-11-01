async function inspectPrashantBeauty() {
  const u = 'https://raw.githubusercontent.com/Prashantrathour/Myntra-Clone/master/db.json';
  const res = await fetch(u);
  const data = await res.json();
  const bp = data.beautyproduct || [];
  console.log('Total beautyproduct items:', bp.length);
  for (let i = 0; i < Math.min(20, bp.length); i++) {
    const item = bp[i];
    console.log(`${i + 1}.`, item.title || item.name || item.type, item.description?.slice(0, 50), item.images?.[0] || item.img);
  }
}

inspectPrashantBeauty();

