import fs from 'fs';

const filePath = 'd:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add SUBCATEGORY_MAP & displayedProducts
const targetAnchor = '  const categoryChips = [';
const subcatDef = `  const SUBCATEGORY_MAP = {
    'Women Ethnic': ['All', 'Saree', 'Kurti', 'Anarkali', 'Silk Saree', 'Dupatta', 'Lehenga', 'Salwar Suit', 'Palazzo Set'],
    'Women Western': ['All', 'Dress', 'Top', 'Jeans', 'Co-ord Set', 'Skirt', 'Jacket', 'Jumpsuit', 'Crop Top'],
    'Men': ['All', 'Shirt', 'T-Shirt', 'Jeans', 'Kurta', 'Jacket', 'Trousers', 'Track Pants', 'Hoodie'],
    'Kids': ['All', 'Frock', 'Boys Set', 'T-Shirt', 'Infant Romper', 'Dress', 'Toys', 'Nightwear'],
    'Home & Kitchen': ['All', 'Bedsheet', 'Curtain', 'Cookware', 'Storage Container', 'Wall Decor', 'Cushion', 'Bath Towel'],
    'Beauty & Health': ['All', 'Lipstick', 'Serum', 'Face Wash', 'Kajal', 'Perfume', 'Body Lotion', 'Sunscreen'],
    'Jewellery & Accessories': ['All', 'Earrings', 'Choker', 'Necklace', 'Bangles', 'Rings', 'Women Watch', 'Bracelet'],
    'Footwear': ['All', 'Sneakers', 'Jutti', 'Flats', 'Heels', 'Sliders', 'Loafers', 'Running Shoes'],
    'Electronics & Gadgets': ['All', 'Earbuds', 'Smartwatch', 'Cable', 'Speaker', 'Headphones', 'Charger', 'Neckband']
  };

  const activeSubcats = SUBCATEGORY_MAP[selectedCategory] || [];

  const displayedProducts = useMemo(() => {
    if (!products) return [];
    if (selectedSubcat === 'All') return products;
    const term = selectedSubcat.toLowerCase();
    return products.filter((p) => {
      const full = \`\${p.subCategory || ''} \${p.title || ''} \${p.description || ''}\`.toLowerCase();
      return full.includes(term);
    });
  }, [products, selectedSubcat]);

  const categoryChips = [`;

if (!content.includes('SUBCATEGORY_MAP')) {
  content = content.replace(targetAnchor, subcatDef);
}

// 2. Add Subcategory UI right after category row
const catEndTag = '            ))}</div></section>';
const regexCatEnd = /\{\s*categoryChips\.map[\s\S]*?\)\)\s*\}\s*<\/div>\s*<\/section>/;

const match = content.match(regexCatEnd);
if (match && !content.includes('activeSubcats.length > 0')) {
  const replacement = match[0].replace(
    '</section>',
    `          {/* Subcategory Filter Chips */}
          {activeSubcats.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
              {activeSubcats.map((sub, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setSelectedSubcat(sub)}
                  className={\`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 \${
                    selectedSubcat === sub
                      ? 'bg-[#FF3F6C] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF3F6C]/40'
                  }\`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </section>`
  );
  content = content.replace(match[0], replacement);
}

// 3. Replace {products.length} products with {displayedProducts.length} products
content = content.replace('{products.length} products', '{displayedProducts.length} products');

// 4. Replace products.map with displayedProducts.map
content = content.replace('{products.map((p) =>', '{displayedProducts.map((p) =>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ HomeUserCustomer.jsx patched successfully!');

