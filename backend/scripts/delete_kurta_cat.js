import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/config/prisma.js';

async function main() {
  await prisma.category.deleteMany({ where: { slug: 'kurta' } });
  const cats = await prisma.category.findMany();
  console.log('Categories in DB now:', cats.map(c => c.name));
  process.exit(0);
}

main().catch(console.error);

