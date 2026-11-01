import fs from 'fs';

async function testSources() {
  const sources = [
    { name: 'palabhi017 main', url: 'https://raw.githubusercontent.com/palabhi017/Demo-Me/main/db.json' },
    { name: 'palabhi017 master', url: 'https://raw.githubusercontent.com/palabhi017/Demo-Me/master/db.json' },
    { name: 'madhurn29 db.json', url: 'https://raw.githubusercontent.com/madhurn29/Meesho-clone/master/Frontend/src/db.json' },
    { name: 'darkwingpatil src db', url: 'https://raw.githubusercontent.com/darkwingpatil/MeeshoClone/main/clone/src/db.json' },
    { name: 'GovindPullagura indi_shop db', url: 'https://raw.githubusercontent.com/GovindPullagura/Meesho.com-clone/main/indi_shop/db.json' },
    { name: 'sauravsamui men', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/menproduct.js' },
    { name: 'sauravsamui womenEthnic', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/womenEthenic.js' },
    { name: 'sauravsamui womenWestern', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/womenWestern.js' },
    { name: 'sauravsamui kids', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/kids.js' },
    { name: 'sauravsamui homeKitchen', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/homeKitchen.js' },
    { name: 'sauravsamui beauty', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/beautyandhealth.js' },
    { name: 'sauravsamui jewellery', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/jewellery.js' },
    { name: 'sauravsamui footwear', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/bagFootware.js' },
    { name: 'sauravsamui electronics', url: 'https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/electronics.js' },
    { name: 'Santosh sari', url: 'https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/sari.json' },
    { name: 'Santosh kurti', url: 'https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/kurti.json' },
    { name: 'Santosh men', url: 'https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/men.json' },
    { name: 'Santosh jwellary', url: 'https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/jwellary.json' },
    { name: 'Santosh electronic', url: 'https://raw.githubusercontent.com/Santosh-Konappanavar/meesho.com/main/index/meesho_data/electronic.json' },
    { name: 'Rshukla db', url: 'https://raw.githubusercontent.com/Rshukla12/Meesho/master/db.json' }
  ];

  for (const s of sources) {
    try {
      const res = await fetch(s.url);
      if (res.ok) {
        const text = await res.text();
        console.log(`[OK] ${s.name}: ${text.length} bytes`);
      } else {
        console.log(`[FAIL ${res.status}] ${s.name}`);
      }
    } catch (e) {
      console.log(`[ERR] ${s.name}:`, e.message);
    }
  }
}

testSources();

