/**
 * Nhóm A · Người mua — A-01 → A-05 (US-01 → US-10, US-24)
 * Mỗi màn có đủ trạng thái phụ theo kế hoạch redesign mục 3.
 * Trạng thái mock bằng query ?state= (xem Demo navigator).
 */
const Buyer = {
  /** Panel giới thiệu bên trái cho màn có form (A-04, A-05) — website-first. */
  introPanel: function(title, desc, steps) {
    return `<div class="intro-panel"><h1>${title}</h1><p>${desc}</p><ol class="intro-steps">${steps.map(t => `<li>${t}</li>`).join('')}</ol></div>`;
  },

  pkgHeader: function(pkg, opt) {
    const tag = (opt && opt.tag) || 'h1';
    return `<div class="pkg">
      <div class="pkg-icon">${UI.icon('watch', 30)}</div>
      <div class="grow"><${tag} class="pkg-name">${UI.esc(pkg.name)}</${tag}><div class="pkg-meta">${UI.esc(pkg.id)} · License ${pkg.licenseMonths} tháng${pkg.hasShipping ? ' · kèm đồng hồ HW01' : ''}</div></div>
      <div class="pkg-price">${UI.money(pkg.price)}</div>
    </div>`;
  },

  // ---------------------------------------------------------------------
  // Giới thiệu sản phẩm (chuyển từ trang chủ A0 bản v1): gallery + mô tả + chi tiết tính năng
  // ---------------------------------------------------------------------
  _gal: 0,
  productIntro: function(pkg) {
    const pc = CONFIG.productContent[pkg.id];
    if (!pc) return `<div class="card"><div class="card-body"><p class="text-sm text-muted">${UI.esc(pkg.desc)}</p><ul class="pkg-benefits">${pkg.benefits.map(b => `<li>${UI.icon('check', 16)}<span>${UI.esc(b)}</span></li>`).join('')}</ul></div></div>`;
    this._gal = 0;
    App.after(() => this.bindGallery());
    const g0 = pc.gallery[0];
    return `
        <div class="card product-card">
          <div class="gallery">
            <div class="gallery-main" id="gallery-main" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Ảnh giới thiệu gói ${UI.esc(pkg.id)}">
              <img id="gallery-img" src="${g0.src}" alt="${UI.esc(g0.title)}" width="1890" height="1063" decoding="async" draggable="false">
              <button class="gallery-nav gallery-nav-prev" aria-label="Ảnh trước" onclick="Buyer.galleryStep(-1)">${UI.icon('arrow-left', 18)}</button>
              <button class="gallery-nav gallery-nav-next" aria-label="Ảnh kế tiếp" onclick="Buyer.galleryStep(1)">${UI.icon('arrow-right', 18)}</button>
              <span class="gallery-caption" id="gallery-caption" aria-live="polite">${UI.esc(g0.title)}</span>
            </div>
            <div class="gallery-thumbs" role="tablist" aria-label="Chọn ảnh">
              ${pc.gallery.map((g, i) => `<button class="gallery-thumb ${i === 0 ? 'is-active' : ''}" role="tab" id="gthumb-${i}" aria-selected="${i === 0}" title="${UI.esc(g.title)}" onclick="Buyer.galleryTo(${i})"><img src="${g.thumb}" alt="" loading="lazy" decoding="async" draggable="false"><span class="sr-only">${UI.esc(g.title)}</span></button>`).join('')}
            </div>
          </div>
          <div class="card-body">
            <p>${UI.esc(pc.lead)}</p>
            <ul class="pkg-benefits">${pkg.benefits.map(b => `<li>${UI.icon('check', 16)}<span>${UI.esc(b)}</span></li>`).join('')}</ul>
          </div>
        </div>
        <div class="card"><div class="card-head"><h2 style="font-size:var(--fs-lg)">Chi tiết tính năng gói ${UI.esc(pkg.id)}</h2></div><div class="card-body">
          <p class="text-sm text-muted">${UI.esc(pc.intro)}</p>
          <div class="feature-list mt-3">${pc.features.map((f, i) => `<details class="feature" ${i === 0 ? 'open' : ''}><summary>${i + 1}. ${UI.esc(f.title)}</summary><ul>${f.items.map(t => `<li>${UI.esc(t)}</li>`).join('')}</ul></details>`).join('')}</div>
        </div></div>`;
  },
  galleryTo: function(i) {
    const pkg = Store.activePackage(); const pc = CONFIG.productContent[pkg.id]; if (!pc) return;
    const n = pc.gallery.length; this._gal = ((i % n) + n) % n;
    const g = pc.gallery[this._gal];
    const img = document.getElementById('gallery-img'); if (img) { img.src = g.src; img.alt = g.title; }
    const cap = document.getElementById('gallery-caption'); if (cap) cap.textContent = g.title;
    document.querySelectorAll('.gallery-thumb').forEach((b, k) => { b.classList.toggle('is-active', k === this._gal); b.setAttribute('aria-selected', String(k === this._gal)); });
    const t = document.getElementById('gthumb-' + this._gal); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  },
  galleryStep: function(d) { this.galleryTo(this._gal + d); },
  /** Vuốt ngang (pointer events) + phím mũi tên để đổi ảnh. */
  bindGallery: function() {
    const el = document.getElementById('gallery-main'); if (!el) return;
    let x0 = null;
    el.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    el.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) this.galleryStep(dx < 0 ? 1 : -1); });
    el.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') this.galleryStep(-1); if (e.key === 'ArrowRight') this.galleryStep(1); });
  },

  // =====================================================================
  // A-01 · Trang mua hàng /r/{mã}
  // =====================================================================
  A01: function(q) {
    const state = q.get('state') || '';
    const seller = Store.refSeller();
    const pkg = Store.activePackage();

    // (e) Link không hợp lệ / truy cập trực tiếp không có mã (BR-01)
    if (state === 'invalid' || state === 'inactive' || (!seller && !['inactive-pkg'].includes(state))) {
      const locked = state === 'inactive';
      return App.buyerShell(`<div class="card"><div class="card-body stack text-center">
        <div class="result-icon is-error" style="margin:0 auto">${UI.icon('external', 34)}</div>
        <div class="error-code">${locked ? 'LINK KHÔNG CÒN HIỆU LỰC' : 'LINK KHÔNG HỢP LỆ'}</div>
        <h1>${locked ? 'Link giới thiệu này đã ngừng hoạt động' : 'Link giới thiệu không hợp lệ'}</h1>
        <p class="text-muted">${locked ? 'Tài khoản người giới thiệu đang bị tạm khoá. Vui lòng liên hệ người đã gửi link cho bạn hoặc bộ phận hỗ trợ.' : 'Gói sản phẩm chỉ mua được qua link giới thiệu của seller HOMI365. Vui lòng mở lại đúng link bạn nhận được (dạng <span class="mono">' + UI.esc(CONFIG.brand.baseUrl) + '/r/…</span>).'}</p>
        <div class="alert alert-neutral" style="text-align:left">${UI.icon('phone', 20)}<div>Hỗ trợ: <strong>${UI.esc(CONFIG.brand.supportHotline)}</strong> (${UI.esc(CONFIG.brand.supportHours)})</div></div>
        <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#A-04">${UI.icon('search', 18)} Tra cứu đơn hàng đã mua</a><a class="btn btn-primary btn-lg" href="#HOME">Về trang giới thiệu prototype</a></div>
      </div></div>`, { narrow: true });
    }

    // (f) Gói ngưng bán
    if (state === 'inactive-pkg' || !pkg) {
      return App.buyerShell(`<div class="card"><div class="card-body stack text-center">
        <div class="result-icon is-pending" style="margin:0 auto">${UI.icon('package', 34)}</div>
        <h1>Sản phẩm tạm ngưng bán</h1>
        <p class="text-muted">Gói sản phẩm đang được tạm tắt bán để cập nhật. Vui lòng quay lại sau hoặc liên hệ người giới thiệu của bạn${seller ? ' (<strong>' + UI.esc(seller.fullName) + '</strong>)' : ''}.</p>
        <div class="actions"><a class="btn btn-secondary btn-lg" href="#A-04">Tra cứu đơn hàng</a></div>
      </div></div>`, { showRef: true, narrow: true });
    }

    // (d) SĐT đã mua gói (BR-03)
    if (state === 'duplicate') {
      const phone = Store.s().verifiedPhone || '';
      return App.buyerShell(`<div class="card"><div class="card-body stack text-center">
        <div class="result-icon is-pending" style="margin:0 auto">${UI.icon('alert-octagon', 34)}</div>
        <h1>Số điện thoại này đã mua gói</h1>
        <p class="text-muted">Mỗi số điện thoại chỉ được sở hữu <strong>1 gói</strong>. Số <span class="mono">${UI.esc(RULES.maskPhone(phone))}</span> đã có đơn hàng thanh toán thành công, nên không thể tạo đơn mới.</p>
        <div class="alert alert-info" style="text-align:left">${UI.icon('info', 20)}<div>Bạn có thể tra cứu đơn đã mua, xem mã kích hoạt hoặc kích hoạt tài khoản seller bằng chính số điện thoại này. Cần mua thêm gói cho người thân? Liên hệ hỗ trợ ${UI.esc(CONFIG.brand.supportHotline)} để được cấp ngoại lệ.</div></div>
        <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#A-01">Nhập số khác</a><a class="btn btn-primary btn-lg" href="#A-04?phone=${UI.esc(phone)}">Tra cứu đơn hàng</a></div>
      </div></div>`, { showRef: true, narrow: true });
    }

    // (a) Form · (b) OTP inline · (c) lỗi field · (g) SMS lỗi
    const draft = Store.s().buyerDraft || {};
    const html = `
      <div class="buyer-split buyer-split-rev a01-split">
        <aside class="buyer-side buyer-side-static stack">
        <div class="desktop-only">${this.pkgHeader(pkg)}</div>
        ${this.productIntro(pkg)}
        <div class="card card-tint"><div class="card-body ref-card"><span class="avatar" aria-hidden="true">${UI.esc(RULES.initials(seller.fullName))}</span><div><div class="text-sm text-muted">Người giới thiệu</div><div class="text-strong">${UI.esc(seller.fullName)}</div><div class="text-caption mono">Mã ${UI.esc(seller.refCode)}</div></div></div></div>
        </aside>

        <div class="stack"><div class="mobile-only">${this.pkgHeader(pkg, { tag: 'div' })}</div>
        <div class="card" id="a01-card">
          <div class="card-head"><h2>Thông tin nhận hàng</h2><span class="text-sm text-muted">Bước 1/3</span></div>
          <div class="card-body" id="a01-body">
            <form id="a01-form" novalidate onsubmit="Buyer.a01Submit(event)">
              ${UI.field({ id: 'fullName', label: 'Họ và tên', required: true, placeholder: 'Nguyễn Văn A', value: draft.fullName, attrs: 'autocomplete="name"' })}
              ${UI.field({ id: 'phone', label: 'Số điện thoại', required: true, type: 'tel', placeholder: '0912 345 678', value: draft.phone, mono: true, hint: 'Dùng để nhận mã OTP, mã kích hoạt và đăng nhập sau này.', attrs: 'autocomplete="tel" inputmode="numeric"' })}
              ${UI.field({ id: 'address', label: 'Địa chỉ nhận hàng', required: true, type: 'textarea', rows: 2, placeholder: 'Số nhà, đường, phường/xã, tỉnh/thành phố', value: draft.address, attrs: 'autocomplete="street-address"' })}
              ${UI.field({ id: 'note', label: 'Ghi chú', type: 'textarea', rows: 2, placeholder: 'Ví dụ: giao giờ hành chính, gọi trước khi giao…', value: draft.note })}
              <div class="qty-fixed mt-4"><span>Số lượng</span><strong>1 gói (cố định)</strong></div>
              <div class="total-row"><span>Tổng thanh toán</span><span class="total-amt">${UI.money(pkg.price)}</span></div>
              <div id="a01-alert" class="mt-4" hidden></div>
              <div class="actions"><button type="submit" class="btn btn-primary btn-lg btn-block" id="a01-submit">${UI.icon('sms', 20)} Gửi OTP &amp; tiếp tục</button></div>
              <p class="text-caption text-center mt-3">Bằng việc tiếp tục, bạn đồng ý nhận SMS xác thực từ HOMI365.</p>
            </form>
          </div>
        </div></div>
      </div>`;
    this._a01State = state;
    return App.buyerShell(html, { showRef: false });
  },

  a01Validate: function() {
    let ok = true;
    const fullName = UI.val('fullName'); const phoneRaw = UI.val('phone'); const address = UI.val('address');
    UI.setError('fullName', ''); UI.setError('phone', ''); UI.setError('address', '');
    if (fullName.length < 2) { UI.setError('fullName', 'Vui lòng nhập họ và tên.'); ok = false; }
    const phone = RULES.normalizePhone(phoneRaw);
    if (!phoneRaw) { UI.setError('phone', 'Vui lòng nhập số điện thoại.'); ok = false; }
    else if (!phone) { UI.setError('phone', 'Số điện thoại không đúng định dạng (di động Việt Nam 10 số).'); ok = false; }
    if (address.length < 8) { UI.setError('address', 'Vui lòng nhập địa chỉ nhận hàng đầy đủ.'); ok = false; }
    if (!ok) UI.focusFirstError();
    return ok ? { fullName, phone, address, note: UI.val('note') } : null;
  },

  a01Submit: function(e) {
    e.preventDefault();
    const draft = this.a01Validate(); if (!draft) return;
    const btn = document.getElementById('a01-submit'); UI.setLoading(btn, true);
    const alertBox = document.getElementById('a01-alert');
    setTimeout(() => {
      UI.setLoading(btn, false);
      // (g) Dịch vụ SMS lỗi
      if (this._a01State === 'sms-error' || draft.phone === CONFIG.demo.smsErrorPhone) {
        alertBox.hidden = false;
        alertBox.innerHTML = `<div class="alert alert-error" role="alert">${UI.icon('warning', 22)}<div><span class="alert-title">Không gửi được mã OTP</span>Hệ thống SMS đang gián đoạn. Vui lòng thử lại sau ít phút. Sự cố đã được ghi nhận.</div></div>`;
        this._a01State = ''; // lần bấm sau sẽ thành công
        return;
      }
      const can = Store.otpCanSend(draft.phone);
      if (!can.ok) {
        alertBox.hidden = false;
        alertBox.innerHTML = `<div class="alert alert-error" role="alert">${UI.icon('lock', 22)}<div><span class="alert-title">Tạm khoá gửi OTP</span>Số điện thoại này đã vượt giới hạn gửi mã. Vui lòng thử lại sau ${can.minutes} phút.</div></div>`;
        return;
      }
      Store.s().buyerDraft = draft; Store.save();
      this.a01Otp(draft);
    }, 500);
  },

  /** (b) OTP tại chỗ — thay phần thân card, giữ ngữ cảnh trang. */
  a01Otp: function(draft) {
    const body = document.getElementById('a01-body');
    document.querySelector('#a01-card .card-head').innerHTML = '<h2>Xác thực số điện thoại</h2><span class="text-sm text-muted">Bước 2/3</span>';
    body.innerHTML = `<div id="a01-otp"></div>`;
    UI.otp.mount('a01-otp', {
      phone: draft.phone, backText: 'Sửa thông tin',
      onBack: () => App.reload(),
      onVerified: () => {
        Store.s().verifiedPhone = draft.phone; Store.save();
        // BR-03: kiểm tra 1 gói / SĐT SAU OTP, TRƯỚC khi tạo đơn
        if (RULES.ownsPackage(Store.orders(), draft.phone)) { App.navigate('A-01?state=duplicate'); return; }
        Store.createOrder(draft);
        UI.toast('Xác thực thành công. Đã tạo đơn hàng.');
        App.navigate('A-02');
      }
    });
  },

  // =====================================================================
  // A-02 · Thanh toán
  // =====================================================================
  /** Tạo nhanh đơn demo để xem các trạng thái phụ. */
  demoOrder: function(status) {
    const seller = Store.refSeller() || Store.user('U001');
    if (!Store.refSeller()) Store.captureRef(seller.refCode);
    const phone = '09' + String(Math.floor(10000000 + Math.random() * 89999999));
    const o = Store.createOrder({ fullName: 'Khách Demo', phone, address: '12 Nguyễn Huệ, P. Bến Nghé, TP. Hồ Chí Minh', note: '' });
    if (status === 'EXPIRED') { o.createdAt = new Date(Date.now() - 20 * 60000).toISOString(); o.expiresAt = new Date(Date.now() - 5 * 60000).toISOString(); o.status = 'EXPIRED'; }
    if (status === 'FAILED') Store.failOrder(o.id);
    if (status === 'AWAITING_RECONCILE') Store.claimTransfer(o.id);
    if (status === 'REJECTED') { Store.claimTransfer(o.id); Store.rejectReconcile(o.id, 'Không tìm thấy giao dịch khớp số tiền/nội dung'); }
    if (status === 'PAID') Store.markPaid(o.id, 'gateway');
    if (status === 'NOCODE') { Store.markPaid(o.id, 'gateway'); const c = Store.codeInfo(o.licenseCode); if (c) { c.status = 'IN_STOCK'; c.orderId = null; } o.licenseCode = null; o.licensePending = true; }
    Store.save();
    return o;
  },

  A02: function(q) {
    const state = q.get('state') || '';
    let order = Store.currentOrder();
    if (state === 'demo') order = this.demoOrder('PENDING_PAYMENT');
    if (state === 'expired') order = this.demoOrder('EXPIRED');
    if (state === 'failed') order = this.demoOrder('FAILED');
    if (!order) { App.navigate('A-01', { replace: true }); return ''; }
    if (order.status === 'PAID' || order.status === 'AWAITING_RECONCILE' || order.status === 'REJECTED') { App.navigate('A-03', { replace: true }); return ''; }

    const expired = order.status === 'EXPIRED' || new Date(order.expiresAt).getTime() <= Date.now();
    if (expired) { Store.expireOrder(order.id); return App.buyerShell(this.a02Expired(order), { showRef: true, narrow: true }); }

    const pkg = Store.pkg(order.packageId);
    const view = q.get('view') || 'choose';
    let body;
    if (view === 'gateway') body = this.a02Gateway(order);
    else if (view === 'bank') body = this.a02Bank(order);
    else body = this.a02Choose(order);

    const html = `<div class="buyer-split buyer-split-rev buyer-side-first">
      <div class="stack">
        ${order.status === 'FAILED' ? `<div class="alert alert-error" role="alert">${UI.icon('x-circle', 22)}<div><span class="alert-title">Thanh toán không thành công</span>${UI.esc(order.failReason || 'Giao dịch bị huỷ hoặc cổng trả lỗi.')} Bạn có thể chọn lại phương thức khi đơn còn thời hạn.</div></div>` : ''}
        ${body}
        <div class="demo-hint">Mô phỏng: <button class="btn-link" onclick="Buyer.a02SimExpire('${order.id}')">hết thời gian giữ đơn</button> (thực tế đơn tự hết hạn sau ${CONFIG.order.holdSeconds / 60} phút)</div>
      </div>
      <aside class="buyer-side"><div class="card"><div class="card-body">
        <div class="order-summary">
          <div><div class="text-sm text-muted">Mã đơn hàng</div><div class="order-id">${UI.esc(order.id)}</div>
            <div class="text-sm mt-2">${UI.esc(pkg.fullName)}</div>
            <div class="text-sm text-muted mt-1">Giao tới: ${UI.esc(order.fullName)} · ${UI.esc(RULES.maskPhone(order.phone))}</div></div>
          ${UI.countdown.markup('a02-countdown')}
        </div>
        <div class="total-row"><span>Số tiền cần thanh toán</span><span class="total-amt">${UI.money(order.price)}</span></div>
        <p class="text-caption mt-3">Đơn được giữ trong ${CONFIG.order.holdSeconds / 60} phút. Hết thời gian, đơn tự huỷ và bạn có thể đặt lại.</p>
      </div></div></aside>
    </div>`;
    App.after(() => UI.countdown.mount('a02-countdown', order.expiresAt, { onExpire: () => { Store.expireOrder(order.id); App.reload(); } }));
    return App.buyerShell(html, { showRef: true });
  },

  a02Choose: function(order) {
    const sel = this._a02Method || 'gateway';
    const card = (id, title, desc, ico) => `<label class="radio-card ${sel === id ? 'is-selected' : ''}" for="pm-${id}">
      <input type="radio" name="pm" id="pm-${id}" value="${id}" ${sel === id ? 'checked' : ''} onchange="Buyer._a02Method='${id}'; App.reload()">
      <div class="grow"><div class="radio-card-title">${title}</div><div class="radio-card-desc">${desc}</div></div>${UI.icon(ico, 24, 'text-navy')}</label>`;
    return `<div class="card">
      <div class="card-head"><h2>Chọn phương thức thanh toán</h2><span class="text-sm text-muted">Bước 3/3</span></div>
      <div class="card-body stack-sm" role="radiogroup" aria-label="Phương thức thanh toán">
        ${card('gateway', CONFIG.gateway.label, CONFIG.gateway.desc, 'zap')}
        ${card('bank', 'Chuyển khoản ngân hàng (VietQR)', 'Quét mã QR hoặc chuyển khoản thủ công. Đơn được xác nhận sau khi đối soát (trong giờ làm việc).', 'qr')}
        <div class="actions"><button class="btn btn-primary btn-lg btn-block" onclick="Buyer.a02Go('${order.id}')">Tiếp tục ${UI.icon('arrow-right', 18)}</button>
        <button class="btn btn-ghost" onclick="Buyer.a02Cancel('${order.id}')">Huỷ đơn, quay về trang mua hàng</button></div>
      </div></div>`;
  },
  a02Go: function(orderId) {
    const m = this._a02Method || 'gateway';
    Store.setOrder(orderId, { method: m, status: 'PENDING_PAYMENT' });
    App.navigate('A-02?view=' + m);
  },
  a02SimExpire: function(orderId) { Store.setOrder(orderId, { expiresAt: new Date(Date.now() - 1000).toISOString() }); Store.expireOrder(orderId); App.reload(); },
  a02Cancel: function(orderId) {
    UI.confirm({ title: 'Huỷ đơn hàng?', body: 'Đơn hàng sẽ hết hiệu lực. Bạn có thể đặt lại bất cứ lúc nào qua link giới thiệu.', confirmText: 'Huỷ đơn', tone: 'danger',
      onConfirm: () => { Store.expireOrder(orderId); App.navigate('A-01'); } });
  },

  /** (b) Cổng online — loading rồi màn cổng giả lập (chưa chốt nhà cung cấp). */
  a02Gateway: function(order) {
    App.after(() => { App.timers.gw = setTimeout(() => { const el = document.getElementById('gw-sim'); if (el) el.hidden = false; const l = document.getElementById('gw-loading'); if (l) l.hidden = true; }, 1400); });
    return `<div class="card"><div class="card-body">
      <div id="gw-loading" class="gateway-sim"><div class="gateway-logo">${UI.icon('zap', 20)} ${UI.esc(CONFIG.gateway.label)}</div>
        <p class="pulse text-strong">Đang chuyển hướng tới cổng thanh toán…</p><p class="text-sm text-muted mt-2">Vui lòng không đóng trình duyệt. Số tiền: <strong>${UI.money(order.price)}</strong> · Mã đơn <span class="mono">${UI.esc(order.id)}</span></p></div>
      <div id="gw-sim" class="gateway-sim" hidden>
        <div class="gateway-logo">${UI.icon('shield', 20)} Cổng thanh toán (mô phỏng)</div>
        <p class="text-muted text-sm">Màn hình này mô phỏng trang của cổng thanh toán. Khi tích hợp thật, cổng gọi callback về hệ thống và người mua được đưa về màn kết quả (A-03).</p>
        <div class="actions">
          <button class="btn btn-success btn-lg btn-block" onclick="Store.markPaid('${order.id}', 'gateway'); App.navigate('A-03')">${UI.icon('check', 18)} Thanh toán thành công (callback PAID)</button>
          <button class="btn btn-danger-outline btn-lg btn-block" onclick="Store.failOrder('${order.id}'); App.navigate('A-02')">Huỷ giao dịch trên cổng (FAILED)</button>
          <button class="btn btn-ghost" onclick="App.navigate('A-02')">${UI.icon('arrow-left', 16)} Chọn phương thức khác</button>
        </div>
      </div></div></div>`;
  },

  /** (c) Khối VietQR + "Tôi đã chuyển khoản" */
  a02Bank: function(order) {
    return `<div class="card">
      <div class="card-head"><h2>Chuyển khoản VietQR</h2><span class="text-sm text-muted">Bước 3/3</span></div>
      <div class="card-body stack">
        ${UI.vietqr(order)}
        <div class="alert alert-warning">${UI.icon('warning', 20)}<div>Nội dung chuyển khoản phải ghi <strong class="mono">${UI.esc(order.id)}</strong> để hệ thống đối soát đúng đơn. Chuyển đúng số tiền <strong>${UI.money(order.price)}</strong>.</div></div>
        <div class="actions">
          <button class="btn btn-primary btn-lg btn-block" onclick="Buyer.a02Claim('${order.id}')">${UI.icon('check', 18)} Tôi đã chuyển khoản</button>
          <button class="btn btn-ghost" onclick="App.navigate('A-02')">${UI.icon('arrow-left', 16)} Chọn phương thức khác</button>
        </div>
      </div></div>`;
  },
  a02Claim: function(orderId) {
    UI.confirm({ title: 'Xác nhận đã chuyển khoản', body: 'Đơn sẽ chuyển sang trạng thái <strong>Chờ đối soát</strong>. Bộ phận vận hành kiểm tra giao dịch và xác nhận trong giờ làm việc; mã kích hoạt được cấp ngay sau khi xác nhận.',
      summary: [['Mã đơn', '<span class="mono">' + UI.esc(orderId) + '</span>'], ['Số tiền', UI.money(Store.order(orderId).price)]], confirmText: 'Đã chuyển khoản',
      onConfirm: () => { Store.claimTransfer(orderId); App.navigate('A-03'); } });
  },

  /** (e) EXPIRED + Đặt lại (giữ mã giới thiệu — BR-06/07) */
  a02Expired: function(order) {
    return `<div class="card"><div class="card-body stack text-center">
      <div class="result-icon is-pending" style="margin:0 auto">${UI.icon('clock', 34)}</div>
      <div class="error-code">ĐƠN ${UI.esc(order.id)} · HẾT HẠN</div>
      <h1>Đơn hàng đã hết thời gian giữ</h1>
      <p class="text-muted">Đơn chưa được thanh toán trong ${CONFIG.order.holdSeconds / 60} phút nên đã hết hiệu lực. Thông tin và người giới thiệu của bạn vẫn được giữ — bạn có thể đặt lại ngay.</p>
      <div class="alert alert-info" style="text-align:left">${UI.icon('info', 20)}<div>Nếu bạn <strong>đã chuyển khoản</strong> cho đơn này, đừng chuyển lại. Liên hệ hỗ trợ ${UI.esc(CONFIG.brand.supportHotline)} kèm mã đơn để được đối soát.</div></div>
      <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#A-04">Tra cứu đơn</a><button class="btn btn-primary btn-lg" onclick="App.navigate('A-01')">${UI.icon('refresh', 18)} Đặt lại</button></div>
    </div></div>`;
  },

  // =====================================================================
  // A-03 · Kết quả thanh toán
  // =====================================================================
  A03: function(q) {
    const state = q.get('state') || '';
    let order = Store.currentOrder();
    const demoMap = { paid: 'PAID', later: 'PAID', failed: 'FAILED', reconcile: 'AWAITING_RECONCILE', rejected: 'REJECTED', nocode: 'NOCODE' };
    if (demoMap[state]) order = this.demoOrder(demoMap[state]);
    if (!order) { App.navigate('A-01', { replace: true }); return ''; }
    const pkg = Store.pkg(order.packageId);
    let body;
    let wide = false;
    if (order.status === 'PAID') { const later = state === 'later' || q.get('later'); body = later ? this.a03Later(order) : (order.licenseCode ? this.a03Paid(order, pkg) : this.a03NoCode(order)); wide = !later && !!order.licenseCode; }
    else if (order.status === 'FAILED') body = this.a03Failed(order);
    else if (order.status === 'AWAITING_RECONCILE') body = this.a03Awaiting(order);
    else if (order.status === 'REJECTED') body = this.a03Rejected(order);
    else if (order.status === 'EXPIRED') body = this.a02Expired(order);
    else { App.navigate('A-02', { replace: true }); return ''; }
    return App.buyerShell(body, { showRef: false, narrow: !wide });
  },

  orderInfoBlock: function(order, opts) {
    const o = opts || {};
    return `<dl class="dl">
      <dt>Mã đơn hàng</dt><dd class="mono">${UI.esc(order.id)}</dd>
      <dt>Gói</dt><dd>${UI.esc(Store.pkg(order.packageId).name)}</dd>
      <dt>Số tiền</dt><dd>${UI.money(order.price)}</dd>
      <dt>Phương thức</dt><dd>${UI.esc(LABELS.method[order.method] || '—')}</dd>
      <dt>Người nhận</dt><dd>${UI.esc(order.fullName)} · <span class="mono">${UI.esc(RULES.maskPhone(order.phone))}</span></dd>
      ${o.shipping !== false ? `<dt>Giao hàng</dt><dd>${UI.badge('shipping', order.shipping)}</dd>` : ''}
    </dl>`;
  },

  /** (a) PAID — mã đơn + mã kích hoạt (BR-08: người mua đã OTP) + 2 nút */
  a03Paid: function(order, pkg) {
    const existing = Store.userByPhone(order.phone);
    const isSeller = existing && existing.type === 'seller';
    return `<div class="buyer-split buyer-split-rev">
      <div class="card"><div class="card-body">
        <div class="result-hero"><div class="result-icon is-success">${UI.icon('check-circle', 40)}</div><h1>Thanh toán thành công</h1><p>Cảm ơn bạn đã mua ${UI.esc(pkg.name)}. Đồng hồ HW01 sẽ được giao tới địa chỉ đã đăng ký.</p></div>
        <div class="code-box code-box-lg code-box-navy mt-4"><div class="grow"><span class="code-label">Mã kích hoạt của bạn</span><span class="code-value">${UI.esc(order.licenseCode)}</span></div>
          <button class="btn btn-icon btn-secondary" aria-label="Sao chép mã kích hoạt" onclick="UI.copy('${UI.esc(order.licenseCode)}', 'Đã sao chép mã kích hoạt.')">${UI.icon('copy', 20)}</button></div>
        <p class="text-sm text-muted mt-2">Nhập mã này trong ứng dụng HOMI365 trên điện thoại để kích hoạt gói. Mã chỉ dùng được trên 1 thiết bị.</p>
        <div class="mt-4">${this.orderInfoBlock(order)}</div>
      </div></div>

      <aside class="buyer-side"><div class="card card-tint"><div class="card-body">
        <div class="row"><span class="result-icon is-info" style="width:44px;height:44px;margin:0">${UI.icon('gift', 22)}</span>
          <div class="grow"><h2 style="font-size:var(--fs-lg)">${isSeller ? 'Bạn đã có tài khoản seller' : 'Tạo tài khoản seller — nhận hoa hồng khi giới thiệu'}</h2>
          <p class="text-sm text-muted">${isSeller ? 'Đăng nhập để xem gói và mã kích hoạt trong mục Gói của tôi.' : 'Không cần nhập lại thông tin. Bạn sẽ có link giới thiệu riêng và nhận hoa hồng ' + RULES.formatPercent(Store.currentPolicy().tiers[0].rate) + ' cho mỗi đơn F1.'}</p></div></div>
        <div class="actions actions-row">
          ${isSeller ? `<a class="btn btn-primary btn-lg" href="#A-05">Đăng nhập seller</a>` : `
          <button class="btn btn-secondary btn-lg" onclick="Buyer.a03Later('${order.id}', true)">Để sau</button>
          <button class="btn btn-primary btn-lg" onclick="Buyer.a03CreateSeller('${order.id}')">${UI.icon('user', 18)} Tạo tài khoản</button>`}
        </div>
      </div></div></aside>
    </div>`;
  },
  a03CreateSeller: function(orderId) {
    const u = Store.createSellerFromOrder(orderId);
    Store.loginSeller(u.id, false);
    UI.toast('Đã tạo tài khoản seller. Chào mừng ' + u.fullName + '!');
    App.navigate('C-01');
  },
  /** (b) Để sau → xác nhận đã gửi SMS */
  a03Later: function(orderOrId, go) {
    if (go) { App.navigate('A-03?later=1'); return; }
    const order = orderOrId;
    return `<div class="card"><div class="card-body stack text-center">
      <div class="result-icon is-success" style="margin:0 auto">${UI.icon('sms', 34)}</div>
      <h1>Đã gửi mã kích hoạt qua SMS</h1>
      <p class="text-muted">Tin nhắn chứa mã kích hoạt và hướng dẫn sử dụng đã gửi tới <strong class="mono">${UI.esc(RULES.maskPhone(order.phone))}</strong> (trong vòng 1 phút).</p>
      <div class="alert alert-info" style="text-align:left">${UI.icon('info', 20)}<div>Bạn có thể tạo tài khoản seller bất cứ lúc nào bằng chính số điện thoại này tại mục <strong>Đăng nhập seller</strong>, hoặc tra cứu đơn hàng để xem lại mã.</div></div>
      <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#A-05">Đăng nhập seller</a><a class="btn btn-primary btn-lg" href="#A-04">Tra cứu đơn hàng</a></div>
    </div></div>`;
  },
  /** (c) FAILED + Thử lại (nếu còn hạn) */
  a03Failed: function(order) {
    const canRetry = new Date(order.expiresAt).getTime() > Date.now();
    if (canRetry) App.after(() => UI.countdown.mount('a03-countdown', order.expiresAt, { onExpire: () => { Store.expireOrder(order.id); App.reload(); } }));
    return `<div class="card"><div class="card-body stack">
      <div class="result-hero"><div class="result-icon is-error">${UI.icon('x-circle', 40)}</div><h1>Thanh toán thất bại</h1><p>${UI.esc(order.failReason || 'Giao dịch không thành công.')}</p></div>
      ${this.orderInfoBlock(order, { shipping: false })}
      ${canRetry ? `<div class="row-between"><span class="text-sm text-muted">Đơn còn hiệu lực</span>${UI.countdown.markup('a03-countdown')}</div>` : `<div class="alert alert-warning">${UI.icon('clock', 20)}<div>Đơn đã hết thời gian giữ. Vui lòng đặt lại.</div></div>`}
      <div class="actions actions-row">
        <a class="btn btn-secondary btn-lg" href="#A-04">Tra cứu đơn</a>
        ${canRetry ? `<button class="btn btn-primary btn-lg" onclick="Store.retryOrder('${order.id}'); App.navigate('A-02')">${UI.icon('refresh', 18)} Thử lại</button>` : `<button class="btn btn-primary btn-lg" onclick="App.navigate('A-01')">Đặt lại</button>`}
      </div>
    </div></div>`;
  },
  /** (d) AWAITING_RECONCILE — polling 10s */
  a03Awaiting: function(order) {
    App.after(() => {
      let n = 0;
      App.timers.poll = setInterval(() => {
        n++;
        const el = document.getElementById('poll-status'); if (!el) { App.clearTimer('poll'); return; }
        el.textContent = 'Lần kiểm tra #' + n + ' · ' + RULES.formatDateTime(new Date().toISOString());
        if (CONFIG.demo.reconcileAutoSeconds && n * CONFIG.order.reconcilePollSeconds >= CONFIG.demo.reconcileAutoSeconds) Store.confirmReconcile(order.id);
        const o = Store.order(order.id);
        if (o.status !== 'AWAITING_RECONCILE') { App.clearTimer('poll'); UI.toast(o.status === 'PAID' ? 'Đã xác nhận chuyển khoản!' : 'Đơn bị từ chối đối soát.', o.status === 'PAID' ? 'success' : 'error'); App.reload(); }
      }, CONFIG.order.reconcilePollSeconds * 1000);
    });
    return `<div class="stack"><div class="card"><div class="card-body stack">
      <div class="result-hero"><div class="result-icon is-pending pulse">${UI.icon('clock', 40)}</div><h1>Đang chờ xác nhận chuyển khoản</h1><p>Chúng tôi đang đối soát giao dịch của bạn. Trang này tự cập nhật mỗi ${CONFIG.order.reconcilePollSeconds} giây — bạn có thể đóng trang và tra cứu lại sau.</p></div>
      ${this.orderInfoBlock(order, { shipping: false })}
      <div class="text-caption text-center" id="poll-status" aria-live="polite">Đang kiểm tra…</div>
      <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#A-04">Tra cứu đơn sau</a><button class="btn btn-outline btn-lg" onclick="App.reload()">${UI.icon('refresh', 18)} Kiểm tra ngay</button></div>
    </div></div>
    <div class="demo-hint">Mô phỏng: admin xác nhận/từ chối tại <a href="#D-03" target="_blank">D-03</a> (mở tab mới) — trang này sẽ tự chuyển.
      <button class="btn-link" onclick="Store.confirmReconcile('${order.id}'); App.reload()">Giả lập admin xác nhận</button> ·
      <button class="btn-link" onclick="Store.rejectReconcile('${order.id}', 'Không tìm thấy giao dịch khớp'); App.reload()">Giả lập từ chối</button></div></div>`;
  },
  /** (e) Admin từ chối */
  a03Rejected: function(order) {
    return `<div class="card"><div class="card-body stack">
      <div class="result-hero"><div class="result-icon is-error">${UI.icon('x-circle', 40)}</div><h1>Chuyển khoản chưa được xác nhận</h1><p>Bộ phận đối soát không tìm thấy giao dịch khớp với đơn hàng này.</p></div>
      <div class="alert alert-error">${UI.icon('warning', 20)}<div><span class="alert-title">Lý do</span>${UI.esc(order.rejectReason || '—')}</div></div>
      ${this.orderInfoBlock(order, { shipping: false })}
      <div class="alert alert-info">${UI.icon('phone', 20)}<div>Nếu bạn đã chuyển khoản, vui lòng liên hệ <strong>${UI.esc(CONFIG.brand.supportHotline)}</strong> kèm ảnh chụp giao dịch và mã đơn <span class="mono">${UI.esc(order.id)}</span> để được hỗ trợ.</div></div>
      <div class="actions actions-row"><a class="btn btn-secondary btn-lg" href="#A-04">Tra cứu đơn</a><button class="btn btn-primary btn-lg" onclick="App.navigate('A-01')">Đặt đơn mới</button></div>
    </div></div>`;
  },
  /** (f) Kho mã hết → chờ cấp */
  a03NoCode: function(order) {
    return `<div class="card"><div class="card-body stack">
      <div class="result-hero"><div class="result-icon is-success">${UI.icon('check-circle', 40)}</div><h1>Thanh toán thành công</h1><p>Đơn hàng đã được ghi nhận.</p></div>
      <div class="alert alert-warning">${UI.icon('clock', 22)}<div><span class="alert-title">Mã kích hoạt đang chờ cấp</span>Mã kích hoạt sẽ được gửi qua SMS tới <strong class="mono">${UI.esc(RULES.maskPhone(order.phone))}</strong> trong thời gian sớm nhất. Bạn cũng có thể xem mã tại mục tra cứu đơn hàng.</div></div>
      ${this.orderInfoBlock(order)}
      <div class="actions actions-row"><button class="btn btn-secondary btn-lg" onclick="Buyer.a03Later('${order.id}', true)">Để sau</button><button class="btn btn-primary btn-lg" onclick="Buyer.a03CreateSeller('${order.id}')">Tạo tài khoản seller</button></div>
    </div></div>`;
  },

  // =====================================================================
  // A-04 · Tra cứu đơn hàng (không cần đăng nhập)
  // =====================================================================
  A04: function(q) {
    const mode = this._a04Mode || 'phone';
    const prefill = q.get('phone') || '';
    const html = `<div class="buyer-split">
      <aside class="buyer-side">${this.introPanel('Tra cứu đơn hàng', 'Xem trạng thái thanh toán, giao hàng và mã kích hoạt của đơn đã mua — không cần đăng nhập.', ['Nhập số điện thoại đã mua và xác thực OTP, hoặc nhập mã đơn hàng.', 'Xem trạng thái thanh toán, giao hàng và mã kích hoạt (chỉ khi xác thực OTP).', 'Nếu đã thanh toán mà chưa có tài khoản, kích hoạt tài khoản seller ngay tại đây.'])}</aside>
      <div class="stack"><div class="card"><div class="card-body" id="a04-body">
        <div class="seg mb-4" role="tablist">
          <button role="tab" aria-selected="${mode === 'phone'}" class="${mode === 'phone' ? 'is-active' : ''}" onclick="Buyer._a04Mode='phone'; App.reload()">Số điện thoại + OTP</button>
          <button role="tab" aria-selected="${mode === 'order'}" class="${mode === 'order' ? 'is-active' : ''}" onclick="Buyer._a04Mode='order'; App.reload()">Mã đơn hàng</button>
        </div>
        ${mode === 'phone' ? `
          <form novalidate onsubmit="Buyer.a04Phone(event)">
            ${UI.field({ id: 'lk-phone', label: 'Số điện thoại đã mua', required: true, type: 'tel', mono: true, placeholder: '0912 345 678', value: prefill, attrs: 'inputmode="numeric" autocomplete="tel"' })}
            <div class="field-hint mt-2">Xác thực OTP để xem đầy đủ, bao gồm mã kích hoạt.</div>
            <div class="actions"><button class="btn btn-primary btn-lg btn-block" id="lk-submit">${UI.icon('sms', 18)} Gửi OTP</button></div>
          </form>` : `
          <form novalidate onsubmit="Buyer.a04Order(event)">
            ${UI.field({ id: 'lk-order', label: 'Mã đơn hàng', required: true, mono: true, placeholder: 'HM260904001', hint: 'In trên màn kết quả thanh toán và trong SMS.', attrs: 'autocapitalize="characters"' })}
            <div class="alert alert-neutral mt-4">${UI.icon('info', 18)}<div class="text-sm">Tra cứu bằng mã đơn chỉ hiển thị trạng thái. Mã kích hoạt chỉ hiện khi xác thực OTP số điện thoại mua (BR-08).</div></div>
            <div class="actions"><button class="btn btn-primary btn-lg btn-block">${UI.icon('search', 18)} Tra cứu</button></div>
          </form>`}
      </div></div>
      <div class="demo-hint">SĐT mẫu có đơn: <strong>${Store.user('U101').phone}</strong> (chưa có TK seller) · <strong>0908123456</strong> (seller) · mã đơn: <strong>${UI.esc(Store.orders().find(o => o.status === 'PAID').id)}</strong></div>
    </div></div>`;
    return App.buyerShell(html);
  },
  a04Phone: function(e) {
    e.preventDefault();
    const raw = UI.val('lk-phone'); const phone = RULES.normalizePhone(raw);
    UI.setError('lk-phone', '');
    if (!phone) { UI.setError('lk-phone', raw ? 'Số điện thoại không đúng định dạng.' : 'Vui lòng nhập số điện thoại.'); UI.focusFirstError(); return; }
    const body = document.getElementById('a04-body');
    body.innerHTML = '<h2 class="text-center mb-4">Xác thực số điện thoại</h2><div id="a04-otp"></div>';
    UI.otp.mount('a04-otp', { phone, onBack: () => App.reload(), onVerified: () => this.a04Result(Store.ordersByPhone(phone), { phone, verified: true }) });
  },
  a04Order: function(e) {
    e.preventDefault();
    const id = UI.val('lk-order').toUpperCase();
    UI.setError('lk-order', '');
    if (!id) { UI.setError('lk-order', 'Vui lòng nhập mã đơn hàng.'); UI.focusFirstError(); return; }
    const o = Store.order(id);
    this.a04Result(o ? [o] : [], { verified: false, query: id });
  },
  a04Result: function(orders, ctx) {
    const body = document.getElementById('a04-body');
    if (!orders.length) {
      body.innerHTML = UI.empty('search', 'Không tìm thấy đơn hàng', ctx.verified ? 'Số điện thoại này chưa có đơn hàng nào.' : 'Không có đơn nào với mã "' + ctx.query + '". Kiểm tra lại mã hoặc tra cứu bằng số điện thoại.', `<button class="btn btn-secondary" onclick="App.reload()">${UI.icon('arrow-left', 16)} Tra cứu lại</button>`);
      return;
    }
    const u = ctx.verified ? Store.userByPhone(ctx.phone) : null;
    const canActivate = ctx.verified && (!u || u.type !== 'seller') && orders.some(o => o.status === 'PAID');
    const isSeller = u && u.type === 'seller';
    body.innerHTML = `
      <div class="row-between mb-3"><h2>${orders.length} đơn hàng</h2><button class="btn btn-ghost btn-sm" onclick="App.reload()">${UI.icon('arrow-left', 16)} Tra cứu khác</button></div>
      ${!ctx.verified ? `<div class="alert alert-neutral mb-3">${UI.icon('lock', 18)}<div class="text-sm">Mã kích hoạt được ẩn. Tra cứu bằng SĐT + OTP để xem.</div></div>` : ''}
      ${orders.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1).map(o => this.a04Card(o, ctx.verified)).join('')}
      ${canActivate ? `<div class="card card-tint mt-4"><div class="card-body"><h3>Kích hoạt tài khoản seller</h3><p class="text-sm text-muted mt-1">Số điện thoại này đã mua gói nhưng chưa có tài khoản. Kích hoạt để nhận link giới thiệu và hoa hồng — không cần nhập lại thông tin.</p>
        <div class="actions"><button class="btn btn-primary btn-lg btn-block" onclick="Buyer.a04Activate('${UI.esc(ctx.phone)}')">${UI.icon('user', 18)} Kích hoạt tài khoản seller</button></div></div></div>` : ''}
      ${isSeller ? `<div class="actions"><a class="btn btn-outline btn-lg btn-block" href="#A-05">Đăng nhập Dashboard Seller</a></div>` : ''}`;
  },
  a04Card: function(o, verified) {
    return `<div class="order-card">
      <div class="order-card-head"><div><div class="text-sm text-muted">Mã đơn</div><div class="mono text-strong">${UI.esc(o.id)}</div></div><div class="text-right"><div class="text-sm text-muted">${UI.date(o.createdAt)}</div><div class="text-strong">${UI.money(o.price)}</div></div></div>
      <div class="status-row"><span class="text-sm text-muted">Thanh toán:</span>${UI.badge('orderStatus', o.status)}<span class="text-sm text-muted">Giao hàng:</span>${UI.badge('shipping', o.shipping)}</div>
      ${o.status === 'PAID' ? (verified ? (o.licenseCode ? `<div class="code-box mt-3"><div class="grow"><span class="code-label">Mã kích hoạt ${o.licenseCode && Store.codeInfo(o.licenseCode) && Store.codeInfo(o.licenseCode).status === 'BOUND' ? '· đã kích hoạt' : '· chưa dùng'}</span><span class="code-value">${UI.esc(o.licenseCode)}</span></div><button class="btn btn-secondary btn-icon" aria-label="Sao chép mã" onclick="UI.copy('${UI.esc(o.licenseCode)}', 'Đã sao chép mã kích hoạt.')">${UI.icon('copy', 18)}</button></div>` : `<div class="alert alert-warning mt-3">${UI.icon('clock', 18)}<div class="text-sm">Mã kích hoạt đang chờ cấp, sẽ gửi qua SMS.</div></div>`) : `<div class="code-box mt-3"><div class="grow"><span class="code-label">Mã kích hoạt</span><span class="code-value">••••-••••-••••</span></div>${UI.icon('lock', 18, 'text-muted')}</div>`) : ''}
      ${o.status === 'AWAITING_RECONCILE' ? `<p class="text-sm text-muted mt-3">Đang chờ đối soát chuyển khoản. Mã kích hoạt được cấp sau khi xác nhận.</p>` : ''}
      ${o.status === 'REJECTED' ? `<p class="text-sm text-error mt-3">Từ chối đối soát: ${UI.esc(o.rejectReason || '')}</p>` : ''}
    </div>`;
  },
  a04Activate: function(phone) {
    const o = Store.ordersByPhone(phone).find(x => x.status === 'PAID');
    UI.confirm({ title: 'Kích hoạt tài khoản seller', body: 'Tài khoản seller sẽ được tạo từ thông tin đơn hàng của bạn (BR-10). Người giới thiệu là seller của link bạn đã mua.',
      summary: [['Họ tên', UI.esc(o.fullName)], ['Số điện thoại', '<span class="mono">' + UI.esc(RULES.maskPhone(phone)) + '</span>'], ['Người giới thiệu', UI.esc(o.sellerId ? Store.user(o.sellerId).fullName : '—')]],
      confirmText: 'Kích hoạt', onConfirm: () => { const u = Store.createSellerFromOrder(o.id); Store.loginSeller(u.id, false); UI.toast('Đã kích hoạt tài khoản seller.'); App.navigate('C-01'); } });
  },

  // =====================================================================
  // A-05 · Đăng nhập seller (SĐT + OTP, không mật khẩu)
  // =====================================================================
  A05: function(q) {
    const reason = q.get('reason'); const next = q.get('next') || 'C-01';
    this._a05Next = next;
    const html = `<div class="buyer-split">
      <aside class="buyer-side">${this.introPanel('Đăng nhập seller', 'Chỉ cần số điện thoại đã mua gói. Không dùng mật khẩu.', ['Nhập số điện thoại và nhận mã OTP qua SMS.', 'Vào Dashboard: link giới thiệu, thống kê, bảng kê hoa hồng, ví & rút tiền.', 'Đã mua gói nhưng chưa có tài khoản? Dùng chính số đó để kích hoạt.'])}</aside>
      <div class="stack">
      ${reason === 'expired' ? `<div class="alert alert-warning" role="alert">${UI.icon('clock', 20)}<div><span class="alert-title">Phiên đăng nhập đã hết hạn</span>Vui lòng đăng nhập lại. Sau khi đăng nhập bạn sẽ quay về trang đang xem.</div></div>` : ''}
      <div class="card"><div class="card-body" id="a05-body">
        <form novalidate onsubmit="Buyer.a05Submit(event)">
          ${UI.field({ id: 'lg-phone', label: 'Số điện thoại', required: true, type: 'tel', mono: true, placeholder: '0912 345 678', attrs: 'inputmode="numeric" autocomplete="tel"' })}
          <label class="check mt-3"><input type="checkbox" id="lg-remember"> Ghi nhớ đăng nhập (${CONFIG.session.rememberDays} ngày)</label>
          <div id="a05-alert" hidden></div>
          <div class="actions"><button class="btn btn-primary btn-lg btn-block" id="lg-submit">${UI.icon('sms', 18)} Gửi OTP</button></div>
        </form>
      </div></div>
      <p class="text-center text-sm text-muted">Chưa có tài khoản? Mua gói qua link giới thiệu, sau đó dùng chính số điện thoại đó để đăng nhập.<br><a href="#D-00">Quản trị viên đăng nhập tại đây</a></p>
      <div class="demo-hint">SĐT mẫu: <strong>0908123456</strong> seller · <strong>${Store.user('U101').phone}</strong> có đơn chưa TK · <strong>0977000111</strong> bị khoá · <strong>0999999999</strong> chưa đăng ký · <strong>0900000000</strong> admin</div>
    </div></div>`;
    return App.buyerShell(html);
  },
  a05Submit: function(e) {
    e.preventDefault();
    const raw = UI.val('lg-phone'); const phone = RULES.normalizePhone(raw); const remember = document.getElementById('lg-remember').checked;
    const alertBox = document.getElementById('a05-alert');
    UI.setError('lg-phone', ''); alertBox.hidden = true;
    if (!phone) { UI.setError('lg-phone', raw ? 'Số điện thoại không đúng định dạng.' : 'Vui lòng nhập số điện thoại.'); UI.focusFirstError(); return; }
    // (f) BR-12: tài khoản admin không dùng A-05
    if (phone === CONFIG.demo.adminPhone) {
      alertBox.hidden = false;
      alertBox.innerHTML = `<div class="alert alert-error mt-4" role="alert">${UI.icon('shield', 22)}<div><span class="alert-title">Quản trị viên vui lòng đăng nhập tại trang quản trị</span>Số này thuộc tài khoản quản trị. Khu vực quản trị dùng tên đăng nhập và mật khẩu riêng. <a href="#D-00">Tới trang đăng nhập quản trị</a></div></div>`;
      return;
    }
    const body = document.getElementById('a05-body');
    body.innerHTML = '<h2 class="text-center mb-4">Nhập mã OTP</h2><div id="a05-otp"></div>';
    UI.otp.mount('a05-otp', { phone, verifyText: 'Đăng nhập', onBack: () => App.reload(), onVerified: () => this.a05After(phone, remember) });
  },
  a05After: function(phone, remember) {
    const u = Store.userByPhone(phone);
    const body = document.getElementById('a05-body');
    if (u && u.type === 'seller') {
      if (u.status === 'locked') { // (d)
        body.innerHTML = `<div class="stack text-center"><div class="result-icon is-error" style="margin:0 auto">${UI.icon('lock', 34)}</div><h2>Tài khoản đã bị khoá</h2><p class="text-muted">Tài khoản seller của số <span class="mono">${UI.esc(RULES.maskPhone(phone))}</span> đang bị tạm khoá. Vui lòng liên hệ hỗ trợ <strong>${UI.esc(CONFIG.brand.supportHotline)}</strong> để được giải quyết.</p><div class="actions"><button class="btn btn-secondary btn-lg" onclick="App.reload()">Dùng số khác</button></div></div>`;
        return;
      }
      Store.loginSeller(u.id, remember);
      UI.toast('Đăng nhập thành công.');
      App.navigate(this._a05Next || 'C-01');
      return;
    }
    const paid = Store.ordersByPhone(phone).find(o => o.status === 'PAID');
    if (paid) { // (c) US-24
      body.innerHTML = `<div class="stack"><div class="text-center"><div class="result-icon is-info" style="margin:0 auto">${UI.icon('user', 34)}</div><h2>Kích hoạt tài khoản seller</h2><p class="text-muted">Số điện thoại này đã mua gói nhưng chưa có tài khoản. Kích hoạt ngay để nhận link giới thiệu và hoa hồng — thông tin lấy từ đơn hàng, không cần nhập lại.</p></div>
        <dl class="dl"><dt>Họ tên</dt><dd>${UI.esc(paid.fullName)}</dd><dt>Đơn hàng</dt><dd class="mono">${UI.esc(paid.id)}</dd><dt>Người giới thiệu</dt><dd>${UI.esc(paid.sellerId ? Store.user(paid.sellerId).fullName : '—')}</dd></dl>
        <div class="actions actions-row"><button class="btn btn-secondary btn-lg" onclick="App.reload()">Để sau</button><button class="btn btn-primary btn-lg" onclick="Buyer.a05Activate('${paid.id}', ${remember})">Kích hoạt &amp; vào Dashboard</button></div></div>`;
      return;
    }
    // (e) chưa đăng ký
    body.innerHTML = `<div class="stack text-center"><div class="result-icon is-pending" style="margin:0 auto">${UI.icon('alert-octagon', 34)}</div><h2>Số điện thoại chưa đăng ký</h2><p class="text-muted">Số <span class="mono">${UI.esc(RULES.maskPhone(phone))}</span> chưa có tài khoản seller và chưa có đơn hàng thanh toán thành công. Vui lòng mua gói qua link giới thiệu của seller HOMI365.</p><div class="actions actions-row"><button class="btn btn-secondary btn-lg" onclick="App.reload()">Dùng số khác</button><a class="btn btn-primary btn-lg" href="#A-04">Tra cứu đơn hàng</a></div></div>`;
  },
  a05Activate: function(orderId, remember) {
    const u = Store.createSellerFromOrder(orderId); Store.loginSeller(u.id, remember);
    UI.toast('Đã kích hoạt tài khoản seller.'); App.navigate(this._a05Next || 'C-01');
  }
};
