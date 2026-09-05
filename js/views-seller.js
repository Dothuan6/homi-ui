/**
 * Nhóm C · Dashboard thành viên (spec v3, 7.3) — C-01 Tổng quan · C-02 Gói & mã · C-03 Ví & rút tiền · Hồ sơ
 */
const Seller = {
  state: { period: CONFIG.defaultPeriod, from: '', to: '', cmKind: '', cmPage: 1, wdTab: 'requests', wdStep: null },

  range: function() {
    const days = { week: 7, month: 30, quarter: 90 }[this.state.period];
    if (this.state.period === 'custom' && this.state.from) { const to = this.state.to ? new Date(this.state.to + 'T23:59:59') : new Date(); return { from: new Date(this.state.from + 'T00:00:00').toISOString(), to: to.toISOString(), label: RULES.formatDate(this.state.from) + ' – ' + RULES.formatDate(to.toISOString()) }; }
    const d = days || 30; return { from: new Date(Date.now() - d * 86400000).toISOString(), to: new Date().toISOString(), label: d + ' ngày' };
  },
  periodSeg: function() {
    return `<div class="row-wrap"><div class="seg" role="group" aria-label="Kỳ thống kê">${CONFIG.periods.map(p => `<button class="${this.state.period === p.id ? 'is-active' : ''}" onclick="Seller.setPeriod('${p.id}')">${p.label}</button>`).join('')}</div>
      ${this.state.period === 'custom' ? `<div class="row"><input type="date" class="input" style="min-height:40px;width:auto" id="rg-from" value="${UI.esc(this.state.from)}" aria-label="Từ ngày"><span>–</span><input type="date" class="input" style="min-height:40px;width:auto" id="rg-to" value="${UI.esc(this.state.to)}" aria-label="Đến ngày"><button class="btn btn-secondary btn-sm" onclick="Seller.applyRange()">Áp dụng</button></div>` : ''}</div>`;
  },
  setPeriod: function(id) { this.state.period = id; this.state.cmPage = 1; if (id === 'custom' && !this.state.from) { this.state.from = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10); this.state.to = new Date().toISOString().slice(0, 10); } App.reload(); },
  applyRange: function() { const f = UI.val('rg-from'), t = UI.val('rg-to'); if (!f) { UI.toast('Chọn ngày bắt đầu.', 'warning'); return; } if (t && t < f) { UI.toast('Ngày kết thúc phải sau ngày bắt đầu.', 'warning'); return; } this.state.from = f; this.state.to = t; this.state.cmPage = 1; App.reload(); },
  sourceLabel: function(c) { return c.kind === 'SELF' ? 'Tự bán' : c.kind === 'COMPANY' ? 'Về công ty' : 'F' + c.depth; },

  // =====================================================================
  // C-01 · Tổng quan
  // =====================================================================
  C01: function() {
    const u = Store.currentAgent(); const rk = RULES.rank(u.rank); const nx = RULES.nextRank(u.rank); const need = RULES.salesToNextRank(u.cumulativeSales, u.rank);
    const sold = Store.salesThisMonth(u.id); const rr = Store.rules().rankRules; const w = Store.wallet(u.id); const cw = Store.canWithdraw(u.id);
    const refUrl = RULES.referralUrl(u.refCode); const aliasUrl = RULES.purchaseUrl(u.purchaseAlias);
    const pct = nx ? Math.min(100, Math.round(((u.cumulativeSales - rk.threshold) / Math.max(1, nx.threshold - rk.threshold)) * 100)) : 100;
    const html = `<div class="stack-lg">
      <div class="page-title"><div><h1>Xin chào, ${UI.esc(u.fullName)}</h1><p class="row-wrap">${UI.badge('rank', u.rank, true)}<span>Mã giới thiệu <span class="mono text-strong">${UI.esc(u.refCode)}</span> · thành viên từ ${UI.date(u.activatedAt || u.createdAt)}</span></p></div></div>

      <div class="grid-2 grid-2-wide">
        <div class="card"><div class="card-head"><h2>Link của bạn</h2>${RULES.canRecruit(u.rank) ? '<span class="text-sm text-muted">Khách mua qua link được tính vào tuyến của bạn</span>' : '<span class="badge badge-warning">Hạng Copper: chỉ bán, chưa được tuyển thành viên</span>'}</div>
          <div class="card-body stack">
            <div><div class="field-label mb-2">Link giới thiệu (ref_code)</div><div class="ref-url"><input class="input" readonly value="${UI.esc(refUrl)}" aria-label="Link giới thiệu" onclick="this.select()"><button class="btn btn-primary" onclick="UI.copy('${UI.esc(refUrl)}', 'Đã sao chép link giới thiệu.')">${UI.icon('copy', 18)} Sao chép</button></div></div>
            <div><div class="field-label mb-2">Link mua hàng cá nhân · <span class="mono">${UI.esc(RULES.publicPurchaseUrl(u.purchaseAlias))}</span></div><div class="ref-url"><input class="input" readonly value="${UI.esc(aliasUrl)}" aria-label="Link mua hàng cá nhân" onclick="this.select()"><button class="btn btn-secondary" onclick="UI.copy('${UI.esc(aliasUrl)}', 'Đã sao chép link mua hàng cá nhân.')">${UI.icon('copy', 18)} Sao chép</button></div></div>
            <div class="share-row"><button class="btn btn-secondary share-btn" onclick="Seller.shareZalo('${UI.esc(aliasUrl)}')"><span class="share-mark share-zalo">Z</span> Zalo</button><button class="btn btn-secondary share-btn" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('${UI.esc(aliasUrl)}'), '_blank', 'noopener')"><span class="share-mark share-fb">f</span> Facebook</button><button class="btn btn-secondary share-btn" onclick="UI.share('${UI.esc(aliasUrl)}', 'Gói Bác sĩ 24/7 HOMI365')">${UI.icon('share', 18)} Khác</button></div>
            <p class="text-caption">Mở thử trong prototype: <a href="${RULES.referralHash(u.refCode)}" target="_blank" rel="noopener">${RULES.referralHash(u.refCode)}</a> · <a href="${RULES.purchaseHash(u.purchaseAlias)}" target="_blank" rel="noopener">${RULES.purchaseHash(u.purchaseAlias)}</a></p>
          </div></div>
        <div class="stack">
          <div class="card card-tint"><div class="card-body">
            <div class="row-between"><h2 style="font-size:var(--fs-lg)">Hạng & điểm</h2>${UI.badge('rank', u.rank, true)}</div>
            <div class="stat-grid mt-3" style="grid-template-columns:1fr 1fr"><div><div class="stat-label">Điểm tích luỹ</div><div class="stat-value">${UI.num(w.points)}</div><div class="stat-sub">1 điểm = 1đ hoa hồng</div></div><div><div class="stat-label">Gói bán luỹ kế</div><div class="stat-value">${UI.num(u.cumulativeSales)}</div><div class="stat-sub">${nx ? 'Còn thiếu ' + need + ' gói lên ' + nx.label : 'Hạng cao nhất'}</div></div></div>
            ${nx ? `<div class="progress mt-3"><span style="width:${pct}%"></span></div><div class="text-caption mt-1">${rk.label} (${rk.threshold}) → ${nx.label} (${nx.threshold})</div>` : ''}
            <div class="mt-3 ${sold < rr.minSalesPerMonth ? 'alert alert-warning' : 'alert alert-success'}">${UI.icon(sold < rr.minSalesPerMonth ? 'warning' : 'check-circle', 18)}<div class="text-sm">Tháng này đã bán <strong>${sold}</strong> gói. ${sold < rr.minSalesPerMonth ? 'Cần tối thiểu ' + rr.minSalesPerMonth + ' gói/tháng để giữ hạng — nếu không sẽ giáng 1 bậc vào cuối tháng.' : 'Đã đủ điều kiện giữ hạng tháng này.'}</div></div>
            <div class="mt-2 text-right"><a href="#C-PROFILE" class="btn-link">Lịch sử thăng/giáng hạng ${UI.icon('arrow-right', 14)}</a></div>
          </div></div>
          <div class="ref-qr">${UI.qrSvg(aliasUrl, 150)}<div class="qr-label">QR link mua hàng cá nhân</div><button class="btn btn-ghost btn-sm mt-1" onclick="Seller.downloadQr('${UI.esc(u.purchaseAlias)}')">${UI.icon('download', 16)} Tải QR</button></div>
        </div>
      </div>

      <div class="card"><div class="card-head"><h2>Thống kê</h2>${this.periodSeg()}</div><div class="card-body" id="c01-stats">${UI.skeletonCards(2)}</div></div>

      <div class="card"><div class="card-head"><h2>Hoa hồng</h2><button class="btn btn-accent" ${cw.ok ? '' : 'disabled'} title="${cw.ok ? '' : UI.esc(cw.message)}" onclick="App.navigate('C-03?withdraw=1')">${UI.icon('cash', 18)} Rút tiền</button></div>
        <div class="card-body">
          <div class="stat-grid stat-grid-4">
            <div class="stat"><div class="stat-label">${UI.icon('check-circle', 16)} Đã ghi nhận</div><div class="stat-value">${UI.money(w.recorded)}</div><div class="stat-sub">Tổng hoa hồng từ khi tham gia</div></div>
            <div class="stat"><div class="stat-label">${UI.icon('clock', 16)} Đang chờ duyệt rút</div><div class="stat-value text-warning">${UI.money(w.held)}</div></div>
            <div class="stat"><div class="stat-label">${UI.icon('cash', 16)} Đã rút</div><div class="stat-value">${UI.money(w.withdrawn)}</div></div>
            <div class="stat stat-navy stat-clickable" onclick="App.navigate('C-03')"><div class="stat-label">${UI.icon('wallet', 16)} Khả dụng</div><div class="stat-value">${UI.money(w.available)}</div><div class="stat-sub">Xem ví ${UI.icon('arrow-right', 12)}</div></div>
          </div>
          ${cw.ok ? '' : `<p class="text-sm text-muted mt-3">${UI.icon('info', 14)} ${UI.esc(cw.message)}</p>`}
          <div id="c01-cmchart" class="mt-4"></div>
        </div></div>

      <div class="card"><div class="card-head"><h2>Bảng kê hoa hồng</h2><div class="row-wrap">
          <select class="select" style="min-height:40px;width:auto" aria-label="Lọc nguồn" onchange="Seller.state.cmKind=this.value; Seller.state.cmPage=1; Seller.renderCommissions()"><option value="">Tất cả nguồn</option><option value="SELF" ${this.state.cmKind === 'SELF' ? 'selected' : ''}>Tự bán</option><option value="DIFF" ${this.state.cmKind === 'DIFF' ? 'selected' : ''}>Chênh lệch tuyến dưới</option></select>
          <button class="btn btn-secondary btn-sm" onclick="Seller.exportCommissions()">${UI.icon('download', 16)} Xuất Excel</button></div></div>
        <div class="card-body" id="c01-cm">${UI.skeletonTable(6, 5)}</div></div>

      <div class="card"><div class="card-head"><h2>Tuyến dưới trực tiếp (F1)</h2><span class="text-sm text-muted">${Store.downline(u.id).filter(x => x.type === 'agent').length} thành viên</span></div><div class="card-body">${this.f1Table(u)}</div></div>
    </div>`;
    App.after(() => { UI.withLoading('c01-stats', UI.skeletonCards(2), () => this.renderStats()); UI.withLoading('c01-cm', UI.skeletonTable(6, 5), () => this.renderCommissions()); this.renderCmChart(); });
    return App.sellerShell('C-01', html);
  },
  shareZalo: function(url) { UI.copy(url, 'Đã sao chép link — dán vào tin nhắn Zalo để chia sẻ.'); window.open('https://zalo.me/', '_blank', 'noopener'); },
  downloadQr: function(alias) { const svg = UI.qrSvg(RULES.purchaseUrl(alias), 512); const blob = new Blob([svg], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'homi365-qr-' + alias + '.svg'; document.body.appendChild(a); a.click(); a.remove(); UI.toast('Đã tải mã QR.'); },
  renderStats: function() {
    const u = Store.currentAgent(); const r = this.range(); const st = Store.agentStats(u.id, r.from, r.to);
    const series = Store.agentSeries(u.id, r.from, r.to).map(s => ({ label: UI.dayLabel(s.date), bar: s.paid, line: s.clicks }));
    const el = document.getElementById('c01-stats'); if (!el) return;
    el.innerHTML = `<div class="stat-grid stat-grid-6">
        <div class="stat"><div class="stat-label">${UI.icon('external', 16)} Lượt click</div><div class="stat-value">${UI.num(st.clicks)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('inbox', 16)} Đơn đã đặt</div><div class="stat-value">${UI.num(st.orders)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('check-circle', 16)} Đơn thanh toán</div><div class="stat-value">${UI.num(st.paid)}</div><div class="stat-sub">Chuyển đổi ${RULES.formatPercent(st.conversion, 1)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('bars', 16)} Doanh số kỳ</div><div class="stat-value">${UI.money(st.revenue)}</div></div>
        <div class="stat stat-accent"><div class="stat-label">${UI.icon('cash', 16)} Hoa hồng kỳ</div><div class="stat-value">${UI.money(st.commission)}</div></div>
        <div class="stat"><div class="stat-label">${UI.icon('calendar', 16)} Kỳ</div><div class="stat-value" style="font-size:var(--fs-md)">${UI.esc(r.label)}</div></div>
      </div>
      <div class="mt-6"><h3 class="mb-2">Xu hướng đơn & click</h3>${UI.chart.combo(series, { height: 220, barName: 'đơn thanh toán', lineName: 'click', aria: 'Biểu đồ đơn thanh toán và lượt click theo ngày', legend: [{ text: 'Đơn thanh toán (cột)' }, { text: 'Lượt click (đường)', cls: 'legend-line' }] })}</div>`;
  },
  renderCmChart: function() { const u = Store.currentAgent(); const r = this.range(); const el = document.getElementById('c01-cmchart'); if (!el) return; const series = Store.agentSeries(u.id, r.from, r.to).map(s => ({ label: UI.dayLabel(s.date), bar: s.commission / 1000000 })); el.innerHTML = `<h3 class="mb-2">Hoa hồng ghi nhận theo ngày (triệu đồng) · ${UI.esc(r.label)}</h3>${UI.chart.combo(series, { height: 180, barName: 'triệu đ', accent: true, yFormat: (v) => v.toFixed(1), aria: 'Hoa hồng theo ngày' })}`; },
  filteredCommissions: function() { const u = Store.currentAgent(); const r = this.range(); return Store.commissionsOf(u.id).filter(c => c.createdAt >= r.from && c.createdAt <= r.to && (!this.state.cmKind || c.kind === this.state.cmKind)).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1); },
  renderCommissions: function() {
    const el = document.getElementById('c01-cm'); if (!el) return; const list = this.filteredCommissions();
    if (!list.length) { el.innerHTML = UI.empty('cash', 'Chưa có khoản hoa hồng trong kỳ', 'Hoa hồng ghi nhận ngay khi đơn của bạn hoặc tuyến dưới thanh toán thành công.'); return; }
    const pg = UI.paginate(list, this.state.cmPage); const total = list.reduce((s, c) => s + (c.status === 'RECORDED' ? c.amount : 0), 0);
    el.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Ngày</th><th>Đơn</th><th>Nguồn</th><th>Hạng lúc tính</th><th class="num">Số tiền</th><th>Trạng thái</th></tr></thead>
      <tbody>${pg.rows.map(c => { const o = Store.order(c.orderId); const seller = o && o.sellerId ? Store.user(o.sellerId) : null; return `<tr><td>${UI.date(c.createdAt)}</td><td><span class="cell-main mono">${UI.esc(c.orderId)}</span><span class="cell-sub">${o ? UI.esc(o.fullName) + ' · ' + RULES.maskPhone(o.phone) : ''}</span></td><td><span class="badge badge-${c.kind === 'SELF' ? 'navy' : 'info'} badge-plain">${this.sourceLabel(c)}</span>${c.kind === 'DIFF' && seller ? `<span class="cell-sub">bán bởi ${UI.esc(seller.fullName)} (${RULES.rank(o.referrerRankAtOrder || seller.rank).label})</span>` : ''}</td><td>${UI.badge('rank', c.rankAtCalc)}</td><td class="num mono text-strong">${UI.money(c.amount)}</td><td>${UI.badge('commission', c.status)}</td></tr>`; }).join('')}</tbody>
      <tfoot><tr><th colspan="4">Tổng ${list.length} khoản</th><th class="num">${UI.money(total)}</th><th></th></tr></tfoot></table></div>${UI.pagination(pg, 'Seller.gotoCmPage')}`;
  },
  gotoCmPage: function(p) { this.state.cmPage = p; this.renderCommissions(); },
  exportCommissions: function() { const rows = this.filteredCommissions().map(c => [UI.date(c.createdAt), c.orderId, this.sourceLabel(c), RULES.rank(c.rankAtCalc).label, c.amount, LABELS.commission[c.status].text]); if (!rows.length) { UI.toast('Không có dữ liệu để xuất.', 'warning'); return; } UI.exportCsv('bang-ke-hoa-hong-' + Store.currentAgent().refCode + '.csv', ['Ngày', 'Đơn', 'Nguồn', 'Hạng lúc tính', 'Số tiền (đ)', 'Trạng thái'], rows); },
  f1Table: function(u) {
    const list = Store.downline(u.id).filter(x => x.type === 'agent');
    if (!list.length) return UI.empty('users', 'Chưa có tuyến dưới', RULES.canRecruit(u.rank) ? 'Khách mua qua link của bạn và đăng ký thành viên sẽ xuất hiện ở đây.' : 'Lên hạng Silver để được tuyển thành viên.');
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Thành viên</th><th>Hạng</th><th class="num">Luỹ kế</th><th class="num">Bán tháng này</th><th class="num">Tuyến dưới</th><th>Tham gia</th><th>Trạng thái</th></tr></thead><tbody>${list.map(d => `<tr><td><span class="cell-main">${UI.esc(d.fullName)}</span><span class="cell-sub mono">${RULES.maskPhone(d.phone)} · ${UI.esc(d.refCode)}</span></td><td>${UI.badge('rank', d.rank)}</td><td class="num">${d.cumulativeSales}</td><td class="num">${Store.salesThisMonth(d.id)}</td><td class="num">${Store.downline(d.id).filter(x => x.type === 'agent').length}</td><td>${UI.date(d.activatedAt || d.createdAt)}</td><td>${UI.badge('user', d.status)}</td></tr>`).join('')}</tbody></table></div>`;
  },

  // =====================================================================
  // C-02 · Gói của tôi & mã kích hoạt
  // =====================================================================
  C02: function() {
    const u = Store.currentAgent(); const order = Store.agentPackageOrder(u.phone); let body;
    if (!order) body = `<div class="card"><div class="card-body">${UI.empty('package', 'Chưa có gói nào', 'Tài khoản này chưa gắn với đơn hàng thanh toán thành công.')}</div></div>`;
    else {
      const pkg = Store.pkg(order.packageId); const code = order.licenseCode ? Store.codeInfo(order.licenseCode) : null; const activated = code && code.status === 'ACTIVATED';
      body = `<div class="grid-2 grid-2-wide"><div class="stack">
        <div class="card"><div class="card-body">${Buyer.pkgHeader(pkg, { tag: 'div' })}<div class="mt-4">
          ${order.licenseCode ? `<div class="code-box code-box-lg"><div class="grow"><span class="code-label">Mã kích hoạt</span><span class="code-value">${UI.esc(order.licenseCode)}</span></div><button class="btn btn-secondary btn-icon" aria-label="Sao chép mã kích hoạt" onclick="UI.copy('${UI.esc(order.licenseCode)}', 'Đã sao chép mã kích hoạt.')">${UI.icon('copy', 20)}</button></div><div class="row-between mt-3"><span class="text-sm text-muted">Trạng thái mã</span>${UI.badge('license', code ? code.status : 'ASSIGNED', true)}</div>${code ? `<div class="text-sm text-muted mt-1">Thiết bị: <span class="mono">${UI.esc(code.deviceSku)} · ${UI.esc(code.deviceSerial || '')}</span></div>` : ''}` : `<div class="alert alert-warning">${UI.icon('clock', 20)}<div><span class="alert-title">Mã kích hoạt đang chờ cấp</span>Sẽ gửi qua SMS ngay khi có mã.</div></div>`}</div>
          <div class="mt-4 alert alert-info">${UI.icon('device', 20)}<div class="text-sm">Kích hoạt gói bằng cách nhập mã trong <strong>ứng dụng HOMI365</strong>. Mã chỉ gắn được với 1 thiết bị.</div></div>
          ${order.licenseCode && !activated ? `<div class="actions"><button class="btn btn-outline btn-lg btn-block" onclick="Store.resendCodeSms('${u.id}'); UI.toast('Đã gửi lại mã kích hoạt qua SMS tới ${RULES.maskPhone(u.phone)}.')">${UI.icon('sms', 18)} Gửi lại mã qua SMS</button></div>` : ''}
        </div></div>
        <div class="card"><div class="card-head"><h2>Thiết bị đã kích hoạt</h2></div><div class="card-body">${activated ? `<div class="device"><div class="device-icon">${UI.icon('device', 24)}</div><div class="grow"><div class="text-strong">${UI.esc(code.device.name)}</div><div class="text-sm text-muted">Mã máy <span class="mono">${UI.esc(code.device.deviceId)}</span></div><div class="text-sm text-muted">Kích hoạt lúc ${UI.dt(code.activatedAt)}</div></div>${UI.badge('license', 'ACTIVATED')}</div><p class="text-sm text-muted mt-3">License hiệu lực ${pkg.licenseMonths} tháng kể từ ngày kích hoạt, đến <strong>${UI.date(new Date(new Date(code.activatedAt).getTime() + pkg.licenseMonths * 30.4 * 86400000).toISOString())}</strong>.</p>` : UI.empty('device', 'Chưa kích hoạt trên thiết bị nào', 'Sau khi nhập mã trong ứng dụng, tên máy, mã máy và thời điểm kích hoạt hiển thị tại đây.')}</div></div>
      </div>
      <div class="card"><div class="card-head"><h2>Thông tin đơn hàng</h2></div><div class="card-body"><dl class="dl dl-stack"><dt>Mã đơn</dt><dd class="mono">${UI.esc(order.id)}</dd><dt>Ngày mua</dt><dd>${UI.dt(order.paidAt || order.createdAt)}</dd><dt>Thanh toán</dt><dd>${UI.badge('orderStatus', order.status)} <span class="text-sm text-muted">${UI.esc(LABELS.method[order.method] || '')}</span></dd><dt>Giao hàng (đồng hồ HW01)</dt><dd>${UI.badge('shipping', order.shipping)}</dd><dt>Địa chỉ nhận</dt><dd>${UI.esc(order.address)}</dd><dt>Người giới thiệu</dt><dd>${order.sellerId ? UI.esc(Store.user(order.sellerId).fullName) : '—'}</dd></dl></div></div></div>`;
    }
    return App.sellerShell('C-02', `<div class="page-title"><div><h1>Gói của tôi</h1><p>Mã kích hoạt và thiết bị đã kích hoạt</p></div></div>${body}`);
  },

  // =====================================================================
  // C-03 · Ví & rút tiền (7.3.4, 7.6)
  // =====================================================================
  C03: function(q) {
    const u = Store.currentAgent(); const w = Store.wallet(u.id); const cw = Store.canWithdraw(u.id); const wr = Store.rules().withdraw;
    if (q.get('withdraw') && cw.ok) this.state.wdStep = 'form';
    const html = `<div class="stack-lg">
      <div class="page-title"><div><h1>Ví & rút tiền</h1><p>Hoa hồng ghi nhận ngay khi đơn thanh toán · rút tối đa ${CONFIG.withdraw.maxPerMonth} lần/tháng</p></div></div>
      <div class="grid-2 grid-2-wide">
        <div class="wallet-hero"><div class="label">Số dư khả dụng</div><div class="amount">${UI.money(w.available)}</div>
          <div class="split" style="grid-template-columns:repeat(3,1fr)"><div><div class="label">Đã ghi nhận</div><div class="v">${UI.money(w.recorded)}</div></div><div><div class="label">Đang chờ duyệt rút</div><div class="v">${UI.money(w.held)}</div></div><div><div class="label">Đã rút</div><div class="v">${UI.money(w.withdrawn)}</div></div></div>
          <button class="btn btn-accent btn-lg btn-block" onclick="Seller.wdStart()" ${cw.ok ? '' : 'disabled'}>${UI.icon('cash', 20)} Tạo yêu cầu rút tiền</button>
          ${cw.ok ? '' : `<div class="text-sm mt-2" style="color:var(--sky-200)">${UI.esc(cw.message)}${cw.reason === 'bank' ? ' <a href="#C-PROFILE" style="color:var(--teal-300)">Cập nhật hồ sơ</a>' : ''}</div>`}</div>
        <div id="wd-panel">${this.state.wdStep ? '' : `<div class="card card-soft"><div class="card-body"><h3>Quy định rút tiền</h3><ul class="pkg-benefits"><li>${UI.icon('check', 16)}<span>Tối đa <strong>${CONFIG.withdraw.maxPerMonth} lần/tháng</strong>, số tiền không vượt quá số dư khả dụng.</span></li><li>${UI.icon('check', 16)}<span>Yêu cầu được <strong>duyệt 2 lớp</strong> bởi bộ phận quản trị; theo dõi tiến trình 0/2 → 1/2 → Đã duyệt.</span></li><li>${UI.icon('check', 16)}<span>${UI.esc(wr.payoutNote || CONFIG.withdraw.payoutNote)} vào tài khoản ngân hàng trong hồ sơ.</span></li><li>${UI.icon('check', 16)}<span>Nếu bị từ chối, số tiền hoàn về khả dụng và bạn thấy lý do tại đây.</span></li></ul></div></div>`}</div>
      </div>
      <div class="card"><div class="tabs" role="tablist"><button class="tab ${this.state.wdTab === 'requests' ? 'is-active' : ''}" onclick="Seller.state.wdTab='requests'; App.reload()">${UI.icon('file', 18)} Lịch sử rút tiền <span class="count">${Store.withdrawalsOf(u.id).length}</span></button><button class="tab ${this.state.wdTab === 'ledger' ? 'is-active' : ''}" onclick="Seller.state.wdTab='ledger'; App.reload()">${UI.icon('history', 18)} Sổ hoa hồng</button></div>
        <div class="card-body">${this.state.wdTab === 'ledger' ? this.ledger(u) : this.requests(u)}</div></div>
    </div>`;
    if (this.state.wdStep) App.after(() => this.wdRender());
    return App.sellerShell('C-03', html);
  },
  ledger: function(u) { const rows = Store.ledger(u.id); if (!rows.length) return UI.empty('history', 'Chưa có biến động'); return `<ul class="ledger">${rows.slice(0, 40).map(r => `<li><div><div class="ledger-desc">${UI.esc(LABELS.ledger[r.type])}</div><div class="ledger-meta">${UI.dt(r.at)} · <span class="mono">${UI.esc(r.ref)}</span></div></div><div class="ledger-amt ${r.effect > 0 ? 'amt-in' : r.effect < 0 ? 'amt-out' : 'amt-hold'}">${r.effect > 0 ? '+' : r.effect < 0 ? '−' : ''}${UI.money(r.amount)}<span class="ledger-bal">Số dư ${UI.money(r.balance)}</span></div></li>`).join('')}</ul>`; },
  approvalTimeline: function(w) {
    const rows = [{ at: w.createdAt, text: 'Tạo yêu cầu' + (w.createdBy && w.createdBy !== 'agent' ? ' (tạo hộ bởi quản trị)' : '') }].concat((w.approvals || []).map(a => ({ at: a.at, text: (a.action === 'APPROVE' ? 'Xác nhận lớp ' : 'Từ chối · ') + (a.action === 'APPROVE' ? '' : (a.reason || '')) + ' — ' + (LABELS.role[a.role] ? LABELS.role[a.role].text : a.role) })));
    if (w.status === 'PAID') rows.push({ at: w.paidAt, text: 'Đã chi trả' });
    return `<ul class="timeline mt-2">${rows.map((r, i) => `<li><span class="timeline-time">${UI.dt(r.at)}</span><span class="timeline-text">${UI.esc(r.text.replace('Xác nhận lớp  —', 'Xác nhận lớp ' + i + ' —'))}</span></li>`).join('')}</ul>`;
  },
  requests: function(u) {
    const list = Store.withdrawalsOf(u.id).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    if (!list.length) return UI.empty('cash', 'Chưa có yêu cầu rút tiền', 'Bấm "Tạo yêu cầu rút tiền" khi có số dư khả dụng.');
    return `<div class="stack">${list.map(w => `<div class="order-card"><div class="order-card-head"><div><div class="text-sm text-muted">Yêu cầu</div><div class="mono text-strong">${UI.esc(w.id)}</div></div><div class="text-right"><div class="text-strong">${UI.money(w.amount)}</div><div class="text-sm text-muted">${UI.dt(w.createdAt)}</div></div></div>
      <div class="status-row">${UI.badge('withdrawal', w.status, true)}<span class="text-sm text-muted">Nhận về ${UI.esc(w.bank.bankName)} · <span class="mono">${UI.esc(RULES.maskAccount(w.bank.accountNo))}</span></span></div>
      ${w.status === 'REJECTED' ? `<div class="alert alert-error mt-3">${UI.icon('x-circle', 18)}<div class="text-sm"><span class="alert-title">Lý do từ chối</span>${UI.esc((w.approvals.find(a => a.action === 'REJECT') || {}).reason || '')}</div></div>` : ''}
      <details class="feature mt-2"><summary>Tiến trình duyệt</summary>${this.approvalTimeline(w)}</details></div>`).join('')}</div>`;
  },
  wdStart: function() { const u = Store.currentAgent(); const cw = Store.canWithdraw(u.id); if (!cw.ok) { UI.toast(cw.message, 'warning'); return; } this.state.wdStep = 'form'; this.wdRender(); const p = document.getElementById('wd-panel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  wdCancel: function() { this.state.wdStep = null; this.state.wdDraft = null; App.reload(); },
  wdRender: function() {
    const u = Store.currentAgent(); const w = Store.wallet(u.id); const panel = document.getElementById('wd-panel'); if (!panel) return; const step = this.state.wdStep;
    const steps = `<div class="steps mb-4">${[['form', 'Số tiền'], ['confirm', 'Tài khoản'], ['done', 'Đã gửi']].map(([k, l], i) => `<div class="step ${step === k ? 'is-active' : ''} ${['form', 'confirm', 'done'].indexOf(step) > i ? 'is-done' : ''}"><span class="step-dot">${['form', 'confirm', 'done'].indexOf(step) > i ? UI.icon('check', 14) : i + 1}</span><span>${l}</span></div>${i < 2 ? '<span class="step-line"></span>' : ''}`).join('')}</div>`;
    if (step === 'form') {
      const d = this.state.wdDraft || { amount: '' };
      panel.innerHTML = `<div class="card"><div class="card-head"><h2>Tạo yêu cầu rút tiền</h2><button class="btn btn-ghost btn-sm" onclick="Seller.wdCancel()">Huỷ</button></div><div class="card-body">${steps}
        <form novalidate onsubmit="Seller.wdSubmitForm(event)">${UI.field({ id: 'wd-amount', label: 'Số tiền muốn rút', required: true, mono: true, value: d.amount, placeholder: '0', hint: `Khả dụng ${UI.money(w.available)}`, attrs: 'inputmode="numeric"' })}
          <div class="quick-amounts mt-2">${[1000000, 2000000, 5000000].filter(a => a <= w.available).map(a => `<button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('wd-amount').value='${a}'">${UI.money(a)}</button>`).join('')}<button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('wd-amount').value='${w.available}'">Rút hết</button></div>
          <p class="text-caption mt-3">Chỉ được ${CONFIG.withdraw.maxPerMonth} yêu cầu/tháng. Số tiền được tạm giữ cho đến khi xử lý xong.</p>
          <div class="actions"><button class="btn btn-primary btn-lg btn-block">Tiếp tục ${UI.icon('arrow-right', 18)}</button></div></form></div></div>`;
    } else if (step === 'confirm') {
      const d = this.state.wdDraft;
      panel.innerHTML = `<div class="card"><div class="card-head"><h2>Xác nhận tài khoản nhận</h2><button class="btn btn-ghost btn-sm" onclick="Seller.wdCancel()">Huỷ</button></div><div class="card-body">${steps}
        <div class="modal-summary"><dl><dt>Số tiền</dt><dd>${UI.money(d.amount)}</dd><dt>Ngân hàng</dt><dd>${UI.esc(u.bank.bankName)}</dd><dt>Số tài khoản</dt><dd class="mono">${UI.esc(u.bank.accountNo)}</dd><dt>Chủ tài khoản</dt><dd>${UI.esc(u.bank.owner)}</dd></dl></div>
        <p class="text-sm text-muted mt-3">Tài khoản lấy từ hồ sơ đăng ký. Sai thông tin? <a href="#C-PROFILE">Sửa tại Hồ sơ</a> trước khi gửi.</p>
        <div class="actions actions-row"><button class="btn btn-secondary btn-lg" onclick="Seller.state.wdStep='form'; Seller.wdRender()">Quay lại</button><button class="btn btn-primary btn-lg" onclick="Seller.wdConfirm()">${UI.icon('check', 18)} Gửi yêu cầu</button></div></div></div>`;
    } else if (step === 'done') {
      const wd = this.state.wdLast;
      panel.innerHTML = `<div class="card"><div class="card-body">${steps}<div class="text-center stack"><div class="result-icon is-success" style="margin:0 auto">${UI.icon('check-circle', 34)}</div><h2>Đã gửi yêu cầu rút tiền</h2><p class="text-muted">Mã <span class="mono text-strong">${UI.esc(wd.id)}</span> · ${UI.money(wd.amount)} · trạng thái <strong>Chờ duyệt (0/2)</strong>. Sau khi 2 lớp duyệt, công ty chi trả ${UI.esc((Store.rules().withdraw.payoutNote || '').toLowerCase())}.</p><div class="actions"><button class="btn btn-primary btn-lg" onclick="Seller.state.wdStep=null; Seller.state.wdTab='requests'; App.reload()">Xem lịch sử rút tiền</button></div></div></div></div>`;
    }
  },
  wdSubmitForm: function(e) { e.preventDefault(); const u = Store.currentAgent(); const amount = Number(UI.val('wd-amount').replace(/\D/g, '')); UI.setError('wd-amount', ''); const cw = Store.canWithdraw(u.id, amount); if (!cw.ok) { UI.setError('wd-amount', cw.message); UI.focusFirstError(); return; } this.state.wdDraft = { amount }; this.state.wdStep = 'confirm'; this.wdRender(); },
  wdConfirm: function() { const u = Store.currentAgent(); const d = this.state.wdDraft; UI.confirm({ title: 'Gửi yêu cầu rút tiền?', body: 'Số tiền sẽ được tạm giữ khỏi số dư khả dụng cho đến khi xử lý xong. Bạn không thể tạo thêm yêu cầu trong tháng này.', summary: [['Số tiền', '<strong>' + UI.money(d.amount) + '</strong>'], ['Nhận về', UI.esc(u.bank.bankName) + ' · <span class="mono">' + UI.esc(u.bank.accountNo) + '</span>'], ['Chủ TK', UI.esc(u.bank.owner)]], confirmText: 'Gửi yêu cầu', cancelText: 'Quay lại', onConfirm: () => { const wd = Store.createWithdrawal(u.id, d.amount); this.state.wdLast = wd; this.state.wdStep = 'done'; this.state.wdDraft = null; App.reload(); } }); },

  // =====================================================================
  // Hồ sơ (7.3.6, 4.11)
  // =====================================================================
  profile: function() {
    const u = Store.currentAgent(); const ref = u.referrerId ? Store.user(u.referrerId) : null; const w = Store.wallet(u.id);
    const html = `<div class="page-title"><div><h1>Hồ sơ của tôi</h1><p>Thông tin thành viên, tài khoản nhận hoa hồng, mật khẩu</p></div></div>
      <div class="grid-2">
        <div class="stack">
          <div class="card"><div class="card-head"><h2>Thành viên</h2>${UI.badge('rank', u.rank, true)}</div><div class="card-body"><dl class="dl dl-stack">
            <dt>Hạng hiện tại</dt><dd>${RULES.rank(u.rank).label} (từ ${UI.date(u.rankSince)}) · ${UI.num(u.cumulativeSales)} gói luỹ kế · ${UI.num(w.points)} điểm</dd>
            <dt>Mã giới thiệu (ref_code)</dt><dd class="mono">${UI.esc(u.refCode)}</dd>
            <dt>Link mua hàng cá nhân</dt><dd><span class="mono">${UI.esc(RULES.publicPurchaseUrl(u.purchaseAlias))}</span> <button class="btn-link" onclick="UI.copy('${UI.esc(RULES.purchaseUrl(u.purchaseAlias))}')">Sao chép</button></dd>
            <dt>Người giới thiệu</dt><dd>${ref ? UI.esc(ref.fullName) + ' · <span class="mono">' + UI.esc(ref.refCode) + '</span> · ' + RULES.rank(ref.rank).label : 'Không có (thành viên gốc)'}</dd>
            <dt>Email</dt><dd>${UI.esc(u.email || '—')}</dd>
            <dt>Điều khoản đã chấp nhận</dt><dd>Phiên bản ${UI.esc(u.tcConsent ? u.tcConsent.version : '—')} · ${u.tcConsent ? UI.dt(u.tcConsent.at) : ''}</dd>
            <dt>Trạng thái</dt><dd>${UI.badge('user', u.status)}</dd></dl>
            <h3 class="mt-4 mb-2">Lịch sử thăng / giáng hạng</h3>
            <ul class="timeline">${(u.rankHistory || []).slice().reverse().map(h => `<li><span class="timeline-time">${UI.dt(h.at)}</span><span class="timeline-text">${UI.badge('rankEvent', h.event)} ${h.from ? RULES.rank(h.from).label + ' → ' : ''}${RULES.rank(h.to).label} · ${UI.esc(h.reason || '')}</span></li>`).join('')}</ul>
          </div></div>
          <div class="card"><div class="card-head"><h2>Đổi mật khẩu</h2></div><div class="card-body"><form novalidate onsubmit="Seller.changePassword(event)">${UI.field({ id: 'pw-old', label: 'Mật khẩu hiện tại', type: 'password', required: true })}${UI.field({ id: 'pw-new', label: 'Mật khẩu mới', type: 'password', required: true, hint: 'Tối thiểu 8 ký tự, có chữ và số' })}${UI.field({ id: 'pw-new2', label: 'Nhập lại mật khẩu mới', type: 'password', required: true })}<div class="actions"><button class="btn btn-primary">Đổi mật khẩu</button></div></form></div></div>
        </div>
        <div class="stack">
          <div class="card"><div class="card-head"><h2>Thông tin cá nhân</h2></div><div class="card-body"><form novalidate onsubmit="Seller.saveProfile(event)">${UI.field({ id: 'pf-name', label: 'Họ và tên', required: true, value: u.fullName })}${UI.field({ id: 'pf-phone', label: 'Số điện thoại (định danh, không đổi)', value: u.phone, mono: true, attrs: 'readonly' })}${UI.field({ id: 'pf-email', label: 'Email', type: 'email', required: true, value: u.email })}${UI.field({ id: 'pf-address', label: 'Địa chỉ', type: 'textarea', rows: 2, value: u.address })}<div class="actions"><button class="btn btn-primary btn-lg">Lưu thay đổi</button></div></form></div></div>
          <div class="card"><div class="card-head"><h2>Tài khoản nhận hoa hồng</h2></div><div class="card-body"><form novalidate onsubmit="Seller.saveBank(event)"><div class="form-grid form-grid-2">${UI.field({ id: 'bk-bank', label: 'Ngân hàng', required: true, type: 'select', value: u.bank ? u.bank.bankName : CONFIG.banks[0], options: CONFIG.banks.map(b => ({ value: b, label: b })) })}${UI.field({ id: 'bk-acc', label: 'Số tài khoản', required: true, mono: true, value: u.bank ? u.bank.accountNo : '', attrs: 'inputmode="numeric"' })}</div><div class="mt-4">${UI.field({ id: 'bk-owner', label: 'Chủ tài khoản', required: true, value: u.bank ? u.bank.owner : '', hint: 'Viết in hoa không dấu, trùng họ tên đăng ký' })}</div><p class="text-caption mt-2">Thay đổi được ghi nhận vào nhật ký kiểm toán và áp dụng cho các yêu cầu rút tiền mới.</p><div class="actions"><button class="btn btn-primary">Lưu tài khoản</button></div></form></div></div>
        </div>
      </div>`;
    return App.sellerShell('', html);
  },
  saveProfile: function(e) { e.preventDefault(); const u = Store.currentAgent(); const name = UI.val('pf-name'), email = UI.val('pf-email'), address = UI.val('pf-address'); ['pf-name', 'pf-email'].forEach(x => UI.setError(x, '')); if (name.length < 2) { UI.setError('pf-name', 'Vui lòng nhập họ tên.'); return; } if (!RULES.isEmail(email)) { UI.setError('pf-email', 'Email không hợp lệ.'); return; } const ex = Store.userByEmail(email); if (ex && ex.id !== u.id && ex.type === 'agent') { UI.setError('pf-email', 'Email đã được dùng cho thành viên khác.'); return; } Store.updateProfile(u.id, { fullName: name, email, address }); UI.toast('Đã lưu hồ sơ.'); App.reload(); },
  saveBank: function(e) { e.preventDefault(); const u = Store.currentAgent(); const bankName = UI.val('bk-bank'), accountNo = UI.val('bk-acc'), owner = UI.val('bk-owner').toUpperCase(); ['bk-acc', 'bk-owner'].forEach(x => UI.setError(x, '')); if (!/^\d{6,16}$/.test(accountNo)) { UI.setError('bk-acc', 'Số tài khoản gồm 6–16 chữ số.'); return; } if (owner.length < 4) { UI.setError('bk-owner', 'Nhập tên chủ tài khoản.'); return; } UI.confirm({ title: 'Cập nhật tài khoản nhận hoa hồng?', body: 'Thay đổi áp dụng cho các yêu cầu rút tiền mới và được ghi vào nhật ký.', summary: [['Ngân hàng', UI.esc(bankName)], ['Số TK', '<span class="mono">' + UI.esc(accountNo) + '</span>'], ['Chủ TK', UI.esc(owner)]], confirmText: 'Lưu', onConfirm: () => { Store.updateProfile(u.id, { bank: { bankName, accountNo, owner } }, 'Cập nhật tài khoản ngân hàng'); UI.toast('Đã lưu tài khoản ngân hàng.'); App.reload(); } }); },
  changePassword: function(e) { e.preventDefault(); const u = Store.currentAgent(); const o = UI.val('pw-old'), n = UI.val('pw-new'), n2 = UI.val('pw-new2'); ['pw-old', 'pw-new', 'pw-new2'].forEach(x => UI.setError(x, '')); const err = RULES.validatePassword(n); if (err) { UI.setError('pw-new', err); return; } if (n !== n2) { UI.setError('pw-new2', 'Mật khẩu nhập lại không khớp.'); return; } const r = Store.changePassword(u.id, o, n); if (!r.ok) { UI.setError('pw-old', r.message); return; } UI.toast('Đã đổi mật khẩu.'); App.reload(); }
};
