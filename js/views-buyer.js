/**
 * Nhóm A · Người mua — buy → register (spec v3: LP-1…6, 7.1, 7.2)
 * Markup nằm trong screens/a-*.html; file này chỉ giữ logic, trạng thái và dữ liệu đổ vào template.
 * Trạng thái mock bằng query ?state= (xem Demo navigator).
 */
const Buyer = {
  /** Panel giới thiệu bên trái cho màn có form (order-lookup, login, register) — website-first. */
  introPanel: function(title, desc, steps) { return TPL.render('partials/intro-panel', { title, desc, steps }); },

  pkgHeader: function(pkg, opt) { return TPL.render('partials/pkg-header', { pkg, tag: (opt && opt.tag) || 'h1' }); },

  // ---------------------------------------------------------------------
  // Giới thiệu sản phẩm (chuyển từ trang chủ A0 bản v1): gallery + mô tả + chi tiết tính năng
  // ---------------------------------------------------------------------
  _gal: 0,
  productIntro: function(pkg) {
    const pc = CONFIG.productContent[pkg.id] || null;
    if (pc) { this._gal = 0; App.after(() => this.bindGallery()); }
    return TPL.render('partials/product-intro', { pkg, pc, g0: pc ? pc.gallery[0] : null });
  },
  toggleFeatures: function() {
    const body = document.getElementById('feat-body'); const btn = document.getElementById('feat-toggle'); if (!body || !btn) return;
    const open = body.hidden; body.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = (open ? 'Thu gọn ' : 'Xem chi tiết ') + UI.icon('chevron-down', 18);
    btn.classList.toggle('is-open', open);
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

  /** Alert nhỏ chèn vào vùng #xxx-alert (partials/alert). */
  alert: function(tone, ico, title, text, cls) { return TPL.render('partials/alert', { tone, ico, title: title || null, text, cls: cls || null, size: null }); },
  showAlert: function(id, html) { const box = document.getElementById(id); if (!box) return; box.hidden = false; box.innerHTML = html; },
  setCardHead: function(sel, title, step) { const el = document.querySelector(sel); if (el) el.innerHTML = TPL.render('partials/card-head', { title, step }); },

  // =====================================================================
  // buy · Trang mua hàng /r/{mã}
  // =====================================================================
  A01: function(q) {
    const state = q.get('state') || '';
    const seller = Store.refSeller();
    const pkg = Store.activePackage();

    // (e) Link không hợp lệ / truy cập trực tiếp không có mã (BR-01)
    if (state === 'invalid' || state === 'inactive' || (!seller && !['inactive-pkg'].includes(state))) {
      return App.buyerShell(TPL.render('buyer/buy-state', { state: state === 'inactive' ? 'inactive' : 'invalid', seller, phone: '' }), { narrow: true });
    }
    // (f) Gói ngưng bán
    if (state === 'inactive-pkg' || !pkg) return App.buyerShell(TPL.render('buyer/buy-state', { state: 'inactive-pkg', seller, phone: '' }), { showRef: true, narrow: true });
    // (d) SĐT đã mua gói (BR-03)
    if (state === 'duplicate') return App.buyerShell(TPL.render('buyer/buy-state', { state: 'duplicate', seller, phone: Store.s().verifiedPhone || '' }), { showRef: true, narrow: true });

    // (a) Form · (b) OTP inline · (c) lỗi field · (g) SMS lỗi
    const draft = Store.s().buyerDraft || {};
    const pc = CONFIG.productContent[pkg.id] || null;
    if (pc) { this._gal = 0; App.after(() => this.bindGallery()); }
    this._a01State = state;
    return App.buyerShell(TPL.render('buyer/buy', { pkg, seller, draft, pc, g0: pc ? pc.gallery[0] : null }), { showRef: false });
  },

  a01Validate: function() {
    let ok = true;
    const fullName = UI.val('fullName'); const phoneRaw = UI.val('phone'); const address = UI.val('address'); const email = UI.val('email');
    UI.setError('fullName', ''); UI.setError('phone', ''); UI.setError('address', ''); UI.setError('email', '');
    if (!RULES.isEmail(email)) { UI.setError('email', email ? 'Email không đúng định dạng.' : 'Vui lòng nhập email.'); ok = false; }
    if (fullName.length < 2) { UI.setError('fullName', 'Vui lòng nhập họ và tên.'); ok = false; }
    const phone = RULES.normalizePhone(phoneRaw);
    if (!phoneRaw) { UI.setError('phone', 'Vui lòng nhập số điện thoại.'); ok = false; }
    else if (!phone) { UI.setError('phone', 'Số điện thoại không đúng định dạng (di động Việt Nam 10 số).'); ok = false; }
    if (address.length < 8) { UI.setError('address', 'Vui lòng nhập địa chỉ nhận hàng đầy đủ.'); ok = false; }
    if (!ok) UI.focusFirstError();
    return ok ? { fullName, phone, email, address, note: UI.val('note') } : null;
  },

  a01Submit: function(e) {
    e.preventDefault();
    const draft = this.a01Validate(); if (!draft) return;
    const btn = document.getElementById('a01-submit'); UI.setLoading(btn, true);
    setTimeout(() => {
      UI.setLoading(btn, false);
      // (g) Dịch vụ SMS lỗi
      if (this._a01State === 'sms-error' || draft.phone === CONFIG.demo.smsErrorPhone) {
        this.showAlert('a01-alert', this.alert('error', 'warning', 'Không gửi được mã OTP', 'Hệ thống SMS đang gián đoạn. Vui lòng thử lại sau ít phút. Sự cố đã được ghi nhận.'));
        this._a01State = ''; // lần bấm sau sẽ thành công
        return;
      }
      const can = Store.otpCanSend(draft.phone);
      if (!can.ok) { this.showAlert('a01-alert', this.alert('error', 'lock', 'Tạm khoá gửi OTP', 'Số điện thoại này đã vượt giới hạn gửi mã. Vui lòng thử lại sau ' + can.minutes + ' phút.')); return; }
      Store.s().buyerDraft = draft; Store.save();
      this.a01Otp(draft);
    }, 500);
  },

  /** (b) OTP tại chỗ — thay phần thân card, giữ ngữ cảnh trang. */
  a01Otp: function(draft) {
    this.setCardHead('#a01-card .card-head', 'Xác thực số điện thoại', 'Bước 2/3');
    document.getElementById('a01-body').innerHTML = '<div id="a01-otp"></div>';
    UI.otp.mount('a01-otp', {
      phone: draft.phone, backText: 'Sửa thông tin',
      onBack: () => App.reload(),
      onVerified: () => {
        Store.s().verifiedPhone = draft.phone; Store.save();
        // BR-03: kiểm tra 1 gói / SĐT SAU OTP, TRƯỚC khi tạo đơn
        if (CONFIG.rules.onePackagePerPhone && RULES.ownsPackage(Store.orders(), draft.phone)) { App.navigate('buy?state=duplicate'); return; }
        Store.createOrder(draft);
        UI.toast('Xác thực thành công. Đã tạo đơn hàng.');
        App.navigate('payment');
      }
    });
  },

  // =====================================================================
  // payment · Thanh toán
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
    if (!order) { App.navigate('buy', { replace: true }); return ''; }
    if (order.status === 'PAID' || order.status === 'AWAITING_RECONCILE' || order.status === 'REJECTED') { App.navigate('order-result', { replace: true }); return ''; }

    const expired = order.status === 'EXPIRED' || new Date(order.expiresAt).getTime() <= Date.now();
    if (expired) { Store.expireOrder(order.id); return App.buyerShell(this.a02Expired(order), { showRef: true, narrow: true }); }

    const pkg = Store.pkg(order.packageId);
    const view = q.get('view') || 'choose';
    let body;
    if (view === 'gateway') body = this.a02Gateway(order);
    else if (view === 'bank') body = this.a02Bank(order);
    else body = this.a02Choose(order);

    App.after(() => UI.countdown.mount('a02-countdown', order.expiresAt, { onExpire: () => { Store.expireOrder(order.id); App.reload(); } }));
    return App.buyerShell(TPL.render('buyer/payment', { order, pkg, body, holdMin: CONFIG.order.holdSeconds / 60 }), { showRef: true });
  },

  a02Choose: function(order) {
    const methods = [
      { id: 'gateway', title: CONFIG.gateway.label, desc: CONFIG.gateway.desc, ico: 'zap' },
      { id: 'bank', title: 'Chuyển khoản ngân hàng (VietQR)', desc: 'Quét mã QR hoặc chuyển khoản thủ công. Đơn được xác nhận sau khi đối soát (trong giờ làm việc).', ico: 'qr' }
    ];
    return TPL.render('buyer/payment-choose', { order, sel: this._a02Method || 'gateway', methods });
  },
  a02Go: function(orderId) {
    const m = this._a02Method || 'gateway';
    Store.setOrder(orderId, { method: m, status: 'PENDING_PAYMENT' });
    App.navigate('payment?view=' + m);
  },
  a02SimExpire: function(orderId) { Store.setOrder(orderId, { expiresAt: new Date(Date.now() - 1000).toISOString() }); Store.expireOrder(orderId); App.reload(); },
  a02Cancel: function(orderId) {
    UI.confirm({ title: 'Huỷ đơn hàng?', body: 'Đơn hàng sẽ hết hiệu lực. Bạn có thể đặt lại bất cứ lúc nào qua link giới thiệu.', confirmText: 'Huỷ đơn', tone: 'danger',
      onConfirm: () => { Store.expireOrder(orderId); App.navigate('buy'); } });
  },

  /** (b) Cổng online — loading rồi màn cổng giả lập (chưa chốt nhà cung cấp). */
  a02Gateway: function(order) {
    App.after(() => { App.timers.gw = setTimeout(() => { const el = document.getElementById('gw-sim'); if (el) el.hidden = false; const l = document.getElementById('gw-loading'); if (l) l.hidden = true; }, 1400); });
    return TPL.render('buyer/payment-gateway', { order });
  },

  /** (c) Khối VietQR + "Tôi đã chuyển khoản" */
  a02Bank: function(order) { return TPL.render('buyer/payment-bank', { order }); },
  /**
   * Xác nhận đã chuyển khoản — bắt buộc đính kèm ảnh biên lai (7.1.4).
   * Không phân biệt chuyển đúng/sai ở bước này: đơn luôn sang Chờ đối soát, admin đối chiếu ảnh ở #orders.
   */
  _proof: null,
  a02Claim: function(orderId) {
    this._proof = null;
    const order = Store.order(orderId);
    UI.modal({ title: 'Xác nhận đã chuyển khoản', sticky: true,
      body: TPL.render('buyer/payment-proof', { order, maxMb: CONFIG.order.proofMaxMb }),
      foot: TPL.render('buyer/payment-proof-foot', { order }) });
  },
  /** Chỉ ghi nhận tên + dung lượng file (mock), không đọc nội dung ảnh. */
  a02ProofPick: function(input) {
    const err = document.getElementById('proof-err');
    const box = document.getElementById('proof-picked');
    const btn = document.getElementById('proof-submit');
    const f = input && input.files && input.files[0];
    this._proof = null;
    if (btn) btn.disabled = true;
    if (box) { box.hidden = true; box.innerHTML = ''; }
    if (err) err.textContent = '';
    if (!f) return;
    const maxBytes = CONFIG.order.proofMaxMb * 1024 * 1024;
    if (f.size > maxBytes) { if (err) err.textContent = 'Ảnh vượt quá ' + CONFIG.order.proofMaxMb + 'MB. Chọn ảnh nhỏ hơn.'; input.value = ''; return; }
    this._proof = { name: f.name, size: UI.fileSize(f.size), at: new Date().toISOString() };
    if (box) { box.hidden = false; box.innerHTML = TPL.render('buyer/payment-proof-picked', this._proof); }
    if (btn) btn.disabled = false;
  },
  a02ProofSubmit: function(orderId) {
    if (!this._proof) { const err = document.getElementById('proof-err'); if (err) err.textContent = 'Vui lòng đính kèm ảnh biên lai chuyển khoản.'; return; }
    const btn = document.getElementById('proof-submit'); UI.setLoading(btn, true);
    setTimeout(() => {
      Store.claimTransfer(orderId, this._proof);
      this._proof = null;
      UI.closeModal();
      UI.toast('Đã nhận biên lai. Đơn đang chờ đối soát.', 'success');
      App.navigate('order-result');
    }, 500);
  },

  /** (e) EXPIRED + Đặt lại (giữ mã giới thiệu — BR-06/07) */
  a02Expired: function(order) { return TPL.render('buyer/payment-expired', { order, holdMin: CONFIG.order.holdSeconds / 60 }); },

  // =====================================================================
  // order-result · Kết quả thanh toán
  // =====================================================================
  A03: function(q) {
    const state = q.get('state') || '';
    let order = Store.currentOrder();
    const demoMap = { paid: 'PAID', later: 'PAID', failed: 'FAILED', reconcile: 'AWAITING_RECONCILE', rejected: 'REJECTED', nocode: 'NOCODE' };
    if (demoMap[state]) order = this.demoOrder(demoMap[state]);
    if (!order) { App.navigate('buy', { replace: true }); return ''; }
    const pkg = Store.pkg(order.packageId);
    let body;
    let wide = false;
    if (order.status === 'PAID') { const later = state === 'later' || q.get('later'); body = later ? this.a03Later(order) : (order.licenseCode ? this.a03Paid(order, pkg) : this.a03NoCode(order)); wide = !later && !!order.licenseCode; }
    else if (order.status === 'FAILED') body = this.a03Failed(order);
    else if (order.status === 'AWAITING_RECONCILE') body = this.a03Awaiting(order);
    else if (order.status === 'REJECTED') body = this.a03Rejected(order);
    else if (order.status === 'EXPIRED') body = this.a02Expired(order);
    else { App.navigate('payment', { replace: true }); return ''; }
    return App.buyerShell(body, { showRef: false, narrow: !wide });
  },

  orderInfoBlock: function(order, opts) {
    const o = opts || {};
    return TPL.render('partials/order-info', { order, pkgName: Store.pkg(order.packageId).name, shipping: o.shipping !== false });
  },

  /** Khối mời đăng ký thành viên sau khi PAID (LP-6, 7.2.1): chỉ khi người giới thiệu ≥ Silver. */
  regCta: function(order) {
    const el = Store.registrationEligibility(order.phone);
    const ref = order.sellerId ? Store.user(order.sellerId) : null;
    return TPL.render('partials/reg-cta', { el, ref, order, refRankLabel: ref ? RULES.rank(ref.rank).label : '' });
  },
  /** Popup mời đăng ký thành viên — hiện 1 lần/đơn ngay khi vào order-result PAID (LP-6). */
  regPrompt: function(order) {
    const el = Store.registrationEligibility(order.phone); if (!el.ok) return;
    const shown = Store.s().regPromptShown || []; if (shown.includes(order.id)) return;
    shown.push(order.id); Store.s().regPromptShown = shown; Store.save();
    const ref = el.referrer;
    UI.modal({ title: 'Trở thành thành viên HOMI365?', sticky: true,
      body: TPL.render('buyer/order-result-reg-prompt', { ref, rankLabel: RULES.rank(ref.rank).label, order }),
      foot: TPL.render('buyer/order-result-reg-prompt-foot', { order }) });
  },
  /** (a) PAID — mã đơn + mã kích hoạt + mời đăng ký thành viên */
  a03Paid: function(order, pkg) {
    App.after(() => setTimeout(() => this.regPrompt(order), 400));
    return TPL.render('buyer/order-result-paid', { order, pkg, info: this.orderInfoBlock(order), cta: this.regCta(order) });
  },
  /** (b) Để sau → xác nhận đã gửi SMS */
  a03Later: function(orderOrId, go) {
    if (go) { App.navigate('order-result?later=1'); return; }
    return TPL.render('buyer/order-result-later', { order: orderOrId });
  },
  /** (c) FAILED + Thử lại (nếu còn hạn) */
  a03Failed: function(order) {
    const canRetry = new Date(order.expiresAt).getTime() > Date.now();
    if (canRetry) App.after(() => UI.countdown.mount('a03-countdown', order.expiresAt, { onExpire: () => { Store.expireOrder(order.id); App.reload(); } }));
    return TPL.render('buyer/order-result-failed', { order, canRetry, info: this.orderInfoBlock(order, { shipping: false }) });
  },
  /** (d) AWAITING_RECONCILE — polling 10s */
  a03Awaiting: function(order) {
    App.after(() => {
      // Mời đăng ký thành viên ngay, không chờ admin đối soát (7.2.1): điều kiện xét trên người
      // giới thiệu chứ không phụ thuộc trạng thái thanh toán, nên hiện được ngay ở bước chờ đối soát.
      setTimeout(() => this.regPrompt(order), 600);
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
    return TPL.render('buyer/order-result-awaiting', { order, info: this.orderInfoBlock(order, { shipping: false }) });
  },
  /** (e) Admin từ chối */
  a03Rejected: function(order) { return TPL.render('buyer/order-result-rejected', { order, info: this.orderInfoBlock(order, { shipping: false }) }); },
  /** (f) Kho mã hết → chờ cấp */
  a03NoCode: function(order) { return TPL.render('buyer/order-result-nocode', { order, info: this.orderInfoBlock(order), cta: this.regCta(order) }); },

  // =====================================================================
  // order-lookup · Tra cứu đơn hàng (không cần đăng nhập)
  // =====================================================================
  A04: function(q) {
    const intro = { title: 'Tra cứu đơn hàng', desc: 'Xem trạng thái thanh toán, giao hàng và mã kích hoạt của đơn đã mua — không cần đăng nhập.', steps: ['Nhập số điện thoại đã mua và xác thực OTP, hoặc nhập mã đơn hàng.', 'Xem trạng thái thanh toán, giao hàng và mã kích hoạt (chỉ khi xác thực OTP).', 'Nếu đã thanh toán mà chưa có tài khoản, kích hoạt tài khoản seller ngay tại đây.'] };
    const paid = Store.orders().find(o => o.status === 'PAID');
    return App.buyerShell(TPL.render('buyer/order-lookup', { intro, mode: this._a04Mode || 'phone', prefill: q.get('phone') || '', demoPhone: Store.user('U101').phone, demoOrderId: paid ? paid.id : '' }));
  },
  a04Phone: function(e) {
    e.preventDefault();
    const raw = UI.val('lk-phone'); const phone = RULES.normalizePhone(raw);
    UI.setError('lk-phone', '');
    if (!phone) { UI.setError('lk-phone', raw ? 'Số điện thoại không đúng định dạng.' : 'Vui lòng nhập số điện thoại.'); UI.focusFirstError(); return; }
    document.getElementById('a04-body').innerHTML = TPL.render('partials/otp-frame', { title: 'Xác thực số điện thoại', id: 'a04-otp' });
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
      body.innerHTML = UI.empty('search', 'Không tìm thấy đơn hàng', ctx.verified ? 'Số điện thoại này chưa có đơn hàng nào.' : 'Không có đơn nào với mã "' + ctx.query + '". Kiểm tra lại mã hoặc tra cứu bằng số điện thoại.', TPL.render('partials/btn-reload', { label: 'Tra cứu lại' }));
      return;
    }
    const u = ctx.verified ? Store.userByPhone(ctx.phone) : null;
    const el = ctx.verified ? Store.registrationEligibility(ctx.phone) : { ok: false };
    body.innerHTML = TPL.render('buyer/order-lookup-result', {
      orders: orders.slice().sort((a, b) => a.createdAt < b.createdAt ? 1 : -1),
      verified: !!ctx.verified, phone: ctx.phone || '', el, isSeller: !!(u && u.type === 'agent')
    });
  },

  // =====================================================================
  // login · Đăng nhập thành viên (SĐT + mật khẩu) · Quên mật khẩu (OTP)
  // =====================================================================
  A05: function(q) {
    const reason = q.get('reason'); const next = q.get('next') || 'dashboard'; this._a05Next = next;
    const forgot = q.get('view') === 'forgot';
    const intro = forgot
      ? { title: 'Quên mật khẩu', desc: 'Đặt lại mật khẩu bằng mã OTP gửi tới số điện thoại đã đăng ký.', steps: ['Nhập số điện thoại thành viên.', 'Nhập mã OTP nhận qua SMS.', 'Đặt mật khẩu mới và đăng nhập.'] }
      : { title: 'Đăng nhập thành viên', desc: 'Dùng số điện thoại và mật khẩu đã đặt khi đăng ký thành viên.', steps: ['Nhập số điện thoại + mật khẩu.', 'Vào Dashboard: hạng & điểm, link bán hàng, hoa hồng, ví & rút tiền.', 'Đã mua gói nhưng chưa có tài khoản? Đăng ký thành viên tại đây.'] };
    return App.buyerShell(TPL.render('buyer/login', { intro, forgot, reason: reason || '', demoPhone: Store.user('U101').phone }));
  },
  a05Submit: function(e) {
    e.preventDefault(); const raw = UI.val('lg-phone'); const phone = RULES.normalizePhone(raw); const pw = UI.val('lg-pass'); const remember = document.getElementById('lg-remember').checked; const box = document.getElementById('a05-alert');
    UI.setError('lg-phone', ''); UI.setError('lg-pass', ''); box.hidden = true; let ok = true;
    if (!phone) { UI.setError('lg-phone', raw ? 'Số điện thoại không đúng định dạng.' : 'Vui lòng nhập số điện thoại.'); ok = false; } if (!pw) { UI.setError('lg-pass', 'Vui lòng nhập mật khẩu.'); ok = false; } if (!ok) { UI.focusFirstError(); return; }
    const show = (tone, ico, title, text) => this.showAlert('a05-alert', this.alert(tone, ico, title, text, 'mt-4'));
    if (phone === CONFIG.demo.adminPhone) { show('error', 'shield', 'Quản trị viên vui lòng đăng nhập tại trang quản trị', '<a href="#admin-login">Tới trang đăng nhập quản trị</a>'); return; }
    const btn = document.getElementById('lg-submit'); UI.setLoading(btn, true);
    setTimeout(() => {
      UI.setLoading(btn, false); const r = Store.loginAgent(phone, pw, remember);
      if (r.ok) { UI.toast('Đăng nhập thành công.'); App.navigate(this._a05Next || 'dashboard'); return; }
      if (r.reason === 'locked') { show('error', 'lock', 'Tài khoản đã bị khoá', 'Vui lòng liên hệ hỗ trợ <strong>' + UI.esc(CONFIG.brand.supportHotline) + '</strong>.'); return; }
      if (r.reason === 'wrong') { show('error', 'x-circle', null, 'Số điện thoại hoặc mật khẩu không đúng. <a href="#login?view=forgot">Quên mật khẩu?</a>'); return; }
      // Chưa là thành viên: kiểm tra đơn / hồ sơ đăng ký
      const el = Store.registrationEligibility(phone);
      if (el.reason === 'pending') { show('info', 'clock', 'Hồ sơ thành viên đang ' + UI.label('approval', el.registration.status).toLowerCase(), 'Bạn sẽ nhận email khi hồ sơ được duyệt. <a href="#register?state=pending&phone=' + UI.esc(phone) + '">Xem trạng thái</a>'); return; }
      if (el.ok && el.rejected) { show('warning', 'warning', 'Hồ sơ trước đã bị từ chối', UI.esc((el.rejected.approvals.find(a => a.action === 'REJECT') || {}).reason || '') + '. <a href="#register?phone=' + UI.esc(phone) + '">Nộp lại hồ sơ</a>'); return; }
      if (el.ok) { show('info', 'user', 'Số này đã mua gói nhưng chưa đăng ký thành viên', '<a href="#register?phone=' + UI.esc(phone) + '">Đăng ký thành viên ngay</a> — thông tin được điền sẵn từ đơn hàng.'); return; }
      if (el.reason === 'referrer_copper') { show('warning', 'warning', 'Chưa đủ điều kiện đăng ký thành viên', 'Người giới thiệu của bạn (hạng Copper) chưa được quyền tuyển thành viên. Vui lòng liên hệ người giới thiệu hoặc hỗ trợ.'); return; }
      show('error', 'alert-octagon', 'Số điện thoại chưa đăng ký', 'Chưa có tài khoản thành viên và chưa có đơn hàng thanh toán thành công. Vui lòng mua gói qua link giới thiệu.');
    }, 400);
  },
  a05Forgot: function(e) {
    e.preventDefault(); const raw = UI.val('fg-phone'); const phone = RULES.normalizePhone(raw); UI.setError('fg-phone', '');
    if (!phone) { UI.setError('fg-phone', raw ? 'Số điện thoại không đúng định dạng.' : 'Vui lòng nhập số điện thoại.'); return; }
    const u = Store.userByPhone(phone); if (!u || u.type !== 'agent') { UI.setError('fg-phone', 'Số điện thoại chưa có tài khoản thành viên.'); return; }
    const body = document.getElementById('a05-body'); body.innerHTML = TPL.render('partials/otp-frame', { title: 'Nhập mã OTP', id: 'fg-otp' });
    UI.otp.mount('fg-otp', { phone, onBack: () => App.reload(), onVerified: () => { body.innerHTML = TPL.render('buyer/login-reset', { phone }); } });
  },
  a05Reset: function(e, phone) { e.preventDefault(); const a = UI.val('rs-pw'), b = UI.val('rs-pw2'); UI.setError('rs-pw', ''); UI.setError('rs-pw2', ''); const err = RULES.validatePassword(a); if (err) { UI.setError('rs-pw', err); return; } if (a !== b) { UI.setError('rs-pw2', 'Mật khẩu nhập lại không khớp.'); return; } Store.resetPassword(phone, a); UI.toast('Đã đặt lại mật khẩu. Vui lòng đăng nhập.'); App.navigate('login'); },

  // =====================================================================
  // register · Đăng ký thành viên (7.2): kiểm tra điều kiện → hồ sơ + T&C → OTP → chờ duyệt (0/2)
  // =====================================================================
  A06: function(q) {
    const state = q.get('state') || ''; const orderId = q.get('order'); const qp = q.get('phone');
    let phone = qp ? RULES.normalizePhone(qp) : (orderId && Store.order(orderId) ? Store.order(orderId).phone : (Store.s().verifiedPhone || ''));
    if (state === 'pending' && !phone) phone = '0913000888'; if (state === 'rejected' && !phone) phone = '0914000999';
    const intro = { title: 'Đăng ký thành viên', desc: 'Hồ sơ gồm thông tin cá nhân, tài khoản nhận hoa hồng, mật khẩu và chấp nhận điều khoản. Sau khi duyệt 2 lớp, bạn nhận email kích hoạt kèm link bán hàng cá nhân.', steps: ['Kiểm tra điều kiện: đã mua gói, người giới thiệu từ hạng Silver.', 'Điền hồ sơ, chấp nhận T&C, xác thực OTP.', 'Chờ admin duyệt (0/2 → 1/2 → Đã duyệt) và nhận email.'] };
    let body;
    if (!phone) body = this.a06Check();
    else {
      const el = Store.registrationEligibility(phone);
      const masked = '<span class="mono">' + UI.esc(RULES.maskPhone(phone)) + '</span>';
      if (el.reason === 'pending' || state === 'pending') body = this.a06Status(el.registration || Store.registrationByPhone(phone), phone);
      else if (el.reason === 'agent') body = this.a06Blocked('user', 'Bạn đã là thành viên', 'Số ' + masked + ' đã có tài khoản thành viên.', phone, { agent: true });
      else if (el.reason === 'no_order') body = this.a06Blocked('alert-octagon', 'Chưa có đơn hàng thanh toán thành công', 'Số ' + masked + ' chưa mua gói. Thành viên phải là khách hàng đã mua gói qua link giới thiệu.', phone);
      else if (el.reason === 'referrer_copper') body = this.a06Blocked('warning', 'Người giới thiệu chưa đủ điều kiện tuyển', 'Người giới thiệu của bạn (<strong>' + UI.esc(el.referrer ? el.referrer.fullName : '') + '</strong>, hạng ' + (el.referrer ? RULES.rank(el.referrer.rank).label : 'Copper') + ') chưa được quyền tuyển thành viên (từ hạng Silver). Bạn có thể đăng ký sau khi người giới thiệu lên hạng, hoặc liên hệ hỗ trợ ' + UI.esc(CONFIG.brand.supportHotline) + '.', phone);
      else if (el.reason === 'rejected_final') body = this.a06Blocked('x-circle', 'Hồ sơ đã bị từ chối', 'Hồ sơ trước đó bị từ chối và không thể nộp lại. Liên hệ hỗ trợ.', phone);
      else body = this.a06Form(el, phone, state);
    }
    return App.buyerShell(TPL.render('buyer/register', { intro, body }));
  },
  a06Check: function() { return TPL.render('buyer/register-check', { phoneOk: Store.user('U101').phone, phoneCopper: Store.user('U102').phone }); },
  a06Lookup: function(e) { e.preventDefault(); const raw = UI.val('rg-phone'); const phone = RULES.normalizePhone(raw); UI.setError('rg-phone', ''); if (!phone) { UI.setError('rg-phone', raw ? 'Số điện thoại không đúng định dạng.' : 'Vui lòng nhập số điện thoại.'); return; } App.navigate('register?phone=' + phone); },
  a06Blocked: function(ico, title, desc, phone, opt) { const agent = !!(opt && opt.agent); return TPL.render('buyer/register-blocked', { ico, title, desc, phone, agent, iconClass: agent ? 'is-info' : 'is-pending' }); },
  a06Status: function(reg, phone) {
    if (!reg) return this.a06Blocked('search', 'Không tìm thấy hồ sơ', 'Số này chưa nộp hồ sơ đăng ký.', phone);
    const ap = (reg.approvals || []).filter(a => a.action === 'APPROVE').length; const rej = (reg.approvals || []).find(a => a.action === 'REJECT') || null;
    const steps = [{ label: 'Đã nộp hồ sơ', done: true }, { label: 'Duyệt lớp 1', done: ap >= 1 || reg.status === 'APPROVED' }, { label: 'Duyệt lớp 2', done: reg.status === 'APPROVED' }, { label: 'Kích hoạt & email', done: reg.status === 'APPROVED' }];
    return TPL.render('buyer/register-status', { reg, phone, steps, rej, referrerName: reg.referrerId ? Store.user(reg.referrerId).fullName : null });
  },
  a06Form: function(el, phone, state) {
    const o = el.order; const ref = el.referrer; const d = Store.s().regDraft && Store.s().regDraft.phone === phone ? Store.s().regDraft : { fullName: o.fullName, email: o.email || '', bankName: CONFIG.banks[0], accountNo: '', owner: '' };
    const rej = el.rejected;
    return TPL.render('buyer/register-form', {
      o, ref, d, phone, tc: Store.rules().tc,
      rejReason: rej ? ((rej.approvals.find(a => a.action === 'REJECT') || {}).reason || '') : null,
      alias: RULES.publicPurchaseUrl(Store.genPurchaseAlias(d.fullName, phone)),
      bankOptions: CONFIG.banks.map(b => ({ value: b, label: b }))
    });
  },
  a06Alias: function(phone) { const el = document.getElementById('rg-alias'); if (el) el.textContent = RULES.publicPurchaseUrl(Store.genPurchaseAlias(UI.val('rg-name'), phone)); },
  a06Submit: function(e, phone) {
    e.preventDefault(); const f = { fullName: UI.val('rg-name'), email: UI.val('rg-email'), bankName: UI.val('rg-bank'), accountNo: UI.val('rg-acc'), owner: UI.val('rg-owner').toUpperCase(), pw: UI.val('rg-pw'), pw2: UI.val('rg-pw2'), tc: document.getElementById('rg-tc').checked };
    ['rg-name', 'rg-email', 'rg-acc', 'rg-owner', 'rg-pw', 'rg-pw2'].forEach(x => UI.setError(x, '')); document.getElementById('rg-tc-err').textContent = ''; let ok = true;
    if (f.fullName.length < 2) { UI.setError('rg-name', 'Vui lòng nhập họ tên.'); ok = false; } if (!RULES.isEmail(f.email)) { UI.setError('rg-email', 'Email không hợp lệ.'); ok = false; }
    const ex = Store.userByEmail(f.email); if (ex && ex.type === 'agent' && ex.phone !== phone) { UI.setError('rg-email', 'Email đã được dùng cho thành viên khác.'); ok = false; }
    if (!/^\d{6,16}$/.test(f.accountNo)) { UI.setError('rg-acc', 'Số tài khoản gồm 6–16 chữ số.'); ok = false; } if (f.owner.length < 4) { UI.setError('rg-owner', 'Nhập tên chủ tài khoản.'); ok = false; }
    const pe = RULES.validatePassword(f.pw); if (pe) { UI.setError('rg-pw', pe); ok = false; } if (f.pw !== f.pw2) { UI.setError('rg-pw2', 'Mật khẩu nhập lại không khớp.'); ok = false; }
    if (!f.tc) { document.getElementById('rg-tc-err').innerHTML = UI.icon('warning', 16) + '<span>Bạn cần đồng ý điều khoản để tiếp tục.</span>'; ok = false; }
    if (!ok) { UI.focusFirstError(); return; }
    Store.s().regDraft = { phone, fullName: f.fullName, email: f.email, bankName: f.bankName, accountNo: f.accountNo, owner: f.owner }; Store.save();
    const can = Store.otpCanSend(phone);
    if (!can.ok) { this.showAlert('a06-alert', this.alert('error', 'lock', null, 'Tạm khoá gửi OTP. Thử lại sau ' + can.minutes + ' phút.', 'mt-4')); return; }
    this._regPending = { phone, fullName: f.fullName, email: f.email, bank: { bankName: f.bankName, accountNo: f.accountNo, owner: f.owner }, password: f.pw };
    this.setCardHead('#a06-col .card-head', 'Xác thực số điện thoại', 'Bước 2/3');
    document.getElementById('a06-body').innerHTML = '<div id="a06-otp"></div>';
    UI.otp.mount('a06-otp', { phone, backText: 'Sửa hồ sơ', onBack: () => App.reload(), verifyText: 'Nộp hồ sơ', onVerified: () => this.a06Done(phone) });
  },
  a06Done: function(phone) {
    const p = this._regPending; const el = Store.registrationEligibility(phone); if (!p || !el.ok) { App.reload(); return; }
    const r = Store.submitRegistration({ phone, fullName: p.fullName, email: p.email, bank: p.bank, password: p.password, orderId: el.order.id });
    if (!r.ok) { UI.toast(r.message, 'error'); App.reload(); return; } this._regPending = null;
    this.setCardHead('#a06-col .card-head', 'Đăng ký đã gửi', 'Bước 3/3');
    document.getElementById('a06-body').innerHTML = TPL.render('buyer/register-done', { regId: r.registration.id, email: p.email, phone, alias: RULES.publicPurchaseUrl(Store.genPurchaseAlias(p.fullName, phone)) });
  }
};
