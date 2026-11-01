import fs from 'fs';

const content = fs.readFileSync('d:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, i) => {
  if (line.includes('50') || line.includes('slice') || line.includes('limit') || line.includes('displayedProducts')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

