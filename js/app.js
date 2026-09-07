/**
 * HOMI365 prototype v2 — router (hash) · khung layout 3 nhóm · guard phiên & vai trò · trang bìa
 * Markup các khung/trang nằm trong screens/*.html (TPL); file này chỉ giữ điều hướng, guard và dữ liệu.
 *
 * Route: #r/{ref_code} · #p/{alias}  → điểm vào (LP-1) → A-01
 *        #A-01 … #A-06 · #C-01 … #C-03 · #C-PROFILE · #D-00 … #D-10 · #403 · #HOME · #POLICY?s=
 */
const App = {
  timers: {}, current: '', _suppress: false,

  routes: {
    'HOME': () => App.pageHome(),
    'A-01': (q) => Buyer.A01(q), 'A-02': (q) => Buyer.A02(q), 'A-03': (q) => Buyer.A03(q), 'A-04': (q) => Buyer.A04(q), 'A-05': (q) => Buyer.A05(q), 'A-06': (q) => Buyer.A06(q),
    'C-01': (q) => Seller.C01(q), 'C-02': (q) => Seller.C02(q), 'C-03': (q) => Seller.C03(q), 'C-PROFILE': (q) => Seller.profile(q),
    'D-00': (q) => Admin.D00(q), 'D-01': (q) => Admin.D01(q), 'D-02': (q) => Admin.D02(q), 'D-03': (q) => Admin.D03(q), 'D-04': (q) => Admin.D04(q), 'D-05': (q) => Admin.D05(q),
    'D-06': (q) => Admin.D06(q), 'D-07': (q) => Admin.D07(q), 'D-08': (q) => Admin.D08(q), 'D-09': (q) => Admin.D09(q), 'D-10': (q) => Admin.D10(q),
    'POLICY': (q) => App.pagePolicy(q),
    '403': () => App.page403(), 'STYLEGUIDE': () => { window.location.href = './styleguide.html'; }
  },

  /** Khởi động: nạp toàn bộ template rồi mới render (cần chạy qua http server — fetch screens/*.html). */
  boot: function() {
    TPL.load().then(() => this.init()).catch((e) => {
      const root = document.getElementById('app-root');
      if (root) root.innerHTML = '<div style="max-width:560px;margin:40px auto;padding:20px;font-family:sans-serif"><h1 style="font-size:20px;color:#122544">Không nạp được giao diện</h1><p>' + UI.esc(e.message) + '</p><p>Prototype cần chạy qua máy chủ web (http://…), không mở trực tiếp file.</p></div>';
      console.error(e);
    });
  },
  init: function() {
    window.addEventListener('hashchange', () => { if (this._suppress) { this._suppress = false; return; } this.render(window.location.hash.replace('#', '')); });
    this.render(window.location.hash.replace('#', '') || 'HOME');
    if (CONFIG.demo.navigator) this.mountDemoNav();
  },
  navigate: function(target, opts) { const o = opts || {}; const next = '#' + target; if (window.location.hash !== next) { this._suppress = true; if (o.replace) { window.history.replaceState(null, '', next); this._suppress = false; } else window.location.hash = target; } this.render(target); },
  reload: function() { this.render(this.current); },

  render: function(target) {
    const root = document.getElementById('app-root'); if (!root) return;
    this.clearTimers(); UI.closeModal(); UI.closeDrawer(); window.scrollTo(0, 0); this.current = target;

    // Điểm vào: #r/{ref_code} hoặc #p/{alias mua hàng cá nhân}
    if (/^(r|p)\//i.test(target)) {
      const r = Store.captureRef(target.slice(2).split('?')[0]);
      this.navigate(r.ok ? 'A-01' : 'A-01?state=' + (r.reason === 'locked' ? 'inactive' : 'invalid'), { replace: true }); return;
    }
    const [base, qs] = target.split('?'); const q = new URLSearchParams(qs || '');
    const route = this.routes[base]; if (!route) { this.navigate('HOME', { replace: true }); return; }

    if (base.startsWith('C-')) { if (!Store.currentAgent()) { const had = Store.s().agent; this.navigate('A-05?next=' + encodeURIComponent(target) + (had ? '&reason=expired' : ''), { replace: true }); return; } }
    if (base.startsWith('D-') && base !== 'D-00') {
      if (!Store.currentAdmin()) { if (Store.currentAgent()) { root.innerHTML = this.page403('agent'); document.title = '403 · HOMI365'; return; } this.navigate('D-00?next=' + encodeURIComponent(target), { replace: true }); return; }
      if (base === 'D-10' && !Store.isHead()) { root.innerHTML = this.page403('specialist'); document.title = '403 · HOMI365'; return; }
      if (base === 'D-08' && !CONFIG.rules.onePackagePerPhone) { this.navigate('D-01', { replace: true }); return; }
    }
    root.innerHTML = route(q) || '';
    const h = root.querySelector('h1'); document.title = (h ? h.textContent.trim() + ' · ' : '') + 'HOMI365';
    const fn = this._afterRender; this._afterRender = null; if (fn) fn();
  },
  after: function(fn) { this._afterRender = fn; },
  clearTimer: function(name) { if (this.timers[name]) { clearInterval(this.timers[name]); clearTimeout(this.timers[name]); this.timers[name] = null; } },
  clearTimers: function() { Object.keys(this.timers).forEach(k => this.clearTimer(k)); },

  // ---------------- Khung người mua (website) ----------------
  buyerShell: function(content, o) {
    const opt = o || {};
    return TPL.render('shell-buyer', { content, showRef: !!opt.showRef, narrow: !!opt.narrow, seller: Store.refSeller(), cur: (this.current || '').split('?')[0] });
  },

  // ---------------- Khung thành viên ----------------
  sellerNav: [{ code: 'C-01', label: 'Tổng quan', ico: 'home' }, { code: 'C-02', label: 'Gói của tôi', ico: 'package' }, { code: 'C-03', label: 'Ví & rút tiền', ico: 'wallet' }],
  sellerShell: function(active, content) {
    return TPL.render('shell-seller', { active, content, u: Store.currentAgent(), nav: this.sellerNav });
  },
  toggleSellerMenu: function(forceClose) { const m = document.getElementById('seller-menu'); const b = document.getElementById('seller-user-btn'); if (!m || !b) return; const open = forceClose ? false : m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', String(open)); if (open) { this._menuOut = (e) => { if (!document.getElementById('seller-menu') || !e.target.closest('.seller-user')) this.toggleSellerMenu(true); }; setTimeout(() => document.addEventListener('click', this._menuOut), 0); } else if (this._menuOut) { document.removeEventListener('click', this._menuOut); this._menuOut = null; } },
  logoutAgent: function() { Store.logoutAgent(); UI.toast('Đã đăng xuất.', 'info'); this.navigate('A-05'); },
  logoutSeller: function() { this.logoutAgent(); },

  // ---------------- Khung quản trị ----------------
  adminShell: function(active, title, content, o) {
    const opt = o || {}; const st = Store.adminStats(30); const me = Store.currentAdmin(); const head = me.role === 'HEAD';
    const items = [
      { code: 'D-01', label: 'Tổng quan', ico: 'home', badge: 0 },
      { group: 'Vận hành' },
      { code: 'D-09', label: 'Duyệt đăng ký thành viên', ico: 'user', badge: st.regPending },
      { code: 'D-07', label: 'Rút tiền & sổ hoa hồng', ico: 'cash', badge: st.withdrawPending + st.withdrawApproved },
      { code: 'D-03', label: 'Đơn hàng & đối soát', ico: 'inbox', badge: st.awaiting },
      { code: 'D-02', label: 'Thành viên', ico: 'users', badge: 0 },
      { code: 'D-05', label: 'Kho mã & thiết bị', ico: 'key', badge: st.stock <= CONFIG.stock.lowThreshold ? st.stock : 0 },
      CONFIG.rules.onePackagePerPhone ? { code: 'D-08', label: 'Cấp phát ngoại lệ', ico: 'gift', badge: 0 } : null,
      { group: 'Cấu hình' },
      { code: 'D-04', label: 'Sản phẩm & hoa hồng', ico: 'package', badge: 0 },
      { code: 'D-06', label: 'Hạng & quy tắc', ico: 'settings', badge: 0 },
      head ? { code: 'D-10', label: 'Tài khoản admin', ico: 'shield', badge: 0 } : null
    ].filter(Boolean);
    return TPL.render('shell-admin', { active, title, content, actions: opt.actions || '', items, me, roleLabel: LABELS.role[me.role] ? LABELS.role[me.role].text : me.role });
  },
  logoutAdmin: function() { Store.logoutAdmin(); this.navigate('D-00'); },

  // ---------------- Trang chính sách (một trang, danh mục bên phải) ----------------
  pagePolicy: function(q) {
    const id = q.get('s') || POLICIES[0].id; const p = POLICIES.find(x => x.id === id) || POLICIES[0];
    return this.buyerShell(TPL.render('policy', { p }));
  },

  page403: function(kind) { return TPL.render('403', { spec: kind === 'specialist' }); },

  // ---------------- Trang bìa prototype ----------------
  pageHome: function() {
    const kim = Store.user('U101');
    const paidOrder = Store.orders().find(o => o.status === 'PAID' && o.phone === kim.phone) || Store.orders().find(o => o.status === 'PAID');
    return TPL.render('home', {
      an: Store.user('U001'), kim, bao: Store.user('U102'), paidOrderId: paidOrder ? paidOrder.id : '',
      pending: {
        regs: Store.registrations().filter(r => r.status.startsWith('PENDING')).length,
        wds: Store.withdrawals().filter(w => w.status.startsWith('PENDING')).length,
        awaiting: Store.orders().filter(o => o.status === 'AWAITING_RECONCILE').length
      }
    });
  },

  // ---------------- Demo navigator (F9) ----------------
  mountDemoNav: function() { if (document.getElementById('demo-fab')) return; const fab = document.createElement('button'); fab.id = 'demo-fab'; fab.className = 'demo-fab'; fab.textContent = 'Demo'; fab.onclick = () => this.toggleDemoNav(); document.body.appendChild(fab); document.addEventListener('keydown', (e) => { if (e.key === 'F9') this.toggleDemoNav(); }); },
  toggleDemoNav: function() {
    const ex = document.getElementById('demo-panel'); if (ex) { ex.remove(); return; }
    const g = (title, items) => ({ title, items: items.map(([hash, label]) => ({ hash, label })) });
    const groups = [
      g('Điểm vào', [['r/AN7K2Q', 'Link giới thiệu'], ['p/NVA3456', 'Link mua hàng cá nhân'], ['r/XXXXXX', 'Link không hợp lệ'], ['r/EM9QZT', 'Thành viên bị khoá']]),
      g('A', [['A-01', 'A-01'], ['A-02?state=demo', 'A-02'], ['A-03?state=paid', 'A-03 PAID'], ['A-03?state=reconcile', 'A-03 chờ đối soát'], ['A-04', 'A-04'], ['A-05', 'A-05'], ['A-05?view=forgot', 'A-05 quên MK'], ['A-06', 'A-06'], ['A-06?state=pending', 'A-06 chờ duyệt'], ['A-06?state=rejected', 'A-06 bị từ chối']]),
      g('C', [['C-01', 'C-01'], ['C-02', 'C-02'], ['C-03', 'C-03'], ['C-PROFILE', 'Hồ sơ']]),
      g('D', [['D-00', 'D-00'], ['D-01', 'D-01'], ['D-02', 'D-02'], ['D-03', 'D-03'], ['D-04', 'D-04'], ['D-05', 'D-05'], ['D-06', 'D-06'], ['D-07', 'D-07'], ['D-09', 'D-09'], ['D-10', 'D-10'], ['403', '403']])
    ];
    const p = document.createElement('div'); p.id = 'demo-panel'; p.className = 'demo-panel';
    p.innerHTML = TPL.render('demo-nav', { groups });
    document.body.appendChild(p);
  }
};
document.addEventListener('DOMContentLoaded', () => App.boot());
