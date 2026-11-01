import fs from 'fs';

// 1. Patch HomeUserCustomer.jsx
const homePath = 'D:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx';
let homeContent = fs.readFileSync(homePath, 'utf8');

const targetHomeSubMap = `  const SUBCATEGORY_MAP = {
    'Women Ethnic': ['All', 'Saree', 'Kurti', 'Anarkali', 'Silk Saree', 'Dupatta', 'Lehenga', 'Salwar Suit', 'Palazzo Set'],
    'Women Western': ['All', 'Dress', 'Top', 'Jeans', 'Co-ord Set', 'Skirt', 'Jacket', 'Jumpsuit', 'Crop Top'],
    'Men': ['All', 'Shirt', 'T-Shirt', 'Jeans', 'Kurta', 'Jacket', 'Trousers', 'Track Pants', 'Hoodie'],
    'Kids': ['All', 'Frock', 'Boys Set', 'T-Shirt', 'Infant Romper', 'Dress', 'Toys', 'Nightwear'],
    'Home & Kitchen': ['All', 'Bedsheet', 'Curtain', 'Cookware', 'Storage Container', 'Wall Decor', 'Cushion', 'Bath Towel'],
    'Beauty & Health': ['All', 'Lipstick', 'Serum', 'Face Wash', 'Kajal', 'Perfume', 'Body Lotion', 'Sunscreen'],
    'Jewellery & Accessories': ['All', 'Earrings', 'Choker', 'Necklace', 'Bangles', 'Rings', 'Women Watch', 'Bracelet'],
    'Footwear': ['All', 'Sneakers', 'Jutti', 'Flats', 'Heels', 'Sliders', 'Loafers', 'Running Shoes'],
    'Electronics & Gadgets': ['All', 'Phone Covers', 'Earbuds', 'Smartwatch', 'Charger', 'Cable', 'Speaker', 'Headphones', 'Neckband']
  };`;

const replacementHomeSubMap = `  const SUBCATEGORY_MAP = {
    'Women Ethnic': ['All', 'Saree', 'Kurti', 'Silk Saree', 'Anarkali'],
    'Women Western': ['All', 'Dress', 'Top', 'Jeans', 'Skirt'],
    'Men': ['All', 'Shirt', 'T-Shirt', 'Track Pants'],
    'Kids': ['All', 'Toys', 'Infant Romper', 'Boys Set'],
    'Home & Kitchen': ['All', 'Bedsheet', 'Wall Decor', 'Curtain', 'Cookware', 'Storage Container'],
    'Beauty & Health': ['All', 'Face Wash', 'Lipstick', 'Serum', 'Sunscreen', 'Perfume', 'Body Lotion', 'Kajal'],
    'Jewellery & Accessories': ['All', 'Necklace', 'Earrings', 'Choker', 'Rings'],
    'Footwear': ['All', 'Sneakers', 'Flats', 'Sliders', 'Jutti', 'Loafers'],
    'Electronics & Gadgets': ['All', 'Phone Covers', 'Earbuds', 'Smartwatch', 'Charger', 'Cable', 'Neckband']
  };`;

if (homeContent.replace(/\r\n/g, '\n').includes(targetHomeSubMap)) {
  homeContent = homeContent.replace(/\r\n/g, '\n').replace(targetHomeSubMap, replacementHomeSubMap);
  fs.writeFileSync(homePath, homeContent, 'utf8');
  console.log('Updated SUBCATEGORY_MAP in HomeUserCustomer.jsx');
} else {
  console.log('Target submap not matched in HomeUserCustomer.jsx');
}

// 2. Patch search_categories_explorer.jsx
const expPath = 'D:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/search_categories_explorer.jsx';
let expContent = fs.readFileSync(expPath, 'utf8').replace(/\r\n/g, '\n');

const expTargetFilter = `  // Filter products by selected subcategory chip
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedSubcat === 'All') return products;
    const term = selectedSubcat.toLowerCase();
    return products.filter((p) => {
      const fullText = \`\${p.title || ''} \${p.description || ''}\`.toLowerCase();
      return fullText.includes(term);
    });
  }, [products, selectedSubcat]);`;

const expReplacementFilter = `  // Filter products by selected subcategory chip
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedSubcat === 'All') return products;
    const term = selectedSubcat.toLowerCase().trim();
    return products.filter((p) => {
      const pSub = (p.subCategory || '').toLowerCase().trim();
      if (pSub === term) return true;
      if (pSub) return false;
      const fullText = \`\${p.title || ''} \${p.description || ''}\`.toLowerCase();
      return fullText.includes(term);
    });
  }, [products, selectedSubcat]);`;

if (expContent.includes(expTargetFilter)) {
  expContent = expContent.replace(expTargetFilter, expReplacementFilter);
  fs.writeFileSync(expPath, expContent, 'utf8');
  console.log('Updated filteredProducts in search_categories_explorer.jsx');
} else {
  console.log('Target filter not matched in search_categories_explorer.jsx');
}

console.log('Done!');

