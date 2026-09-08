/**
 * HOMI365 prototype v2 — cấu hình & quy tắc nghiệp vụ (CHANGE SPEC v3, 05/09/2026)
 *
 * QUY ƯỚC: file này chỉ chứa SỐ GỐC và HÀM SUY DIỄN. Giao diện không viết số cứng.
 * Mô hình: thành viên (agent) 6 hạng Copper → Lithium; hoa hồng CHÊNH LỆCH CẤP BẬC (VNĐ/gói)
 * ghi nhận ngay khi đơn PAID; đăng ký thành viên & rút tiền duyệt 2 lớp; admin 2 vai.
 * Các điểm chờ xác nhận (spec mục 9) đặt tại CONFIG với ghi chú [cần xác nhận].
 */

const CONFIG = {
  brand: {
    name: 'HOMI365',
    productLine: 'Medigo',
    publicDomain: 'Homi365.com.vn',
    supportHotline: '1900 6868',
    supportHours: '08:00 – 20:00 hằng ngày',
    company: 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ HUY GIÁP',
    baseUrl: 'https://homi-dev-ui.netlify.app'   // bản deploy demo; khi lên tên miền thật đổi thành https://homi365.com.vn và bỏ '#' trong referralUrl/purchaseUrl
  },
  terminology: { agent: 'Thành viên', agentShort: 'Agent', agents: 'Thành viên' },

  defaultPackageId: 'CN02',

  /** OTP (7.2.3: hiệu lực 5', sai 3 lần → khoá tạm) */
  otp: { length: 6, ttlSeconds: 300, maxWrong: 3, resendSeconds: 60, maxSendsPerWindow: 5, windowMinutes: 30, lockMinutes: 30, mockCode: '123456' },

  /** Giữ đơn / QR (LP-4/5) */
  order: { holdSeconds: 900, warnSeconds: 60, reconcilePollSeconds: 10, idPrefix: 'HM' },

  session: { refDays: 7, agentHours: 24, rememberDays: 30 },

  /** Hạng thành viên — threshold = TỔNG gói bán luỹ kế để ĐẠT hạng. Sheet: 10, +8, +6, +4, +2 [cần xác nhận] */
  ranks: [
    { id: 'COPPER',   label: 'Copper',   threshold: 0,  canRecruit: false, tone: 'neutral' },
    { id: 'SILVER',   label: 'Silver',   threshold: 10, canRecruit: true,  tone: 'info' },
    { id: 'GOLD',     label: 'Gold',     threshold: 18, canRecruit: true,  tone: 'warning' },
    { id: 'DIAMOND',  label: 'Diamond',  threshold: 24, canRecruit: true,  tone: 'navy' },
    { id: 'TITANIUM', label: 'Titanium', threshold: 28, canRecruit: true,  tone: 'navy' },
    { id: 'LITHIUM',  label: 'Lithium',  threshold: 30, canRecruit: true,  tone: 'success' }
  ],
  /** Quy tắc hạng: bán < 1 gói/tháng → giáng 1 bậc (không dưới Copper). Giáng KHÔNG reset luỹ kế [cần xác nhận] */
  rankRules: { minSalesPerMonth: 1, demoteSteps: 1, demoteResetsCumulative: false, jobTime: '0h ngày cuối tháng' },
  /** Điểm = hoa hồng đã ghi nhận, 1 điểm = 1 VNĐ [cần xác nhận: ×10? redeem?] */
  points: { perVnd: 1 },
  /** Rút tiền: 1 lần/tháng, không ngưỡng tối thiểu, không holding, chi trả tay đầu tháng sau */
  withdraw: { maxPerMonth: 1, payoutNote: 'Chi trả đầu tháng kế tiếp', minAmount: 0, holdingDays: 0, requireOtp: false },
  /** Duyệt 2 lớp (đăng ký thành viên & rút tiền) */
  approval: { requiredConfirms: 2, headCanFinalizeAlone: true, sameUserTwice: false, creatorCannotApprove: true },

  admin: {
    maxLoginFail: 5, lockMinutes: 15, pageSize: 10,
    roles: { SPECIALIST: 'Admin Specialist', HEAD: 'Head Admin' },
    /** Tài khoản demo khởi tạo (bản thật: Head Admin cấp tại admin-users) */
    accounts: [
      { username: 'head',   password: 'Homi@2026', role: 'HEAD',       fullName: 'Trưởng bộ phận' },
      { username: 'admin',  password: 'Homi@2026', role: 'SPECIALIST', fullName: 'Chuyên viên 1' },
      { username: 'admin2', password: 'Homi@2026', role: 'SPECIALIST', fullName: 'Chuyên viên 2' }
    ]
  },

  /** Quy tắc tuỳ chọn ngoài requirement — mặc định TẮT [cần xác nhận] */
  rules: { onePackagePerPhone: false, rejectedCanResubmit: true, copperLinkBuyerCanRegisterLater: true },

  /** Điều khoản & điều kiện (7.2.6) */
  tc: {
    version: '1.0', updatedAt: '2026-09-04',
    text: 'ĐIỀU KHOẢN & ĐIỀU KIỆN THÀNH VIÊN HOMI365 (bản nháp — nội dung chính thức chờ khách cung cấp)\n\n1. Thành viên là cá nhân đã mua gói sản phẩm HOMI365 và được người giới thiệu đủ điều kiện mời tham gia.\n2. Hoa hồng được tính theo chênh lệch cấp bậc giữa các hạng, ghi nhận khi đơn hàng thanh toán thành công.\n3. Hạng thành viên được xét vào cuối mỗi tháng theo tổng số gói bán luỹ kế; không bán được gói nào trong tháng sẽ bị giáng một bậc.\n4. Thành viên được rút hoa hồng tối đa một lần mỗi tháng; công ty chi trả vào đầu tháng kế tiếp sau khi duyệt.\n5. Thành viên cam kết không quảng cáo sai sự thật, không spam link giới thiệu; vi phạm sẽ bị khoá tài khoản.\n6. Thông tin cá nhân được bảo mật theo chính sách của công ty.'
  },
  email: { from: 'admin@homi365.com.vn' },

  vietqr: { bankName: 'Vietcombank', bankShort: 'VCB', accountNo: '0108294845', accountName: 'CONG TY TNHH GIAI PHAP CONG NGHE HUY GIAP' },
  gateway: { label: 'Cổng thanh toán online', desc: 'Thẻ ATM nội địa, thẻ quốc tế, ví điện tử. Chuyển hướng sang cổng; kết quả cập nhật qua callback của cổng thanh toán.' },

  /** Kho mã kích hoạt & thiết bị (7.8) */
  stock: { lowThreshold: 50, codePrefix: 'HOMI', deviceSku: 'HW01', seedCount: 1200 },

  shippingSteps: ['PENDING', 'PACKING', 'SHIPPING', 'DELIVERED'],
  periods: [{ id: 'week', label: '7 ngày' }, { id: 'month', label: '30 ngày' }, { id: 'quarter', label: '90 ngày' }, { id: 'custom', label: 'Tuỳ chọn' }],
  defaultPeriod: 'month',

  /** Nội dung giới thiệu sản phẩm (cột phải buy). */
  productContent: {
    CN02: {
      lead: 'Gói dịch vụ cao cấp bao gồm 01 đồng hồ thông minh HW01 theo dõi nhịp tim / SOS giao tận nơi và 01 năm phần mềm Bác sĩ 24/7 (mã kích hoạt gửi qua SMS).',
      intro: 'Gói Bác sĩ 24/7 hỗ trợ, tư vấn sức khoẻ (ký hiệu CN02) cung cấp các tính năng nâng cao của nền tảng HOMI365. Ngoài việc tự theo dõi sức khoẻ cá nhân, người dùng được Trợ lý sức khoẻ theo dõi 24/7, được tư vấn trực tuyến từ đội ngũ bác sĩ, và khi có tình huống bất thường khẩn cấp hệ thống tự động gọi tới người thân kèm vị trí của người dùng để hỗ trợ kịp thời.',
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
    navigator: false,          // bảng điều hướng demo (F9) — bản gửi KH tắt
    seedNewAgent: true,        // agent vừa được duyệt: sinh sẵn click/đơn mẫu để dashboard không trống
    smsErrorPhone: '0911111111',
    adminPhone: '0900000000',
    agentPassword: 'Homi@123',
    reconcileAutoSeconds: 0
  }
};

/* ------------------------------------------------------------------ */
/* Nhãn & phân loại trạng thái (badge luôn có chữ)                     */
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
    NONE: { text: 'Chưa giao', tone: 'neutral' }, PENDING: { text: 'Chờ xử lý', tone: 'warning' }, PACKING: { text: 'Đang đóng gói', tone: 'info' },
    SHIPPING: { text: 'Đang giao', tone: 'info' }, DELIVERED: { text: 'Đã giao', tone: 'success' }
  },
  license: {
    IN_STOCK:  { text: 'Sẵn hàng',          tone: 'neutral' },
    ASSIGNED:  { text: 'Đã gắn đơn hàng',   tone: 'info' },
    ACTIVATED: { text: 'Đã kích hoạt',      tone: 'success' },
    PENDING:   { text: 'Chờ cấp',           tone: 'warning' }
  },
  approval: {
    PENDING_0: { text: 'Chờ duyệt (0/2)', tone: 'warning' },
    PENDING_1: { text: 'Chờ duyệt (1/2)', tone: 'info' },
    APPROVED:  { text: 'Đã duyệt',        tone: 'success' },
    REJECTED:  { text: 'Từ chối',         tone: 'error' }
  },
  withdrawal: {
    PENDING_0: { text: 'Chờ duyệt (0/2)',        tone: 'warning' },
    PENDING_1: { text: 'Chờ duyệt (1/2)',        tone: 'info' },
    APPROVED:  { text: 'Đã duyệt – chờ chi trả', tone: 'navy' },
    PAID:      { text: 'Đã chi trả',             tone: 'success' },
    REJECTED:  { text: 'Từ chối',                tone: 'error' }
  },
  commission: {
    RECORDED:  { text: 'Đã ghi nhận', tone: 'success' },
    CANCELLED: { text: 'Đã huỷ',      tone: 'error' }
  },
  commissionKind: {
    SELF:    { text: 'Tự bán',               tone: 'navy' },
    DIFF:    { text: 'Chênh lệch tuyến dưới', tone: 'info' },
    COMPANY: { text: 'Về công ty',           tone: 'neutral' }
  },
  rankEvent: {
    INIT: { text: 'Khởi tạo', tone: 'neutral' }, PROMOTE: { text: 'Thăng hạng', tone: 'success' },
    DEMOTE: { text: 'Giáng hạng', tone: 'error' }, ASSIGN: { text: 'Chỉ định', tone: 'navy' }
  },
  user: { active: { text: 'Đang hoạt động', tone: 'success' }, locked: { text: 'Đã khoá', tone: 'error' } },
  userType: { buyer: { text: 'Người mua (chưa TV)', tone: 'neutral' }, agent: { text: 'Thành viên', tone: 'navy' } },
  adminStatus: { active: { text: 'Đang hoạt động', tone: 'success' }, disabled: { text: 'Vô hiệu', tone: 'error' } },
  role: { HEAD: { text: 'Head Admin', tone: 'navy' }, SPECIALIST: { text: 'Admin Specialist', tone: 'info' } },
  method: { gateway: 'Cổng online', bank: 'Chuyển khoản VietQR', exception: 'Cấp ngoại lệ' },
  ledger: {
    COMMISSION_RECORDED: 'Hoa hồng ghi nhận', COMMISSION_CANCELLED: 'Huỷ hoa hồng (đơn hoàn tiền)',
    WITHDRAW_HOLD: 'Tạo yêu cầu rút tiền', WITHDRAW_PAID: 'Đã chi trả rút tiền', WITHDRAW_REJECTED: 'Hoàn lại (rút tiền bị từ chối)'
  }
};
// LABELS.rank sinh từ CONFIG.ranks để chỉ có một nguồn
LABELS.rank = {};
CONFIG.ranks.forEach(r => { LABELS.rank[r.id] = { text: r.label, tone: r.tone }; });

