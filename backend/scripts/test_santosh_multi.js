async function testSantoshMulti() {
  const res = await fetch('https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/electronic.json');
  const d = await res.json();
  console.log('Sample electronic item 1:');
  console.log(d[0]);
  console.log('Sample electronic item 2:');
  console.log(d[1]);
}
testSantoshMulti();

