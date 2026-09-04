/**
 * Nhóm C · Dashboard Seller — C-01 Tổng quan · C-02 Gói & mã · C-03 Ví & rút tiền · Hồ sơ
 * (US-18 → US-23). Mobile-first, khung seller có header + điều hướng 3 mục.
 */
const Seller = {
  state: { period: CONFIG.defaultPeriod, cmStatus: '', cmPage: 1, wdTab: 'ledger', wdStep: null },

  periodDays: function(id) { return { week: 7, month: 30, quarter: 90 }[id] || 30; },
  periodSeg: function(handler) {
    return `<div class="seg" role="group" aria-label="Kỳ thống kê">${CONFIG.periods.map(p => `<button class="${this.state.period === p.id ? 'is-active' : ''}" aria-pressed="${this.state.period === p.id}" onclick="${handler}('${p.id}')">${p.label}</button>`).join('')}</div>`;
  },

  // =====================================================================
  // C-01 · Tổng quan
  // =====================================================================
  C01: function(q) {
    const u = Store.currentSeller();
    const url = RULES.referralUrl(u.refCode);
    const html = `<div class="stack-lg">
      <div class="page-title"><div><h1>Xin chào, ${UI.esc(u.fullName)}</h1><p>Mã giới thiệu <span class="mono text-strong">${UI.esc(u.refCode)}</span> · tham gia ${UI.date(u.createdAt)}</p></div></div>

      <!-- (1) Link giới thiệu + QR + chia sẻ -->
      <div class="card"><div class="card-head"><h2>Link giới thiệu của bạn</h2><span class="text-sm text-muted">Khách mua qua link này được tính vào tuyến của bạn</span></div>
        <div class="card-body ref-block">
          <div class="stack">
            <div class="ref-url"><input class="input" readonly value="${UI.esc(url)}" aria-label="Link giới thiệu" onclick="this.select()"><button class="btn btn-primary" onclick="UI.copy('${UI.esc(url)}', 'Đã sao chép link giới thiệu.')">${UI.icon('copy', 18)} Sao chép</button></div>
            <div class="share-row">
              <button class="btn btn-secondary share-btn" onclick="Seller.shareZalo('${UI.esc(url)}')"><span class="share-mark share-zalo">Z</span> Zalo</button>
              <button class="btn btn-secondary share-btn" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('${UI.esc(url)}'), '_blank', 'noopener')"><span class="share-mark share-fb">f</span> Facebook</button>
              <button class="btn btn-secondary share-btn" onclick="UI.share('${UI.esc(url)}', 'Gói Bác sĩ 24/7 HOMI365')">${UI.icon('share', 18)} Khác</button>
            </div>
            <p class="text-sm text-muted">Trong prototype, mở thử link tại <a href="${RULES.referralHash(u.refCode)}" target="_blank" rel="noopener">${RULES.referralHash(u.refCode)}</a>.</p>
          </div>
          <div class="ref-qr">${UI.qrSvg(url, 160)}<div class="qr-label">Quét để mở link</div><button class="btn btn-ghost btn-sm mt-1" onclick="Seller.downloadQr('${UI.esc(u.refCode)}')">${UI.icon('download', 16)} Tải QR</button></div>
        </div></div>

      <!-- (2) Thống kê -->
      <div class="card"><div class="card-head"><h2>Thống kê</h2>${this.periodSeg('Seller.setPeriod')}</div>
        <div class="card-body" id="c01-stats">${UI.skeletonCards(2)}</div></div>

      <!-- (3) Bảng kê hoa hồng -->
      <div class="card"><div class="card-head"><h2>Bảng kê hoa hồng</h2>
        <div class="row-wrap">
          <select class="select" style="min-height:40px;width:auto" aria-label="Lọc trạng thái" onchange="Seller.state.cmStatus=this.value; Seller.state.cmPage=1; Seller.renderCommissions()">
            <option value="">Tất cả trạng thái</option>${Object.keys(LABELS.commission).map(k => `<option value="${k}" ${this.state.cmStatus === k ? 'selected' : ''}>${LABELS.commission[k].text}</option>`).join('')}</select>
          <button class="btn btn-secondary btn-sm" onclick="Seller.exportCommissions()">${UI.icon('download', 16)} Xuất Excel</button>
        </div></div>
        <div class="card-body" id="c01-cm">${UI.skeletonTable(6, 5)}</div></div>
    </div>`;
    App.after(() => { UI.withLoading('c01-stats', UI.skeletonCards(2), () => this.renderStats()); UI.withLoading('c01-cm', UI.skeletonTable(6, 5), () => this.renderCommissions()); });
    return App.sellerShell('C-01', html);
  },
  setPeriod: function(id) { this.state.period = id; this.state.cmPage = 1; App.reload(); },
  shareZalo: function(url) { UI.copy(url, 'Đã sao chép link — dán vào tin nhắn Zalo để chia sẻ.'); window.open('https://zalo.me/', '_blank', 'noopener'); },
  downloadQr: function(code) {
    const svg = UI.qrSvg(RULES.referralUrl(code), 512);
    const blob = new Blob([svg], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'homi365-qr-' + code + '.svg'; document.body.appendChild(a); a.click(); a.remove();
    UI.toast('Đã tải mã QR.');
  },

  renderStats: function() {
    const u = Store.currentSeller(); const days = this.periodDays(this.state.period);
    const st = Store.sellerStats(u.id, days); const w = Store.wallet(u.id);
    const cms = Store.commissionsOf(u.id).filter(c => c.createdAt >= new Date(Date.now() - days * 86400000).toISOString());
    const series = Store.sellerSeries(u.id, days).map(s => ({ label: UI.dayLabel(s.date), bar: s.paid, line: s.clicks }));
    const el = document.getElementById('c01-stats'); if (!el) return;
    el.innerHTML = `
      <div class="stat-grid stat-grid-6">
        <div class="stat"><div class="stat-label">${UI.icon('external', 16)} Lượt click</div><div class="stat-value">${UI.num(st.clicks)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('inbox', 16)} Đơn đã đặt</div><div class="stat-value">${UI.num(st.orders)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('check-circle', 16)} Đơn thanh toán</div><div class="stat-value">${UI.num(st.paid)}</div><div class="stat-sub">Chuyển đổi ${RULES.formatPercent(st.conversion, 1)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('bars', 16)} Doanh số kỳ</div><div class="stat-value">${UI.money(st.revenue)}</div></div>
        <div class="stat stat-accent"><div class="stat-label">${UI.icon('clock', 16)} Hoa hồng chờ duyệt</div><div class="stat-value text-warning">${UI.money(w.pending)}</div><div class="stat-sub">${cms.filter(c => c.status === 'PENDING').length} khoản trong kỳ</div></div>
        <div class="stat stat-navy stat-clickable" onclick="App.navigate('C-03')" role="link" tabindex="0"><div class="stat-label">${UI.icon('wallet', 16)} Hoa hồng khả dụng</div><div class="stat-value">${UI.money(w.available)}</div><div class="stat-sub">Xem ví & rút tiền ${UI.icon('arrow-right', 12)}</div></div>
      </div>
      <div class="mt-6"><h3 class="mb-2">Xu hướng ${days} ngày</h3>${UI.chart.combo(series, { height: 220, barName: 'đơn thanh toán', lineName: 'click', aria: 'Biểu đồ đơn thanh toán và lượt click theo ngày', legend: [{ text: 'Đơn thanh toán (cột)' }, { text: 'Lượt click (đường)', cls: 'legend-line' }] })}</div>`;
  },

  filteredCommissions: function() {
    const u = Store.currentSeller(); const days = this.periodDays(this.state.period);
    const from = new Date(Date.now() - days * 86400000).toISOString();
    return Store.commissionsOf(u.id).filter(c => c.createdAt >= from && (!this.state.cmStatus || c.status === this.state.cmStatus)).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  },
  renderCommissions: function() {
    const el = document.getElementById('c01-cm'); if (!el) return;
    const list = this.filteredCommissions();
    if (!list.length) { el.innerHTML = UI.empty('cash', 'Chưa có khoản hoa hồng nào', 'Chia sẻ link giới thiệu để bắt đầu nhận hoa hồng. Khoản hoa hồng xuất hiện khi đơn của khách thanh toán thành công.'); return; }
    const pg = UI.paginate(list, this.state.cmPage);
    const total = list.reduce((s, c) => s + c.amount, 0);
    el.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>Ngày</th><th>Đơn gốc</th><th>Tầng</th><th class="num">Tỉ lệ</th><th class="num">Số tiền</th><th>Trạng thái</th></tr></thead>
      <tbody>${pg.rows.map(c => { const o = Store.order(c.orderId); return `<tr><td>${UI.date(c.createdAt)}</td><td><span class="cell-main mono">${UI.esc(c.orderId)}</span><span class="cell-sub">${o ? UI.esc(o.fullName) + ' · ' + RULES.maskPhone(o.phone) : ''}</span></td><td><span class="badge badge-navy badge-plain">${RULES.tierLabel(c.tier)}</span></td><td class="num">${RULES.formatPercent(c.rate)}</td><td class="num mono text-strong">${UI.money(c.amount)}</td><td>${UI.badge('commission', c.status)}${c.status === 'PENDING' ? `<span class="cell-sub">Khả dụng dự kiến ${UI.date(c.availableAt)}</span>` : ''}</td></tr>`; }).join('')}</tbody>
      <tfoot><tr><th colspan="4">Tổng ${list.length} khoản</th><th class="num">${UI.money(total)}</th><th></th></tr></tfoot></table></div>
      ${UI.pagination(pg, 'Seller.gotoCmPage')}`;
  },
  gotoCmPage: function(p) { this.state.cmPage = p; this.renderCommissions(); },
  exportCommissions: function() {
    const rows = this.filteredCommissions().map(c => [UI.date(c.createdAt), c.orderId, RULES.tierLabel(c.tier), RULES.formatPercent(c.rate), c.amount, LABELS.commission[c.status].text, 'v' + c.policyVersion]);
    if (!rows.length) { UI.toast('Không có dữ liệu để xuất.', 'warning'); return; }
    UI.exportCsv('bang-ke-hoa-hong-' + Store.currentSeller().refCode + '.csv', ['Ngày', 'Đơn gốc', 'Tầng', 'Tỉ lệ', 'Số tiền (đ)', 'Trạng thái', 'Chính sách'], rows);
  },

  // =====================================================================
  // C-02 · Gói của tôi & mã kích hoạt
  // =====================================================================
  C02: function(q) {
    const u = Store.currentSeller();
    const order = Store.sellerPackageOrder(u.phone);
    let body;
    if (!order) body = `<div class="card"><div class="card-body">${UI.empty('package', 'Chưa có gói nào', 'Tài khoản này chưa gắn với đơn hàng thanh toán thành công.')}</div></div>`;
    else {
      const pkg = Store.pkg(order.packageId); const code = order.licenseCode ? Store.codeInfo(order.licenseCode) : null;
      const bound = code && code.status === 'BOUND';
      body = `<div class="grid-2 grid-2-wide">
        <div class="stack">
          <div class="card"><div class="card-body">
            ${Buyer.pkgHeader(pkg)}
            <div class="mt-4">
            ${order.licenseCode ? `<div class="code-box code-box-lg"><div class="grow"><span class="code-label">Mã kích hoạt</span><span class="code-value">${UI.esc(order.licenseCode)}</span></div>
              <button class="btn btn-secondary btn-icon" aria-label="Sao chép mã kích hoạt" onclick="UI.copy('${UI.esc(order.licenseCode)}', 'Đã sao chép mã kích hoạt.')">${UI.icon('copy', 20)}</button></div>
              <div class="row-between mt-3"><span class="text-sm text-muted">Trạng thái mã</span>${UI.badge('license', bound ? 'BOUND' : 'ISSUED', true)}</div>` :
              `<div class="alert alert-warning">${UI.icon('clock', 20)}<div><span class="alert-title">Mã kích hoạt đang chờ cấp</span>Sẽ gửi qua SMS ngay khi có mã.</div></div>`}
            </div>
            <div class="mt-4 alert alert-info">${UI.icon('device', 20)}<div class="text-sm">Kích hoạt gói bằng cách nhập mã trong <strong>ứng dụng HOMI365</strong> trên điện thoại. Mã chỉ gắn được với 1 thiết bị và không thể chuyển sang máy khác.</div></div>
            ${order.licenseCode && !bound ? `<div class="actions"><button class="btn btn-outline btn-lg btn-block" onclick="Store.resendCodeSms('${u.id}'); UI.toast('Đã gửi lại mã kích hoạt qua SMS tới ${RULES.maskPhone(u.phone)}.')">${UI.icon('sms', 18)} Gửi lại mã qua SMS</button></div>` : ''}
          </div></div>

          <div class="card"><div class="card-head"><h2>Thiết bị đã kích hoạt</h2></div><div class="card-body">
            ${bound ? `<div class="device"><div class="device-icon">${UI.icon('device', 24)}</div><div class="grow"><div class="text-strong">${UI.esc(code.device.name)}</div><div class="text-sm text-muted">Mã máy <span class="mono">${UI.esc(code.device.deviceId)}</span></div><div class="text-sm text-muted">Kích hoạt lúc ${UI.dt(code.device.boundAt)}</div></div>${UI.badge('license', 'BOUND')}</div>
              <p class="text-sm text-muted mt-3">License có hiệu lực ${pkg.licenseMonths} tháng kể từ ngày kích hoạt, đến <strong>${UI.date(new Date(new Date(code.device.boundAt).getTime() + pkg.licenseMonths * 30.4 * 86400000).toISOString())}</strong>.</p>` :
              UI.empty('device', 'Chưa kích hoạt trên thiết bị nào', 'Sau khi bạn nhập mã trong ứng dụng, tên máy, mã máy và thời điểm kích hoạt sẽ hiển thị tại đây.')}
          </div></div>
        </div>

        <div class="card"><div class="card-head"><h2>Thông tin đơn hàng</h2></div><div class="card-body">
          <dl class="dl dl-stack">
            <dt>Mã đơn</dt><dd class="mono">${UI.esc(order.id)}</dd>
            <dt>Ngày mua</dt><dd>${UI.dt(order.paidAt || order.createdAt)}</dd>
            <dt>Thanh toán</dt><dd>${UI.badge('orderStatus', order.status)} <span class="text-sm text-muted">${UI.esc(LABELS.method[order.method] || '')}</span></dd>
            <dt>Giao hàng (đồng hồ HW01)</dt><dd>${UI.badge('shipping', order.shipping)}</dd>
            <dt>Địa chỉ nhận</dt><dd>${UI.esc(order.address)}</dd>
            <dt>Người giới thiệu</dt><dd>${order.sellerId ? UI.esc(Store.user(order.sellerId).fullName) : '—'}</dd>
          </dl>
          <p class="text-caption mt-4">Trạng thái giao hàng do bộ phận vận hành cập nhật. Thắc mắc liên hệ ${UI.esc(CONFIG.brand.supportHotline)}.</p>
        </div></div>
      </div>`;
    }
    return App.sellerShell('C-02', `<div class="page-title"><div><h1>Gói của tôi</h1><p>Mã kích hoạt và thiết bị đã kích hoạt</p></div></div>${body}`);
  },

  // =====================================================================
  // C-03 · Ví & rút tiền
  // =====================================================================
  C03: function(q) {
    const u = Store.currentSeller(); const w = Store.wallet(u.id); const pol = Store.currentPolicy();
    if (q.get('withdraw')) this.state.wdStep = 'form';
    const html = `<div class="stack-lg">
      <div class="page-title"><div><h1>Ví & rút tiền</h1><p>Số dư hoa hồng và lịch sử biến động</p></div></div>
      <div class="grid-2 grid-2-wide">
        <div class="wallet-hero">
          <div class="label">Số dư khả dụng</div><div class="amount">${UI.money(w.available)}</div>
          <div class="split"><div><div class="label">Đang chờ duyệt</div><div class="v">${UI.money(w.pending)}</div></div><div><div class="label">Tổng đã rút</div><div class="v">${UI.money(w.withdrawn)}</div></div></div>
          ${w.held ? `<div class="text-sm mt-2" style="color:var(--sky-200)">Đang giữ cho yêu cầu rút chưa xử lý: ${UI.money(w.held)}</div>` : ''}
          <button class="btn btn-accent btn-lg btn-block" onclick="Seller.wdStart()" ${w.available < pol.minWithdraw ? 'disabled' : ''}>${UI.icon('cash', 20)} Tạo yêu cầu rút tiền</button>
          ${w.available < pol.minWithdraw ? `<div class="text-sm mt-2" style="color:var(--sky-200)">Cần tối thiểu ${UI.money(pol.minWithdraw)} để rút.</div>` : ''}
        </div>
        <div id="wd-panel">${this.state.wdStep ? '' : this.wdInfo(pol)}</div>
      </div>
      <div class="card">
        <div class="tabs" role="tablist">
          <button class="tab ${this.state.wdTab === 'ledger' ? 'is-active' : ''}" role="tab" onclick="Seller.state.wdTab='ledger'; App.reload()">${UI.icon('history', 18)} Sổ cái</button>
          <button class="tab ${this.state.wdTab === 'requests' ? 'is-active' : ''}" role="tab" onclick="Seller.state.wdTab='requests'; App.reload()">${UI.icon('file', 18)} Lịch sử rút tiền <span class="count">${Store.withdrawalsOf(u.id).length}</span></button>
        </div>
        <div class="card-body" id="c03-tab">${this.state.wdTab === 'ledger' ? this.ledger(u) : this.requests(u)}</div>
      </div>
    </div>`;
    if (this.state.wdStep) App.after(() => this.wdRender());
    return App.sellerShell('C-03', html);
  },
  wdInfo: function(pol) {
    return `<div class="card card-soft"><div class="card-body"><h3>Quy định rút tiền</h3><ul class="pkg-benefits">
      <li>${UI.icon('check', 16)}<span>Rút tối thiểu <strong>${UI.money(pol.minWithdraw)}</strong> / lần (theo chính sách v${pol.version}).</span></li>
      <li>${UI.icon('check', 16)}<span>Hoa hồng khả dụng sau <strong>${pol.holdingDays} ngày</strong> kể từ khi đơn thanh toán và được admin duyệt.</span></li>
      <li>${UI.icon('check', 16)}<span>Cần xác thực OTP và tài khoản ngân hàng đứng tên bạn kèm số CCCD.</span></li>
      <li>${UI.icon('check', 16)}<span>Xử lý trong 1–3 ngày làm việc. Theo dõi trạng thái tại tab Lịch sử rút tiền.</span></li></ul></div></div>`;
  },
  ledger: function(u) {
    const rows = Store.ledger(u.id);
    if (!rows.length) return UI.empty('history', 'Chưa có biến động', 'Sổ cái ghi lại từng khoản hoa hồng và rút tiền của bạn.');
    return `<ul class="ledger">${rows.slice(0, 30).map(r => `<li><div><div class="ledger-desc">${UI.esc(LABELS.ledger[r.type])}</div><div class="ledger-meta">${UI.dt(r.at)} · <span class="mono">${UI.esc(r.ref)}</span></div></div>
      <div class="ledger-amt ${r.effect > 0 ? 'amt-in' : r.effect < 0 ? 'amt-out' : 'amt-hold'}">${r.effect > 0 ? '+' : r.effect < 0 ? '−' : ''}${UI.money(r.amount)}<span class="ledger-bal">Số dư ${UI.money(r.balance)}</span></div></li>`).join('')}</ul>`;
  },
  requests: function(u) {
    const list = Store.withdrawalsOf(u.id).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    if (!list.length) return UI.empty('cash', 'Chưa có yêu cầu rút tiền', 'Bấm "Tạo yêu cầu rút tiền" khi số dư khả dụng đạt ngưỡng.');
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Ngày tạo</th><th class="num">Số tiền</th><th>Nhận về</th><th>Trạng thái</th></tr></thead>
      <tbody>${list.map(w => `<tr><td class="mono">${UI.esc(w.id)}</td><td>${UI.dt(w.createdAt)}</td><td class="num mono text-strong">${UI.money(w.amount)}</td><td>${UI.esc(w.bank.bankName)} <span class="cell-sub mono">${UI.esc(RULES.maskAccount(w.bank.accountNo))}</span></td>
        <td>${UI.badge('withdrawal', w.status)}${w.status === 'REJECTED' ? `<span class="cell-sub text-error">${UI.esc(w.reason)}</span>` : ''}${w.status === 'PAID' ? `<span class="cell-sub">Đã chi ${UI.date(w.paidAt)}</span>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  },

  // ---- Luồng rút tiền: số tiền → ngân hàng + CCCD → OTP → xác nhận ----
  wdStart: function() { this.state.wdStep = 'form'; this.wdRender(); document.getElementById('wd-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  wdCancel: function() { this.state.wdStep = null; this.state.wdDraft = null; App.reload(); },
  wdRender: function() {
    const u = Store.currentSeller(); const w = Store.wallet(u.id); const pol = Store.currentPolicy();
    const panel = document.getElementById('wd-panel'); if (!panel) return;
    const step = this.state.wdStep;
    const steps = `<div class="steps mb-4">${[['form', 'Thông tin'], ['otp', 'OTP'], ['done', 'Xong']].map(([k, l], i) => `<div class="step ${step === k ? 'is-active' : ''} ${['form', 'otp', 'done'].indexOf(step) > i ? 'is-done' : ''}"><span class="step-dot">${['form', 'otp', 'done'].indexOf(step) > i ? UI.icon('check', 14) : i + 1}</span><span>${l}</span></div>${i < 2 ? '<span class="step-line"></span>' : ''}`).join('')}</div>`;
    if (step === 'form') {
      const d = this.state.wdDraft || { amount: '', bankName: u.bank ? u.bank.bankName : CONFIG.banks[0], accountNo: u.bank ? u.bank.accountNo : '', owner: u.bank ? u.bank.owner : '', cccd: u.cccd || '' };
      panel.innerHTML = `<div class="card"><div class="card-head"><h2>Tạo yêu cầu rút tiền</h2><button class="btn btn-ghost btn-sm" onclick="Seller.wdCancel()">Huỷ</button></div><div class="card-body">${steps}
        <form novalidate onsubmit="Seller.wdSubmitForm(event)">
          ${UI.field({ id: 'wd-amount', label: 'Số tiền muốn rút', required: true, type: 'text', mono: true, value: d.amount, placeholder: '0', hint: `Khả dụng ${UI.money(w.available)} · tối thiểu ${UI.money(pol.minWithdraw)}`, attrs: 'inputmode="numeric"' })}
          <div class="quick-amounts mt-2">${[500000, 1000000, 2000000].filter(a => a <= w.available).map(a => `<button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('wd-amount').value='${a}'">${UI.money(a)}</button>`).join('')}<button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('wd-amount').value='${w.available}'">Rút hết</button></div>
          <h3 class="mt-6 mb-2">Tài khoản nhận tiền</h3>
          <div class="form-grid form-grid-2">
            ${UI.field({ id: 'wd-bank', label: 'Ngân hàng', required: true, type: 'select', value: d.bankName, options: CONFIG.banks.map(b => ({ value: b, label: b })) })}
            ${UI.field({ id: 'wd-acc', label: 'Số tài khoản', required: true, mono: true, value: d.accountNo, attrs: 'inputmode="numeric"' })}
            ${UI.field({ id: 'wd-owner', label: 'Chủ tài khoản', required: true, value: d.owner, placeholder: 'NGUYEN VAN A', hint: 'Viết in hoa không dấu, trùng tên CCCD' })}
            ${UI.field({ id: 'wd-cccd', label: 'Số CCCD', required: true, mono: true, value: d.cccd, placeholder: '12 số', attrs: 'inputmode="numeric" maxlength="12"' })}
          </div>
          <p class="text-caption mt-3">Thông tin ngân hàng và CCCD được lưu vào hồ sơ để dùng cho các lần rút sau.</p>
          <div class="actions"><button class="btn btn-primary btn-lg btn-block">Tiếp tục ${UI.icon('arrow-right', 18)}</button></div>
        </form></div></div>`;
    } else if (step === 'otp') {
      panel.innerHTML = `<div class="card"><div class="card-head"><h2>Xác thực OTP</h2><button class="btn btn-ghost btn-sm" onclick="Seller.wdCancel()">Huỷ</button></div><div class="card-body">${steps}
        <div class="modal-summary mb-4"><dl><dt>Số tiền</dt><dd>${UI.money(this.state.wdDraft.amount)}</dd><dt>Nhận về</dt><dd>${UI.esc(this.state.wdDraft.bankName)} · ${UI.esc(RULES.maskAccount(this.state.wdDraft.accountNo))}</dd></dl></div>
        <div id="wd-otp"></div></div></div>`;
      UI.otp.mount('wd-otp', { phone: u.phone, verifyText: 'Xác nhận rút tiền', onBack: () => { this.state.wdStep = 'form'; this.wdRender(); }, onVerified: () => this.wdConfirm() });
    } else if (step === 'done') {
      const wd = this.state.wdLast;
      panel.innerHTML = `<div class="card"><div class="card-body">${steps}<div class="text-center stack"><div class="result-icon is-success" style="margin:0 auto">${UI.icon('check-circle', 34)}</div><h2>Đã gửi yêu cầu rút tiền</h2>
        <p class="text-muted">Mã yêu cầu <span class="mono text-strong">${UI.esc(wd.id)}</span> · ${UI.money(wd.amount)}. Bộ phận vận hành duyệt và chi trong 1–3 ngày làm việc. Số tiền đã tạm giữ khỏi số dư khả dụng.</p>
        <div class="actions"><button class="btn btn-primary btn-lg" onclick="Seller.state.wdStep=null; Seller.state.wdTab='requests'; App.reload()">Xem lịch sử rút tiền</button></div></div></div></div>`;
    }
  },
  wdSubmitForm: function(e) {
    e.preventDefault();
    const u = Store.currentSeller(); const w = Store.wallet(u.id); const pol = Store.currentPolicy();
    const amount = Number(UI.val('wd-amount').replace(/\D/g, '')); const bankName = UI.val('wd-bank'); const accountNo = UI.val('wd-acc'); const owner = UI.val('wd-owner').toUpperCase(); const cccd = UI.val('wd-cccd');
    ['wd-amount', 'wd-acc', 'wd-owner', 'wd-cccd'].forEach(id => UI.setError(id, ''));
    let ok = true;
    const v = RULES.validateWithdrawal(amount, w.available, pol); if (!v.ok) { UI.setError('wd-amount', v.message); ok = false; }
    if (!/^\d{6,16}$/.test(accountNo)) { UI.setError('wd-acc', 'Số tài khoản gồm 6–16 chữ số.'); ok = false; }
    if (owner.length < 4) { UI.setError('wd-owner', 'Vui lòng nhập tên chủ tài khoản.'); ok = false; }
    if (!/^\d{12}$/.test(cccd)) { UI.setError('wd-cccd', 'Số CCCD gồm 12 chữ số.'); ok = false; }
    if (!ok) { UI.focusFirstError(); return; }
    this.state.wdDraft = { amount, bankName, accountNo, owner, cccd };
    this.state.wdStep = 'otp'; this.wdRender();
  },
  wdConfirm: function() {
    const u = Store.currentSeller(); const d = this.state.wdDraft;
    UI.confirm({ title: 'Xác nhận yêu cầu rút tiền', body: 'Kiểm tra lại thông tin trước khi gửi. Số tiền sẽ được tạm giữ khỏi số dư khả dụng cho đến khi xử lý xong.',
      summary: [['Số tiền', '<strong>' + UI.money(d.amount) + '</strong>'], ['Ngân hàng', UI.esc(d.bankName)], ['Số tài khoản', '<span class="mono">' + UI.esc(d.accountNo) + '</span>'], ['Chủ tài khoản', UI.esc(d.owner)], ['CCCD', '<span class="mono">' + UI.esc(RULES.maskCccd(d.cccd)) + '</span>']],
      confirmText: 'Gửi yêu cầu', cancelText: 'Quay lại',
      onConfirm: () => { const wd = Store.createWithdrawal(u.id, d.amount, { bankName: d.bankName, accountNo: d.accountNo, owner: d.owner }, d.cccd); this.state.wdLast = wd; this.state.wdStep = 'done'; this.state.wdDraft = null; App.reload(); } });
  },

  // =====================================================================
  // Hồ sơ tối giản
  // =====================================================================
  profile: function(q) {
    const u = Store.currentSeller(); const ref = u.referrerId ? Store.user(u.referrerId) : null;
    const html = `<div class="page-title"><div><h1>Hồ sơ của tôi</h1><p>Thông tin dùng để giao hàng và chi trả hoa hồng</p></div></div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><h2>Thông tin cá nhân</h2></div><div class="card-body">
          <form novalidate onsubmit="Seller.saveProfile(event)">
            ${UI.field({ id: 'pf-name', label: 'Họ và tên', required: true, value: u.fullName })}
            ${UI.field({ id: 'pf-phone', label: 'Số điện thoại (định danh, không đổi)', value: u.phone, mono: true, attrs: 'readonly' })}
            ${UI.field({ id: 'pf-address', label: 'Địa chỉ', required: true, type: 'textarea', rows: 2, value: u.address })}
            <div class="actions"><button class="btn btn-primary btn-lg">Lưu thay đổi</button></div>
          </form></div></div>
        <div class="stack">
          <div class="card"><div class="card-head"><h2>Tài khoản seller</h2></div><div class="card-body"><dl class="dl dl-stack">
            <dt>Mã giới thiệu</dt><dd class="mono">${UI.esc(u.refCode)}</dd>
            <dt>Người giới thiệu</dt><dd>${ref ? UI.esc(ref.fullName) + ' · <span class="mono">' + UI.esc(ref.refCode) + '</span>' : 'Không có (seller gốc)'}</dd>
            <dt>Ngày tham gia</dt><dd>${UI.date(u.createdAt)}</dd>
            <dt>Trạng thái</dt><dd>${UI.badge('user', u.status)}</dd></dl></div></div>
          <div class="card"><div class="card-head"><h2>Chi trả hoa hồng</h2></div><div class="card-body"><dl class="dl dl-stack">
            <dt>Ngân hàng nhận</dt><dd>${u.bank ? UI.esc(u.bank.bankName) + ' · <span class="mono">' + UI.esc(RULES.maskAccount(u.bank.accountNo)) + '</span> · ' + UI.esc(u.bank.owner) : '<span class="text-muted">Chưa có — nhập khi tạo yêu cầu rút tiền</span>'}</dd>
            <dt>CCCD</dt><dd class="mono">${u.cccd ? UI.esc(RULES.maskCccd(u.cccd)) : '<span class="text-muted">Chưa có</span>'}</dd></dl>
            <div class="actions"><a class="btn btn-outline" href="#C-03?withdraw=1">Cập nhật tại màn rút tiền</a></div></div></div>
        </div>
      </div>`;
    return App.sellerShell('', html);
  },
  saveProfile: function(e) {
    e.preventDefault();
    const u = Store.currentSeller(); const name = UI.val('pf-name'); const address = UI.val('pf-address');
    UI.setError('pf-name', ''); UI.setError('pf-address', '');
    if (name.length < 2) { UI.setError('pf-name', 'Vui lòng nhập họ tên.'); return; }
    if (address.length < 8) { UI.setError('pf-address', 'Vui lòng nhập địa chỉ đầy đủ.'); return; }
    Store.updateSellerProfile(u.id, { fullName: name, address }); UI.toast('Đã lưu hồ sơ.'); App.reload();
  }
};
