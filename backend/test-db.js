import prisma from './src/config/prisma.js';

async function testConnection() {
  try {
    console.log('Testing Prisma Database Connection...');
    const profile = await prisma.profile.findFirst({
      select: { id: true, email: true, role: true, createdAt: true },
    });
    console.log('✅ Connection Successful!');
    console.log('First profile in database:', profile);
  } catch (error) {
    console.error('❌ Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
