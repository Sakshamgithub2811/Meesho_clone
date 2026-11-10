import fs from 'fs';

const content = fs.readFileSync('d:/Meesho/Meesho_clone/frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, i) => {
  if (line.includes('HomeUserCustomer')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

