/**
 * Great Goals Lifestyle Pvt. Ltd.
 * Persistent Backend Server & REST API
 * server.js
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const KYC_UPLOADS_DIR = path.join(UPLOADS_DIR, 'kyc');
const PRODUCT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'products');
const PROFILE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'profiles');

[DATA_DIR, UPLOADS_DIR, KYC_UPLOADS_DIR, PRODUCT_UPLOADS_DIR, PROFILE_UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve product uploads publicly for display
app.use('/uploads/products', express.static(PRODUCT_UPLOADS_DIR));
app.use('/uploads/profiles', express.static(PROFILE_UPLOADS_DIR));

// ─── File Upload Configurations ──────────────────────────────────────────────
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, KYC_UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'KYC_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, uniqueName);
  }
});

const uploadKYC = multer({
  storage: kycStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images (JPG, PNG, WebP) and PDF documents are allowed'));
  }
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'PROD_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, uniqueName);
  }
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'USER_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, uniqueName);
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── Database Operations (Atomic Disk Sync) ──────────────────────────────────
function hashPwd(p) {
  return Buffer.from(p).toString('base64');
}

function getDefaultDB() {
  return {
    version: '2.0.0',
    products: [
      {
        id: 'P1',
        name: 'Wedding Banarasi Saree & Pant Suit (₹10,000)',
        price: 10000,
        category: 'Package',
        stock: 100,
        bv: 1200,
        rp: 2.0,
        referralIncome: 1020,
        grossReferral: 1200,
        serviceTax: 180,
        image: 'assets/images/p1_10000.jpg',
        description: 'Elite Wedding Edition saree & premiere fabric package with 5x Customer Travel Discount Vouchers.',
        items: [
          '1x Kanchipuram Wedding Saree OR Banarasi Silk Saree',
          '1x Premier Pant & Shirt Piece',
          '5x Customer Travel Discount Voucher (CTDV @ ₹2,000 each = ₹10,000 value)',
          '1x Business ID & Password (Instant Binary Genealogy Placement)'
        ],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'P2',
        name: 'Banarasi Saree OR Suite Length (₹5,000)',
        price: 5000,
        category: 'Package',
        stock: 100,
        bv: 600,
        rp: 1.0,
        referralIncome: 510,
        grossReferral: 600,
        serviceTax: 90,
        image: 'assets/images/p2_5000.jpg',
        description: 'Popular Starter Package with pure Banarasi Saree or Suite length plus 3x CTDV Vouchers.',
        items: [
          '1x Banarasi Saree OR Suite Length (Choice of Colour & Pattern)',
          '3x Customer Travel Discount Voucher (CTDV @ ₹2,000 each = ₹6,000 value)',
          '1x Business ID & Password (Instant Binary Genealogy Placement)'
        ],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    members: [
      {
        id: 'GG00001',
        name: 'Great Goals Admin',
        phone: '9110871460',
        email: 'greatgoalslifestyle@gmail.com',
        password: hashPwd('Admin@1234'),
        sponsorId: 'Root',
        position: 'root',
        parentId: null,
        leftMemberId: null,
        rightMemberId: null,
        leftBV: 0,
        rightBV: 0,
        leftRP: 0,
        rightRP: 0,
        leftCarryForward: 0,
        rightCarryForward: 0,
        leftMemberCount: 0,
        rightMemberCount: 0,
        referralIncome: 0,
        binaryIncome: 0,
        incomeWallet: 0,
        activationWallet: 0,
        successWithdrawals: 0,
        matchedPairs: 0,
        rank: 'Chairman',
        achievementIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        status: 'active',
        kycStatus: 'VERIFIED',
        kycRejectionReason: '',
        kycSubmittedAt: new Date().toISOString(),
        kycReviewedAt: new Date().toISOString(),
        kycDocuments: [],
        profile: {
          dob: '1990-01-01',
          gender: 'male',
          address: 'Municipal Corp Main Road, Naragund Dt',
          city: 'Gadag',
          state: 'Karnataka',
          pincode: '582207',
          country: 'India',
          photo: ''
        },
        isAdmin: true,
        packageId: 'P1',
        joinedAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    kyc_documents: [],
    orders: [],
    withdrawals: [],
    notifications: []
  };
}

let db = null;

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    db = getDefaultDB();
    saveDB();
    return db;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
    if (!db.products || !db.members || !db.kyc_documents) {
      db = Object.assign(getDefaultDB(), db);
      saveDB();
    }
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
    db = getDefaultDB();
    saveDB();
  }
  return db;
}

function saveDB() {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

// Initial DB load
loadDB();

// ─── BINARY MLM & BV/RP CALCULATION ENGINE ─────────────────────────────────
const RP_TO_BV = 600;
const BINARY_MATCH_PER_RP = 600;

const ACHIEVEMENTS = [
  { id: 1,  name: 'Silver',        bv: 6000,     rewardValue: 0 },
  { id: 2,  name: 'Gold',          bv: 12000,    rewardValue: 0 },
  { id: 3,  name: 'Platinum',      bv: 36000,    rewardValue: 0 },
  { id: 4,  name: 'Ruby',          bv: 72000,    rewardValue: 13000 },
  { id: 5,  name: 'Emerald',       bv: 300000,   rewardValue: 50000 },
  { id: 6,  name: 'Diamond',       bv: 600000,   rewardValue: 0 },
  { id: 7,  name: 'Blue Diamond',  bv: 1800000,  rewardValue: 300000 },
  { id: 8,  name: 'Royal Diamond', bv: 3600000,  rewardValue: 690000 },
  { id: 9,  name: 'Ambassador',    bv: 6000000,  rewardValue: 5000 },
  { id: 10, name: 'Chairman',      bv: 12000000, rewardValue: 1500000 }
];

function propagateBVBackend(fromMemberId, bv, rp) {
  let member = db.members.find(m => m.id.toUpperCase() === fromMemberId.toUpperCase());
  while (member && member.parentId) {
    const parent = db.members.find(m => m.id.toUpperCase() === member.parentId.toUpperCase());
    if (!parent) break;

    const pos = (member.position || '').toLowerCase();
    if (pos === 'left') {
      parent.leftBV = (parent.leftBV || 0) + bv;
      parent.leftRP = +(parent.leftBV / RP_TO_BV).toFixed(2);
      parent.leftMemberCount = (parent.leftMemberCount || 0) + 1;
    } else {
      parent.rightBV = (parent.rightBV || 0) + bv;
      parent.rightRP = +(parent.rightBV / RP_TO_BV).toFixed(2);
      parent.rightMemberCount = (parent.rightMemberCount || 0) + 1;
    }

    // Binary matching calculation
    const leftRP = (parent.leftBV || 0) / RP_TO_BV;
    const rightRP = (parent.rightBV || 0) / RP_TO_BV;
    const matched = Math.floor(Math.min(leftRP, rightRP));
    const prev = parent.matchedPairs || 0;
    const newMatch = matched - prev;

    if (newMatch > 0) {
      const income = newMatch * BINARY_MATCH_PER_RP;
      parent.binaryIncome = (parent.binaryIncome || 0) + income;
      parent.incomeWallet = (parent.incomeWallet || 0) + income;
      parent.matchedPairs = matched;
    }

    if (leftRP > rightRP) {
      parent.leftCarryForward = +(leftRP - matched).toFixed(2);
      parent.rightCarryForward = 0;
    } else {
      parent.rightCarryForward = +(rightRP - matched).toFixed(2);
      parent.leftCarryForward = 0;
    }

    // Check rank milestones
    const weakBV = Math.min(parent.leftBV || 0, parent.rightBV || 0);
    for (const ach of [...ACHIEVEMENTS].reverse()) {
      if (weakBV >= ach.bv) {
        parent.achievementIds = parent.achievementIds || [];
        if (!parent.achievementIds.includes(ach.id)) {
          parent.achievementIds.push(ach.id);
          if (ach.rewardValue > 0) {
            parent.incomeWallet = (parent.incomeWallet || 0) + ach.rewardValue;
          }
        }
        parent.rank = ach.name;
        break;
      }
    }

    parent.totalBV = (parent.leftBV || 0) + (parent.rightBV || 0) + (parent.personalBV || 0);
    parent.totalRP = +(parent.totalBV / RP_TO_BV).toFixed(2);
    parent.updatedAt = new Date().toISOString();

    member = parent;
  }
}

function completeOrderBackend(orderId) {
  db.orders = db.orders || [];
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  if (order.status === 'completed') {
    return { success: false, error: 'Order is already completed' };
  }

  order.status = 'completed';
  order.completedAt = new Date().toISOString();

  const member = db.members.find(m => m.id.toUpperCase() === order.memberId.toUpperCase());
  if (member) {
    member.packageId = order.productId;
    member.personalBV = (member.personalBV || 0) + (order.bv || 0);
    member.personalRP = (member.personalRP || 0) + (order.rp || 0);
    member.totalBV = (member.leftBV || 0) + (member.rightBV || 0) + (member.personalBV || 0);
    member.totalRP = +(member.totalBV / RP_TO_BV).toFixed(2);

    // Sponsor referral income
    if (member.sponsorId) {
      const sponsor = db.members.find(m => m.id.toUpperCase() === member.sponsorId.toUpperCase());
      const prod = (db.products || []).find(p => p.id === order.productId);
      if (sponsor && prod) {
        const ref = prod.referralIncome || (prod.price >= 10000 ? 1020 : (prod.price >= 5000 ? 510 : Math.round(prod.price * 0.102)));
        sponsor.referralIncome = (sponsor.referralIncome || 0) + ref;
        sponsor.incomeWallet = (sponsor.incomeWallet || 0) + ref;
        sponsor.updatedAt = new Date().toISOString();
      }
    }

    // Propagate BV and RP up the binary tree
    propagateBVBackend(member.id, order.bv || 0, order.rp || 0);
    member.updatedAt = new Date().toISOString();
  }

  // Mark pending notifications as read
  db.notifications = db.notifications || [];
  db.notifications.forEach(n => {
    if (n.orderId === orderId) n.read = true;
  });

  saveDB();
  return { success: true, order };
}

// ─── AUTHENTICATION & ROLE MIDDLEWARE ─────────────────────────────────────────
function getSession(req) {
  let token = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }
  if (!token) return null;
  db.sessions = db.sessions || {};
  return db.sessions[token] || null;
}

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please login.' });
  }
  req.user = session;
  next();
}

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (session && (session.isAdmin || session.role === 'ADMIN')) {
    req.user = session;
    return next();
  }
  if (session && !session.isAdmin && session.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin authorization required. Access denied.' });
  }
  return res.status(401).json({ success: false, error: 'Authentication required. Please login as admin.' });
}

function requireSelfOrAdmin(req, res, next) {
  const session = getSession(req);
  const targetId = (req.params.id || '').toUpperCase();
  if (session) {
    if (!session.isAdmin && session.role !== 'ADMIN' && session.id.toUpperCase() !== targetId) {
      return res.status(403).json({ success: false, error: 'Access denied. You can only manage your own account.' });
    }
    req.user = session;
    return next();
  }
  return res.status(401).json({ success: false, error: 'Authentication required. Please login.' });
}

// ─── API ROUTES ──────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: db.version });
});

// 1. PRODUCTS API
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const p = db.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

app.post('/api/products', requireAdmin, uploadProduct.single('productImage'), (req, res) => {
  try {
    const { name, price, category, stock, bv, rp, referralIncome, description, items, active } = req.body;

    if (!name || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'Product name and valid price are required' });
    }

    const priceNum = parseFloat(price);
    const id = 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    let itemsArr = [];
    if (Array.isArray(items)) {
      itemsArr = items;
    } else if (typeof items === 'string') {
      try { itemsArr = JSON.parse(items); } catch(e) { itemsArr = items.split('\n').map(s=>s.trim()).filter(Boolean); }
    }

    let imagePath = '';
    if (req.file) {
      imagePath = 'uploads/products/' + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    } else {
      imagePath = priceNum >= 10000 ? 'assets/images/p1_10000.jpg' : 'assets/images/p2_5000.jpg';
    }

    const newProduct = {
      id,
      name: name.trim(),
      price: priceNum,
      category: category || 'Package',
      stock: parseInt(stock, 10) >= 0 ? parseInt(stock, 10) : 100,
      bv: parseFloat(bv) || (priceNum >= 10000 ? 1200 : 600),
      rp: parseFloat(rp) || (priceNum >= 10000 ? 2 : 1),
      referralIncome: parseFloat(referralIncome) || (priceNum >= 10000 ? 1020 : 510),
      description: (description || '').trim(),
      items: itemsArr,
      image: imagePath,
      active: active === 'true' || active === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.push(newProduct);
    saveDB();

    res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      product: newProduct
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product: ' + err.message });
  }
});

app.put('/api/products/:id', requireAdmin, uploadProduct.single('productImage'), (req, res) => {
  try {
    const idx = db.products.findIndex(x => x.id.toUpperCase() === req.params.id.toUpperCase());
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const p = db.products[idx];
    const { name, price, category, stock, bv, rp, referralIncome, description, items, active } = req.body;

    if (name) p.name = name.trim();
    if (price !== undefined && !isNaN(parseFloat(price))) p.price = parseFloat(price);
    if (category) p.category = category;
    if (stock !== undefined && !isNaN(parseInt(stock, 10))) p.stock = parseInt(stock, 10);
    if (bv !== undefined && !isNaN(parseFloat(bv))) p.bv = parseFloat(bv);
    if (rp !== undefined && !isNaN(parseFloat(rp))) p.rp = parseFloat(rp);
    if (referralIncome !== undefined && !isNaN(parseFloat(referralIncome))) p.referralIncome = parseFloat(referralIncome);
    if (description !== undefined) p.description = description.trim();
    if (active !== undefined) p.active = active === 'true' || active === true;

    if (items !== undefined) {
      if (Array.isArray(items)) {
        p.items = items;
      } else if (typeof items === 'string') {
        try { p.items = JSON.parse(items); } catch(e) { p.items = items.split('\n').map(s=>s.trim()).filter(Boolean); }
      }
    }

    if (req.file) {
      p.image = 'uploads/products/' + req.file.filename;
    } else if (req.body.image && req.body.image !== p.image) {
      p.image = req.body.image;
    }

    p.updatedAt = new Date().toISOString();
    db.products[idx] = p;
    saveDB();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: p
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product: ' + err.message });
  }
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const idx = db.products.findIndex(x => x.id.toUpperCase() === req.params.id.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  // Check if orders exist
  const hasOrders = db.orders.some(o => o.productId === req.params.id);
  if (hasOrders) {
    return res.status(400).json({ error: 'Cannot delete product with existing customer orders' });
  }

  const deleted = db.products.splice(idx, 1)[0];
  saveDB();
  res.json({ success: true, message: 'Product deleted successfully', product: deleted });
});

function formatCustomerResponse(m) {
  if (!m) return null;
  const copy = Object.assign({}, m);
  delete copy.password;
  copy.role = m.isAdmin ? 'ADMIN' : 'CUSTOMER';
  copy.personalBV = m.personalBV || 0;
  copy.personalRP = m.personalRP || 0;
  copy.leftBV = m.leftBV || 0;
  copy.rightBV = m.rightBV || 0;
  copy.leftRP = m.leftRP || 0;
  copy.rightRP = m.rightRP || 0;
  copy.totalBV = (m.leftBV || 0) + (m.rightBV || 0) + (m.personalBV || 0);
  copy.totalRP = +(copy.totalBV / RP_TO_BV).toFixed(2);
  return copy;
}

// 2. CUSTOMERS API
app.get('/api/customers', (req, res) => {
  const safeMembers = db.members.map(formatCustomerResponse);
  res.json(safeMembers);
});

app.get('/api/customers/:id', (req, res) => {
  const m = db.members.find(x => x.id.toUpperCase() === req.params.id.toUpperCase());
  if (!m) return res.status(404).json({ error: 'Customer not found' });
  res.json(formatCustomerResponse(m));
});

app.post('/api/customers/register', (req, res) => {
  try {
    const { sponsorId, position, name, email, phone, password, productId } = req.body;

    if (!sponsorId || !position || !name || !phone || !password) {
      return res.status(400).json({ error: 'All required registration fields must be provided' });
    }

    const sponsor = db.members.find(m => m.id.toUpperCase() === sponsorId.toUpperCase());
    if (!sponsor) {
      return res.status(400).json({ error: 'Invalid Sponsor ID. Sponsor does not exist.' });
    }

    const pos = position.toLowerCase();
    if (pos !== 'left' && pos !== 'right') {
      return res.status(400).json({ error: 'Position must be left or right' });
    }

    // Auto generate ID
    const count = db.members.length + 1;
    const newId = 'GG' + String(count).padStart(5, '0');

    // Link sponsor binary tree slot if empty
    if (pos === 'left' && !sponsor.leftMemberId) {
      sponsor.leftMemberId = newId;
    } else if (pos === 'right' && !sponsor.rightMemberId) {
      sponsor.rightMemberId = newId;
    }
    sponsor.updatedAt = new Date().toISOString();

    const newMember = {
      id: newId,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      password: hashPwd(password),
      sponsorId: sponsor.id,
      position: pos,
      parentId: sponsor.id,
      leftMemberId: null,
      rightMemberId: null,
      leftBV: 0,
      rightBV: 0,
      leftRP: 0,
      rightRP: 0,
      personalBV: 0,
      personalRP: 0,
      totalBV: 0,
      totalRP: 0,
      leftCarryForward: 0,
      rightCarryForward: 0,
      leftMemberCount: 0,
      rightMemberCount: 0,
      referralIncome: 0,
      binaryIncome: 0,
      incomeWallet: 0,
      activationWallet: 0,
      successWithdrawals: 0,
      matchedPairs: 0,
      rank: null,
      achievementIds: [],
      status: 'pending', // DEFAULT STATUS IS PENDING
      role: 'CUSTOMER',
      kycStatus: 'NOT_SUBMITTED',
      kycRejectionReason: '',
      kycSubmittedAt: null,
      kycReviewedAt: null,
      kycDocuments: [],
      profile: {
        dob: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        photo: ''
      },
      isAdmin: false,
      packageId: productId || null,
      joinedAt: new Date().toISOString(),
      activatedAt: null,
      updatedAt: new Date().toISOString()
    };

    db.members.push(newMember);

    // If package selected, create initial pending order
    if (productId) {
      const prod = (db.products || []).find(p => p.id === productId);
      if (prod) {
        db.orders = db.orders || [];
        const orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
        db.orders.push({
          id: orderId,
          memberId: newId,
          memberName: name.trim(),
          productId: prod.id,
          productName: prod.name,
          price: prod.price,
          bv: prod.bv || (prod.price >= 10000 ? 1200 : 600),
          rp: prod.rp || (prod.price >= 10000 ? 2 : 1),
          paymentMethod: 'Registration Package',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }

    // Notify admin
    db.notifications.unshift({
      id: 'NOTIF_' + Date.now(),
      type: 'customer_registration',
      title: 'New Customer Registration (Pending Approval)',
      message: `Customer ${name} (${newId}) registered with Sponsor ${sponsor.id}. Account is PENDING approval.`,
      referenceId: newId,
      customerName: name,
      createdAt: new Date().toISOString(),
      read: false
    });

    saveDB();

    res.status(201).json({
      success: true,
      memberId: newId,
      status: 'pending',
      message: 'Account registered successfully and waiting for administrator approval.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'Member ID and Password are required' });
  }

  if (id.toLowerCase() === 'admin' && password === 'Admin@1234') {
    const token = 'tok_adm_' + crypto.randomBytes(24).toString('hex');
    db.sessions = db.sessions || {};
    db.sessions[token] = { id: 'admin', name: 'Administrator', isAdmin: true, role: 'ADMIN', createdAt: new Date().toISOString() };
    saveDB();
    return res.json({
      success: true,
      token,
      isAdmin: true,
      role: 'ADMIN',
      user: { id: 'admin', name: 'Administrator', isAdmin: true, role: 'ADMIN' }
    });
  }

  const member = db.members.find(m => m.id.toUpperCase() === id.toUpperCase());
  if (!member) {
    return res.status(401).json({ success: false, msg: 'Member ID not found' });
  }

  if (member.password !== hashPwd(password)) {
    return res.status(401).json({ success: false, msg: 'Incorrect password' });
  }

  if (member.status === 'pending') {
    return res.status(403).json({
      success: false,
      pending: true,
      msg: 'Account Pending Approval: Your account has been registered successfully and is currently waiting for administrator approval. You will be able to access your account after the administrator activates it.'
    });
  }

  if (member.status === 'inactive') {
    return res.status(403).json({
      success: false,
      inactive: true,
      msg: 'Your account is currently INACTIVE / DEACTIVATED by the administrator. Please contact Great Goals support.'
    });
  }

  const formattedUser = formatCustomerResponse(member);
  const token = 'tok_mbr_' + crypto.randomBytes(24).toString('hex');
  db.sessions = db.sessions || {};
  db.sessions[token] = { id: member.id, name: member.name, isAdmin: !!member.isAdmin, role: member.isAdmin ? 'ADMIN' : 'CUSTOMER', createdAt: new Date().toISOString() };
  saveDB();

  res.json({
    success: true,
    token,
    isAdmin: !!member.isAdmin,
    role: member.isAdmin ? 'ADMIN' : 'CUSTOMER',
    user: formattedUser
  });
});

// Activate / Deactivate Customer
app.patch('/api/customers/:id/status', requireAdmin, (req, res) => {
  const member = db.members.find(m => m.id.toUpperCase() === req.params.id.toUpperCase());
  if (!member) return res.status(404).json({ error: 'Customer not found' });

  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive' && status !== 'pending') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  member.status = status;
  if (status === 'active') {
    if (!member.activatedAt) {
      member.activatedAt = new Date().toISOString();
    }
    // Auto-complete pending registration orders for this member
    db.orders = db.orders || [];
    const pendingOrders = db.orders.filter(o => o.memberId.toUpperCase() === member.id.toUpperCase() && o.status === 'pending');
    for (const ord of pendingOrders) {
      completeOrderBackend(ord.id);
    }
  }
  member.updatedAt = new Date().toISOString();

  // Mark pending notifications as read
  db.notifications.forEach(n => {
    if (n.referenceId === member.id && n.type === 'customer_registration') n.read = true;
  });

  saveDB();

  res.json({
    success: true,
    message: `Customer status updated to ${status.toUpperCase()}`,
    member: formatCustomerResponse(member)
  });
});

// Update Customer Profile
app.put('/api/customers/:id/profile', requireSelfOrAdmin, uploadProfile.single('profilePhoto'), (req, res) => {
  const member = db.members.find(m => m.id.toUpperCase() === req.params.id.toUpperCase());
  if (!member) return res.status(404).json({ error: 'Customer not found' });

  const { name, email, phone, dob, gender, address, city, state, pincode, country } = req.body;

  if (name) member.name = name.trim();
  if (email !== undefined) member.email = email.trim();
  if (phone) member.phone = phone.trim();

  member.profile = member.profile || {};
  if (dob !== undefined) member.profile.dob = dob;
  if (gender !== undefined) member.profile.gender = gender;
  if (address !== undefined) member.profile.address = address;
  if (city !== undefined) member.profile.city = city;
  if (state !== undefined) member.profile.state = state;
  if (pincode !== undefined) member.profile.pincode = pincode;
  if (country !== undefined) member.profile.country = country;

  if (req.file) {
    member.profile.photo = 'uploads/profiles/' + req.file.filename;
  } else if (req.body.photo) {
    member.profile.photo = req.body.photo;
  }

  member.updatedAt = new Date().toISOString();
  saveDB();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    photoUrl: member.profile.photo,
    member: { id: member.id, name: member.name, email: member.email, phone: member.phone, profile: member.profile }
  });
});

// 3. KYC MANAGEMENT API
// Get Customer KYC
app.get('/api/customers/:id/kyc', requireSelfOrAdmin, (req, res) => {
  const member = db.members.find(m => m.id.toUpperCase() === req.params.id.toUpperCase());
  if (!member) return res.status(404).json({ error: 'Customer not found' });

  // Get all documents for this customer from kyc_documents table
  const docs = db.kyc_documents.filter(d => d.customerId.toUpperCase() === member.id.toUpperCase());

  res.json({
    customerId: member.id,
    customerName: member.name,
    customerEmail: member.email,
    kycStatus: member.kycStatus || 'NOT_SUBMITTED',
    rejectionReason: member.kycRejectionReason || '',
    submittedAt: member.kycSubmittedAt,
    reviewedAt: member.kycReviewedAt,
    documents: docs
  });
});

// Customer uploads a KYC document
app.post('/api/customers/:id/kyc', requireSelfOrAdmin, uploadKYC.single('documentFile'), (req, res) => {
  try {
    const member = db.members.find(m => m.id.toUpperCase() === req.params.id.toUpperCase());
    if (!member) return res.status(404).json({ error: 'Customer not found' });

    const { documentType, documentNumber } = req.body;
    if (!documentType || !documentNumber) {
      return res.status(400).json({ error: 'Document type and document number are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded or invalid file type' });
    }

    const docId = 'KYCDOC_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const docRecord = {
      id: docId,
      customerId: member.id,
      customerName: member.name,
      customerEmail: member.email,
      documentType: documentType.trim(),
      documentNumber: documentNumber.trim(),
      documentFile: req.file.filename,
      documentOriginalName: req.file.originalname,
      documentMime: req.file.mimetype,
      documentSize: req.file.size,
      documentStatus: 'UNDER_REVIEW',
      rejectionReason: '',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.kyc_documents.push(docRecord);

    // Update customer KYC status
    member.kycStatus = 'UNDER_REVIEW';
    member.kycSubmittedAt = new Date().toISOString();
    member.kycRejectionReason = '';

    // Synchronize member.kycDocuments array
    member.kycDocuments = db.kyc_documents.filter(d => d.customerId === member.id).map(d => ({
      id: d.id,
      docType: d.documentType,
      docNumber: d.documentNumber,
      fileName: d.documentOriginalName,
      fileRef: d.id,
      status: d.documentStatus,
      uploadedAt: d.uploadedAt
    }));

    member.updatedAt = new Date().toISOString();

    // Dispatch Admin Notification
    db.notifications.unshift({
      id: 'NOTIF_' + Date.now(),
      type: 'kyc_submission',
      title: 'New KYC Document Submitted',
      message: `Customer ${member.name} (${member.id}) uploaded ${documentType} (${documentNumber}). Status is UNDER REVIEW.`,
      referenceId: member.id,
      customerName: member.name,
      createdAt: new Date().toISOString(),
      read: false
    });

    saveDB();

    res.status(201).json({
      success: true,
      message: 'KYC document uploaded successfully and submitted for review.',
      document: docRecord,
      kycStatus: member.kycStatus
    });
  } catch (err) {
    console.error('KYC upload error:', err);
    res.status(500).json({ error: 'Failed to upload KYC: ' + err.message });
  }
});

// Admin views all KYC records
app.get('/api/admin/kyc', requireAdmin, (req, res) => {
  const records = db.kyc_documents.map(d => {
    const customer = db.members.find(m => m.id === d.customerId);
    return {
      id: d.id,
      customerId: d.customerId,
      customerName: customer ? customer.name : d.customerName,
      customerEmail: customer ? customer.email : d.customerEmail,
      customerPhone: customer ? customer.phone : '',
      customerAccountStatus: customer ? customer.status : 'active',
      overallKycStatus: customer ? customer.kycStatus : d.documentStatus,
      documentType: d.documentType,
      documentNumber: d.documentNumber,
      documentOriginalName: d.documentOriginalName,
      documentStatus: d.documentStatus,
      rejectionReason: d.rejectionReason,
      uploadedAt: d.uploadedAt,
      viewUrl: `/api/kyc/document/${d.id}`
    };
  });

  // Sort: UNDER_REVIEW first, then newest
  records.sort((a, b) => {
    if (a.documentStatus === 'UNDER_REVIEW' && b.documentStatus !== 'UNDER_REVIEW') return -1;
    if (b.documentStatus === 'UNDER_REVIEW' && a.documentStatus !== 'UNDER_REVIEW') return 1;
    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
  });

  res.json(records);
});

// Admin reviews KYC (Verify or Reject with reason)
app.put('/api/customers/:id/kyc/review', requireAdmin, (req, res) => {
  const member = db.members.find(m => m.id.toUpperCase() === req.params.id.toUpperCase());
  if (!member) return res.status(404).json({ error: 'Customer not found' });

  const { status, reason } = req.body;
  if (status !== 'VERIFIED' && status !== 'REJECTED') {
    return res.status(400).json({ error: 'Status must be VERIFIED or REJECTED' });
  }

  if (status === 'REJECTED' && (!reason || !reason.trim())) {
    return res.status(400).json({ error: 'Rejection reason is required when rejecting KYC' });
  }

  member.kycStatus = status;
  member.kycReviewedAt = new Date().toISOString();
  member.kycRejectionReason = status === 'REJECTED' ? reason.trim() : '';

  // Update all documents for this customer
  db.kyc_documents.forEach(d => {
    if (d.customerId.toUpperCase() === member.id.toUpperCase()) {
      d.documentStatus = status;
      d.rejectionReason = member.kycRejectionReason;
      d.updatedAt = new Date().toISOString();
    }
  });

  member.kycDocuments = db.kyc_documents.filter(d => d.customerId === member.id).map(d => ({
    id: d.id,
    docType: d.documentType,
    docNumber: d.documentNumber,
    fileName: d.documentOriginalName,
    fileRef: d.id,
    status: d.documentStatus,
    uploadedAt: d.uploadedAt
  }));

  member.updatedAt = new Date().toISOString();

  // Mark KYC notification as read
  db.notifications.forEach(n => {
    if (n.referenceId === member.id && n.type === 'kyc_submission') n.read = true;
  });

  saveDB();

  res.json({
    success: true,
    message: `Customer KYC status updated to ${status}.`,
    kycStatus: member.kycStatus,
    rejectionReason: member.kycRejectionReason
  });
});

// Secure Document Viewer Route
app.get('/api/kyc/document/:docId', (req, res) => {
  const doc = db.kyc_documents.find(d => d.id === req.params.docId);
  if (!doc) return res.status(404).send('KYC Document record not found');

  const filePath = path.join(KYC_UPLOADS_DIR, doc.documentFile);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Document file not found on server storage');
  }

  res.setHeader('Content-Type', doc.documentMime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${doc.documentOriginalName}"`);
  res.sendFile(filePath);
});

// Delete a KYC document (for re-uploading if rejected)
app.delete('/api/kyc/:docId', (req, res) => {
  const idx = db.kyc_documents.findIndex(d => d.id === req.params.docId);
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });

  const doc = db.kyc_documents[idx];
  const filePath = path.join(KYC_UPLOADS_DIR, doc.documentFile);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) {}
  }

  db.kyc_documents.splice(idx, 1);

  // Update customer's document array
  const member = db.members.find(m => m.id === doc.customerId);
  if (member) {
    const remaining = db.kyc_documents.filter(d => d.customerId === member.id);
    member.kycDocuments = remaining.map(d => ({
      id: d.id,
      docType: d.documentType,
      docNumber: d.documentNumber,
      fileName: d.documentOriginalName,
      fileRef: d.id,
      status: d.documentStatus,
      uploadedAt: d.uploadedAt
    }));
    if (remaining.length === 0) {
      member.kycStatus = 'NOT_SUBMITTED';
    }
    member.updatedAt = new Date().toISOString();
  }

  saveDB();
  res.json({ success: true, message: 'Document removed' });
});

// 4. NOTIFICATIONS API
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const n = db.notifications.find(x => x.id === req.params.id);
  if (n) { n.read = true; saveDB(); }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  db.notifications.forEach(n => n.read = true);
  saveDB();
  res.json({ success: true });
});

// 5. STATS API
app.get('/api/stats/admin', (req, res) => {
  const nonAdmin = db.members.filter(m => !m.isAdmin);
  const orders = db.orders;
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const withdrawals = db.withdrawals;
  const pendingWD = withdrawals.filter(w => w.status === 'pending');

  res.json({
    totalMembers: nonAdmin.length,
    activeMembers: nonAdmin.filter(m => m.status === 'active').length,
    pendingMembers: nonAdmin.filter(m => m.status === 'pending').length,
    inactiveMembers: nonAdmin.filter(m => m.status === 'inactive').length,
    kycPending: nonAdmin.filter(m => m.kycStatus === 'UNDER_REVIEW').length,
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    totalRevenue: completedOrders.reduce((s, o) => s + (o.price || 0), 0),
    pendingWD: pendingWD.length,
    totalWDAmount: withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + (w.amount || 0), 0),
    unreadNotifs: db.notifications.filter(n => !n.read).length
  });
});

// 6. ORDERS API
app.get('/api/orders', requireAuth, (req, res) => {
  db.orders = db.orders || [];
  const { memberId } = req.query;
  if (memberId) {
    if (!req.user.isAdmin && req.user.role !== 'ADMIN' && req.user.id.toUpperCase() !== memberId.toUpperCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const filtered = db.orders.filter(o => o.memberId.toUpperCase() === memberId.toUpperCase());
    return res.json(filtered);
  }
  if (!req.user.isAdmin && req.user.role !== 'ADMIN') {
    const filtered = db.orders.filter(o => o.memberId.toUpperCase() === req.user.id.toUpperCase());
    return res.json(filtered);
  }
  res.json(db.orders);
});

app.post('/api/orders', requireAuth, (req, res) => {
  try {
    const { memberId, productId, paymentMethod } = req.body;
    const targetMemberId = memberId || req.user.id;
    if (!req.user.isAdmin && req.user.role !== 'ADMIN' && req.user.id.toUpperCase() !== targetMemberId.toUpperCase()) {
      return res.status(403).json({ error: 'Cannot place order for another customer' });
    }
    const member = db.members.find(m => m.id.toUpperCase() === targetMemberId.toUpperCase());
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const prod = (db.products || []).find(p => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrder = {
      id: orderId,
      memberId: member.id,
      memberName: member.name,
      productId: prod.id,
      productName: prod.name,
      price: prod.price,
      bv: prod.bv || (prod.price >= 10000 ? 1200 : 600),
      rp: prod.rp || (prod.price >= 10000 ? 2 : 1),
      paymentMethod: paymentMethod || 'Online Transfer',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.orders = db.orders || [];
    db.orders.unshift(newOrder);

    // Notification for admin
    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: 'NOTIF_' + Date.now(),
      type: 'order_placement',
      title: 'New Product Order Placed',
      message: `${member.name} (${member.id}) placed order for ${prod.name} (₹${prod.price.toLocaleString('en-IN')}). Requires approval.`,
      referenceId: newOrder.id,
      orderId: newOrder.id,
      customerName: member.name,
      createdAt: new Date().toISOString(),
      read: false
    });

    saveDB();
    res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order: ' + err.message });
  }
});

app.patch('/api/orders/:id/complete', requireAdmin, (req, res) => {
  const result = completeOrderBackend(req.params.id);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }
  res.json({ success: true, message: 'Order approved and BV/RP distributed.', order: result.order });
});

app.patch('/api/orders/:id/reject', requireAdmin, (req, res) => {
  db.orders = db.orders || [];
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status === 'completed') {
    return res.status(400).json({ error: 'Cannot reject an already completed order' });
  }
  order.status = 'rejected';
  order.rejectedAt = new Date().toISOString();
  saveDB();
  res.json({ success: true, message: 'Order rejected', order });
});

// Route security for admin static HTML files
app.use('/admin', (req, res, next) => {
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/i)) {
    return next();
  }
  let token = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }
  if (token) {
    const session = db.sessions && db.sessions[token];
    if (session && !session.isAdmin && session.role !== 'ADMIN') {
      return res.status(403).send('Forbidden: Access Denied. Customers cannot access admin portal.');
    }
  }
  next();
});

// Serve frontend static files
app.use(express.static(__dirname));

// Start server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Great Goals Lifestyle Backend Server Running`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Database: ${DB_FILE}`);
  console.log(`KYC Storage: ${KYC_UPLOADS_DIR}`);
  console.log(`Product Storage: ${PRODUCT_UPLOADS_DIR}`);
  console.log(`====================================================`);
});

app.server = server;
app.db = db;
module.exports = app;
module.exports.app = app;
module.exports.server = server;
module.exports.db = db;
