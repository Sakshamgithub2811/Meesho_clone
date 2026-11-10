import prisma from '../src/config/prisma.js';

async function main() {
  console.log('Connecting to database and creating coupons table...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'FLAT',
        value DOUBLE PRECISION NOT NULL,
        min_order DOUBLE PRECISION NOT NULL DEFAULT 0,
        max_discount DOUBLE PRECISION,
        expires_at TIMESTAMP(3) NOT NULL,
        usage_limit INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ coupons table created successfully or already exists!');
    
    // Check if index exists or create it
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_idx ON coupons (code);
    `);
    console.log('✅ coupons_code_idx created successfully!');

    const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM coupons`);
    console.log('Current coupon count:', rows);
  } catch (err) {
    console.error('❌ Failed to create coupons table:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

