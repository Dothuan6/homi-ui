/**
 * HOMI365 prototype v2 — dữ liệu mẫu & Store (CHANGE SPEC v3)
 *
 * SEED  = dữ liệu mẫu (cây thành viên theo Case 5 sheet, đơn + hoa hồng sinh bằng engine thật).
 * Store = nguồn dữ liệu DUY NHẤT giao diện được đọc/ghi (persist localStorage).
 * Bất biến: Σ hoa hồng mỗi đơn = mức Lithium của bảng hoa hồng gói (3.850.000đ).
 */

const SEED = (function () {
  let seedState = 20260905;
  const rnd = () => { seedState = (seedState * 1103515245 + 12345) & 0x7fffffff; return seedState / 0x7fffffff; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const ri = (min, max) => min + Math.floor(rnd() * (max - min + 1));
  const now = new Date();
  const daysAgo = (d, h) => { const x = new Date(now.getTime() - d * 86400000); x.setHours(h === undefined ? ri(8, 20) : h, ri(0, 59), 0, 0); return x.toISOString(); };
  const ymd = (iso) => { const d = new Date(iso); return String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = (n) => Array.from({ length: n }, () => CHARS[Math.floor(rnd() * CHARS.length)]).join('');
  const PW = CONFIG.demo.agentPassword;
  const BY_RANK = { COPPER: 2000000, SILVER: 3000000, GOLD: 3500000, DIAMOND: 3700000, TITANIUM: 3800000, LITHIUM: 3850000 };

  const packages = [
    { id: 'CN02', name: 'Gói Bác sĩ 24/7', fullName: 'CN02 · Gói Bác sĩ 24/7 (01 năm + đồng hồ HW01)', image: './public/product/og-cover.png',
      desc: 'Bác sĩ trực 24/7 hỗ trợ, tư vấn sức khoẻ khẩn cấp qua ứng dụng HOMI365. Kèm 01 đồng hồ theo dõi sức khoẻ HW01 giao tận nơi.',
      price: 10000000, licenseMonths: 12, hasShipping: true, active: true,
      benefits: ['Bác sĩ trực 24/7, gọi hỗ trợ khẩn cấp', 'Đồng hồ HW01 đo nhịp tim, SpO2, huyết áp', 'Cảnh báo SOS tự động tới người thân', 'Lưu trữ hồ sơ sức khoẻ 10 năm'],
      commissionByRank: { ...BY_RANK },
      commissionVersions: [{ version: 1, effectiveFrom: daysAgo(90, 0), byRank: { ...BY_RANK }, note: 'Bảng hoa hồng khởi tạo theo sheet Logic hoa hồng', by: 'head', at: daysAgo(90, 9) }],
      updatedAt: daysAgo(40, 10) },
    { id: 'CN01', name: 'Gói Theo dõi cơ bản', fullName: 'CN01 · Gói Theo dõi cơ bản (06 tháng)', image: '',
      desc: 'Theo dõi chỉ số sức khoẻ trên ứng dụng, không kèm thiết bị.', price: 3000000, licenseMonths: 6, hasShipping: false, active: false,
      benefits: ['Theo dõi chỉ số trên ứng dụng', 'Nhắc lịch uống thuốc'],
      commissionByRank: { COPPER: 500000, SILVER: 800000, GOLD: 950000, DIAMOND: 1000000, TITANIUM: 1050000, LITHIUM: 1100000 },
      commissionVersions: [{ version: 1, effectiveFrom: daysAgo(90, 0), byRank: { COPPER: 500000, SILVER: 800000, GOLD: 950000, DIAMOND: 1000000, TITANIUM: 1050000, LITHIUM: 1100000 }, note: 'Khởi tạo', by: 'head', at: daysAgo(90, 9) }],
      updatedAt: daysAgo(70, 10) }
  ];

  // ----- Thành viên: cây Case 5 + nhánh breakaway Silver→Silver + nhánh gốc Gold -----
  const users = [];
  const bank = (b, no, owner) => ({ bankName: b, accountNo: no, owner });
  const agent = (o) => {
    const u = Object.assign({ type: 'agent', status: 'active', password: PW, address: '', tcConsent: { version: CONFIG.tc.version, at: o.createdAt }, activatedAt: o.createdAt, cumulativeSales: 0, rankHistory: [] }, o);
    u.purchaseAlias = RULES.purchaseAlias(u.fullName, u.phone);
    u.email = u.email || (RULES.deaccent(u.fullName).toLowerCase().replace(/\s+/g, '.') + '@example.com');
    u.rankSince = u.rankSince || u.createdAt;
    u.rankHistory = [{ at: u.createdAt, from: null, to: 'COPPER', event: 'INIT', by: 'system', reason: 'Kích hoạt thành viên' }].concat(u.rank !== 'COPPER' ? [{ at: u.rankSince, from: 'COPPER', to: u.rank, event: 'PROMOTE', by: 'system', reason: 'Xét hạng cuối tháng (đủ luỹ kế)' }] : []);
    users.push(u); return u;
  };
  agent({ id: 'U001', fullName: 'Nguyễn Văn An', phone: '0908123456', address: '123 Nguyễn Trãi, P. Thanh Xuân, Hà Nội', refCode: 'AN7K2Q', referrerId: null, rank: 'LITHIUM', cumTarget: 34, createdAt: daysAgo(160, 9), rankSince: daysAgo(35, 0), bank: bank('Vietcombank', '0123456789', 'NGUYEN VAN AN') });
  agent({ id: 'U002', fullName: 'Trần Thị Bình', phone: '0912345678', address: '45 Lê Lợi, P. Bến Nghé, TP. Hồ Chí Minh', refCode: 'BINH88', referrerId: 'U001', rank: 'GOLD', cumTarget: 20, createdAt: daysAgo(120, 14), rankSince: daysAgo(35, 0), bank: bank('Techcombank', '19031234567', 'TRAN THI BINH') });
  agent({ id: 'U003', fullName: 'Lê Minh Cường', phone: '0987654321', address: '8 Trần Phú, P. Hải Châu, Đà Nẵng', refCode: 'CUONG3', referrerId: 'U002', rank: 'COPPER', cumTarget: 7, createdAt: daysAgo(55, 10), bank: bank('BIDV', '31410001234', 'LE MINH CUONG') });
  agent({ id: 'U004', fullName: 'Phạm Thu Dung', phone: '0933222111', address: '22 Hùng Vương, P. Lộc Thọ, Nha Trang', refCode: 'DUNG5X', referrerId: 'U002', rank: 'SILVER', cumTarget: 13, createdAt: daysAgo(80, 16), rankSince: daysAgo(35, 0), bank: bank('MBBank', '9704229988', 'PHAM THU DUNG') });
  agent({ id: 'U005', fullName: 'Hoàng Văn Em', phone: '0977000111', address: '5 Điện Biên Phủ, P. Vĩnh Ninh, Huế', refCode: 'EM9QZT', referrerId: 'U002', rank: 'COPPER', cumTarget: 1, createdAt: daysAgo(48, 9), status: 'locked', lockedReason: 'Spam link giới thiệu lên nhóm không liên quan', lockedAt: daysAgo(6, 11), bank: bank('ACB', '22334455', 'HOANG VAN EM') });
  agent({ id: 'U006', fullName: 'Vũ Thị Hoa', phone: '0966111222', address: '12 Ngô Quyền, P. Máy Chai, Hải Phòng', refCode: 'HOA2M4', referrerId: 'U004', rank: 'COPPER', cumTarget: 6, createdAt: daysAgo(40, 13), bank: bank('VPBank', '150012345', 'VU THI HOA') });
  agent({ id: 'U007', fullName: 'Đỗ Văn Giang', phone: '0931000007', address: '90 Lê Duẩn, Cần Thơ', refCode: 'GIANG7', referrerId: 'U001', rank: 'SILVER', cumTarget: 12, createdAt: daysAgo(100, 10), rankSince: daysAgo(65, 0), bank: bank('Agribank', '6600123456', 'DO VAN GIANG') });
  agent({ id: 'U008', fullName: 'Ngô Thị Hạnh', phone: '0931000008', address: '14 Hai Bà Trưng, Hải Phòng', refCode: 'HANH88', referrerId: 'U007', rank: 'SILVER', cumTarget: 11, createdAt: daysAgo(95, 10), rankSince: daysAgo(35, 0), bank: bank('Sacombank', '060012345', 'NGO THI HANH') });
  agent({ id: 'U009', fullName: 'Đặng Văn Khoa', phone: '0931000009', address: '3 Nguyễn Huệ, Bình Dương', refCode: 'KHOA9K', referrerId: 'U008', rank: 'COPPER', cumTarget: 7, createdAt: daysAgo(50, 10), bank: bank('TPBank', '01234567890', 'DANG VAN KHOA') });
  agent({ id: 'U010', fullName: 'Bùi Thị Lan', phone: '0931000010', address: '77 Phạm Văn Đồng, Đồng Nai', refCode: 'LAN10G', referrerId: null, rank: 'GOLD', cumTarget: 21, createdAt: daysAgo(150, 10), rankSince: daysAgo(35, 0), bank: bank('VietinBank', '108000123', 'BUI THI LAN') });
  agent({ id: 'U011', fullName: 'Mai Văn Long', phone: '0931000011', address: '5 Trường Chinh, Nghệ An', refCode: 'LONG11', referrerId: 'U010', rank: 'COPPER', cumTarget: 6, createdAt: daysAgo(45, 10), bank: bank('MBBank', '9704112233', 'MAI VAN LONG') });
  // Người mua chưa đăng ký: U101 qua Lithium An (được đăng ký) · U102 qua Copper Cường (bị chặn)
  users.push({ id: 'U101', type: 'buyer', fullName: 'Lâm Thị Kim', phone: '0901111222', email: 'kim.lam@example.com', address: '77 Võ Văn Tần, P. Võ Thị Sáu, TP. Hồ Chí Minh', refCode: null, referrerId: 'U001', status: 'active', createdAt: daysAgo(9, 15), rank: null, bank: null, password: null, cumulativeSales: 0, rankHistory: [] });
  users.push({ id: 'U102', type: 'buyer', fullName: 'Trần Văn Bảo', phone: '0902222333', email: 'bao.tran@example.com', address: '15 Lý Thường Kiệt, Đà Nẵng', refCode: null, referrerId: 'U003', status: 'active', createdAt: daysAgo(6, 11), rank: null, bank: null, password: null, cumulativeSales: 0, rankHistory: [] });
  const userById = (id) => users.find(u => u.id === id);

  // ----- Kho mã: ≥ 1.200 mã, mã sản phẩm thiết bị HW01 + serial -----
  const codes = [];
  for (let i = 0; i < CONFIG.stock.seedCount; i++) {
    codes.push({ code: `${CONFIG.stock.codePrefix}-${code(4)}-${code(4)}-${code(4)}`, deviceSku: CONFIG.stock.deviceSku, deviceSerial: `${CONFIG.stock.deviceSku}-${String(i + 1).padStart(6, '0')}`,
      status: 'IN_STOCK', orderId: null, agentId: null, batch: i < 600 ? 'B001' : i < 1000 ? 'B002' : 'B003', stockedAt: i < 600 ? daysAgo(100, 9) : i < 1000 ? daysAgo(45, 9) : daysAgo(12, 9), assignedAt: null, activatedAt: null, device: null });
  }
  let codeCursor = 0;
  const takeCode = (o, activated) => {
    const c = codes[codeCursor++];
    c.status = activated ? 'ACTIVATED' : 'ASSIGNED'; c.orderId = o.id; c.agentId = o.sellerId; c.assignedAt = o.paidAt;
    if (activated) { c.activatedAt = new Date(new Date(o.paidAt).getTime() + ri(1, 72) * 3600000).toISOString(); c.device = { name: pick(['Samsung Galaxy A54', 'iPhone 13', 'Xiaomi Redmi Note 12', 'OPPO Reno8', 'iPhone 15 Pro']), deviceId: 'DEV-' + code(8), boundAt: c.activatedAt }; }
    return c.code;
  };

  // ----- Đơn hàng + hoa hồng (engine chênh lệch cấp bậc) -----
  const orders = []; const commissions = []; const seqByDay = {}; let cmSeq = 0;
  const uplineChain = (id, depth) => { const chain = []; let cur = userById(id); while (cur && chain.length < depth) { chain.push(cur); cur = cur.referrerId ? userById(cur.referrerId) : null; } return chain; };
  const createCommissions = (o) => {
    if (!o.sellerId) return;
    const rates = BY_RANK; const top = rates.LITHIUM; let paid = 0, depth = 0;
    for (const a of uplineChain(o.sellerId, 99)) {
      const diff = rates[a.rank] - paid;
      if (diff > 0) { commissions.push({ id: 'CM' + String(++cmSeq).padStart(4, '0'), orderId: o.id, beneficiaryId: a.id, kind: depth === 0 ? 'SELF' : 'DIFF', depth, rankAtCalc: a.rank, amount: diff, status: 'RECORDED', createdAt: o.paidAt }); paid = rates[a.rank]; }
      depth++; if (paid >= top) break;
    }
    if (paid < top) commissions.push({ id: 'CM' + String(++cmSeq).padStart(4, '0'), orderId: o.id, beneficiaryId: 'COMPANY', kind: 'COMPANY', depth, rankAtCalc: 'LITHIUM', amount: top - paid, status: 'RECORDED', createdAt: o.paidAt });
  };
  const buyerNames = ['Nguyễn Thị Lan Anh', 'Trần Văn Bảo', 'Lê Thị Cẩm', 'Phạm Văn Dũng', 'Hoàng Thị Én', 'Vũ Văn Phong', 'Đỗ Thị Giang', 'Bùi Văn Hải', 'Ngô Thị Yến', 'Đặng Văn Kiên', 'Mai Thị Liên', 'Lý Văn Minh', 'Phan Thị Ngọc', 'Tô Văn Quang', 'Dương Thị Sen', 'Hồ Văn Tài', 'Chu Thị Uyên', 'Đinh Văn Vinh'];
  const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai', 'Nghệ An'];
  const streets = ['Lê Văn Sỹ', 'Cách Mạng Tháng 8', 'Nguyễn Văn Cừ', 'Trần Hưng Đạo', 'Lạc Long Quân'];
  const addOrder = (o) => {
    const key = ymd(o.createdAt); seqByDay[key] = (seqByDay[key] || 0) + 1;
    o.id = 'HM' + key + String(seqByDay[key]).padStart(3, '0');
    o.expiresAt = new Date(new Date(o.createdAt).getTime() + 900000).toISOString();
    const s = o.sellerId ? userById(o.sellerId) : null; o.referrerRankAtOrder = s ? s.rank : null;
    orders.push(o); return o;
  };
  const finalizePaid = (o, opts) => { o.licenseCode = takeCode(o, opts.activated); o.shipping = opts.shipping; createCommissions(o); };
  const mkOrder = (sellerId, createdAt, extra) => {
    const s = userById(sellerId);
    return Object.assign({ fullName: pick(buyerNames), phone: '09' + String(ri(10000000, 99999999)), email: '', address: `${ri(1, 300)} ${pick(streets)}, ${pick(cities)}`,
      note: '', packageId: 'CN02', price: 10000000, refCode: s.refCode, sellerId: s.id, createdAt, method: 'gateway', status: 'PAID', shipping: 'PENDING', licenseCode: null, refunded: false, flags: {} }, extra || {});
  };
  // Đơn 60 ngày (U008 Hạnh: KHÔNG có đơn trong tháng hiện tại → ứng viên giáng hạng)
  const sellersForOrders = ['U001', 'U001', 'U002', 'U002', 'U003', 'U004', 'U004', 'U006', 'U007', 'U009', 'U010', 'U011'];
  for (let d = 58; d >= 0; d--) {
    const n = d % 7 === 0 ? 0 : (d % 3 === 0 ? 2 : 1);
    for (let k = 0; k < n; k++) {
      let sid = pick(sellersForOrders);
      const createdAt = daysAgo(d); const r = rnd();
      if (d > 32 && r > .8) sid = 'U008';
      const o = mkOrder(sid, createdAt, { method: r > .35 ? 'gateway' : 'bank', note: rnd() > .7 ? pick(['Giao giờ hành chính', 'Gọi trước khi giao', 'Để ở bảo vệ toà nhà']) : '' });
      if (d > 0 && r > .93) { o.status = 'FAILED'; o.method = 'gateway'; o.failReason = 'Người mua huỷ giao dịch trên cổng'; o.shipping = 'NONE'; }
      else if (d > 0 && r > .88) { o.status = 'EXPIRED'; o.method = null; o.shipping = 'NONE'; }
      else if (d > 0 && r > .86) { o.status = 'REJECTED'; o.method = 'bank'; o.shipping = 'NONE'; o.rejectReason = 'Không tìm thấy giao dịch khớp nội dung'; o.reconciledAt = daysAgo(d - 1); o.reconciledBy = 'admin'; }
      addOrder(o);
      if (o.status === 'PAID') {
        o.paidAt = new Date(new Date(createdAt).getTime() + ri(2, 12) * 60000).toISOString();
        if (o.method === 'bank') { o.reconciledAt = o.paidAt; o.reconciledBy = 'admin'; }
        finalizePaid(o, { activated: d > 4 && rnd() > .3, shipping: d > 10 ? 'DELIVERED' : d > 5 ? 'SHIPPING' : d > 2 ? 'PACKING' : 'PENDING' });
      }
    }
  }
  // Đơn trong tháng hiện tại cho vài thành viên (U008 Hạnh cố ý không có → giáng hạng khi chạy job)
  [['U007', 1], ['U009', 2], ['U010', 1], ['U011', 2]].forEach(([sid, d]) => { const o = addOrder(mkOrder(sid, daysAgo(d, 11))); o.paidAt = new Date(new Date(o.createdAt).getTime() + 6 * 60000).toISOString(); finalizePaid(o, { activated: false, shipping: 'PACKING' }); });
  // 5 case sheet 5 (đơn có ghi chú Case n)
  [['U003', 'Case 1 · Copper bán: Copper 2,0 · Gold +1,5 · Lithium +0,35'], ['U006', 'Case 2 · Copper dưới Silver: 2,0 · Silver +1,0 · Gold +0,5 · Lithium +0,35'], ['U004', 'Case 3 · Silver bán: 3,0 · Gold +0,5 · Lithium +0,35'], ['U009', 'Case 4 · Breakaway Silver→Silver: 2,0 · Silver +1,0 · Silver trên 0 · Lithium +0,85'], ['U011', 'Case 5 · Nhánh gốc Gold: 2,0 · Gold +1,5 · Về công ty 0,35']].forEach(([sid, note], i) => {
    const o = addOrder(mkOrder(sid, daysAgo(3 + i, 10 + i), { note, fullName: buyerNames[i + 10] }));
    o.paidAt = new Date(new Date(o.createdAt).getTime() + 5 * 60000).toISOString();
    finalizePaid(o, { activated: i % 2 === 0, shipping: 'SHIPPING' });
  });
  // Đơn của người mua mẫu / đăng ký / thành viên
  const named = (u, sid, d, extra) => { const o = addOrder(mkOrder(sid, daysAgo(d, 15), Object.assign({ fullName: u.fullName, phone: u.phone, email: u.email || '', address: u.address }, extra || {}))); o.paidAt = new Date(new Date(o.createdAt).getTime() + 5 * 60000).toISOString(); finalizePaid(o, { activated: false, shipping: 'SHIPPING' }); return o; };
  named(userById('U101'), 'U001', 9);
  named(userById('U102'), 'U003', 6);
  const regBuyers = [
    { fullName: 'Nguyễn Thị Lan Anh', phone: '0912000777', email: 'lananh@example.com', address: '19 Bà Triệu, Hà Nội', sellerId: 'U004', d: 4 },
    { fullName: 'Lê Thị Cẩm', phone: '0913000888', email: 'cam.le@example.com', address: '8 Nguyễn Huệ, TP. Hồ Chí Minh', sellerId: 'U002', d: 7 },
    { fullName: 'Phạm Văn Dũng', phone: '0914000999', email: 'dung.pham@example.com', address: '2 Hùng Vương, Huế', sellerId: 'U001', d: 12 }
  ];
  const regOrders = regBuyers.map(b => named(b, b.sellerId, b.d));
  // Gói của chính các thành viên (mua trước khi thành thành viên)
  users.filter(u => u.type === 'agent').forEach((u, i) => { const o = addOrder(mkOrder(u.referrerId || 'U001', new Date(new Date(u.createdAt).getTime() - 2 * 86400000).toISOString(), { fullName: u.fullName, phone: u.phone, email: u.email, address: u.address, sellerId: u.referrerId, refCode: u.referrerId ? userById(u.referrerId).refCode : null })); o.paidAt = new Date(new Date(o.createdAt).getTime() + 4 * 60000).toISOString(); finalizePaid(o, { activated: true, shipping: 'DELIVERED' }); });
  // Đơn chờ đối soát + callback muộn
  [['U001', 2], ['U002', 5], ['U004', 26]].forEach(([sid, h]) => { const createdAt = new Date(now.getTime() - h * 3600000).toISOString(); const o = addOrder(mkOrder(sid, createdAt, { method: 'bank', status: 'AWAITING_RECONCILE', shipping: 'NONE' })); o.transferClaimedAt = new Date(new Date(createdAt).getTime() + 6 * 60000).toISOString(); o.transferProof = { name: 'bien-lai-' + o.id + '.jpg', size: (600 + Math.floor(Math.random() * 900)) + ' KB', at: o.transferClaimedAt }; });
  const late = addOrder(mkOrder('U002', daysAgo(1, 10), { fullName: 'Nguyễn Văn Tuấn', phone: '0918777666', flags: { lateCallback: true } }));
  late.paidAt = new Date(new Date(late.createdAt).getTime() + 17 * 60000).toISOString(); finalizePaid(late, { activated: false, shipping: 'PENDING' });
  orders.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  // cumulativeSales = luỹ kế trước cửa sổ seed + số đơn PAID đã bán trong seed
  users.filter(u => u.type === 'agent').forEach(u => { u.cumulativeSales = Math.max(u.cumTarget || 0, orders.filter(o => o.sellerId === u.id && o.status === 'PAID').length); delete u.cumTarget; });

  // ----- Đăng ký thành viên: PENDING_0 · PENDING_1 · REJECTED -----
  const registrations = [
    { id: 'RG001', phone: regBuyers[0].phone, email: regBuyers[0].email, fullName: regBuyers[0].fullName, orderId: regOrders[0].id, referrerId: 'U004', referrerRankAtSubmit: 'SILVER', bank: bank('Vietcombank', '0071000123456', 'NGUYEN THI LAN ANH'), password: PW, tcVersion: '1.0', tcAt: daysAgo(3, 9), status: 'PENDING_0', approvals: [], createdAt: daysAgo(3, 9), decidedAt: null, agentId: null, createdBy: 'agent' },
    { id: 'RG002', phone: regBuyers[1].phone, email: regBuyers[1].email, fullName: regBuyers[1].fullName, orderId: regOrders[1].id, referrerId: 'U002', referrerRankAtSubmit: 'GOLD', bank: bank('ACB', '123456789', 'LE THI CAM'), password: PW, tcVersion: '1.0', tcAt: daysAgo(6, 14), status: 'PENDING_1', approvals: [{ by: 'admin', role: 'SPECIALIST', action: 'APPROVE', at: daysAgo(5, 10) }], createdAt: daysAgo(6, 14), decidedAt: null, agentId: null, createdBy: 'agent' },
    { id: 'RG003', phone: regBuyers[2].phone, email: regBuyers[2].email, fullName: regBuyers[2].fullName, orderId: regOrders[2].id, referrerId: 'U001', referrerRankAtSubmit: 'LITHIUM', bank: bank('BIDV', '21510000111', 'PHAM DUNG'), password: PW, tcVersion: '1.0', tcAt: daysAgo(11, 9), status: 'REJECTED', approvals: [{ by: 'admin2', role: 'SPECIALIST', action: 'REJECT', at: daysAgo(10, 15), reason: 'Tên chủ tài khoản không khớp họ tên đăng ký' }], createdAt: daysAgo(11, 9), decidedAt: daysAgo(10, 15), agentId: null, createdBy: 'agent' }
  ];

  // ----- Rút tiền: PENDING_0 · PENDING_1 · APPROVED · PAID · REJECTED (U002 đã có yêu cầu tháng này) -----
  const w = (id, sellerId, amount, status, createdAt, extra) => Object.assign({ id, sellerId, amount, bank: { ...userById(sellerId).bank }, status, createdAt, createdBy: 'agent', approvals: [], auditLog: [] }, extra || {});
  const withdrawals = [
    w('WD0001', 'U001', 3000000, 'PAID', daysAgo(62, 10), { approvals: [{ by: 'admin', role: 'SPECIALIST', action: 'APPROVE', at: daysAgo(61, 9) }, { by: 'admin2', role: 'SPECIALIST', action: 'APPROVE', at: daysAgo(60, 11) }], paidAt: daysAgo(45, 9), paidBy: 'head' }),
    w('WD0002', 'U001', 5000000, 'APPROVED', daysAgo(33, 11), { approvals: [{ by: 'head', role: 'HEAD', action: 'APPROVE', at: daysAgo(32, 9) }] }),
    w('WD0003', 'U007', 2000000, 'REJECTED', daysAgo(36, 16), { approvals: [{ by: 'admin', role: 'SPECIALIST', action: 'REJECT', at: daysAgo(35, 10), reason: 'Số tài khoản không đúng tên chủ tài khoản, vui lòng cập nhật hồ sơ' }], decidedAt: daysAgo(35, 10) }),
    w('WD0004', 'U004', 1500000, 'PENDING_1', daysAgo(3, 9), { approvals: [{ by: 'admin', role: 'SPECIALIST', action: 'APPROVE', at: daysAgo(2, 14) }] }),
    w('WD0005', 'U002', 4000000, 'PENDING_0', daysAgo(1, 17))
  ];
  withdrawals.forEach(x => { if (!RULES.inSameMonth(x.createdAt) && (x.status === 'PENDING_0' || x.status === 'PENDING_1')) x.createdAt = daysAgo(1); });

  // ----- Admin -----
  const adminUsers = CONFIG.admin.accounts.map((a, i) => ({ ...a, status: 'active', createdAt: daysAgo(120 - i, 9), createdBy: i === 0 ? 'system' : 'head' }));

  // ----- Click theo ngày -----
  const clicks = {};
  users.filter(u => u.type === 'agent').forEach(u => { const base = u.id === 'U001' ? 14 : u.rank === 'GOLD' ? 9 : u.rank === 'SILVER' ? 6 : 3; clicks[u.id] = Array.from({ length: 90 }, (_, i) => ({ date: daysAgo(89 - i, 0).slice(0, 10), clicks: Math.max(0, Math.round(base + (rnd() - .5) * base * 1.4)) })); });

  // ----- Nhật ký & audit -----
  const log = []; const audit = [];
  users.forEach(u => { log.push({ userId: u.id, at: u.createdAt, text: u.type === 'agent' ? 'Kích hoạt tài khoản thành viên' : 'Mua gói lần đầu (chưa đăng ký thành viên)' }); if (u.type === 'agent') log.push({ userId: u.id, at: daysAgo(ri(0, 3)), text: 'Đăng nhập bằng SĐT + mật khẩu' }); if (u.status === 'locked') log.push({ userId: u.id, at: u.lockedAt, text: 'Admin khoá tài khoản: ' + u.lockedReason }); });
  audit.push({ at: daysAgo(35, 0), actor: 'system', actorRole: 'JOB', entity: 'rank', entityId: 'month-end', from: '', to: '', note: 'Job xét hạng cuối tháng: 4 thăng hạng, 0 giáng hạng' });
  audit.push({ at: daysAgo(6, 11), actor: 'head', actorRole: 'HEAD', entity: 'user', entityId: 'U005', from: 'active', to: 'locked', note: 'Spam link giới thiệu lên nhóm không liên quan' });

  const rules = { rankRules: { ...CONFIG.rankRules }, withdraw: { ...CONFIG.withdraw }, tc: { ...CONFIG.tc }, history: [{ at: daysAgo(90, 9), by: 'head', note: 'Khởi tạo quy tắc chương trình v1.0' }] };

  return { packages, users, codes, orders, commissions, registrations, withdrawals, adminUsers, clicks, log, audit, emails: [], rules };
})();

/* ================================================================== */
/* Store                                                                */
/* ================================================================== */
const Store = {
  KEY: 'homi365_proto_v3',
  state: null,
  load: function() { try { const raw = localStorage.getItem(this.KEY); if (raw) { this.state = JSON.parse(raw); if (this.state && this.state.version === 3) return; } } catch (e) {} this.reset(true); },
  save: function() { try { localStorage.setItem(this.KEY, JSON.stringify(this.state)); } catch (e) {} },
  reset: function(silent) {
    this.state = JSON.parse(JSON.stringify({ version: 3, data: SEED,
      session: { ref: null, refAt: null, refSellerId: null, entry: null, orderId: null, verifiedPhone: null, buyerDraft: null, regDraft: null, agent: null, admin: null, adminFails: 0, adminLockUntil: null, otp: {} },
      seq: { cm: SEED.commissions.length, wd: SEED.withdrawals.length, rg: SEED.registrations.length, user: 200, batch: 3, cv: 1 } }));
    this.save(); if (!silent) window.location.reload();
  },
  nowIso: function() { return new Date().toISOString(); },
  d: function() { return this.state.data; },
  s: function() { return this.state.session; },
  audit: function(actor, actorRole, entity, entityId, from, to, note) { this.d().audit.unshift({ at: this.nowIso(), actor, actorRole, entity, entityId, from: from || '', to: to || '', note: note || '' }); },
  auditOf: function(entity, entityId) { return this.d().audit.filter(a => a.entity === entity && a.entityId === entityId); },
  addLog: function(userId, text) { this.d().log.push({ userId, at: this.nowIso(), text }); },
  logOf: function(userId) { return this.d().log.filter(l => l.userId === userId).sort((a, b) => a.at < b.at ? 1 : -1); },

  // ---------- Đọc ----------
  packages: function() { return this.d().packages; },
  pkg: function(id) { return this.d().packages.find(p => p.id === id) || null; },
  activePackage: function() { return this.d().packages.find(p => p.active) || null; },
  commissionByRank: function(packageId, atIso) {
    const p = this.pkg(packageId); if (!p) return {}; const at = atIso || this.nowIso();
    const v = (p.commissionVersions || []).filter(x => x.effectiveFrom <= at).sort((a, b) => b.version - a.version)[0];
    return v ? v.byRank : p.commissionByRank;
  },
  rules: function() { return this.d().rules; },
  users: function() { return this.d().users; },
  user: function(id) { return this.d().users.find(u => u.id === id) || null; },
  agents: function() { return this.d().users.filter(u => u.type === 'agent'); },
  userByPhone: function(phone) { return this.d().users.find(u => u.phone === phone) || null; },
  userByEmail: function(email) { const e = String(email || '').toLowerCase(); return this.d().users.find(u => (u.email || '').toLowerCase() === e) || null; },
  sellerByRef: function(c) { return this.d().users.find(u => u.type === 'agent' && u.refCode === String(c || '').toUpperCase()) || null; },
  agentByAlias: function(a) { return this.d().users.find(u => u.type === 'agent' && u.purchaseAlias === String(a || '').toUpperCase()) || null; },
  downline: function(id) { return this.d().users.filter(u => u.referrerId === id); },
  downlineTree: function(id, depth) { const build = (uid, lv) => this.downline(uid).map(c => ({ user: c, children: lv < depth ? build(c.id, lv + 1) : [] })); return build(id, 1); },
  uplineChain: function(id, depth) { const chain = []; let cur = this.user(id); while (cur && chain.length < depth) { chain.push(cur); cur = cur.referrerId ? this.user(cur.referrerId) : null; } return chain; },
  orders: function() { return this.d().orders; },
  order: function(id) { return this.d().orders.find(o => o.id === id) || null; },
  ordersByPhone: function(phone) { return this.d().orders.filter(o => o.phone === phone); },
  ordersBySeller: function(id) { return this.d().orders.filter(o => o.sellerId === id); },
  salesThisMonth: function(id) { const ms = RULES.monthStart(); return this.ordersBySeller(id).filter(o => o.status === 'PAID' && (o.paidAt || o.createdAt) >= ms).length; },
  codes: function() { return this.d().codes; },
  codeInfo: function(c) { return this.d().codes.find(x => x.code === c) || null; },
  stockCount: function() { return this.d().codes.filter(c => c.status === 'IN_STOCK').length; },
  commissions: function() { return this.d().commissions; },
  commissionsOf: function(id) { return this.d().commissions.filter(c => c.beneficiaryId === id); },
  commissionsOfOrder: function(orderId) { return this.d().commissions.filter(c => c.orderId === orderId).sort((a, b) => a.depth - b.depth); },
  registrations: function() { return this.d().registrations; },
  registration: function(id) { return this.d().registrations.find(r => r.id === id) || null; },
  registrationByPhone: function(phone) { return this.d().registrations.filter(r => r.phone === phone).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)[0] || null; },
  withdrawals: function() { return this.d().withdrawals; },
  withdrawal: function(id) { return this.d().withdrawals.find(w => w.id === id) || null; },
  withdrawalsOf: function(id) { return this.d().withdrawals.filter(w => w.sellerId === id); },
  adminUsers: function() { return this.d().adminUsers; },
  emails: function() { return this.d().emails; },
  clicksOf: function(id) { return this.d().clicks[id] || []; },

  /** Ví: recorded / held / withdrawn / available / points (spec 3.4). */
  wallet: function(id) {
    const cms = this.commissionsOf(id); const wds = this.withdrawalsOf(id);
    const recorded = cms.filter(c => c.status === 'RECORDED').reduce((s, c) => s + c.amount, 0);
    const held = wds.filter(w => ['PENDING_0', 'PENDING_1', 'APPROVED'].includes(w.status)).reduce((s, w) => s + w.amount, 0);
    const withdrawn = wds.filter(w => w.status === 'PAID').reduce((s, w) => s + w.amount, 0);
    return { recorded, held, withdrawn, available: recorded - held - withdrawn, points: RULES.pointsOf(recorded), pending: held };
  },
  ledger: function(id) {
    const rows = [];
    this.commissionsOf(id).forEach(c => { rows.push({ at: c.createdAt, type: 'COMMISSION_RECORDED', amount: c.amount, ref: c.orderId, effect: +c.amount }); if (c.status === 'CANCELLED') rows.push({ at: c.cancelledAt || c.createdAt, type: 'COMMISSION_CANCELLED', amount: c.amount, ref: c.orderId, effect: -c.amount }); });
    this.withdrawalsOf(id).forEach(w => { rows.push({ at: w.createdAt, type: 'WITHDRAW_HOLD', amount: w.amount, ref: w.id, effect: -w.amount }); if (w.status === 'PAID') rows.push({ at: w.paidAt, type: 'WITHDRAW_PAID', amount: w.amount, ref: w.id, effect: 0 }); if (w.status === 'REJECTED') rows.push({ at: w.decidedAt || w.createdAt, type: 'WITHDRAW_REJECTED', amount: w.amount, ref: w.id, effect: +w.amount }); });
    rows.sort((a, b) => a.at < b.at ? -1 : 1); let bal = 0; rows.forEach(r => { bal += r.effect; r.balance = bal; }); return rows.reverse();
  },
  agentStats: function(id, fromIso, toIso) {
    const to = toIso || this.nowIso(); const from = fromIso;
    const clicks = this.clicksOf(id).filter(c => c.date >= from.slice(0, 10) && c.date <= to.slice(0, 10)).reduce((s, c) => s + c.clicks, 0);
    const ords = this.ordersBySeller(id).filter(o => o.createdAt >= from && o.createdAt <= to); const paid = ords.filter(o => o.status === 'PAID');
    const cms = this.commissionsOf(id).filter(c => c.createdAt >= from && c.createdAt <= to && c.status === 'RECORDED');
    return { clicks, orders: ords.length, paid: paid.length, revenue: paid.reduce((s, o) => s + o.price, 0), conversion: RULES.conversion(paid.length, clicks), commission: cms.reduce((s, c) => s + c.amount, 0) };
  },
  agentSeries: function(id, fromIso, toIso) {
    const out = []; const from = new Date(fromIso); const to = new Date(toIso || Date.now()); const days = Math.max(1, Math.round((to - from) / 86400000));
    for (let i = 0; i <= days; i++) { const date = new Date(from.getTime() + i * 86400000).toISOString().slice(0, 10); const c = this.clicksOf(id).find(x => x.date === date); const paid = this.ordersBySeller(id).filter(o => o.status === 'PAID' && o.createdAt.slice(0, 10) === date).length; const cm = this.commissionsOf(id).filter(x => x.status === 'RECORDED' && x.createdAt.slice(0, 10) === date).reduce((s, x) => s + x.amount, 0); out.push({ date, clicks: c ? c.clicks : 0, paid, commission: cm }); }
    return out;
  },
  adminStats: function(days) {
    const from = new Date(Date.now() - days * 86400000).toISOString(); const ords = this.orders().filter(o => o.createdAt >= from); const paid = ords.filter(o => o.status === 'PAID');
    return { revenue: paid.reduce((s, o) => s + o.price, 0), orders: ords.length, paid: paid.length, newAgents: this.agents().filter(u => (u.activatedAt || u.createdAt) >= from).length, stock: this.stockCount(),
      awaiting: this.orders().filter(o => o.status === 'AWAITING_RECONCILE').length, withdrawPending: this.withdrawals().filter(w => w.status === 'PENDING_0' || w.status === 'PENDING_1').length, withdrawApproved: this.withdrawals().filter(w => w.status === 'APPROVED').length,
      regPending: this.registrations().filter(r => r.status === 'PENDING_0' || r.status === 'PENDING_1').length, lateCallbacks: this.orders().filter(o => o.flags && o.flags.lateCallback && !o.flags.lateChecked).length, licensePending: this.orders().filter(o => o.status === 'PAID' && !o.licenseCode).length,
      noSaleAgents: this.agents().filter(u => u.status === 'active' && this.salesThisMonth(u.id) < (this.rules().rankRules.minSalesPerMonth || 1)).length, companyCommission: this.commissions().filter(c => c.beneficiaryId === 'COMPANY' && c.status === 'RECORDED' && c.createdAt >= from).reduce((s, c) => s + c.amount, 0) };
  },
  adminSeries: function(days) { const out = []; for (let i = days - 1; i >= 0; i--) { const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10); const paid = this.orders().filter(o => o.status === 'PAID' && o.createdAt.slice(0, 10) === date); out.push({ date, paid: paid.length, revenue: paid.reduce((s, o) => s + o.price, 0) }); } return out; },

  // ---------- Resolver & OTP ----------
  captureRef: function(codeOrAlias) {
    const key = String(codeOrAlias || '').toUpperCase();
    const a = this.sellerByRef(key) || this.agentByAlias(key);
    if (!a || a.type !== 'agent') return { ok: false, reason: 'invalid' };
    if (a.status !== 'active') return { ok: false, reason: 'locked' };
    const s = this.s(); s.ref = a.refCode; s.refAt = this.nowIso(); s.refSellerId = a.id; s.entry = key === a.purchaseAlias ? 'alias' : 'ref';
    const today = this.nowIso().slice(0, 10); const arr = this.d().clicks[a.id] || (this.d().clicks[a.id] = []); const row = arr.find(c => c.date === today); if (row) row.clicks += 1; else arr.push({ date: today, clicks: 1 });
    this.save(); return { ok: true, agent: a };
  },
  refSeller: function() { const s = this.s(); if (!s.ref || !s.refAt) return null; if (Date.now() - new Date(s.refAt).getTime() > CONFIG.session.refDays * 86400000) return null; return this.sellerByRef(s.ref); },
  otpState: function(phone) { const o = this.s().otp; return o[phone] || (o[phone] = { sends: [], wrong: 0, lockUntil: null }); },
  otpCanSend: function(phone) { const st = this.otpState(phone); const now = Date.now(); if (st.lockUntil && new Date(st.lockUntil).getTime() > now) return { ok: false, minutes: Math.ceil((new Date(st.lockUntil).getTime() - now) / 60000) }; st.sends = st.sends.filter(t => now - new Date(t).getTime() < CONFIG.otp.windowMinutes * 60000); if (st.sends.length >= CONFIG.otp.maxSendsPerWindow) { st.lockUntil = new Date(now + CONFIG.otp.lockMinutes * 60000).toISOString(); this.save(); return { ok: false, minutes: CONFIG.otp.lockMinutes }; } return { ok: true }; },
  otpSend: function(phone) { const st = this.otpState(phone); st.sends.push(this.nowIso()); st.wrong = 0; st.sentAt = this.nowIso(); this.save(); return st.sends.length; },
  otpVerify: function(phone, code) { const st = this.otpState(phone); if (st.lockUntil && new Date(st.lockUntil).getTime() > Date.now()) return { ok: false, locked: true, minutes: Math.ceil((new Date(st.lockUntil).getTime() - Date.now()) / 60000) }; if (st.sentAt && Date.now() - new Date(st.sentAt).getTime() > CONFIG.otp.ttlSeconds * 1000) return { ok: false, expired: true }; if (code === CONFIG.otp.mockCode) { st.wrong = 0; this.save(); return { ok: true }; } st.wrong += 1; if (st.wrong >= CONFIG.otp.maxWrong) { st.lockUntil = new Date(Date.now() + CONFIG.otp.lockMinutes * 60000).toISOString(); this.save(); return { ok: false, locked: true, minutes: CONFIG.otp.lockMinutes }; } this.save(); return { ok: false, remaining: CONFIG.otp.maxWrong - st.wrong }; },
  otpResetAll: function() { this.s().otp = {}; this.save(); },

  // ---------- Đơn hàng ----------
  nextOrderId: function() { const d = new Date(); const key = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); const n = this.orders().filter(o => o.id.startsWith(CONFIG.order.idPrefix + key)).length + 1; return CONFIG.order.idPrefix + key + String(n).padStart(3, '0'); },
  createOrder: function(draft) {
    const pkg = this.activePackage(); const seller = this.refSeller(); const createdAt = this.nowIso();
    const o = { id: this.nextOrderId(), fullName: draft.fullName, phone: draft.phone, email: draft.email || '', address: draft.address, note: draft.note || '', packageId: pkg.id, price: pkg.price, refCode: seller ? seller.refCode : null, sellerId: seller ? seller.id : null, referrerRankAtOrder: seller ? seller.rank : null, createdAt, expiresAt: RULES.orderExpiry(createdAt), method: null, status: 'PENDING_PAYMENT', shipping: 'NONE', licenseCode: null, refunded: false, flags: {} };
    this.d().orders.unshift(o); this.s().orderId = o.id; this.s().verifiedPhone = draft.phone; this.s().buyerDraft = draft; this.save(); return o;
  },
  currentOrder: function() { return this.s().orderId ? this.order(this.s().orderId) : null; },
  setOrder: function(id, patch) { const o = this.order(id); if (!o) return null; Object.assign(o, patch); this.save(); return o; },
  expireOrder: function(id) { const o = this.order(id); if (o && o.status === 'PENDING_PAYMENT') { o.status = 'EXPIRED'; this.save(); } return o; },
  failOrder: function(id, reason) { return this.setOrder(id, { status: 'FAILED', method: 'gateway', failReason: reason || 'Người mua huỷ giao dịch trên cổng', failedAt: this.nowIso() }); },
  retryOrder: function(id) { return this.setOrder(id, { status: 'PENDING_PAYMENT', method: null }); },
  /** Khách báo đã chuyển khoản. proof = { name, size, at } — mock, chỉ giữ tên và dung lượng file. */
  claimTransfer: function(id, proof) { return this.setOrder(id, { status: 'AWAITING_RECONCILE', method: 'bank', transferClaimedAt: this.nowIso(), transferProof: proof || null }); },
  /** PAID (idempotent — 6.1.C-5): cấp mã ASSIGNED, ghép Customer theo SĐT, hoa hồng ngay, cumulativeSales +1. */
  markPaid: function(id, method, extra) {
    const o = this.order(id); if (!o) return null; if (o.status === 'PAID') return o;
    const late = o.status === 'EXPIRED';
    Object.assign(o, { status: 'PAID', method: method || o.method, paidAt: this.nowIso(), shipping: this.pkg(o.packageId) && this.pkg(o.packageId).hasShipping ? 'PENDING' : 'NONE' }, extra || {});
    if (late) o.flags.lateCallback = true;
    this.issueLicense(o); this.createCommissions(o);
    let u = this.userByPhone(o.phone);
    if (!u) { u = { id: 'U' + String(++this.state.seq.user).padStart(3, '0'), type: 'buyer', fullName: o.fullName, phone: o.phone, email: o.email || '', address: o.address, refCode: null, referrerId: o.sellerId, status: 'active', createdAt: this.nowIso(), rank: null, bank: null, password: null, cumulativeSales: 0, rankHistory: [] }; this.d().users.push(u); this.addLog(u.id, 'Mua gói ' + o.packageId + ' qua link ' + (o.refCode || '—') + ' (đơn ' + o.id + ')'); }
    else this.addLog(u.id, 'Thanh toán đơn ' + o.id);
    const seller = o.sellerId ? this.user(o.sellerId) : null; if (seller && seller.type === 'agent' && seller.status === 'active') seller.cumulativeSales = (seller.cumulativeSales || 0) + 1;
    this.save(); return o;
  },
  issueLicense: function(o) { const c = this.d().codes.find(x => x.status === 'IN_STOCK'); if (!c) { o.licenseCode = null; o.licensePending = true; return null; } c.status = 'ASSIGNED'; c.orderId = o.id; c.agentId = o.sellerId; c.assignedAt = this.nowIso(); o.licenseCode = c.code; o.licensePending = false; return c.code; },
  /** Engine hoa hồng chênh lệch cấp bậc (spec 3.3). Σ = mức Lithium. */
  createCommissions: function(o) {
    if (!o.sellerId) return;
    const rates = this.commissionByRank(o.packageId, o.paidAt); const top = RULES.commissionTotal(rates); let paid = 0, depth = 0;
    const push = (c) => this.d().commissions.push(Object.assign({ id: 'CM' + String(++this.state.seq.cm).padStart(4, '0'), orderId: o.id, status: 'RECORDED', createdAt: o.paidAt || this.nowIso() }, c));
    for (const a of this.uplineChain(o.sellerId, 99)) {
      const diff = (rates[a.rank] || 0) - paid;
      if (diff > 0) { push({ beneficiaryId: a.id, kind: depth === 0 ? 'SELF' : 'DIFF', depth, rankAtCalc: a.rank, amount: diff }); paid = rates[a.rank]; }
      depth++; if (paid >= top) break;
    }
    if (paid < top) push({ beneficiaryId: 'COMPANY', kind: 'COMPANY', depth, rankAtCalc: RULES.topRank().id, amount: top - paid });
  },
  confirmReconcile: function(id, admin) { const o = this.markPaid(id, 'bank', { reconciledAt: this.nowIso(), reconciledBy: admin ? admin.username : 'admin' }); return o; },
  rejectReconcile: function(id, reason, admin) { return this.setOrder(id, { status: 'REJECTED', rejectReason: reason, reconciledAt: this.nowIso(), reconciledBy: admin ? admin.username : 'admin' }); },
  updateShipping: function(id, step) { const o = this.setOrder(id, { shipping: step }); if (o) { o.shippingLog = o.shippingLog || []; o.shippingLog.push({ step, at: this.nowIso(), by: 'admin' }); this.save(); } return o; },
  clearLateFlag: function(id) { const o = this.order(id); if (o) { o.flags.lateChecked = true; this.save(); } },
  refundOrder: function(id, reason, admin) { const o = this.order(id); if (!o) return null; o.refunded = true; o.refundedAt = this.nowIso(); this.cancelCommissions(this.commissionsOfOrder(id).map(c => c.id), reason || 'Đơn hoàn tiền'); this.audit(admin ? admin.username : 'admin', admin ? admin.role : '', 'order', id, 'PAID', 'REFUNDED', reason || ''); this.save(); return o; },
  cancelCommissions: function(ids, reason) { this.commissions().filter(c => ids.includes(c.id) && c.status === 'RECORDED').forEach(c => { c.status = 'CANCELLED'; c.cancelledAt = this.nowIso(); c.cancelReason = reason; }); this.save(); },

  // ---------- Thành viên: link, đăng nhập ----------
  genRefCode: function() { const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c; do { c = Array.from({ length: 6 }, () => CH[Math.floor(Math.random() * CH.length)]).join(''); } while (this.sellerByRef(c) || this.agentByAlias(c)); return c; },
  genPurchaseAlias: function(fullName, phone) { const base = RULES.purchaseAlias(fullName, phone); let a = base, n = 2; while (this.d().users.some(u => u.purchaseAlias === a)) { a = base + '-' + n; n++; } return a; },
  loginAgent: function(phone, password, remember) {
    const u = this.userByPhone(phone);
    if (!u || u.type !== 'agent') return { ok: false, reason: 'not_agent', user: u };
    if (u.status === 'locked') return { ok: false, reason: 'locked', user: u };
    if (u.password !== password) return { ok: false, reason: 'wrong', user: u };
    this.s().agent = { userId: u.id, remember: !!remember, at: this.nowIso(), expiresAt: new Date(Date.now() + (remember ? CONFIG.session.rememberDays * 86400000 : CONFIG.session.agentHours * 3600000)).toISOString() };
    this.addLog(u.id, 'Đăng nhập bằng SĐT + mật khẩu' + (remember ? ' (ghi nhớ 30 ngày)' : '')); this.save(); return { ok: true, user: u };
  },
  loginAgentById: function(userId, remember) { this.s().agent = { userId, remember: !!remember, at: this.nowIso(), expiresAt: new Date(Date.now() + (remember ? CONFIG.session.rememberDays * 86400000 : CONFIG.session.agentHours * 3600000)).toISOString() }; this.save(); },
  currentAgent: function() { const s = this.s().agent; if (!s) return null; if (new Date(s.expiresAt).getTime() < Date.now()) return null; const u = this.user(s.userId); return u && u.type === 'agent' && u.status === 'active' ? u : null; },
  currentSeller: function() { return this.currentAgent(); },
  logoutAgent: function() { this.s().agent = null; this.save(); },
  expireAgentSession: function() { const s = this.s().agent; if (s) { s.expiresAt = new Date(Date.now() - 1000).toISOString(); this.save(); } },
  resetPassword: function(phone, newPw) { const u = this.userByPhone(phone); if (!u || u.type !== 'agent') return false; u.password = newPw; this.addLog(u.id, 'Đặt lại mật khẩu qua OTP'); this.save(); return true; },
  changePassword: function(userId, oldPw, newPw) { const u = this.user(userId); if (!u || u.password !== oldPw) return { ok: false, message: 'Mật khẩu hiện tại không đúng.' }; u.password = newPw; this.addLog(userId, 'Đổi mật khẩu'); this.save(); return { ok: true }; },
  updateProfile: function(userId, patch, note) { const u = this.user(userId); if (!u) return null; const before = { fullName: u.fullName, address: u.address, email: u.email, bank: u.bank ? { ...u.bank } : null }; Object.assign(u, patch); this.addLog(userId, note || 'Cập nhật hồ sơ'); if (patch.bank) this.audit(u.phone, 'AGENT', 'user', userId, before.bank ? before.bank.bankName + ' ' + before.bank.accountNo : '', patch.bank.bankName + ' ' + patch.bank.accountNo, 'Thành viên đổi tài khoản nhận hoa hồng'); this.save(); return u; },
  agentPackageOrder: function(phone) { return this.ordersByPhone(phone).filter(o => o.status === 'PAID').sort((a, b) => a.paidAt < b.paidAt ? 1 : -1)[0] || null; },
  sellerPackageOrder: function(phone) { return this.agentPackageOrder(phone); },
  resendCodeSms: function(userId) { this.addLog(userId, 'Gửi lại mã kích hoạt qua SMS'); this.save(); },

  // ---------- Đăng ký thành viên (7.2) ----------
  registrationEligibility: function(phone) {
    const u = this.userByPhone(phone);
    if (u && u.type === 'agent') return { ok: false, reason: 'agent', user: u };
    const reg = this.registrationByPhone(phone);
    if (reg && (reg.status === 'PENDING_0' || reg.status === 'PENDING_1')) return { ok: false, reason: 'pending', registration: reg };
    if (reg && reg.status === 'REJECTED' && !CONFIG.rules.rejectedCanResubmit) return { ok: false, reason: 'rejected_final', registration: reg };
    const order = this.ordersByPhone(phone).filter(o => o.status === 'PAID').sort((a, b) => a.paidAt < b.paidAt ? 1 : -1)[0];
    if (!order) return { ok: false, reason: 'no_order' };
    const referrer = order.sellerId ? this.user(order.sellerId) : null;
    if (!referrer || !RULES.canRecruit(referrer.rank)) return { ok: false, reason: 'referrer_copper', order, referrer };
    return { ok: true, order, referrer, user: u, rejected: reg && reg.status === 'REJECTED' ? reg : null };
  },
  submitRegistration: function(data) {
    if (this.userByPhone(data.phone) && this.userByPhone(data.phone).type === 'agent') return { ok: false, message: 'Số điện thoại đã là thành viên.' };
    const e = this.userByEmail(data.email); if (e && e.type === 'agent') return { ok: false, message: 'Email đã được dùng cho thành viên khác.' };
    if (this.registrations().some(r => r.email.toLowerCase() === data.email.toLowerCase() && (r.status === 'PENDING_0' || r.status === 'PENDING_1'))) return { ok: false, message: 'Email đang có hồ sơ chờ duyệt.' };
    const order = this.order(data.orderId); const referrer = order && order.sellerId ? this.user(order.sellerId) : null;
    const reg = { id: 'RG' + String(++this.state.seq.rg).padStart(3, '0'), phone: data.phone, email: data.email, fullName: data.fullName, orderId: data.orderId, referrerId: referrer ? referrer.id : null, referrerRankAtSubmit: referrer ? referrer.rank : null, bank: data.bank, password: data.password, tcVersion: CONFIG.tc.version, tcAt: this.nowIso(), status: 'PENDING_0', approvals: [], createdAt: this.nowIso(), decidedAt: null, agentId: null, createdBy: 'agent' };
    this.d().registrations.unshift(reg); this.s().regDraft = null; this.audit(data.phone, 'CUSTOMER', 'registration', reg.id, '', 'PENDING_0', 'Nộp hồ sơ đăng ký thành viên'); this.save(); return { ok: true, registration: reg };
  },
  /** Máy trạng thái duyệt 2 lớp (spec 3.7). */
  applyApproval: function(entity, entityType, admin, action, reason) {
    entity.approvals = entity.approvals || [];
    if (action === 'REJECT') { if (!reason) return { ok: false, message: 'Cần nhập lý do từ chối.' }; const from = entity.status; entity.status = 'REJECTED'; entity.decidedAt = this.nowIso(); entity.approvals.push({ by: admin.username, role: admin.role, action: 'REJECT', at: this.nowIso(), reason }); this.audit(admin.username, admin.role, entityType, entity.id, from, 'REJECTED', reason); this.save(); return { ok: true, status: 'REJECTED' }; }
    if (entity.approvals.some(a => a.by === admin.username && a.action === 'APPROVE')) return { ok: false, message: 'Bạn đã xác nhận hồ sơ này rồi. Cần một admin khác xác nhận lớp 2.' };
    if (CONFIG.approval.creatorCannotApprove && entity.createdBy === admin.username) return { ok: false, message: 'Người tạo hộ không được tự duyệt.' };
    const from = entity.status; entity.approvals.push({ by: admin.username, role: admin.role, action: 'APPROVE', at: this.nowIso() });
    const n = entity.approvals.filter(a => a.action === 'APPROVE').length;
    entity.status = ((admin.role === 'HEAD' && CONFIG.approval.headCanFinalizeAlone) || n >= CONFIG.approval.requiredConfirms) ? 'APPROVED' : 'PENDING_1';
    if (entity.status === 'APPROVED') entity.decidedAt = this.nowIso();
    this.audit(admin.username, admin.role, entityType, entity.id, from, entity.status, 'Xác nhận lớp ' + n); this.save(); return { ok: true, status: entity.status };
  },
  approveRegistration: function(id, admin) { const r = this.registration(id); if (!r || r.status === 'APPROVED' || r.status === 'REJECTED') return { ok: false, message: 'Hồ sơ đã được xử lý.' }; const res = this.applyApproval(r, 'registration', admin, 'APPROVE'); if (res.ok && res.status === 'APPROVED') res.agent = this.activateAgent(r); return res; },
  rejectRegistration: function(id, admin, reason) { const r = this.registration(id); if (!r) return { ok: false }; return this.applyApproval(r, 'registration', admin, 'REJECT', reason); },
  activateAgent: function(reg, opts) {
    const o = opts || {}; const order = reg.orderId ? this.order(reg.orderId) : null;
    let u = this.userByPhone(reg.phone);
    if (!u) { u = { id: 'U' + String(++this.state.seq.user).padStart(3, '0'), phone: reg.phone, createdAt: this.nowIso(), status: 'active', cumulativeSales: 0, rankHistory: [] }; this.d().users.push(u); }
    const rank = o.rank || 'COPPER';
    Object.assign(u, { type: 'agent', fullName: reg.fullName, email: reg.email, address: u.address || (order ? order.address : ''), refCode: this.genRefCode(), purchaseAlias: this.genPurchaseAlias(reg.fullName, reg.phone), referrerId: o.referrerId !== undefined ? o.referrerId : (order ? order.sellerId : (u.referrerId || null)), rank, rankSince: this.nowIso(), bank: reg.bank, password: reg.password, tcConsent: { version: reg.tcVersion || CONFIG.tc.version, at: reg.tcAt || this.nowIso() }, activatedAt: this.nowIso(), registrationId: reg.id || null, status: 'active' });
    u.rankHistory = [{ at: this.nowIso(), from: null, to: rank, event: 'INIT', by: o.by || 'system', reason: o.reason || 'Kích hoạt thành viên sau duyệt hồ sơ' }];
    if (reg.id) reg.agentId = u.id;
    this.d().clicks[u.id] = this.d().clicks[u.id] || [];
    this.addLog(u.id, 'Kích hoạt tài khoản thành viên (hạng ' + RULES.rank(rank).label + ')');
    this.d().emails.unshift({ to: u.email, from: CONFIG.email.from, at: this.nowIso(), subject: 'HOMI365 · Tài khoản thành viên đã được kích hoạt', body: `Chào ${u.fullName},\n\nTài khoản thành viên HOMI365 của bạn đã được duyệt.\n• Link giới thiệu: ${RULES.referralUrl(u.refCode)}\n• Link mua hàng cá nhân: ${RULES.publicPurchaseUrl(u.purchaseAlias)}\n• Cổng thành viên: ${CONFIG.brand.baseUrl}/#login\nĐăng nhập bằng số điện thoại ${u.phone} và mật khẩu bạn đã đặt.` });
    if (CONFIG.demo.seedNewAgent && !o.noSeed) this.seedDemoActivity(u);
    this.save(); return u;
  },

  /** Chỉ dùng cho demo: thành viên vừa kích hoạt được sinh sẵn click + 3 đơn để dashboard không trống. */
  seedDemoActivity: function(u) {
    const day = 86400000; const now = Date.now(); const pkg = this.activePackage();
    const names = ['Nguyễn Thị Mai', 'Trần Văn Hùng', 'Lê Thị Thu']; const rates = this.commissionByRank(pkg.id);
    this.d().clicks[u.id] = Array.from({ length: 30 }, (_, i) => ({ date: new Date(now - (29 - i) * day).toISOString().slice(0, 10), clicks: Math.max(0, Math.round(1 + i * 0.2 + Math.random() * 3)) }));
    [[12, 'DELIVERED'], [5, 'SHIPPING'], [1, 'PACKING']].forEach(([ago, shipping], i) => {
      const createdAt = new Date(now - ago * day).toISOString(); const key = createdAt.slice(2, 10).replace(/-/g, ''); const seq = this.orders().filter(x => x.id.startsWith(CONFIG.order.idPrefix + key)).length + 1;
      const o = { id: CONFIG.order.idPrefix + key + String(seq).padStart(3, '0'), fullName: names[i], phone: '09' + String(Math.floor(10000000 + Math.random() * 89999999)), email: '', address: `${10 + i * 7} Lê Văn Sỹ, TP. Hồ Chí Minh`, note: 'Dữ liệu mẫu demo', packageId: pkg.id, price: pkg.price, refCode: u.refCode, sellerId: u.id, referrerRankAtOrder: u.rank, createdAt, expiresAt: RULES.orderExpiry(createdAt), method: 'gateway', status: 'PAID', shipping, licenseCode: null, refunded: false, flags: {}, paidAt: new Date(new Date(createdAt).getTime() + 5 * 60000).toISOString() };
      this.d().orders.unshift(o); this.issueLicense(o); this.createCommissions(o); u.cumulativeSales = (u.cumulativeSales || 0) + 1;
    });
    this.d().orders.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    this.addLog(u.id, 'Dữ liệu mẫu demo: 30 ngày lượt click, 3 đơn qua link cá nhân');
  },

  // ---------- Rút tiền (7.6) ----------
  canWithdraw: function(agentId, amount) {
    const w = this.wallet(agentId);
    // 1 lần/tháng: mọi yêu cầu tạo trong tháng (trừ yêu cầu bị từ chối) đều tính — kể cả đã chi trả
    const monthCount = this.withdrawalsOf(agentId).filter(x => x.status !== 'REJECTED' && RULES.inSameMonth(x.createdAt));
    const limit = (this.rules().withdraw && this.rules().withdraw.maxPerMonth) || CONFIG.withdraw.maxPerMonth;
    if (monthCount.length >= limit) { const last = monthCount[0]; return { ok: false, reason: 'monthly', message: `Chỉ được rút ${limit} lần/tháng. Tháng ${RULES.formatMonth(last.createdAt)} bạn đã có yêu cầu ${last.id} (${LABELS.withdrawal[last.status].text.toLowerCase()}). Có thể tạo yêu cầu mới từ tháng sau.`, existing: last }; }
    if (amount !== undefined) { const v = RULES.validateWithdrawal(amount, w.available); if (!v.ok) return { ok: false, reason: 'amount', message: v.message }; }
    if (w.available <= 0) return { ok: false, reason: 'balance', message: 'Chưa có số dư khả dụng để rút.' };
    const u = this.user(agentId); if (!u.bank || !u.bank.accountNo) return { ok: false, reason: 'bank', message: 'Chưa có tài khoản ngân hàng nhận hoa hồng. Cập nhật tại Hồ sơ.' };
    return { ok: true };
  },
  createWithdrawal: function(agentId, amount, createdBy) {
    const u = this.user(agentId);
    const w = { id: 'WD' + String(++this.state.seq.wd).padStart(4, '0'), sellerId: agentId, amount, bank: { ...u.bank }, status: 'PENDING_0', createdAt: this.nowIso(), createdBy: createdBy || 'agent', approvals: [], auditLog: [] };
    this.d().withdrawals.unshift(w); this.addLog(agentId, 'Tạo yêu cầu rút ' + RULES.formatMoney(amount) + ' (' + w.id + ')'); this.audit(u.phone, 'AGENT', 'withdrawal', w.id, '', 'PENDING_0', 'Tạo yêu cầu rút tiền'); this.save(); return w;
  },
  approveWithdrawal: function(id, admin) { const w = this.withdrawal(id); if (!w || !(w.status === 'PENDING_0' || w.status === 'PENDING_1')) return { ok: false, message: 'Yêu cầu đã được xử lý.' }; return this.applyApproval(w, 'withdrawal', admin, 'APPROVE'); },
  rejectWithdrawal: function(id, admin, reason) { const w = this.withdrawal(id); if (!w) return { ok: false }; return this.applyApproval(w, 'withdrawal', admin, 'REJECT', reason); },
  markWithdrawalPaid: function(id, admin) { const w = this.withdrawal(id); if (!w || w.status !== 'APPROVED') return { ok: false, message: 'Chỉ đánh dấu đã chi trả sau khi đã duyệt.' }; w.status = 'PAID'; w.paidAt = this.nowIso(); w.paidBy = admin.username; this.audit(admin.username, admin.role, 'withdrawal', id, 'APPROVED', 'PAID', 'Đã chuyển khoản'); this.addLog(w.sellerId, 'Đã chi trả yêu cầu rút ' + id); this.save(); return { ok: true }; },

  // ---------- Hạng (6.1.C-3) ----------
  runMonthEndJob: function(admin) {
    const rr = this.rules().rankRules; const promoted = [], demoted = [];
    this.agents().filter(u => u.status === 'active').forEach(u => {
      const sold = this.salesThisMonth(u.id);
      if (sold < rr.minSalesPerMonth) { if (u.rank !== 'COPPER') { const to = CONFIG.ranks[Math.max(0, RULES.rankIndex(u.rank) - (rr.demoteSteps || 1))].id; u.rankHistory.push({ at: this.nowIso(), from: u.rank, to, event: 'DEMOTE', by: admin ? admin.username : 'job', reason: `Bán ${sold} gói trong tháng (< ${rr.minSalesPerMonth})` }); demoted.push({ user: u, from: u.rank, to }); u.rank = to; u.rankSince = this.nowIso(); if (rr.demoteResetsCumulative) u.cumulativeSales = 0; } }
      else { const target = RULES.rankByCumulativeSales(u.cumulativeSales || 0); if (RULES.rankIndex(target.id) > RULES.rankIndex(u.rank)) { u.rankHistory.push({ at: this.nowIso(), from: u.rank, to: target.id, event: 'PROMOTE', by: admin ? admin.username : 'job', reason: `Luỹ kế ${u.cumulativeSales} gói ≥ ngưỡng ${target.threshold}` }); promoted.push({ user: u, from: u.rank, to: target.id }); u.rank = target.id; u.rankSince = this.nowIso(); } }
    });
    this.audit(admin ? admin.username : 'job', admin ? admin.role : 'JOB', 'rank', 'month-end', '', '', `Job xét hạng: ${promoted.length} thăng hạng, ${demoted.length} giáng hạng`); this.save(); return { promoted, demoted };
  },
  assignRank: function(agentId, rank, admin, reason) { const u = this.user(agentId); if (!u) return; u.rankHistory.push({ at: this.nowIso(), from: u.rank, to: rank, event: 'ASSIGN', by: admin.username, reason }); this.audit(admin.username, admin.role, 'user', agentId, u.rank, rank, 'Chỉ định hạng: ' + reason); u.rank = rank; u.rankSince = this.nowIso(); this.addLog(agentId, 'Head Admin chỉ định hạng ' + RULES.rank(rank).label + ': ' + reason); this.save(); return u; },
  createRootAgent: function(data, admin) {
    if (this.userByPhone(data.phone) && this.userByPhone(data.phone).type === 'agent') return { ok: false, message: 'Số điện thoại đã là thành viên.' };
    const u = this.activateAgent({ phone: data.phone, email: data.email, fullName: data.fullName, bank: data.bank, password: data.password, tcVersion: CONFIG.tc.version }, { rank: data.rank || 'COPPER', referrerId: data.referrerId || null, by: admin.username, reason: 'Tạo thành viên gốc: ' + (data.reason || ''), noSeed: true });
    this.audit(admin.username, admin.role, 'user', u.id, '', 'agent', 'Tạo thành viên gốc · hạng ' + RULES.rank(u.rank).label + ' · ' + (data.reason || '')); this.save(); return { ok: true, user: u };
  },

  // ---------- Người dùng (7.5) ----------
  setUserStatus: function(id, status, reason, admin) { const u = this.user(id); if (!u) return null; const from = u.status; u.status = status; if (status === 'locked') { u.lockedReason = reason; u.lockedAt = this.nowIso(); } else u.lockedReason = null; this.addLog(id, status === 'locked' ? 'Admin khoá tài khoản: ' + reason : 'Admin mở khoá tài khoản'); this.audit(admin ? admin.username : 'admin', admin ? admin.role : '', 'user', id, from, status, reason || ''); this.save(); return u; },
  changeReferrer: function(id, newRefCode, reason, admin) { const u = this.user(id); const ref = this.sellerByRef(newRefCode); if (!u || !ref || ref.id === id) return { ok: false }; if (this.uplineChain(ref.id, 99).some(x => x.id === id)) return { ok: false, message: 'Không thể gán vào tuyến dưới của chính mình.' }; const old = u.referrerId ? this.user(u.referrerId) : null; u.referrerId = ref.id; this.addLog(id, `Head Admin đổi người giới thiệu từ ${old ? old.refCode : '—'} sang ${ref.refCode} · lý do: ${reason}`); this.audit(admin.username, admin.role, 'user', id, old ? old.refCode : '', ref.refCode, 'Đổi người giới thiệu: ' + reason); this.save(); return { ok: true }; },

  // ---------- Gói & bảng hoa hồng (7.7) ----------
  savePackage: function(p, admin) { const list = this.d().packages; const i = list.findIndex(x => x.id === p.id); p.updatedAt = this.nowIso(); if (i >= 0) list[i] = { ...list[i], ...p }; else list.push(Object.assign({ commissionVersions: [], commissionByRank: {}, active: false }, p)); this.audit(admin ? admin.username : 'admin', admin ? admin.role : '', 'package', p.id, '', '', i >= 0 ? 'Sửa gói' : 'Thêm gói'); this.save(); },
  togglePackage: function(id, active, admin) { const p = this.pkg(id); if (p) { if (active) this.packages().forEach(x => { x.active = false; }); p.active = active; p.updatedAt = this.nowIso(); this.audit(admin ? admin.username : 'admin', admin ? admin.role : '', 'package', id, String(!active), String(active), active ? 'Bật bán' : 'Tắt bán'); this.save(); } },
  saveCommissionTable: function(packageId, byRank, effectiveFrom, note, admin) {
    const v = RULES.validateCommissionTable(byRank); if (!v.ok) return v; const p = this.pkg(packageId); if (!p) return { ok: false, message: 'Không tìm thấy gói.' };
    p.commissionVersions = p.commissionVersions || []; const version = (Math.max(0, ...p.commissionVersions.map(x => x.version)) || 0) + 1;
    p.commissionVersions.push({ version, effectiveFrom, byRank: { ...byRank }, note: note || '', by: admin.username, at: this.nowIso() }); if (effectiveFrom <= this.nowIso()) p.commissionByRank = { ...byRank }; p.updatedAt = this.nowIso();
    this.audit(admin.username, admin.role, 'package', packageId, '', 'v' + version, 'Bảng hoa hồng phiên bản ' + version); this.save(); return { ok: true, version };
  },
  saveRankRules: function(patch, admin, note) { const r = this.rules(); Object.assign(r.rankRules, patch.rankRules || {}); Object.assign(r.withdraw, patch.withdraw || {}); r.history.unshift({ at: this.nowIso(), by: admin.username, note: note || 'Cập nhật quy tắc' }); this.audit(admin.username, admin.role, 'rules', 'program', '', '', note || ''); this.save(); },
  saveTc: function(text, version, admin) { const r = this.rules(); r.tc = { version, text, updatedAt: this.nowIso().slice(0, 10) }; r.history.unshift({ at: this.nowIso(), by: admin.username, note: 'Cập nhật T&C phiên bản ' + version }); this.audit(admin.username, admin.role, 'rules', 'tc', '', version, 'T&C'); this.save(); },

  // ---------- Kho (7.8) ----------
  generateCodes: function(n, sku) { const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const g = (k) => Array.from({ length: k }, () => CH[Math.floor(Math.random() * CH.length)]).join(''); const batch = 'B' + String(++this.state.seq.batch).padStart(3, '0'); const start = this.d().codes.length; for (let i = 0; i < n; i++) this.d().codes.push({ code: `${CONFIG.stock.codePrefix}-${g(4)}-${g(4)}-${g(4)}`, deviceSku: sku || CONFIG.stock.deviceSku, deviceSerial: `${sku || CONFIG.stock.deviceSku}-${String(start + i + 1).padStart(6, '0')}`, status: 'IN_STOCK', orderId: null, agentId: null, batch, stockedAt: this.nowIso(), assignedAt: null, activatedAt: null, device: null }); this.save(); return batch; },
  importCodes: function(list, sku) { const batch = 'IMP' + String(++this.state.seq.batch).padStart(3, '0'); let added = 0; list.forEach(row => { if (row.code && !this.codeInfo(row.code)) { this.d().codes.push({ code: row.code, deviceSku: row.deviceSku || sku || CONFIG.stock.deviceSku, deviceSerial: row.deviceSerial || '', status: 'IN_STOCK', orderId: null, agentId: null, batch, stockedAt: this.nowIso(), assignedAt: null, activatedAt: null, device: null }); added++; } }); this.save(); return { batch, added, skipped: list.length - added }; },
  activateCode: function(code, device) { const c = this.codeInfo(code); if (!c || c.status !== 'ASSIGNED') return false; c.status = 'ACTIVATED'; c.activatedAt = this.nowIso(); c.device = { name: (device && device.name) || 'Thiết bị mô phỏng', deviceId: (device && device.deviceId) || 'DEV-' + Math.random().toString(36).slice(2, 10).toUpperCase(), boundAt: c.activatedAt }; this.save(); return true; },
  fulfilPendingLicenses: function() { let n = 0; this.orders().filter(o => o.status === 'PAID' && !o.licenseCode).forEach(o => { if (this.issueLicense(o)) n++; }); this.save(); return n; },

  // ---------- Admin (7.4, 7.9) ----------
  adminLogin: function(username, password) {
    const s = this.s();
    if (s.adminLockUntil && new Date(s.adminLockUntil).getTime() > Date.now()) return { ok: false, locked: true, minutes: Math.ceil((new Date(s.adminLockUntil).getTime() - Date.now()) / 60000) };
    const a = this.adminUsers().find(x => x.username === username && x.password === password && x.status === 'active');
    if (a) { s.admin = { username: a.username, role: a.role, fullName: a.fullName, at: this.nowIso() }; s.adminFails = 0; s.adminLockUntil = null; this.save(); return { ok: true, admin: s.admin }; }
    s.adminFails = (s.adminFails || 0) + 1; if (s.adminFails >= CONFIG.admin.maxLoginFail) { s.adminLockUntil = new Date(Date.now() + CONFIG.admin.lockMinutes * 60000).toISOString(); s.adminFails = 0; this.save(); return { ok: false, locked: true, minutes: CONFIG.admin.lockMinutes }; }
    this.save(); return { ok: false, remaining: CONFIG.admin.maxLoginFail - s.adminFails };
  },
  currentAdmin: function() { return this.s().admin; },
  isHead: function() { const a = this.currentAdmin(); return !!a && a.role === 'HEAD'; },
  logoutAdmin: function() { this.s().admin = null; this.save(); },
  saveAdminUser: function(data, admin) { const list = this.adminUsers(); const ex = list.find(x => x.username === data.username); if (ex) { if (data.password) ex.password = data.password; ex.fullName = data.fullName; ex.role = data.role; this.audit(admin.username, admin.role, 'adminUser', ex.username, '', ex.role, 'Sửa tài khoản admin'); } else { list.push({ username: data.username, password: data.password, role: data.role, fullName: data.fullName, status: 'active', createdAt: this.nowIso(), createdBy: admin.username }); this.audit(admin.username, admin.role, 'adminUser', data.username, '', data.role, 'Tạo tài khoản admin'); } this.save(); return { ok: true }; },
  setAdminStatus: function(username, status, admin) { const a = this.adminUsers().find(x => x.username === username); if (!a) return; const from = a.status; a.status = status; this.audit(admin.username, admin.role, 'adminUser', username, from, status, status === 'disabled' ? 'Vô hiệu hoá' : 'Kích hoạt lại'); this.save(); }
};

Store.load();

// Bất biến: Σ hoa hồng mỗi đơn PAID = mức Lithium (3.850.000đ với CN02)
(function () {
  try {
    const bad = Store.orders().filter(o => o.status === 'PAID' && o.sellerId).filter(o => Store.commissionsOfOrder(o.id).reduce((s, c) => s + c.amount, 0) !== RULES.commissionTotal(Store.commissionByRank(o.packageId, o.paidAt)));
    console.assert(bad.length === 0, 'Σ hoa hồng sai ở ' + bad.length + ' đơn', bad.map(o => o.id));
  } catch (e) { console.warn('Kiểm tra bất biến hoa hồng lỗi', e); }
})();
