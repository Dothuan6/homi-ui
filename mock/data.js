/**
 * HOMI365 / Medigo prototype v2 — dữ liệu mẫu & Store
 *
 * SEED  = dữ liệu mẫu gốc (sinh tất định quanh ngày hiện tại).
 * Store = nguồn dữ liệu DUY NHẤT mà giao diện được phép đọc/ghi (persist localStorage).
 * Mọi thao tác nghiệp vụ (tạo đơn, thanh toán, cấp mã, tính hoa hồng, duyệt, khoá…)
 * đều là hàm của Store để bản demo "bấm là thấy đổi".
 */

/* ------------------------------------------------------------------ */
/* Sinh dữ liệu mẫu tất định                                            */
/* ------------------------------------------------------------------ */
const SEED = (function () {
  let seedState = 20260904;
  const rnd = () => { seedState = (seedState * 1103515245 + 12345) & 0x7fffffff; return seedState / 0x7fffffff; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const ri = (min, max) => min + Math.floor(rnd() * (max - min + 1));
  const now = new Date();
  const daysAgo = (d, h) => { const x = new Date(now.getTime() - d * 86400000); x.setHours(h === undefined ? ri(8, 20) : h, ri(0, 59), 0, 0); return x.toISOString(); };
  const ymd = (iso) => { const d = new Date(iso); return String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = (n) => Array.from({ length: n }, () => CHARS[Math.floor(rnd() * CHARS.length)]).join('');

  const packages = [
    {
      id: 'CN02', name: 'Gói Bác sĩ 24/7', fullName: 'CN02 · Gói Bác sĩ 24/7 (01 năm + đồng hồ HW01)',
      desc: 'Bác sĩ trực 24/7 hỗ trợ, tư vấn sức khoẻ khẩn cấp qua ứng dụng HOMI365. Kèm 01 đồng hồ theo dõi sức khoẻ HW01 giao tận nơi.',
      price: 10000000, licenseMonths: 12, hasShipping: true, active: true,
      benefits: ['Bác sĩ trực 24/7, gọi hỗ trợ khẩn cấp', 'Đồng hồ HW01 đo nhịp tim, SpO2, huyết áp', 'Cảnh báo SOS tự động tới người thân', 'Lưu trữ hồ sơ sức khoẻ 10 năm'],
      updatedAt: daysAgo(40, 10)
    },
    {
      id: 'CN01', name: 'Gói Theo dõi cơ bản', fullName: 'CN01 · Gói Theo dõi cơ bản (06 tháng)',
      desc: 'Theo dõi chỉ số sức khoẻ trên ứng dụng, không kèm thiết bị.',
      price: 3000000, licenseMonths: 6, hasShipping: false, active: false,
      benefits: ['Theo dõi chỉ số trên ứng dụng', 'Nhắc lịch uống thuốc'],
      updatedAt: daysAgo(70, 10)
    }
  ];

  const policies = [
    { version: 1, effectiveFrom: daysAgo(75, 0), tiers: [{ tier: 1, rate: 0.10 }, { tier: 2, rate: 0.05 }, { tier: 3, rate: 0.02 }],
      condition: 'PAID', holdingDays: 7, minWithdraw: 500000, note: 'Chính sách khởi tạo', createdBy: 'admin', createdAt: daysAgo(76, 15) },
    { version: 2, effectiveFrom: daysAgo(25, 0), tiers: [{ tier: 1, rate: 0.12 }, { tier: 2, rate: 0.05 }, { tier: 3, rate: 0.03 }],
      condition: 'PAID', holdingDays: 7, minWithdraw: 500000, note: 'Tăng F1 lên 12%, F3 lên 3% theo chương trình tháng 8', createdBy: 'admin', createdAt: daysAgo(26, 11) }
  ];
  const policyAt = (iso) => policies.filter(p => p.effectiveFrom <= iso).sort((a, b) => b.version - a.version)[0] || policies[0];

  // ----- Người dùng: cây seller 3 tầng + người mua chưa tạo tài khoản -----
  const users = [];
  const addUser = (u) => { users.push(u); return u; };
  const S1 = addUser({ id: 'U001', type: 'seller', fullName: 'Nguyễn Văn An', phone: '0908123456', address: '123 Nguyễn Trãi, P. Thanh Xuân, Hà Nội',
    refCode: 'AN7K2Q', referrerId: null, status: 'active', createdAt: daysAgo(70, 9), cccd: '001078012345',
    bank: { bankName: 'Vietcombank', accountNo: '0123456789', owner: 'NGUYEN VAN AN' } });
  const S2 = addUser({ id: 'U002', type: 'seller', fullName: 'Trần Thị Bình', phone: '0912345678', address: '45 Lê Lợi, P. Bến Nghé, TP. Hồ Chí Minh',
    refCode: 'BINH88', referrerId: 'U001', status: 'active', createdAt: daysAgo(62, 14), cccd: '079185009876',
    bank: { bankName: 'Techcombank', accountNo: '19031234567', owner: 'TRAN THI BINH' } });
  const S3 = addUser({ id: 'U003', type: 'seller', fullName: 'Lê Minh Cường', phone: '0987654321', address: '8 Trần Phú, P. Hải Châu, Đà Nẵng',
    refCode: 'CUONG3', referrerId: 'U002', status: 'active', createdAt: daysAgo(55, 10), cccd: null, bank: null });
  const S4 = addUser({ id: 'U004', type: 'seller', fullName: 'Phạm Thu Dung', phone: '0933222111', address: '22 Hùng Vương, P. Lộc Thọ, Nha Trang',
    refCode: 'DUNG5X', referrerId: 'U001', status: 'active', createdAt: daysAgo(50, 16), cccd: '056190001122', bank: { bankName: 'MBBank', accountNo: '9704229988', owner: 'PHAM THU DUNG' } });
  addUser({ id: 'U005', type: 'seller', fullName: 'Hoàng Văn Em', phone: '0977000111', address: '5 Điện Biên Phủ, P. Vĩnh Ninh, Huế',
    refCode: 'EM9QZT', referrerId: 'U002', status: 'locked', lockedReason: 'Spam link giới thiệu lên nhóm không liên quan', lockedAt: daysAgo(6, 11), createdAt: daysAgo(48, 9), cccd: null, bank: null });
  const S6 = addUser({ id: 'U006', type: 'seller', fullName: 'Vũ Thị Hoa', phone: '0966111222', address: '12 Ngô Quyền, P. Máy Chai, Hải Phòng',
    refCode: 'HOA2M4', referrerId: 'U003', status: 'active', createdAt: daysAgo(40, 13), cccd: null, bank: null });
  const extraNames = ['Đỗ Văn Giang', 'Ngô Thị Hạnh', 'Đặng Văn Khoa', 'Bùi Thị Lan', 'Mai Văn Long', 'Trịnh Thị Mai', 'Lý Văn Nam', 'Phan Thị Oanh', 'Tô Văn Phúc', 'Dương Thị Quỳnh', 'Hồ Văn Sơn', 'Chu Thị Thảo'];
  const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai', 'Nghệ An'];
  const referrers = ['U001', 'U002', 'U003', 'U004', 'U006'];
  extraNames.forEach((name, i) => {
    const id = 'U' + String(7 + i).padStart(3, '0');
    const isSeller = i % 3 !== 2;
    addUser({ id, type: isSeller ? 'seller' : 'buyer', fullName: name, phone: '09' + String(31000000 + i * 7919).slice(0, 8),
      address: `${ri(1, 200)} ${pick(['Lê Duẩn', 'Hai Bà Trưng', 'Nguyễn Huệ', 'Phạm Văn Đồng', 'Trường Chinh'])}, ${pick(cities)}`,
      refCode: isSeller ? code(6) : null, referrerId: pick(referrers), status: 'active', createdAt: daysAgo(ri(3, 45)), cccd: null, bank: null });
  });
  // Người mua mẫu cho luồng A-04 / A-05 (đã mua, chưa tạo tài khoản seller)
  const B1 = addUser({ id: 'U101', type: 'buyer', fullName: 'Lâm Thị Kim', phone: '0901111222', address: '77 Võ Văn Tần, P. Võ Thị Sáu, TP. Hồ Chí Minh',
    refCode: null, referrerId: 'U001', status: 'active', createdAt: daysAgo(9, 15), cccd: null, bank: null });

  // ----- Kho mã kích hoạt -----
  const codes = [];
  for (let i = 0; i < 90; i++) {
    codes.push({ code: `HOMI-${code(4)}-${code(4)}-${code(4)}`, status: 'IN_STOCK', orderId: null, batch: i < 60 ? 'B001' : 'B002', createdAt: i < 60 ? daysAgo(72, 9) : daysAgo(20, 9), device: null });
  }
  let codeCursor = 0;
  const takeCode = (orderId, bound, boundAt) => {
    const c = codes[codeCursor++];
    c.status = bound ? 'BOUND' : 'ISSUED';
    c.orderId = orderId;
    c.issuedAt = boundAt;
    if (bound) c.device = { name: pick(['Samsung Galaxy A54', 'iPhone 13', 'Xiaomi Redmi Note 12', 'OPPO Reno8', 'iPhone 15 Pro', 'Samsung Galaxy S23']), deviceId: 'DEV-' + code(8), boundAt: new Date(new Date(boundAt).getTime() + ri(1, 72) * 3600000).toISOString() };
    return c.code;
  };

  // ----- Đơn hàng 60 ngày + hoa hồng theo chuỗi tuyến -----
  const orders = [];
  const commissions = [];
  const log = [];
  const seqByDay = {};
  const userById = (id) => users.find(u => u.id === id);
  const uplineChain = (sellerId, depth) => { const chain = []; let cur = userById(sellerId); while (cur && chain.length < depth) { chain.push(cur); cur = cur.referrerId ? userById(cur.referrerId) : null; } return chain; };
  const buyerNames = ['Nguyễn Thị Lan Anh', 'Trần Văn Bảo', 'Lê Thị Cẩm', 'Phạm Văn Dũng', 'Hoàng Thị Én', 'Vũ Văn Phong', 'Đỗ Thị Giang', 'Bùi Văn Hải', 'Ngô Thị Yến', 'Đặng Văn Kiên', 'Mai Thị Liên', 'Lý Văn Minh', 'Phan Thị Ngọc', 'Tô Văn Quang', 'Dương Thị Sen', 'Hồ Văn Tài', 'Chu Thị Uyên', 'Đinh Văn Vinh'];
  let cmSeq = 0;
  const sellersForOrders = ['U001', 'U001', 'U001', 'U002', 'U002', 'U003', 'U004', 'U006', 'U007', 'U008', 'U010'];
  const addOrder = (o) => {
    const key = ymd(o.createdAt);
    seqByDay[key] = (seqByDay[key] || 0) + 1;
    o.id = 'HM' + key + String(seqByDay[key]).padStart(3, '0');
    o.expiresAt = new Date(new Date(o.createdAt).getTime() + 900000).toISOString();
    orders.push(o);
    return o;
  };
  const finalizePaid = (o, opts) => {
    const pol = policyAt(o.paidAt);
    o.policyVersion = pol.version;
    o.licenseCode = takeCode(o.id, opts.bound, o.paidAt);
    o.shipping = opts.shipping;
    const seller = userById(o.sellerId);
    if (!seller) return;
    uplineChain(seller.id, pol.tiers.length).forEach((benef, idx) => {
      const tier = pol.tiers[idx];
      const ageDays = (now - new Date(o.paidAt)) / 86400000;
      let status = 'PENDING';
      if (ageDays > 21) status = 'PAID'; else if (ageDays > 9) status = 'APPROVED';
      if (o.refunded) status = 'CANCELLED';
      cmSeq++;
      commissions.push({ id: 'CM' + String(cmSeq).padStart(4, '0'), orderId: o.id, beneficiaryId: benef.id, tier: tier.tier, rate: tier.rate,
        amount: Math.round(o.price * tier.rate), status, policyVersion: pol.version, createdAt: o.paidAt,
        availableAt: new Date(new Date(o.paidAt).getTime() + pol.holdingDays * 86400000).toISOString(),
        approvedAt: status === 'APPROVED' || status === 'PAID' ? new Date(new Date(o.paidAt).getTime() + (pol.holdingDays + 1) * 86400000).toISOString() : null,
        paidAt: status === 'PAID' ? new Date(new Date(o.paidAt).getTime() + (pol.holdingDays + 4) * 86400000).toISOString() : null,
        batchId: status === 'PAID' ? 'LOT-' + ymd(o.paidAt).slice(0, 4) : null });
    });
  };

  for (let d = 58; d >= 0; d--) {
    const n = d % 7 === 0 ? 0 : (d % 3 === 0 ? 2 : 1);
    for (let k = 0; k < n; k++) {
      const seller = userById(pick(sellersForOrders));
      const createdAt = daysAgo(d);
      const r = rnd();
      const o = { fullName: pick(buyerNames), phone: '09' + String(ri(10000000, 99999999)), address: `${ri(1, 300)} ${pick(['Lê Văn Sỹ', 'Cách Mạng Tháng 8', 'Nguyễn Văn Cừ', 'Trần Hưng Đạo', 'Lạc Long Quân'])}, ${pick(cities)}`,
        note: rnd() > .7 ? pick(['Giao giờ hành chính', 'Gọi trước khi giao', 'Để ở bảo vệ toà nhà']) : '', packageId: 'CN02', price: 10000000,
        refCode: seller.refCode, sellerId: seller.id, createdAt, method: r > .35 ? 'gateway' : 'bank', status: 'PAID', shipping: 'PENDING', licenseCode: null, refunded: false, flags: {} };
      if (d > 0 && r > .93) { o.status = 'FAILED'; o.method = 'gateway'; o.failReason = 'Người mua huỷ giao dịch trên cổng'; }
      else if (d > 0 && r > .88) { o.status = 'EXPIRED'; o.method = null; }
      else if (d > 0 && r > .86) { o.status = 'REJECTED'; o.method = 'bank'; o.rejectReason = 'Không tìm thấy giao dịch khớp nội dung'; o.reconciledAt = daysAgo(d - 1); o.reconciledBy = 'admin'; }
      const ord = addOrder(o);
      if (ord.status === 'PAID') {
        ord.paidAt = new Date(new Date(createdAt).getTime() + ri(2, 12) * 60000).toISOString();
        if (ord.method === 'bank') { ord.reconciledAt = ord.paidAt; ord.reconciledBy = 'admin'; }
        if (d > 25 && rnd() > .9) ord.refunded = true;
        const ship = d > 10 ? 'DELIVERED' : d > 5 ? 'SHIPPING' : d > 2 ? 'PACKING' : 'PENDING';
        finalizePaid(ord, { bound: d > 4 && rnd() > .3, shipping: ship });
        if (ord.refunded) { ord.status = 'PAID'; ord.refundedAt = daysAgo(d - 3); }
      }
    }
  }
  // Đơn của người mua mẫu (B1) — PAID qua link của S1, chưa tạo tài khoản, mã đã cấp chưa bind
  const ob = addOrder({ fullName: B1.fullName, phone: B1.phone, address: B1.address, note: '', packageId: 'CN02', price: 10000000, refCode: 'AN7K2Q', sellerId: 'U001',
    createdAt: daysAgo(9, 15), method: 'gateway', status: 'PAID', shipping: 'SHIPPING', licenseCode: null, refunded: false, flags: {} });
  ob.paidAt = new Date(new Date(ob.createdAt).getTime() + 5 * 60000).toISOString();
  finalizePaid(ob, { bound: false, shipping: 'SHIPPING' });
  // Gói của chính seller S1 (đã kích hoạt) và S2
  const os1 = addOrder({ fullName: S1.fullName, phone: S1.phone, address: S1.address, note: '', packageId: 'CN02', price: 10000000, refCode: null, sellerId: null,
    createdAt: daysAgo(70, 9), method: 'gateway', status: 'PAID', shipping: 'DELIVERED', licenseCode: null, refunded: false, flags: {} });
  os1.paidAt = new Date(new Date(os1.createdAt).getTime() + 4 * 60000).toISOString();
  finalizePaid(os1, { bound: true, shipping: 'DELIVERED' });
  const os2 = addOrder({ fullName: S2.fullName, phone: S2.phone, address: S2.address, note: '', packageId: 'CN02', price: 10000000, refCode: 'AN7K2Q', sellerId: 'U001',
    createdAt: daysAgo(62, 14), method: 'bank', status: 'PAID', shipping: 'DELIVERED', licenseCode: null, refunded: false, flags: {} });
  os2.paidAt = new Date(new Date(os2.createdAt).getTime() + 40 * 60000).toISOString(); os2.reconciledAt = os2.paidAt; os2.reconciledBy = 'admin';
  finalizePaid(os2, { bound: true, shipping: 'DELIVERED' });
  // Đơn chuyển khoản đang chờ đối soát (D-03) + 1 đơn callback muộn sau EXPIRED
  [['U001', 2], ['U002', 5], ['U004', 26]].forEach(([sid, hoursAgo]) => {
    const s = userById(sid);
    const createdAt = new Date(now.getTime() - hoursAgo * 3600000).toISOString();
    const o = addOrder({ fullName: pick(buyerNames), phone: '09' + String(ri(10000000, 99999999)), address: `${ri(1, 300)} Nguyễn Thị Minh Khai, ${pick(cities)}`, note: '', packageId: 'CN02', price: 10000000,
      refCode: s.refCode, sellerId: s.id, createdAt, method: 'bank', status: 'AWAITING_RECONCILE', shipping: 'NONE', licenseCode: null, refunded: false, flags: {} });
    o.transferClaimedAt = new Date(new Date(createdAt).getTime() + 6 * 60000).toISOString();
  });
  const late = addOrder({ fullName: 'Nguyễn Văn Tuấn', phone: '0918777666', address: '19 Bà Triệu, P. Hàng Bài, Hà Nội', note: '', packageId: 'CN02', price: 10000000,
    refCode: 'BINH88', sellerId: 'U002', createdAt: daysAgo(1, 10), method: 'gateway', status: 'PAID', shipping: 'PENDING', licenseCode: null, refunded: false, flags: { lateCallback: true } });
  late.paidAt = new Date(new Date(late.createdAt).getTime() + 17 * 60000).toISOString();
  finalizePaid(late, { bound: false, shipping: 'PENDING' });

  orders.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);

  // ----- Yêu cầu rút tiền -----
  const withdrawals = [
    { id: 'WD0001', sellerId: 'U001', amount: 3000000, bank: S1.bank, cccd: S1.cccd, status: 'PAID', createdAt: daysAgo(30, 10), approvedAt: daysAgo(29, 9), paidAt: daysAgo(28, 15), batchId: 'PAY-' + ymd(daysAgo(28)) },
    { id: 'WD0002', sellerId: 'U002', amount: 1500000, bank: S2.bank, cccd: S2.cccd, status: 'PAID', createdAt: daysAgo(24, 11), approvedAt: daysAgo(23, 9), paidAt: daysAgo(22, 15), batchId: 'PAY-' + ymd(daysAgo(22)) },
    { id: 'WD0003', sellerId: 'U001', amount: 2000000, bank: S1.bank, cccd: S1.cccd, status: 'REJECTED', createdAt: daysAgo(15, 16), rejectedAt: daysAgo(14, 10), reason: 'Tên chủ tài khoản không khớp CCCD, vui lòng cập nhật lại' },
    { id: 'WD0004', sellerId: 'U004', amount: 800000, bank: S4.bank, cccd: S4.cccd, status: 'APPROVED', createdAt: daysAgo(3, 9), approvedAt: daysAgo(2, 14) },
    { id: 'WD0005', sellerId: 'U001', amount: 1200000, bank: S1.bank, cccd: S1.cccd, status: 'PENDING', createdAt: daysAgo(1, 17) },
    { id: 'WD0006', sellerId: 'U002', amount: 2500000, bank: S2.bank, cccd: S2.cccd, status: 'PENDING', createdAt: daysAgo(0, 8) }
  ];

  // ----- Ngoại lệ đã cấp (D-08) -----
  const exceptions = [
    { id: 'EX001', phone: S2.phone, userId: 'U002', packageId: 'CN02', code: takeCode('EX001', false, daysAgo(18, 10)), reason: 'Khách mua thêm gói cho mẹ ruột dùng cùng SĐT liên hệ', by: 'admin', at: daysAgo(18, 10) },
    { id: 'EX002', phone: '0908123456', userId: 'U001', packageId: 'CN02', code: takeCode('EX002', true, daysAgo(7, 14)), reason: 'Đổi thiết bị hỏng trong bảo hành, cấp mã mới', by: 'admin', at: daysAgo(7, 14) }
  ];

  // ----- Lượt click theo ngày cho từng seller (90 ngày) -----
  const clicks = {};
  users.filter(u => u.type === 'seller').forEach(u => {
    const base = u.id === 'U001' ? 14 : u.id === 'U002' ? 9 : 4;
    clicks[u.id] = Array.from({ length: 90 }, (_, i) => ({ date: daysAgo(89 - i, 0).slice(0, 10), clicks: Math.max(0, Math.round(base + (rnd() - .5) * base * 1.4)) }));
  });

  // ----- Nhật ký hoạt động -----
  users.forEach(u => {
    log.push({ userId: u.id, at: u.createdAt, text: u.type === 'seller' ? 'Tạo tài khoản seller' : 'Mua gói lần đầu (chưa tạo tài khoản)' });
    if (u.type === 'seller') { log.push({ userId: u.id, at: daysAgo(ri(0, 3)), text: 'Đăng nhập bằng SĐT + OTP' }); }
    if (u.status === 'locked') log.push({ userId: u.id, at: u.lockedAt, text: 'Admin khoá tài khoản: ' + u.lockedReason });
  });
  log.push({ userId: 'U003', at: daysAgo(12, 10), text: 'Admin đổi người giới thiệu từ AN7K2Q sang BINH88 · lý do: đăng ký nhầm mã' });

  return { packages, policies, users, codes, orders, commissions, withdrawals, exceptions, clicks, log };
})();

/* ------------------------------------------------------------------ */
/* Store                                                                */
/* ------------------------------------------------------------------ */
const Store = {
  KEY: 'homi365_proto_v2',
  state: null,

  load: function() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) { this.state = JSON.parse(raw); if (this.state && this.state.version === 2) return; }
    } catch (e) { /* bỏ qua, nạp lại seed */ }
    this.reset(true);
  },
  save: function() { try { localStorage.setItem(this.KEY, JSON.stringify(this.state)); } catch (e) { /* localStorage đầy/không có */ } },
  reset: function(silent) {
    this.state = JSON.parse(JSON.stringify({
      version: 2,
      data: SEED,
      session: { ref: null, refAt: null, refSellerId: null, orderId: null, verifiedPhone: null, buyerDraft: null, seller: null, admin: null, adminFails: 0, adminLockUntil: null, otp: {}, notified: [] },
      seq: { order: 0, cm: SEED.commissions.length, wd: SEED.withdrawals.length, ex: SEED.exceptions.length, user: 200, batch: 3 }
    }));
    this.save();
    if (!silent) window.location.reload();
  },

  nowIso: function() { return new Date().toISOString(); },
  d: function() { return this.state.data; },
  s: function() { return this.state.session; },

  // ---------- Đọc ----------
  packages: function() { return this.d().packages; },
  pkg: function(id) { return this.d().packages.find(p => p.id === id) || null; },
  activePackage: function() { return this.d().packages.find(p => p.active) || null; },
  policies: function() { return this.d().policies.slice().sort((a, b) => b.version - a.version); },
  currentPolicy: function(atIso) {
    const at = atIso || this.nowIso();
    return this.d().policies.filter(p => p.effectiveFrom <= at).sort((a, b) => b.version - a.version)[0] || this.d().policies[0];
  },
  users: function() { return this.d().users; },
  user: function(id) { return this.d().users.find(u => u.id === id) || null; },
  userByPhone: function(phone) { return this.d().users.find(u => u.phone === phone) || null; },
  sellerByRef: function(code) { return this.d().users.find(u => u.type === 'seller' && u.refCode === String(code || '').toUpperCase()) || null; },
  downline: function(sellerId) { return this.d().users.filter(u => u.referrerId === sellerId); },
  uplineChain: function(sellerId, depth) { const chain = []; let cur = this.user(sellerId); while (cur && chain.length < depth) { chain.push(cur); cur = cur.referrerId ? this.user(cur.referrerId) : null; } return chain; },
  orders: function() { return this.d().orders; },
  order: function(id) { return this.d().orders.find(o => o.id === id) || null; },
  ordersByPhone: function(phone) { return this.d().orders.filter(o => o.phone === phone); },
  ordersBySeller: function(sellerId) { return this.d().orders.filter(o => o.sellerId === sellerId); },
  codes: function() { return this.d().codes; },
  codeInfo: function(code) { return this.d().codes.find(c => c.code === code) || null; },
  stockCount: function() { return this.d().codes.filter(c => c.status === 'IN_STOCK').length; },
  commissions: function() { return this.d().commissions; },
  commissionsOf: function(sellerId) { return this.d().commissions.filter(c => c.beneficiaryId === sellerId); },
  withdrawals: function() { return this.d().withdrawals; },
  withdrawalsOf: function(sellerId) { return this.d().withdrawals.filter(w => w.sellerId === sellerId); },
  exceptions: function() { return this.d().exceptions; },
  logOf: function(userId) { return this.d().log.filter(l => l.userId === userId).sort((a, b) => a.at < b.at ? 1 : -1); },
  addLog: function(userId, text) { this.d().log.push({ userId, at: this.nowIso(), text }); },
  clicksOf: function(sellerId) { return this.d().clicks[sellerId] || []; },

  /** Ví seller: khả dụng / đang chờ / tổng đã rút. */
  wallet: function(sellerId) {
    const cms = this.commissionsOf(sellerId);
    const wds = this.withdrawalsOf(sellerId);
    const earned = cms.filter(c => c.status === 'APPROVED' || c.status === 'PAID').reduce((s, c) => s + c.amount, 0);
    const pending = cms.filter(c => c.status === 'PENDING').reduce((s, c) => s + c.amount, 0);
    const held = wds.filter(w => w.status === 'PENDING' || w.status === 'APPROVED').reduce((s, w) => s + w.amount, 0);
    const withdrawn = wds.filter(w => w.status === 'PAID').reduce((s, w) => s + w.amount, 0);
    return { available: earned - held - withdrawn, pending, held, withdrawn, earned };
  },

  /** Sổ cái: dựng từ hoa hồng + rút tiền, có số dư luỹ kế. */
  ledger: function(sellerId) {
    const rows = [];
    this.commissionsOf(sellerId).forEach(c => {
      rows.push({ at: c.createdAt, type: 'COMMISSION_PENDING', amount: c.amount, ref: c.orderId, effect: 0 });
      if (c.approvedAt) rows.push({ at: c.approvedAt, type: 'COMMISSION_AVAILABLE', amount: c.amount, ref: c.orderId, effect: +c.amount });
      if (c.status === 'CANCELLED') rows.push({ at: c.cancelledAt || c.createdAt, type: 'COMMISSION_CANCELLED', amount: c.amount, ref: c.orderId, effect: c.approvedAt ? -c.amount : 0 });
    });
    this.withdrawalsOf(sellerId).forEach(w => {
      rows.push({ at: w.createdAt, type: 'WITHDRAW_HOLD', amount: w.amount, ref: w.id, effect: -w.amount });
      if (w.status === 'PAID') rows.push({ at: w.paidAt, type: 'WITHDRAW_PAID', amount: w.amount, ref: w.id, effect: 0 });
      if (w.status === 'REJECTED') rows.push({ at: w.rejectedAt, type: 'WITHDRAW_REJECTED', amount: w.amount, ref: w.id, effect: +w.amount });
    });
    rows.sort((a, b) => a.at < b.at ? -1 : 1);
    let bal = 0;
    rows.forEach(r => { bal += r.effect; r.balance = bal; });
    return rows.reverse();
  },

  /** Thống kê seller theo kỳ (ngày). */
  sellerStats: function(sellerId, days) {
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const clicks = this.clicksOf(sellerId).filter(c => c.date >= from.slice(0, 10)).reduce((s, c) => s + c.clicks, 0);
    const ords = this.ordersBySeller(sellerId).filter(o => o.createdAt >= from);
    const paid = ords.filter(o => o.status === 'PAID');
    const revenue = paid.reduce((s, o) => s + o.price, 0);
    return { clicks, orders: ords.length, paid: paid.length, revenue, conversion: RULES.conversion(paid.length, clicks) };
  },
  /** Chuỗi ngày cho biểu đồ: doanh số + click từng ngày. */
  sellerSeries: function(sellerId, days) {
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const c = this.clicksOf(sellerId).find(x => x.date === date);
      const paid = this.ordersBySeller(sellerId).filter(o => o.status === 'PAID' && o.createdAt.slice(0, 10) === date).length;
      out.push({ date, clicks: c ? c.clicks : 0, paid, revenue: paid * 10000000 });
    }
    return out;
  },
  adminStats: function(days) {
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const ords = this.orders().filter(o => o.createdAt >= from);
    const paid = ords.filter(o => o.status === 'PAID');
    return {
      revenue: paid.reduce((s, o) => s + o.price, 0),
      orders: ords.length, paid: paid.length,
      newSellers: this.users().filter(u => u.type === 'seller' && u.createdAt >= from).length,
      stock: this.stockCount(),
      awaiting: this.orders().filter(o => o.status === 'AWAITING_RECONCILE').length,
      withdrawPending: this.withdrawals().filter(w => w.status === 'PENDING').length,
      commissionPending: this.commissions().filter(c => c.status === 'PENDING').length,
      lateCallbacks: this.orders().filter(o => o.flags && o.flags.lateCallback && !o.flags.lateChecked).length,
      licensePending: this.orders().filter(o => o.status === 'PAID' && !o.licenseCode).length
    };
  },
  adminSeries: function(days) {
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const paid = this.orders().filter(o => o.status === 'PAID' && o.createdAt.slice(0, 10) === date);
      out.push({ date, paid: paid.length, revenue: paid.reduce((s, o) => s + o.price, 0) });
    }
    return out;
  },

  // ---------- Session: mã giới thiệu, OTP ----------
  captureRef: function(code) {
    const seller = this.sellerByRef(code);
    if (!seller || seller.status !== 'active') return { ok: false, reason: !seller ? 'invalid' : 'locked' };
    const s = this.s();
    s.ref = seller.refCode; s.refAt = this.nowIso(); s.refSellerId = seller.id;
    // ghi nhận 1 lượt click (AC-01)
    const today = this.nowIso().slice(0, 10);
    const arr = this.d().clicks[seller.id] || (this.d().clicks[seller.id] = []);
    const row = arr.find(c => c.date === today);
    if (row) row.clicks += 1; else arr.push({ date: today, clicks: 1 });
    this.save();
    return { ok: true, seller };
  },
  refSeller: function() {
    const s = this.s();
    if (!s.ref || !s.refAt) return null;
    if (Date.now() - new Date(s.refAt).getTime() > CONFIG.session.refDays * 86400000) return null; // BR-07
    return this.sellerByRef(s.ref);
  },

  otpState: function(phone) { const o = this.s().otp; return o[phone] || (o[phone] = { sends: [], wrong: 0, lockUntil: null }); },
  otpCanSend: function(phone) {
    const st = this.otpState(phone);
    const now = Date.now();
    if (st.lockUntil && new Date(st.lockUntil).getTime() > now) return { ok: false, minutes: Math.ceil((new Date(st.lockUntil).getTime() - now) / 60000) };
    st.sends = st.sends.filter(t => now - new Date(t).getTime() < CONFIG.otp.windowMinutes * 60000);
    if (st.sends.length >= CONFIG.otp.maxSendsPerWindow) {
      st.lockUntil = new Date(now + CONFIG.otp.lockMinutes * 60000).toISOString(); this.save();
      return { ok: false, minutes: CONFIG.otp.lockMinutes };
    }
    return { ok: true };
  },
  otpSend: function(phone) { const st = this.otpState(phone); st.sends.push(this.nowIso()); st.wrong = 0; st.sentAt = this.nowIso(); this.save(); return st.sends.length; },
  otpVerify: function(phone, code) {
    const st = this.otpState(phone);
    if (st.lockUntil && new Date(st.lockUntil).getTime() > Date.now()) return { ok: false, locked: true, minutes: Math.ceil((new Date(st.lockUntil).getTime() - Date.now()) / 60000) };
    if (st.sentAt && Date.now() - new Date(st.sentAt).getTime() > CONFIG.otp.ttlSeconds * 1000) return { ok: false, expired: true };
    if (code === CONFIG.otp.mockCode) { st.wrong = 0; this.save(); return { ok: true }; }
    st.wrong += 1;
    if (st.wrong >= CONFIG.otp.maxWrong) { st.lockUntil = new Date(Date.now() + CONFIG.otp.lockMinutes * 60000).toISOString(); this.save(); return { ok: false, locked: true, minutes: CONFIG.otp.lockMinutes }; }
    this.save();
    return { ok: false, remaining: CONFIG.otp.maxWrong - st.wrong };
  },
  otpResetAll: function() { this.s().otp = {}; this.save(); },

  // ---------- Đơn hàng ----------
  nextOrderId: function() {
    const d = new Date();
    const key = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const n = this.orders().filter(o => o.id.startsWith(CONFIG.order.idPrefix + key)).length + 1;
    return CONFIG.order.idPrefix + key + String(n).padStart(3, '0');
  },
  createOrder: function(draft) {
    const pkg = this.activePackage();
    const seller = this.refSeller();
    const createdAt = this.nowIso();
    const o = { id: this.nextOrderId(), fullName: draft.fullName, phone: draft.phone, address: draft.address, note: draft.note || '',
      packageId: pkg.id, price: pkg.price, refCode: seller ? seller.refCode : null, sellerId: seller ? seller.id : null,
      createdAt, expiresAt: RULES.orderExpiry(createdAt), method: null, status: 'PENDING_PAYMENT', shipping: 'NONE', licenseCode: null, refunded: false, flags: {} };
    this.d().orders.unshift(o);
    this.s().orderId = o.id; this.s().verifiedPhone = draft.phone; this.s().buyerDraft = draft;
    this.save();
    return o;
  },
  currentOrder: function() { return this.s().orderId ? this.order(this.s().orderId) : null; },
  setOrder: function(id, patch) { const o = this.order(id); if (!o) return null; Object.assign(o, patch); this.save(); return o; },
  expireOrder: function(id) { const o = this.order(id); if (o && o.status === 'PENDING_PAYMENT') { o.status = 'EXPIRED'; this.save(); } return o; },
  failOrder: function(id, reason) { return this.setOrder(id, { status: 'FAILED', method: 'gateway', failReason: reason || 'Người mua huỷ giao dịch trên cổng', failedAt: this.nowIso() }); },
  retryOrder: function(id) { return this.setOrder(id, { status: 'PENDING_PAYMENT', method: null }); },
  claimTransfer: function(id) { return this.setOrder(id, { status: 'AWAITING_RECONCILE', method: 'bank', transferClaimedAt: this.nowIso() }); },

  /** Thanh toán thành công (cổng callback hoặc admin xác nhận đối soát): cấp mã + hoa hồng. */
  markPaid: function(id, method, extra) {
    const o = this.order(id);
    if (!o) return null;
    const late = o.status === 'EXPIRED';
    Object.assign(o, { status: 'PAID', method: method || o.method, paidAt: this.nowIso(), shipping: this.pkg(o.packageId) && this.pkg(o.packageId).hasShipping ? 'PENDING' : 'NONE' }, extra || {});
    if (late) o.flags.lateCallback = true;
    this.issueLicense(o);
    this.createCommissions(o);
    let u = this.userByPhone(o.phone);
    if (!u) {
      u = { id: 'U' + String(++this.state.seq.user).padStart(3, '0'), type: 'buyer', fullName: o.fullName, phone: o.phone, address: o.address, refCode: null, referrerId: o.sellerId, status: 'active', createdAt: this.nowIso(), cccd: null, bank: null };
      this.d().users.push(u);
      this.addLog(u.id, 'Mua gói ' + o.packageId + ' qua link ' + (o.refCode || '—') + ' (đơn ' + o.id + ')');
    } else {
      this.addLog(u.id, 'Thanh toán đơn ' + o.id);
    }
    this.save();
    return o;
  },
  issueLicense: function(o) {
    const c = this.d().codes.find(x => x.status === 'IN_STOCK');
    if (!c) { o.licenseCode = null; o.licensePending = true; return null; }
    c.status = 'ISSUED'; c.orderId = o.id; c.issuedAt = this.nowIso();
    o.licenseCode = c.code; o.licensePending = false;
    return c.code;
  },
  createCommissions: function(o) {
    if (!o.sellerId) return;
    const pol = this.currentPolicy();
    o.policyVersion = pol.version;
    this.uplineChain(o.sellerId, pol.tiers.length).forEach((benef, idx) => {
      const tier = pol.tiers[idx];
      this.d().commissions.push({ id: 'CM' + String(++this.state.seq.cm).padStart(4, '0'), orderId: o.id, beneficiaryId: benef.id, tier: tier.tier, rate: tier.rate,
        amount: RULES.commissionAmount(o.price, tier.rate), status: 'PENDING', policyVersion: pol.version, createdAt: this.nowIso(), availableAt: RULES.availableAt(this.nowIso(), pol), approvedAt: null, paidAt: null, batchId: null });
    });
  },
  confirmReconcile: function(id) { const o = this.markPaid(id, 'bank', { reconciledAt: this.nowIso(), reconciledBy: 'admin' }); return o; },
  rejectReconcile: function(id, reason) { return this.setOrder(id, { status: 'REJECTED', rejectReason: reason, reconciledAt: this.nowIso(), reconciledBy: 'admin' }); },
  updateShipping: function(id, step) { const o = this.setOrder(id, { shipping: step }); if (o) { o.shippingLog = o.shippingLog || []; o.shippingLog.push({ step, at: this.nowIso(), by: 'admin' }); this.save(); } return o; },
  clearLateFlag: function(id) { const o = this.order(id); if (o) { o.flags.lateChecked = true; this.save(); } },
  refundOrder: function(id) {
    const o = this.order(id); if (!o) return null;
    o.refunded = true; o.refundedAt = this.nowIso();
    this.commissions().filter(c => c.orderId === id && c.status !== 'PAID').forEach(c => { c.status = 'CANCELLED'; c.cancelledAt = this.nowIso(); });
    this.save(); return o;
  },

  // ---------- Seller ----------
  genRefCode: function() { const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c; do { c = Array.from({ length: 6 }, () => CH[Math.floor(Math.random() * CH.length)]).join(''); } while (this.sellerByRef(c)); return c; },
  createSellerFromOrder: function(orderId) {
    const o = this.order(orderId);
    if (!o) return null;
    let u = this.userByPhone(o.phone);
    if (u && u.type === 'seller') return u;
    if (!u) { u = { id: 'U' + String(++this.state.seq.user).padStart(3, '0'), phone: o.phone, cccd: null, bank: null, createdAt: this.nowIso(), status: 'active' }; this.d().users.push(u); }
    Object.assign(u, { type: 'seller', fullName: o.fullName, address: o.address, refCode: this.genRefCode(), referrerId: o.sellerId, activatedAt: this.nowIso() });
    this.d().clicks[u.id] = [];
    this.addLog(u.id, 'Tạo tài khoản seller từ đơn ' + o.id + ' (BR-10, không nhập lại)');
    if (CONFIG.demo.seedNewSeller) this.seedDemoActivity(u);
    this.save();
    return u;
  },

  /**
   * Chỉ dùng cho bản demo: seller vừa tạo được sinh sẵn 30 ngày lượt click,
   * vài đơn qua link của họ (đã thanh toán / chờ đối soát) và hoa hồng tương ứng,
   * để dashboard C-01/C-03 có dữ liệu xem ngay. Thực tế seller mới bắt đầu từ 0.
   */
  seedDemoActivity: function(u) {
    const day = 86400000; const now = Date.now();
    const pkg = this.activePackage(); const pol = this.currentPolicy();
    const names = ['Nguyễn Thị Mai', 'Trần Văn Hùng', 'Lê Thị Thu', 'Phạm Văn Đức', 'Hoàng Thị Nga', 'Vũ Văn Tâm'];
    const streets = ['Lê Văn Sỹ', 'Cách Mạng Tháng 8', 'Nguyễn Văn Cừ', 'Trần Hưng Đạo', 'Phạm Văn Đồng'];
    const cities = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
    // Lượt click 30 ngày (tăng dần về gần đây)
    this.d().clicks[u.id] = Array.from({ length: 30 }, (_, i) => ({ date: new Date(now - (29 - i) * day).toISOString().slice(0, 10), clicks: Math.max(0, Math.round(2 + i * 0.3 + Math.random() * 4)) }));
    // 5 đơn: 4 PAID (2 đã duyệt HH, 2 chờ duyệt) + 1 chờ đối soát
    const specs = [[22, 'PAID', 'gateway', 'DELIVERED', true], [16, 'PAID', 'bank', 'DELIVERED', true], [8, 'PAID', 'gateway', 'SHIPPING', false], [3, 'PAID', 'gateway', 'PACKING', false], [0.2, 'AWAITING_RECONCILE', 'bank', 'NONE', false]];
    specs.forEach((sp, i) => {
      const [ago, status, method, shipping, approved] = sp;
      const createdAt = new Date(now - ago * day).toISOString();
      const key = createdAt.slice(2, 10).replace(/-/g, '');
      const seq = this.orders().filter(x => x.id.startsWith(CONFIG.order.idPrefix + key)).length + 1;
      const o = { id: CONFIG.order.idPrefix + key + String(seq).padStart(3, '0'), fullName: names[i], phone: '09' + String(Math.floor(10000000 + Math.random() * 89999999)),
        address: `${10 + i * 7} ${streets[i % streets.length]}, ${cities[i % cities.length]}`, note: '', packageId: pkg.id, price: pkg.price, refCode: u.refCode, sellerId: u.id,
        createdAt, expiresAt: RULES.orderExpiry(createdAt), method, status, shipping, licenseCode: null, refunded: false, flags: {} };
      if (status === 'PAID') {
        o.paidAt = new Date(new Date(createdAt).getTime() + 5 * 60000).toISOString();
        if (method === 'bank') { o.reconciledAt = o.paidAt; o.reconciledBy = 'admin'; }
        this.issueLicense(o);
        const c = o.licenseCode ? this.codeInfo(o.licenseCode) : null;
        if (c) { c.issuedAt = o.paidAt; if (ago > 5) { c.status = 'BOUND'; c.device = { name: ['Samsung Galaxy A54', 'iPhone 13', 'OPPO Reno8'][i % 3], deviceId: 'DEV-' + Math.random().toString(36).slice(2, 10).toUpperCase(), boundAt: new Date(new Date(o.paidAt).getTime() + day).toISOString() }; } }
        o.policyVersion = pol.version;
        this.uplineChain(u.id, pol.tiers.length).forEach((benef, idx) => {
          const tier = pol.tiers[idx];
          this.d().commissions.push({ id: 'CM' + String(++this.state.seq.cm).padStart(4, '0'), orderId: o.id, beneficiaryId: benef.id, tier: tier.tier, rate: tier.rate,
            amount: RULES.commissionAmount(o.price, tier.rate), status: approved ? 'APPROVED' : 'PENDING', policyVersion: pol.version, createdAt: o.paidAt,
            availableAt: RULES.availableAt(o.paidAt, pol), approvedAt: approved ? new Date(new Date(o.paidAt).getTime() + (pol.holdingDays + 1) * day).toISOString() : null, paidAt: null, batchId: null });
        });
      } else { o.transferClaimedAt = new Date(new Date(createdAt).getTime() + 4 * 60000).toISOString(); }
      this.d().orders.unshift(o);
    });
    this.d().orders.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    this.addLog(u.id, 'Dữ liệu mẫu demo: 30 ngày lượt click, 5 đơn qua link giới thiệu');
  },
  loginSeller: function(userId, remember, next) {
    this.s().seller = { userId, remember: !!remember, at: this.nowIso(), expiresAt: new Date(Date.now() + (remember ? CONFIG.session.rememberDays * 86400000 : CONFIG.session.sellerHours * 3600000)).toISOString() };
    this.addLog(userId, 'Đăng nhập bằng SĐT + OTP' + (remember ? ' (ghi nhớ 30 ngày)' : ''));
    this.save();
  },
  currentSeller: function() {
    const s = this.s().seller;
    if (!s) return null;
    if (new Date(s.expiresAt).getTime() < Date.now()) return null;
    const u = this.user(s.userId);
    return u && u.type === 'seller' && u.status === 'active' ? u : null;
  },
  logoutSeller: function() { this.s().seller = null; this.save(); },
  expireSellerSession: function() { const s = this.s().seller; if (s) { s.expiresAt = new Date(Date.now() - 1000).toISOString(); this.save(); } },
  updateSellerProfile: function(userId, patch) { const u = this.user(userId); if (u) { Object.assign(u, patch); this.addLog(userId, 'Cập nhật hồ sơ'); this.save(); } return u; },
  sellerPackageOrder: function(phone) { return this.ordersByPhone(phone).filter(o => o.status === 'PAID').sort((a, b) => a.paidAt < b.paidAt ? 1 : -1)[0] || null; },
  resendCodeSms: function(userId) { this.addLog(userId, 'Gửi lại mã kích hoạt qua SMS'); this.save(); },

  // ---------- Rút tiền ----------
  createWithdrawal: function(sellerId, amount, bank, cccd) {
    const u = this.user(sellerId);
    u.bank = bank; u.cccd = cccd;
    const w = { id: 'WD' + String(++this.state.seq.wd).padStart(4, '0'), sellerId, amount, bank: { ...bank }, cccd, status: 'PENDING', createdAt: this.nowIso() };
    this.d().withdrawals.unshift(w);
    this.addLog(sellerId, 'Tạo yêu cầu rút ' + RULES.formatMoney(amount) + ' (' + w.id + ')');
    this.save();
    return w;
  },
  setWithdrawal: function(id, patch) { const w = this.withdrawals().find(x => x.id === id); if (w) { Object.assign(w, patch); this.save(); } return w; },
  approveWithdrawal: function(id) { return this.setWithdrawal(id, { status: 'APPROVED', approvedAt: this.nowIso() }); },
  rejectWithdrawal: function(id, reason) { return this.setWithdrawal(id, { status: 'REJECTED', rejectedAt: this.nowIso(), reason }); },
  payWithdrawals: function(ids) { const batch = 'PAY-' + this.nowIso().slice(2, 10).replace(/-/g, ''); ids.forEach(id => this.setWithdrawal(id, { status: 'PAID', paidAt: this.nowIso(), batchId: batch })); return batch; },

  // ---------- Hoa hồng (D-07) ----------
  setCommissions: function(ids, patch) { this.commissions().filter(c => ids.includes(c.id)).forEach(c => Object.assign(c, patch)); this.save(); },
  approveCommissions: function(ids) { this.setCommissions(ids, { status: 'APPROVED', approvedAt: this.nowIso() }); },
  payCommissions: function(ids) { const batch = 'LOT-' + this.nowIso().slice(2, 10).replace(/-/g, '') + '-' + (++this.state.seq.batch); this.setCommissions(ids, { status: 'PAID', paidAt: this.nowIso(), batchId: batch }); return batch; },
  cancelCommissions: function(ids, reason) { this.setCommissions(ids, { status: 'CANCELLED', cancelledAt: this.nowIso(), cancelReason: reason }); },

  // ---------- Người dùng (D-02) ----------
  setUserStatus: function(id, status, reason) {
    const u = this.user(id); if (!u) return null;
    u.status = status; if (status === 'locked') { u.lockedReason = reason; u.lockedAt = this.nowIso(); } else { u.lockedReason = null; }
    this.addLog(id, status === 'locked' ? 'Admin khoá tài khoản: ' + reason : 'Admin mở khoá tài khoản');
    this.save(); return u;
  },
  changeReferrer: function(id, newRefCode, reason) {
    const u = this.user(id); const ref = this.sellerByRef(newRefCode);
    if (!u || !ref || ref.id === id) return { ok: false };
    const old = u.referrerId ? this.user(u.referrerId) : null;
    u.referrerId = ref.id;
    this.addLog(id, `Admin đổi người giới thiệu từ ${old ? old.refCode : '—'} sang ${ref.refCode} · lý do: ${reason}`);
    this.save(); return { ok: true };
  },

  // ---------- Gói (D-04) ----------
  savePackage: function(p) {
    const list = this.d().packages; const i = list.findIndex(x => x.id === p.id);
    p.updatedAt = this.nowIso();
    if (i >= 0) list[i] = { ...list[i], ...p }; else list.push(p);
    this.save();
  },
  togglePackage: function(id, active) { const p = this.pkg(id); if (p) { if (active) this.packages().forEach(x => { x.active = false; }); p.active = active; p.updatedAt = this.nowIso(); this.save(); } },

  // ---------- Kho mã (D-05) ----------
  generateCodes: function(n) {
    const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const g = (k) => Array.from({ length: k }, () => CH[Math.floor(Math.random() * CH.length)]).join('');
    const batch = 'B' + String(++this.state.seq.batch).padStart(3, '0');
    for (let i = 0; i < n; i++) this.d().codes.push({ code: `${CONFIG.stock.codePrefix}-${g(4)}-${g(4)}-${g(4)}`, status: 'IN_STOCK', orderId: null, batch, createdAt: this.nowIso(), device: null });
    this.save(); return batch;
  },
  importCodes: function(list) {
    const batch = 'IMP' + String(++this.state.seq.batch).padStart(3, '0');
    let added = 0;
    list.forEach(code => { if (code && !this.codeInfo(code)) { this.d().codes.push({ code, status: 'IN_STOCK', orderId: null, batch, createdAt: this.nowIso(), device: null }); added++; } });
    this.save(); return { batch, added, skipped: list.length - added };
  },
  /** Cấp mã cho các đơn PAID đang "chờ cấp" khi kho có mã trở lại. */
  fulfilPendingLicenses: function() {
    let n = 0;
    this.orders().filter(o => o.status === 'PAID' && !o.licenseCode).forEach(o => { if (this.issueLicense(o)) n++; });
    this.save(); return n;
  },

  // ---------- Chính sách (D-06) ----------
  savePolicy: function(p) {
    const v = Math.max(...this.d().policies.map(x => x.version)) + 1;
    this.d().policies.push({ ...p, version: v, createdBy: 'admin', createdAt: this.nowIso() });
    this.save(); return v;
  },

  // ---------- Ngoại lệ (D-08) ----------
  grantException: function(phone, packageId, reason) {
    const u = this.userByPhone(phone);
    const c = this.d().codes.find(x => x.status === 'IN_STOCK');
    if (!c) return { ok: false, reason: 'Kho mã đã hết' };
    c.status = 'ISSUED'; c.orderId = 'EX'; c.issuedAt = this.nowIso();
    const ex = { id: 'EX' + String(++this.state.seq.ex).padStart(3, '0'), phone, userId: u ? u.id : null, packageId, code: c.code, reason, by: 'admin', at: this.nowIso() };
    c.orderId = ex.id;
    this.d().exceptions.unshift(ex);
    if (u) this.addLog(u.id, 'Admin cấp ngoại lệ gói ' + packageId + ' (' + ex.id + '): ' + reason);
    this.save(); return { ok: true, ex };
  },

  // ---------- Admin session (D-00) ----------
  adminLogin: function(username, password) {
    const s = this.s();
    if (s.adminLockUntil && new Date(s.adminLockUntil).getTime() > Date.now()) return { ok: false, locked: true, minutes: Math.ceil((new Date(s.adminLockUntil).getTime() - Date.now()) / 60000) };
    if (username === CONFIG.admin.mockUser && password === CONFIG.admin.mockPassword) { s.admin = { username, at: this.nowIso() }; s.adminFails = 0; s.adminLockUntil = null; this.save(); return { ok: true }; }
    s.adminFails = (s.adminFails || 0) + 1;
    if (s.adminFails >= CONFIG.admin.maxLoginFail) { s.adminLockUntil = new Date(Date.now() + CONFIG.admin.lockMinutes * 60000).toISOString(); s.adminFails = 0; this.save(); return { ok: false, locked: true, minutes: CONFIG.admin.lockMinutes }; }
    this.save(); return { ok: false, remaining: CONFIG.admin.maxLoginFail - s.adminFails };
  },
  currentAdmin: function() { return this.s().admin; },
  logoutAdmin: function() { this.s().admin = null; this.save(); }
};

Store.load();
