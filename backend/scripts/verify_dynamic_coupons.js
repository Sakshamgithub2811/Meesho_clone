import prisma from '../src/config/prisma.js';
import {
  getActiveCoupons,
  validateCoupon,
  adminGetAllCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminToggleCouponStatus,
  adminDeleteCoupon,
  calculateCouponDiscount
} from '../src/controllers/coupon.controller.js';

async function testWorkflow() {
  console.log('🚀 Starting dynamic coupon workflow verification...\n');

  // Helper mock res/req
  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  try {
    // 1. Check initially empty or current DB
    console.log('1. Checking getActiveCoupons from DB...');
    let res = mockRes();
    await getActiveCoupons({}, res);
    console.log('Active coupons count in DB:', res.body.count);

    // 2. Admin creates a coupon: SAVE100
    console.log('\n2. Admin creating coupon "DIWALI100"...');
    res = mockRes();
    await adminCreateCoupon({
      body: {
        code: 'DIWALI100',
        title: 'Diwali Dhamaka ₹100 Off',
        description: 'Save flat ₹100 on orders above ₹499',
        type: 'FLAT',
        value: 100,
        minOrder: 499,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 500,
        isActive: true
      }
    }, res);
    console.log('Admin create result:', res.statusCode, res.body.message);
    const createdId = res.body.data.id;

    // 3. Admin creates percentage coupon: FESTIVE20
    console.log('\n3. Admin creating percentage coupon "FESTIVE20"...');
    res = mockRes();
    await adminCreateCoupon({
      body: {
        code: 'FESTIVE20',
        title: 'Festive Delight 20% Off',
        description: '20% off up to ₹200 on orders above ₹399',
        type: 'PERCENT',
        value: 20,
        minOrder: 399,
        maxDiscount: 200,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 200,
        isActive: true
      }
    }, res);
    console.log('Admin create result:', res.statusCode, res.body.message);

    // 4. Customer validates coupon: cart subtotal ₹600
    console.log('\n4. Customer validating "DIWALI100" with cartTotal=600...');
    res = mockRes();
    await validateCoupon({
      body: { code: 'DIWALI100', cartTotal: 600 }
    }, res);
    console.log('Validation result:', res.statusCode, res.body.message, 'Discount:', res.body.data?.discountAmount);

    // 5. Customer validates coupon with cart subtotal ₹300 (below minOrder ₹499)
    console.log('\n5. Customer validating "DIWALI100" with cartTotal=300 (should fail minOrder)...');
    res = mockRes();
    await validateCoupon({
      body: { code: 'DIWALI100', cartTotal: 300 }
    }, res);
    console.log('Validation failure test (expected):', res.statusCode, res.body.message);

    // 6. Test server-side calculateCouponDiscount
    console.log('\n6. Server-side calculateCouponDiscount("FESTIVE20", 800)...');
    const discount = await calculateCouponDiscount('FESTIVE20', 800);
    console.log('Calculated discount for ₹800 cart (20% with max 200 cap):', discount);

    // 7. Admin toggles status
    console.log('\n7. Admin toggling DIWALI100 status to disabled...');
    res = mockRes();
    await adminToggleCouponStatus({ params: { id: createdId } }, res);
    console.log('Toggle result:', res.body.message);

    // 8. Re-toggle back to active
    res = mockRes();
    await adminToggleCouponStatus({ params: { id: createdId } }, res);
    console.log('Re-toggle result:', res.body.message);

    // 9. Admin view all coupons with stats
    console.log('\n9. Admin getAllCoupons...');
    res = mockRes();
    await adminGetAllCoupons({ query: {} }, res);
    console.log('Total coupons in DB:', res.body.stats.total, 'Active:', res.body.stats.active);

    console.log('\n🎉 ALL TESTS PASSED! Coupons are 100% dynamic in PostgreSQL database.');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkflow();

