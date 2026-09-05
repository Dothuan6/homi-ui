/**
 * HOMI365 prototype v2 — router (hash) · khung layout 3 nhóm · guard phiên & vai trò · trang bìa
 *
 * Route: #r/{ref_code} · #p/{alias}  → điểm vào (LP-1) → A-01
 *        #A-01 … #A-06 · #C-01 … #C-03 · #C-PROFILE · #D-00 … #D-10 · #403 · #HOME
 */
const App = {
  timers: {}, current: '', _suppress: false,

  routes: {
    'HOME': () => App.pageHome(),
    'A-01': (q) => Buyer.A01(q), 'A-02': (q) => Buyer.A02(q), 'A-03': (q) => Buyer.A03(q), 'A-04': (q) => Buyer.A04(q), 'A-05': (q) => Buyer.A05(q), 'A-06': (q) => Buyer.A06(q),
    'C-01': (q) => Seller.C01(q), 'C-02': (q) => Seller.C02(q), 'C-03': (q) => Seller.C03(q), 'C-PROFILE': (q) => Seller.profile(q),
    'D-00': (q) => Admin.D00(q), 'D-01': (q) => Admin.D01(q), 'D-02': (q) => Admin.D02(q), 'D-03': (q) => Admin.D03(q), 'D-04': (q) => Admin.D04(q), 'D-05': (q) => Admin.D05(q),
    'D-06': (q) => Admin.D06(q), 'D-07': (q) => Admin.D07(q), 'D-08': (q) => Admin.D08(q), 'D-09': (q) => Admin.D09(q), 'D-10': (q) => Admin.D10(q),
    '403': () => App.page403(), 'STYLEGUIDE': () => { window.location.href = './styleguide.html'; }
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
    const opt = o || {}; const seller = Store.refSeller(); const cur = (this.current || '').split('?')[0];
    const nav = (code, label, ico) => `<a href="#${code}" class="${cur === code ? 'is-active' : ''}">${UI.icon(ico, 18)}<span>${label}</span></a>`;
    return `<div class="buyer">
      <header class="buyer-header"><div class="buyer-header-inner">
        <a href="#HOME" class="brand" aria-label="HOMI365 — trang giới thiệu">${UI.logo({ size: 34 })}</a>
        <nav class="buyer-nav" aria-label="Điều hướng">${nav('A-04', 'Tra cứu đơn hàng', 'search')}${nav('A-05', 'Đăng nhập thành viên', 'key')}</nav>
      </div></header>
      ${opt.showRef && seller ? `<div class="ref-bar">Người giới thiệu: <strong>${UI.esc(seller.fullName)}</strong> · mã <span class="mono">${UI.esc(seller.refCode)}</span></div>` : ''}
      <main class="buyer-main ${opt.narrow ? 'buyer-main-narrow' : ''}" id="buyer-main">${content}</main>
      <footer class="site-footer"><div class="site-footer-inner">
        <div>${UI.logo({ size: 28 })}<p class="mt-2">${UI.esc(CONFIG.brand.company)}</p><p>Hỗ trợ <strong>${UI.esc(CONFIG.brand.supportHotline)}</strong> · ${UI.esc(CONFIG.brand.supportHours)}</p></div>
        <div><div class="footer-title">Khách hàng</div><a href="#A-04">Tra cứu đơn hàng</a><a href="#A-05">Đăng nhập thành viên</a><a href="#A-06">Đăng ký thành viên</a><a href="#HOME">Trang giới thiệu prototype</a></div>
        <div><div class="footer-title">Quản trị</div><a href="#D-00">Đăng nhập quản trị</a><a href="./styleguide.html">Bộ thành phần giao diện</a></div>
      </div></footer>
    </div>`;
  },

  // ---------------- Khung thành viên ----------------
  sellerShell: function(active, content) {
    const u = Store.currentAgent();
    const nav = [['C-01', 'Tổng quan', 'home'], ['C-02', 'Gói của tôi', 'package'], ['C-03', 'Ví & rút tiền', 'wallet']];
    const link = () => nav.map(([code, label, ico]) => `<a href="#${code}" class="${active === code ? 'is-active' : ''}">${UI.icon(ico, 22)}<span>${label}</span></a>`).join('');
    return `<div class="seller">
      <header class="seller-header"><div class="seller-header-inner">
        <a href="#C-01" class="brand" aria-label="HOMI365">${UI.logo({ size: 34 })}</a>
        <nav class="seller-nav-top" aria-label="Điều hướng thành viên">${link()}</nav>
        <div class="seller-user">
          <button class="seller-user-btn" id="seller-user-btn" aria-haspopup="true" aria-expanded="false" onclick="App.toggleSellerMenu()"><span class="avatar" aria-hidden="true">${UI.esc(RULES.initials(u.fullName))}</span><span class="seller-user-name">${UI.esc(u.fullName)}</span>${UI.badge('rank', u.rank)}${UI.icon('chevron-down', 16)}</button>
          <div class="seller-menu" id="seller-menu" hidden>
            <div class="seller-menu-head"><div class="name">${UI.esc(u.fullName)}</div><div class="sub">${UI.esc(RULES.maskPhone(u.phone))} · ${UI.esc(u.refCode)}</div><div class="mt-1">${UI.badge('rank', u.rank)}</div></div>
            <a href="#C-PROFILE">${UI.icon('user', 18)} Hồ sơ của tôi</a>
            <button class="danger" onclick="App.logoutAgent()">${UI.icon('logout', 18)} Đăng xuất</button>
          </div>
        </div>
      </div></header>
      <main class="seller-main">${content}</main>
      <nav class="seller-nav-bottom" aria-label="Điều hướng thành viên">${link()}</nav>
    </div>`;
  },
  toggleSellerMenu: function(forceClose) { const m = document.getElementById('seller-menu'); const b = document.getElementById('seller-user-btn'); if (!m || !b) return; const open = forceClose ? false : m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', String(open)); if (open) { this._menuOut = (e) => { if (!document.getElementById('seller-menu') || !e.target.closest('.seller-user')) this.toggleSellerMenu(true); }; setTimeout(() => document.addEventListener('click', this._menuOut), 0); } else if (this._menuOut) { document.removeEventListener('click', this._menuOut); this._menuOut = null; } },
  logoutAgent: function() { Store.logoutAgent(); UI.toast('Đã đăng xuất.', 'info'); this.navigate('A-05'); },
  logoutSeller: function() { this.logoutAgent(); },

  // ---------------- Khung quản trị ----------------
  adminShell: function(active, title, content, o) {
    const opt = o || {}; const st = Store.adminStats(30); const me = Store.currentAdmin(); const head = me.role === 'HEAD';
    const badge = (n) => n ? `<span class="nav-badge">${n}</span>` : '';
    const item = (code, label, ico, b) => `<a href="#${code}" class="${active === code ? 'is-active' : ''}">${UI.icon(ico, 18)}<span>${label}</span>${b || `<span class="nav-code">${code}</span>`}</a>`;
    return `<div class="admin">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar-brand">${UI.logo({ size: 30, invert: true })}<span class="sub">Quản trị HOMI365</span></div>
        <nav class="admin-nav" aria-label="Menu quản trị">
          ${item('D-01', 'Tổng quan', 'home')}
          <div class="admin-nav-group">Vận hành</div>
          ${item('D-09', 'Duyệt đăng ký thành viên', 'user', badge(st.regPending))}
          ${item('D-07', 'Rút tiền & sổ hoa hồng', 'cash', badge(st.withdrawPending + st.withdrawApproved))}
          ${item('D-03', 'Đơn hàng & đối soát', 'inbox', badge(st.awaiting))}
          ${item('D-02', 'Thành viên', 'users')}
          ${item('D-05', 'Kho mã & thiết bị', 'key', st.stock <= CONFIG.stock.lowThreshold ? badge(st.stock) : '')}
          ${CONFIG.rules.onePackagePerPhone ? item('D-08', 'Cấp phát ngoại lệ', 'gift') : ''}
          <div class="admin-nav-group">Cấu hình</div>
          ${item('D-04', 'Sản phẩm & hoa hồng', 'package')}
          ${item('D-06', 'Hạng & quy tắc', 'settings')}
          ${head ? item('D-10', 'Tài khoản admin', 'shield') : ''}
        </nav>
        <div class="admin-sidebar-foot"><div class="who">${UI.esc(me.fullName || me.username)}</div><div class="role">${UI.esc(LABELS.role[me.role] ? LABELS.role[me.role].text : me.role)} · ${UI.esc(me.username)}</div>
          <button class="btn btn-sm btn-secondary" onclick="App.logoutAdmin()">${UI.icon('logout', 16)} Đăng xuất</button></div>
      </aside>
      <div class="admin-content">
        <div class="admin-topbar"><div class="row"><button class="btn btn-icon btn-secondary admin-menu-btn" aria-label="Mở menu" onclick="document.getElementById('admin-sidebar').classList.toggle('is-open')">${UI.icon('menu', 20)}</button><div><div class="crumb">${active}</div><h1>${title}</h1></div></div><div class="row">${opt.actions || ''}</div></div>
        <main class="admin-main">${content}</main>
      </div></div>`;
  },
  logoutAdmin: function() { Store.logoutAdmin(); this.navigate('D-00'); },

  page403: function(kind) {
    const spec = kind === 'specialist';
    return `<div class="error-page"><div class="card error-card"><div class="card-body stack">
      <div class="result-icon is-error" style="margin:0 auto">${UI.icon('ban', 36)}</div><div class="error-code">403 · FORBIDDEN</div>
      <h1>${spec ? 'Chỉ Head Admin mới truy cập được mục này' : 'Bạn không có quyền truy cập khu vực quản trị'}</h1>
      <p class="text-muted">${spec ? 'Quản lý tài khoản admin (D-10) thuộc quyền Head Admin. Tài khoản Admin Specialist của bạn không có quyền này.' : 'Phiên hiện tại là phiên thành viên. Khu vực quản trị yêu cầu tài khoản quản trị viên đăng nhập bằng tên đăng nhập và mật khẩu.'}</p>
      <div class="actions actions-row">${spec ? `<a class="btn btn-primary btn-lg" href="#D-01">Về tổng quan quản trị</a>` : `<a class="btn btn-secondary btn-lg" href="#C-01">Về Dashboard thành viên</a><a class="btn btn-primary btn-lg" href="#D-00">Đăng nhập quản trị</a>`}</div>
    </div></div></div>`;
  },

  // ---------------- Trang bìa prototype ----------------
  pageHome: function() {
    const an = Store.user('U001'); const kim = Store.user('U101'); const bao = Store.user('U102'); const paidOrder = Store.orders().find(o => o.status === 'PAID' && o.phone === kim.phone) || Store.orders().find(o => o.status === 'PAID');
    const card = (ico, title, desc, rows, actions) => `<div class="card"><div class="card-body"><div class="row mb-2"><span class="result-icon is-info" style="width:44px;height:44px;margin:0">${UI.icon(ico, 22)}</span><h2 style="font-size:var(--fs-lg)">${title}</h2></div><p class="text-sm text-muted">${desc}</p><dl class="dl dl-stack mt-3">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="actions">${actions}</div></div></div>`;
    const content = `<div class="stack-lg">
      <div class="text-center"><h1>Prototype giao diện HOMI365 · Medigo</h1><p class="text-muted mt-2">Bản mô phỏng luồng mua hàng, đăng ký & dashboard thành viên và quản trị (CHANGE SPEC v3). Dữ liệu mẫu lưu trên trình duyệt của bạn. Mã OTP dùng chung: <strong class="mono">${CONFIG.otp.mockCode}</strong>.</p></div>
      <div class="grid-2">
        ${card('users', 'Người mua', 'Vào bằng link giới thiệu hoặc link mua hàng cá nhân của thành viên. Họ tên · SĐT · email · địa chỉ → OTP → thanh toán → kết quả.',
          [['Link giới thiệu (ref_code)', `<span class="mono">${UI.esc(RULES.referralUrl(an.refCode))}</span>`], ['Link mua hàng cá nhân (alias)', `<span class="mono">${UI.esc(RULES.purchaseUrl(an.purchaseAlias))}</span>`], ['SĐT gây lỗi gửi SMS', `<span class="mono">${UI.esc(CONFIG.demo.smsErrorPhone)}</span>`]],
          `<a class="btn btn-primary btn-lg btn-block" href="${RULES.referralHash(an.refCode)}">${UI.icon('external', 18)} Mở link giới thiệu mẫu</a><a class="btn btn-secondary btn-block" href="${RULES.purchaseHash(an.purchaseAlias)}">Mở link mua hàng cá nhân ${UI.esc(an.purchaseAlias)}</a>`)}
        ${card('user', 'Đăng ký thành viên', 'Sau khi mua, người mua đăng ký thành viên (hồ sơ + T&C + OTP) và chờ admin duyệt 2 lớp. Chỉ người giới thiệu từ hạng Silver mới được tuyển.',
          [['Đã mua qua Lithium — đăng ký được', `<span class="mono">${UI.esc(kim.phone)}</span> · ${UI.esc(kim.fullName)}`], ['Đã mua qua Copper — bị chặn', `<span class="mono">${UI.esc(bao.phone)}</span> · ${UI.esc(bao.fullName)}`], ['Hồ sơ đang chờ duyệt (1/2)', `<span class="mono">0913000888</span>`], ['Hồ sơ bị từ chối', `<span class="mono">0914000999</span>`]],
          `<a class="btn btn-primary btn-lg btn-block" href="#A-06">${UI.icon('user', 18)} Đăng ký thành viên</a><a class="btn btn-secondary btn-block" href="#A-04">Tra cứu đơn hàng (mã đơn mẫu <span class="mono">${UI.esc(paidOrder ? paidOrder.id : '')}</span>)</a>`)}
        ${card('key', 'Thành viên', 'Đăng nhập bằng SĐT + mật khẩu (quên mật khẩu qua OTP). Dashboard: hạng & điểm, 2 link, thống kê, hoa hồng chênh lệch, F1, ví & rút tiền 1 lần/tháng.',
          [['Thành viên Lithium', `<span class="mono">${UI.esc(an.phone)}</span> / <span class="mono">${UI.esc(CONFIG.demo.agentPassword)}</span> · ${UI.esc(an.fullName)}`], ['Gold · Silver · Copper', `<span class="mono">0912345678</span> · <span class="mono">0933222111</span> · <span class="mono">0987654321</span> (cùng mật khẩu)`], ['Bị khoá', `<span class="mono">0977000111</span>`]],
          `<a class="btn btn-primary btn-lg btn-block" href="#A-05">${UI.icon('key', 18)} Đăng nhập thành viên</a>`)}
        ${card('shield', 'Quản trị', '2 vai trò: Admin Specialist (duyệt lớp 1/2) và Head Admin (tự chốt, quản lý tài khoản admin, chỉ định hạng, tạo thành viên gốc, chạy job xét hạng).',
          [['Head Admin', `<span class="mono">head</span> / <span class="mono">Homi@2026</span>`], ['Admin Specialist', `<span class="mono">admin</span> · <span class="mono">admin2</span> / <span class="mono">Homi@2026</span>`], ['Việc đang chờ', `${Store.registrations().filter(r => r.status.startsWith('PENDING')).length} đăng ký · ${Store.withdrawals().filter(w => w.status.startsWith('PENDING')).length} rút tiền · ${Store.orders().filter(o => o.status === 'AWAITING_RECONCILE').length} đối soát`]],
          `<a class="btn btn-primary btn-lg btn-block" href="#D-00">${UI.icon('shield', 18)} Đăng nhập quản trị</a>`)}
      </div>
      <div class="alert alert-neutral">${UI.icon('info', 18)}<div class="text-sm">Muốn xem lại từ đầu với dữ liệu gốc: <button class="btn-link" onclick="if (confirm('Nạp lại toàn bộ dữ liệu mẫu? Mọi thao tác đã làm sẽ mất.')) Store.reset()">nạp lại dữ liệu mẫu</button>. Bộ thành phần giao diện: <a href="./styleguide.html">styleguide</a>.</div></div>
    </div>`;
    return `<div class="buyer"><header class="buyer-header"><div class="buyer-header-inner">${UI.logo({ size: 34 })}<span class="text-sm text-muted">Prototype v2 · spec v3 · 05/09/2026</span></div></header><main class="buyer-main">${content}</main><footer class="buyer-footer">${UI.esc(CONFIG.brand.company)}</footer></div>`;
  },

  // ---------------- Demo navigator (F9) ----------------
  mountDemoNav: function() { if (document.getElementById('demo-fab')) return; const fab = document.createElement('button'); fab.id = 'demo-fab'; fab.className = 'demo-fab'; fab.textContent = 'Demo'; fab.onclick = () => this.toggleDemoNav(); document.body.appendChild(fab); document.addEventListener('keydown', (e) => { if (e.key === 'F9') this.toggleDemoNav(); }); },
  toggleDemoNav: function() {
    const ex = document.getElementById('demo-panel'); if (ex) { ex.remove(); return; }
    const groups = [
      ['Điểm vào', [['r/AN7K2Q', 'Link giới thiệu'], ['p/NVA3456', 'Link mua hàng cá nhân'], ['r/XXXXXX', 'Link không hợp lệ'], ['r/EM9QZT', 'Thành viên bị khoá']]],
      ['A', [['A-01', 'A-01'], ['A-02?state=demo', 'A-02'], ['A-03?state=paid', 'A-03 PAID'], ['A-03?state=reconcile', 'A-03 chờ đối soát'], ['A-04', 'A-04'], ['A-05', 'A-05'], ['A-05?view=forgot', 'A-05 quên MK'], ['A-06', 'A-06'], ['A-06?state=pending', 'A-06 chờ duyệt'], ['A-06?state=rejected', 'A-06 bị từ chối']]],
      ['C', [['C-01', 'C-01'], ['C-02', 'C-02'], ['C-03', 'C-03'], ['C-PROFILE', 'Hồ sơ']]],
      ['D', [['D-00', 'D-00'], ['D-01', 'D-01'], ['D-02', 'D-02'], ['D-03', 'D-03'], ['D-04', 'D-04'], ['D-05', 'D-05'], ['D-06', 'D-06'], ['D-07', 'D-07'], ['D-09', 'D-09'], ['D-10', 'D-10'], ['403', '403']]]
    ];
    const p = document.createElement('div'); p.id = 'demo-panel'; p.className = 'demo-panel';
    p.innerHTML = `<div class="row-between"><strong>Demo navigator</strong><button class="modal-close" aria-label="Đóng" onclick="App.toggleDemoNav()">${UI.icon('x', 18)}</button></div>${groups.map(([g, items]) => `<h4>${g}</h4>${items.map(([h, l]) => `<a class="demo-link" href="#${h}" onclick="App.toggleDemoNav()"><code>#${h.split('?')[0]}</code>${l}</a>`).join('')}`).join('')}
      <h4>Tiện ích</h4><a class="demo-link" href="javascript:void(0)" onclick="Store.loginAgentById('U001'); App.toggleDemoNav(); App.navigate('C-01')">Đăng nhập nhanh thành viên An</a><a class="demo-link" href="javascript:void(0)" onclick="Store.adminLogin('head','Homi@2026'); App.toggleDemoNav(); App.navigate('D-01')">Đăng nhập nhanh Head Admin</a><a class="demo-link" href="javascript:void(0)" onclick="Store.expireAgentSession(); App.toggleDemoNav(); App.navigate('C-01')">Giả lập hết phiên</a><a class="demo-link" href="javascript:void(0)" onclick="Store.otpResetAll(); UI.toast('Đã gỡ mọi khoá OTP.')">Gỡ khoá OTP</a><a class="demo-link text-error" href="javascript:void(0)" onclick="if (confirm('Nạp lại toàn bộ dữ liệu mẫu?')) Store.reset()">Nạp lại dữ liệu mẫu</a>`;
    document.body.appendChild(p);
  }
};
document.addEventListener('DOMContentLoaded', () => App.init());
