import fs from 'fs';

const file = 'D:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const displayedProducts = useMemo(() => {
    if (!products) return [];
    if (selectedSubcat === 'All') return products;
    const term = selectedSubcat.toLowerCase();
    return products.filter((p) => {
      const full = \`\${p.subCategory || ''} \${p.title || ''} \${p.description || ''}\`.toLowerCase();
      return full.includes(term);
    });
  }, [products, selectedSubcat]);`;

const replacement = `  const displayedProducts = useMemo(() => {
    if (!products) return [];
    if (selectedSubcat === 'All') return products;
    const term = selectedSubcat.toLowerCase().trim();
    return products.filter((p) => {
      const pSub = (p.subCategory || '').toLowerCase().trim();
      if (pSub === term) return true;
      if (pSub) return false;
      const full = \`\${p.title || ''} \${p.description || ''}\`.toLowerCase();
      return full.includes(term);
    });
  }, [products, selectedSubcat]);`;

const normalizedContent = content.replace(/\r\n/g, '\n');
if (normalizedContent.includes(target)) {
  const updated = normalizedContent.replace(target, replacement);
  fs.writeFileSync(file, updated, 'utf8');
  console.log('Successfully updated displayedProducts filtering!');
} else {
  console.error('Target not found in HomeUserCustomer.jsx');
}

