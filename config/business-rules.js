/**
 * HOMI365 / Medigo prototype v2 — cấu hình & quy tắc nghiệp vụ
 *
 * QUY ƯỚC: file này chỉ chứa SỐ GỐC và HÀM SUY DIỄN. Giao diện không viết số cứng.
 * Các giá trị đánh dấu [đề xuất] là con số đề xuất trong PRD (BR-05/06/07) — chưa chốt với khách.
 * Giả định theo kế hoạch redesign mục 6 (chờ TTS chốt):
 *   (1) Nhận diện HOMI365 ở header/logo; gói vẫn là CN02 "Bác sĩ 24/7".
 *   (2) Gói CN02 10.000.000đ, có giao hàng vật lý (đồng hồ HW01).
 *   (3) Bỏ hạng thành viên & điểm; không hiển thị danh sách tuyến dưới.
 *   (4) D-07 gộp duyệt hoa hồng + duyệt rút tiền, 2 tab.
 *   (5) Cổng online: nút chung "Thanh toán qua cổng" + màn redirect giả lập.
 *   (6) Hoa hồng mặc định 3 tầng F1/F2/F3 (cấu hình động ở D-06).
 *   (7) Kích hoạt thiết bị qua app — web chỉ hiển thị.
 */

const CONFIG = {
  brand: {
    name: 'HOMI365',
    productLine: 'Medigo',
    supportHotline: '1900 6868',
    supportHours: '08:00 – 20:00 hằng ngày',
    company: 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ HUY GIÁP',
    baseUrl: 'https://homi-dev-ui.netlify.app'   // bản deploy demo; khi lên tên miền thật đổi thành https://homi365.vn và bỏ '#' trong referralUrl
  },

  /** Mốc "hôm nay" của bản demo — dữ liệu mẫu sinh quanh mốc này. */
  today: '2026-09-04T09:30:00',

  /** Gói mặc định (D-04 quản lý nhiều gói, giai đoạn này vận hành 1 gói). */
  defaultPackageId: 'CN02',

  /** BR-05 · OTP [đề xuất] */
  otp: {
    length: 6,
    ttlSeconds: 300,          // hiệu lực 5 phút
    maxWrong: 5,              // tối đa 5 lần nhập sai / 1 mã
    resendSeconds: 60,        // gửi lại sau 60 giây
    maxSendsPerWindow: 5,     // tối đa 5 lần gửi / SĐT / 30 phút
    windowMinutes: 30,
    lockMinutes: 30,          // vượt ngưỡng → khoá gửi OTP 30 phút
    mockCode: '123456'
  },

  /** BR-06 · thời hạn giữ đơn [đề xuất] */
  order: {
    holdSeconds: 900,         // 15 phút
    warnSeconds: 60,          // < 60s đếm ngược chuyển đỏ
    reconcilePollSeconds: 10, // A-03 polling khi chờ đối soát
    idPrefix: 'HM'
  },

  /** BR-07 · session [đề xuất] */
  session: {
    refDays: 7,
    sellerHours: 24,
    rememberDays: 30
  },

  /** D-00 · đăng nhập quản trị */
  admin: {
    maxLoginFail: 5,
    lockMinutes: 15,
    pageSize: 10,
    mockUser: 'admin',
    mockPassword: 'Homi@2026'
  },

  /** Tài khoản nhận chuyển khoản VietQR (chờ khách cung cấp) */
  vietqr: {
    bankName: 'Vietcombank',
    bankShort: 'VCB',
    accountNo: '0108294845',
    accountName: 'CONG TY TNHH GIAI PHAP CONG NGHE HUY GIAP'
  },

  /** Cổng online (chưa chốt nhà cung cấp) */
  gateway: {
    label: 'Cổng thanh toán online',
    desc: 'Thẻ ATM nội địa, thẻ quốc tế, ví điện tử. Chuyển hướng sang cổng, kết quả cập nhật ngay.'
  },

  /** D-05 · kho mã */
  stock: {
    lowThreshold: 20,
    codePrefix: 'HOMI'
  },

  /** Trạng thái giao hàng (admin cập nhật thủ công tại D-03). */
  shippingSteps: ['PENDING', 'PACKING', 'SHIPPING', 'DELIVERED'],

  /** Bộ lọc kỳ thống kê (C-01, D-01). */
  periods: [
    { id: 'week',  label: '7 ngày' },
    { id: 'month', label: '30 ngày' },
    { id: 'quarter', label: '90 ngày' }
  ],
  defaultPeriod: 'month',

  /**
   * Nội dung giới thiệu sản phẩm hiển thị ở cột phải A-01 (chuyển từ trang chủ A0 của prototype v1,
   * đổi nhận diện GoCare → HOMI365). Nội dung tĩnh theo mã gói; D-04 quản lý giá/thời hạn/quyền lợi ngắn.
   */
  productContent: {
    CN02: {
      lead: 'Gói dịch vụ cao cấp bao gồm 01 đồng hồ thông minh HW01 theo dõi nhịp tim / SOS giao tận nơi và 01 năm phần mềm Bác sĩ 24/7 (mã kích hoạt gửi qua SMS).',
      intro: 'Gói Bác sĩ 24/7 hỗ trợ, tư vấn sức khoẻ (ký hiệu CN02) cung cấp các tính năng nâng cao của nền tảng HOMI365. Ngoài việc tự theo dõi sức khoẻ cá nhân, người dùng được Trợ lý sức khoẻ theo dõi 24/7, được tư vấn trực tuyến từ đội ngũ bác sĩ, và khi có tình huống bất thường khẩn cấp hệ thống tự động gọi tới người thân kèm vị trí của người dùng để hỗ trợ kịp thời.',
      storageYears: 10, storageSizeMB: 50,
      gallery: [
        { src: './public/product/nc-1.png', thumb: './public/product/thumbs/nc-1.png', title: 'Theo dõi, quản lý sức khoẻ cá nhân' },
        { src: './public/product/nc-2.png', thumb: './public/product/thumbs/nc-2.png', title: 'Thu nhận dữ liệu vào ứng dụng' },
        { src: './public/product/nc-3.png', thumb: './public/product/thumbs/nc-3.png', title: 'Lưu trữ dữ liệu sức khoẻ' },
        { src: './public/product/nc-4.png', thumb: './public/product/thumbs/nc-4.png', title: 'Chia sẻ thông tin sức khoẻ online' },
        { src: './public/product/nc-5.png', thumb: './public/product/thumbs/nc-5.png', title: 'Cảnh báo và hỗ trợ khẩn cấp (SOS)' },
        { src: './public/product/nc-6.png', thumb: './public/product/thumbs/nc-6.png', title: 'Theo dõi và chăm sóc sức khoẻ từ xa' }
      ],
      features: [
        { title: 'Theo dõi, quản lý sức khoẻ cá nhân', items: ['Sử dụng nền tảng HOMI365 để theo dõi, quản lý dữ liệu sức khoẻ cá nhân với các tính năng nâng cao.'] },
        { title: 'Thu nhận dữ liệu vào ứng dụng', items: ['Thu nhận dữ liệu từ thiết bị đo kết nối đến ứng dụng', 'Nhập dữ liệu thông tin sức khoẻ thủ công', 'Tải hồ sơ sức khoẻ', 'Nhập hồ sơ sức khoẻ bằng chụp OCR'] },
        { title: 'Lưu trữ dữ liệu sức khoẻ', items: ['Thời gian lưu trữ kéo dài 10 năm', 'Dung lượng lưu trữ tối đa 50MB'] },
        { title: 'Chia sẻ thông tin sức khoẻ online', items: ['Chia sẻ dữ liệu sức khoẻ với Trung tâm theo dõi, chăm sóc sức khoẻ TT247', 'Thêm không giới hạn người thân theo dõi', 'Không cho phép thêm bác sĩ theo dõi'] },
        { title: 'Cảnh báo và hỗ trợ khẩn cấp (SOS)', items: ['Tự động gửi cảnh báo khi có chỉ số sức khoẻ bất thường qua thông báo trên ứng dụng', 'Cuộc gọi tự động (Callbot) thông báo tình trạng bất thường nghiêm trọng đến người thân', 'Nút SOS trên ứng dụng để yêu cầu hỗ trợ từ TT247 và người thân'] },
        { title: 'Theo dõi và chăm sóc sức khoẻ từ xa', items: ['Gọi lên TT247 để được Trợ lý sức khoẻ giải đáp về dịch vụ và tư vấn sức khoẻ trong phạm vi được hướng dẫn', 'TT247 chủ động theo dõi và hỗ trợ từ xa khi có bất thường nghiêm trọng hoặc khi nhấn nút SOS'] },
        { title: 'Dịch vụ Bác sĩ 24/7', items: ['Bác sĩ 24/7 hỗ trợ khi người dùng gặp bất thường nghiêm trọng về sức khoẻ hoặc nhấn nút SOS trên ứng dụng'] },
        { title: 'Tính năng nâng cao của nền tảng', items: ['Nhắc lịch uống thuốc', 'Người thân theo dõi lịch uống thuốc', 'Phân tích dữ liệu bằng AI theo tuần, tháng, năm để đưa ra xu hướng bệnh lý và nguy cơ tiềm ẩn, kèm tư vấn của bác sĩ'] }
      ]
    }
  },

  banks: ['Vietcombank', 'BIDV', 'VietinBank', 'Agribank', 'Techcombank', 'MBBank', 'ACB', 'VPBank', 'Sacombank', 'TPBank'],

  demo: {
    simulatedLatencyMs: 450,
    navigator: false,          // nút "Demo" góc phải (chỉ bật khi review nội bộ) — bản gửi KH tắt
    seedNewSeller: true,       // seller vừa tạo được sinh sẵn click/đơn/hoa hồng mẫu để dashboard không trống
    smsErrorPhone: '0911111111', // SĐT mẫu: gửi OTP luôn báo lỗi dịch vụ SMS (A-01 trạng thái g)
    adminPhone: '0900000000',    // SĐT mẫu của tài khoản admin (A-05 từ chối theo BR-12)
    reconcileAutoSeconds: 0    // > 0: tự động đối soát sau N giây (0 = chờ admin ở D-03)
  }
};

