/**
 * Nhóm C · Dashboard thành viên (spec v3, 7.3) — dashboard Tổng quan · my-package Gói & mã · wallet Ví & rút tiền · Hồ sơ
 * Markup nằm trong screens/c-*.html + screens/partials/seller-*.html (render qua TPL). File này chỉ giữ logic + view-model.
 */
const Seller = {
  state: { tab: 'stats', period: CONFIG.defaultPeriod, from: '', to: '', cmKind: '', cmPage: 1, wdTab: 'requests', wdStep: null },
  setTab: function(t) { this.state.tab = t; App.reload(); const bar = document.querySelector('.c01-tabs'); if (bar) window.scrollTo({ top: Math.max(0, bar.getBoundingClientRect().top + window.scrollY - 64), behavior: 'auto' }); },

  range: function() {
    const days = { week: 7, month: 30, quarter: 90 }[this.state.period];
    if (this.state.period === 'custom' && this.state.from) { const to = this.state.to ? new Date(this.state.to + 'T23:59:59') : new Date(); return { from: new Date(this.state.from + 'T00:00:00').toISOString(), to: to.toISOString(), label: RULES.formatDate(this.state.from) + ' – ' + RULES.formatDate(to.toISOString()) }; }
    const d = days || 30; return { from: new Date(Date.now() - d * 86400000).toISOString(), to: new Date().toISOString(), label: d + ' ngày' };
  },
  periodSeg: function() { return TPL.render('partials/seller-period-seg', { periods: CONFIG.periods, period: this.state.period, from: this.state.from, to: this.state.to }); },
  setPeriod: function(id) { this.state.period = id; this.state.cmPage = 1; if (id === 'custom' && !this.state.from) { this.state.from = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10); this.state.to = new Date().toISOString().slice(0, 10); } App.reload(); },
  applyRange: function() { const f = UI.val('rg-from'), t = UI.val('rg-to'); if (!f) { UI.toast('Chọn ngày bắt đầu.', 'warning'); return; } if (t && t < f) { UI.toast('Ngày kết thúc phải sau ngày bắt đầu.', 'warning'); return; } this.state.from = f; this.state.to = t; this.state.cmPage = 1; App.reload(); },
  sourceLabel: function(c) { return c.kind === 'SELF' ? 'Tự bán' : c.kind === 'COMPANY' ? 'Về công ty' : 'F' + c.depth; },

  // =====================================================================
  // dashboard · Tổng quan
  // =====================================================================
  C01: function() {
    const u = Store.currentAgent(); const rk = RULES.rank(u.rank); const nx = RULES.nextRank(u.rank); const need = RULES.salesToNextRank(u.cumulativeSales, u.rank);
    const sold = Store.salesThisMonth(u.id); const rr = Store.rules().rankRules; const w = Store.wallet(u.id); const cw = Store.canWithdraw(u.id);
    const pct = nx ? Math.min(100, Math.round(((u.cumulativeSales - rk.threshold) / Math.max(1, nx.threshold - rk.threshold)) * 100)) : 100;
    const tab = this.state.tab || 'stats'; const counts = this.downlineCounts(u);
    let tabHtml;
    if (tab === 'stats') {
      tabHtml = TPL.render('seller/dashboard-stats', {
        u, w, rk, nx, need, pct, sold, rr,
        canRecruit: RULES.canRecruit(u.rank), keepOk: sold >= rr.minSalesPerMonth,
        refUrl: RULES.referralUrl(u.refCode), aliasUrl: RULES.purchaseUrl(u.purchaseAlias), publicAliasUrl: RULES.publicPurchaseUrl(u.purchaseAlias),
        jobTime: rr.jobTime || CONFIG.rankRules.jobTime, ladderHtml: this.rankLadder(u), periodSegHtml: this.periodSeg()
      });
    } else if (tab === 'commission') {
      tabHtml = TPL.render('seller/dashboard-commissions', { w, cw, cmKind: this.state.cmKind });
    } else {
      tabHtml = TPL.render('seller/dashboard-tree', { countsText: counts.map((n, i) => 'F' + (i + 1) + ': ' + n).join(' · '), treeHtml: this.downlineTree(u) });
    }
    const html = TPL.render('seller/dashboard', {
      u, tab, tabHtml, pending: Store.isPendingAgent(u), w,
      tabs: [{ id: 'stats', label: 'Thống kê', ico: 'chart' }, { id: 'commission', label: 'Hoa hồng', ico: 'cash' }, { id: 'tree', label: 'Tuyến', ico: 'users' }],
      treeCount: counts.reduce((a, b) => a + b, 0)
    });
    App.after(() => { if (tab === 'stats') UI.withLoading('c01-stats', UI.skeletonCards(2), () => this.renderStats()); if (tab === 'commission') { UI.withLoading('c01-cm', UI.skeletonTable(6, 5), () => this.renderCommissions()); this.renderCmChart(); } });
    return App.sellerShell('dashboard', html);
  },
  shareZalo: function(url) { UI.copy(url, 'Đã sao chép link — dán vào tin nhắn Zalo để chia sẻ.'); window.open('https://zalo.me/', '_blank', 'noopener'); },
  downloadQr: function(alias) { const svg = UI.qrSvg(RULES.purchaseUrl(alias), 512); const blob = new Blob([svg], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'homi365-qr-' + alias + '.svg'; document.body.appendChild(a); a.click(); a.remove(); UI.toast('Đã tải mã QR.'); },
  renderStats: function() {
    const u = Store.currentAgent(); const r = this.range(); const st = Store.agentStats(u.id, r.from, r.to);
    const series = Store.agentSeries(u.id, r.from, r.to).map(s => ({ label: UI.dayLabel(s.date), bar: s.paid, line: s.clicks }));
    const el = document.getElementById('c01-stats'); if (!el) return;
    const chartHtml = UI.chart.combo(series, { height: 220, barName: 'đơn thanh toán', lineName: 'click', aria: 'Biểu đồ đơn thanh toán và lượt click theo ngày', legend: [{ text: 'Đơn thanh toán (cột)' }, { text: 'Lượt click (đường)', cls: 'legend-line' }] });
    el.innerHTML = TPL.render('seller/dashboard-stats-body', { st, conversion: RULES.formatPercent(st.conversion, 1), rangeLabel: r.label, chartHtml });
  },
  renderCmChart: function() {
    const u = Store.currentAgent(); const r = this.range(); const el = document.getElementById('c01-cmchart'); if (!el) return;
    const series = Store.agentSeries(u.id, r.from, r.to).map(s => ({ label: UI.dayLabel(s.date), bar: s.commission / 1000000 }));
    const chartHtml = UI.chart.combo(series, { height: 180, barName: 'triệu đ', accent: true, yFormat: (v) => v.toFixed(1), aria: 'Hoa hồng theo ngày' });
    el.innerHTML = TPL.render('seller/dashboard-cmchart', { rangeLabel: r.label, chartHtml });
  },
  filteredCommissions: function() { const u = Store.currentAgent(); const r = this.range(); return Store.commissionsOf(u.id).filter(c => c.createdAt >= r.from && c.createdAt <= r.to && (!this.state.cmKind || c.kind === this.state.cmKind)).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderCommissions: function() {
    const el = document.getElementById('c01-cm'); if (!el) return; const list = this.filteredCommissions();
    const pg = UI.paginate(list, this.state.cmPage); const total = list.reduce((s, c) => s + (c.status === 'RECORDED' ? c.amount : 0), 0);
    const rows = pg.rows.map(c => {
      const o = Store.order(c.orderId); const seller = o && o.sellerId ? Store.user(o.sellerId) : null;
      return { c, o, seller, phone: o ? RULES.maskPhone(o.phone) : '', source: this.sourceLabel(c), showSeller: !!(c.kind === 'DIFF' && seller), sellerRankLabel: seller ? RULES.rank(o.referrerRankAtOrder || seller.rank).label : '' };
    });
    el.innerHTML = TPL.render('seller/dashboard-commissions-table', { rows, pg, count: list.length, total });
  },
  gotoCmPage: function(p) { this.state.cmPage = p; this.renderCommissions(); },
  exportCommissions: function() { const rows = this.filteredCommissions().map(c => [UI.date(c.createdAt), c.orderId, this.sourceLabel(c), RULES.rank(c.rankAtCalc).label, c.amount, LABELS.commission[c.status].text]); if (!rows.length) { UI.toast('Không có dữ liệu để xuất.', 'warning'); return; } UI.exportCsv('bang-ke-hoa-hong-' + Store.currentAgent().refCode + '.csv', ['Ngày', 'Đơn', 'Nguồn', 'Hạng lúc tính', 'Số tiền (đ)', 'Trạng thái'], rows); },
  /** Thang 6 hạng: ngưỡng luỹ kế, quyền tuyển, trạng thái so với hạng hiện tại. */
  rankLadder: function(u) {
    const cur = RULES.rankIndex(u.rank); const rr = Store.rules().rankRules;
    const rows = CONFIG.ranks.map((r, i) => ({
      id: r.id, threshold: r.threshold, canRecruit: r.canRecruit, isCur: i === cur,
      state: i < cur ? 'done' : i === cur ? 'current' : (u.cumulativeSales >= r.threshold ? 'ready' : 'missing'),
      missing: r.threshold - u.cumulativeSales
    }));
    return TPL.render('partials/seller-rank-ladder', { rows, rr });
  },
  downlineCounts: function(u) { const c = [0, 0, 0]; const walk = (id, lv) => { if (lv > 3) return; Store.downline(id).filter(x => x.type === 'agent').forEach(d => { c[lv - 1]++; walk(d.id, lv + 1); }); }; walk(u.id, 1); return c; },
  /** Cây tuyến dưới 3 cấp: mỗi nút hiện cấp F1/F2/F3, hạng, luỹ kế, bán tháng này. */
  downlineTree: function(u) {
    const tree = Store.downlineTree(u.id, 3).filter(n => n.user.type === 'agent');
    const node = (n, lv) => ({
      lv, name: n.user.fullName, rank: n.user.rank, cumulativeSales: n.user.cumulativeSales, soldMonth: Store.salesThisMonth(n.user.id),
      phone: RULES.maskPhone(n.user.phone), locked: n.user.status === 'locked',
      children: lv < 3 ? n.children.filter(c => c.user.type === 'agent').map(c => node(c, lv + 1)) : []
    });
    return TPL.render('partials/seller-tree', { nodes: tree.map(n => node(n, 1)), canRecruit: RULES.canRecruit(u.rank) });
  },
  f1Table: function(u) {
    const list = Store.downline(u.id).filter(x => x.type === 'agent');
    const rows = list.map(d => ({ d, phone: RULES.maskPhone(d.phone), sold: Store.salesThisMonth(d.id), downCount: Store.downline(d.id).filter(x => x.type === 'agent').length }));
    return TPL.render('partials/seller-f1-table', { rows, canRecruit: RULES.canRecruit(u.rank) });
  },

  // =====================================================================
  // my-package · Gói của tôi & mã kích hoạt
  // =====================================================================
  C02: function() {
    const u = Store.currentAgent(); const order = Store.agentPackageOrder(u.phone);
    const pkg = order ? Store.pkg(order.packageId) : null; const code = order && order.licenseCode ? Store.codeInfo(order.licenseCode) : null; const activated = !!(code && code.status === 'ACTIVATED');
    const expiry = activated ? UI.date(new Date(new Date(code.activatedAt).getTime() + pkg.licenseMonths * 30.4 * 86400000).toISOString()) : null;
    const html = TPL.render('seller/my-package', {
      u, order, pkg, code, activated, expiry, maskedPhone: RULES.maskPhone(u.phone),
      methodLabel: order ? (LABELS.method[order.method] || '') : '',
      sellerName: order && order.sellerId ? Store.user(order.sellerId).fullName : '—'
    });
    return App.sellerShell('my-package', html);
  },

  // =====================================================================
  // wallet · Ví & rút tiền (7.3.4, 7.6)
  // =====================================================================
  C03: function(q) {
    const u = Store.currentAgent(); const w = Store.wallet(u.id); const cw = Store.canWithdraw(u.id); const wr = Store.rules().withdraw;
    if (q.get('withdraw') && cw.ok) this.state.wdStep = 'form';
    const html = TPL.render('seller/wallet', {
      u, w, cw, pending: Store.isPendingAgent(u), wdStep: this.state.wdStep, wdTab: this.state.wdTab, wdCount: Store.withdrawalsOf(u.id).length,
      maxPerMonth: CONFIG.withdraw.maxPerMonth, payoutNote: wr.payoutNote || CONFIG.withdraw.payoutNote,
      tabHtml: this.state.wdTab === 'ledger' ? this.ledger(u) : this.requests(u)
    });
    if (this.state.wdStep) App.after(() => this.wdRender());
    return App.sellerShell('wallet', html);
  },
  ledger: function(u) {
    const rows = Store.ledger(u.id).slice(0, 40).map(r => ({ r, desc: LABELS.ledger[r.type], sign: r.effect > 0 ? '+' : r.effect < 0 ? '−' : '', cls: r.effect > 0 ? 'amt-in' : r.effect < 0 ? 'amt-out' : 'amt-hold' }));
    return TPL.render('seller/wallet-ledger', { rows });
  },
  approvalTimeline: function(w) {
    const rows = [{ at: w.createdAt, text: 'Tạo yêu cầu' + (w.createdBy && w.createdBy !== 'agent' ? ' (tạo hộ bởi quản trị)' : '') }].concat((w.approvals || []).map(a => ({ at: a.at, text: (a.action === 'APPROVE' ? 'Xác nhận lớp ' : 'Từ chối · ') + (a.action === 'APPROVE' ? '' : (a.reason || '')) + ' — ' + (LABELS.role[a.role] ? LABELS.role[a.role].text : a.role) })));
    if (w.status === 'PAID') rows.push({ at: w.paidAt, text: 'Đã chi trả' });
    return TPL.render('partials/seller-approval-timeline', { rows: rows.map((r, i) => ({ at: r.at, text: r.text.replace('Xác nhận lớp  —', 'Xác nhận lớp ' + i + ' —') })) });
  },
  requests: function(u) {
    const list = Store.withdrawalsOf(u.id).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1).map(w => ({
      w, maskedAccount: RULES.maskAccount(w.bank.accountNo),
      rejectReason: w.status === 'REJECTED' ? ((w.approvals.find(a => a.action === 'REJECT') || {}).reason || '') : '',
      timelineHtml: this.approvalTimeline(w)
    }));
    return TPL.render('seller/wallet-requests', { list });
  },
  wdStart: function() { const u = Store.currentAgent(); const cw = Store.canWithdraw(u.id); if (!cw.ok) { UI.toast(cw.message, 'warning'); return; } this.state.wdStep = 'form'; this.wdRender(); const p = document.getElementById('wd-panel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  wdCancel: function() { this.state.wdStep = null; this.state.wdDraft = null; App.reload(); },
  wdRender: function() {
    const u = Store.currentAgent(); const w = Store.wallet(u.id); const panel = document.getElementById('wd-panel'); if (!panel) return; const step = this.state.wdStep;
    const order = ['form', 'confirm', 'done']; const idx = order.indexOf(step); if (idx < 0) return;
    const steps = [['form', 'Số tiền'], ['confirm', 'Tài khoản'], ['done', 'Đã gửi']].map(([k, l], i) => ({ k, l, active: step === k, done: idx > i }));
    panel.innerHTML = TPL.render('seller/wallet-withdraw', {
      step, steps, u, w,
      d: step === 'form' ? (this.state.wdDraft || { amount: '' }) : (this.state.wdDraft || null),
      wd: this.state.wdLast || null,
      quick: [1000000, 2000000, 5000000].filter(a => a <= w.available),
      maxPerMonth: CONFIG.withdraw.maxPerMonth,
      payoutNoteLower: (Store.rules().withdraw.payoutNote || '').toLowerCase()
    });
  },
  wdSubmitForm: function(e) { e.preventDefault(); const u = Store.currentAgent(); const amount = Number(UI.val('wd-amount').replace(/\D/g, '')); UI.setError('wd-amount', ''); const cw = Store.canWithdraw(u.id, amount); if (!cw.ok) { UI.setError('wd-amount', cw.message); UI.focusFirstError(); return; } this.state.wdDraft = { amount }; this.state.wdStep = 'confirm'; this.wdRender(); },
  wdConfirm: function() { const u = Store.currentAgent(); const d = this.state.wdDraft; UI.confirm({ title: 'Gửi yêu cầu rút tiền?', body: 'Số tiền sẽ được tạm giữ khỏi số dư khả dụng cho đến khi xử lý xong. Bạn không thể tạo thêm yêu cầu trong tháng này.', summary: [['Số tiền', '<strong>' + UI.money(d.amount) + '</strong>'], ['Nhận về', UI.esc(u.bank.bankName) + ' · <span class="mono">' + UI.esc(u.bank.accountNo) + '</span>'], ['Chủ TK', UI.esc(u.bank.owner)]], confirmText: 'Gửi yêu cầu', cancelText: 'Quay lại', onConfirm: () => { const wd = Store.createWithdrawal(u.id, d.amount); this.state.wdLast = wd; this.state.wdStep = 'done'; this.state.wdDraft = null; App.reload(); } }); },

  // =====================================================================
  // Hồ sơ (7.3.6, 4.11)
  // =====================================================================
  profile: function() {
    const u = Store.currentAgent(); const ref = u.referrerId ? Store.user(u.referrerId) : null; const w = Store.wallet(u.id);
    const html = TPL.render('seller/profile', {
      u, ref, w,
      rankLabel: RULES.rank(u.rank).label, refRankLabel: ref ? RULES.rank(ref.rank).label : '',
      publicUrl: RULES.publicPurchaseUrl(u.purchaseAlias), purchaseUrl: RULES.purchaseUrl(u.purchaseAlias),
      history: (u.rankHistory || []).slice().reverse().map(h => ({ at: h.at, event: h.event, fromLabel: h.from ? RULES.rank(h.from).label : '', toLabel: RULES.rank(h.to).label, reason: h.reason || '' })),
      bank: { bankName: u.bank ? u.bank.bankName : CONFIG.banks[0], accountNo: u.bank ? u.bank.accountNo : '', owner: u.bank ? u.bank.owner : '' },
      bankOptions: CONFIG.banks.map(b => ({ value: b, label: b }))
    });
    return App.sellerShell('', html);
  },
  saveProfile: function(e) { e.preventDefault(); const u = Store.currentAgent(); const name = UI.val('pf-name'), email = UI.val('pf-email'), address = UI.val('pf-address'); ['pf-name', 'pf-email'].forEach(x => UI.setError(x, '')); if (name.length < 2) { UI.setError('pf-name', 'Vui lòng nhập họ tên.'); return; } if (!RULES.isEmail(email)) { UI.setError('pf-email', 'Email không hợp lệ.'); return; } const ex = Store.userByEmail(email); if (ex && ex.id !== u.id && ex.type === 'agent') { UI.setError('pf-email', 'Email đã được dùng cho thành viên khác.'); return; } Store.updateProfile(u.id, { fullName: name, email, address }); UI.toast('Đã lưu hồ sơ.'); App.reload(); },
  saveBank: function(e) { e.preventDefault(); const u = Store.currentAgent(); const bankName = UI.val('bk-bank'), accountNo = UI.val('bk-acc'), owner = UI.val('bk-owner').toUpperCase(); ['bk-acc', 'bk-owner'].forEach(x => UI.setError(x, '')); if (!/^\d{6,16}$/.test(accountNo)) { UI.setError('bk-acc', 'Số tài khoản gồm 6–16 chữ số.'); return; } if (owner.length < 4) { UI.setError('bk-owner', 'Nhập tên chủ tài khoản.'); return; } UI.confirm({ title: 'Cập nhật tài khoản nhận hoa hồng?', body: 'Thay đổi áp dụng cho các yêu cầu rút tiền mới và được ghi vào nhật ký.', summary: [['Ngân hàng', UI.esc(bankName)], ['Số TK', '<span class="mono">' + UI.esc(accountNo) + '</span>'], ['Chủ TK', UI.esc(owner)]], confirmText: 'Lưu', onConfirm: () => { Store.updateProfile(u.id, { bank: { bankName, accountNo, owner } }, 'Cập nhật tài khoản ngân hàng'); UI.toast('Đã lưu tài khoản ngân hàng.'); App.reload(); } }); },
  changePassword: function(e) { e.preventDefault(); const u = Store.currentAgent(); const o = UI.val('pw-old'), n = UI.val('pw-new'), n2 = UI.val('pw-new2'); ['pw-old', 'pw-new', 'pw-new2'].forEach(x => UI.setError(x, '')); const err = RULES.validatePassword(n); if (err) { UI.setError('pw-new', err); return; } if (n !== n2) { UI.setError('pw-new2', 'Mật khẩu nhập lại không khớp.'); return; } const r = Store.changePassword(u.id, o, n); if (!r.ok) { UI.setError('pw-old', r.message); return; } UI.toast('Đã đổi mật khẩu.'); App.reload(); }
};
