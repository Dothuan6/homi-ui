/**
 * Nhóm D · Quản trị — D-00 → D-08 (US-25 → US-36). Desktop-first, sidebar 220px.
 * Giả định (kế hoạch mục 6): D-07 gộp duyệt hoa hồng + rút tiền thành 2 tab.
 */
const Admin = {
  st: {
    period: 'month',
    users: { q: '', type: '', status: '', page: 1 },
    orders: { tab: 'all', q: '', status: '', page: 1 },
    codes: { q: '', status: '', page: 1 },
    d07: { tab: 'commission', cmStatus: 'PENDING', cmPage: 1, selected: [], wdStatus: '', wdPage: 1, wdSelected: [] }
  },

  // =====================================================================
  // D-00 · Đăng nhập quản trị
  // =====================================================================
  D00: function(q) {
    if (Store.currentAdmin()) { App.navigate(q.get('next') ? decodeURIComponent(q.get('next')) : 'D-01', { replace: true }); return ''; }
    this._next = q.get('next') ? decodeURIComponent(q.get('next')) : 'D-01';
    return `<div class="admin-login">
      <div class="admin-login-side">
        <div>${UI.logo({ size: 40, invert: true })}</div>
        <div><h2>Khu vực quản trị Medigo</h2><p>Đối soát đơn hàng, quản lý kho mã kích hoạt, chính sách hoa hồng và chi trả cho seller.</p></div>
        <p class="text-sm" style="color:var(--sky-200)">${UI.esc(CONFIG.brand.company)}</p>
      </div>
      <div class="admin-login-form"><div class="card"><div class="card-body">
        <div class="mb-4" style="display:none">${UI.logo({ size: 32 })}</div>
        <h1>Đăng nhập quản trị</h1><p class="text-muted mt-1 mb-4">Tài khoản do hệ thống cấp. Không tự đăng ký. Seller vui lòng đăng nhập tại <a href="#A-05">trang seller</a>.</p>
        <form novalidate onsubmit="Admin.login(event)">
          ${UI.field({ id: 'ad-user', label: 'Tên đăng nhập', required: true, attrs: 'autocomplete="username"' })}
          <div class="field mt-4" id="ad-pass-field"><label class="field-label" for="ad-pass">Mật khẩu<span class="req">*</span></label>
            <div class="input-affix"><input class="input" type="password" id="ad-pass" autocomplete="current-password" required><button type="button" class="btn btn-ghost affix-btn" aria-label="Hiện mật khẩu" onclick="UI.togglePassword('ad-pass', this)">${UI.icon('eye', 20)}</button></div>
            <div class="field-error" id="ad-pass-err"></div></div>
          <div id="ad-alert" class="mt-4" hidden></div>
          <div class="actions"><button class="btn btn-primary btn-lg btn-block" id="ad-submit">${UI.icon('lock', 18)} Đăng nhập</button></div>
        </form>
        <div class="demo-hint">Demo: <strong>${CONFIG.admin.mockUser}</strong> / <strong>${CONFIG.admin.mockPassword}</strong> · khoá tạm ${CONFIG.admin.lockMinutes} phút sau ${CONFIG.admin.maxLoginFail} lần sai</div>
      </div></div></div>
    </div>`;
  },
  login: function(e) {
    e.preventDefault();
    const user = UI.val('ad-user'); const pass = UI.val('ad-pass'); const box = document.getElementById('ad-alert');
    UI.setError('ad-user', ''); UI.setError('ad-pass', ''); box.hidden = true;
    let ok = true;
    if (!user) { UI.setError('ad-user', 'Vui lòng nhập tên đăng nhập.'); ok = false; }
    if (!pass) { UI.setError('ad-pass', 'Vui lòng nhập mật khẩu.'); ok = false; }
    if (!ok) { UI.focusFirstError(); return; }
    const btn = document.getElementById('ad-submit'); UI.setLoading(btn, true);
    setTimeout(() => {
      UI.setLoading(btn, false);
      const r = Store.adminLogin(user, pass);
      if (r.ok) { App.navigate(this._next || 'D-01'); return; }
      box.hidden = false;
      box.innerHTML = r.locked ? `<div class="alert alert-error" role="alert">${UI.icon('lock', 20)}<div><span class="alert-title">Tài khoản tạm khoá</span>Nhập sai quá ${CONFIG.admin.maxLoginFail} lần. Thử lại sau ${r.minutes} phút.</div></div>`
        : `<div class="alert alert-error" role="alert">${UI.icon('x-circle', 20)}<div>Tên đăng nhập hoặc mật khẩu không đúng. Còn ${r.remaining} lần thử.</div></div>`;
    }, 400);
  },

  periodDays: function() { return { week: 7, month: 30, quarter: 90 }[this.st.period] || 30; },
  periodSeg: function() { return `<div class="seg" role="group" aria-label="Kỳ">${CONFIG.periods.map(p => `<button class="${this.st.period === p.id ? 'is-active' : ''}" onclick="Admin.st.period='${p.id}'; App.reload()">${p.label}</button>`).join('')}</div>`; },

  // =====================================================================
  // D-01 · Tổng quan
  // =====================================================================
  D01: function() {
    const days = this.periodDays(); const s = Store.adminStats(days);
    const series = Store.adminSeries(days).map(x => ({ label: UI.dayLabel(x.date), bar: x.revenue / 1000000 }));
    const todo = [
      [s.awaiting, 'Đơn chuyển khoản chờ đối soát', 'Xác nhận để cấp mã và tính hoa hồng (BR-09)', 'D-03?tab=awaiting'],
      [s.withdrawPending, 'Yêu cầu rút tiền chờ duyệt', 'Đối chiếu số dư, duyệt hoặc từ chối', 'D-07?tab=withdraw'],
      [s.commissionPending, 'Khoản hoa hồng chờ duyệt', 'Duyệt theo lô sau holding period', 'D-07'],
      [s.lateCallbacks, 'Callback cổng đến sau khi đơn hết hạn', 'Cần kiểm tra thủ công (E3)', 'D-03?tab=late'],
      [s.licensePending, 'Đơn đã thanh toán chưa có mã', 'Kho mã hết — bổ sung mã để cấp', 'D-05'],
      [s.stock <= CONFIG.stock.lowThreshold ? 1 : 0, 'Kho mã sắp cạn', `Còn ${s.stock} mã, ngưỡng cảnh báo ${CONFIG.stock.lowThreshold}`, 'D-05']
    ].filter(t => t[0] > 0);
    const html = `<div class="stack-lg">
      <div class="row-between"><p class="text-muted">Số liệu ${days} ngày gần nhất</p>${this.periodSeg()}</div>
      <div class="stat-grid stat-grid-6">
        <div class="stat stat-navy"><div class="stat-label">${UI.icon('bars', 16)} Doanh thu</div><div class="stat-value">${UI.money(s.revenue)}</div><div class="stat-sub">${s.paid} đơn thanh toán</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('inbox', 16)} Số đơn</div><div class="stat-value">${UI.num(s.orders)}</div><div class="stat-sub">Tất cả trạng thái</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('users', 16)} Seller mới</div><div class="stat-value">${UI.num(s.newSellers)}</div></div>
        <div class="stat ${s.stock <= CONFIG.stock.lowThreshold ? 'stat-accent' : ''} stat-clickable" onclick="App.navigate('D-05')"><div class="stat-label">${UI.icon('key', 16)} Mã còn trong kho</div><div class="stat-value ${s.stock <= CONFIG.stock.lowThreshold ? 'text-warning' : ''}">${UI.num(s.stock)}</div><div class="stat-sub">${s.stock <= CONFIG.stock.lowThreshold ? 'Sắp cạn' : 'Đủ dùng'}</div></div>
        <div class="stat stat-clickable" onclick="App.navigate('D-03?tab=awaiting')"><div class="stat-label">${UI.icon('clock', 16)} Đơn chờ đối soát</div><div class="stat-value ${s.awaiting ? 'text-warning' : ''}">${UI.num(s.awaiting)}</div></div>
        <div class="stat stat-clickable" onclick="App.navigate('D-07?tab=withdraw')"><div class="stat-label">${UI.icon('cash', 16)} Rút tiền chờ duyệt</div><div class="stat-value ${s.withdrawPending ? 'text-warning' : ''}">${UI.num(s.withdrawPending)}</div></div>
      </div>
      <div class="split-2">
        <div class="card"><div class="card-head"><h2>Doanh thu theo ngày (triệu đồng)</h2></div><div class="card-body">${UI.chart.combo(series, { height: 240, barName: 'triệu đ', yFormat: (v) => Math.round(v), accent: true, aria: 'Doanh thu theo ngày' })}</div></div>
        <div class="card"><div class="card-head"><h2>Việc cần làm</h2><span class="badge badge-warning">${todo.length}</span></div><div class="card-body">
          ${todo.length ? `<ul class="todo-list">${todo.map(t => `<li><span class="todo-count">${t[0]}</span><div class="todo-text">${t[1]}<small>${t[2]}</small></div><a class="btn btn-secondary btn-sm" href="#${t[3]}">Xử lý ${UI.icon('arrow-right', 14)}</a></li>`).join('')}</ul>` : UI.empty('check-circle', 'Không có việc tồn đọng', 'Mọi đơn, yêu cầu rút tiền và hoa hồng đã được xử lý.')}
        </div></div>
      </div>
    </div>`;
    return App.adminShell('D-01', 'Tổng quan', html);
  },

  // =====================================================================
  // D-02 · Người dùng / seller
  // =====================================================================
  D02: function() {
    const f = this.st.users;
    const html = `<div class="card"><div class="card-body">
      <div class="table-toolbar">
        <div class="field field-search"><label class="field-label" for="u-q">Tìm kiếm</label><input class="input" id="u-q" placeholder="Tên, số điện thoại, mã giới thiệu" value="${UI.esc(f.q)}" oninput="Admin.st.users.q=this.value; Admin.st.users.page=1; Admin.renderUsers()"></div>
        <div class="field"><label class="field-label" for="u-type">Loại</label><select class="select" id="u-type" onchange="Admin.st.users.type=this.value; Admin.st.users.page=1; Admin.renderUsers()"><option value="">Tất cả</option><option value="seller" ${f.type === 'seller' ? 'selected' : ''}>Seller</option><option value="buyer" ${f.type === 'buyer' ? 'selected' : ''}>Người mua chưa tạo TK</option></select></div>
        <div class="field"><label class="field-label" for="u-status">Trạng thái</label><select class="select" id="u-status" onchange="Admin.st.users.status=this.value; Admin.st.users.page=1; Admin.renderUsers()"><option value="">Tất cả</option><option value="active" ${f.status === 'active' ? 'selected' : ''}>Đang hoạt động</option><option value="locked" ${f.status === 'locked' ? 'selected' : ''}>Đã khoá</option></select></div>
        <div class="toolbar-actions"><button class="btn btn-secondary" onclick="Admin.exportUsers()">${UI.icon('download', 16)} Xuất Excel</button></div>
      </div>
      <div id="u-table">${UI.skeletonTable(8, 6)}</div>
    </div></div>`;
    App.after(() => UI.withLoading('u-table', UI.skeletonTable(8, 6), () => this.renderUsers()));
    return App.adminShell('D-02', 'Người dùng / seller', html);
  },
  filteredUsers: function() {
    const f = this.st.users; const q = f.q.toLowerCase();
    return Store.users().filter(u => (!f.type || u.type === f.type) && (!f.status || u.status === f.status) && (!q || u.fullName.toLowerCase().includes(q) || u.phone.includes(q) || (u.refCode || '').toLowerCase().includes(q))).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  },
  renderUsers: function() {
    const el = document.getElementById('u-table'); if (!el) return;
    const list = this.filteredUsers(); const pg = UI.paginate(list, this.st.users.page);
    if (!list.length) { el.innerHTML = UI.empty('users', 'Không có người dùng phù hợp', 'Thử bỏ bớt bộ lọc.', `<button class="btn btn-secondary" onclick="Admin.st.users={q:'',type:'',status:'',page:1}; App.reload()">Xoá bộ lọc</button>`); return; }
    el.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Người dùng</th><th>Loại</th><th>Mã GT</th><th>Người giới thiệu</th><th class="num">Đơn</th><th class="num">Tuyến dưới</th><th>Tham gia</th><th>Trạng thái</th><th></th></tr></thead>
      <tbody>${pg.rows.map(u => { const ref = u.referrerId ? Store.user(u.referrerId) : null; return `<tr><td><span class="cell-main">${UI.esc(u.fullName)}</span><span class="cell-sub mono">${UI.esc(u.phone)}</span></td><td>${UI.badge('userType', u.type)}</td><td class="mono">${UI.esc(u.refCode || '—')}</td><td>${ref ? UI.esc(ref.fullName) + '<span class="cell-sub mono">' + UI.esc(ref.refCode) + '</span>' : '—'}</td><td class="num">${Store.ordersBySeller(u.id).filter(o => o.status === 'PAID').length}</td><td class="num">${Store.downline(u.id).length}</td><td>${UI.date(u.createdAt)}</td><td>${UI.badge('user', u.status)}</td><td><div class="row-actions"><button class="btn btn-secondary btn-sm" onclick="Admin.userDrawer('${u.id}')">Chi tiết</button></div></td></tr>`; }).join('')}</tbody></table></div>${UI.pagination(pg, 'Admin.gotoUsers')}`;
  },
  gotoUsers: function(p) { this.st.users.page = p; this.renderUsers(); },
  exportUsers: function() { UI.exportCsv('nguoi-dung.csv', ['Họ tên', 'SĐT', 'Loại', 'Mã GT', 'Người giới thiệu', 'Trạng thái', 'Tham gia'], this.filteredUsers().map(u => [u.fullName, u.phone, LABELS.userType[u.type].text, u.refCode || '', u.referrerId ? Store.user(u.referrerId).refCode : '', LABELS.user[u.status].text, UI.date(u.createdAt)])); },
  userDrawer: function(id) {
    const u = Store.user(id); const chain = u.referrerId ? Store.uplineChain(u.referrerId, 3) : []; const down = Store.downline(id);
    const orders = Store.ordersByPhone(u.phone); const sold = Store.ordersBySeller(id); const w = Store.wallet(id); const log = Store.logOf(id);
    UI.drawer({
      title: `<h2>${UI.esc(u.fullName)}</h2><div class="row-wrap mt-1">${UI.badge('userType', u.type)}${UI.badge('user', u.status)}<span class="text-sm text-muted mono">${UI.esc(u.id)}</span></div>`,
      body: `
        <div class="section"><div class="section-title">Hồ sơ</div><dl class="dl"><dt>Số điện thoại</dt><dd class="mono">${UI.esc(u.phone)}</dd><dt>Địa chỉ</dt><dd>${UI.esc(u.address || '—')}</dd><dt>CCCD</dt><dd class="mono">${u.cccd ? UI.esc(RULES.maskCccd(u.cccd)) : '—'}</dd><dt>Ngân hàng</dt><dd>${u.bank ? UI.esc(u.bank.bankName) + ' · <span class="mono">' + UI.esc(u.bank.accountNo) + '</span> · ' + UI.esc(u.bank.owner) : '—'}</dd><dt>Mã giới thiệu</dt><dd class="mono">${UI.esc(u.refCode || '—')}</dd><dt>Tham gia</dt><dd>${UI.dt(u.createdAt)}</dd>${u.status === 'locked' ? `<dt>Lý do khoá</dt><dd class="text-error">${UI.esc(u.lockedReason)} (${UI.dt(u.lockedAt)})</dd>` : ''}</dl></div>
        <div class="section"><div class="section-title">Tuyến trên</div>${chain.length ? `<ol class="stack-sm" style="padding-left:20px">${chain.map((c, i) => `<li>F${i + 1}: <strong>${UI.esc(c.fullName)}</strong> <span class="mono text-muted">${UI.esc(c.refCode)}</span> ${UI.badge('user', c.status)}</li>`).join('')}</ol>` : '<p class="text-muted">Không có (seller gốc)</p>'}</div>
        <div class="section"><div class="section-title">Tuyến dưới trực tiếp (${down.length})</div>${down.length ? `<div class="table-wrap"><table class="table" style="min-width:0"><thead><tr><th>Tên</th><th>Loại</th><th class="num">Đơn</th></tr></thead><tbody>${down.slice(0, 8).map(d => `<tr><td>${UI.esc(d.fullName)}<span class="cell-sub mono">${RULES.maskPhone(d.phone)}</span></td><td>${UI.badge('userType', d.type)}</td><td class="num">${Store.ordersBySeller(d.id).filter(o => o.status === 'PAID').length}</td></tr>`).join('')}</tbody></table></div>${down.length > 8 ? `<p class="text-caption mt-2">… và ${down.length - 8} người khác</p>` : ''}` : '<p class="text-muted">Chưa có</p>'}</div>
        <div class="section"><div class="section-title">Đơn hàng & hoa hồng</div><dl class="dl"><dt>Đơn đã mua</dt><dd>${orders.length} (${orders.filter(o => o.status === 'PAID').length} đã thanh toán)</dd><dt>Đơn giới thiệu</dt><dd>${sold.filter(o => o.status === 'PAID').length} đã thanh toán / ${sold.length}</dd><dt>Hoa hồng khả dụng</dt><dd>${UI.money(w.available)}</dd><dt>Hoa hồng chờ duyệt</dt><dd>${UI.money(w.pending)}</dd><dt>Đã rút</dt><dd>${UI.money(w.withdrawn)}</dd></dl>
          ${orders.length ? `<div class="mt-3 stack-sm">${orders.slice(0, 5).map(o => `<div class="row-between text-sm"><span class="mono">${UI.esc(o.id)}</span>${UI.badge('orderStatus', o.status)}<button class="btn-link" onclick="Admin.orderDrawer('${o.id}')">Xem</button></div>`).join('')}</div>` : ''}</div>
        <div class="section"><div class="section-title">Lịch sử hoạt động</div>${log.length ? `<ul class="timeline">${log.slice(0, 10).map(l => `<li><span class="timeline-time">${UI.dt(l.at)}</span><span class="timeline-text">${UI.esc(l.text)}</span></li>`).join('')}</ul>` : '<p class="text-muted">Chưa có</p>'}</div>`,
      foot: `${u.type !== 'seller' ? '' : `<button class="btn btn-secondary" onclick="Admin.changeReferrerModal('${u.id}')">${UI.icon('users', 16)} Đổi người giới thiệu</button>`}
        ${u.status === 'active' ? `<button class="btn btn-danger-outline" onclick="Admin.lockUser('${u.id}')">${UI.icon('lock', 16)} Khoá tài khoản</button>` : `<button class="btn btn-success" onclick="Admin.unlockUser('${u.id}')">${UI.icon('unlock', 16)} Mở khoá</button>`}`
    });
  },
  lockUser: function(id) {
    const u = Store.user(id);
    UI.confirm({ title: 'Khoá tài khoản?', body: `Seller <strong>${UI.esc(u.fullName)}</strong> sẽ không đăng nhập được, link giới thiệu <span class="mono">${UI.esc(u.refCode || '')}</span> ngừng nhận đơn mới. Hoa hồng đã ghi nhận không bị ảnh hưởng.`, reason: 'Lý do khoá', confirmText: 'Khoá tài khoản', tone: 'danger',
      onConfirm: (reason) => { Store.setUserStatus(id, 'locked', reason); UI.toast('Đã khoá tài khoản ' + u.fullName + '.'); this.renderUsers(); this.userDrawer(id); } });
  },
  unlockUser: function(id) { const u = Store.user(id); UI.confirm({ title: 'Mở khoá tài khoản?', body: `<strong>${UI.esc(u.fullName)}</strong> sẽ đăng nhập và nhận đơn trở lại.`, confirmText: 'Mở khoá', onConfirm: () => { Store.setUserStatus(id, 'active'); UI.toast('Đã mở khoá.'); this.renderUsers(); this.userDrawer(id); } }); },
  changeReferrerModal: function(id) {
    const u = Store.user(id); const cur = u.referrerId ? Store.user(u.referrerId) : null;
    UI.modal({ title: 'Đổi người giới thiệu', sticky: true,
      body: `<p class="text-muted">Người dùng: <strong>${UI.esc(u.fullName)}</strong> · hiện tại: ${cur ? UI.esc(cur.fullName) + ' (<span class="mono">' + UI.esc(cur.refCode) + '</span>)' : 'không có'}</p>
        <div class="alert alert-warning mt-3">${UI.icon('warning', 18)}<div class="text-sm">Chỉ ảnh hưởng đơn phát sinh <strong>sau</strong> thời điểm đổi. Tuyến của đơn đã tạo được khoá tại thời điểm mua (BR-07, US-15).</div></div>
        <div class="mt-4">${UI.field({ id: 'cr-code', label: 'Mã giới thiệu mới', required: true, mono: true, placeholder: 'VD: BINH88', attrs: 'autocapitalize="characters"' })}</div>
        <div class="mt-4">${UI.field({ id: 'cr-reason', label: 'Lý do', required: true, type: 'textarea', rows: 2 })}</div>`,
      foot: `<button class="btn btn-secondary" onclick="UI.closeModal()">Huỷ</button><button class="btn btn-primary" onclick="Admin.changeReferrer('${id}')">Xác nhận đổi</button>` });
  },
  changeReferrer: function(id) {
    const code = UI.val('cr-code').toUpperCase(); const reason = UI.val('cr-reason'); const ref = Store.sellerByRef(code);
    UI.setError('cr-code', ''); UI.setError('cr-reason', '');
    if (!ref) { UI.setError('cr-code', 'Không tìm thấy seller với mã này.'); return; }
    if (ref.id === id) { UI.setError('cr-code', 'Không thể tự giới thiệu chính mình.'); return; }
    if (!reason) { UI.setError('cr-reason', 'Vui lòng nhập lý do.'); return; }
    Store.changeReferrer(id, code, reason); UI.closeModal(); UI.toast('Đã đổi người giới thiệu sang ' + ref.fullName + '.'); this.renderUsers(); this.userDrawer(id);
  },

  // =====================================================================
  // D-03 · Đơn hàng & đối soát
  // =====================================================================
  D03: function(q) {
    if (q.get('tab')) { this.st.orders.tab = q.get('tab'); this.st.orders.page = 1; }
    const f = this.st.orders; const awaiting = Store.orders().filter(o => o.status === 'AWAITING_RECONCILE').length; const late = Store.orders().filter(o => o.flags && o.flags.lateCallback && !o.flags.lateChecked).length;
    const html = `<div class="card">
      <div class="tabs" role="tablist" style="padding:0 20px">
        <button class="tab ${f.tab === 'all' ? 'is-active' : ''}" onclick="Admin.st.orders.tab='all'; Admin.st.orders.page=1; App.reload()">Tất cả đơn</button>
        <button class="tab ${f.tab === 'awaiting' ? 'is-active' : ''}" onclick="Admin.st.orders.tab='awaiting'; Admin.st.orders.page=1; App.reload()">Chờ đối soát <span class="count">${awaiting}</span></button>
        <button class="tab ${f.tab === 'late' ? 'is-active' : ''}" onclick="Admin.st.orders.tab='late'; Admin.st.orders.page=1; App.reload()">Callback sau hết hạn <span class="count">${late}</span></button>
      </div>
      <div class="card-body">
        ${f.tab === 'awaiting' ? `<div class="alert alert-info mb-4">${UI.icon('info', 18)}<div class="text-sm">Đối chiếu sao kê ngân hàng theo <strong>nội dung CK = mã đơn</strong> và số tiền. Xác nhận → cấp mã kích hoạt + tính hoa hồng (BR-09). Từ chối → người mua thấy lý do tại A-03/A-04.</div></div>` : ''}
        <div class="table-toolbar">
          <div class="field field-search"><label class="field-label" for="o-q">Tìm kiếm</label><input class="input" id="o-q" placeholder="Mã đơn, tên, SĐT, mã giới thiệu" value="${UI.esc(f.q)}" oninput="Admin.st.orders.q=this.value; Admin.st.orders.page=1; Admin.renderOrders()"></div>
          ${f.tab === 'all' ? `<div class="field"><label class="field-label" for="o-status">Trạng thái thanh toán</label><select class="select" id="o-status" onchange="Admin.st.orders.status=this.value; Admin.st.orders.page=1; Admin.renderOrders()"><option value="">Tất cả (6 trạng thái)</option>${Object.keys(LABELS.orderStatus).map(k => `<option value="${k}" ${f.status === k ? 'selected' : ''}>${LABELS.orderStatus[k].text}</option>`).join('')}</select></div>` : ''}
          <div class="toolbar-actions"><button class="btn btn-secondary" onclick="Admin.exportOrders()">${UI.icon('download', 16)} Xuất Excel</button></div>
        </div>
        <div id="o-table">${UI.skeletonTable(8, 6)}</div>
      </div></div>`;
    App.after(() => UI.withLoading('o-table', UI.skeletonTable(8, 6), () => this.renderOrders()));
    return App.adminShell('D-03', 'Đơn hàng & đối soát', html);
  },
  filteredOrders: function() {
    const f = this.st.orders; const q = f.q.toLowerCase();
    return Store.orders().filter(o => {
      if (f.tab === 'awaiting' && o.status !== 'AWAITING_RECONCILE') return false;
      if (f.tab === 'late' && !(o.flags && o.flags.lateCallback)) return false;
      if (f.tab === 'all' && f.status && o.status !== f.status) return false;
      return !q || o.id.toLowerCase().includes(q) || o.fullName.toLowerCase().includes(q) || o.phone.includes(q) || (o.refCode || '').toLowerCase().includes(q);
    });
  },
  renderOrders: function() {
    const el = document.getElementById('o-table'); if (!el) return;
    const list = this.filteredOrders(); const pg = UI.paginate(list, this.st.orders.page);
    if (!list.length) { el.innerHTML = UI.empty('inbox', this.st.orders.tab === 'awaiting' ? 'Không có đơn chờ đối soát' : 'Không có đơn phù hợp', this.st.orders.tab === 'awaiting' ? 'Mọi đơn chuyển khoản đã được xử lý.' : 'Thử đổi bộ lọc hoặc từ khoá.'); return; }
    el.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Mã đơn</th><th>Người mua</th><th>Seller GT</th><th>Phương thức</th><th class="num">Số tiền</th><th>Thanh toán</th><th>Giao hàng</th><th>Mã KH</th><th></th></tr></thead>
      <tbody>${pg.rows.map(o => { const s = o.sellerId ? Store.user(o.sellerId) : null; return `<tr class="${o.status === 'AWAITING_RECONCILE' ? '' : ''}"><td><span class="cell-main mono">${UI.esc(o.id)}</span><span class="cell-sub">${UI.dt(o.createdAt)}</span></td><td><span class="cell-main">${UI.esc(o.fullName)}</span><span class="cell-sub mono">${UI.esc(o.phone)}</span></td><td>${s ? UI.esc(s.fullName) + '<span class="cell-sub mono">' + UI.esc(o.refCode) + '</span>' : '—'}</td><td>${UI.esc(LABELS.method[o.method] || '—')}</td><td class="num mono">${UI.money(o.price)}</td><td>${UI.badge('orderStatus', o.status)}${o.flags && o.flags.lateCallback && !o.flags.lateChecked ? '<span class="cell-sub text-warning">Callback muộn</span>' : ''}${o.refunded ? '<span class="cell-sub text-error">Đã hoàn tiền</span>' : ''}</td><td>${o.status === 'PAID' ? UI.badge('shipping', o.shipping) : '—'}</td><td>${o.status === 'PAID' ? (o.licenseCode ? UI.badge('license', Store.codeInfo(o.licenseCode) ? Store.codeInfo(o.licenseCode).status : 'ISSUED') : UI.badge('license', 'PENDING')) : '—'}</td>
        <td><div class="row-actions">${o.status === 'AWAITING_RECONCILE' ? `<button class="btn btn-success btn-sm" onclick="Admin.confirmReconcile('${o.id}')">Xác nhận</button><button class="btn btn-danger-outline btn-sm" onclick="Admin.rejectReconcile('${o.id}')">Từ chối</button>` : ''}<button class="btn btn-secondary btn-sm" onclick="Admin.orderDrawer('${o.id}')">Chi tiết</button></div></td></tr>`; }).join('')}</tbody></table></div>${UI.pagination(pg, 'Admin.gotoOrders')}`;
  },
  gotoOrders: function(p) { this.st.orders.page = p; this.renderOrders(); },
  exportOrders: function() { UI.exportCsv('don-hang.csv', ['Mã đơn', 'Ngày', 'Người mua', 'SĐT', 'Mã GT', 'Phương thức', 'Số tiền', 'Thanh toán', 'Giao hàng', 'Mã KH'], this.filteredOrders().map(o => [o.id, UI.dt(o.createdAt), o.fullName, o.phone, o.refCode || '', LABELS.method[o.method] || '', o.price, LABELS.orderStatus[o.status].text, RULES.shippingLabel(o.shipping), o.licenseCode || ''])); },
  confirmReconcile: function(id) {
    const o = Store.order(id);
    UI.confirm({ title: 'Xác nhận đã nhận chuyển khoản', body: 'Đơn chuyển sang <strong>Đã thanh toán</strong>, hệ thống cấp 1 mã kích hoạt từ kho và sinh hoa hồng theo chính sách hiện hành.',
      summary: [['Mã đơn', '<span class="mono">' + UI.esc(o.id) + '</span>'], ['Nội dung CK cần khớp', '<span class="mono">' + UI.esc(o.id) + '</span>'], ['Số tiền', UI.money(o.price)], ['Người mua', UI.esc(o.fullName) + ' · ' + UI.esc(o.phone)], ['Kho mã còn', Store.stockCount() + ' mã']],
      confirmText: 'Xác nhận đã nhận tiền', onConfirm: () => { const r = Store.confirmReconcile(id); UI.toast(r.licenseCode ? 'Đã xác nhận. Mã ' + r.licenseCode + ' đã cấp cho đơn.' : 'Đã xác nhận. Kho hết mã — đơn ở trạng thái chờ cấp mã.', r.licenseCode ? 'success' : 'warning'); App.reload(); } });
  },
  rejectReconcile: function(id) {
    const o = Store.order(id);
    UI.confirm({ title: 'Từ chối đối soát', body: `Đơn <span class="mono">${UI.esc(o.id)}</span> của ${UI.esc(o.fullName)} sẽ chuyển sang <strong>Bị từ chối</strong>. Người mua thấy lý do và hướng dẫn liên hệ hỗ trợ.`, reason: 'Lý do từ chối', confirmText: 'Từ chối', tone: 'danger',
      onConfirm: (reason) => { Store.rejectReconcile(id, reason); UI.toast('Đã từ chối đơn ' + id + '.', 'warning'); App.reload(); } });
  },
  orderDrawer: function(id) {
    const o = Store.order(id); const s = o.sellerId ? Store.user(o.sellerId) : null; const code = o.licenseCode ? Store.codeInfo(o.licenseCode) : null;
    const cms = Store.commissions().filter(c => c.orderId === id); const pkg = Store.pkg(o.packageId);
    const timeline = [[o.createdAt, 'Tạo đơn (PENDING_PAYMENT)' + (o.refCode ? ' qua link ' + o.refCode : '')]];
    if (o.transferClaimedAt) timeline.push([o.transferClaimedAt, 'Người mua bấm "Tôi đã chuyển khoản" → AWAITING_RECONCILE']);
    if (o.failedAt) timeline.push([o.failedAt, 'Cổng trả FAILED: ' + (o.failReason || '')]);
    if (o.paidAt) timeline.push([o.paidAt, (o.method === 'bank' ? 'Admin xác nhận đối soát → ' : 'Callback cổng → ') + 'PAID' + (o.flags && o.flags.lateCallback ? ' (sau khi đơn EXPIRED)' : '')]);
    if (o.reconciledAt && o.status === 'REJECTED') timeline.push([o.reconciledAt, 'Admin từ chối: ' + o.rejectReason]);
    if (code && code.issuedAt) timeline.push([code.issuedAt, 'Cấp mã kích hoạt ' + code.code]);
    if (code && code.device) timeline.push([code.device.boundAt, 'Kích hoạt trên ' + code.device.name]);
    (o.shippingLog || []).forEach(l => timeline.push([l.at, 'Giao hàng: ' + RULES.shippingLabel(l.step)]));
    if (o.refundedAt) timeline.push([o.refundedAt, 'Hoàn tiền — huỷ hoa hồng chưa chi']);
    timeline.sort((a, b) => a[0] < b[0] ? -1 : 1);
    const next = RULES.nextShippingStep(o.shipping);
    UI.drawer({
      title: `<h2 class="mono">${UI.esc(o.id)}</h2><div class="row-wrap mt-1">${UI.badge('orderStatus', o.status)}${o.status === 'PAID' ? UI.badge('shipping', o.shipping) : ''}${o.flags && o.flags.lateCallback ? '<span class="badge badge-warning">Callback muộn</span>' : ''}${o.refunded ? '<span class="badge badge-error">Đã hoàn tiền</span>' : ''}</div>`,
      body: `
        <div class="section"><div class="section-title">Đơn hàng</div><dl class="dl"><dt>Gói</dt><dd>${UI.esc(pkg.fullName)}</dd><dt>Số tiền</dt><dd>${UI.money(o.price)}</dd><dt>Phương thức</dt><dd>${UI.esc(LABELS.method[o.method] || '—')}</dd><dt>Tạo lúc</dt><dd>${UI.dt(o.createdAt)}</dd><dt>Hết hạn giữ</dt><dd>${UI.dt(o.expiresAt)}</dd>${o.paidAt ? `<dt>Thanh toán lúc</dt><dd>${UI.dt(o.paidAt)}</dd>` : ''}${o.policyVersion ? `<dt>Chính sách HH</dt><dd>v${o.policyVersion}</dd>` : ''}</dl></div>
        <div class="section"><div class="section-title">Người mua & giao hàng</div><dl class="dl"><dt>Họ tên</dt><dd>${UI.esc(o.fullName)}</dd><dt>SĐT</dt><dd class="mono">${UI.esc(o.phone)}</dd><dt>Địa chỉ</dt><dd>${UI.esc(o.address)}</dd><dt>Ghi chú</dt><dd>${UI.esc(o.note || '—')}</dd><dt>Seller giới thiệu</dt><dd>${s ? UI.esc(s.fullName) + ' · <span class="mono">' + UI.esc(o.refCode) + '</span>' : '—'}</dd></dl>
          ${o.status === 'PAID' && pkg.hasShipping ? `<div class="row-between mt-3"><span>Trạng thái giao hàng: ${UI.badge('shipping', o.shipping)}</span>${next ? `<button class="btn btn-primary btn-sm" onclick="Admin.updateShipping('${o.id}', '${next}')">${UI.icon('truck', 16)} Chuyển sang "${RULES.shippingLabel(next)}"</button>` : '<span class="text-sm text-success">Đã giao xong</span>'}</div>` : ''}</div>
        <div class="section"><div class="section-title">Mã kích hoạt</div>${code ? `<div class="code-box"><div class="grow"><span class="code-label">${UI.label('license', code.status)}</span><span class="code-value">${UI.esc(code.code)}</span></div><button class="btn btn-secondary btn-icon" aria-label="Sao chép" onclick="UI.copy('${code.code}')">${UI.icon('copy', 18)}</button></div>${code.device ? `<p class="text-sm text-muted mt-2">Thiết bị: ${UI.esc(code.device.name)} · <span class="mono">${UI.esc(code.device.deviceId)}</span> · ${UI.dt(code.device.boundAt)}</p>` : ''}` : (o.status === 'PAID' ? `<div class="alert alert-warning">${UI.icon('warning', 18)}<div class="text-sm">Đơn đã thanh toán nhưng chưa có mã (kho hết). <a href="#D-05">Bổ sung kho mã</a>.</div></div>` : '<p class="text-muted">Chưa cấp (đơn chưa thanh toán).</p>')}</div>
        <div class="section"><div class="section-title">Hoa hồng phát sinh (${cms.length})</div>${cms.length ? `<div class="table-wrap"><table class="table" style="min-width:0"><thead><tr><th>Tầng</th><th>Người thụ hưởng</th><th class="num">Số tiền</th><th>TT</th></tr></thead><tbody>${cms.map(c => `<tr><td>F${c.tier} (${RULES.formatPercent(c.rate)})</td><td>${UI.esc(Store.user(c.beneficiaryId).fullName)}</td><td class="num mono">${UI.money(c.amount)}</td><td>${UI.badge('commission', c.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-muted">Không có</p>'}</div>
        <div class="section"><div class="section-title">Dòng thời gian</div><ul class="timeline">${timeline.map(t => `<li><span class="timeline-time">${UI.dt(t[0])}</span><span class="timeline-text">${UI.esc(t[1])}</span></li>`).join('')}</ul></div>`,
      foot: `${o.status === 'AWAITING_RECONCILE' ? `<button class="btn btn-danger-outline" onclick="Admin.rejectReconcile('${o.id}')">Từ chối</button><button class="btn btn-success" onclick="Admin.confirmReconcile('${o.id}')">${UI.icon('check', 16)} Xác nhận đã nhận tiền</button>` : ''}
        ${o.flags && o.flags.lateCallback && !o.flags.lateChecked ? `<button class="btn btn-secondary" onclick="Store.clearLateFlag('${o.id}'); UI.toast('Đã đánh dấu kiểm tra.'); App.reload()">${UI.icon('check', 16)} Đã kiểm tra callback muộn</button>` : ''}
        ${o.status === 'PAID' && !o.refunded ? `<button class="btn btn-danger-outline" onclick="Admin.refundOrder('${o.id}')">Hoàn tiền & huỷ hoa hồng</button>` : ''}`
    });
  },
  updateShipping: function(id, step) { Store.updateShipping(id, step); UI.toast('Đã cập nhật giao hàng: ' + RULES.shippingLabel(step)); this.renderOrders(); this.orderDrawer(id); },
  refundOrder: function(id) {
    const cms = Store.commissions().filter(c => c.orderId === id && c.status !== 'PAID');
    UI.confirm({ title: 'Hoàn tiền đơn hàng?', body: `Đơn <span class="mono">${UI.esc(id)}</span> được đánh dấu hoàn tiền. ${cms.length} khoản hoa hồng chưa chi sẽ bị huỷ (US-16). Khoản đã chi cần xử lý thu hồi thủ công.`, reason: 'Lý do hoàn tiền', confirmText: 'Hoàn tiền', tone: 'danger',
      onConfirm: () => { Store.refundOrder(id); UI.toast('Đã hoàn tiền, huỷ ' + cms.length + ' khoản hoa hồng.', 'warning'); App.reload(); } });
  },

  // =====================================================================
  // D-04 · Gói sản phẩm
  // =====================================================================
  D04: function() {
    const list = Store.packages();
    const html = `<div class="stack-lg">
      <div class="alert alert-info">${UI.icon('info', 18)}<div class="text-sm">Kiến trúc hỗ trợ nhiều gói; giai đoạn này chỉ <strong>1 gói bật bán</strong> tại một thời điểm. Giá của đơn được khoá tại thời điểm tạo đơn (BR-04).</div></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Tên gói</th><th class="num">Giá</th><th>License</th><th>Giao hàng</th><th>Quyền lợi</th><th>Cập nhật</th><th>Bán</th><th></th></tr></thead>
        <tbody>${list.map(p => `<tr><td class="mono text-strong">${UI.esc(p.id)}</td><td><span class="cell-main">${UI.esc(p.name)}</span><span class="cell-sub">${UI.esc(p.desc).slice(0, 80)}…</span></td><td class="num mono">${UI.money(p.price)}</td><td>${p.licenseMonths} tháng</td><td>${p.hasShipping ? 'Có' : 'Không'}</td><td>${p.benefits.length} mục</td><td>${UI.date(p.updatedAt)}</td><td>${p.active ? '<span class="badge badge-success">Đang bán</span>' : '<span class="badge badge-neutral">Tắt</span>'}</td>
          <td><div class="row-actions"><button class="btn btn-secondary btn-sm" onclick="Admin.packageForm('${p.id}')">${UI.icon('edit', 14)} Sửa</button>${p.active ? `<button class="btn btn-danger-outline btn-sm" onclick="Admin.togglePackage('${p.id}', false)">Tắt bán</button>` : `<button class="btn btn-success btn-sm" onclick="Admin.togglePackage('${p.id}', true)">Bật bán</button>`}</div></td></tr>`).join('')}</tbody></table></div>
    </div>`;
    return App.adminShell('D-04', 'Gói sản phẩm', html, { actions: `<button class="btn btn-primary" onclick="Admin.packageForm()">${UI.icon('plus', 16)} Thêm gói</button>` });
  },
  togglePackage: function(id, active) {
    const p = Store.pkg(id);
    UI.confirm({ title: active ? 'Bật bán gói?' : 'Tắt bán gói?', body: active ? `Gói <strong>${UI.esc(p.name)}</strong> sẽ hiển thị trên trang mua hàng. Gói đang bật khác (nếu có) sẽ tự tắt.` : `Người mua mở link giới thiệu sẽ thấy "Sản phẩm tạm ngưng bán" cho đến khi bật lại.`, confirmText: active ? 'Bật bán' : 'Tắt bán', tone: active ? '' : 'danger',
      onConfirm: () => { Store.togglePackage(id, active); UI.toast(active ? 'Đã bật bán ' + p.name : 'Đã tắt bán ' + p.name); App.reload(); } });
  },
  packageForm: function(id) {
    const p = id ? Store.pkg(id) : { id: '', name: '', fullName: '', desc: '', price: 0, licenseMonths: 12, hasShipping: true, active: false, benefits: [] };
    UI.modal({ title: id ? 'Sửa gói ' + id : 'Thêm gói sản phẩm', size: 'lg', sticky: true,
      body: `<form id="pk-form" class="form-grid form-grid-2" novalidate>
        ${UI.field({ id: 'pk-id', label: 'Mã gói', required: true, mono: true, value: p.id, attrs: id ? 'readonly' : '' })}
        ${UI.field({ id: 'pk-name', label: 'Tên gói', required: true, value: p.name })}
        ${UI.field({ id: 'pk-price', label: 'Giá (đ)', required: true, mono: true, value: p.price, attrs: 'inputmode="numeric"' })}
        ${UI.field({ id: 'pk-months', label: 'Thời hạn license (tháng)', required: true, mono: true, value: p.licenseMonths, attrs: 'inputmode="numeric"' })}
        <div style="grid-column:1/-1">${UI.field({ id: 'pk-full', label: 'Tên đầy đủ hiển thị', required: true, value: p.fullName })}</div>
        <div style="grid-column:1/-1">${UI.field({ id: 'pk-desc', label: 'Mô tả', type: 'textarea', rows: 2, value: p.desc })}</div>
        <div style="grid-column:1/-1">${UI.field({ id: 'pk-benefits', label: 'Quyền lợi (mỗi dòng một mục)', type: 'textarea', rows: 4, value: p.benefits.join('\n') })}</div>
        <label class="check"><input type="checkbox" id="pk-ship" ${p.hasShipping ? 'checked' : ''}> Có giao hàng vật lý (thiết bị)</label>
      </form>`,
      foot: `<button class="btn btn-secondary" onclick="UI.closeModal()">Huỷ</button><button class="btn btn-primary" onclick="Admin.savePackage(${id ? 'true' : 'false'})">Lưu</button>` });
  },
  savePackage: function(editing) {
    const id = UI.val('pk-id').toUpperCase(); const name = UI.val('pk-name'); const price = Number(UI.val('pk-price').replace(/\D/g, '')); const months = Number(UI.val('pk-months'));
    ['pk-id', 'pk-name', 'pk-price', 'pk-months', 'pk-full'].forEach(x => UI.setError(x, ''));
    let ok = true;
    if (!/^[A-Z0-9]{2,10}$/.test(id)) { UI.setError('pk-id', 'Mã gói 2–10 ký tự chữ/số.'); ok = false; }
    if (!editing && Store.pkg(id)) { UI.setError('pk-id', 'Mã gói đã tồn tại.'); ok = false; }
    if (!name) { UI.setError('pk-name', 'Nhập tên gói.'); ok = false; }
    if (!(price > 0)) { UI.setError('pk-price', 'Giá phải lớn hơn 0.'); ok = false; }
    if (!(months > 0)) { UI.setError('pk-months', 'Thời hạn phải lớn hơn 0.'); ok = false; }
    if (!UI.val('pk-full')) { UI.setError('pk-full', 'Nhập tên đầy đủ.'); ok = false; }
    if (!ok) return;
    const existing = Store.pkg(id) || { active: false };
    Store.savePackage({ id, name, fullName: UI.val('pk-full'), desc: UI.val('pk-desc'), price, licenseMonths: months, hasShipping: document.getElementById('pk-ship').checked, active: existing.active, benefits: UI.val('pk-benefits').split('\n').map(s => s.trim()).filter(Boolean) });
    UI.closeModal(); UI.toast('Đã lưu gói ' + id + '.'); App.reload();
  },

  // =====================================================================
  // D-05 · Kho mã kích hoạt
  // =====================================================================
  D05: function() {
    const codes = Store.codes(); const f = this.st.codes;
    const cnt = { IN_STOCK: 0, ISSUED: 0, BOUND: 0 }; codes.forEach(c => { cnt[c.status] = (cnt[c.status] || 0) + 1; });
    const low = cnt.IN_STOCK <= CONFIG.stock.lowThreshold; const pendingOrders = Store.orders().filter(o => o.status === 'PAID' && !o.licenseCode).length;
    const html = `<div class="stack-lg">
      ${low ? `<div class="alert alert-warning" role="alert">${UI.icon('warning', 20)}<div><span class="alert-title">Kho mã sắp cạn</span>Còn ${cnt.IN_STOCK} mã trong kho (ngưỡng cảnh báo ${CONFIG.stock.lowThreshold}). Sinh thêm hoặc nhập file để tránh đơn thanh toán không có mã.</div></div>` : ''}
      ${pendingOrders ? `<div class="alert alert-error" role="alert">${UI.icon('alert-octagon', 20)}<div class="row-between grow"><span><span class="alert-title">${pendingOrders} đơn đã thanh toán đang chờ cấp mã</span>Bổ sung kho rồi bấm cấp mã.</span><button class="btn btn-primary btn-sm" ${cnt.IN_STOCK ? '' : 'disabled'} onclick="UI.toast('Đã cấp mã cho ' + Store.fulfilPendingLicenses() + ' đơn.'); App.reload()">Cấp mã cho đơn chờ</button></div></div>` : ''}
      <div class="stat-grid stat-grid-4">
        <div class="stat ${low ? 'stat-accent' : ''}"><div class="stat-label">${UI.icon('key', 16)} Trong kho</div><div class="stat-value ${low ? 'text-warning' : ''}">${UI.num(cnt.IN_STOCK)}</div><div class="progress mt-2 ${low ? 'is-low' : ''}"><span style="width:${Math.min(100, Math.round(cnt.IN_STOCK / Math.max(1, codes.length) * 100))}%"></span></div></div>
        <div class="stat"><div class="stat-label">${UI.icon('sms', 16)} Đã cấp (chưa kích hoạt)</div><div class="stat-value">${UI.num(cnt.ISSUED)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('device', 16)} Đã kích hoạt (bind)</div><div class="stat-value">${UI.num(cnt.BOUND)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('layers', 16)} Tổng mã</div><div class="stat-value">${UI.num(codes.length)}</div><div class="stat-sub">${[...new Set(codes.map(c => c.batch))].length} lô</div></div>
      </div>
      <div class="card"><div class="card-body">
        <div class="table-toolbar">
          <div class="field field-search"><label class="field-label" for="k-q">Tìm mã / mã đơn / lô</label><input class="input input-mono" id="k-q" value="${UI.esc(f.q)}" oninput="Admin.st.codes.q=this.value; Admin.st.codes.page=1; Admin.renderCodes()"></div>
          <div class="field"><label class="field-label" for="k-status">Trạng thái</label><select class="select" id="k-status" onchange="Admin.st.codes.status=this.value; Admin.st.codes.page=1; Admin.renderCodes()"><option value="">Tất cả</option>${['IN_STOCK', 'ISSUED', 'BOUND'].map(k => `<option value="${k}" ${f.status === k ? 'selected' : ''}>${LABELS.license[k].text}</option>`).join('')}</select></div>
          <div class="toolbar-actions"><button class="btn btn-secondary" onclick="Admin.exportCodes()">${UI.icon('download', 16)} Xuất Excel</button></div>
        </div>
        <div id="k-table">${UI.skeletonTable(6, 6)}</div>
      </div></div></div>`;
    App.after(() => UI.withLoading('k-table', UI.skeletonTable(6, 6), () => this.renderCodes()));
    return App.adminShell('D-05', 'Kho mã kích hoạt', html, { actions: `<button class="btn btn-secondary" onclick="Admin.importModal()">${UI.icon('upload', 16)} Nhập file</button><button class="btn btn-primary" onclick="Admin.generateModal()">${UI.icon('plus', 16)} Sinh hàng loạt</button>` });
  },
  filteredCodes: function() { const f = this.st.codes; const q = f.q.toLowerCase(); return Store.codes().filter(c => (!f.status || c.status === f.status) && (!q || c.code.toLowerCase().includes(q) || (c.orderId || '').toLowerCase().includes(q) || c.batch.toLowerCase().includes(q))).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderCodes: function() {
    const el = document.getElementById('k-table'); if (!el) return;
    const list = this.filteredCodes(); const pg = UI.paginate(list, this.st.codes.page);
    if (!list.length) { el.innerHTML = UI.empty('key', 'Không có mã phù hợp'); return; }
    el.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Mã kích hoạt</th><th>Trạng thái</th><th>Lô</th><th>Đơn / ngoại lệ</th><th>Thiết bị</th><th>Thời điểm</th></tr></thead>
      <tbody>${pg.rows.map(c => `<tr><td class="mono text-strong">${UI.esc(c.code)}</td><td>${UI.badge('license', c.status)}</td><td class="mono">${UI.esc(c.batch)}</td><td>${c.orderId ? (Store.order(c.orderId) ? `<button class="btn-link mono" onclick="Admin.orderDrawer('${c.orderId}')">${UI.esc(c.orderId)}</button>` : '<span class="mono">' + UI.esc(c.orderId) + '</span>') : '—'}</td><td>${c.device ? UI.esc(c.device.name) + '<span class="cell-sub mono">' + UI.esc(c.device.deviceId) + '</span>' : '—'}</td><td>${c.device ? UI.dt(c.device.boundAt) : c.issuedAt ? UI.dt(c.issuedAt) : UI.dt(c.createdAt)}</td></tr>`).join('')}</tbody></table></div>${UI.pagination(pg, 'Admin.gotoCodes')}`;
  },
  gotoCodes: function(p) { this.st.codes.page = p; this.renderCodes(); },
  exportCodes: function() { UI.exportCsv('kho-ma.csv', ['Mã', 'Trạng thái', 'Lô', 'Đơn', 'Thiết bị', 'Mã máy', 'Thời điểm'], this.filteredCodes().map(c => [c.code, LABELS.license[c.status].text, c.batch, c.orderId || '', c.device ? c.device.name : '', c.device ? c.device.deviceId : '', UI.dt(c.device ? c.device.boundAt : (c.issuedAt || c.createdAt))])); },
  generateModal: function() {
    UI.modal({ title: 'Sinh mã hàng loạt', sticky: true, body: `${UI.field({ id: 'gen-n', label: 'Số lượng mã', required: true, mono: true, value: 50, hint: 'Định dạng ' + CONFIG.stock.codePrefix + '-XXXX-XXXX-XXXX, đảm bảo không trùng.', attrs: 'inputmode="numeric" min="1" max="1000"' })}`,
      foot: `<button class="btn btn-secondary" onclick="UI.closeModal()">Huỷ</button><button class="btn btn-primary" onclick="Admin.generate()">Sinh mã</button>` });
  },
  generate: function() {
    const n = Number(UI.val('gen-n')); UI.setError('gen-n', '');
    if (!(n >= 1 && n <= 1000)) { UI.setError('gen-n', 'Nhập số từ 1 đến 1000.'); return; }
    UI.closeModal();
    UI.confirm({ title: 'Xác nhận sinh mã', body: `Sinh <strong>${n}</strong> mã kích hoạt mới vào kho (một lô mới).`, confirmText: 'Sinh ' + n + ' mã', onConfirm: () => { const b = Store.generateCodes(n); UI.toast('Đã sinh ' + n + ' mã, lô ' + b + '.'); App.reload(); } });
  },
  importModal: function() {
    UI.modal({ title: 'Nhập mã từ file', sticky: true,
      body: `<div class="dropzone" onclick="document.getElementById('imp-file').click()">${UI.icon('upload', 28)}<div class="mt-2">Chọn file .csv / .txt (mỗi dòng một mã)</div><input type="file" id="imp-file" accept=".csv,.txt" hidden onchange="Admin.readImportFile(this)"></div>
        <div class="mt-4">${UI.field({ id: 'imp-text', label: 'Hoặc dán danh sách mã', type: 'textarea', rows: 5, placeholder: 'HOMI-AB12-CD34-EF56\nHOMI-…' })}</div>`,
      foot: `<button class="btn btn-secondary" onclick="UI.closeModal()">Huỷ</button><button class="btn btn-primary" onclick="Admin.importCodes()">Nhập vào kho</button>` });
  },
  readImportFile: function(input) { const f = input.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { document.getElementById('imp-text').value = String(r.result); }; r.readAsText(f); },
  importCodes: function() {
    const list = UI.val('imp-text').split(/[\s,;]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    UI.setError('imp-text', '');
    const bad = list.filter(c => !/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/.test(c));
    if (!list.length) { UI.setError('imp-text', 'Chưa có mã nào.'); return; }
    if (bad.length) { UI.setError('imp-text', bad.length + ' mã sai định dạng, ví dụ: ' + bad[0]); return; }
    const r = Store.importCodes(list); UI.closeModal(); UI.toast(`Đã nhập ${r.added} mã (bỏ qua ${r.skipped} trùng), lô ${r.batch}.`); App.reload();
  },

  // =====================================================================
  // D-06 · Chính sách hoa hồng
  // =====================================================================
  D06: function() {
    const pols = Store.policies(); const cur = Store.currentPolicy();
    const draft = this._policyDraft || { tiers: cur.tiers.map(t => ({ ...t })), condition: cur.condition, holdingDays: cur.holdingDays, minWithdraw: cur.minWithdraw, effectiveFrom: new Date(Date.now() + 86400000).toISOString().slice(0, 10), note: '' };
    this._policyDraft = draft;
    const html = `<div class="split-2">
      <div class="card"><div class="card-head"><h2>Phiên bản mới (từ v${cur.version})</h2><span class="badge badge-info">Đang áp dụng: v${cur.version} · tổng ${RULES.formatPercent(RULES.totalRate(cur))}</span></div>
        <div class="card-body">
          <form novalidate onsubmit="Admin.savePolicy(event)">
            <div class="field-label mb-2">Tỉ lệ từng tầng (% giá trị đơn)</div>
            <div class="tier-rows" id="tier-rows">${draft.tiers.map((t, i) => `<div class="tier-row"><span class="tier-name">F${i + 1}</span><div class="input-affix"><input class="input input-mono" type="number" step="0.5" min="0" max="100" id="tier-${i}" value="${(t.rate * 100).toFixed(1).replace('.0', '')}" aria-label="Tỉ lệ tầng F${i + 1}"><span class="affix-btn text-muted" style="display:inline-flex;align-items:center;justify-content:center">%</span></div><button type="button" class="btn btn-secondary btn-icon" aria-label="Xoá tầng F${i + 1}" ${draft.tiers.length <= 1 ? 'disabled' : ''} onclick="Admin.tierRemove(${i})">${UI.icon('minus', 16)}</button></div>`).join('')}</div>
            <button type="button" class="btn btn-ghost btn-sm mt-2" onclick="Admin.tierAdd()">${UI.icon('plus', 16)} Thêm tầng</button>
            <div class="field-error" id="tier-err"></div>
            <div class="form-grid form-grid-2 mt-6">
              ${UI.field({ id: 'pl-cond', label: 'Điều kiện phát sinh', type: 'select', value: draft.condition, options: [{ value: 'PAID', label: 'Đơn thanh toán thành công (PAID)' }, { value: 'DELIVERED', label: 'Đơn đã giao hàng' }, { value: 'BOUND', label: 'Mã đã kích hoạt trên thiết bị' }] })}
              ${UI.field({ id: 'pl-hold', label: 'Holding period (ngày)', required: true, mono: true, value: draft.holdingDays, hint: 'Sau số ngày này hoa hồng mới được duyệt', attrs: 'inputmode="numeric"' })}
              ${UI.field({ id: 'pl-min', label: 'Ngưỡng rút tối thiểu (đ)', required: true, mono: true, value: draft.minWithdraw, attrs: 'inputmode="numeric"' })}
              ${UI.field({ id: 'pl-eff', label: 'Ngày hiệu lực', required: true, type: 'date', value: draft.effectiveFrom, hint: 'Đơn tạo từ ngày này áp dụng phiên bản mới' })}
            </div>
            <div class="mt-4">${UI.field({ id: 'pl-note', label: 'Ghi chú phiên bản', type: 'textarea', rows: 2, value: draft.note, placeholder: 'Lý do thay đổi…' })}</div>
            <div class="actions actions-row"><button type="button" class="btn btn-secondary btn-lg" onclick="Admin._policyDraft=null; App.reload()">Đặt lại</button><button class="btn btn-primary btn-lg">${UI.icon('check', 18)} Lưu phiên bản mới</button></div>
          </form>
        </div></div>
      <div class="card"><div class="card-head"><h2>Lịch sử phiên bản</h2></div><div class="card-body">
        ${pols.map((p, i) => { const prev = pols[i + 1]; return `<div class="policy-version ${p.version === cur.version ? 'is-current' : ''}">
          <div class="row-between"><strong>v${p.version}</strong>${p.version === cur.version ? '<span class="badge badge-success">Đang áp dụng</span>' : (p.effectiveFrom > Store.nowIso() ? '<span class="badge badge-info">Sắp hiệu lực</span>' : '<span class="badge badge-neutral">Đã thay thế</span>')}</div>
          <div class="text-sm text-muted">Hiệu lực ${UI.date(p.effectiveFrom)} · tạo bởi ${UI.esc(p.createdBy)} ${UI.dt(p.createdAt)}</div>
          <div class="text-sm mt-2">${p.tiers.map((t, k) => { const pt = prev && prev.tiers[k]; const changed = pt && pt.rate !== t.rate; return `<span class="mono">F${t.tier} ${changed ? `<span class="diff-del">${RULES.formatPercent(pt.rate)}</span> <span class="diff-add">${RULES.formatPercent(t.rate)}</span>` : RULES.formatPercent(t.rate)}</span>`; }).join(' · ')}${prev && prev.tiers.length > p.tiers.length ? ` · <span class="diff-del">F${prev.tiers.length}</span>` : ''}${!prev || prev.tiers.length < p.tiers.length ? '' : ''}</div>
          <div class="text-sm">Holding ${prev && prev.holdingDays !== p.holdingDays ? `<span class="diff-del">${prev.holdingDays}</span> <span class="diff-add">${p.holdingDays} ngày</span>` : p.holdingDays + ' ngày'} · Rút tối thiểu ${prev && prev.minWithdraw !== p.minWithdraw ? `<span class="diff-del">${UI.money(prev.minWithdraw)}</span> <span class="diff-add">${UI.money(p.minWithdraw)}</span>` : UI.money(p.minWithdraw)} · Điều kiện: ${UI.esc(p.condition)}</div>
          ${p.note ? `<div class="text-sm text-muted mt-1">"${UI.esc(p.note)}"</div>` : ''}</div>`; }).join('')}
      </div></div>
    </div>`;
    return App.adminShell('D-06', 'Chính sách hoa hồng', html);
  },
  syncPolicyDraft: function() { const d = this._policyDraft; d.tiers.forEach((t, i) => { const e = document.getElementById('tier-' + i); if (e) t.rate = Number(e.value) / 100; }); d.condition = UI.val('pl-cond'); d.holdingDays = Number(UI.val('pl-hold')); d.minWithdraw = Number(UI.val('pl-min').replace(/\D/g, '')); d.effectiveFrom = UI.val('pl-eff'); d.note = UI.val('pl-note'); },
  tierAdd: function() { this.syncPolicyDraft(); this._policyDraft.tiers.push({ tier: this._policyDraft.tiers.length + 1, rate: 0.01 }); App.reload(); },
  tierRemove: function(i) { this.syncPolicyDraft(); this._policyDraft.tiers.splice(i, 1); this._policyDraft.tiers.forEach((t, k) => { t.tier = k + 1; }); App.reload(); },
  savePolicy: function(e) {
    e.preventDefault(); this.syncPolicyDraft(); const d = this._policyDraft;
    ['pl-hold', 'pl-min', 'pl-eff'].forEach(x => UI.setError(x, '')); document.getElementById('tier-err').textContent = '';
    let ok = true;
    if (d.tiers.some(t => !(t.rate >= 0 && t.rate <= 1))) { document.getElementById('tier-err').textContent = 'Tỉ lệ mỗi tầng từ 0 đến 100%.'; ok = false; }
    if (RULES.totalRate(d) > 0.5) { document.getElementById('tier-err').textContent = 'Tổng tỉ lệ vượt 50% — kiểm tra lại.'; ok = false; }
    if (!(d.holdingDays >= 0)) { UI.setError('pl-hold', 'Nhập số ngày hợp lệ.'); ok = false; }
    if (!(d.minWithdraw > 0)) { UI.setError('pl-min', 'Nhập ngưỡng lớn hơn 0.'); ok = false; }
    if (!d.effectiveFrom) { UI.setError('pl-eff', 'Chọn ngày hiệu lực.'); ok = false; }
    if (!ok) return;
    UI.confirm({ title: 'Lưu phiên bản chính sách mới?', body: 'Phiên bản mới áp dụng cho đơn tạo từ ngày hiệu lực. Khoản hoa hồng đã sinh giữ nguyên tỉ lệ cũ.',
      summary: [['Tầng', d.tiers.map(t => 'F' + t.tier + ' ' + RULES.formatPercent(t.rate)).join(' · ')], ['Tổng chi', RULES.formatPercent(RULES.totalRate(d))], ['Holding', d.holdingDays + ' ngày'], ['Rút tối thiểu', UI.money(d.minWithdraw)], ['Hiệu lực', UI.date(d.effectiveFrom)]],
      confirmText: 'Lưu phiên bản', onConfirm: () => { const v = Store.savePolicy({ tiers: d.tiers, condition: d.condition, holdingDays: d.holdingDays, minWithdraw: d.minWithdraw, effectiveFrom: new Date(d.effectiveFrom + 'T00:00:00').toISOString(), note: d.note }); this._policyDraft = null; UI.toast('Đã lưu chính sách v' + v + '.'); App.reload(); } });
  },

  // =====================================================================
  // D-07 · Duyệt hoa hồng & chi trả (2 tab)
  // =====================================================================
  D07: function(q) {
    if (q.get('tab')) this.st.d07.tab = q.get('tab') === 'withdraw' ? 'withdraw' : 'commission';
    const s = this.st.d07;
    const html = `<div class="card">
      <div class="tabs" role="tablist" style="padding:0 20px">
        <button class="tab ${s.tab === 'commission' ? 'is-active' : ''}" onclick="Admin.st.d07.tab='commission'; App.reload()">${UI.icon('layers', 18)} Hoa hồng <span class="count">${Store.commissions().filter(c => c.status === 'PENDING').length}</span></button>
        <button class="tab ${s.tab === 'withdraw' ? 'is-active' : ''}" onclick="Admin.st.d07.tab='withdraw'; App.reload()">${UI.icon('cash', 18)} Rút tiền <span class="count">${Store.withdrawals().filter(w => w.status === 'PENDING').length}</span></button>
      </div>
      <div class="card-body" id="d07-body"></div></div>`;
    App.after(() => s.tab === 'commission' ? this.renderCommissionTab() : this.renderWithdrawTab());
    return App.adminShell('D-07', 'Duyệt hoa hồng & chi trả', html);
  },
  // ---- Tab 1: hoa hồng ----
  filteredCm: function() { const s = this.st.d07; return Store.commissions().filter(c => !s.cmStatus || c.status === s.cmStatus).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderCommissionTab: function() {
    const el = document.getElementById('d07-body'); if (!el) return; const s = this.st.d07;
    const list = this.filteredCm(); const pg = UI.paginate(list, s.cmPage);
    const selected = s.selected.filter(id => list.some(c => c.id === id)); s.selected = selected;
    const selObjs = selected.map(id => Store.commissions().find(c => c.id === id));
    const sum = selObjs.reduce((t, c) => t + c.amount, 0);
    const canApprove = selObjs.length && selObjs.every(c => c.status === 'PENDING'); const canPay = selObjs.length && selObjs.every(c => c.status === 'APPROVED'); const canCancel = selObjs.length && selObjs.every(c => c.status !== 'PAID' && c.status !== 'CANCELLED');
    el.innerHTML = `
      <div class="alert alert-info mb-4">${UI.icon('info', 18)}<div class="text-sm">Luồng: chọn lô → <strong>Duyệt</strong> (chờ duyệt → đã duyệt, cộng vào ví khả dụng) → <strong>Xuất file ngân hàng</strong> → <strong>Xác nhận đã chi</strong>. Khoản chưa qua holding period được cảnh báo. Hoàn/huỷ khi đơn bị hoàn tiền.</div></div>
      <div class="table-toolbar">
        <div class="field"><label class="field-label" for="cm-status">Trạng thái</label><select class="select" id="cm-status" onchange="Admin.st.d07.cmStatus=this.value; Admin.st.d07.cmPage=1; Admin.st.d07.selected=[]; Admin.renderCommissionTab()"><option value="">Tất cả</option>${Object.keys(LABELS.commission).map(k => `<option value="${k}" ${s.cmStatus === k ? 'selected' : ''}>${LABELS.commission[k].text}</option>`).join('')}</select></div>
        <div class="toolbar-actions"><button class="btn btn-secondary" onclick="Admin.cmSelectPage(true)">Chọn cả trang</button><button class="btn btn-secondary" onclick="Admin.exportCm()">${UI.icon('download', 16)} Xuất Excel</button></div>
      </div>
      ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th style="width:36px"><span class="sr-only">Chọn</span></th><th>Mã</th><th>Đơn gốc</th><th>Người thụ hưởng</th><th>Tầng</th><th class="num">Số tiền</th><th>Khả dụng từ</th><th>Trạng thái</th><th>Lô chi</th></tr></thead>
        <tbody>${pg.rows.map(c => { const b = Store.user(c.beneficiaryId); const early = c.status === 'PENDING' && c.availableAt > Store.nowIso(); return `<tr class="${selected.includes(c.id) ? 'is-selected' : ''}"><td><input type="checkbox" aria-label="Chọn ${c.id}" ${selected.includes(c.id) ? 'checked' : ''} ${c.status === 'PAID' || c.status === 'CANCELLED' ? 'disabled' : ''} onchange="Admin.cmToggle('${c.id}', this.checked)"></td><td class="mono">${UI.esc(c.id)}</td><td><button class="btn-link mono" onclick="Admin.orderDrawer('${c.orderId}')">${UI.esc(c.orderId)}</button><span class="cell-sub">${UI.date(c.createdAt)} · v${c.policyVersion}</span></td><td><span class="cell-main">${UI.esc(b.fullName)}</span><span class="cell-sub">${b.bank ? UI.esc(b.bank.bankName) + ' ' + RULES.maskAccount(b.bank.accountNo) : '<span class="text-error">Chưa có TK ngân hàng</span>'}</span></td><td><span class="badge badge-navy badge-plain">F${c.tier} · ${RULES.formatPercent(c.rate)}</span></td><td class="num mono text-strong">${UI.money(c.amount)}</td><td>${UI.date(c.availableAt)}${early ? '<span class="cell-sub text-warning">Chưa đủ holding</span>' : ''}</td><td>${UI.badge('commission', c.status)}${c.cancelReason ? `<span class="cell-sub">${UI.esc(c.cancelReason)}</span>` : ''}</td><td class="mono text-sm">${UI.esc(c.batchId || '—')}</td></tr>`; }).join('')}</tbody></table></div>${UI.pagination(pg, 'Admin.gotoCm')}` : UI.empty('layers', 'Không có khoản hoa hồng', 'Thử đổi bộ lọc trạng thái.')}
      ${selected.length ? `<div class="batch-bar"><span>Đã chọn <strong>${selected.length}</strong> khoản</span><span class="sum">${UI.money(sum)}</span><span class="spacer"></span>
        <button class="btn btn-secondary btn-sm" onclick="Admin.st.d07.selected=[]; Admin.renderCommissionTab()">Bỏ chọn</button>
        <button class="btn btn-danger-outline btn-sm" ${canCancel ? '' : 'disabled'} onclick="Admin.cmCancel()">Hoàn/huỷ</button>
        <button class="btn btn-secondary btn-sm" ${canPay ? '' : 'disabled'} onclick="Admin.cmExportBank()">${UI.icon('download', 14)} Xuất file ngân hàng</button>
        <button class="btn btn-success btn-sm" ${canPay ? '' : 'disabled'} onclick="Admin.cmPay()">Xác nhận đã chi</button>
        <button class="btn btn-accent btn-sm" ${canApprove ? '' : 'disabled'} onclick="Admin.cmApprove()">${UI.icon('check', 14)} Duyệt lô</button></div>` : ''}`;
  },
  gotoCm: function(p) { this.st.d07.cmPage = p; this.renderCommissionTab(); },
  cmToggle: function(id, on) { const s = this.st.d07; if (on && !s.selected.includes(id)) s.selected.push(id); if (!on) s.selected = s.selected.filter(x => x !== id); this.renderCommissionTab(); },
  cmSelectPage: function() { const s = this.st.d07; const pg = UI.paginate(this.filteredCm(), s.cmPage); pg.rows.filter(c => c.status !== 'PAID' && c.status !== 'CANCELLED').forEach(c => { if (!s.selected.includes(c.id)) s.selected.push(c.id); }); this.renderCommissionTab(); },
  cmSel: function() { return this.st.d07.selected.map(id => Store.commissions().find(c => c.id === id)); },
  cmApprove: function() {
    const sel = this.cmSel(); const early = sel.filter(c => c.availableAt > Store.nowIso()).length; const sum = sel.reduce((t, c) => t + c.amount, 0);
    UI.confirm({ title: 'Duyệt lô hoa hồng', body: `Duyệt <strong>${sel.length}</strong> khoản. Số tiền được cộng vào <strong>ví khả dụng</strong> của ${new Set(sel.map(c => c.beneficiaryId)).size} seller.${early ? ` <span class="text-warning">${early} khoản chưa đủ holding period.</span>` : ''}`, summary: [['Tổng duyệt', '<strong>' + UI.money(sum) + '</strong>']], confirmText: 'Duyệt ' + sel.length + ' khoản',
      onConfirm: () => { Store.approveCommissions(sel.map(c => c.id)); this.st.d07.selected = []; UI.toast('Đã duyệt ' + sel.length + ' khoản (' + UI.money(sum) + ').'); this.renderCommissionTab(); } });
  },
  cmExportBank: function() { const sel = this.cmSel(); UI.exportCsv('chi-hoa-hong-' + Store.nowIso().slice(0, 10) + '.csv', ['STT', 'Người thụ hưởng', 'Ngân hàng', 'Số TK', 'Chủ TK', 'Số tiền', 'Nội dung'], sel.map((c, i) => { const b = Store.user(c.beneficiaryId); return [i + 1, b.fullName, b.bank ? b.bank.bankName : '', b.bank ? b.bank.accountNo : '', b.bank ? b.bank.owner : '', c.amount, 'HOMI365 HH ' + c.id]; })); },
  cmPay: function() {
    const sel = this.cmSel(); const sum = sel.reduce((t, c) => t + c.amount, 0);
    UI.confirm({ title: 'Xác nhận đã chi trả', body: `Đánh dấu <strong>${sel.length}</strong> khoản đã chuyển khoản cho seller theo file ngân hàng. Thao tác này ghi sổ cái, không hoàn tác được.`, summary: [['Tổng chi', '<strong>' + UI.money(sum) + '</strong>']], confirmText: 'Đã chi',
      onConfirm: () => { const b = Store.payCommissions(sel.map(c => c.id)); this.st.d07.selected = []; UI.toast('Đã ghi nhận chi ' + UI.money(sum) + ', lô ' + b + '.'); this.renderCommissionTab(); } });
  },
  cmCancel: function() {
    const sel = this.cmSel();
    UI.confirm({ title: 'Hoàn/huỷ khoản hoa hồng', body: `Huỷ <strong>${sel.length}</strong> khoản (${UI.money(sel.reduce((t, c) => t + c.amount, 0))}). Dùng khi đơn gốc bị hoàn tiền hoặc phát hiện gian lận.`, reason: 'Lý do huỷ', confirmText: 'Huỷ khoản', tone: 'danger',
      onConfirm: (reason) => { Store.cancelCommissions(sel.map(c => c.id), reason); this.st.d07.selected = []; UI.toast('Đã huỷ ' + sel.length + ' khoản.', 'warning'); this.renderCommissionTab(); } });
  },
  exportCm: function() { UI.exportCsv('hoa-hong.csv', ['Mã', 'Đơn', 'Người thụ hưởng', 'Tầng', 'Tỉ lệ', 'Số tiền', 'Khả dụng từ', 'Trạng thái', 'Lô'], this.filteredCm().map(c => [c.id, c.orderId, Store.user(c.beneficiaryId).fullName, 'F' + c.tier, RULES.formatPercent(c.rate), c.amount, UI.date(c.availableAt), LABELS.commission[c.status].text, c.batchId || ''])); },

  // ---- Tab 2: rút tiền ----
  filteredWd: function() { const s = this.st.d07; return Store.withdrawals().filter(w => !s.wdStatus || w.status === s.wdStatus).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderWithdrawTab: function() {
    const el = document.getElementById('d07-body'); if (!el) return; const s = this.st.d07;
    const list = this.filteredWd(); const pg = UI.paginate(list, s.wdPage);
    s.wdSelected = s.wdSelected.filter(id => list.some(w => w.id === id && w.status === 'APPROVED'));
    const sum = s.wdSelected.reduce((t, id) => t + Store.withdrawals().find(w => w.id === id).amount, 0);
    el.innerHTML = `
      <div class="alert alert-info mb-4">${UI.icon('info', 18)}<div class="text-sm">Đối chiếu số dư khả dụng của seller trước khi duyệt. "Đã chi" chỉ bật sau khi "Đã duyệt"; chi theo lô để xuất file ngân hàng chung. Từ chối phải nêu lý do — seller thấy lý do tại C-03.</div></div>
      <div class="table-toolbar">
        <div class="field"><label class="field-label" for="wd-status">Trạng thái</label><select class="select" id="wd-status" onchange="Admin.st.d07.wdStatus=this.value; Admin.st.d07.wdPage=1; Admin.renderWithdrawTab()"><option value="">Tất cả</option>${Object.keys(LABELS.withdrawal).map(k => `<option value="${k}" ${s.wdStatus === k ? 'selected' : ''}>${LABELS.withdrawal[k].text}</option>`).join('')}</select></div>
        <div class="toolbar-actions"><button class="btn btn-secondary" onclick="Admin.exportWd()">${UI.icon('download', 16)} Xuất Excel</button></div>
      </div>
      ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th style="width:36px"><span class="sr-only">Chọn</span></th><th>Mã</th><th>Seller</th><th class="num">Số tiền</th><th>Đối chiếu số dư</th><th>Nhận về</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${pg.rows.map(w => { const u = Store.user(w.sellerId); const wal = Store.wallet(u.id); const okBal = w.status !== 'PENDING' || wal.available >= 0; return `<tr class="${s.wdSelected.includes(w.id) ? 'is-selected' : ''}"><td><input type="checkbox" aria-label="Chọn ${w.id}" ${w.status === 'APPROVED' ? '' : 'disabled'} ${s.wdSelected.includes(w.id) ? 'checked' : ''} onchange="Admin.wdToggle('${w.id}', this.checked)"></td><td class="mono">${UI.esc(w.id)}<span class="cell-sub">${UI.dt(w.createdAt)}</span></td><td><span class="cell-main">${UI.esc(u.fullName)}</span><span class="cell-sub mono">${UI.esc(u.phone)}</span></td><td class="num mono text-strong">${UI.money(w.amount)}</td><td>${w.status === 'PENDING' ? `<span class="${okBal ? 'text-success' : 'text-error'}">${okBal ? UI.icon('check-circle', 14) + ' Khả dụng ' : UI.icon('x-circle', 14) + ' Thiếu '}${UI.money(wal.available + w.amount)}</span><span class="cell-sub">đang giữ ${UI.money(w.amount)}</span>` : '<span class="text-muted">—</span>'}</td><td>${UI.esc(w.bank.bankName)}<span class="cell-sub mono">${UI.esc(w.bank.accountNo)} · ${UI.esc(w.bank.owner)}</span><span class="cell-sub">CCCD ${UI.esc(RULES.maskCccd(w.cccd))}</span></td><td>${UI.badge('withdrawal', w.status)}${w.reason ? `<span class="cell-sub text-error">${UI.esc(w.reason)}</span>` : ''}${w.batchId ? `<span class="cell-sub mono">${UI.esc(w.batchId)}</span>` : ''}</td>
          <td><div class="row-actions">${w.status === 'PENDING' ? `<button class="btn btn-success btn-sm" ${okBal ? '' : 'disabled'} onclick="Admin.wdApprove('${w.id}')">Duyệt</button><button class="btn btn-danger-outline btn-sm" onclick="Admin.wdReject('${w.id}')">Từ chối</button>` : ''}${w.status === 'APPROVED' ? `<button class="btn btn-primary btn-sm" onclick="Admin.wdPay(['${w.id}'])">Đã chi</button>` : ''}<button class="btn btn-secondary btn-sm" onclick="Admin.userDrawer('${u.id}')">Seller</button></div></td></tr>`; }).join('')}</tbody></table></div>${UI.pagination(pg, 'Admin.gotoWd')}` : UI.empty('cash', 'Không có yêu cầu rút tiền')}
      ${s.wdSelected.length ? `<div class="batch-bar"><span>Đã chọn <strong>${s.wdSelected.length}</strong> yêu cầu đã duyệt</span><span class="sum">${UI.money(sum)}</span><span class="spacer"></span><button class="btn btn-secondary btn-sm" onclick="Admin.st.d07.wdSelected=[]; Admin.renderWithdrawTab()">Bỏ chọn</button><button class="btn btn-secondary btn-sm" onclick="Admin.wdExportBank()">${UI.icon('download', 14)} Xuất file ngân hàng</button><button class="btn btn-success btn-sm" onclick="Admin.wdPay(Admin.st.d07.wdSelected)">Xác nhận đã chi theo lô</button></div>` : ''}`;
  },
  gotoWd: function(p) { this.st.d07.wdPage = p; this.renderWithdrawTab(); },
  wdToggle: function(id, on) { const s = this.st.d07; if (on && !s.wdSelected.includes(id)) s.wdSelected.push(id); if (!on) s.wdSelected = s.wdSelected.filter(x => x !== id); this.renderWithdrawTab(); },
  wdApprove: function(id) {
    const w = Store.withdrawals().find(x => x.id === id); const u = Store.user(w.sellerId);
    UI.confirm({ title: 'Duyệt yêu cầu rút tiền', body: 'Sau khi duyệt, xuất file ngân hàng và bấm "Đã chi" khi chuyển khoản xong.', summary: [['Seller', UI.esc(u.fullName)], ['Số tiền', '<strong>' + UI.money(w.amount) + '</strong>'], ['Nhận về', UI.esc(w.bank.bankName) + ' · <span class="mono">' + UI.esc(w.bank.accountNo) + '</span>'], ['Chủ TK', UI.esc(w.bank.owner)]], confirmText: 'Duyệt',
      onConfirm: () => { Store.approveWithdrawal(id); UI.toast('Đã duyệt ' + id + '.'); this.renderWithdrawTab(); } });
  },
  wdReject: function(id) {
    const w = Store.withdrawals().find(x => x.id === id); const u = Store.user(w.sellerId);
    UI.confirm({ title: 'Từ chối yêu cầu rút tiền', body: `Số tiền ${UI.money(w.amount)} được hoàn về ví khả dụng của <strong>${UI.esc(u.fullName)}</strong>. Seller thấy lý do tại màn Ví.`, reason: 'Lý do từ chối', confirmText: 'Từ chối', tone: 'danger',
      onConfirm: (reason) => { Store.rejectWithdrawal(id, reason); UI.toast('Đã từ chối ' + id + '.', 'warning'); this.renderWithdrawTab(); } });
  },
  wdPay: function(ids) {
    const list = ids.map(id => Store.withdrawals().find(w => w.id === id)); const sum = list.reduce((t, w) => t + w.amount, 0);
    UI.confirm({ title: 'Xác nhận đã chi', body: `Đánh dấu <strong>${list.length}</strong> yêu cầu đã chuyển khoản. Ví seller và sổ cái được cập nhật, không hoàn tác được.`, summary: [['Tổng chi', '<strong>' + UI.money(sum) + '</strong>']], confirmText: 'Đã chi',
      onConfirm: () => { const b = Store.payWithdrawals(ids); this.st.d07.wdSelected = []; UI.toast('Đã ghi nhận chi ' + UI.money(sum) + ', lô ' + b + '.'); this.renderWithdrawTab(); } });
  },
  wdExportBank: function() { const list = this.st.d07.wdSelected.map(id => Store.withdrawals().find(w => w.id === id)); UI.exportCsv('chi-rut-tien-' + Store.nowIso().slice(0, 10) + '.csv', ['STT', 'Seller', 'Ngân hàng', 'Số TK', 'Chủ TK', 'Số tiền', 'Nội dung'], list.map((w, i) => [i + 1, Store.user(w.sellerId).fullName, w.bank.bankName, w.bank.accountNo, w.bank.owner, w.amount, 'HOMI365 RUT ' + w.id])); },
  exportWd: function() { UI.exportCsv('rut-tien.csv', ['Mã', 'Ngày', 'Seller', 'SĐT', 'Số tiền', 'Ngân hàng', 'Số TK', 'Trạng thái', 'Lý do'], this.filteredWd().map(w => [w.id, UI.dt(w.createdAt), Store.user(w.sellerId).fullName, Store.user(w.sellerId).phone, w.amount, w.bank.bankName, w.bank.accountNo, LABELS.withdrawal[w.status].text, w.reason || ''])); },

  // =====================================================================
  // D-08 · Cấp phát ngoại lệ
  // =====================================================================
  D08: function() {
    const list = Store.exceptions();
    const html = `<div class="split-2">
      <div class="card"><div class="card-head"><h2>Danh sách ngoại lệ đã cấp</h2><span class="badge badge-neutral badge-plain">${list.length}</span></div><div class="card-body">
        ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Số điện thoại</th><th>Người dùng</th><th>Gói</th><th>Mã kích hoạt</th><th>Lý do</th><th>Người thực hiện</th></tr></thead>
          <tbody>${list.map(x => { const u = x.userId ? Store.user(x.userId) : null; const c = Store.codeInfo(x.code); return `<tr><td class="mono">${UI.esc(x.id)}</td><td class="mono">${UI.esc(x.phone)}</td><td>${u ? UI.esc(u.fullName) : '—'}</td><td>${UI.esc(x.packageId)}</td><td><span class="mono">${UI.esc(x.code)}</span><span class="cell-sub">${c ? UI.badge('license', c.status) : ''}</span></td><td>${UI.esc(x.reason)}</td><td>${UI.esc(x.by)}<span class="cell-sub">${UI.dt(x.at)}</span></td></tr>`; }).join('')}</tbody></table></div>` : UI.empty('gift', 'Chưa có ngoại lệ nào')}
      </div></div>
      <div class="card"><div class="card-head"><h2>Cấp ngoại lệ mới</h2></div><div class="card-body">
        <div class="alert alert-warning mb-4">${UI.icon('warning', 18)}<div class="text-sm">Ngoại lệ vượt giới hạn <strong>1 gói / 1 SĐT</strong> (BR-03). Bắt buộc nhập lý do; hệ thống ghi người thực hiện và thời điểm (US-34).</div></div>
        <form novalidate onsubmit="Admin.exFind(event)">
          <div class="field"><label class="field-label" for="ex-phone">Số điện thoại<span class="req">*</span></label><div class="input-group"><input class="input input-mono" id="ex-phone" placeholder="0912 345 678" inputmode="numeric"><button class="btn btn-secondary">${UI.icon('search', 16)} Tìm</button></div><div class="field-error" id="ex-phone-err"></div></div>
        </form>
        <div id="ex-result" class="mt-4"></div>
      </div></div>
    </div>`;
    return App.adminShell('D-08', 'Cấp phát ngoại lệ', html);
  },
  exFind: function(e) {
    e.preventDefault(); const raw = UI.val('ex-phone'); const phone = RULES.normalizePhone(raw); const err = document.getElementById('ex-phone-err'); const res = document.getElementById('ex-result');
    err.textContent = ''; res.innerHTML = '';
    if (!phone) { err.textContent = raw ? 'Số điện thoại không đúng định dạng.' : 'Nhập số điện thoại.'; return; }
    const u = Store.userByPhone(phone); const orders = Store.ordersByPhone(phone).filter(o => o.status === 'PAID'); const exs = Store.exceptions().filter(x => x.phone === phone);
    res.innerHTML = `<div class="card card-soft"><div class="card-body">
      <dl class="dl"><dt>Số điện thoại</dt><dd class="mono">${UI.esc(phone)}</dd><dt>Người dùng</dt><dd>${u ? UI.esc(u.fullName) + ' ' + UI.badge('userType', u.type) : '<span class="text-muted">Chưa có trong hệ thống</span>'}</dd><dt>Gói đã sở hữu</dt><dd>${orders.length} đơn đã thanh toán${exs.length ? ' · ' + exs.length + ' ngoại lệ' : ''}</dd></dl>
      ${orders.length ? `<div class="mt-3 stack-sm">${orders.map(o => `<div class="row-between text-sm"><span class="mono">${UI.esc(o.id)}</span><span class="mono">${UI.esc(o.licenseCode || '—')}</span>${UI.badge('license', o.licenseCode && Store.codeInfo(o.licenseCode) ? Store.codeInfo(o.licenseCode).status : 'PENDING')}</div>`).join('')}</div>` : `<div class="alert alert-info mt-3">${UI.icon('info', 16)}<div class="text-sm">SĐT này chưa sở hữu gói — có thể mua bình thường qua link giới thiệu, không cần ngoại lệ.</div></div>`}
      <form novalidate class="mt-4" onsubmit="Admin.exGrant(event, '${phone}')">
        ${UI.field({ id: 'ex-pkg', label: 'Gói cấp thêm', type: 'select', value: CONFIG.defaultPackageId, options: Store.packages().map(p => ({ value: p.id, label: p.fullName })) })}
        <div class="mt-4">${UI.field({ id: 'ex-reason', label: 'Lý do cấp ngoại lệ', required: true, type: 'textarea', rows: 3, placeholder: 'VD: khách mua thêm cho người thân dùng cùng SĐT liên hệ; đổi thiết bị hỏng trong bảo hành…' })}</div>
        <p class="text-caption mt-2">Kho còn ${Store.stockCount()} mã. Mã sẽ được lấy từ kho và gửi SMS tới số này.</p>
        <div class="actions"><button class="btn btn-primary btn-lg btn-block">${UI.icon('gift', 18)} Cấp ngoại lệ</button></div>
      </form></div></div>`;
  },
  exGrant: function(e, phone) {
    e.preventDefault(); const reason = UI.val('ex-reason'); const pkg = UI.val('ex-pkg'); UI.setError('ex-reason', '');
    if (reason.length < 10) { UI.setError('ex-reason', 'Lý do bắt buộc, tối thiểu 10 ký tự.'); return; }
    UI.confirm({ title: 'Xác nhận cấp ngoại lệ', body: 'Một mã kích hoạt sẽ được lấy khỏi kho và gửi SMS cho người dùng. Thao tác được ghi nhận vĩnh viễn.', summary: [['Số điện thoại', '<span class="mono">' + UI.esc(phone) + '</span>'], ['Gói', UI.esc(pkg)], ['Lý do', UI.esc(reason)], ['Người thực hiện', UI.esc(Store.currentAdmin().username)]], confirmText: 'Cấp ngoại lệ',
      onConfirm: () => { const r = Store.grantException(phone, pkg, reason); if (!r.ok) { UI.toast(r.reason, 'error'); return; } UI.toast('Đã cấp ' + r.ex.code + ' (' + r.ex.id + ').'); App.reload(); } });
  }
};
