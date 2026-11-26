/**
 * Category-Adaptive Specification Taxonomy & Attributes Engine
 * Enterprise Level Attribute Templates (aligned with Amazon/Meesho/Flipkart standards)
 */

export const CATEGORY_TAXONOMY_TEMPLATES = {
  // 1. Laptops, Computers & Tablets
  laptops: [
    { id: 'processor', label: 'Processor', type: 'select', required: true, options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'] },
    { id: 'ram', label: 'RAM Capacity', type: 'select', required: true, options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'] },
    { id: 'storage', label: 'Storage (SSD/HDD)', type: 'select', required: true, options: ['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', '1 TB HDD + 256 GB SSD'] },
    { id: 'screen_size', label: 'Display Size', type: 'select', required: true, options: ['13.3 inch', '14.0 inch', '15.6 inch', '16.0 inch', '17.3 inch'] },
    { id: 'os', label: 'Operating System', type: 'select', required: false, options: ['Windows 11 Home', 'Windows 11 Pro', 'macOS Sonoma', 'Chrome OS', 'DOS / Linux'] },
    { id: 'graphics', label: 'Graphics Card', type: 'select', required: false, options: ['Integrated Intel UHD / Iris Xe', 'Integrated AMD Radeon', 'NVIDIA GeForce RTX 2050', 'NVIDIA GeForce RTX 3050', 'NVIDIA GeForce RTX 4060', 'Apple M-Series GPU'] },
    { id: 'warranty', label: 'Warranty Period', type: 'select', required: false, options: ['1 Year Manufacturer Warranty', '2 Years Extended Warranty', '3 Years Onsite Warranty'] },
  ],

  // 2. Smartphones & Mobiles
  mobiles: [
    { id: 'ram', label: 'RAM Capacity', type: 'select', required: true, options: ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'] },
    { id: 'storage', label: 'Internal Storage', type: 'select', required: true, options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'] },
    { id: 'battery', label: 'Battery Capacity', type: 'select', required: true, options: ['4000 mAh', '4500 mAh', '5000 mAh', '6000 mAh'] },
    { id: 'camera', label: 'Primary Rear Camera', type: 'select', required: false, options: ['12 MP Dual', '50 MP AI Triple', '64 MP Quad', '108 MP OIS', '200 MP Ultra'] },
    { id: 'network', label: 'Network / 5G', type: 'select', required: true, options: ['5G Supported (Dual SIM)', '4G VoLTE (Dual SIM)'] },
    { id: 'screen_type', label: 'Display Type', type: 'select', required: false, options: ['6.5" 90Hz IPS LCD', '6.67" 120Hz FHD+ AMOLED', '6.7" Super Retina XDR OLED'] },
  ],

  // 3. Audio & Consumer Electronics
  electronics: [
    { id: 'connectivity', label: 'Connectivity Type', type: 'select', required: true, options: ['Bluetooth 5.3 Wireless', 'True Wireless Stereo (TWS)', 'Type-C Wired', '3.5mm Aux Audio Jack'] },
    { id: 'battery_life', label: 'Playtime / Battery Life', type: 'select', required: true, options: ['Up to 15 Hours', 'Up to 30 Hours', 'Up to 45 Hours', 'Up to 60+ Hours'] },
    { id: 'anc', label: 'Noise Cancellation', type: 'select', required: false, options: ['Active Noise Cancellation (ANC)', 'Environmental Noise Cancellation (ENC)', 'Passive Noise Isolation'] },
    { id: 'water_resistance', label: 'Water / Sweat Rating', type: 'select', required: false, options: ['IPX4 Splashproof', 'IPX5 Sweatproof', 'IP67 Dust & Water Resistant', 'IP68 Waterproof'] },
    { id: 'warranty', label: 'Warranty', type: 'select', required: false, options: ['6 Months Brand Warranty', '1 Year Replacement Warranty'] },
  ],

  // 4. Sarees & Indian Ethnic Wear
  saree: [
    { id: 'fabric', label: 'Fabric / Material', type: 'select', required: true, options: ['Pure Cotton', 'Banarasi Silk', 'Kanjeevaram Art Silk', 'Georgette', 'Chiffon', 'Organza', 'Chanderi Silk', 'Net with Zari'] },
    { id: 'length', label: 'Saree Length', type: 'select', required: true, options: ['5.5 Meters', '6.0 Meters (With Blouse)'] },
    { id: 'blouse', label: 'Blouse Piece', type: 'select', required: true, options: ['Included - 0.8m Unstitched', 'Included - Stitched Standard', 'Running Blouse Piece', 'Without Blouse Piece'] },
    { id: 'pattern', label: 'Pattern / Work', type: 'select', required: true, options: ['Zari Woven Border', 'Bandhani / Bandhej Printed', 'Floral Digital Printed', 'Heavy Embroidered / Resham Work', 'Plain Solid with Lace'] },
    { id: 'occasion', label: 'Occasion', type: 'select', required: false, options: ['Festive & Traditional Puja', 'Wedding & Bridal', 'Party & Cocktail', 'Daily Casual Wear'] },
    { id: 'wash_care', label: 'Wash Care', type: 'select', required: false, options: ['Dry Clean Only', 'Gentle Hand Wash', 'Machine Washable'] },
  ],

  // 5. Women Western Wear
  'women-western': [
    { id: 'fabric', label: 'Fabric', type: 'select', required: true, options: ['100% Pure Cotton', 'Cotton Blend', 'Rayon', 'Georgette', 'Polyester Spandex', 'Denim'] },
    { id: 'fit', label: 'Fit / Silhouette', type: 'select', required: true, options: ['Regular Fit', 'Slim Fit', 'A-Line', 'Bodycon', 'Oversized / Loose', 'Flared'] },
    { id: 'neck', label: 'Neckline', type: 'select', required: false, options: ['Round Neck', 'V-Neck', 'Square Neck', 'Collar Neck', 'Sweetheart Neck', 'Off-Shoulder'] },
    { id: 'sleeve', label: 'Sleeve Length', type: 'select', required: false, options: ['Full Sleeves', 'Three-Quarter Sleeves', 'Short Sleeves', 'Sleeveless'] },
    { id: 'pattern', label: 'Pattern', type: 'select', required: false, options: ['Solid Plain', 'Floral Printed', 'Striped', 'Checkered', 'Colorblocked'] },
  ],

  // 6. Men Western & Casuals
  men: [
    { id: 'fabric', label: 'Fabric', type: 'select', required: true, options: ['100% Pure Cotton', 'Cotton Lycra Stretch', 'Denim', 'Linen Blend', 'Polyester Blend'] },
    { id: 'fit', label: 'Fit Type', type: 'select', required: true, options: ['Slim Fit', 'Regular Fit', 'Oversized / Drop Shoulder', 'Relaxed Comfort Fit'] },
    { id: 'collar', label: 'Collar / Neck', type: 'select', required: false, options: ['Spread Collar', 'Mandarin / Chinese Collar', 'Button-Down Collar', 'Crew / Round Neck', 'Polo Collar with Buttons'] },
    { id: 'sleeve', label: 'Sleeve Type', type: 'select', required: false, options: ['Full Sleeves', 'Half Sleeves', 'Sleeveless'] },
    { id: 'occasion', label: 'Ideal For', type: 'select', required: false, options: ['Casual Everyday', 'Formal Office Wear', 'Party & Evening', 'Sports & Gym'] },
  ],

  // 7. Footwear
  footwear: [
    { id: 'outer_material', label: 'Upper / Outer Material', type: 'select', required: true, options: ['Synthetic PU Leather', 'Mesh / Breathable Knit', 'Genuine Leather', 'Canvas', 'EVA Foam'] },
    { id: 'sole_material', label: 'Sole Material', type: 'select', required: true, options: ['Air Mix', 'TPR / Rubber', 'EVA Lightweight', 'PU Anti-Slip', 'Phylon'] },
    { id: 'fastening', label: 'Closure / Fastening', type: 'select', required: true, options: ['Lace-Up', 'Slip-On', 'Velcro Strap', 'Buckle / Ankle Strap'] },
    { id: 'toe_shape', label: 'Toe Shape', type: 'select', required: false, options: ['Round Toe', 'Pointed Toe', 'Square Toe', 'Open Toe'] },
    { id: 'heel_type', label: 'Heel Type', type: 'select', required: false, options: ['Flat (< 1 inch)', 'Low Heel (1-2 inch)', 'Block Heel (2-3 inch)', 'Platform Heel'] },
  ],

  // 8. Beauty, Skincare & Health
  beauty: [
    { id: 'skin_type', label: 'Skin / Hair Type', type: 'select', required: true, options: ['All Skin Types', 'Oily & Acne Prone', 'Dry & Flaky Skin', 'Combination Skin', 'Sensitive Skin'] },
    { id: 'formulation', label: 'Formulation / Texture', type: 'select', required: true, options: ['Lightweight Serum', 'Hydrating Cream', 'Oil-Free Gel', 'Foaming Wash', 'Lotion'] },
    { id: 'volume', label: 'Net Volume / Weight', type: 'select', required: true, options: ['30 ml', '50 ml', '100 ml', '200 ml', '100 g', '250 g', '500 ml'] },
    { id: 'key_ingredients', label: 'Key Active Ingredients', type: 'text', required: false, placeholder: 'e.g. 10% Niacinamide, Vitamin C, Hyaluronic Acid, Tea Tree' },
    { id: 'spf', label: 'SPF Protection', type: 'select', required: false, options: ['SPF 50+ PA++++ Broad Spectrum', 'SPF 30 PA+++', 'No SPF / Night Treatment'] },
    { id: 'safety', label: 'Safety Certifications', type: 'select', required: false, options: ['Dermatologist Tested, Paraben & Cruelty-Free', '100% Ayurvedic / Organic', 'Non-Comedogenic'] },
  ],

  // 9. Home & Kitchen
  home: [
    { id: 'material', label: 'Primary Material', type: 'select', required: true, options: ['Food Grade Stainless Steel', '100% Glace Cotton', 'Ceramic / Bone China', 'Virgin Plastic BPA-Free', 'Cast Iron', 'Engineered Wood'] },
    { id: 'dimensions', label: 'Dimensions / Capacity', type: 'text', required: true, placeholder: 'e.g. Double Bed King (90x100 inch) OR 3 Litres OR 50x30 cm' },
    { id: 'safe_features', label: 'Safety & Care Features', type: 'select', required: false, options: ['Dishwasher & Microwave Safe', 'Machine Washable (300 TC)', 'Induction Base Compatible', 'Wipe Clean with Dry Cloth'] },
    { id: 'package_contents', label: 'Package Contents', type: 'text', required: false, placeholder: 'e.g. 1 Bedsheet with 2 Pillow Covers OR Set of 6 Glasses' },
  ],

  // 10. Jewellery & Fashion Accessories
  jewellery: [
    { id: 'base_metal', label: 'Base Metal', type: 'select', required: true, options: ['Brass', 'Alloy', 'Stainless Steel', 'Silver Plated Metal', 'Copper'] },
    { id: 'plating', label: 'Plating / Finish', type: 'select', required: true, options: ['18K Micron Gold Plated', 'Oxidised Silver Vintage', 'Rhodium / Silver Plated', 'Rose Gold Plated'] },
    { id: 'stone_type', label: 'Stone / Beads Used', type: 'select', required: false, options: ['American Diamond (AD)', 'Kundan & Fresh Water Pearls', 'Cubic Zirconia (CZ)', 'Artificial Beads & Stones', 'No Stone / Plain Metal'] },
    { id: 'occasion', label: 'Occasion', type: 'select', required: false, options: ['Wedding & Bridal Heavy', 'Festive & Puja Celebration', 'Daily Office & College Wear', 'Party & Cocktail'] },
  ],

  // 11. General Default
  general: [
    { id: 'material', label: 'Primary Material', type: 'text', required: true, placeholder: 'e.g. Cotton, Steel, Plastic, Leather' },
    { id: 'country_origin', label: 'Country of Origin', type: 'select', required: true, options: ['India', 'Imported'] },
    { id: 'warranty', label: 'Manufacturer Warranty', type: 'select', required: false, options: ['No Warranty', '6 Months Replacement', '1 Year Warranty'] },
  ]
};

/**
 * Returns matching taxonomy schema based on category slug or keywords
 */
export function getStandardCategoryAttributes(slug = '') {
  const s = (slug || '').toLowerCase().trim();

  // 1. Laptops / Computers
  if (s.includes('laptop') || s.includes('computer') || s.includes('notebook') || s.includes('pc') || s.includes('macbook')) {
    return CATEGORY_TAXONOMY_TEMPLATES.laptops;
  }

  // 2. Mobiles & Tablets
  if (s.includes('mobile') || s.includes('phone') || s.includes('smartphone') || s.includes('tablet') || s.includes('ipad')) {
    return CATEGORY_TAXONOMY_TEMPLATES.mobiles;
  }

  // 3. Audio / Gadgets
  if (s.includes('electronic') || s.includes('gadget') || s.includes('audio') || s.includes('earphone') || s.includes('headphone') || s.includes('earbud') || s.includes('smartwatch') || s.includes('speaker')) {
    return CATEGORY_TAXONOMY_TEMPLATES.electronics;
  }

  // 4. Sarees & Ethnic
  if (s.includes('ethnic') || s.includes('saree') || s.includes('sari') || s.includes('kurti') || s.includes('lehenga') || s.includes('dupatta') || s.includes('suit') || s.includes('salwar')) {
    return CATEGORY_TAXONOMY_TEMPLATES.saree;
  }

  // 5. Women Western
  if (s.includes('women-western') || s.includes('western') || s.includes('dress') || s.includes('skirt') || s.includes('gown') || s.includes('top') || s.includes('tunic')) {
    return CATEGORY_TAXONOMY_TEMPLATES['women-western'];
  }

  // 6. Men Western & Wear
  if (s.includes('men') || s.includes('menswear') || s.includes('shirt') || s.includes('tshirt') || s.includes('jeans') || s.includes('pant') || s.includes('trouser')) {
    return CATEGORY_TAXONOMY_TEMPLATES.men;
  }

  // 7. Footwear
  if (s.includes('footwear') || s.includes('shoe') || s.includes('sneaker') || s.includes('sandal') || s.includes('slipper') || s.includes('heel') || s.includes('boot')) {
    return CATEGORY_TAXONOMY_TEMPLATES.footwear;
  }

  // 8. Beauty & Personal Care
  if (s.includes('beauty') || s.includes('skin') || s.includes('care') || s.includes('cosmetic') || s.includes('hair') || s.includes('serum') || s.includes('cream') || s.includes('makeup')) {
    return CATEGORY_TAXONOMY_TEMPLATES.beauty;
  }

  // 9. Home & Kitchen
  if (s.includes('home') || s.includes('kitchen') || s.includes('decor') || s.includes('bedsheet') || s.includes('cookware') || s.includes('furnishing')) {
    return CATEGORY_TAXONOMY_TEMPLATES.home;
  }

  // 10. Jewellery
  if (s.includes('jewel') || s.includes('access') || s.includes('ring') || s.includes('necklace') || s.includes('bangle') || s.includes('earring')) {
    return CATEGORY_TAXONOMY_TEMPLATES.jewellery;
  }

  return CATEGORY_TAXONOMY_TEMPLATES.general;
}
