import prisma from '../src/config/prisma.js';

async function main() {
  const cartItems = await prisma.cartItem.findMany({
    include: { product: true }
  });
  console.log('--- CART ITEMS COUNT ---', cartItems.length);
  cartItems.forEach(i => {
    console.log(`User: ${i.userId} | Product: ${i.product?.title} | Qty: ${i.quantity} | Size: ${i.size}`);
  });

  const addresses = await prisma.address.findMany();
  console.log('--- ADDRESSES COUNT ---', addresses.length);
  addresses.forEach(a => {
    console.log(`User: ${a.userId} | Name: ${a.fullName} | Pincode: ${a.pincode} | City: ${a.city}`);
  });

  const shruti = await prisma.profile.findFirst({ where: { email: 'shruti2003@gmail.com' } });
  if (shruti) {
    await prisma.wallet.updateMany({
      where: { userId: shruti.id },
      data: { balance: 0.0, pending: 0.0 }
    });
    console.log('✅ Successfully reset wallet balance for shruti2003@gmail.com to ₹0.00 in PostgreSQL!');
  }

  const profiles = await prisma.profile.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- LATEST PROFILES ---');
  profiles.forEach(p => {
    console.log(`ID: ${p.id} | Email: ${p.email} | Name: ${p.fullName} | Role: ${p.role}`);
  });

  const specificUser = await prisma.profile.findFirst({
    where: { email: 'shruti2003@gmail.com' },
    include: { 
      cart: { include: { product: true } }, 
      addresses: true,
      wallet: { include: { transactions: true } }
    }
  });
  console.log('--- shruti2003@gmail.com details ---');
  console.log(JSON.stringify(specificUser, null, 2));

  const allKyc = await prisma.kYCApplication.findMany();
  console.log('--- ALL KYC APPLICATIONS ---');
  allKyc.forEach(k => {
    console.log(`ID: ${k.id} | User: ${k.userId} | Status: ${k.status} | AppId: ${k.documents?.applicationId} | Name: ${k.documents?.fullName} | Bank: ${k.documents?.bankName}`);
  });


}

main().catch(console.error).finally(() => prisma.$disconnect());
