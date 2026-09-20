/**
 * Great Goals Lifestyle Pvt. Ltd.
 * Core Application Logic — app.js
 * All data is stored in localStorage (JSON).
 */

const APP = {
  KEYS: {
    DATA_VERSION: 'gg_v4_royal_gold_fresh',
    MEMBERS:      'gg_members',
    PRODUCTS:     'gg_products',
    ORDERS:       'gg_orders',
    WITHDRAWALS:  'gg_withdrawals',
    NOTIFICATIONS:'gg_notifications',
    CURRENT_USER: 'gg_current_user'
  },

  RP_TO_BV: 600,
  REFERRAL_RATE: 0.12,          // 12 % of package price
  BINARY_MATCH_PER_RP: 600,    // ₹600 income per matched RP pair
  DAILY_CEILING: 10200,         // ₹10,200 per day capping
  TAX_SERVICE_DEDUCTION: 0.15, // 15% TDS + Service Charge

  LPB_INFO: {
    title: 'Leadership Performance Bonus (LPB) — 5%',
    titleKn: 'ಎಲ್.ಪಿ.ಬಿ (ಲೀಡರ್‌ಶಿಪ್ ಪರ್ಫಾಮೆನ್ಸ್ ಬೋನಸ್) — 5%',
    desc: '5% of total company achievers turnover is distributed among Ruby and higher achievers according to rank.',
    descKn: 'ಗ್ರೇಟ್‌ಗೋಲ್ಸ್ ಸಂಸ್ಥೆಯ ಅಚೀವರ್ಸ್ ಆದ ಟೀಮಿನ ಒಟ್ಟು ಮೊತ್ತದ 5% ವನ್ನು ರೂಬಿ ಮತ್ತು ಹೆಚ್ಚಿನ ಸಾಧಕರಿಗೆ ಅವರ ರ್ಯಾಂಕ್ ಅನುಗುಣವಾಗಿ ಹಂಚಲಾಗುತ್ತದೆ.'
  },

  ACHIEVEMENTS: [
    { id:1,  name:'Silver',       nameKn:'ಸಿಲ್ವರ್',        rp5k:10,    rp10k:5,     bv:6000,     commission:6000,     reward:'1 Bag + T-Shirt Complete Felicitation', rewardKn:'1 ಬ್ಯಾಗ್ + ಟಿ ಶರ್ಟ್ ಕಂಪ್ಲೀಟ್ ಸನ್ಮಾನ', rewardValue:0,       totalEarnings:6000,     color:'#94a3b8', icon:'🥈' },
    { id:2,  name:'Gold',         nameKn:'ಗೋಲ್ಡ್',         rp5k:20,    rp10k:10,    bv:12000,    commission:12000,    reward:'10 Gram Silver with Locket',            rewardKn:'10 ಗ್ರಾಂ ಬೆಳ್ಳಿಯ ಜೊತೆಗೆ ಲಾಕೆಟ್',      rewardValue:0,       totalEarnings:12000,    color:'#f59e0b', icon:'🥇' },
    { id:3,  name:'Platinum',     nameKn:'ಪ್ಲಾಟಿನಮ್',     rp5k:60,    rp10k:30,    bv:36000,    commission:36000,    reward:'Goa Tour 3D/2N',                        rewardKn:'ಗೋವಾ ಟೂರ್ 3D/2N',                     rewardValue:0,       totalEarnings:36000,    color:'#0ea5e9', icon:'⚪' },
    { id:4,  name:'Ruby',         nameKn:'ರೂಬಿ (ಮಾಣಿಕ್ಯ)', rp5k:120,   rp10k:60,    bv:72000,    commission:72000,    reward:'Mini Laptop (₹13,000)',                 rewardKn:'ಮಿನಿ ಲ್ಯಾಪ್‌ಟಾಪ್ (13000 ರೂಪಾಯಿ)',       rewardValue:13000,   totalEarnings:85000,    color:'#e11d48', icon:'🔴' },
    { id:5,  name:'Emerald',      nameKn:'ಎಮರಾಲ್ಡ್',       rp5k:500,   rp10k:250,   bv:300000,   commission:300000,   reward:'Bike Fund (₹50,000)',                   rewardKn:'ಬೈಕ್ ಫಂಡ್ (50000 ರೂಪಾಯಿ)',             rewardValue:50000,   totalEarnings:350000,   color:'#059669', icon:'🟢' },
    { id:6,  name:'Diamond',      nameKn:'ಡೈಮಂಡ್',         rp5k:1000,  rp10k:500,   bv:600000,   commission:600000,   reward:'Free Thailand Trip OR 10g Gold',        rewardKn:'ಉಚಿತ ಥೈಲ್ಯಾಂಡ್ ಪ್ರವಾಸ ಅಥವಾ 10 ಗ್ರಾಂ ಬಂಗಾರ', rewardValue:0,    totalEarnings:600000,   color:'#06b6d4', icon:'💎' },
    { id:7,  name:'Blue Diamond', nameKn:'ಬ್ಲೂಡೈಮಂಡ್',     rp5k:3000,  rp10k:1500,  bv:1800000,  commission:1800000,  reward:'Mini Car Fund (₹3 Lakh)',               rewardKn:'ಮಿನಿ ಕಾರ್ ಫಂಡ್ (3 ಲಕ್ಷ)',              rewardValue:300000,  totalEarnings:2100000,  color:'#2563eb', icon:'🔷' },
    { id:8,  name:'Royal Diamond',nameKn:'ರಾಯಲ್ ಡೈಮಂಡ್',   rp5k:6000,  rp10k:3000,  bv:3600000,  commission:3600000,  reward:'Luxury Car Fund (₹6.90 Lakh)',          rewardKn:'ಲಕ್ಸೂರಿ ಕಾರ್ ಫಂಡ್ (6.90 ಲಕ್ಷ)',         rewardValue:690000,  totalEarnings:4290000,  color:'#7c3aed', icon:'👑' },
    { id:9,  name:'Ambassador',   nameKn:'ಅಂಬಾಸಡರ್',       rp5k:10000, rp10k:5000,  bv:6000000,  commission:6000000,  reward:'Monthly ₹5,000 Honorarium',             rewardKn:'ಪ್ರತಿ ತಿಂಗಳು 5000 ಗೌರವಧನ',             rewardValue:5000,    totalEarnings:6005000,  color:'#d97706', icon:'🎖️' },
    { id:10, name:'Chairman',     nameKn:'ಚೇರಮನ್',         rp5k:20000, rp10k:10000, bv:12000000, commission:12000000, reward:'House Fund (₹15 Lakh)',                 rewardKn:'ಹೌಸ್ ಫಂಡ್ (15 ಲಕ್ಷ)',                  rewardValue:1500000, totalEarnings:13500000, color:'#be185d', icon:'🏆' }
  ],

  // ─── Utility ───────────────────────────────────────────────────────────────
  hashPwd(p)        { return btoa(unescape(encodeURIComponent(p))); },
  verifyPwd(p,h)    { return this.hashPwd(p) === h; },
  fmt(n)            { return Number(n||0).toFixed(2); },
  fmtINR(n)         { return '₹' + Number(n||0).toLocaleString('en-IN'); },

  generateId() {
    const members = this.getMembers();
    const num = String(members.length + 1).padStart(5, '0');
    return 'GG' + num;
  },

  // ─── Init & Fresh Data Reset ────────────────────────────────────────────────
  init() {
    const version = localStorage.getItem(this.KEYS.DATA_VERSION);
    if (version !== 'gg_v4_royal_gold_fresh') {
      this.resetToFreshData();
      return;
    }
    if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
      this.saveProducts(this._defaultProducts());
    }
  },

  resetToFreshData() {
    // Wipes all demo data and initializes with clean seed data
    localStorage.removeItem(this.KEYS.MEMBERS);
    localStorage.removeItem(this.KEYS.PRODUCTS);
    localStorage.removeItem(this.KEYS.ORDERS);
    localStorage.removeItem(this.KEYS.WITHDRAWALS);
    localStorage.removeItem(this.KEYS.NOTIFICATIONS);
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    localStorage.setItem(this.KEYS.DATA_VERSION, 'gg_v4_royal_gold_fresh');

    const p1Pwd = this.hashPwd('Admin@1234');
    const p2Pwd = this.hashPwd('123456');

    // Root Admin (GG00001)
    const m1 = this._blankMember('GG00001', 'Great Goals Admin', '9110871460', p1Pwd, null, null);
    m1.isAdmin = true;
    m1.status = 'active';
    m1.packageId = 'P1';
    m1.leftMemberId = 'GG00002';
    m1.rightMemberId = 'GG00003';
    m1.leftBV = 6000;
    m1.rightBV = 6000;
    m1.leftRP = 10.0;
    m1.rightRP = 10.0;
    m1.leftMemberCount = 1;
    m1.rightMemberCount = 1;
    m1.referralIncome = 2040;
    m1.binaryIncome = 6000;
    m1.incomeWallet = 8040;
    m1.successWithdrawals = 0;
    m1.matchedPairs = 10;
    m1.leftCarryForward = 0;
    m1.rightCarryForward = 0;
    m1.rank = 'Silver';
    m1.achievementIds = [1];

    // Left Child (GG00002)
    const m2 = this._blankMember('GG00002', 'Ramesh Patil', '9876543210', p2Pwd, 'GG00001', 'left');
    m2.packageId = 'P1';
    m2.leftBV = 0; m2.rightBV = 0;
    m2.leftRP = 0; m2.rightRP = 0;
    m2.incomeWallet = 0;

    // Right Child (GG00003)
    const m3 = this._blankMember('GG00003', 'Suresh Kulkarni', '9845012345', p2Pwd, 'GG00001', 'right');
    m3.packageId = 'P2';
    m3.leftBV = 0; m3.rightBV = 0;
    m3.leftRP = 0; m3.rightRP = 0;
    m3.incomeWallet = 0;

    this.saveMembers([m1, m2, m3]);
    this.saveProducts(this._defaultProducts());

    const sampleOrders = [
      { id:'ORD10001', memberId:'GG00002', memberName:'Ramesh Patil', productId:'P1', productName:'Premium Plus Package ₹10,000', price:10000, bv:1200, rp:1, status:'completed', createdAt:new Date(Date.now()-86400000*2).toISOString() },
      { id:'ORD10002', memberId:'GG00003', memberName:'Suresh Kulkarni', productId:'P2', productName:'Standard Package ₹5,000', price:5000, bv:600, rp:1, status:'completed', createdAt:new Date(Date.now()-86400000).toISOString() }
    ];
    this.saveOrders(sampleOrders);
    this.saveWithdrawals([]);
    this.saveNotifications([]);
  },

  _defaultProducts() {
    return [
      {
        id:'P1', name:'Premium Plus Package ₹10,000', price:10000, bv:1200, rp:1,
        grossReferral:1200, serviceTax:180, referralIncome:1020,
        image:'assets/images/p1_10000.jpg',
        badge:'MOST POPULAR',
        description:'1200 BV package requiring only half RP pairs for rank milestones.',
        items:[
          '1× Kanchipuram Wedding Saree',
          '1× Premier Pant & Shirt Piece',
          '5× Compact Tour Discount Voucher (CTDV) @ ₹2,000 each',
          '1× Business ID & Business Password'
        ],
        active:true
      },
      {
        id:'P2', name:'Standard Package ₹5,000', price:5000, bv:600, rp:1,
        grossReferral:600, serviceTax:90, referralIncome:510,
        image:'assets/images/p2_5000.jpg',
        badge:'STARTER CHOICE',
        description:'600 BV package with textile products and travel vouchers.',
        items:[
          '1× Banarasi Saree OR 1× Suite Length',
          '3× Compact Tour Discount Voucher (CTDV) @ ₹6,000 printed value',
          '1× Business ID & Business Password'
        ],
        active:true
      }
    ];
  },

  _blankMember(id, name, phone, hashedPwd, sponsorId, position) {
    return {
      id, name, phone, password: hashedPwd,
      sponsorId, position, parentId: sponsorId,
      leftMemberId: null, rightMemberId: null,
      leftBV: 0, rightBV: 0, leftRP: 0, rightRP: 0,
      leftCarryForward: 0, rightCarryForward: 0,
      leftMemberCount: 0, rightMemberCount: 0,
      referralIncome: 0, binaryIncome: 0,
      incomeWallet: 0, activationWallet: 0,
      successWithdrawals: 0, matchedPairs: 0,
      rank: null, achievementIds: [],
      status: 'active', isAdmin: false,
      packageId: null,
      joinedAt: new Date().toISOString()
    };
  },

  // ─── Members ───────────────────────────────────────────────────────────────
  getMembers()       { return JSON.parse(localStorage.getItem(this.KEYS.MEMBERS) || '[]'); },
  saveMembers(arr)   { localStorage.setItem(this.KEYS.MEMBERS, JSON.stringify(arr)); },
  getMemberById(id)  {
    if(!id) return null;
    return this.getMembers().find(m => m.id.toUpperCase() === id.toUpperCase()) || null;
  },

  updateMember(updated) {
    const arr = this.getMembers();
    const i = arr.findIndex(m => m.id.toUpperCase() === updated.id.toUpperCase());
    if (i !== -1) { arr[i] = updated; this.saveMembers(arr); }
  },

  deleteMember(id) {
    this.saveMembers(this.getMembers().filter(m => m.id.toUpperCase() !== id.toUpperCase()));
  },

  // ─── Products ──────────────────────────────────────────────────────────────
  getProducts()       { return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS) || '[]'); },
  saveProducts(arr)   { localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(arr)); },
  getProductById(id)  { return this.getProducts().find(p => p.id === id) || null; },

  addProduct(product) {
    const arr = this.getProducts();
    product.id = 'P' + Date.now();
    arr.push(product);
    this.saveProducts(arr);
    return product;
  },

  updateProduct(updated) {
    const arr = this.getProducts();
    const i = arr.findIndex(p => p.id === updated.id);
    if (i !== -1) { arr[i] = updated; this.saveProducts(arr); }
  },

  deleteProduct(id) {
    this.saveProducts(this.getProducts().filter(p => p.id !== id));
  },

  // ─── Orders ────────────────────────────────────────────────────────────────
  getOrders()      { return JSON.parse(localStorage.getItem(this.KEYS.ORDERS) || '[]'); },
  saveOrders(arr)  { localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(arr)); },

  // When a customer orders or an admin places an order:
  // autoApprove = false by default for customers -> sets status 'pending', notifies admin.
  // autoApprove = true for admin instant order placement.
  placeOrder(memberId, productId, autoApprove = false) {
    const member  = this.getMemberById(memberId);
    const product = this.getProductById(productId);
    if (!member)  return { success:false, msg:'Member not found' };
    if (!product) return { success:false, msg:'Product not found' };

    const status = autoApprove ? 'completed' : 'pending';
    const order = {
      id: 'ORD' + Date.now(), memberId, memberName: member.name,
      productId, productName: product.name, price: product.price,
      bv: product.bv, rp: product.rp,
      status,
      createdAt: new Date().toISOString(),
      completedAt: autoApprove ? new Date().toISOString() : null
    };

    const orders = this.getOrders();
    orders.push(order);
    this.saveOrders(orders);

    if (autoApprove) {
      // Direct activation
      const m = this.getMemberById(memberId);
      m.packageId = productId;
      this.updateMember(m);
      this._propagateBV(memberId, product.bv, product.rp);
    } else {
      // Send notification message to Admin
      this.addNotification({
        type: 'order_pending',
        title: 'New Product Order Placed (Pending)',
        message: `${member.name} (${member.id}) ordered ${product.name} (₹${product.price.toLocaleString('en-IN')}). Awaiting admin verification.`,
        orderId: order.id,
        memberId: member.id,
        productId: product.id,
        amount: product.price,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    return { success:true, order, status };
  },

  completeOrder(orderId) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return { success:false, msg:'Order not found' };

    const order = orders[idx];
    if (order.status === 'completed') return { success:false, msg:'Order is already completed' };

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    this.saveOrders(orders);

    // Activate member package
    const member = this.getMemberById(order.memberId);
    if (member) {
      member.packageId = order.productId;
      this.updateMember(member);

      // Sponsor referral income bonus upon completion
      if (member.sponsorId) {
        const sponsor = this.getMemberById(member.sponsorId);
        const product = this.getProductById(order.productId);
        if (sponsor && product) {
          const ref = product.referralIncome || (product.price >= 10000 ? 1020 : (product.price >= 5000 ? 510 : Math.round(product.price * 0.102)));
          sponsor.referralIncome = (sponsor.referralIncome || 0) + ref;
          sponsor.incomeWallet   = (sponsor.incomeWallet   || 0) + ref;
          this.updateMember(sponsor);
        }
      }

      // Propagate BV and RP up the binary tree
      this._propagateBV(member.id, order.bv, order.rp);
    }

    // Mark corresponding notification as handled
    this.markOrderNotificationsRead(orderId);

    return { success:true, order };
  },

  rejectOrder(orderId, reason = 'Verification failed') {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return { success:false, msg:'Order not found' };

    orders[idx].status = 'rejected';
    orders[idx].rejectedReason = reason;
    orders[idx].rejectedAt = new Date().toISOString();
    this.saveOrders(orders);

    this.markOrderNotificationsRead(orderId);
    return { success:true, order:orders[idx] };
  },

  // ─── Notifications ─────────────────────────────────────────────────────────
  getNotifications() {
    return JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS) || '[]');
  },
  saveNotifications(arr) {
    localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(arr));
  },
  addNotification(notif) {
    notif.id = 'NOTIF' + Date.now();
    const notifs = this.getNotifications();
    notifs.unshift(notif); // latest first
    this.saveNotifications(notifs);
    return notif;
  },
  getUnreadNotificationsCount() {
    return this.getNotifications().filter(n => !n.read).length;
  },
  markNotificationRead(notifId) {
    const notifs = this.getNotifications();
    const n = notifs.find(item => item.id === notifId);
    if (n) { n.read = true; this.saveNotifications(notifs); }
  },
  markOrderNotificationsRead(orderId) {
    const notifs = this.getNotifications();
    notifs.forEach(n => { if (n.orderId === orderId) n.read = true; });
    this.saveNotifications(notifs);
  },
  clearNotifications() {
    this.saveNotifications([]);
  },

  // ─── Binary Tree BV Propagation ────────────────────────────────────────────
  _propagateBV(fromMemberId, bv, rp) {
    let member = this.getMemberById(fromMemberId);
    while (member && member.parentId) {
      const parent = this.getMemberById(member.parentId);
      if (!parent) break;

      if (member.position === 'left') {
        parent.leftBV           = (parent.leftBV || 0) + bv;
        parent.leftRP           = (parent.leftRP || 0) + rp;
        parent.leftMemberCount  = (parent.leftMemberCount || 0) + 1;
      } else {
        parent.rightBV          = (parent.rightBV || 0) + bv;
        parent.rightRP          = (parent.rightRP || 0) + rp;
        parent.rightMemberCount = (parent.rightMemberCount || 0) + 1;
      }

      this._checkBinaryMatch(parent);
      this._checkRank(parent);
      this.updateMember(parent);
      member = parent;
    }
  },

  _checkBinaryMatch(m) {
    const leftTotal  = (m.leftRP  || 0) + (m.leftCarryForward  || 0);
    const rightTotal = (m.rightRP || 0) + (m.rightCarryForward || 0);
    const matched    = Math.floor(Math.min(leftTotal, rightTotal));
    const prev       = m.matchedPairs || 0;
    const newMatch   = matched - prev;

    if (newMatch > 0) {
      const income = newMatch * this.BINARY_MATCH_PER_RP;
      m.binaryIncome   = (m.binaryIncome   || 0) + income;
      m.incomeWallet   = (m.incomeWallet   || 0) + income;
      m.matchedPairs   = matched;

      if (leftTotal > rightTotal) {
        m.leftCarryForward  = +(leftTotal - rightTotal).toFixed(2);
        m.rightCarryForward = 0;
      } else {
        m.rightCarryForward = +(rightTotal - leftTotal).toFixed(2);
        m.leftCarryForward  = 0;
      }
    }
  },

  _checkRank(m) {
    const weakBV = Math.min(m.leftBV || 0, m.rightBV || 0);
    for (const ach of [...this.ACHIEVEMENTS].reverse()) {
      if (weakBV >= ach.bv) {
        if (!(m.achievementIds || []).includes(ach.id)) {
          m.achievementIds = m.achievementIds || [];
          m.achievementIds.push(ach.id);
          if (ach.rewardValue > 0) {
            m.incomeWallet = (m.incomeWallet || 0) + ach.rewardValue;
          }
        }
        m.rank = ach.name;
        break;
      }
    }
  },

  // ─── Registration ──────────────────────────────────────────────────────────
  registerMember({ sponsorId, position, name, phone, password, productId }) {
    const members = this.getMembers();
    const sponsor = members.find(m => m.id.toUpperCase() === sponsorId.toUpperCase());
    if (!sponsor) return { success:false, msg:'Sponsor ID not found. Check your Sponsor ID.' };

    const cleanPos = (position || 'left').toLowerCase();
    if (cleanPos === 'left' && sponsor.leftMemberId)
      return { success:false, msg:'Left position is already filled under this sponsor.' };
    if (cleanPos === 'right' && sponsor.rightMemberId)
      return { success:false, msg:'Right position is already filled under this sponsor.' };

    const newId     = this.generateId();
    const newMember = this._blankMember(newId, name, phone, this.hashPwd(password), sponsor.id, cleanPos);
    if (productId) newMember.packageId = productId;

    // Strictly update sponsor's slot based on chosen position
    if (cleanPos === 'left') {
      sponsor.leftMemberId  = newId;
    } else {
      sponsor.rightMemberId = newId;
    }

    // Referral income for sponsor after deducting service charge & tax:
    // ₹10,000 package -> ₹1,020 (₹180 tax/service charge deducted from ₹1,200)
    // ₹5,000 package -> ₹510 (₹90 tax/service charge deducted from ₹600)
    if (productId) {
      const product = this.getProductById(productId) ||
        this.getProducts().find(p => p.id === productId);
      if (product) {
        const ref = product.referralIncome || (product.price >= 10000 ? 1020 : (product.price >= 5000 ? 510 : Math.round(product.price * 0.102)));
        sponsor.referralIncome = (sponsor.referralIncome || 0) + ref;
        sponsor.incomeWallet   = (sponsor.incomeWallet   || 0) + ref;
      }
    }

    const si = members.findIndex(m => m.id.toUpperCase() === sponsor.id.toUpperCase());
    members[si] = sponsor;
    members.push(newMember);
    this.saveMembers(members);

    // Place order + propagate BV
    if (productId) {
      const product = this.getProductById(productId) ||
        this.getProducts().find(p => p.id === productId);
      if (product) {
        const order = {
          id:'ORD'+Date.now(), memberId:newId, memberName:name,
          productId, productName:product.name, price:product.price,
          bv:product.bv, rp:product.rp,
          status:'completed', createdAt:new Date().toISOString(), completedAt:new Date().toISOString()
        };
        const orders = this.getOrders();
        orders.push(order);
        this.saveOrders(orders);
        this._propagateBV(newId, product.bv, product.rp);
      }
    }

    return { success:true, memberId:newId };
  },

  // ─── Withdrawals ───────────────────────────────────────────────────────────
  getWithdrawals()     { return JSON.parse(localStorage.getItem(this.KEYS.WITHDRAWALS) || '[]'); },
  saveWithdrawals(arr) { localStorage.setItem(this.KEYS.WITHDRAWALS, JSON.stringify(arr)); },

  requestWithdrawal(memberId, amount, bankDetails) {
    const member = this.getMemberById(memberId);
    if (!member) return { success:false, msg:'Member not found' };
    if (!amount || amount < 100) return { success:false, msg:'Minimum withdrawal is ₹100' };
    if ((member.incomeWallet || 0) < amount) return { success:false, msg:'Insufficient wallet balance' };

    member.incomeWallet -= amount;
    this.updateMember(member);

    const wd = {
      id:'WD'+Date.now(), memberId, memberName:member.name,
      amount, bankDetails, status:'pending',
      requestedAt:new Date().toISOString(), processedAt:null
    };
    const arr = this.getWithdrawals();
    arr.push(wd);
    this.saveWithdrawals(arr);
    return { success:true, wd };
  },

  approveWithdrawal(wdId) {
    const arr = this.getWithdrawals();
    const i   = arr.findIndex(w => w.id === wdId);
    if (i === -1) return { success:false, msg:'Not found' };
    arr[i].status      = 'approved';
    arr[i].processedAt = new Date().toISOString();
    this.saveWithdrawals(arr);
    const m = this.getMemberById(arr[i].memberId);
    if (m) { m.successWithdrawals = (m.successWithdrawals||0) + arr[i].amount; this.updateMember(m); }
    return { success:true };
  },

  rejectWithdrawal(wdId) {
    const arr = this.getWithdrawals();
    const i   = arr.findIndex(w => w.id === wdId);
    if (i === -1) return { success:false, msg:'Not found' };
    arr[i].status      = 'rejected';
    arr[i].processedAt = new Date().toISOString();
    this.saveWithdrawals(arr);
    const m = this.getMemberById(arr[i].memberId);
    if (m) { m.incomeWallet = (m.incomeWallet||0) + arr[i].amount; this.updateMember(m); }
    return { success:true };
  },

  // ─── Auth ──────────────────────────────────────────────────────────────────
  login(id, password) {
    if (id.toLowerCase() === 'admin' && password === 'Admin@1234') {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify({ id:'admin', isAdmin:true }));
      return { success:true, isAdmin:true };
    }
    const member = this.getMemberById(id.toUpperCase());
    if (!member)                           return { success:false, msg:'Member ID not found' };
    if (!this.verifyPwd(password, member.password))
                                           return { success:false, msg:'Incorrect password' };
    if (member.status === 'inactive') {
      return {
        success:false,
        inactive:true,
        msg:'Your account is currently INACTIVE / DEACTIVATED by the administrator. Please contact Great Goals support for reactivation.'
      };
    }
    localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify({ id:member.id, isAdmin:false }));
    return { success:true, isAdmin:false, member };
  },

  setMemberStatus(memberId, status) {
    const member = this.getMemberById(memberId);
    if (!member) return { success:false, msg:'Member not found' };
    member.status = status;
    this.updateMember(member);
    return { success:true, member };
  },

  logout() { localStorage.removeItem(this.KEYS.CURRENT_USER); },

  getCurrentSession() {
    const s = localStorage.getItem(this.KEYS.CURRENT_USER);
    return s ? JSON.parse(s) : null;
  },

  getCurrentUser() {
    const s = this.getCurrentSession();
    if (!s) return null;
    if (s.isAdmin) return { id:'admin', name:'Administrator', isAdmin:true };
    return this.getMemberById(s.id);
  },

  isLoggedIn()   { return !!this.getCurrentSession(); },
  isAdminLoggedIn() {
    const s = this.getCurrentSession();
    return s && s.isAdmin;
  },

  requireAuth(redirectTo = '../login.html') {
    if (!this.isLoggedIn()) { window.location.href = redirectTo; return false; }
    return true;
  },

  requireAdmin(redirectTo = '../login.html') {
    if (!this.isAdminLoggedIn()) { window.location.href = redirectTo; return false; }
    return true;
  },

  requireMember(redirectTo = 'login.html') {
    const s = this.getCurrentSession();
    if (!s) { window.location.href = redirectTo; return false; }
    return true;
  },

  // ─── Tree Data Retrieval ───────────────────────────────────────────────────
  getTreeNode(memberId, depth = 4) {
    if (!memberId || depth === 0) return null;
    const m = this.getMemberById(memberId);
    if (!m) return null;
    return {
      id: m.id, name: m.name, rank: m.rank || 'New',
      status: m.status, packageId: m.packageId,
      leftBV: m.leftBV || 0, rightBV: m.rightBV || 0,
      leftRP: m.leftRP || 0, rightRP: m.rightRP || 0,
      left:  this.getTreeNode(m.leftMemberId,  depth - 1),
      right: this.getTreeNode(m.rightMemberId, depth - 1)
    };
  },

  // ─── Member Order Helpers ──────────────────────────────────────────────────
  getMemberOrders(memberId) {
    if (!memberId) return [];
    return this.getOrders().filter(o => (o.memberId || '').toUpperCase() === memberId.toUpperCase());
  },

  isMemberOrdered(memberId) {
    if (!memberId) return false;
    const orders = this.getMemberOrders(memberId);
    if (orders.length > 0) return true;
    const m = this.getMemberById(memberId);
    return !!(m && m.packageId);
  },

  // ─── Stats for admin ───────────────────────────────────────────────────────
  getAdminStats() {
    const members     = this.getMembers().filter(m => !m.isAdmin);
    const orders      = this.getOrders();
    const withdrawals = this.getWithdrawals();
    const orderedIds  = new Set(orders.filter(o => o.status === 'completed').map(o => (o.memberId || '').toUpperCase()));
    const orderedMembers = members.filter(m => orderedIds.has(m.id.toUpperCase()) || !!m.packageId);
    const notOrderedMembers = members.filter(m => !orderedIds.has(m.id.toUpperCase()) && !m.packageId);
    const pendingOrders = orders.filter(o => o.status === 'pending');

    return {
      totalMembers:       members.length,
      activeMembers:      members.filter(m => m.status === 'active').length,
      inactiveMembers:    members.filter(m => m.status === 'inactive').length,
      orderedMembers:     orderedMembers.length,
      notOrderedMembers:  notOrderedMembers.length,
      totalOrders:        orders.length,
      pendingOrders:      pendingOrders.length,
      completedOrders:    orders.filter(o => o.status === 'completed').length,
      totalRevenue:       orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.price || 0), 0),
      pendingWD:          withdrawals.filter(w => w.status === 'pending').length,
      totalWDAmount:      withdrawals.filter(w => w.status === 'approved').reduce((s,w) => s + w.amount, 0),
      unreadNotifs:       this.getUnreadNotificationsCount()
    };
  }
};

// Boot
APP.init();
