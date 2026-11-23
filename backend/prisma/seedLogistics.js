import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Supply Chain Logistics Seeding...');

  // 1. Seed Warehouses
  const warehouses = [
    {
      warehouseCode: 'WH-DELHI-01',
      name: 'North Hub Delhi Fulfillment Center',
      type: 'CENTRAL_HUB',
      contactPerson: 'Vikram Malhotra',
      phone: '+91 98112 34567',
      email: 'northhub.delhi@meesho.clone',
      addressLine1: 'Plot 18, Okhla Phase III',
      addressLine2: 'Near Modi Mill Flyover',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      maxDailyCapacity: 8000,
    },
    {
      warehouseCode: 'WH-MUMBAI-01',
      name: 'West Hub Bhiwandi Warehouse',
      type: 'REGIONAL_DEPOT',
      contactPerson: 'Suresh Patil',
      phone: '+91 98223 45678',
      email: 'westhub.mumbai@meesho.clone',
      addressLine1: 'Building B4, Shree Rajlaxmi Commercial Complex',
      addressLine2: 'Agra Road, Bhiwandi',
      city: 'Thane',
      state: 'Maharashtra',
      pincode: '421302',
      maxDailyCapacity: 12000,
    },
    {
      warehouseCode: 'WH-BLR-01',
      name: 'South Hub Bengaluru Logistics Depot',
      type: 'REGIONAL_DEPOT',
      contactPerson: 'Anand Kumar',
      phone: '+91 98334 56789',
      email: 'southhub.blr@meesho.clone',
      addressLine1: 'Shed 12, Phase 2, Electronic City',
      addressLine2: 'Hosur Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      maxDailyCapacity: 6000,
    },
  ];

  for (const wh of warehouses) {
    await prisma.logisticsWarehouse.upsert({
      where: { warehouseCode: wh.warehouseCode },
      update: wh,
      create: wh,
    });
  }
  console.log(`✅ Seeded ${warehouses.length} Logistics Warehouses.`);

  // 2. Seed Logistics Partners (Couriers)
  const partners = [
    {
      partnerCode: 'DELHIVERY',
      name: 'Delhivery Surface & Express',
      trackingUrlTemplate: 'https://www.delhivery.com/track/package/{AWB}',
      serviceType: 'SURFACE',
      supportsCod: true,
      supportsReverse: true,
      status: 'ACTIVE',
    },
    {
      partnerCode: 'BLUEDART',
      name: 'BlueDart Express Air Priority',
      trackingUrlTemplate: 'https://www.bluedart.com/tracking?trackNumber={AWB}',
      serviceType: 'AIR',
      supportsCod: true,
      supportsReverse: false,
      status: 'ACTIVE',
    },
    {
      partnerCode: 'SHADOWFAX',
      name: 'Shadowfax Quick Commerce & Surface',
      trackingUrlTemplate: 'https://tracker.shadowfax.in/#/track?awb={AWB}',
      serviceType: 'HYPERLOCAL',
      supportsCod: true,
      supportsReverse: true,
      status: 'ACTIVE',
    },
    {
      partnerCode: 'FLEET_INTERNAL',
      name: 'MShoppy Velocity Internal Fleet',
      trackingUrlTemplate: '/track/{AWB}',
      serviceType: 'HYPERLOCAL',
      supportsCod: true,
      supportsReverse: true,
      status: 'ACTIVE',
    },
  ];

  const createdPartners = [];
  for (const p of partners) {
    const partner = await prisma.logisticsPartner.upsert({
      where: { partnerCode: p.partnerCode },
      update: p,
      create: p,
    });
    createdPartners.push(partner);
  }
  console.log(`✅ Seeded ${partners.length} Logistics Partners.`);

  // 3. Seed Rate Cards (Zone A to Zone E for Delhivery)
  const delhivery = createdPartners.find((p) => p.partnerCode === 'DELHIVERY');
  if (delhivery) {
    const rateCards = [
      { zone: 'ZONE_A', baseRate: 35.0, incrementalSlabRate: 20.0, expectedSlaDays: 1 },
      { zone: 'ZONE_B', baseRate: 45.0, incrementalSlabRate: 25.0, expectedSlaDays: 2 },
      { zone: 'ZONE_C', baseRate: 55.0, incrementalSlabRate: 30.0, expectedSlaDays: 3 },
      { zone: 'ZONE_D', baseRate: 65.0, incrementalSlabRate: 35.0, expectedSlaDays: 4 },
      { zone: 'ZONE_E', baseRate: 90.0, incrementalSlabRate: 50.0, expectedSlaDays: 6 },
    ];

    for (const rc of rateCards) {
      await prisma.logisticsRateCard.upsert({
        where: {
          partnerId_zone: {
            partnerId: delhivery.id,
            zone: rc.zone,
          },
        },
        update: rc,
        create: {
          partnerId: delhivery.id,
          ...rc,
        },
      });
    }
    console.log(`✅ Seeded ${rateCards.length} Zonal Rate Cards for Delhivery.`);
  }

  // 4. Seed sample Serviceable PIN Codes
  const samplePincodes = [
    { pincode: '110001', city: 'New Delhi', state: 'Delhi', zone: 'ZONE_A', deliverySlaDays: 1 },
    { pincode: '110020', city: 'New Delhi', state: 'Delhi', zone: 'ZONE_A', deliverySlaDays: 1 },
    { pincode: '201301', city: 'Noida', state: 'Uttar Pradesh', zone: 'ZONE_B', deliverySlaDays: 2 },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', zone: 'ZONE_C', deliverySlaDays: 2 },
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', zone: 'ZONE_C', deliverySlaDays: 2 },
    { pincode: '302001', city: 'Jaipur', state: 'Rajasthan', zone: 'ZONE_D', deliverySlaDays: 3 },
    { pincode: '700001', city: 'Kolkata', state: 'West Bengal', zone: 'ZONE_D', deliverySlaDays: 4 },
    { pincode: '781001', city: 'Guwahati', state: 'Assam', zone: 'ZONE_E', deliverySlaDays: 5 },
  ];

  if (delhivery) {
    for (const pin of samplePincodes) {
      await prisma.logisticsServiceablePincode.upsert({
        where: {
          pincode_partnerId: {
            pincode: pin.pincode,
            partnerId: delhivery.id,
          },
        },
        update: pin,
        create: {
          partnerId: delhivery.id,
          ...pin,
        },
      });
    }
    console.log(`✅ Seeded ${samplePincodes.length} Serviceable PIN Codes.`);
  }

  console.log('🎉 Part 1 Logistics Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