/* ------------------------------------------------------------------ */
/* Nhãn & phân loại trạng thái (dùng cho badge — luôn có chữ)          */
/* ------------------------------------------------------------------ */
const LABELS = {
  orderStatus: {
    PENDING_PAYMENT:    { text: 'Chờ thanh toán',  tone: 'warning' },
    PAID:               { text: 'Đã thanh toán',   tone: 'success' },
    FAILED:             { text: 'Thất bại',        tone: 'error' },
    AWAITING_RECONCILE: { text: 'Chờ đối soát',    tone: 'info' },
    EXPIRED:            { text: 'Hết hạn',         tone: 'neutral' },
    REJECTED:           { text: 'Bị từ chối',      tone: 'error' }
  },
  shipping: {
    NONE:      { text: 'Chưa giao',      tone: 'neutral' },
    PENDING:   { text: 'Chờ xử lý',      tone: 'warning' },
    PACKING:   { text: 'Đang đóng gói',  tone: 'info' },
    SHIPPING:  { text: 'Đang giao',      tone: 'info' },
    DELIVERED: { text: 'Đã giao',        tone: 'success' }
  },
  license: {
    IN_STOCK: { text: 'Trong kho',  tone: 'neutral' },
    ISSUED:   { text: 'Đã cấp',     tone: 'info' },
    BOUND:    { text: 'Đã kích hoạt', tone: 'success' },
    PENDING:  { text: 'Chờ cấp',    tone: 'warning' }
  },
  commission: {
    PENDING:   { text: 'Chờ duyệt',   tone: 'warning' },
    APPROVED:  { text: 'Đã duyệt',    tone: 'info' },
    PAID:      { text: 'Đã chi',      tone: 'success' },
    CANCELLED: { text: 'Đã huỷ',      tone: 'error' }
  },
  withdrawal: {
    PENDING:  { text: 'Chờ duyệt', tone: 'warning' },
    APPROVED: { text: 'Đã duyệt',  tone: 'info' },
    PAID:     { text: 'Đã chi',    tone: 'success' },
    REJECTED: { text: 'Từ chối',   tone: 'error' }
  },
  user: {
    active: { text: 'Đang hoạt động', tone: 'success' },
    locked: { text: 'Đã khoá',        tone: 'error' }
  },
  userType: {
    buyer:  { text: 'Người mua (chưa TK)', tone: 'neutral' },
    seller: { text: 'Seller',              tone: 'navy' }
  },
  method: {
    gateway: 'Cổng online',
    bank: 'Chuyển khoản VietQR',
    exception: 'Cấp ngoại lệ'
  },
  ledger: {
    COMMISSION_PENDING:   'Hoa hồng ghi nhận (chờ duyệt)',
    COMMISSION_AVAILABLE: 'Hoa hồng đã duyệt',
    WITHDRAW_HOLD:        'Tạo yêu cầu rút tiền',
    WITHDRAW_PAID:        'Đã chi rút tiền',
    WITHDRAW_REJECTED:    'Hoàn lại (rút tiền bị từ chối)',
    COMMISSION_CANCELLED: 'Huỷ hoa hồng (đơn hoàn tiền)'
  }
};

