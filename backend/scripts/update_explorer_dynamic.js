import fs from 'fs';

const file = 'd:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/search_categories_explorer.jsx';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. Add dynamicSubcategories
const target1 = `  const currentCategory = categories.find(c => c.slug === activeSlug) || categoryData || {
    name: 'Category Explorer',
    slug: activeSlug,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'
  };`;

const repl1 = `  const currentCategory = categories.find(c => c.slug === activeSlug) || categoryData || {
    name: 'Category Explorer',
    slug: activeSlug,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'
  };

  const dynamicSubcategories = useMemo(() => {
    if (currentCategory?.subcategories && currentCategory.subcategories.length > 0) {
      return currentCategory.subcategories;
    }
    return activeCategoryMeta.subcategories || ['All'];
  }, [currentCategory, activeCategoryMeta]);`;

if (content.includes(target1)) {
  content = content.replace(target1, repl1);
  console.log('Added dynamicSubcategories definition');
} else {
  console.warn('target1 not found');
}

// 2. Replace activeCategoryMeta.subcategories.map with dynamicSubcategories.map
const target2 = '{activeCategoryMeta.subcategories.map((sub, idx) => {';
const repl2 = '{dynamicSubcategories.map((sub, idx) => {';

if (content.includes(target2)) {
  content = content.replace(target2, repl2);
  console.log('Replaced subcategories mapping with dynamicSubcategories');
} else {
  console.warn('target2 not found');
}

fs.writeFileSync(file, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Finished updating search_categories_explorer.jsx');

