import prisma from '../src/config/prisma.js';

async function inspect() {
  try {
    const apps = await prisma.kYCApplication.findMany({
      include: { user: true }
    });
    console.log(`Total KYC Applications in DB: ${apps.length}\n`);
    for (const a of apps) {
      console.log(`- ID: ${a.id} | Type: ${a.type} | Status: ${a.status} | User: ${a.user?.fullName} (${a.user?.email || a.user?.phone})`);
      console.log('  Documents field keys:', Object.keys(a.documents || {}));
      console.log('  Sample docs content:', JSON.stringify(a.documents, null, 2));
      console.log('----------------------------------------------------');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();