/* ------------------------------------------------------------------ */
/* Hàm suy diễn                                                         */
/* ------------------------------------------------------------------ */
const RULES = {
  now: function() { return new Date(CONFIG.today); },

  formatMoney: function(num) {
    const n = Math.round(Number(num) || 0);
    return (n < 0 ? '-' : '') + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  },
  formatNumber: function(num) {
    return Math.round(Number(num) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },
  formatPercent: function(rate, digits) {
    const d = digits === undefined ? 0 : digits;
    return (Number(rate || 0) * 100).toFixed(d).replace('.', ',') + '%';
  },
  formatDate: function(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const p = (v) => String(v).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  },
  formatDateTime: function(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const p = (v) => String(v).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  },
  formatDuration: function(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const p = (v) => String(v).padStart(2, '0');
    return `${p(Math.floor(s / 60))}:${p(s % 60)}`;
  },

  /** BR-02: chuẩn hoá SĐT di động VN về 0xxxxxxxxx. Trả về '' nếu không hợp lệ. */
  normalizePhone: function(raw) {
    let p = String(raw || '').replace(/[^\d+]/g, '');
    if (p.startsWith('+84')) p = '0' + p.slice(3);
    else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
    return /^0(3|5|7|8|9)\d{8}$/.test(p) ? p : '';
  },
  maskPhone: function(phone) {
    const p = String(phone || '');
    return p.length >= 6 ? `${p.slice(0, 3)}•••${p.slice(-3)}` : p;
  },
  maskAccount: function(acc) {
    const a = String(acc || '');
    return a.length >= 7 ? `${a.slice(0, 4)}•••${a.slice(-3)}` : a;
  },
  maskCccd: function(id) {
    const a = String(id || '');
    return a.length >= 8 ? `${a.slice(0, 4)}••••${a.slice(-2)}` : a;
  },
  initials: function(fullName) {
    const parts = String(fullName || '').trim().split(/\s+/);
    return (parts[parts.length - 1] || '?').charAt(0).toUpperCase();
  },

  /** Link giới thiệu /r/{mã} — tuyệt đối theo brand.baseUrl. */
  referralUrl: function(code) {
    return `${CONFIG.brand.baseUrl}/#r/${code}`; // prototype dùng hash router; bản thật là /r/{mã}
  },
  /** Link nội bộ của prototype mở được ngay (hash router). */
  referralHash: function(code) {
    return `#r/${code}`;
  },

  /** Hạn giữ đơn từ thời điểm tạo. */
  orderExpiry: function(createdIso) {
    return new Date(new Date(createdIso).getTime() + CONFIG.order.holdSeconds * 1000).toISOString();
  },

  /** BR-03: SĐT được xem là "đã sở hữu gói" khi có đơn PAID hoặc AWAITING_RECONCILE. */
  ownsPackage: function(orders, phone) {
    return orders.some(o => o.phone === phone && (o.status === 'PAID' || o.status === 'AWAITING_RECONCILE'));
  },

  /** Nhãn tầng: F1, F2… */
  tierLabel: function(tier) { return 'F' + tier; },

  /** Tổng tỉ lệ chi ra của một chính sách. */
  totalRate: function(policy) {
    return (policy.tiers || []).reduce((s, t) => s + Number(t.rate || 0), 0);
  },

  /** Ngày hoa hồng khả dụng = ngày ghi nhận + holding period của chính sách. */
  availableAt: function(createdIso, policy) {
    return new Date(new Date(createdIso).getTime() + (policy.holdingDays || 0) * 86400000).toISOString();
  },

  /** Kiểm tra số tiền rút. */
  validateWithdrawal: function(amount, available, policy) {
    const amt = Number(amount) || 0;
    const min = policy.minWithdraw || 0;
    if (amt <= 0) return { ok: false, message: 'Vui lòng nhập số tiền muốn rút.' };
    if (amt < min) return { ok: false, message: `Số tiền rút tối thiểu là ${RULES.formatMoney(min)}.` };
    if (amt > available) return { ok: false, message: `Vượt quá số dư khả dụng (${RULES.formatMoney(available)}).` };
    return { ok: true, message: '' };
  },

  /** Tỷ lệ chuyển đổi = đơn paid / click. */
  conversion: function(paid, clicks) {
    return clicks > 0 ? paid / clicks : 0;
  },

  shippingLabel: function(step) { return (LABELS.shipping[step] || LABELS.shipping.NONE).text; },
  nextShippingStep: function(step) {
    const i = CONFIG.shippingSteps.indexOf(step);
    return i >= 0 && i < CONFIG.shippingSteps.length - 1 ? CONFIG.shippingSteps[i + 1] : null;
  },

  /** Số tiền hoa hồng làm tròn về đồng. */
  commissionAmount: function(price, rate) {
    return Math.round(price * rate);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, LABELS, RULES };
}
