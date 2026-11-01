import fs from 'fs';

const p = 'd:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  "'Electronics & Gadgets': ['All', 'Earbuds', 'Smartwatch', 'Cable', 'Speaker', 'Headphones', 'Charger', 'Neckband']",
  "'Electronics & Gadgets': ['All', 'Phone Covers', 'Earbuds', 'Smartwatch', 'Charger', 'Cable', 'Speaker', 'Headphones', 'Neckband']"
);

fs.writeFileSync(p, c, 'utf8');
console.log('Updated SUBCATEGORY_MAP in HomeUserCustomer.jsx');

