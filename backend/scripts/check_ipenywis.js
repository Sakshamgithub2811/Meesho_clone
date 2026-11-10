async function checkIpenywis() {
  const u = 'https://raw.githubusercontent.com/ipenywis/react-query-useEffect/main/db.json';
  const res = await fetch(u);
  if (res.ok) {
    const d = await res.json();
    console.log('ipenywis keys:', Object.keys(d));
    for (const k of Object.keys(d)) {
      if (Array.isArray(d[k])) console.log(k, d[k].length, d[k][0]);
    }
  }
}
checkIpenywis();

