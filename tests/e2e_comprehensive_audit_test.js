/**
 * Great Goals Lifestyle — Comprehensive End-to-End Persistence & Functional Test Suite
 * tests/e2e_comprehensive_audit_test.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch(e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
      });
    });

    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

function buildMultipart(fields, files) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const chunks = [];

  for (const [key, val] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
  }

  for (const [field, f] of Object.entries(files)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${f.filename}"\r\nContent-Type: ${f.mime}\r\n\r\n`));
    chunks.push(f.buffer);
    chunks.push(Buffer.from('\r\n'));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  const fullBuffer = Buffer.concat(chunks);

  return {
    buffer: fullBuffer,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': fullBuffer.length
    }
  };
}

async function runTests() {
  console.log('===============================================================');
  console.log('🚀 STARTING COMPREHENSIVE GGLS SYSTEM AUDIT & VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('\n--- 1. Backend Server Health ---');
  const health = await makeRequest('GET', '/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Server is up and healthy');

  // 2. Admin Authentication
  console.log('\n--- 2. Admin Authentication & Token Generation ---');
  const adminLogin = await makeRequest('POST', '/api/auth/login', { 'Content-Type': 'application/json' }, {
    id: 'admin',
    password: 'Admin@1234'
  });
  assert(adminLogin.status === 200 && adminLogin.data.success && adminLogin.data.token, 'Admin login succeeded and returned session token');
  const adminToken = adminLogin.data.token;
  const adminHeaders = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  // 3. Customer Registration (Default Status = PENDING)
  console.log('\n--- 3. Customer Registration Flow ---');
  const testPhone = '98765' + Math.floor(10000 + Math.random() * 90000);
  const testEmail = `testuser_${Date.now()}@example.com`;
  const regRes = await makeRequest('POST', '/api/customers/register', { 'Content-Type': 'application/json' }, {
    sponsorId: 'GG00001',
    position: 'left',
    name: 'Suresh Kumar',
    phone: testPhone,
    email: testEmail,
    password: 'Password@123',
    productId: 'P1'
  });
  assert(regRes.status === 201 && regRes.data.success && regRes.data.status === 'pending', `Registered customer with status PENDING: ${regRes.data.memberId}`);
  const memberId = regRes.data.memberId;

  // Verify Admin Notification created
  const notifsRes = await makeRequest('GET', '/api/notifications');
  const regNotif = notifsRes.data.find(n => n.referenceId === memberId && n.type === 'customer_registration');
  assert(regNotif && regNotif.read === false, `Admin notification created for customer registration (${regNotif ? regNotif.title : 'None'})`);

  // 4. Customer Login Before Approval (Must be rejected with pending alert)
  console.log('\n--- 4. Customer Login Pre-Approval Enforcement ---');
  const preApprovalLogin = await makeRequest('POST', '/api/auth/login', { 'Content-Type': 'application/json' }, {
    id: memberId,
    password: 'Password@123'
  });
  assert(preApprovalLogin.status === 403 && preApprovalLogin.data.pending === true, 'Pending customer login rejected with 403 and pending: true');

  // 5. Admin Activates Customer
  console.log('\n--- 5. Admin Customer Activation ---');
  const activateRes = await makeRequest('PATCH', `/api/customers/${memberId}/status`, adminHeaders, {
    status: 'active'
  });
  assert(activateRes.status === 200 && activateRes.data.success && activateRes.data.member.status === 'active', `Customer ${memberId} activated to 'active'`);

  // Verify persistence of active status in database
  const getCustAfterAct = await makeRequest('GET', `/api/customers/${memberId}`);
  assert(getCustAfterAct.status === 200 && getCustAfterAct.data.status === 'active', 'Customer active status persisted in database.json');

  // 6. Customer Login After Approval
  console.log('\n--- 6. Customer Login Post-Approval ---');
  const postApprovalLogin = await makeRequest('POST', '/api/auth/login', { 'Content-Type': 'application/json' }, {
    id: memberId,
    password: 'Password@123'
  });
  assert(postApprovalLogin.status === 200 && postApprovalLogin.data.success && postApprovalLogin.data.token, `Customer login successful! Token received: ${postApprovalLogin.data.token.substring(0, 15)}...`);
  const customerToken = postApprovalLogin.data.token;
  const customerHeaders = { 'Authorization': `Bearer ${customerToken}` };

  // 7. Customer Profile Update & Profile Photo Upload
  console.log('\n--- 7. Profile Update & Photo Disk Persistence ---');
  const dummyPhoto = Buffer.from('FAKE_IMAGE_DATA_' + Date.now());
  const profileMultipart = buildMultipart({
    name: 'Suresh Kumar Updated',
    email: testEmail,
    phone: testPhone,
    dob: '1992-05-15',
    gender: 'male',
    country: 'India',
    state: 'Karnataka',
    city: 'Hubballi',
    pincode: '580020',
    address: 'Plot 45, Vidyanagar'
  }, {
    profilePhoto: {
      filename: 'avatar.png',
      mime: 'image/png',
      buffer: dummyPhoto
    }
  });

  const profileUpdateRes = await makeRequest('PUT', `/api/customers/${memberId}/profile`, {
    ...customerHeaders,
    ...profileMultipart.headers
  }, profileMultipart.buffer);

  assert(profileUpdateRes.status === 200 && profileUpdateRes.data.success, 'Profile updated successfully with photo');
  const savedPhotoUrl = profileUpdateRes.data.photoUrl;
  assert(savedPhotoUrl && savedPhotoUrl.includes('uploads/profiles/'), `Photo saved to server disk storage path: ${savedPhotoUrl}`);

  // Verify photo file actually exists on server disk
  const photoDiskPath = path.join(__dirname, '..', 'data', savedPhotoUrl);
  assert(fs.existsSync(photoDiskPath), `Profile photo confirmed exists on filesystem at: ${photoDiskPath}`);

  // Verify persistence on re-fetching profile
  const custReloaded = await makeRequest('GET', `/api/customers/${memberId}`, customerHeaders);
  assert(custReloaded.data.profile.city === 'Hubballi' && custReloaded.data.profile.photo === savedPhotoUrl, 'Profile updates and photo path survive reload from database');

  // 8. Customer KYC Document Upload & Persistence
  console.log('\n--- 8. Customer KYC Document Upload ---');
  const dummyDoc = Buffer.from('DUMMY_AADHAAR_PDF_CONTENT_' + Date.now());
  const kycMultipart = buildMultipart({
    documentType: 'Aadhaar Card',
    documentNumber: '8899-7766-5544'
  }, {
    documentFile: {
      filename: 'aadhaar_card.pdf',
      mime: 'application/pdf',
      buffer: dummyDoc
    }
  });

  const kycUploadRes = await makeRequest('POST', `/api/customers/${memberId}/kyc`, {
    ...customerHeaders,
    ...kycMultipart.headers
  }, kycMultipart.buffer);

  assert(kycUploadRes.status === 201 && kycUploadRes.data.success, 'KYC document uploaded successfully and submitted for review');
  const docRecord = kycUploadRes.data.document;
  assert(docRecord && docRecord.id && docRecord.documentFile, `KYC document record generated: ${docRecord.id}`);

  // Verify document exists in uploads/kyc/
  const kycDiskPath = path.join(__dirname, '..', 'data', 'uploads', 'kyc', docRecord.documentFile);
  assert(fs.existsSync(kycDiskPath), `KYC file verified on disk at: ${kycDiskPath}`);

  // Verify secure viewing endpoint
  const viewDocRes = await makeRequest('GET', `/api/kyc/document/${docRecord.id}`);
  assert(viewDocRes.status === 200 && viewDocRes.headers['content-type'] === 'application/pdf', 'Secure document viewer route /api/kyc/document/:docId serves document correctly');

  // Verify customer KYC status in database
  const custKycRes = await makeRequest('GET', `/api/customers/${memberId}/kyc`, customerHeaders);
  assert(custKycRes.data.kycStatus === 'UNDER_REVIEW' && custKycRes.data.documents.length === 1, 'Customer KYC status is UNDER_REVIEW with 1 document in database');

  // 9. Admin Rejects KYC with Reason
  console.log('\n--- 9. Admin KYC Review: Rejection with Custom Reason ---');
  const rejectKYC = await makeRequest('PUT', `/api/customers/${memberId}/kyc/review`, adminHeaders, {
    status: 'REJECTED',
    reason: 'Aadhaar Card corner is clipped and date of birth is unreadable.'
  });
  assert(rejectKYC.status === 200 && rejectKYC.data.kycStatus === 'REJECTED', 'Admin rejected KYC with reason');

  const checkRejection = await makeRequest('GET', `/api/customers/${memberId}/kyc`, customerHeaders);
  assert(checkRejection.data.kycStatus === 'REJECTED' && checkRejection.data.rejectionReason.includes('corner is clipped'), 'Rejection status and reason persisted in database across fetch');

  // 10. Admin Verifies KYC
  console.log('\n--- 10. Admin KYC Review: Verification ---');
  const verifyKYC = await makeRequest('PUT', `/api/customers/${memberId}/kyc/review`, adminHeaders, {
    status: 'VERIFIED'
  });
  assert(verifyKYC.status === 200 && verifyKYC.data.kycStatus === 'VERIFIED', 'Admin verified KYC');

  const checkVerified = await makeRequest('GET', `/api/customers/${memberId}/kyc`, customerHeaders);
  assert(checkVerified.data.kycStatus === 'VERIFIED' && checkVerified.data.rejectionReason === '', 'Verified status persisted and rejection reason cleared');

  // 11. Admin Product Management (Add Product)
  console.log('\n--- 11. Admin Add New Product ---');
  const dummyProdImg = Buffer.from('FAKE_PRODUCT_IMAGE_' + Date.now());
  const prodMultipart = buildMultipart({
    name: 'Executive Wedding Edition Silk Saree',
    price: 12000,
    category: 'Package',
    stock: 75,
    bv: 720,
    rp: 1.2,
    referralIncome: 1224,
    description: 'Special Wedding Edition with Silk Saree and 5 vouchers',
    items: JSON.stringify(['1x Pure Kanchipuram Silk Saree', '1x Premier Suit Length', '5x Travel Vouchers']),
    active: true
  }, {
    productImage: {
      filename: 'wedding_saree.jpg',
      mime: 'image/jpeg',
      buffer: dummyProdImg
    }
  });

  const addProdRes = await makeRequest('POST', '/api/products', {
    ...adminHeaders,
    ...prodMultipart.headers
  }, prodMultipart.buffer);

  assert(addProdRes.status === 201 && addProdRes.data.success && addProdRes.data.product, 'New product created successfully');
  const createdProd = addProdRes.data.product;
  const prodId = createdProd.id;

  // Verify product image on disk
  const prodDiskPath = path.join(__dirname, '..', 'data', createdProd.image);
  assert(fs.existsSync(prodDiskPath), `Product image saved to disk at: ${prodDiskPath}`);

  // 12. Admin Product Management (Edit Product)
  console.log('\n--- 12. Admin Edit Product ---');
  const editProdMultipart = buildMultipart({
    name: 'Executive Wedding Edition Silk Saree (Updated)',
    price: 13500,
    stock: 90
  }, {});

  const editProdRes = await makeRequest('PUT', `/api/products/${prodId}`, {
    ...adminHeaders,
    ...editProdMultipart.headers
  }, editProdMultipart.buffer);

  assert(editProdRes.status === 200 && editProdRes.data.success && editProdRes.data.product.price === 13500, 'Product updated with new price 13500');

  // Verify product edit persisted in database
  const getProdRes = await makeRequest('GET', `/api/products/${prodId}`);
  assert(getProdRes.status === 200 && getProdRes.data.price === 13500 && getProdRes.data.stock === 90, 'Product edit persisted in database.json');

  // 13. Security & Authorization Enforcement
  console.log('\n--- 13. Security & Role Authorization Enforcement ---');
  // Customer attempts admin product creation
  const unauthProd = await makeRequest('POST', '/api/products', customerHeaders, { name: 'Hack Product', price: 10 });
  assert(unauthProd.status === 403, 'Customer forbidden from creating products (403)');

  // Customer attempts to activate another account
  const unauthAct = await makeRequest('PATCH', '/api/customers/GG00001/status', customerHeaders, { status: 'inactive' });
  assert(unauthAct.status === 403, 'Customer forbidden from altering customer status (403)');

  // Customer attempts to review KYC
  const unauthKyc = await makeRequest('PUT', `/api/customers/${memberId}/kyc/review`, customerHeaders, { status: 'VERIFIED' });
  assert(unauthKyc.status === 403, 'Customer forbidden from self-verifying KYC (403)');

  // Customer attempts to access another customer's KYC
  const unauthViewKyc = await makeRequest('GET', '/api/customers/GG00001/kyc', customerHeaders);
  assert(unauthViewKyc.status === 403, 'Customer forbidden from accessing other customer KYC (403)');

  // Cleanup created test product
  await makeRequest('DELETE', `/api/products/${prodId}`, adminHeaders);

  console.log('\n===============================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