/* ------------------------------------------------------------------ */
/* Hàm suy diễn                                                         */
/* ------------------------------------------------------------------ */
const RULES = {
  now: function() { return new Date(); },
  formatMoney: function(num) { const n = Math.round(Number(num) || 0); return (n < 0 ? '-' : '') + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ'; },
  formatNumber: function(num) { return Math.round(Number(num) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
  formatPercent: function(rate, digits) { const d = digits === undefined ? 0 : digits; return (Number(rate || 0) * 100).toFixed(d).replace('.', ',') + '%'; },
  formatDate: function(iso) { if (!iso) return ''; const d = new Date(iso); const p = (v) => String(v).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`; },
  formatDateTime: function(iso) { if (!iso) return ''; const d = new Date(iso); const p = (v) => String(v).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`; },
  formatMonth: function(iso) { const d = new Date(iso); return String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); },
  formatDuration: function(seconds) { const s = Math.max(0, Math.floor(seconds)); const p = (v) => String(v).padStart(2, '0'); return `${p(Math.floor(s / 60))}:${p(s % 60)}`; },

  normalizePhone: function(raw) {
    let p = String(raw || '').replace(/[^\d+]/g, '');
    if (p.startsWith('+84')) p = '0' + p.slice(3); else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
    return /^0(3|5|7|8|9)\d{8}$/.test(p) ? p : '';
  },
  isEmail: function(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim()); },
  maskPhone: function(phone) { const p = String(phone || ''); return p.length >= 6 ? `${p.slice(0, 3)}•••${p.slice(-3)}` : p; },
  maskAccount: function(acc) { const a = String(acc || ''); return a.length >= 7 ? `${a.slice(0, 4)}•••${a.slice(-3)}` : a; },
  maskEmail: function(e) { const s = String(e || ''); const i = s.indexOf('@'); return i > 2 ? s.slice(0, 2) + '•••' + s.slice(i) : s; },
  initials: function(fullName) { const parts = String(fullName || '').trim().split(/\s+/); return (parts[parts.length - 1] || '?').charAt(0).toUpperCase(); },

  /** Bỏ dấu tiếng Việt (8.1.C-4). */
  deaccent: function(str) {
    return String(str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  },
  /** Alias link mua hàng cá nhân [EEEE][PPPP]: chữ cái đầu mỗi từ của họ tên (bỏ dấu, in hoa) + 4 số cuối SĐT. 'Hoàng Thị Mỹ Trinh','0937630083' → 'HTMT0083'. */
  purchaseAlias: function(fullName, phone) {
    const initials = this.deaccent(fullName).trim().split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase()).join('').replace(/[^A-Z]/g, '');
    return (initials || 'TV') + String(phone || '').slice(-4);
  },
  referralUrl: function(code) { return `${CONFIG.brand.baseUrl}/#r/${code}`; },
  referralHash: function(code) { return `#r/${code}`; },
  purchaseUrl: function(alias) { return `${CONFIG.brand.baseUrl}/#p/${alias}`; },
  purchaseHash: function(alias) { return `#p/${alias}`; },
  publicPurchaseUrl: function(alias) { return `${CONFIG.brand.publicDomain}/${alias}`; },

  orderExpiry: function(createdIso) { return new Date(new Date(createdIso).getTime() + CONFIG.order.holdSeconds * 1000).toISOString(); },
  ownsPackage: function(orders, phone) { return orders.some(o => o.phone === phone && (o.status === 'PAID' || o.status === 'AWAITING_RECONCILE')); },

  // ----- Hạng -----
  rankIndex: function(id) { return Math.max(0, CONFIG.ranks.findIndex(r => r.id === id)); },
  rank: function(id) { return CONFIG.ranks.find(r => r.id === id) || CONFIG.ranks[0]; },
  nextRank: function(id) { const i = this.rankIndex(id); return CONFIG.ranks[i + 1] || null; },
  prevRank: function(id) { const i = this.rankIndex(id); return CONFIG.ranks[Math.max(0, i - 1)]; },
  rankByCumulativeSales: function(n) { let best = CONFIG.ranks[0]; CONFIG.ranks.forEach(r => { if (n >= r.threshold) best = r; }); return best; },
  salesToNextRank: function(cum, rankId) { const nx = this.nextRank(rankId); return nx ? Math.max(0, nx.threshold - cum) : 0; },
  canRecruit: function(rankId) { return !!this.rank(rankId).canRecruit; },
  topRank: function() { return CONFIG.ranks[CONFIG.ranks.length - 1]; },
  pointsOf: function(vnd) { return Math.round((Number(vnd) || 0) * CONFIG.points.perVnd); },
  inSameMonth: function(a, b) { const x = new Date(a), y = new Date(b || Date.now()); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth(); },
  monthStart: function(iso) { const d = new Date(iso || Date.now()); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString(); },

  /** Tổng hoa hồng một đơn theo bảng hạng = mức Lithium. */
  commissionTotal: function(byRank) { return Number(byRank[this.topRank().id] || 0); },
  /** Bảng hoa hồng phải tăng đơn điệu theo hạng. */
  validateCommissionTable: function(byRank) {
    let prev = -1;
    for (const r of CONFIG.ranks) { const v = Number(byRank[r.id]); if (!(v >= 0)) return { ok: false, message: 'Thiếu mức hoa hồng cho hạng ' + r.label + '.' }; if (v < prev) return { ok: false, message: 'Mức hoa hồng hạng ' + r.label + ' phải ≥ hạng thấp hơn.' }; prev = v; }
    return { ok: true };
  },

  validateWithdrawal: function(amount, available) {
    const amt = Number(amount) || 0;
    if (amt <= 0) return { ok: false, message: 'Vui lòng nhập số tiền muốn rút.' };
    if (CONFIG.withdraw.minAmount && amt < CONFIG.withdraw.minAmount) return { ok: false, message: `Số tiền rút tối thiểu là ${this.formatMoney(CONFIG.withdraw.minAmount)}.` };
    if (amt > available) return { ok: false, message: `Vượt quá số dư khả dụng (${this.formatMoney(available)}).` };
    return { ok: true, message: '' };
  },
  validatePassword: function(pw) { const s = String(pw || ''); if (s.length < 8) return 'Mật khẩu tối thiểu 8 ký tự.'; if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return 'Mật khẩu cần có cả chữ và số.'; return ''; },

  conversion: function(paid, clicks) { return clicks > 0 ? paid / clicks : 0; },
  shippingLabel: function(step) { return (LABELS.shipping[step] || LABELS.shipping.NONE).text; },
  nextShippingStep: function(step) { const i = CONFIG.shippingSteps.indexOf(step); return i >= 0 && i < CONFIG.shippingSteps.length - 1 ? CONFIG.shippingSteps[i + 1] : null; }
};

if (typeof module !== 'undefined' && module.exports) { module.exports = { CONFIG, LABELS, RULES }; }
