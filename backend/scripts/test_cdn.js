async function testCdn() {
  const zaraImg = 'https://static.zara.net/photos///2022/I/0/3/p/0722/649/610/2/w/750/0722649610_6_1_1.jpg?ts=1667549521610';
  const myntraImg = 'https://assets.myntassets.com/dpr_2,q_60,w_210,c_limit,fl_progressive/assets/images/productimage/2019/12/12/1aab2a18-6774-4f83-b292-fe301755a3351576102551329-1.jpg';
  const meeshoImg = 'https://images.meesho.com/images/products/72509816/7mg8z_512.jpg';

  for (const img of [meeshoImg, myntraImg, zaraImg]) {
    try {
      const res = await fetch(img, { method: 'HEAD' });
      console.log(`[STATUS ${res.status}] ${img.slice(0, 50)}...`);
    } catch(e) {
      console.log(`[ERR] ${img.slice(0, 50)}:`, e.message);
    }
  }
}

testCdn();

