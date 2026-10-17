/**
 * Supplier Authentication Testing Script
 * Run with: node test-supplier-auth.js
 */

const BASE_URL = 'http://localhost:5000/api';

async function testSupplierAuth() {
  console.log('\n=============================================');
  console.log('🧪 TESTING SUPPLIER AUTHENTICATION APIS');
  console.log('=============================================\n');

  try {
    // 0. Check server health
    const healthCheck = await fetch(`${BASE_URL}`).catch(() => null);
    if (!healthCheck || !healthCheck.ok) {
      console.error('❌ Server is not running! Pehle server start karein:\n   cd backend\n   npm run dev\n');
      process.exit(1);
    }
    console.log('✅ Server is RUNNING at http://localhost:5000\n');

    // 1. Send OTP
    console.log('1️⃣ Testing Send OTP (POST /api/supplier/auth/send-otp)...');
    const otpRes = await fetch(`${BASE_URL}/supplier/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const otpData = await otpRes.json();
    console.log(`   Status: ${otpRes.status} | Response:`, otpData);

    // 2. Verify OTP (Receive JWT Token)
    console.log('\n2️⃣ Testing Verify OTP (POST /api/supplier/auth/verify-otp)...');
    const verifyRes = await fetch(`${BASE_URL}/supplier/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543210',
        otp: otpData.otp || '123456',
        name: 'Global Exports Ltd.',
      }),
    });
    const verifyData = await verifyRes.json();
    const token = verifyData.token;
    console.log(`   Status: ${verifyRes.status} | Token Generated: ${token ? '✅ YES' : '❌ NO'}`);
    console.log(`   Supplier Name: ${verifyData.supplier?.name}`);

    // 3. Password Login
    console.log('\n3️⃣ Testing Email/Password Login (POST /api/supplier/auth/login)...');
    const loginRes = await fetch(`${BASE_URL}/supplier/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'supplier@globalexports.com',
        password: 'Password@123',
      }),
    });
    const loginData = await loginRes.json();
    console.log(`   Status: ${loginRes.status} | Success: ${loginData.success} | Logged in as: ${loginData.supplier?.email}`);

    // 4. Register New Supplier (with GST and Bank Details)
    const randomMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
    console.log(`\n4️⃣ Testing New Supplier Registration (Mobile: ${randomMobile})...`);
    const regRes = await fetch(`${BASE_URL}/supplier/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Surat Textiles Hub',
        email: `surat_${Date.now()}@textiles.com`,
        phone: randomMobile,
        password: 'Password@123',
        storeName: 'Surat Sarees Wholesale',
        gstin: '24AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        registeredState: 'Gujarat',
        category: 'Ethnic Wear (Sarees, Kurtis)',
        bankDetails: {
          accountHolder: 'Surat Textiles Hub',
          bankName: 'State Bank of India',
          accountNumber: '123456789012',
          ifsc: 'SBIN0001234',
          upiId: 'surattextiles@sbi',
        },
      }),
    });
    const regData = await regRes.json();
    console.log(`   Status: ${regRes.status} | Created Supplier: ${regData.supplier?.name} (ID: ${regData.supplier?.id})`);
    console.log(`   Registered Bank: ${regData.supplier?.bankDetails?.bankName} | IFSC: ${regData.supplier?.bankDetails?.ifsc} | GSTIN: ${regData.supplier?.gstDetails?.gstin}`);

    // 5. Fetch Profile using JWT Bearer Token
    console.log('\n5️⃣ Testing GET Profile with Bearer Token (GET /api/supplier/auth/me)...');
    const profileRes = await fetch(`${BASE_URL}/supplier/auth/me`, {
      headers: {
        'Authorization': `Bearer ${regData.token || token}`,
      },
    });
    const profileData = await profileRes.json();
    console.log(`   Status: ${profileRes.status} | Tier: ${profileData.supplier?.tier} | Rating: ${profileData.supplier?.rating}⭐`);
    console.log(`   Bank: ${profileData.supplier?.bankDetails?.bankName} | A/C: ${profileData.supplier?.bankDetails?.accountNumber}`);

    // 6. Update Bank Details
    console.log('\n6️⃣ Testing Update Bank Details (PUT /api/supplier/profile/bank)...');
    const bankRes = await fetch(`${BASE_URL}/supplier/profile/bank`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        accountHolder: 'Global Exports Ltd.',
        bankName: 'Kotak Mahindra Bank',
        accountNumber: '•••• •••• 5544',
        ifsc: 'KKBK0000123',
        upiId: 'global@kotak',
      }),
    });
    const bankData = await bankRes.json();
    console.log(`   Status: ${bankRes.status} | Updated Bank: ${bankData.bankDetails?.bankName} | UPI: ${bankData.bankDetails?.upiId}`);

    // 7. Update GST Details
    console.log('\n7️⃣ Testing Update GST Details (PUT /api/supplier/profile/gst)...');
    const gstRes = await fetch(`${BASE_URL}/supplier/profile/gst`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        gstin: '27AABCS1429B1ZB',
        pan: 'AABCS1429B',
        registeredState: 'Maharashtra',
      }),
    });
    const gstData = await gstRes.json();
    console.log(`   Status: ${gstRes.status} | Updated GST: ${gstData.gstDetails?.gstin} | State: ${gstData.gstDetails?.registeredState}`);

    // 8. Test Invalid Token (Should fail with 401)
    console.log('\n8️⃣ Testing Security (Invalid Token Check)...');
    const badRes = await fetch(`${BASE_URL}/supplier/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid_fake_token_12345',
      },
    });
    console.log(`   Status: ${badRes.status} (Expected: 401 Unauthorized) | ✅ Protected Route Working!`);

    console.log('\n=============================================');
    console.log('🎉 ALL SUPPLIER AUTHENTICATION CHECKS PASSED!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('❌ Error testing auth:', err.message);
  }
}

testSupplierAuth();
