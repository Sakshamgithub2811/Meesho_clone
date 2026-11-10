import prisma from '../src/config/prisma.js';

async function migrateKycData() {
  console.log('🔄 Starting KYC data migration for existing applications...');
  try {
    const apps = await prisma.kYCApplication.findMany({
      include: { user: true }
    });

    let updatedCount = 0;

    for (const app of apps) {
      const docs = app.documents || {};
      const holderName = (docs.accountHolderName || docs.fullName || app.user?.fullName || '').toUpperCase();
      const panNum = docs.pan?.number || docs.panNumber || '';
      const aadhaarNum = docs.aadhaar?.number || docs.aadhaarNumber || '';
      const bankName = docs.bank?.bankName || docs.bankName || '';
      const accNum = docs.bank?.accountNumber || docs.accountNumber || '';
      const ifsc = (docs.bank?.ifsc || docs.ifscCode || '').toUpperCase();
      const upi = docs.bank?.upiId || docs.upiId || '';

      const panImg = docs.pan?.image || docs.panPreview || docs.panPreviewUrl || null;
      const aadhaarImg = docs.aadhaar?.image || docs.aadhaarPreview || docs.aadhaarPreviewUrl || null;
      const chequeImg = docs.bank?.image || docs.chequePreview || docs.chequePreviewUrl || null;

      const needsPan = !docs.pan && panNum;
      const needsAadhaar = !docs.aadhaar && aadhaarNum;
      const needsBank = !docs.bank && accNum;

      if (needsPan || needsAadhaar || needsBank) {
        const newDocs = {
          ...docs,
          panNumber: panNum,
          aadhaarNumber: aadhaarNum,
          bankName,
          accountNumber: accNum,
          ifscCode: ifsc,
          upiId: upi,
          pan: docs.pan || {
            number: panNum.toUpperCase(),
            nameOnDoc: docs.pan?.nameOnDoc || holderName,
            status: app.status === 'APPROVED' ? 'NSDL Verified' : 'Submitted',
            image: panImg,
            docName: docs.pan?.docName || docs.panDocName || 'PAN_Document'
          },
          aadhaar: docs.aadhaar || {
            number: aadhaarNum,
            nameOnDoc: docs.aadhaar?.nameOnDoc || holderName,
            status: app.status === 'APPROVED' ? 'UIDAI Verified' : 'Submitted',
            image: aadhaarImg,
            docName: docs.aadhaar?.docName || docs.aadhaarDocName || 'Aadhaar_Document'
          },
          bank: docs.bank || {
            bankName: bankName,
            accountNumber: accNum,
            ifsc: ifsc,
            holderName: docs.bank?.holderName || holderName,
            upiId: upi,
            image: chequeImg,
            docName: docs.bank?.docName || docs.chequeDocName || 'Bank_Passbook'
          }
        };

        await prisma.kYCApplication.update({
          where: { id: app.id },
          data: { documents: newDocs }
        });

        console.log(`✅ Normalized KYC App #${app.id} for ${app.user?.fullName || 'User'} (${app.type})`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Successfully migrated ${updatedCount} existing KYC applications!`);
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateKycData();

