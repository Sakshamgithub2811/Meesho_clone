import prisma from '../src/config/prisma.js';

async function main() {
  const result = await prisma.kYCApplication.updateMany({
    where: {
      type: 'affiliate',
      documents: {
        path: ['fullName'],
        string_contains: 'Shruti'
      }
    },
    data: {
      status: 'PENDING',
      adminNotes: ''
    }
  });

  // Also reset role to CUSTOMER until approved
  await prisma.profile.updateMany({
    where: {
      OR: [
        { email: 'shrutipaliwal61@gmail.com' },
        { phone: '8103013465' }
      ]
    },
    data: {
      role: 'CUSTOMER'
    }
  });

  const updated = await prisma.kYCApplication.findMany({
    where: { type: 'affiliate' },
    include: { user: true }
  });

  console.log("Updated KYC Applications:", JSON.stringify(updated.map(u => ({
    id: u.id,
    type: u.type,
    status: u.status,
    appId: u.documents?.applicationId,
    name: u.documents?.fullName,
    role: u.user?.role
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
