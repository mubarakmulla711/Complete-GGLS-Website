/**
 * Great Goals Lifestyle Pvt. Ltd.
 * Core Application Logic — app.js
 * All data is stored in localStorage (JSON).
 */

const APP = {
  KEYS: {
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

  ACHIEVEMENTS: [
    { id:1,  name:'Silver',          bv:1200,     rp:2,     commission:1200,     reward:1200,    totalEarnings:2400,     rewardTitle:'Cash Reward',                 color:'#94a3b8', icon:'🥈' },
    { id:2,  name:'Gold',            bv:6000,     rp:10,    commission:6000,     reward:5000,    totalEarnings:11000,    rewardTitle:'Tablet / Cash Fund',          color:'#f59e0b', icon:'🥇' },
    { id:3,  name:'Platinum',        bv:18000,    rp:30,    commission:18000,    reward:15000,   totalEarnings:33000,    rewardTitle:'Laptop Fund',                 color:'#0ea5e9', icon:'⚪' },
    { id:4,  name:'Ruby',            bv:60000,    rp:100,   commission:60000,    reward:40000,   totalEarnings:100000,   rewardTitle:'Bike Fund',                   color:'#e11d48', icon:'🔴' },
    { id:5,  name:'Emerald',         bv:180000,   rp:300,   commission:180000,   reward:100000,  totalEarnings:280000,   rewardTitle:'Foreign Tour Fund',           color:'#059669', icon:'🟢' },
    { id:6,  name:'Diamond',         bv:600000,   rp:1000,  commission:600000,   reward:250000,  totalEarnings:850000,   rewardTitle:'Gold Fund',                   color:'#06b6d4', icon:'💎' },
    { id:7,  name:'Blue Diamond',    bv:1800000,  rp:3000,  commission:1800000,  reward:600000,  totalEarnings:2400000,  rewardTitle:'Car Fund',                    color:'#2563eb', icon:'🔷' },
    { id:8,  name:'Royal Diamond',   bv:4500000,  rp:7500,  commission:4500000,  reward:1200000, totalEarnings:5700000,  rewardTitle:'Luxury Car Fund',             color:'#7c3aed', icon:'👑' },
    { id:9,  name:'Ambassador',      bv:9000000,  rp:15000, commission:9000000,  reward:2000000, totalEarnings:11000000, rewardTitle:'Dream House Fund',            color:'#d97706', icon:'🎖️' },
    { id:10, name:'Chairman',        bv:12000000, rp:20000, commission:12000000, reward:3600000, totalEarnings:15600000, rewardTitle:'Chairman Villa / Super Car Fund', color:'#be185d', icon:'🏆' }
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

  // ─── Init ──────────────────────────────────────────────────────────────────
  init() {
    const existingMembers = localStorage.getItem(this.KEYS.MEMBERS);
    // If empty or only 1 member without child tree links, seed realistic full binary network
    if (!existingMembers || JSON.parse(existingMembers).length <= 1) {
      const p1Pwd = this.hashPwd('Admin@1234');
      const p2Pwd = this.hashPwd('123456');

      // Root Member (GG00001)
      const m1 = this._blankMember('GG00001', 'Great Goals Admin', '9110871460', p1Pwd, null, null);
      m1.isAdmin = true;
      m1.status = 'active';
      m1.packageId = 'P1';
      m1.leftMemberId = 'GG00002';
      m1.rightMemberId = 'GG00003';
      m1.leftBV = 1800;
      m1.rightBV = 1500;
      m1.leftRP = 3.0;
      m1.rightRP = 2.5;
      m1.leftMemberCount = 3;
      m1.rightMemberCount = 2;
      m1.referralIncome = 3600;
      m1.binaryIncome = 1500;
      m1.incomeWallet = 3000;
      m1.successWithdrawals = 1200;
      m1.matchedPairs = 2;
      m1.leftCarryForward = 300;
      m1.rightCarryForward = 0;
      m1.rank = 'Silver';
      m1.achievementIds = [1];

      // Left Child (GG00002)
      const m2 = this._blankMember('GG00002', 'Ramesh Patil', '9876543210', p2Pwd, 'GG00001', 'left');
      m2.packageId = 'P1';
      m2.leftMemberId = 'GG00004';
      m2.rightMemberId = 'GG00005';
      m2.leftBV = 600;
      m2.rightBV = 600;
      m2.leftRP = 1.0;
      m2.rightRP = 1.0;
      m2.leftMemberCount = 1;
      m2.rightMemberCount = 1;
      m2.incomeWallet = 1200;
      m2.referralIncome = 1200;
      m2.binaryIncome = 600;

      // Right Child (GG00003)
      const m3 = this._blankMember('GG00003', 'Suresh Kulkarni', '9845012345', p2Pwd, 'GG00001', 'right');
      m3.packageId = 'P2';
      m3.leftMemberId = 'GG00006';
      m3.rightMemberId = null;
      m3.leftBV = 600;
      m3.rightBV = 0;
      m3.leftRP = 1.0;
      m3.rightRP = 0;
      m3.leftMemberCount = 1;
      m3.rightMemberCount = 0;
      m3.incomeWallet = 600;
      m3.referralIncome = 600;

      // Level 2 Children
      const m4 = this._blankMember('GG00004', 'Anand Kumar', '9741234567', p2Pwd, 'GG00002', 'left');
      m4.packageId = 'P1';
      m4.leftBV = 0; m4.rightBV = 0;

      const m5 = this._blankMember('GG00005', 'Vijay Sharma', '9611223344', p2Pwd, 'GG00002', 'right');
      m5.packageId = 'P1';
      m5.leftBV = 0; m5.rightBV = 0;

      const m6 = this._blankMember('GG00006', 'Deepa Hegde', '9988776655', p2Pwd, 'GG00003', 'left');
      m6.packageId = null; // Registered member who has NOT ordered yet
      m6.leftBV = 0; m6.rightBV = 0;

      this.saveMembers([m1, m2, m3, m4, m5, m6]);
    }

    // Products configuration with tax & service charge deduction:
    // 10000 pkg: 1200 BV (1 RP), Gross ₹1200 - ₹180 (service charge & tax) = ₹1020 Net Referral
    // 5000 pkg: 600 BV (1 RP), Gross ₹600 - ₹90 (service charge & tax) = ₹510 Net Referral
    const defaultProds = [
      {
        id:'P1', name:'Premium Package ₹10,000', price:10000, bv:1200, rp:1,
        grossReferral:1200, serviceTax:180, referralIncome:1020,
        image:'assets/images/p1_10000.jpg',
        badge:'MOST POPULAR',
        description:'Exclusive lifestyle package with premium textile products and travel vouchers.',
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
        description:'Quality lifestyle package with textile products and travel vouchers.',
        items:[
          '1× Banarasi Saree OR 1× Suite Length',
          '3× Compact Tour Discount Voucher (CTDV) @ ₹6,000 printed value',
          '1× Business ID & Business Password'
        ],
        active:true
      }
    ];

    const currentProds = localStorage.getItem(this.KEYS.PRODUCTS);
    if (!currentProds) {
      this.saveProducts(defaultProds);
    } else {
      // Synchronize existing P1 and P2 in case of existing storage
      const prods = JSON.parse(currentProds);
      const p1 = prods.find(p => p.id === 'P1');
      if (p1) {
        p1.bv = 1200; p1.rp = 1; p1.grossReferral = 1200; p1.serviceTax = 180; p1.referralIncome = 1020;
        p1.image = 'assets/images/p1_10000.jpg'; p1.badge = 'MOST POPULAR';
      }
      const p2 = prods.find(p => p.id === 'P2');
      if (p2) {
        p2.bv = 600; p2.rp = 1; p2.grossReferral = 600; p2.serviceTax = 90; p2.referralIncome = 510;
        p2.image = 'assets/images/p2_5000.jpg'; p2.badge = 'STARTER CHOICE';
      }
      this.saveProducts(prods);
    }

    // Migrate stored member ranks to new 10 rank names
    const savedMembers = localStorage.getItem(this.KEYS.MEMBERS);
    if (savedMembers) {
      const rankMap = {
        'Star': 'Silver',
        'Silver Star': 'Gold',
        'Gold Star': 'Platinum',
        'Black Diamond': 'Diamond',
        'Crown Diamond': 'Royal Diamond',
        'Presidential': 'Chairman'
      };
      let changed = false;
      const mems = JSON.parse(savedMembers);
      mems.forEach(m => {
        if (m.rank && rankMap[m.rank]) {
          m.rank = rankMap[m.rank];
          changed = true;
        }
      });
      if (changed) this.saveMembers(mems);
    }

    const existingOrders = localStorage.getItem(this.KEYS.ORDERS);
    if (!existingOrders || JSON.parse(existingOrders).length === 0) {
      const sampleOrders = [
        { id:'ORD10001', memberId:'GG00002', memberName:'Ramesh Patil', productId:'P1', productName:'Premium Package ₹10,000', price:10000, bv:1200, rp:1, status:'completed', createdAt:new Date(Date.now()-86400000*5).toISOString() },
        { id:'ORD10002', memberId:'GG00003', memberName:'Suresh Kulkarni', productId:'P2', productName:'Standard Package ₹5,000', price:5000, bv:600, rp:1, status:'completed', createdAt:new Date(Date.now()-86400000*4).toISOString() },
        { id:'ORD10003', memberId:'GG00004', memberName:'Anand Kumar', productId:'P1', productName:'Premium Package ₹10,000', price:10000, bv:1200, rp:1, status:'completed', createdAt:new Date(Date.now()-86400000*3).toISOString() },
        { id:'ORD10004', memberId:'GG00005', memberName:'Vijay Sharma', productId:'P1', productName:'Premium Package ₹10,000', price:10000, bv:1200, rp:1, status:'completed', createdAt:new Date(Date.now()-86400000*2).toISOString() }
      ];
      this.saveOrders(sampleOrders);
    }
    if (!localStorage.getItem(this.KEYS.WITHDRAWALS)) this.saveWithdrawals([]);
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
          m.incomeWallet = (m.incomeWallet || 0) + ach.reward;
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

    if (position === 'left'  && sponsor.leftMemberId)
      return { success:false, msg:'Left position is already filled under this sponsor.' };
    if (position === 'right' && sponsor.rightMemberId)
      return { success:false, msg:'Right position is already filled under this sponsor.' };

    const newId     = this.generateId();
    const newMember = this._blankMember(newId, name, phone, this.hashPwd(password), sponsor.id, position);
    if (productId) newMember.packageId = productId;

    // Update sponsor's slot
    if (position === 'left')  sponsor.leftMemberId  = newId;
    else                       sponsor.rightMemberId = newId;

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
          status:'completed', createdAt:new Date().toISOString()
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
