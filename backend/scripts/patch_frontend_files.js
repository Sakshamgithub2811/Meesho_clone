import fs from 'fs';

// 1. Patch ecommerceService.js
const servicePath = 'd:/Meesho/Meesho_clone/frontend/src/services/ecommerceService.js';
let serviceContent = fs.readFileSync(servicePath, 'utf8');
serviceContent = serviceContent.replace(
  "if (params.limit) query.set('limit', params.limit);",
  "query.set('limit', params.limit || '1000');"
);
fs.writeFileSync(servicePath, serviceContent, 'utf8');
console.log('Patched ecommerceService.js');

// 2. Patch HomeUserCustomer.jsx
const homePath = 'd:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx';
let homeContent = fs.readFileSync(homePath, 'utf8');

// Replace getProducts() with getProducts({ limit: 1000 })
homeContent = homeContent.replace(
  'getCategories(),\n          getProducts(),\n          getWishlist(),',
  'getCategories(),\n          getProducts({ limit: 1000 }),\n          getWishlist(),'
);

// Replace saree onError fallback with clean neutral SVG
const oldFallback = "e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';";
const newFallback = "e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"400\" viewBox=\"0 0 300 400\" fill=\"%23f8fafc\"><rect width=\"300\" height=\"400\" fill=\"%23f1f5f9\"/><circle cx=\"150\" cy=\"170\" r=\"35\" fill=\"%23cbd5e1\"/><path d=\"M105 250c0-25 20-45 45-45s45 20 45 45v15h-90z\" fill=\"%23cbd5e1\"/><text x=\"50%\" y=\"72%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"%2394a3b8\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"13\">Meesho Verified</text></svg>';";

if (homeContent.includes(oldFallback)) {
  homeContent = homeContent.replace(oldFallback, newFallback);
  console.log('Patched HomeUserCustomer.jsx onError fallback');
} else {
  console.log('Old fallback string not found directly; searching regex...');
  homeContent = homeContent.replace(
    /e\.currentTarget\.src\s*=\s*['"]https:\/\/images\.unsplash\.com\/photo-1610030469983-98e550d6193c[^'"]*['"];/g,
    newFallback
  );
  console.log('Patched via regex');
}

fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('Successfully updated HomeUserCustomer.jsx');

