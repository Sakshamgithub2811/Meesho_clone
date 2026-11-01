import fs from 'fs';

const schemaPath = 'd:/Meesho/Meesho_clone/backend/prisma/schema.prisma';
let content = fs.readFileSync(schemaPath, 'utf8');

if (!content.includes('subCategory')) {
  content = content.replace(
    /category\s+Category\s+@relation\(fields:\s*\[categorySlug\],\s*references:\s*\[slug\]\)/,
    'category           Category @relation(fields: [categorySlug], references: [slug])\n  subCategory        String?  @map("sub_category")'
  );
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✅ Updated schema.prisma with subCategory!');
} else {
  console.log('Already contains subCategory');
}

