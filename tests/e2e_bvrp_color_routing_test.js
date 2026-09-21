const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers }
    };

    let postData = null;
    if (body) {
      if (typeof body === 'string') {
        postData = body;
      } else {
        postData = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
      }
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('STARTING END-TO-END VERIFICATION: BV/RP, COLOR BADGES, ROUTING');
  console.log('=============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // 1. Check Product Catalog BV & RP
    console.log('--- TEST GROUP 1: Product BV & RP in Backend DB ---');
    const prodsRes = await request('GET', '/api/products');
    assert(prodsRes.status === 200, 'GET /api/products returns 200 OK');
    const p1 = prodsRes.data.find(p => p.id === 'P1');
    const p2 = prodsRes.data.find(p => p.id === 'P2');
    assert(p1 && p1.bv === 1200 && p1.rp === 2, `Product P1 (₹10,000) has 1,200 BV and 2 RP (got BV: ${p1 ? p1.bv : null}, RP: ${p1 ? p1.rp : null})`);
    assert(p2 && p2.bv === 600 && p2.rp === 1, `Product P2 (₹5,000) has 600 BV and 1 RP (got BV: ${p2 ? p2.bv : null}, RP: ${p2 ? p2.rp : null})`);

    // 2. Admin Authentication & Role
    console.log('\n--- TEST GROUP 2: Admin Login & Role Routing ---');
    const adminLogin = await request('POST', '/api/auth/login', { id: 'admin', password: 'Admin@1234' });
    assert(adminLogin.status === 200, 'Admin login returns 200 OK');
    assert(adminLogin.data.success === true, 'Admin login reports success: true');
    assert(adminLogin.data.isAdmin === true, 'Admin login returns isAdmin: true');
    assert(adminLogin.data.role === 'ADMIN', `Admin login returns explicit role: 'ADMIN' (got: ${adminLogin.data.role})`);
    const adminToken = adminLogin.data.token;
    assert(!!adminToken, 'Admin token received');

    // 3. Customer Registration with Package P1
    console.log('\n--- TEST GROUP 3: Customer Registration & Status Enforcement ---');
    const regPayload = {
      sponsorId: 'GG00001',
      position: 'left',
      name: 'Verification User ' + Date.now().toString().slice(-4),
      email: `testuser_${Date.now()}@example.com`,
      phone: '98' + Math.floor(10000000 + Math.random() * 90000000),
      password: 'Password@123',
      productId: 'P1'
    };
    const regRes = await request('POST', '/api/customers/register', regPayload);
    assert(regRes.status === 201, 'POST /api/customers/register returns 201 Created');
    assert(regRes.data.success === true, 'Registration reports success: true');
    assert(regRes.data.status === 'pending', 'New registered customer status is "pending"');
    const testMemberId = regRes.data.memberId;
    assert(!!testMemberId, `New customer ID generated: ${testMemberId}`);

    // 4. Pending Customer Login Guard
    console.log('\n--- TEST GROUP 4: Pending Customer Login Protection ---');
    const pendingLogin = await request('POST', '/api/auth/login', { id: testMemberId, password: regPayload.password });
    assert(pendingLogin.status === 403, 'Pending customer login is blocked with HTTP 403');
    assert(pendingLogin.data.pending === true, 'Pending customer login response contains pending: true');
    assert(pendingLogin.data.msg.includes('Account Pending Approval'), 'Pending customer login displays approval notice');

    // 5. Admin Activates Customer & Auto-completes Registration Order
    console.log('\n--- TEST GROUP 5: Admin Activation & BV/RP Propagation ---');
    const activateRes = await request('PATCH', `/api/customers/${testMemberId}/status`, { status: 'active' }, { Authorization: `Bearer ${adminToken}` });
    assert(activateRes.status === 200, 'Admin activating customer returns 200 OK');
    assert(activateRes.data.member.status === 'active', 'Customer status updated to "active"');
    assert(activateRes.data.member.personalBV === 1200, `Customer credited with 1,200 personal BV (got: ${activateRes.data.member.personalBV})`);
    assert(activateRes.data.member.personalRP === 2, `Customer credited with 2 personal RP (got: ${activateRes.data.member.personalRP})`);
    assert(activateRes.data.member.totalBV >= 1200, `Customer total BV >= 1,200 (got: ${activateRes.data.member.totalBV})`);

    // 6. Active Customer Login & Role Routing
    console.log('\n--- TEST GROUP 6: Customer Login Routing & Role Verification ---');
    const activeLogin = await request('POST', '/api/auth/login', { id: testMemberId, password: regPayload.password });
    assert(activeLogin.status === 200, 'Active customer login succeeds with HTTP 200 OK');
    assert(activeLogin.data.success === true, 'Active customer login reports success: true');
    assert(activeLogin.data.isAdmin === false, 'Active customer login returns isAdmin: false');
    assert(activeLogin.data.role === 'CUSTOMER', `Active customer login returns explicit role: 'CUSTOMER' (got: ${activeLogin.data.role})`);
    assert(activeLogin.data.user.personalBV === 1200, `Active customer data has personalBV = 1200`);
    assert(activeLogin.data.user.personalRP === 2, `Active customer data has personalRP = 2`);
    const custToken = activeLogin.data.token;

    // 7. Security: Customer Access to Admin Static Pages
    console.log('\n--- TEST GROUP 7: Customer Access Control to /admin ---');
    const custAdminAttempt = await request('GET', '/admin/admin-dashboard.html', null, { Authorization: `Bearer ${custToken}` });
    assert(custAdminAttempt.status === 403, 'Customer token accessing /admin returns HTTP 403 Forbidden');

    // 8. Order Placement & Approval
    console.log('\n--- TEST GROUP 8: Order Placement & Duplicate Prevention ---');
    const placeOrderRes = await request('POST', '/api/orders', { productId: 'P2' }, { Authorization: `Bearer ${custToken}` });
    assert(placeOrderRes.status === 201, 'Customer placing P2 order returns 201 Created');
    assert(placeOrderRes.data.order.status === 'pending', 'Placed order starts as "pending"');
    assert(placeOrderRes.data.order.bv === 600 && placeOrderRes.data.order.rp === 1, 'P2 order has 600 BV and 1 RP');
    const newOrderId = placeOrderRes.data.order.id;

    // Admin approves order
    const approveOrderRes = await request('PATCH', `/api/orders/${newOrderId}/complete`, null, { Authorization: `Bearer ${adminToken}` });
    assert(approveOrderRes.status === 200, 'Admin approving order returns 200 OK');
    assert(approveOrderRes.data.order.status === 'completed', 'Approved order status is "completed"');

    // Duplicate prevention check
    const dupApproveRes = await request('PATCH', `/api/orders/${newOrderId}/complete`, null, { Authorization: `Bearer ${adminToken}` });
    assert(dupApproveRes.status === 400, 'Re-completing order is rejected with HTTP 400');
    assert(dupApproveRes.data.error.includes('already completed'), 'Re-completion returns "already completed" error');

    // 9. Admin Product Creation & Editing
    console.log('\n--- TEST GROUP 9: Admin Add & Edit Product Endpoints ---');
    const newProdPayload = {
      name: 'Test Wellness Package',
      price: '8000',
      category: 'Wellness',
      stock: '50',
      bv: '960',
      rp: '1.6',
      referralIncome: '816',
      description: 'Test product for automated verification',
      items: ['Item 1', 'Item 2'],
      active: true
    };
    const addProdRes = await request('POST', '/api/products', newProdPayload, { Authorization: `Bearer ${adminToken}` });
    assert(addProdRes.status === 201, 'Admin adding product returns 201 Created');
    const createdProdId = addProdRes.data.product.id;
    assert(addProdRes.data.product.bv === 960 && addProdRes.data.product.rp === 1.6, 'Added product persisted with custom BV and RP');

    // Edit Product
    const editProdRes = await request('PUT', `/api/products/${createdProdId}`, { price: 8500, stock: 75, bv: 1020, rp: 1.7 }, { Authorization: `Bearer ${adminToken}` });
    assert(editProdRes.status === 200, 'Admin editing product returns 200 OK');
    assert(editProdRes.data.product.price === 8500, 'Edited product price updated in database');
    assert(editProdRes.data.product.stock === 75, 'Edited product stock updated in database');
    assert(editProdRes.data.product.bv === 1020, 'Edited product BV updated in database');

    // 10. Dedicated Admin Pages Verification
    console.log('\n--- TEST GROUP 10: Dedicated Admin Pages & Unified Badges ---');
    const detailsPageExists = fs.existsSync(path.join(__dirname, '../admin/admin-customer-details.html'));
    assert(detailsPageExists, 'admin/admin-customer-details.html exists');

    const addProductPageExists = fs.existsSync(path.join(__dirname, '../admin/admin-product-add.html'));
    assert(addProductPageExists, 'admin/admin-product-add.html exists');

    const editProductPageExists = fs.existsSync(path.join(__dirname, '../admin/admin-product-edit.html'));
    assert(editProductPageExists, 'admin/admin-product-edit.html exists');

    const cssContent = fs.readFileSync(path.join(__dirname, '../assets/css/style.css'), 'utf-8');
    assert(cssContent.includes('.badge-status-active') && cssContent.includes('.badge-status-pending'), 'style.css contains unified status badges (.badge-status-active, .badge-status-pending)');
    assert(cssContent.includes('.badge-status-verified') && cssContent.includes('.badge-status-review'), 'style.css contains unified KYC badges (.badge-status-verified, .badge-status-review)');

    console.log(`\n=============================================================`);
    console.log(`ALL TESTS PASSED! (${passed}/${total} assertions successful)`);
    console.log(`=============================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error('\nFAILED TEST EXECUTION:', err.message);
    process.exit(1);
  }
}

runTests();
