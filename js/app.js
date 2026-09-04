/**
 * HOMI365 prototype v2 — router (hash) · khung layout 3 nhóm · guard phiên · demo navigator
 *
 * Route: #r/{mã}  → điểm vào duy nhất (BR-01) → A-01
 *        #A-01 … #A-05 · #C-01 … #C-03 · #C-PROFILE · #D-00 … #D-08 · #403
 * Trạng thái phụ mock bằng query: #A-03?state=failed
 */
const App = {
  timers: {},
  current: '',
  _suppress: false,

  routes: {
    'A-01': (q) => Buyer.A01(q),
    'A-02': (q) => Buyer.A02(q),
    'A-03': (q) => Buyer.A03(q),
    'A-04': (q) => Buyer.A04(q),
    'A-05': (q) => Buyer.A05(q),
    'C-01': (q) => Seller.C01(q),
    'C-02': (q) => Seller.C02(q),
    'C-03': (q) => Seller.C03(q),
    'C-PROFILE': (q) => Seller.profile(q),
    'D-00': (q) => Admin.D00(q),
    'D-01': (q) => Admin.D01(q),
    'D-02': (q) => Admin.D02(q),
    'D-03': (q) => Admin.D03(q),
    'D-04': (q) => Admin.D04(q),
    'D-05': (q) => Admin.D05(q),
    'D-06': (q) => Admin.D06(q),
    'D-07': (q) => Admin.D07(q),
    'D-08': (q) => Admin.D08(q),
    'HOME': () => App.pageHome(),
    '403': () => App.page403(),
    'STYLEGUIDE': () => { window.location.href = './styleguide.html'; }
  },

  init: function() {
    window.addEventListener('hashchange', () => {
      if (this._suppress) { this._suppress = false; return; }
      this.render(window.location.hash.replace('#', ''));
    });
    const hash = window.location.hash.replace('#', '');
    this.render(hash || 'HOME');
    if (CONFIG.demo.navigator) this.mountDemoNav();
  },

  navigate: function(target, opts) {
    const o = opts || {};
    const next = '#' + target;
    if (window.location.hash !== next) {
      this._suppress = true;
      if (o.replace) { window.history.replaceState(null, '', next); this._suppress = false; }
      else window.location.hash = target;
    }
    this.render(target);
  },
  reload: function() { this.render(this.current); },

  render: function(target) {
    const root = document.getElementById('app-root'); if (!root) return;
    this.clearTimers(); UI.closeModal(); UI.closeDrawer();
    window.scrollTo(0, 0);
    this.current = target;

    // Điểm vào /r/{mã}
    if (/^r\//i.test(target)) {
      const code = target.slice(2).split('?')[0];
      const r = Store.captureRef(code);
      this.navigate(r.ok ? 'A-01' : 'A-01?state=' + (r.reason === 'locked' ? 'inactive' : 'invalid'), { replace: true });
      return;
    }

    const [base, qs] = target.split('?');
    const q = new URLSearchParams(qs || '');
    const route = this.routes[base];
    if (!route) { this.navigate('HOME', { replace: true }); return; }

    // Guard nhóm C: cần phiên seller (AC-12: hết phiên → A-05, sau đăng nhập quay lại)
    if (base.startsWith('C-')) {
      const seller = Store.currentSeller();
      if (!seller) {
        const had = Store.s().seller;
        this.navigate('A-05?next=' + encodeURIComponent(target) + (had ? '&reason=expired' : ''), { replace: true });
        return;
      }
    }
    // Guard nhóm D: cần phiên admin; phiên seller vào D → 403 (AC-11)
    if (base.startsWith('D-') && base !== 'D-00') {
      if (!Store.currentAdmin()) {
        if (Store.currentSeller()) { root.innerHTML = this.page403(); document.title = '403 · HOMI365'; return; }
        this.navigate('D-00?next=' + encodeURIComponent(target), { replace: true });
        return;
      }
    }
    root.innerHTML = route(q) || '';
    const h = root.querySelector('h1');
    document.title = (h ? h.textContent.trim() + ' · ' : '') + 'HOMI365';
    const fn = this._afterRender; this._afterRender = null; if (fn) fn();
  },
  /** View đăng ký hàm chạy sau khi HTML đã gắn vào DOM (mount OTP, countdown, nạp bảng…). */
  after: function(fn) { this._afterRender = fn; },

  clearTimer: function(name) { if (this.timers[name]) { clearInterval(this.timers[name]); clearTimeout(this.timers[name]); this.timers[name] = null; } },
  clearTimers: function() { Object.keys(this.timers).forEach(k => this.clearTimer(k)); },

  // ---------------- Khung layout ----------------
  buyerShell: function(content, o) {
    const opt = o || {};
    const seller = Store.refSeller();
    return `<div class="buyer">
      <header class="buyer-header"><div class="buyer-header-inner">
        <a href="#A-01" class="brand" onclick="event.preventDefault()" aria-label="HOMI365">${UI.logo({ size: 34 })}</a>
        ${opt.right || `<a class="btn btn-ghost btn-sm" href="#A-04">${UI.icon('search', 18)} Tra cứu đơn</a>`}
      </div></header>
      ${opt.showRef && seller ? `<div class="ref-bar">Người giới thiệu: <strong>${UI.esc(seller.fullName)}</strong> · mã <span class="mono">${UI.esc(seller.refCode)}</span></div>` : ''}
      <main class="buyer-main" id="buyer-main">${content}</main>
      <footer class="buyer-footer">${UI.esc(CONFIG.brand.company)} · Hỗ trợ ${UI.esc(CONFIG.brand.supportHotline)} (${UI.esc(CONFIG.brand.supportHours)})<br><a href="#HOME">Trang giới thiệu prototype</a> · <a href="#A-05">Đăng nhập seller</a> · <a href="#D-00">Quản trị</a></footer>
    </div>`;
  },

  sellerShell: function(active, content) {
    const u = Store.currentSeller();
    const nav = [['C-01', 'Tổng quan', 'home'], ['C-02', 'Gói của tôi', 'package'], ['C-03', 'Ví & rút tiền', 'wallet']];
    const link = (cls) => nav.map(([code, label, ico]) => `<a href="#${code}" class="${active === code ? 'is-active' : ''}">${UI.icon(ico, 22)}<span>${label}</span></a>`).join('');
    return `<div class="seller">
      <header class="seller-header"><div class="seller-header-inner">
        <a href="#C-01" class="brand" aria-label="HOMI365">${UI.logo({ size: 34 })}</a>
        <nav class="seller-nav-top" aria-label="Điều hướng seller">${link()}</nav>
        <div class="seller-user">
          <button class="seller-user-btn" id="seller-user-btn" aria-haspopup="true" aria-expanded="false" onclick="App.toggleSellerMenu()">
            <span class="avatar" aria-hidden="true">${UI.esc(RULES.initials(u.fullName))}</span><span class="seller-user-name">${UI.esc(u.fullName)}</span>${UI.icon('chevron-down', 16)}
          </button>
          <div class="seller-menu" id="seller-menu" hidden>
            <div class="seller-menu-head"><div class="name">${UI.esc(u.fullName)}</div><div class="sub">${UI.esc(RULES.maskPhone(u.phone))} · ${UI.esc(u.refCode)}</div></div>
            <a href="#C-PROFILE">${UI.icon('user', 18)} Hồ sơ của tôi</a>
            <button class="danger" onclick="App.logoutSeller()">${UI.icon('logout', 18)} Đăng xuất</button>
          </div>
        </div>
      </div></header>
      <main class="seller-main">${content}</main>
      <nav class="seller-nav-bottom" aria-label="Điều hướng seller">${link()}</nav>
    </div>`;
  },
  toggleSellerMenu: function(forceClose) {
    const m = document.getElementById('seller-menu'); const b = document.getElementById('seller-user-btn'); if (!m || !b) return;
    const open = forceClose ? false : m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', String(open));
    if (open) { this._menuOut = (e) => { if (!document.getElementById('seller-menu') || !e.target.closest('.seller-user')) this.toggleSellerMenu(true); }; setTimeout(() => document.addEventListener('click', this._menuOut), 0); }
    else if (this._menuOut) { document.removeEventListener('click', this._menuOut); this._menuOut = null; }
  },
  logoutSeller: function() { Store.logoutSeller(); UI.toast('Đã đăng xuất.', 'info'); this.navigate('A-05'); },

  adminShell: function(active, title, content, o) {
    const opt = o || {};
    const st = Store.adminStats(30);
    const badge = (n) => n ? `<span class="nav-badge">${n}</span>` : '';
    const item = (code, label, ico, b) => `<a href="#${code}" class="${active === code ? 'is-active' : ''}">${UI.icon(ico, 18)}<span>${label}</span>${b || `<span class="nav-code">${code}</span>`}</a>`;
    return `<div class="admin">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar-brand">${UI.logo({ size: 30, invert: true })}<span class="sub">Quản trị Medigo</span></div>
        <nav class="admin-nav" aria-label="Menu quản trị">
          ${item('D-01', 'Tổng quan', 'home')}
          <div class="admin-nav-group">Vận hành</div>
          ${item('D-03', 'Đơn hàng & đối soát', 'inbox', badge(st.awaiting))}
          ${item('D-02', 'Người dùng / seller', 'users')}
          ${item('D-05', 'Kho mã kích hoạt', 'key', st.stock <= CONFIG.stock.lowThreshold ? badge(st.stock) : '')}
          ${item('D-07', 'Duyệt hoa hồng & chi trả', 'cash', badge(st.withdrawPending + st.commissionPending))}
          ${item('D-08', 'Cấp phát ngoại lệ', 'gift')}
          <div class="admin-nav-group">Cấu hình</div>
          ${item('D-04', 'Gói sản phẩm', 'package')}
          ${item('D-06', 'Chính sách hoa hồng', 'settings')}
        </nav>
        <div class="admin-sidebar-foot"><div class="who">${UI.esc(Store.currentAdmin().username)}</div><div class="role">Quản trị viên</div>
          <button class="btn btn-sm btn-secondary" onclick="App.logoutAdmin()">${UI.icon('logout', 16)} Đăng xuất</button></div>
      </aside>
      <div class="admin-content">
        <div class="admin-topbar">
          <div class="row"><button class="btn btn-icon btn-secondary admin-menu-btn" aria-label="Mở menu" onclick="document.getElementById('admin-sidebar').classList.toggle('is-open')">${UI.icon('menu', 20)}</button>
            <div><div class="crumb">${active}</div><h1>${title}</h1></div></div>
          <div class="row">${opt.actions || ''}</div>
        </div>
        <main class="admin-main">${content}</main>
      </div>
    </div>`;
  },
  logoutAdmin: function() { Store.logoutAdmin(); this.navigate('D-00'); },


  // ---------------- Trang bìa prototype (không thuộc sản phẩm — chỉ để KH xem thử) ----------------
  pageHome: function() {
    const seller = Store.user('U001'); const buyer = Store.user('U101'); const paidOrder = Store.orders().find(o => o.status === 'PAID' && o.phone === buyer.phone) || Store.orders().find(o => o.status === 'PAID');
    const card = (ico, title, desc, rows, actions) => `<div class="card"><div class="card-body">
        <div class="row mb-2"><span class="result-icon is-info" style="width:44px;height:44px;margin:0">${UI.icon(ico, 22)}</span><h2 style="font-size:var(--fs-lg)">${title}</h2></div>
        <p class="text-sm text-muted">${desc}</p>
        <dl class="dl dl-stack mt-3">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
        <div class="actions">${actions}</div></div></div>`;
    const content = `<div class="stack-lg">
      <div class="text-center"><h1>Prototype giao diện HOMI365 · Medigo</h1><p class="text-muted mt-2">Bản mô phỏng luồng mua hàng, dashboard seller và quản trị. Dữ liệu là dữ liệu mẫu, lưu trên trình duyệt của bạn. Mã OTP dùng chung cho mọi bước: <strong class="mono">${CONFIG.otp.mockCode}</strong>.</p></div>
      <div class="grid-2">
        ${card('users', 'Người mua', 'Bắt đầu từ link giới thiệu của seller (điểm vào duy nhất). Hoàn tất OTP → chọn thanh toán → kết quả → tạo tài khoản seller.',
          [['Link giới thiệu mẫu', `<span class="mono">${UI.esc(RULES.referralUrl(seller.refCode))}</span>`], ['SĐT đã mua gói (bị chặn 1 gói/SĐT)', `<span class="mono">${UI.esc(buyer.phone)}</span>`], ['SĐT gây lỗi gửi SMS', `<span class="mono">${UI.esc(CONFIG.demo.smsErrorPhone)}</span>`]],
          `<a class="btn btn-primary btn-lg btn-block" href="${RULES.referralHash(seller.refCode)}">${UI.icon('external', 18)} Mở link giới thiệu mẫu</a><a class="btn btn-secondary btn-block" href="#A-01">Mở trực tiếp không có mã (BR-01)</a>`)}
        ${card('search', 'Tra cứu đơn hàng', 'Không cần đăng nhập. Tra bằng SĐT + OTP (thấy mã kích hoạt) hoặc bằng mã đơn (chỉ thấy trạng thái).',
          [['SĐT có đơn, chưa có tài khoản', `<span class="mono">${UI.esc(buyer.phone)}</span>`], ['Mã đơn mẫu', `<span class="mono">${UI.esc(paidOrder ? paidOrder.id : '')}</span>`]],
          `<a class="btn btn-primary btn-lg btn-block" href="#A-04">${UI.icon('search', 18)} Tra cứu đơn hàng</a>`)}
        ${card('key', 'Seller', 'Đăng nhập chỉ bằng SĐT + OTP. Dashboard: link & QR, thống kê, bảng kê hoa hồng, gói & mã kích hoạt, ví & rút tiền.',
          [['Seller đang hoạt động', `<span class="mono">${UI.esc(seller.phone)}</span> · ${UI.esc(seller.fullName)}`], ['Có đơn, chưa kích hoạt tài khoản', `<span class="mono">${UI.esc(buyer.phone)}</span>`], ['Seller bị khoá · chưa đăng ký', `<span class="mono">0977000111</span> · <span class="mono">0999999999</span>`], ['SĐT của admin (bị từ chối)', `<span class="mono">${UI.esc(CONFIG.demo.adminPhone)}</span>`]],
          `<a class="btn btn-primary btn-lg btn-block" href="#A-05">${UI.icon('key', 18)} Đăng nhập seller</a>`)}
        ${card('shield', 'Quản trị', 'Tài khoản riêng, đăng nhập bằng tên đăng nhập + mật khẩu. 9 màn: tổng quan, người dùng, đơn & đối soát, gói, kho mã, chính sách hoa hồng, duyệt chi trả, ngoại lệ.',
          [['Tài khoản', `<span class="mono">${UI.esc(CONFIG.admin.mockUser)}</span> / <span class="mono">${UI.esc(CONFIG.admin.mockPassword)}</span>`], ['Đơn chờ đối soát', `${Store.orders().filter(o => o.status === 'AWAITING_RECONCILE').length} đơn đang chờ tại D-03`]],
          `<a class="btn btn-primary btn-lg btn-block" href="#D-00">${UI.icon('shield', 18)} Đăng nhập quản trị</a>`)}
      </div>
      <div class="alert alert-neutral">${UI.icon('info', 18)}<div class="text-sm">Muốn xem lại từ đầu với dữ liệu gốc: <button class="btn-link" onclick="if (confirm('Nạp lại toàn bộ dữ liệu mẫu? Mọi thao tác đã làm sẽ mất.')) Store.reset()">nạp lại dữ liệu mẫu</button>. Bộ thành phần giao diện: <a href="./styleguide.html">styleguide</a>.</div></div>
    </div>`;
    return `<div class="buyer" style="--buyer-max: 960px">
      <header class="buyer-header"><div class="buyer-header-inner">${UI.logo({ size: 34 })}<span class="text-sm text-muted">Prototype v2 · 04/09/2026</span></div></header>
      <main class="buyer-main">${content}</main>
      <footer class="buyer-footer">${UI.esc(CONFIG.brand.company)}</footer></div>`;
  },

  // ---------------- Trang lỗi ----------------
  page403: function() {
    return `<div class="error-page"><div class="card error-card"><div class="card-body stack">
      <div class="result-icon is-error" style="margin:0 auto">${UI.icon('ban', 36)}</div>
      <div class="error-code">403 · FORBIDDEN</div>
      <h1>Bạn không có quyền truy cập khu vực quản trị</h1>
      <p class="text-muted">Phiên hiện tại là phiên seller. Khu vực quản trị yêu cầu tài khoản quản trị viên đăng nhập bằng tên đăng nhập và mật khẩu (BR-12).</p>
      <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#C-01">Về Dashboard Seller</a><a class="btn btn-primary btn-lg" href="#D-00">Đăng nhập quản trị</a></div>
    </div></div></div>`;
  },

  // ---------------- Demo navigator ----------------
  mountDemoNav: function() {
    if (document.getElementById('demo-fab')) return;
    const fab = document.createElement('button'); fab.id = 'demo-fab'; fab.className = 'demo-fab'; fab.textContent = 'Demo'; fab.setAttribute('aria-label', 'Mở bảng điều hướng demo');
    fab.onclick = () => this.toggleDemoNav();
    document.body.appendChild(fab);
    document.addEventListener('keydown', (e) => { if (e.key === 'F9') this.toggleDemoNav(); });
  },
  toggleDemoNav: function() {
    const ex = document.getElementById('demo-panel'); if (ex) { ex.remove(); return; }
    const seller = Store.user('U001'); const buyer = Store.user('U101');
    const groups = [
      ['Điểm vào', [['r/' + seller.refCode, 'Link giới thiệu hợp lệ (/r/' + seller.refCode + ')'], ['r/XXXXXX', 'Link không hợp lệ'], ['r/EM9QZT', 'Seller bị khoá'], ['A-01', 'A-01 không có mã (BR-01)']]],
      ['A · Người mua', [['A-01?state=form', 'A-01 form'], ['A-01?state=inactive-pkg', 'A-01 gói ngưng bán'], ['A-01?state=sms-error', 'A-01 SMS lỗi'], ['A-02?state=demo', 'A-02 thanh toán (tạo đơn demo)'], ['A-02?state=expired', 'A-02 hết hạn'], ['A-02?state=failed', 'A-02 thất bại'],
        ['A-03?state=paid', 'A-03 thành công'], ['A-03?state=later', 'A-03 để sau (SMS)'], ['A-03?state=failed', 'A-03 thất bại'], ['A-03?state=reconcile', 'A-03 chờ đối soát'], ['A-03?state=rejected', 'A-03 admin từ chối'], ['A-03?state=nocode', 'A-03 kho mã hết'],
        ['A-04', 'A-04 tra cứu (SĐT mẫu ' + buyer.phone + ')'], ['A-05', 'A-05 đăng nhập (seller ' + seller.phone + ')'], ['A-05?reason=expired&next=C-01', 'A-05 hết phiên']]],
      ['C · Seller', [['C-01', 'C-01 Tổng quan'], ['C-02', 'C-02 Gói & mã'], ['C-03', 'C-03 Ví & rút tiền'], ['C-PROFILE', 'Hồ sơ']]],
      ['D · Quản trị', [['D-00', 'D-00 Đăng nhập (admin / ' + CONFIG.admin.mockPassword + ')'], ['D-01', 'D-01 Tổng quan'], ['D-02', 'D-02 Người dùng'], ['D-03', 'D-03 Đơn & đối soát'], ['D-04', 'D-04 Gói'], ['D-05', 'D-05 Kho mã'], ['D-06', 'D-06 Chính sách'], ['D-07', 'D-07 Duyệt & chi trả'], ['D-08', 'D-08 Ngoại lệ'], ['403', 'Trang 403']]],
      ['Khác', [['STYLEGUIDE', 'Styleguide (design system)']]]
    ];
    const p = document.createElement('div'); p.id = 'demo-panel'; p.className = 'demo-panel';
    p.innerHTML = `<div class="row-between"><strong>Demo navigator</strong><button class="modal-close" aria-label="Đóng" onclick="App.toggleDemoNav()">${UI.icon('x', 18)}</button></div>
      ${groups.map(([g, items]) => `<h4>${g}</h4>${items.map(([h, l]) => `<a class="demo-link" href="#${h}" onclick="App.toggleDemoNav()"><code>#${h.split('?')[0]}</code>${l}</a>`).join('')}`).join('')}
      <h4>Tiện ích</h4>
      <a class="demo-link" href="javascript:void(0)" onclick="App.demoLoginSeller()">Đăng nhập nhanh seller (${UI.esc(seller.fullName)})</a>
      <a class="demo-link" href="javascript:void(0)" onclick="App.demoLoginAdmin()">Đăng nhập nhanh admin</a>
      <a class="demo-link" href="javascript:void(0)" onclick="Store.expireSellerSession(); App.toggleDemoNav(); App.navigate('C-01')">Giả lập hết phiên seller</a>
      <a class="demo-link" href="javascript:void(0)" onclick="Store.otpResetAll(); UI.toast('Đã gỡ mọi khoá OTP.')">Gỡ khoá OTP</a>
      <a class="demo-link text-error" href="javascript:void(0)" onclick="if (confirm('Nạp lại toàn bộ dữ liệu mẫu?')) Store.reset()">Nạp lại dữ liệu mẫu</a>
      <p class="text-caption mt-2">Phím F9 mở/đóng bảng này.</p>`;
    document.body.appendChild(p);
  },
  demoLoginSeller: function() { Store.loginSeller('U001', false); this.toggleDemoNav(); this.navigate('C-01'); },
  demoLoginAdmin: function() { Store.adminLogin(CONFIG.admin.mockUser, CONFIG.admin.mockPassword); this.toggleDemoNav(); this.navigate('D-01'); }
};

document.addEventListener('DOMContentLoaded', () => App.init());
