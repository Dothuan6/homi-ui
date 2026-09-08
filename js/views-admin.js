/**
 * Nhóm D · Quản trị (spec v3) — admin-login đăng nhập · admin-dashboard tổng quan · agents thành viên · orders đơn & đối soát ·
 * products sản phẩm & bảng hoa hồng · inventory kho mã & thiết bị · ranks hạng & quy tắc · withdrawals rút tiền & sổ hoa hồng ·
 * exceptions ngoại lệ (ẩn) · registrations duyệt đăng ký · admin-users tài khoản admin (Head)
 *
 * Markup nằm trong screens/d-*.html (render bằng TPL); file này chỉ giữ state, lọc/sắp xếp/phân trang,
 * view-model, gọi Store và các hàm UI (confirm/modal/drawer/toast).
 */
const Admin = {
  st: { period: 'month', users: { q: '', type: '', rank: '', status: '', page: 1 }, orders: { tab: 'all', q: '', status: '', page: 1 }, codes: { q: '', status: '', page: 1 }, d07: { tab: 'withdraw', wdStatus: '', wdPage: 1, cmQ: '', cmPage: 1 }, regs: { status: '', q: '', page: 1 } },
  me: function() { return Store.currentAdmin(); },
  isHead: function() { return Store.isHead(); },
  periodDays: function() { return { week: 7, month: 30, quarter: 90 }[this.st.period] || 30; },
  /** Render một template nhiều phần (title/body/foot) thành object để đưa thẳng vào UI.drawer / UI.modal. */
  parts: function(name, data, keys) { const o = {}; (keys || ['title', 'body', 'foot']).forEach(part => { o[part] = TPL.render(name, Object.assign({}, data, { part })); }); return o; },
  approvalCell: function(e) {
    const approvals = (e.approvals || []).filter(a => a.action === 'APPROVE'); const rejection = (e.approvals || []).find(a => a.action === 'REJECT') || null;
    // Rút tiền vẫn đếm lượt 0/2; hồ sơ thành viên dùng nhãn 'Chờ kích hoạt' vì không còn đếm lượt.
    const kind = e.amount !== undefined ? 'withdrawal' : 'activation';
    return TPL.render('partials/admin-approval-cell', { e, kind, approvals, rejection });
  },
  canApproveBtn: function(e) { const me = this.me(); if (!e.status.startsWith('PENDING')) return { ok: false }; if ((e.approvals || []).some(a => a.by === me.username && a.action === 'APPROVE')) return { ok: false, why: 'Bạn đã xác nhận' }; if (e.createdBy === me.username) return { ok: false, why: 'Người tạo hộ không tự duyệt' }; return { ok: true }; },
  timeline: function(e, extra) {
    const rows = [{ at: e.createdAt, text: 'Tạo' + (e.createdBy && e.createdBy !== 'agent' ? ' (tạo hộ bởi ' + e.createdBy + ')' : ' bởi thành viên') }]
      .concat((e.approvals || []).map(a => ({ at: a.at, text: (a.action === 'APPROVE' ? 'Xác nhận' : 'Từ chối') + ' — ' + a.by + ' (' + (LABELS.role[a.role] ? LABELS.role[a.role].text : a.role) + ')' + (a.reason ? ': ' + a.reason : '') })))
      .concat(extra || []);
    rows.sort((a, b) => (a.at || '') < (b.at || '') ? -1 : 1);
    return TPL.render('partials/admin-timeline', { rows });
  },
  auditList: function(entity, id) { return TPL.render('partials/admin-audit-list', { list: Store.auditOf(entity, id) }); },

  // =====================================================================
  // admin-login · Đăng nhập quản trị
  // =====================================================================
  D00: function(q) {
    if (Store.currentAdmin()) { App.navigate(q.get('next') ? decodeURIComponent(q.get('next')) : 'admin-dashboard', { replace: true }); return ''; }
    this._next = q.get('next') ? decodeURIComponent(q.get('next')) : 'admin-dashboard';
    return TPL.render('admin/login', {});
  },
  login: function(e) { e.preventDefault(); const user = UI.val('ad-user'), pass = UI.val('ad-pass'); const box = document.getElementById('ad-alert'); UI.setError('ad-user', ''); UI.setError('ad-pass', ''); box.hidden = true; let ok = true; if (!user) { UI.setError('ad-user', 'Nhập tên đăng nhập.'); ok = false; } if (!pass) { UI.setError('ad-pass', 'Nhập mật khẩu.'); ok = false; } if (!ok) { UI.focusFirstError(); return; } const btn = document.getElementById('ad-submit'); UI.setLoading(btn, true); setTimeout(() => { UI.setLoading(btn, false); const r = Store.adminLogin(user, pass); if (r.ok) { App.navigate(this._next || 'admin-dashboard'); return; } box.hidden = false; box.innerHTML = TPL.render('admin/login-alert', { r }); }, 400); },

  // =====================================================================
  // admin-dashboard · Tổng quan
  // =====================================================================
  D01: function() {
    const days = this.periodDays(); const s = Store.adminStats(days); const series = Store.adminSeries(days).map(x => ({ label: UI.dayLabel(x.date), bar: x.revenue / 1000000 }));
    const todo = [
      { count: s.regPending, title: 'Hồ sơ đăng ký thành viên chờ duyệt', sub: 'Duyệt 2 lớp: Specialist ×2 hoặc Head Admin', href: 'registrations' },
      { count: s.withdrawPending, title: 'Yêu cầu rút tiền chờ duyệt', sub: 'Đối chiếu số dư rồi xác nhận / từ chối', href: 'withdrawals?tab=withdraw' },
      { count: s.withdrawApproved, title: 'Rút tiền đã duyệt, chờ chi trả', sub: 'Xuất file ngân hàng, đánh dấu đã chi trả', href: 'withdrawals?tab=withdraw' },
      { count: s.awaiting, title: 'Đơn chuyển khoản chờ đối soát', sub: 'Xác nhận để cấp mã và ghi hoa hồng', href: 'orders?tab=awaiting' },
      { count: s.lateCallbacks, title: 'Callback cổng đến sau khi đơn hết hạn', sub: 'Cần kiểm tra thủ công', href: 'orders?tab=late' },
      { count: s.licensePending, title: 'Đơn đã thanh toán chưa có mã', sub: 'Kho hết — bổ sung mã', href: 'inventory' },
      { count: s.stock <= CONFIG.stock.lowThreshold ? 1 : 0, title: 'Kho mã sắp cạn', sub: `Còn ${s.stock} mã, ngưỡng ${CONFIG.stock.lowThreshold}`, href: 'inventory' }
    ].filter(t => t.count > 0);
    const html = TPL.render('admin/dashboard', { days, s, series, todo, head: this.isHead(), rules: Store.rules(), totalAgents: Store.agents().length, period: this.st.period, periods: CONFIG.periods.filter(p => p.id !== 'custom') });
    return App.adminShell('admin-dashboard', 'Tổng quan', html);
  },
  runJob: function() { UI.confirm({ title: 'Chạy job xét hạng cuối tháng?', body: 'Mô phỏng job chạy 0h ngày cuối tháng: thành viên bán < 1 gói bị giáng 1 bậc, thành viên đủ luỹ kế được thăng hạng. Kết quả ghi vào lịch sử hạng.', confirmText: 'Chạy ngay', onConfirm: () => { const r = Store.runMonthEndJob(this.me()); UI.modal(Object.assign({ title: 'Kết quả xét hạng' }, this.parts('admin/dashboard-job-result', { r }, ['body', 'foot']))); } }); },

  // =====================================================================
  // agents · Thành viên
  // =====================================================================
  D02: function() {
    const html = TPL.render('admin/agents', { f: this.st.users });
    App.after(() => UI.withLoading('u-table', UI.skeletonTable(9, 6), () => this.renderUsers()));
    return App.adminShell('agents', 'Thành viên', html, { actions: this.isHead() ? TPL.render('partials/admin-actions', { screen: 'agents' }) : '' });
  },
  filteredUsers: function() { const f = this.st.users; const q = f.q.toLowerCase(); return Store.users().filter(u => (!f.type || u.type === f.type) && (!f.rank || u.rank === f.rank) && (!f.status || u.status === f.status) && (!q || u.fullName.toLowerCase().includes(q) || u.phone.includes(q) || (u.refCode || '').toLowerCase().includes(q) || (u.purchaseAlias || '').toLowerCase().includes(q))).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderUsers: function() {
    const el = document.getElementById('u-table'); if (!el) return; const list = this.filteredUsers(); const pg = UI.paginate(list, this.st.users.page);
    const rows = pg.rows.map(u => ({ u, ref: u.referrerId ? Store.user(u.referrerId) : null, sold: Store.ordersBySeller(u.id).filter(o => o.status === 'PAID').length, downline: Store.downline(u.id).filter(x => x.type === 'agent').length }));
    el.innerHTML = TPL.render('admin/agents-table', { rows, pg });
  },
  gotoUsers: function(p) { this.st.users.page = p; this.renderUsers(); },
  exportUsers: function() { UI.exportCsv('thanh-vien.csv', ['Họ tên', 'SĐT', 'Email', 'Loại', 'ref_code', 'Link cá nhân', 'Tuyến trên', 'Hạng', 'Luỹ kế', 'Đơn đã bán', 'Tuyến dưới', 'Trạng thái', 'Tham gia'], this.filteredUsers().map(u => [u.fullName, u.phone, u.email || '', LABELS.userType[u.type].text, u.refCode || '', u.purchaseAlias || '', u.referrerId ? Store.user(u.referrerId).refCode : '', u.rank ? RULES.rank(u.rank).label : '', u.cumulativeSales || 0, Store.ordersBySeller(u.id).filter(o => o.status === 'PAID').length, Store.downline(u.id).length, LABELS.user[u.status].text, UI.date(u.createdAt)])); },
  /** Gắn số đơn đã bán vào từng nút cây tuyến dưới (đệ quy) để template chỉ hiển thị. */
  treeNodes: function(nodes) { return nodes.map(n => ({ user: n.user, sold: Store.ordersBySeller(n.user.id).filter(o => o.status === 'PAID').length, children: this.treeNodes(n.children || []) })); },
  treeHtml: function(nodes) { return nodes.length ? TPL.render('partials/admin-tree', { nodes: this.treeNodes(nodes) }) : ''; },
  userDrawer: function(id) {
    const u = Store.user(id); const chain = u.referrerId ? Store.uplineChain(u.referrerId, 99) : []; const tree = Store.downlineTree(id, 3); const bought = Store.ordersByPhone(u.phone); const sold = Store.ordersBySeller(id); const w = Store.wallet(id); const cms = Store.commissionsOf(id).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); const head = this.isHead();
    UI.drawer(this.parts('admin/agents-drawer', {
      u, head, chain, w, bought, sold, cms,
      tree: this.treeNodes(tree),
      salesThisMonth: Store.salesThisMonth(id),
      rankHistory: (u.rankHistory || []).slice().reverse(),
      boughtPaid: bought.filter(o => o.status === 'PAID').length,
      soldPaid: sold.filter(o => o.status === 'PAID').length,
      soldRecent: sold.slice(0, 6),
      cmsRecent: cms.slice(0, 8).map(c => Object.assign({ source: Seller.sourceLabel(c) }, c)),
      audit: Store.auditOf('user', id),
      logs: Store.logOf(id).slice(0, 8)
    }));
  },
  lockUser: function(id) { const u = Store.user(id); UI.confirm({ title: 'Khoá tài khoản?', body: `<strong>${UI.esc(u.fullName)}</strong> sẽ không đăng nhập được; link giới thiệu và link cá nhân ngừng nhận đơn. Hoa hồng đã ghi nhận không bị ảnh hưởng.`, reason: 'Lý do khoá', confirmText: 'Khoá', tone: 'danger', onConfirm: (reason) => { Store.setUserStatus(id, 'locked', reason, this.me()); UI.toast('Đã khoá.'); this.renderUsers(); this.userDrawer(id); } }); },
  unlockUser: function(id) { const u = Store.user(id); UI.confirm({ title: 'Mở khoá?', body: `<strong>${UI.esc(u.fullName)}</strong> đăng nhập và nhận đơn trở lại.`, confirmText: 'Mở khoá', onConfirm: () => { Store.setUserStatus(id, 'active', '', this.me()); UI.toast('Đã mở khoá.'); this.renderUsers(); this.userDrawer(id); } }); },
  changeReferrerModal: function(id) { const u = Store.user(id); const cur = u.referrerId ? Store.user(u.referrerId) : null; UI.modal(Object.assign({ title: 'Đổi người giới thiệu (Head Admin)', sticky: true }, this.parts('admin/agents-modal-referrer', { u, cur }, ['body', 'foot']))); },
  changeReferrer: function(id) { const code = UI.val('cr-code').toUpperCase(), reason = UI.val('cr-reason'); const ref = Store.sellerByRef(code); UI.setError('cr-code', ''); UI.setError('cr-reason', ''); if (!ref) { UI.setError('cr-code', 'Không tìm thấy thành viên với mã này.'); return; } if (ref.id === id) { UI.setError('cr-code', 'Không thể tự giới thiệu chính mình.'); return; } if (!reason) { UI.setError('cr-reason', 'Nhập lý do.'); return; } const r = Store.changeReferrer(id, code, reason, this.me()); if (!r.ok) { UI.setError('cr-code', r.message || 'Không hợp lệ.'); return; } UI.closeModal(); UI.toast('Đã đổi người giới thiệu.'); this.renderUsers(); this.userDrawer(id); },
  assignRankModal: function(id) { const u = Store.user(id); UI.modal(Object.assign({ title: 'Chỉ định hạng (Head Admin)', sticky: true }, this.parts('admin/agents-modal-rank', { u }, ['body', 'foot']))); },
  assignRank: function(id) { const rank = UI.val('ar-rank'), reason = UI.val('ar-reason'); UI.setError('ar-reason', ''); if (!reason) { UI.setError('ar-reason', 'Nhập lý do.'); return; } Store.assignRank(id, rank, this.me(), reason); UI.closeModal(); UI.toast('Đã chỉ định hạng ' + RULES.rank(rank).label + '.'); this.renderUsers(); this.userDrawer(id); },
  rootAgentModal: function() { UI.modal(Object.assign({ title: 'Tạo thành viên gốc (Head Admin)', size: 'lg', sticky: true }, this.parts('admin/agents-modal-root', {}, ['body', 'foot']))); },
  createRootAgent: function() {
    const name = UI.val('ra-name'), phone = RULES.normalizePhone(UI.val('ra-phone')), email = UI.val('ra-email'), refCode = UI.val('ra-ref').toUpperCase(), reason = UI.val('ra-reason'), pw = UI.val('ra-pw');
    ['ra-name', 'ra-phone', 'ra-email', 'ra-ref', 'ra-reason', 'ra-pw'].forEach(x => UI.setError(x, '')); let ok = true;
    if (name.length < 2) { UI.setError('ra-name', 'Nhập họ tên.'); ok = false; } if (!phone) { UI.setError('ra-phone', 'SĐT không hợp lệ.'); ok = false; } if (!RULES.isEmail(email)) { UI.setError('ra-email', 'Email không hợp lệ.'); ok = false; } if (refCode && !Store.sellerByRef(refCode)) { UI.setError('ra-ref', 'Không tìm thấy ref_code.'); ok = false; } if (!reason) { UI.setError('ra-reason', 'Nhập lý do.'); ok = false; } const pe = RULES.validatePassword(pw); if (pe) { UI.setError('ra-pw', pe); ok = false; } if (!ok) return;
    const r = Store.createRootAgent({ fullName: name, phone, email, rank: UI.val('ra-rank'), bank: { bankName: UI.val('ra-bank'), accountNo: UI.val('ra-acc'), owner: UI.val('ra-owner').toUpperCase() }, referrerId: refCode ? Store.sellerByRef(refCode).id : null, password: pw, reason }, this.me());
    if (!r.ok) { UI.setError('ra-phone', r.message); return; } UI.closeModal(); UI.toast('Đã tạo thành viên ' + r.user.fullName + ' · ref_code ' + r.user.refCode + ' · alias ' + r.user.purchaseAlias); this.renderUsers(); this.userDrawer(r.user.id);
  },

  // =====================================================================
  // orders · Đơn hàng & đối soát
  // =====================================================================
  D03: function(q) {
    if (q.get('tab')) { this.st.orders.tab = q.get('tab'); this.st.orders.page = 1; } const f = this.st.orders; const awaiting = Store.orders().filter(o => o.status === 'AWAITING_RECONCILE').length; const late = Store.orders().filter(o => o.flags && o.flags.lateCallback && !o.flags.lateChecked).length;
    const html = TPL.render('admin/orders', { f, awaiting, late });
    App.after(() => UI.withLoading('o-table', UI.skeletonTable(8, 6), () => this.renderOrders()));
    return App.adminShell('orders', 'Đơn hàng & đối soát', html);
  },
  filteredOrders: function() { const f = this.st.orders; const q = f.q.toLowerCase(); return Store.orders().filter(o => { if (f.tab === 'awaiting' && o.status !== 'AWAITING_RECONCILE') return false; if (f.tab === 'late' && !(o.flags && o.flags.lateCallback)) return false; if (f.tab === 'all' && f.status && o.status !== f.status) return false; return !q || o.id.toLowerCase().includes(q) || o.fullName.toLowerCase().includes(q) || o.phone.includes(q) || (o.refCode || '').toLowerCase().includes(q); }); },
  renderOrders: function() {
    const el = document.getElementById('o-table'); if (!el) return; const list = this.filteredOrders(); const pg = UI.paginate(list, this.st.orders.page);
    const rows = pg.rows.map(o => ({ o, s: o.sellerId ? Store.user(o.sellerId) : null, c: o.licenseCode ? Store.codeInfo(o.licenseCode) : null }));
    el.innerHTML = TPL.render('admin/orders-table', { rows, pg });
  },
  gotoOrders: function(p) { this.st.orders.page = p; this.renderOrders(); },
  exportOrders: function() { UI.exportCsv('don-hang.csv', ['Mã đơn', 'Ngày', 'Người mua', 'SĐT', 'Email', 'Người bán', 'Hạng lúc đơn', 'Phương thức', 'Số tiền', 'Thanh toán', 'Giao hàng', 'Mã KH'], this.filteredOrders().map(o => [o.id, UI.dt(o.createdAt), o.fullName, o.phone, o.email || '', o.refCode || '', o.referrerRankAtOrder || '', LABELS.method[o.method] || '', o.price, LABELS.orderStatus[o.status].text, RULES.shippingLabel(o.shipping), o.licenseCode || ''])); },
  /** Lớp 1 — Admin Specialist (hoặc Head) xác nhận tiền đã về bank. Manager không làm bước này. */
  canConfirmPayment: function() { return CONFIG.activation.confirmPaymentRoles.includes(this.me().role); },
  confirmReconcile: function(id) {
    if (!this.canConfirmPayment()) { UI.toast('Chỉ Admin Specialist hoặc Head Admin được xác nhận thanh toán.', 'error'); return; }
    const o = Store.order(id);
    const codes = Store.availableCodes(50);
    if (!codes.length) { UI.toast('Kho hết mã sẵn sàng — nhập thêm mã ở màn Kho mã & thiết bị trước khi xác nhận.', 'error'); return; }
    UI.modal({ title: 'Xác nhận thanh toán & cấp mã', size: 'lg', sticky: true,
      body: TPL.render('admin/orders-confirm', { o, codes, stock: Store.stockCount(), proof: o.transferProof || null,
        reg: Store.registrationByPhone(o.phone) || null, me: this.me() }),
      foot: TPL.render('admin/orders-confirm-foot', { o }) });
  },
  /** Xác nhận sau khi admin đã chọn mã trong modal. */
  confirmReconcileSubmit: function(id) {
    const sel = document.getElementById('rc-code'); const code = sel ? sel.value : '';
    const err = document.getElementById('rc-err');
    if (!code) { if (err) err.textContent = 'Chọn một mã kích hoạt để gán cho đơn.'; return; }
    const btn = document.getElementById('rc-submit'); UI.setLoading(btn, true);
    setTimeout(() => {
      const r = Store.confirmReconcile(id, this.me(), { code, activate: true });
      UI.closeModal();
      UI.toast(r.licenseCode ? 'Đã xác nhận. Mã ' + r.licenseCode + ' đã kích hoạt và gửi email cho khách.' : 'Đã xác nhận nhưng chưa gán được mã.', r.licenseCode ? 'success' : 'warning');
      App.reload();
    }, 500);
  },
  confirmReconcileLegacy: function(id) { const o = Store.order(id); UI.confirm({ title: 'Xác nhận đã nhận chuyển khoản', body: 'Đơn chuyển sang <strong>Đã thanh toán</strong>; hệ thống gắn mã kích hoạt và ghi nhận hoa hồng theo chuỗi tuyến ngay lập tức.', summary: [['Mã đơn', '<span class="mono">' + UI.esc(o.id) + '</span>'], ['Nội dung CK cần khớp', '<span class="mono">' + UI.esc(o.id) + '</span>'], ['Số tiền', UI.money(o.price)], ['Người mua', UI.esc(o.fullName) + ' · ' + UI.esc(o.phone)], ['Kho mã còn', Store.stockCount() + ' mã']], confirmText: 'Xác nhận đã nhận tiền', onConfirm: () => { const r = Store.confirmReconcile(id, this.me()); UI.toast(r.licenseCode ? 'Đã xác nhận. Mã ' + r.licenseCode + ' đã gắn cho đơn.' : 'Đã xác nhận. Kho hết mã — đơn chờ cấp mã.', r.licenseCode ? 'success' : 'warning'); App.reload(); } });
  },
  rejectReconcile: function(id) { const o = Store.order(id); UI.confirm({ title: 'Từ chối đối soát', body: `Đơn <span class="mono">${UI.esc(o.id)}</span> của ${UI.esc(o.fullName)} chuyển sang <strong>Bị từ chối</strong>.`, reason: 'Lý do từ chối', confirmText: 'Từ chối', tone: 'danger', onConfirm: (reason) => { Store.rejectReconcile(id, reason, this.me()); UI.toast('Đã từ chối đơn ' + id + '.', 'warning'); App.reload(); } }); },
  commissionAllocation: function(o) {
    const cms = Store.commissionsOfOrder(o.id);
    if (!cms.length) return TPL.render('admin/orders-allocation', { rows: [], total: 0, expected: 0, ok: true });
    const total = cms.reduce((s, c) => s + (c.status === 'RECORDED' ? c.amount : 0), 0); const rates = Store.commissionByRank(o.packageId, o.paidAt); const expected = RULES.commissionTotal(rates);
    const rows = cms.map(c => ({ c, level: c.kind === 'SELF' ? 'Người bán' : c.kind === 'COMPANY' ? 'Công ty' : 'F' + c.depth, who: c.beneficiaryId === 'COMPANY' ? '' : Store.user(c.beneficiaryId).fullName, rate: rates[c.rankAtCalc] || 0 }));
    return TPL.render('admin/orders-allocation', { rows, total, expected, ok: total === expected || !!o.refunded });
  },
  orderDrawer: function(id) {
    const o = Store.order(id); const s = o.sellerId ? Store.user(o.sellerId) : null; const code = o.licenseCode ? Store.codeInfo(o.licenseCode) : null; const pkg = Store.pkg(o.packageId);
    const tl = [[o.createdAt, 'Tạo đơn (PENDING_PAYMENT)' + (o.refCode ? ' qua link ' + o.refCode : '')]]; if (o.transferClaimedAt) tl.push([o.transferClaimedAt, 'Người mua gửi biên lai chuyển khoản' + (o.transferProof ? ' (' + o.transferProof.name + ')' : '') + ' → chờ đối soát']); if (o.failedAt) tl.push([o.failedAt, 'Cổng trả FAILED: ' + (o.failReason || '')]); if (o.paidAt) tl.push([o.paidAt, (o.method === 'bank' ? 'Admin xác nhận đối soát → ' : 'Callback cổng → ') + 'PAID' + (o.flags && o.flags.lateCallback ? ' (sau khi đơn hết hạn)' : '')]); if (o.reconciledAt && o.status === 'REJECTED') tl.push([o.reconciledAt, 'Admin từ chối: ' + o.rejectReason]); if (code && code.assignedAt) tl.push([code.assignedAt, 'Gắn mã ' + code.code + ' (' + code.deviceSerial + ')']); if (code && code.activatedAt) tl.push([code.activatedAt, 'Kích hoạt trên ' + (code.device ? code.device.name : 'thiết bị')]); (o.shippingLog || []).forEach(l => tl.push([l.at, 'Giao hàng: ' + RULES.shippingLabel(l.step)])); if (o.refundedAt) tl.push([o.refundedAt, 'Hoàn tiền — huỷ hoa hồng']); tl.sort((a, b) => a[0] < b[0] ? -1 : 1);
    const next = RULES.nextShippingStep(o.shipping);
    UI.drawer(this.parts('admin/orders-drawer', { o, s, code, pkg, next: next || null, allocation: this.commissionAllocation(o), timeline: tl.map(t => ({ at: t[0], text: t[1] })) }));
  },
  updateShipping: function(id, step) { Store.updateShipping(id, step); UI.toast('Đã cập nhật giao hàng: ' + RULES.shippingLabel(step)); this.renderOrders(); this.orderDrawer(id); },
  refundOrder: function(id) { const n = Store.commissionsOfOrder(id).filter(c => c.status === 'RECORDED').length; UI.confirm({ title: 'Hoàn tiền đơn hàng?', body: `Đơn <span class="mono">${UI.esc(id)}</span> được đánh dấu hoàn tiền; ${n} khoản hoa hồng đã ghi nhận sẽ bị huỷ và trừ khỏi ví các thành viên liên quan.`, reason: 'Lý do hoàn tiền', confirmText: 'Hoàn tiền', tone: 'danger', onConfirm: (reason) => { Store.refundOrder(id, reason, this.me()); UI.toast('Đã hoàn tiền, huỷ ' + n + ' khoản hoa hồng.', 'warning'); App.reload(); } }); },

  // =====================================================================
  // products · Sản phẩm & bảng hoa hồng 6 hạng
  // =====================================================================
  D04: function() {
    const list = Store.packages().map(p => ({ p, total: RULES.commissionTotal(p.commissionByRank || {}), versions: (p.commissionVersions || []).length, table: this.commissionTableVm(p) }));
    const html = TPL.render('admin/products', { list, top: RULES.topRank() });
    return App.adminShell('products', 'Sản phẩm & hoa hồng', html, { actions: TPL.render('partials/admin-actions', { screen: 'products' }) });
  },
  /** View-model bảng hoa hồng hiện hành + lịch sử phiên bản của một gói (template d-04-commission-table). */
  commissionTableVm: function(p) {
    const vs = (p.commissionVersions || []).slice().sort((a, b) => b.version - a.version); const cur = Store.commissionByRank(p.id); const now = Store.nowIso();
    const rows = CONFIG.ranks.map((r, i) => ({ r, amount: cur[r.id] || 0, diff: i ? (cur[r.id] || 0) - (cur[CONFIG.ranks[i - 1].id] || 0) : null }));
    const versions = vs.map((v, i) => {
      const prev = vs[i + 1];
      return { v, isCurrent: v.byRank === cur || (i === 0 && v.effectiveFrom <= now), state: v.effectiveFrom > now ? 'upcoming' : i === 0 ? 'current' : 'replaced',
        cells: CONFIG.ranks.map(r => ({ short: r.label.slice(0, 2), changed: !!(prev && prev.byRank[r.id] !== v.byRank[r.id]), prevK: prev ? UI.num(prev.byRank[r.id] / 1000) : '', curK: UI.num(v.byRank[r.id] / 1000) })) };
    });
    return { rows, versions };
  },
  commissionTableHtml: function(p) { return TPL.render('admin/products-commission-table', this.commissionTableVm(p)); },
  commissionTableModal: function(pid) { const p = Store.pkg(pid); const cur = Store.commissionByRank(pid); const rows = CONFIG.ranks.map((r, i) => ({ r, value: cur[r.id] || 0, diff: i ? (cur[r.id] || 0) - (cur[CONFIG.ranks[i - 1].id] || 0) : null })); UI.modal(Object.assign({ title: 'Bảng hoa hồng mới · ' + p.name, size: 'lg', sticky: true }, this.parts('admin/products-modal-table', { p, rows, today: new Date().toISOString().slice(0, 10) }, ['body', 'foot']))); },
  ctRecalc: function() { CONFIG.ranks.forEach((r, i) => { if (!i) return; const a = Number(UI.val('ct-' + r.id).replace(/\D/g, '')), b = Number(UI.val('ct-' + CONFIG.ranks[i - 1].id).replace(/\D/g, '')); const el = document.getElementById('ct-diff-' + r.id); if (el) { el.textContent = (a - b >= 0 ? '+' : '') + UI.money(a - b); el.className = 'num mono ' + (a < b ? 'text-error' : ''); } }); },
  saveCommissionTable: function(pid) { const byRank = {}; CONFIG.ranks.forEach(r => { byRank[r.id] = Number(UI.val('ct-' + r.id).replace(/\D/g, '')); }); const err = document.getElementById('ct-err'); err.textContent = ''; const eff = UI.val('ct-eff'); if (!eff) { err.textContent = 'Chọn ngày hiệu lực.'; return; } const r = Store.saveCommissionTable(pid, byRank, new Date(eff + 'T00:00:00').toISOString(), UI.val('ct-note'), this.me()); if (!r.ok) { err.textContent = r.message; return; } UI.closeModal(); UI.toast('Đã lưu bảng hoa hồng v' + r.version + '.'); App.reload(); },
  togglePackage: function(id, active) { const p = Store.pkg(id); UI.confirm({ title: active ? 'Bật bán gói?' : 'Tắt bán gói?', body: active ? `Gói <strong>${UI.esc(p.name)}</strong> hiển thị trên trang mua hàng; gói đang bật khác sẽ tự tắt.` : 'Người mua mở link sẽ thấy "Sản phẩm tạm ngưng bán".', confirmText: active ? 'Bật bán' : 'Tắt bán', tone: active ? '' : 'danger', onConfirm: () => { Store.togglePackage(id, active, this.me()); UI.toast(active ? 'Đã bật bán.' : 'Đã tắt bán.'); App.reload(); } }); },
  packageForm: function(id) { const p = id ? Store.pkg(id) : { id: '', name: '', fullName: '', desc: '', price: 0, image: '', licenseMonths: 12, hasShipping: true, benefits: [] }; UI.modal(Object.assign({ title: id ? 'Sửa gói ' + id : 'Thêm gói sản phẩm', size: 'lg', sticky: true }, this.parts('admin/products-modal-package', { p, editing: !!id }, ['body', 'foot']))); },
  savePackage: function(editing) { const id = UI.val('pk-id').toUpperCase(), name = UI.val('pk-name'), price = Number(UI.val('pk-price').replace(/\D/g, '')); ['pk-id', 'pk-name', 'pk-price', 'pk-full'].forEach(x => UI.setError(x, '')); let ok = true; if (!/^[A-Z0-9]{2,10}$/.test(id)) { UI.setError('pk-id', 'Mã gói 2–10 ký tự chữ/số.'); ok = false; } if (!editing && Store.pkg(id)) { UI.setError('pk-id', 'Mã gói đã tồn tại.'); ok = false; } if (!name) { UI.setError('pk-name', 'Nhập tên gói.'); ok = false; } if (!(price > 0)) { UI.setError('pk-price', 'Giá phải > 0.'); ok = false; } if (!UI.val('pk-full')) { UI.setError('pk-full', 'Nhập tên đầy đủ.'); ok = false; } if (!ok) return; const ex = Store.pkg(id) || {}; Store.savePackage({ id, name, fullName: UI.val('pk-full'), desc: UI.val('pk-desc'), price, image: UI.val('pk-image'), licenseMonths: Number(UI.val('pk-months')) || 0, hasShipping: document.getElementById('pk-ship').checked, active: !!ex.active, benefits: UI.val('pk-benefits').split('\n').map(s => s.trim()).filter(Boolean) }, this.me()); UI.closeModal(); UI.toast('Đã lưu gói ' + id + '.'); App.reload(); },

  // =====================================================================
  // inventory · Kho mã & thiết bị (7.8)
  // =====================================================================
  D05: function() {
    const codes = Store.codes(); const cnt = { IN_STOCK: 0, ASSIGNED: 0, ACTIVATED: 0 }; codes.forEach(c => { cnt[c.status] = (cnt[c.status] || 0) + 1; }); const low = cnt.IN_STOCK <= CONFIG.stock.lowThreshold; const pendingOrders = Store.orders().filter(o => o.status === 'PAID' && !o.licenseCode).length;
    const html = TPL.render('admin/inventory', { f: this.st.codes, cnt, low, pendingOrders, total: codes.length, pct: Math.round(cnt.IN_STOCK / Math.max(1, codes.length) * 100) });
    App.after(() => UI.withLoading('k-table', UI.skeletonTable(7, 8), () => this.renderCodes()));
    return App.adminShell('inventory', 'Kho mã & thiết bị', html, { actions: TPL.render('partials/admin-actions', { screen: 'inventory' }) });
  },
  filteredCodes: function() { const f = this.st.codes; const q = f.q.toLowerCase(); return Store.codes().filter(c => (!f.status || c.status === f.status) && (!q || c.code.toLowerCase().includes(q) || (c.deviceSerial || '').toLowerCase().includes(q) || (c.orderId || '').toLowerCase().includes(q) || c.batch.toLowerCase().includes(q))).sort((a, b) => (a.stockedAt || '') < (b.stockedAt || '') ? 1 : -1); },
  renderCodes: function() {
    const el = document.getElementById('k-table'); if (!el) return; const list = this.filteredCodes(); const pg = UI.paginate(list, this.st.codes.page, 20);
    const rows = pg.rows.map(c => ({ c, a: c.agentId ? Store.user(c.agentId) : null, hasOrder: !!(c.orderId && Store.order(c.orderId)) }));
    el.innerHTML = TPL.render('admin/inventory-table', { rows, pg });
  },
  gotoCodes: function(p) { this.st.codes.page = p; this.renderCodes(); },
  exportCodes: function() { UI.exportCsv('kho-ma.csv', ['Mã SP', 'Serial', 'Mã kích hoạt', 'Trạng thái', 'Lô', 'Đơn', 'Thành viên bán', 'Nhập kho', 'Gắn đơn', 'Kích hoạt', 'Thiết bị'], this.filteredCodes().map(c => [c.deviceSku, c.deviceSerial || '', c.code, LABELS.license[c.status].text, c.batch, c.orderId || '', c.agentId && Store.user(c.agentId) ? Store.user(c.agentId).fullName : '', UI.dt(c.stockedAt), UI.dt(c.assignedAt), UI.dt(c.activatedAt), c.device ? c.device.name : ''])); },
  codeDrawer: function(code) { const c = Store.codeInfo(code); const o = c.orderId ? Store.order(c.orderId) : null; const a = c.agentId ? Store.user(c.agentId) : null; UI.drawer(this.parts('admin/inventory-drawer', { c, o, a, stepIdx: ['IN_STOCK', 'ASSIGNED', 'ACTIVATED'].indexOf(c.status) })); },
  /** Thêm / sửa một mã kích hoạt theo serial máy. Mã do nhà sản xuất cấp, không sinh tự động. */
  codeForm: function(code) {
    const c = code ? Store.codeInfo(code) : null;
    UI.modal(Object.assign({ title: c ? 'Sửa mã kích hoạt' : 'Thêm mã kích hoạt', sticky: true }, this.parts('admin/inventory-modal-code', { c }, ['body', 'foot'])));
  },
  saveCode: function(oldCode) {
    const row = { code: UI.val('cd-code'), deviceSerial: UI.val('cd-serial'), deviceSku: UI.val('cd-sku') };
    const err = document.getElementById('cd-err'); if (err) err.textContent = '';
    const r = oldCode ? Store.updateCode(oldCode, row, this.me()) : Store.addCode(row, this.me());
    if (!r.ok) { if (err) err.textContent = r.message; return; }
    UI.closeModal(); UI.toast(oldCode ? 'Đã cập nhật mã.' : 'Đã thêm mã ' + r.code.code + ' cho serial ' + r.code.deviceSerial + '.');
    App.reload();
  },
  removeCode: function(code) {
    UI.confirm({ title: 'Gỡ mã khỏi kho?', body: 'Mã <span class="mono">' + UI.esc(code) + '</span> sẽ bị xoá khỏi danh sách kho. Chỉ dùng khi nhập nhầm.', reason: 'Lý do gỡ', confirmText: 'Gỡ khỏi kho', tone: 'danger',
      onConfirm: (reason) => { const r = Store.removeCode(code, this.me(), reason); if (!r.ok) { UI.toast(r.message, 'error'); return; } UI.closeDrawer(); UI.toast('Đã gỡ mã ' + code + '.', 'warning'); App.reload(); } });
  },
  importModal: function() { UI.modal(Object.assign({ title: 'Nhập mã từ file', sticky: true }, this.parts('admin/inventory-modal-import', {}, ['body', 'foot']))); },
  readImportFile: function(input) { const f = input.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { document.getElementById('imp-text').value = String(r.result); }; r.readAsText(f); },
  importCodes: function() { const rows = UI.val('imp-text').split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => { const [code, serial] = l.split(/[;,\t]/).map(x => (x || '').trim().toUpperCase()); return { code, deviceSerial: serial }; }); UI.setError('imp-text', ''); const bad = rows.filter(r => !/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/.test(r.code)); if (!rows.length) { UI.setError('imp-text', 'Chưa có mã nào.'); return; } if (bad.length) { UI.setError('imp-text', bad.length + ' mã sai định dạng, ví dụ: ' + bad[0].code); return; } const noSerial = rows.filter(r => !r.deviceSerial); if (noSerial.length) { UI.setError('imp-text', noSerial.length + ' dòng thiếu serial máy. Mỗi dòng phải là: mã kích hoạt;serial'); return; } const r = Store.importCodes(rows, UI.val('imp-sku').toUpperCase(), this.me()); UI.closeModal(); UI.toast(r.skipped ? `Đã nhập ${r.added} mã, lô ${r.batch}. Bỏ qua ${r.skipped}: ${r.skippedList.slice(0, 3).join(', ')}${r.skipped > 3 ? '…' : ''}` : `Đã nhập ${r.added} mã, lô ${r.batch}.`, r.skipped ? 'warning' : 'success'); App.reload(); },

  // =====================================================================
  // ranks · Hạng & quy tắc chương trình
  // =====================================================================
  D06: function() {
    const r = Store.rules();
    const html = TPL.render('admin/ranks', { r, head: this.isHead(), tcNext: (parseFloat(r.tc.version) + 0.1).toFixed(1), history: r.history || [] });
    return App.adminShell('ranks', 'Hạng & quy tắc chương trình', html);
  },
  saveRules: function(e) { e.preventDefault(); if (!this.isHead()) return; const patch = { rankRules: { minSalesPerMonth: Number(UI.val('rl-min')) || 1, demoteSteps: Number(UI.val('rl-steps')) || 1, demoteCumulative: UI.val('rl-demote-cum') || 'rank-floor' }, withdraw: { maxPerMonth: Number(UI.val('rl-maxwd')) || 1, payoutNote: UI.val('rl-payout') } }; Store.saveRankRules(patch, this.me(), UI.val('rl-note') || 'Cập nhật quy tắc chương trình'); UI.toast('Đã lưu quy tắc.'); App.reload(); },
  saveTc: function(e) { e.preventDefault(); if (!this.isHead()) return; const v = UI.val('tc-ver'), t = UI.val('tc-text'); if (!v || t.length < 20) { UI.toast('Nhập phiên bản và nội dung.', 'warning'); return; } Store.saveTc(t, v, this.me()); UI.toast('Đã lưu T&C v' + v + '.'); App.reload(); },

  // =====================================================================
  // withdrawals · Rút tiền (duyệt 2 lớp) & Sổ hoa hồng
  // =====================================================================
  D07: function(q) {
    if (q.get('tab')) this.st.d07.tab = q.get('tab') === 'ledger' ? 'ledger' : 'withdraw'; const s = this.st.d07;
    const html = TPL.render('admin/withdrawals', { tab: s.tab, pending: Store.withdrawals().filter(w => w.status.startsWith('PENDING')).length });
    App.after(() => s.tab === 'withdraw' ? this.renderWithdrawTab() : this.renderLedgerTab());
    return App.adminShell('withdrawals', 'Rút tiền & sổ hoa hồng', html);
  },
  filteredWd: function() { const s = this.st.d07; return Store.withdrawals().filter(w => !s.wdStatus || w.status === s.wdStatus).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderWithdrawTab: function() {
    const el = document.getElementById('d07-body'); if (!el) return; const s = this.st.d07; const list = this.filteredWd(); const pg = UI.paginate(list, s.wdPage);
    const rows = pg.rows.map(w => { const u = Store.user(w.sellerId); const wal = Store.wallet(u.id); return { w, u, wal, okBal: wal.available >= 0, cb: this.canApproveBtn(w), cell: this.approvalCell(w) }; });
    el.innerHTML = TPL.render('admin/withdrawals-list', { s, rows, pg });
  },
  gotoWd: function(p) { this.st.d07.wdPage = p; this.renderWithdrawTab(); },
  wdApprove: function(id) { const w = Store.withdrawal(id); const u = Store.user(w.sellerId); const me = this.me(); UI.confirm({ title: 'Xác nhận yêu cầu rút tiền', body: me.role === 'HEAD' ? 'Head Admin xác nhận → yêu cầu <strong>Đã duyệt</strong> ngay, chờ chi trả.' : (w.status === 'PENDING_0' ? 'Xác nhận lớp 1. Cần thêm một Specialist khác (hoặc Head Admin) xác nhận lớp 2.' : 'Xác nhận lớp 2 → yêu cầu <strong>Đã duyệt</strong>, chờ chi trả.'), summary: [['Thành viên', UI.esc(u.fullName)], ['Số tiền', '<strong>' + UI.money(w.amount) + '</strong>'], ['Nhận về', UI.esc(w.bank.bankName) + ' · <span class="mono">' + UI.esc(w.bank.accountNo) + '</span>'], ['Chủ TK', UI.esc(w.bank.owner)]], confirmText: 'Xác nhận', onConfirm: () => { const r = Store.approveWithdrawal(id, me); if (!r.ok) { UI.toast(r.message, 'error'); return; } UI.toast(r.status === 'APPROVED' ? 'Đã duyệt ' + id + ' — chờ chi trả.' : 'Đã xác nhận lớp 1 (1/2).'); this.renderWithdrawTab(); } }); },
  wdReject: function(id) { const w = Store.withdrawal(id); const u = Store.user(w.sellerId); UI.confirm({ title: 'Từ chối yêu cầu rút tiền', body: `${UI.money(w.amount)} hoàn về số dư khả dụng của <strong>${UI.esc(u.fullName)}</strong>. Thành viên thấy lý do tại màn Ví.`, reason: 'Lý do từ chối', confirmText: 'Từ chối', tone: 'danger', onConfirm: (reason) => { Store.rejectWithdrawal(id, this.me(), reason); UI.toast('Đã từ chối ' + id + '.', 'warning'); this.renderWithdrawTab(); } }); },
  wdPaid: function(id) { const w = Store.withdrawal(id); UI.confirm({ title: 'Đánh dấu đã chi trả', body: 'Xác nhận đã chuyển khoản cho thành viên. Ví và sổ hoa hồng được cập nhật, không hoàn tác.', summary: [['Yêu cầu', '<span class="mono">' + id + '</span>'], ['Số tiền', '<strong>' + UI.money(w.amount) + '</strong>']], confirmText: 'Đã chi trả', onConfirm: () => { const r = Store.markWithdrawalPaid(id, this.me()); if (!r.ok) { UI.toast(r.message, 'error'); return; } UI.toast('Đã ghi nhận chi trả ' + id + '.'); this.renderWithdrawTab(); } }); },
  wdDrawer: function(id) { const w = Store.withdrawal(id); const u = Store.user(w.sellerId); const wal = Store.wallet(u.id); UI.drawer(this.parts('admin/withdrawals-drawer', { w, u, wal, timeline: this.timeline(w, w.status === 'PAID' ? [{ at: w.paidAt, text: 'Đã chi trả bởi ' + w.paidBy }] : []), audit: this.auditList('withdrawal', id), canApprove: this.canApproveBtn(w).ok })); },
  wdExportBank: function() { const list = Store.withdrawals().filter(w => w.status === 'APPROVED'); if (!list.length) { UI.toast('Không có yêu cầu nào đã duyệt chờ chi trả.', 'warning'); return; } UI.exportCsv('chi-tra-rut-tien-' + Store.nowIso().slice(0, 10) + '.csv', ['STT', 'Thành viên', 'Ngân hàng', 'Số TK', 'Chủ TK', 'Số tiền', 'Nội dung'], list.map((w, i) => [i + 1, Store.user(w.sellerId).fullName, w.bank.bankName, w.bank.accountNo, w.bank.owner, w.amount, 'HOMI365 HH ' + w.id])); },
  exportWd: function() { UI.exportCsv('rut-tien.csv', ['Mã', 'Ngày', 'Thành viên', 'SĐT', 'Số tiền', 'Ngân hàng', 'Số TK', 'Trạng thái', 'Xác nhận', 'Lý do'], this.filteredWd().map(w => [w.id, UI.dt(w.createdAt), Store.user(w.sellerId).fullName, Store.user(w.sellerId).phone, w.amount, w.bank.bankName, w.bank.accountNo, LABELS.withdrawal[w.status].text, (w.approvals || []).map(a => a.by + ':' + a.action).join(' '), (w.approvals.find(a => a.action === 'REJECT') || {}).reason || ''])); },
  /** Sổ hoa hồng theo ô tìm kiếm — dùng chung cho bảng và nút Xuất CSV (export phải theo bộ lọc). */
  filteredCm: function() {
    const q = this.st.d07.cmQ.toLowerCase();
    return Store.commissions().filter(c => !q || c.orderId.toLowerCase().includes(q) || (c.beneficiaryId !== 'COMPANY' && Store.user(c.beneficiaryId) && Store.user(c.beneficiaryId).fullName.toLowerCase().includes(q)) || (c.beneficiaryId === 'COMPANY' && 'công ty'.includes(q))).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  },
  renderLedgerTab: function() {
    const el = document.getElementById('d07-body'); if (!el) return; const s = this.st.d07;
    const list = this.filteredCm();
    const pg = UI.paginate(list, s.cmPage, 15); const total = list.filter(c => c.status === 'RECORDED').reduce((t, c) => t + c.amount, 0); const company = list.filter(c => c.beneficiaryId === 'COMPANY' && c.status === 'RECORDED').reduce((t, c) => t + c.amount, 0);
    const rows = pg.rows.map(c => ({ c, who: c.beneficiaryId === 'COMPANY' ? '' : Store.user(c.beneficiaryId).fullName }));
    el.innerHTML = TPL.render('admin/withdrawals-ledger', { s, rows, pg, total, company });
  },
  gotoCm: function(p) { this.st.d07.cmPage = p; this.renderLedgerTab(); },
  exportCm: function() { UI.exportCsv('so-hoa-hong.csv', ['Mã', 'Ngày', 'Đơn', 'Người thụ hưởng', 'Cấp', 'Depth', 'Hạng lúc tính', 'Số tiền', 'Trạng thái'], this.filteredCm().map(c => [c.id, UI.dt(c.createdAt), c.orderId, c.beneficiaryId === 'COMPANY' ? 'HOMI365' : Store.user(c.beneficiaryId).fullName, LABELS.commissionKind[c.kind].text, c.depth, RULES.rank(c.rankAtCalc).label, c.amount, LABELS.commission[c.status].text])); },

  // =====================================================================
  // exceptions · Cấp phát ngoại lệ (ẩn khi rules.onePackagePerPhone=false)
  // =====================================================================
  D08: function() { return App.adminShell('exceptions', 'Cấp phát ngoại lệ', TPL.render('admin/exceptions', {})); },

  // =====================================================================
  // registrations · Duyệt đăng ký thành viên (7.9.2)
  // =====================================================================
  D09: function() {
    const html = TPL.render('admin/registrations', { f: this.st.regs });
    App.after(() => UI.withLoading('rg-table', UI.skeletonTable(7, 5), () => this.renderRegs()));
    return App.adminShell('registrations', 'Kích hoạt thành viên', html);
  },
  filteredRegs: function() { const f = this.st.regs; const q = f.q.toLowerCase(); return Store.registrations().filter(r => (!f.status || r.status === f.status) && (!q || r.fullName.toLowerCase().includes(q) || r.phone.includes(q) || r.email.toLowerCase().includes(q))).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderRegs: function() {
    const el = document.getElementById('rg-table'); if (!el) return; const list = this.filteredRegs(); const pg = UI.paginate(list, this.st.regs.page);
    const rows = pg.rows.map(r => { const ref = r.referrerId ? Store.user(r.referrerId) : null; return { r, ref, refRankLabel: ref ? RULES.rank(r.referrerRankAtSubmit || ref.rank).label : '', cb: Store.canActivateAgent(r, this.me()), cell: this.approvalCell(r) }; });
    el.innerHTML = TPL.render('admin/registrations-table', { rows, pg });
  },
  gotoRegs: function(p) { this.st.regs.page = p; this.renderRegs(); },
  /** Lớp 2 — Manager (hoặc Head) kích hoạt agent, chỉ khi đơn đã được Admin xác nhận thanh toán. */
  canActivate: function(r) { return Store.canActivateAgent(r, this.me()); },
  regApprove: function(id) {
    const r = Store.registration(id); const me = this.me();
    const can = Store.canActivateAgent(r, me);
    if (!can.ok) { UI.toast(can.message, 'error'); return; }
    const o = r.orderId ? Store.order(r.orderId) : null;
    const frozen = r.agentId ? Store.wallet(r.agentId) : null;
    UI.confirm({ title: 'Kích hoạt Agent',
      body: 'Tài khoản chuyển sang <strong>Đang hoạt động</strong>: bắt đầu được ghi nhận điểm, và hoa hồng đang tạm giữ sẽ vào ví ngay.',
      summary: [
        ['Họ tên', UI.esc(r.fullName)],
        ['SĐT', '<span class="mono">' + UI.esc(r.phone) + '</span>'],
        ['Đơn hàng', o ? '<span class="mono">' + UI.esc(o.id) + '</span> · ' + UI.label('order', o.status) : '—'],
        ['Người giới thiệu', r.referrerId ? UI.esc(Store.user(r.referrerId).fullName) : '—'],
        ['Hoa hồng tạm giữ', frozen && frozen.frozen ? UI.money(frozen.frozen) + ' (' + frozen.frozenCount + ' khoản)' : '—']
      ],
      confirmText: 'Kích hoạt Agent',
      onConfirm: () => {
        const res = Store.approveRegistration(id, me);
        if (!res.ok) { UI.toast(res.message, 'error'); return; }
        UI.toast('Đã kích hoạt thành viên ' + res.agent.fullName + '.');
        this.renderRegs(); this.regDrawer(id);
      } });
  },
  regReject: function(id) {
    const r = Store.registration(id);
    if (!CONFIG.activation.activateRoles.includes(this.me().role)) { UI.toast('Chỉ Manager hoặc Head Admin được từ chối hồ sơ thành viên.', 'error'); return; }
    UI.confirm({ title: 'Từ chối hồ sơ', body: `Hồ sơ của <strong>${UI.esc(r.fullName)}</strong> chuyển sang Từ chối. Người đăng ký thấy lý do khi đăng nhập và ${CONFIG.rules.rejectedCanResubmit ? 'có thể nộp lại' : 'không thể nộp lại'}.`, reason: 'Lý do từ chối', confirmText: 'Từ chối', tone: 'danger', onConfirm: (reason) => { const res = Store.rejectRegistration(id, this.me(), reason); if (!res.ok) { UI.toast(res.message, 'error'); return; } UI.toast('Đã từ chối ' + id + '.', 'warning'); this.renderRegs(); } });
  },
  regDrawer: function(id) {
    const r = Store.registration(id); const ref = r.referrerId ? Store.user(r.referrerId) : null; const o = Store.order(r.orderId) || null; const agent = r.agentId ? Store.user(r.agentId) : null; const mail = agent ? (Store.emails().find(e => e.to === agent.email) || null) : null;
    const can = Store.canActivateAgent(r, this.me());
    // Lớp 1 nằm ở màn Đơn hàng nên phải kéo mốc thời gian của đơn vào timeline hồ sơ,
    // nếu không log duyệt sẽ thiếu bước "Admin xác nhận thanh toán" (lỗi kỹ thuật #8).
    const extra = [];
    if (o) {
      if (o.transferClaimedAt) extra.push({ at: o.transferClaimedAt, text: 'Người mua gửi biên lai đơn ' + o.id + (o.transferProof ? ' (' + o.transferProof.name + ')' : '') });
      if (o.paidAt) extra.push({ at: o.paidAt, text: 'Lớp 1 — ' + (o.reconciledBy || 'hệ thống') + ' xác nhận thanh toán đơn ' + o.id + (o.licenseCode ? ' · cấp mã ' + o.licenseCode : '') });
      if (o.status === 'REJECTED' && o.reconciledAt) extra.push({ at: o.reconciledAt, text: 'Đơn ' + o.id + ' bị từ chối đối soát: ' + (o.rejectReason || '') });
    }
    UI.drawer(this.parts('admin/registrations-drawer', { r, ref, o, agent, mail, refRankLabel: ref ? RULES.rank(r.referrerRankAtSubmit || ref.rank).label : '', timeline: this.timeline(r, extra), audit: this.auditList('registration', id), canApprove: can.ok, cannotWhy: can.ok ? '' : can.message }));
  },

  // =====================================================================
  // admin-users · Tài khoản admin (Head Admin)
  // =====================================================================
  D10: function() {
    const html = TPL.render('admin/users', { me: this.me(), list: Store.adminUsers() });
    return App.adminShell('admin-users', 'Tài khoản admin', html, { actions: TPL.render('partials/admin-actions', { screen: 'admin-users' }) });
  },
  adminForm: function(username) { const a = username ? (Store.adminUsers().find(x => x.username === username) || null) : null; UI.modal(Object.assign({ title: a ? 'Sửa tài khoản ' + a.username : 'Thêm tài khoản admin', sticky: true }, this.parts('admin/users-form', { a, me: this.me() }, ['body', 'foot']))); },
  saveAdmin: function(editing) { const username = UI.val('am-user'), fullName = UI.val('am-name'), role = document.getElementById('am-role').value, pw = UI.val('am-pw'); ['am-user', 'am-name', 'am-pw'].forEach(x => UI.setError(x, '')); let ok = true; if (!/^[a-z0-9_.]{3,20}$/.test(username)) { UI.setError('am-user', '3–20 ký tự thường/số.'); ok = false; } if (!editing && Store.adminUsers().some(a => a.username === username)) { UI.setError('am-user', 'Đã tồn tại.'); ok = false; } if (!fullName) { UI.setError('am-name', 'Nhập họ tên.'); ok = false; } if ((!editing || pw) && RULES.validatePassword(pw)) { UI.setError('am-pw', RULES.validatePassword(pw)); ok = false; } if (!ok) return; Store.saveAdminUser({ username, fullName, role, password: pw }, this.me()); UI.closeModal(); UI.toast('Đã lưu tài khoản ' + username + '.'); App.reload(); },
  setAdminStatus: function(username, status) { UI.confirm({ title: status === 'disabled' ? 'Vô hiệu tài khoản?' : 'Kích hoạt lại?', body: `Tài khoản <span class="mono">${UI.esc(username)}</span> ${status === 'disabled' ? 'sẽ không đăng nhập được.' : 'đăng nhập trở lại.'}`, confirmText: status === 'disabled' ? 'Vô hiệu' : 'Kích hoạt', tone: status === 'disabled' ? 'danger' : '', onConfirm: () => { Store.setAdminStatus(username, status, this.me()); UI.toast('Đã cập nhật.'); App.reload(); } }); }
};
