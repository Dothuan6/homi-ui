/**
 * HOMI365 prototype v2 — router (hash) · khung layout 3 nhóm · guard phiên & vai trò · trang bìa
 * Markup các khung/trang nằm trong screens/*.html (TPL); file này chỉ giữ điều hướng, guard và dữ liệu.
 *
 * Route: #r/{ref_code} · #p/{alias}  → điểm vào (LP-1) → buy
 *        #buy … #register · #dashboard … #wallet · #profile · #admin-login … #admin-users · #403 · #home · #policy?s=
 */
const App = {
  timers: {}, current: '', _suppress: false,

  routes: {
    'home': () => App.pageHome(),
    'buy': (q) => Buyer.A01(q), 'payment': (q) => Buyer.A02(q), 'order-result': (q) => Buyer.A03(q), 'order-lookup': (q) => Buyer.A04(q), 'login': (q) => Buyer.A05(q), 'register': (q) => Buyer.A06(q),
    'dashboard': (q) => Seller.C01(q), 'my-package': (q) => Seller.C02(q), 'wallet': (q) => Seller.C03(q), 'profile': (q) => Seller.profile(q),
    'admin-login': (q) => Admin.D00(q), 'admin-dashboard': (q) => Admin.D01(q), 'agents': (q) => Admin.D02(q), 'orders': (q) => Admin.D03(q), 'products': (q) => Admin.D04(q), 'inventory': (q) => Admin.D05(q),
    'ranks': (q) => Admin.D06(q), 'withdrawals': (q) => Admin.D07(q), 'exceptions': (q) => Admin.D08(q), 'registrations': (q) => Admin.D09(q), 'admin-users': (q) => Admin.D10(q),
    'policy': (q) => App.pagePolicy(q),
    '403': () => App.page403(), 'styleguide': () => { window.location.href = './styleguide.html'; }
  },

  /** Route cần đăng nhập thành viên · route cần đăng nhập admin (admin-login không nằm trong danh sách). */
  sellerRoutes: ['dashboard', 'my-package', 'wallet', 'profile'],
  adminRoutes: ['admin-dashboard', 'agents', 'orders', 'products', 'inventory', 'ranks', 'withdrawals', 'exceptions', 'registrations', 'admin-users'],

  /** Khởi động: nạp toàn bộ template rồi mới render (fetch screens/*.html, hoặc bundle js/templates.js khi file://). */
  boot: function() {
    TPL.load().then(() => this.init()).catch((e) => {
      const root = document.getElementById('app-root');
      if (root) root.innerHTML = '<div style="max-width:560px;margin:40px auto;padding:20px;font-family:sans-serif"><h1 style="font-size:20px;color:#122544">Không nạp được giao diện</h1><p>' + UI.esc(e.message) + '</p><p>Chạy <code>python serve.py</code> rồi mở http://localhost:5174/index.html — hoặc chạy <code>python build.py</code> một lần để mở trực tiếp index.html từ ổ đĩa.</p></div>';
      console.error(e);
    });
  },
  init: function() {
    window.addEventListener('hashchange', () => { if (this._suppress) { this._suppress = false; return; } this.render(window.location.hash.replace('#', '')); });
    // window.__ROUTE__: trang trong site/ đặt sẵn route khởi động của riêng nó (mỗi màn một file).
    this.render(window.location.hash.replace('#', '') || window.__ROUTE__ || 'home');
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
      this.navigate(r.ok ? 'buy' : 'buy?state=' + (r.reason === 'locked' ? 'inactive' : 'invalid'), { replace: true }); return;
    }
    const [base, qs] = target.split('?'); const q = new URLSearchParams(qs || '');
    const route = this.routes[base]; if (!route) { this.navigate('home', { replace: true }); return; }

    if (this.sellerRoutes.includes(base)) { if (!Store.currentAgent()) { const had = Store.s().agent; this.navigate('login?next=' + encodeURIComponent(target) + (had ? '&reason=expired' : ''), { replace: true }); return; } }
    if (this.adminRoutes.includes(base)) {
      if (!Store.currentAdmin()) { if (Store.currentAgent()) { root.innerHTML = this.page403('agent'); document.title = '403 · HOMI365'; return; } this.navigate('admin-login?next=' + encodeURIComponent(target), { replace: true }); return; }
      if (base === 'admin-users' && !Store.isHead()) { root.innerHTML = this.page403('specialist'); document.title = '403 · HOMI365'; return; }
      if (base === 'exceptions' && !CONFIG.rules.onePackagePerPhone) { this.navigate('admin-dashboard', { replace: true }); return; }
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
    return TPL.render('common/shell-buyer', { content, showRef: !!opt.showRef, narrow: !!opt.narrow, seller: Store.refSeller(), cur: (this.current || '').split('?')[0] });
  },

  // ---------------- Khung thành viên ----------------
  sellerNav: [{ code: 'dashboard', label: 'Tổng quan', ico: 'home' }, { code: 'my-package', label: 'Gói của tôi', ico: 'package' }, { code: 'wallet', label: 'Ví & rút tiền', ico: 'wallet' }],
  sellerShell: function(active, content) {
    return TPL.render('common/shell-seller', { active, content, u: Store.currentAgent(), nav: this.sellerNav });
  },
  toggleSellerMenu: function(forceClose) { const m = document.getElementById('seller-menu'); const b = document.getElementById('seller-user-btn'); if (!m || !b) return; const open = forceClose ? false : m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', String(open)); if (open) { this._menuOut = (e) => { if (!document.getElementById('seller-menu') || !e.target.closest('.seller-user')) this.toggleSellerMenu(true); }; setTimeout(() => document.addEventListener('click', this._menuOut), 0); } else if (this._menuOut) { document.removeEventListener('click', this._menuOut); this._menuOut = null; } },
  logoutAgent: function() { Store.logoutAgent(); UI.toast('Đã đăng xuất.', 'info'); this.navigate('login'); },
  logoutSeller: function() { this.logoutAgent(); },

  // ---------------- Khung quản trị ----------------
  adminShell: function(active, title, content, o) {
    const opt = o || {}; const st = Store.adminStats(30); const me = Store.currentAdmin(); const head = me.role === 'HEAD';
    const items = [
      { code: 'admin-dashboard', label: 'Tổng quan', ico: 'home', badge: 0 },
      { group: 'Vận hành' },
      { code: 'registrations', label: 'Kích hoạt thành viên', ico: 'user', badge: st.regPending },
      { code: 'withdrawals', label: 'Rút tiền & sổ hoa hồng', ico: 'cash', badge: st.withdrawPending + st.withdrawApproved },
      { code: 'orders', label: 'Đơn hàng & đối soát', ico: 'inbox', badge: st.awaiting },
      { code: 'agents', label: 'Thành viên', ico: 'users', badge: 0 },
      { code: 'inventory', label: 'Kho mã & thiết bị', ico: 'key', badge: st.stock <= CONFIG.stock.lowThreshold ? st.stock : 0 },
      CONFIG.rules.onePackagePerPhone ? { code: 'exceptions', label: 'Cấp phát ngoại lệ', ico: 'gift', badge: 0 } : null,
      { group: 'Cấu hình' },
      { code: 'products', label: 'Sản phẩm & hoa hồng', ico: 'package', badge: 0 },
      { code: 'ranks', label: 'Hạng & quy tắc', ico: 'settings', badge: 0 },
      head ? { code: 'admin-users', label: 'Tài khoản admin', ico: 'shield', badge: 0 } : null
    ].filter(Boolean);
    return TPL.render('common/shell-admin', { active, title, content, actions: opt.actions || '', items, me, roleLabel: LABELS.role[me.role] ? LABELS.role[me.role].text : me.role });
  },
  logoutAdmin: function() { Store.logoutAdmin(); this.navigate('admin-login'); },

  // ---------------- Trang chính sách (một trang, danh mục bên phải) ----------------
  pagePolicy: function(q) {
    const id = q.get('s') || POLICIES[0].id; const p = POLICIES.find(x => x.id === id) || POLICIES[0];
    return this.buyerShell(TPL.render('common/policy', { p }));
  },

  page403: function(kind) { return TPL.render('common/403', { spec: kind === 'specialist' }); },

  // ---------------- Trang bìa prototype ----------------
  pageHome: function() {
    const kim = Store.user('U101');
    const paidOrder = Store.orders().find(o => o.status === 'PAID' && o.phone === kim.phone) || Store.orders().find(o => o.status === 'PAID');
    return TPL.render('common/home', {
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
      g('A', [['buy', 'buy'], ['payment?state=demo', 'payment'], ['order-result?state=paid', 'order-result PAID'], ['order-result?state=reconcile', 'order-result chờ đối soát'], ['order-lookup', 'order-lookup'], ['login', 'login'], ['login?view=forgot', 'login quên MK'], ['register', 'register'], ['register?state=pending', 'register chờ duyệt'], ['register?state=rejected', 'register bị từ chối']]),
      g('C', [['dashboard', 'dashboard'], ['my-package', 'my-package'], ['wallet', 'wallet'], ['profile', 'Hồ sơ']]),
      g('D', [['admin-login', 'admin-login'], ['admin-dashboard', 'admin-dashboard'], ['agents', 'agents'], ['orders', 'orders'], ['products', 'products'], ['inventory', 'inventory'], ['ranks', 'ranks'], ['withdrawals', 'withdrawals'], ['registrations', 'registrations'], ['admin-users', 'admin-users'], ['403', '403']])
    ];
    const p = document.createElement('div'); p.id = 'demo-panel'; p.className = 'demo-panel';
    p.innerHTML = TPL.render('common/demo-nav', { groups });
    document.body.appendChild(p);
  }
};
document.addEventListener('DOMContentLoaded', () => App.boot());
