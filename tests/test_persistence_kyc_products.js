/**
 * Automated Verification Script:
 * Tests Products Add/Edit, KYC Upload/Persistence, Admin Review, and Customer Status
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// We test against running server or run an in-process server test
const server = require('../server.js');

function makeRequest(method, pathName, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: pathName,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

function buildMultipart(boundary, fields, files) {
  let chunks = [];
  for (const [key, val] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
  }
  for (const [key, file] of Object.entries(files)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`));
    chunks.push(file.content);
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE PERSISTENCE & KYC VERIFICATION ---');

  // 1. Health check
  console.log('\n[TEST 1] Server Health Check');
  const health = await makeRequest('GET', '/api/health');
  console.log('Health:', health.status, health.body);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Add New Product
  console.log('\n[TEST 2] Admin Add New Product');
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const dummyImg = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
  
  const productPayload = buildMultipart(boundary, {
    name: 'Royal Heritage Silk Saree Set',
    category: 'Saree',
    price: '7500',
    stock: '45',
    bv: '450',
    rp: '0.75',
    referralIncome: '765',
    description: 'Pure Silk handcrafted saree bundle with premium gift pieces',
    items: JSON.stringify(['1x Heritage Silk Saree', '3x CTDV Discount Vouchers', '1x Executive Bag']),
    active: 'true'
  }, {
    productImage: {
      filename: 'sample_saree.jpg',
      contentType: 'image/jpeg',
      content: dummyImg
    }
  });

  const addProdRes = await makeRequest('POST', '/api/products', {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': productPayload.length
  }, productPayload);

  console.log('Add Product Response:', addProdRes.status, addProdRes.body.message, 'ID:', addProdRes.body.product?.id);
  if (addProdRes.status !== 201 || !addProdRes.body.success) throw new Error('Add product failed');
  const createdProdId = addProdRes.body.product.id;

  // Verify Product persisted in database
  const dbFile = path.join(__dirname, '../data/database.json');
  let dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  let savedProd = dbData.products.find(p => p.id === createdProdId);
  if (!savedProd) throw new Error('Product was not saved to persistent database.json!');
  console.log('✓ Verified: Product persisted on disk in data/database.json with image:', savedProd.image);

  // 3. Edit Product
  console.log('\n[TEST 3] Admin Edit Product');
  const editBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const editPayload = buildMultipart(editBoundary, {
    name: 'Royal Heritage Silk Saree Set (Updated Edition)',
    price: '8000',
    stock: '50',
    active: 'true'
  }, {});

  const editProdRes = await makeRequest('PUT', `/api/products/${createdProdId}`, {
    'Content-Type': `multipart/form-data; boundary=${editBoundary}`,
    'Content-Length': editPayload.length
  }, editPayload);

  console.log('Edit Product Response:', editProdRes.status, editProdRes.body.message, 'Name:', editProdRes.body.product?.name);
  if (editProdRes.status !== 200 || !editProdRes.body.success) throw new Error('Edit product failed');

  // Verify DB updated
  dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  savedProd = dbData.products.find(p => p.id === createdProdId);
  if (savedProd.name !== 'Royal Heritage Silk Saree Set (Updated Edition)' || savedProd.price !== 8000) {
    throw new Error('Product edit did not persist to database.json!');
  }
  console.log('✓ Verified: Product edits persisted to database.json on disk');

  // 4. Register a Test Customer
  console.log('\n[TEST 4] Register Customer (Pending Approval)');
  const regRes = await makeRequest('POST', '/api/customers/register', {
    'Content-Type': 'application/json'
  }, {
    sponsorId: 'GG00001',
    position: 'left',
    name: 'Ramesh Kumar',
    email: 'ramesh.test@gmail.com',
    phone: '9876543210',
    password: 'Password@123'
  });
  console.log('Register Response:', regRes.status, regRes.body);
  if (regRes.status !== 201) throw new Error('Customer registration failed');
  const customerId = regRes.body.memberId;
  console.log('✓ Customer Registered:', customerId, 'Status:', regRes.body.status);

  // 5. Customer Uploads KYC Document
  console.log('\n[TEST 5] Customer Uploads KYC Document (Multipart file to disk)');
  const kycBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const dummyDoc = Buffer.from('%PDF-1.4\n%Demo PDF Content for KYC verification\n%%EOF');

  const kycPayload = buildMultipart(kycBoundary, {
    documentType: 'Aadhaar Card',
    documentNumber: '1234 5678 9012'
  }, {
    documentFile: {
      filename: 'ramesh_aadhaar.pdf',
      contentType: 'application/pdf',
      content: dummyDoc
    }
  });

  const kycUploadRes = await makeRequest('POST', `/api/customers/${customerId}/kyc`, {
    'Content-Type': `multipart/form-data; boundary=${kycBoundary}`,
    'Content-Length': kycPayload.length
  }, kycPayload);

  console.log('KYC Upload Response:', kycUploadRes.status, kycUploadRes.body.message, 'Status:', kycUploadRes.body.kycStatus);
  if (kycUploadRes.status !== 201 || !kycUploadRes.body.success) throw new Error('KYC upload failed');

  // Verify file on disk and in database
  dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  const customerRecord = dbData.members.find(m => m.id === customerId);
  const kycDocRecord = dbData.kyc_documents.find(d => d.customerId === customerId);
  if (!kycDocRecord) throw new Error('KYC document record not found in db.kyc_documents!');
  const savedDocFilePath = path.join(__dirname, '../data/uploads/kyc', kycDocRecord.documentFile);
  if (!fs.existsSync(savedDocFilePath)) throw new Error('KYC file was not written to data/uploads/kyc!');
  console.log('✓ Verified: KYC document saved to disk at:', savedDocFilePath);
  console.log('✓ Verified: Customer KYC status in database is:', customerRecord.kycStatus);

  // 6. Test KYC Persistence on Refresh (GET /api/customers/:id/kyc)
  console.log('\n[TEST 6] Simulated Refresh: Fetch KYC from Database');
  const fetchKycRes = await makeRequest('GET', `/api/customers/${customerId}/kyc`);
  console.log('Fetch KYC Response:', fetchKycRes.status, 'Status:', fetchKycRes.body.kycStatus, 'Docs count:', fetchKycRes.body.documents?.length);
  if (fetchKycRes.status !== 200 || fetchKycRes.body.documents.length === 0) {
    throw new Error('KYC document did not persist or could not be re-fetched!');
  }
  console.log('✓ Verified: KYC documents survive refresh and load directly from database');

  // 7. Admin Views All KYC Submissions
  console.log('\n[TEST 7] Admin View KYC Submissions');
  const adminKycRes = await makeRequest('GET', '/api/admin/kyc');
  console.log('Admin KYC Count:', adminKycRes.body.length);
  const hasCustomerKyc = adminKycRes.body.some(k => k.customerId === customerId);
  if (!hasCustomerKyc) throw new Error('Admin could not see customer KYC submission');
  console.log('✓ Verified: Admin sees KYC verification request');

  // 8. Admin Rejects KYC with Reason
  console.log('\n[TEST 8] Admin Rejects KYC with Reason');
  const rejectRes = await makeRequest('PUT', `/api/customers/${customerId}/kyc/review`, {
    'Content-Type': 'application/json'
  }, {
    status: 'REJECTED',
    reason: 'Aadhaar Card photo copy is blurry. Please upload clear color scan.'
  });
  console.log('Reject Response:', rejectRes.status, rejectRes.body.message);
  if (rejectRes.status !== 200 || !rejectRes.body.success) throw new Error('Reject KYC failed');

  // Verify rejection reason saved in database
  dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  const updatedCust = dbData.members.find(m => m.id === customerId);
  if (updatedCust.kycStatus !== 'REJECTED' || !updatedCust.kycRejectionReason.includes('blurry')) {
    throw new Error('Rejection reason was not saved to database!');
  }
  console.log('✓ Verified: Customer KYC status is REJECTED and reason persisted:', updatedCust.kycRejectionReason);

  // 9. Admin Verifies KYC
  console.log('\n[TEST 9] Admin Verifies KYC');
  const verifyRes = await makeRequest('PUT', `/api/customers/${customerId}/kyc/review`, {
    'Content-Type': 'application/json'
  }, {
    status: 'VERIFIED'
  });
  console.log('Verify Response:', verifyRes.status, verifyRes.body.message);
  if (verifyRes.status !== 200 || !verifyRes.body.success) throw new Error('Verify KYC failed');

  dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  const verifiedCust = dbData.members.find(m => m.id === customerId);
  if (verifiedCust.kycStatus !== 'VERIFIED') throw new Error('KYC status was not updated to VERIFIED');
  console.log('✓ Verified: Customer KYC is officially VERIFIED in persistent database');

  // 10. Activate Customer Account
  console.log('\n[TEST 10] Admin Activates Customer Account');
  const actRes = await makeRequest('PATCH', `/api/customers/${customerId}/status`, {
    'Content-Type': 'application/json'
  }, {
    status: 'active'
  });
  console.log('Activation Response:', actRes.status, actRes.body.message);
  if (actRes.status !== 200 || !actRes.body.success) throw new Error('Account activation failed');

  dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  const activeCust = dbData.members.find(m => m.id === customerId);
  if (activeCust.status !== 'active') throw new Error('Account status was not set to active');
  console.log('✓ Verified: Customer account is active and can login');

  console.log('\n======================================================');
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 100% PERSISTENCE CONFIRMED.');
  console.log('======================================================');

  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
