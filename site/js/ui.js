/**
 * HOMI365 prototype v2 — thành phần giao diện dùng chung (design system)
 * esc · icon · logo · badge · toast · modal · drawer · OTP 6 ô · countdown ·
 * VietQR · QR · bảng/phân trang/skeleton/empty · biểu đồ SVG · xuất Excel(CSV)
 *
 * QUY ƯỚC: mọi chuỗi người dùng nhập đi qua UI.esc(); màu chỉ dùng token;
 * không emoji (dùng UI.icon); vùng bấm >= 44px; trạng thái luôn kèm chữ.
 */
const UI = {
  esc: function(v) {
    return String(v === null || v === undefined ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },
  money: function(n) { return RULES.formatMoney(n); },
  num: function(n) { return RULES.formatNumber(n); },
  date: function(iso) { return RULES.formatDate(iso); },
  dt: function(iso) { return RULES.formatDateTime(iso); },

  // ---------------- Icons (SVG nội tuyến, stroke 2) ----------------
  icons: {
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    warning: '<path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>',
    check: '<path d="M5 13l4 4L19 7"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 5-5"/>',
    'x-circle': '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6m0-6l6 6"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/>',
    share: '<path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M20 20h-3M14 20v.01M20 17v.01"/>',
    phone: '<path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>',
    pin: '<path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0114 0M16 4a3.5 3.5 0 010 7M22 20a7 7 0 00-6-6.9"/>',
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.5-2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10.5 10.5 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.1M6.6 6.6A16.8 16.8 0 002 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.8"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    truck: '<path d="M1 7h12v9H1zM13 10h5l3 3v3h-8z"/><circle cx="5" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    wallet: '<path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M16 12h5M16 10v4"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    bars: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    refresh: '<path d="M21 12a9 9 0 11-2.6-6.4"/><path d="M21 3v6h-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    external: '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>',
    download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    file: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    package: '<path d="M16.5 9.4L7.5 4.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4a2 2 0 001-1.7z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/>',
    sms: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8M8 13h5"/>',
    device: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1M9 4l.5-2h5l.5 2M9 20l.5 2h5l.5-2"/>',
    edit: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/>',
    history: '<path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.5 2.5L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    gift: '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>',
    layers: '<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 12l10 5 10-5M2 17l10 5 10-5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.5-6.9A2 2 0 0016.8 4H7.2a2 2 0 00-1.7 1.1z"/>',
    'alert-octagon': '<path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9z"/><path d="M12 8v4m0 4h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    'chevron-down': '<path d="M6 9l6 6 6-6"/>',
    'chevron-right': '<path d="M9 18l6-6-6-6"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'
  },
  icon: function(name, size, cls) {
    const p = this.icons[name]; if (!p) return '';
    const s = size || 18;
    return `<svg class="ico ${cls || ''}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  },

  /** Logo HOMI365: mark (SVG vector) + wordmark Archivo. invert = bản trắng cho nền navy. */
  logo: function(opts) {
    const o = opts || {};
    const size = o.size || 32;
    const navy = o.invert ? '#FFFFFF' : 'var(--navy-600)';
    const teal = o.invert ? 'var(--teal-300)' : 'var(--teal-500)';
    const mark = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 46 L50 13 L86 46 V85 A3 3 0 0 1 83 88 H17 A3 3 0 0 1 14 85 Z" stroke="${navy}" stroke-width="7"/><path d="M50 76 C40 67 32.5 60.5 32.5 54 C32.5 49 36.5 45 41.5 45 C45.3 45 48.6 47.2 50 50 C51.4 47.2 54.7 45 58.5 45 C63.5 45 67.5 49 67.5 54 C67.5 60.5 60 67 50 76 Z" stroke="${teal}" stroke-width="6"/></g></svg>`;
    if (o.markOnly) return mark;
    // Nền sáng: dùng đúng file logo thương hiệu. Ảnh có lề trắng nên bọc trong khung cao đúng `size`
    // rồi cắt bớt trên/dưới — logo nằm giữa ảnh nên cắt đều hai bên là vừa khít.
    if (!o.invert && CONFIG.brand.logo) {
      return `<span class="brand-logo" style="height:${size}px" aria-label="HOMI365"><img src="${CONFIG.brand.logo}" alt="HOMI365" style="height:${Math.round(size * 2.1)}px"></span>`;
    }
    return `<span class="brand ${o.invert ? 'brand-invert' : ''}" aria-label="HOMI365">${mark}<span class="brand-word" style="font-size:${Math.round(size * .68)}px">HOMI<span class="n365">365</span></span></span>`;
  },

  /** Badge trạng thái theo LABELS[kind][code]. */
  badge: function(kind, code, lg) {
    const map = LABELS[kind] || {};
    const it = map[code] || { text: code || '—', tone: 'neutral' };
    return `<span class="badge badge-${it.tone} ${lg ? 'badge-lg' : ''}">${this.esc(it.text)}</span>`;
  },
  label: function(kind, code) { const it = (LABELS[kind] || {})[code]; return it ? it.text : (code || '—'); },

  // ---------------- Toast ----------------
  toast: function(message, type) {
    let region = document.getElementById('toast-region');
    if (!region) { region = document.createElement('div'); region.id = 'toast-region'; region.className = 'toast-region'; region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite'); document.body.appendChild(region); }
    const t = type || 'success';
    const ico = t === 'error' ? 'x-circle' : t === 'warning' ? 'warning' : t === 'info' ? 'info' : 'check-circle';
    const el = document.createElement('div');
    el.className = 'toast toast-' + t;
    el.innerHTML = `${this.icon(ico, 20)}<span>${this.esc(message)}</span>`;
    region.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; setTimeout(() => el.remove(), 260); }, 3200);
  },

  // ---------------- Modal ----------------
  modal: function(o) {
    this.closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop'; wrap.id = 'modal-backdrop';
    wrap.innerHTML = `
      <div class="modal ${o.size === 'lg' ? 'modal-lg' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head"><h2 id="modal-title">${o.title || ''}</h2>
          <button class="modal-close" aria-label="Đóng" onclick="UI.closeModal()">${this.icon('x', 20)}</button></div>
        <div class="modal-body">${o.body || ''}</div>
        ${o.foot ? `<div class="modal-foot">${o.foot}</div>` : ''}
      </div>`;
    wrap.addEventListener('click', (e) => { if (e.target === wrap && !o.sticky) this.closeModal(); });
    document.body.appendChild(wrap);
    this._modalEsc = (e) => { if (e.key === 'Escape') this.closeModal(); };
    document.addEventListener('keydown', this._modalEsc);
    const first = wrap.querySelector('input, select, textarea, .btn-primary, .btn-danger, .modal-close');
    if (first) { try { first.focus(); } catch (e) {} }
    if (o.onOpen) o.onOpen(wrap);
  },
  closeModal: function() {
    const w = document.getElementById('modal-backdrop'); if (w) w.remove();
    if (this._modalEsc) { document.removeEventListener('keydown', this._modalEsc); this._modalEsc = null; }
  },
  /** Modal xác nhận — nêu rõ số tiền / người / hậu quả. */
  confirm: function(o) {
    const id = 'cf' + Date.now();
    UI._confirmHandlers = UI._confirmHandlers || {};
    UI._confirmHandlers[id] = o.onConfirm;
    const summary = o.summary ? `<div class="modal-summary"><dl>${o.summary.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>` : '';
    const reason = o.reason ? `<div class="field mt-4"><label class="field-label" for="cf-reason">${o.reason}<span class="req">*</span></label><textarea id="cf-reason" class="textarea" rows="3" placeholder="Nhập lý do…"></textarea><div class="field-error" id="cf-reason-err"></div></div>` : '';
    this.modal({
      title: o.title, sticky: true,
      body: `<p>${o.body || ''}</p>${summary}${reason}`,
      foot: `<button class="btn btn-secondary" onclick="UI.closeModal()">${o.cancelText || 'Huỷ'}</button>
             <button class="btn ${o.tone === 'danger' ? 'btn-danger' : 'btn-primary'}" onclick="UI._runConfirm('${id}', ${!!o.reason})">${o.confirmText || 'Xác nhận'}</button>`
    });
  },
  _runConfirm: function(id, needReason) {
    let reason = '';
    if (needReason) {
      const ta = document.getElementById('cf-reason'); reason = (ta.value || '').trim();
      if (!reason) { document.getElementById('cf-reason-err').textContent = 'Vui lòng nhập lý do.'; ta.closest('.field').classList.add('is-error'); ta.focus(); return; }
    }
    const fn = this._confirmHandlers[id]; delete this._confirmHandlers[id];
    this.closeModal();
    if (fn) fn(reason);
  },

  // ---------------- Drawer ----------------
  drawer: function(o) {
    this.closeDrawer();
    const bd = document.createElement('div'); bd.className = 'drawer-backdrop'; bd.id = 'drawer-backdrop'; bd.onclick = () => this.closeDrawer();
    const d = document.createElement('aside'); d.className = 'drawer'; d.id = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = `<div class="drawer-head"><div>${o.title || ''}</div><button class="modal-close" aria-label="Đóng" onclick="UI.closeDrawer()">${this.icon('x', 20)}</button></div>
      <div class="drawer-body" id="drawer-body">${o.body || ''}</div>${o.foot ? `<div class="drawer-foot" id="drawer-foot">${o.foot}</div>` : ''}`;
    document.body.append(bd, d);
    this._drawerEsc = (e) => { if (e.key === 'Escape') this.closeDrawer(); };
    document.addEventListener('keydown', this._drawerEsc);
    d.querySelector('.modal-close').focus();
  },
  closeDrawer: function() {
    ['drawer-backdrop', 'drawer'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
    if (this._drawerEsc) { document.removeEventListener('keydown', this._drawerEsc); this._drawerEsc = null; }
  },

  // ---------------- Copy / share ----------------
  copy: function(text, message) {
    const done = () => this.toast(message || 'Đã sao chép.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => this._copyFallback(text, done));
    else this._copyFallback(text, done);
  },
  _copyFallback: function(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { this.toast('Không sao chép được, vui lòng chọn và sao chép thủ công.', 'error'); }
    ta.remove();
  },
  share: function(url, title) {
    if (navigator.share) navigator.share({ title: title || 'HOMI365', url }).catch(() => {});
    else this.copy(url, 'Thiết bị không hỗ trợ chia sẻ nhanh — đã sao chép link.');
  },

  // ---------------- Form helpers ----------------
  field: function(o) {
    const id = o.id;
    const req = o.required ? '<span class="req" aria-hidden="true">*</span>' : '';
    let control;
    const attrs = `id="${id}" name="${id}" ${o.placeholder ? `placeholder="${this.esc(o.placeholder)}"` : ''} ${o.attrs || ''} ${o.required ? 'required aria-required="true"' : ''} aria-describedby="${id}-err"`;
    if (o.type === 'textarea') control = `<textarea class="textarea" ${attrs} rows="${o.rows || 3}">${this.esc(o.value || '')}</textarea>`;
    else if (o.type === 'select') control = `<select class="select" ${attrs}>${(o.options || []).map(op => `<option value="${this.esc(op.value)}" ${op.value === o.value ? 'selected' : ''}>${this.esc(op.label)}</option>`).join('')}</select>`;
    else control = `<input class="input ${o.mono ? 'input-mono' : ''}" type="${o.type || 'text'}" ${attrs} value="${this.esc(o.value || '')}">`;
    return `<div class="field ${o.error ? 'is-error' : ''}" id="${id}-field">
      <label class="field-label" for="${id}">${o.label}${req}</label>
      ${o.hint ? `<div class="field-hint">${o.hint}</div>` : ''}
      ${control}
      <div class="field-error" id="${id}-err">${o.error ? this.icon('warning', 16) + '<span>' + this.esc(o.error) + '</span>' : ''}</div>
    </div>`;
  },
  setError: function(id, message) {
    const f = document.getElementById(id + '-field'); const e = document.getElementById(id + '-err');
    if (!f || !e) return;
    if (message) { f.classList.add('is-error'); e.innerHTML = this.icon('warning', 16) + '<span>' + this.esc(message) + '</span>'; }
    else { f.classList.remove('is-error'); e.innerHTML = ''; }
  },
  val: function(id) { const e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; },
  /** Dung lượng file dạng đọc được: 812 KB · 1,4 MB */
  fileSize: function(bytes) { const b = Number(bytes) || 0; if (b < 1024) return b + ' B'; if (b < 1024 * 1024) return Math.round(b / 1024) + ' KB'; return (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'; },
  focusFirstError: function() { const f = document.querySelector('.field.is-error input, .field.is-error select, .field.is-error textarea'); if (f) f.focus(); },
  togglePassword: function(inputId, btn) {
    const i = document.getElementById(inputId); if (!i) return;
    const show = i.type === 'password'; i.type = show ? 'text' : 'password';
    btn.innerHTML = this.icon(show ? 'eye-off' : 'eye', 20); btn.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  },
  setLoading: function(btn, loading) { if (!btn) return; btn.classList.toggle('is-loading', !!loading); btn.disabled = !!loading; },

  // ---------------- OTP 6 ô (BR-05) ----------------
  /**
   * UI.otp.mount(containerId, { phone, onVerified(), onBack(), purpose })
   * Tự gửi OTP khi mount (kiểm tra hạn mức), đếm ngược gửi lại, đếm số lần sai, khoá 30'.
   */
  otp: {
    mount: function(containerId, o) {
      const el = document.getElementById(containerId); if (!el) return;
      const st = { id: containerId, phone: o.phone, o, resend: 0 };
      UI._otp = st;
      const can = Store.otpCanSend(o.phone);
      if (!can.ok) { this.renderLocked(el, can.minutes); return; }
      Store.otpSend(o.phone);
      this.render(el);
    },
    render: function(el) {
      const st = UI._otp; const n = CONFIG.otp.length;
      el.innerHTML = `
        <p class="text-center">Mã xác thực gồm ${n} số đã gửi qua SMS tới <strong class="mono">${UI.esc(RULES.maskPhone(st.phone))}</strong>.</p>
        <div class="otp mt-4" id="${st.id}-boxes" onpaste="UI.otp.paste(event)">
          ${Array.from({ length: n }, (_, i) => `<input type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" class="otp-box" aria-label="Số thứ ${i + 1} của mã OTP" oninput="UI.otp.input(this, ${i})" onkeydown="UI.otp.key(event, ${i})">`).join('')}
        </div>
        <div class="field-error text-center mt-2" id="${st.id}-err" style="justify-content:center"></div>
        <div class="otp-meta">
          <span>Không nhận được mã? <button class="btn-link" id="${st.id}-resend" disabled>Gửi lại (${CONFIG.otp.resendSeconds}s)</button></span>
          <span class="otp-attempts" id="${st.id}-attempts">Hiệu lực ${CONFIG.otp.ttlSeconds / 60} phút · tối đa ${CONFIG.otp.maxWrong} lần nhập sai</span>
        </div>
        <div class="actions actions-row">
          ${st.o.onBack ? `<button class="btn btn-secondary btn-lg" onclick="UI._otp.o.onBack()">${st.o.backText || 'Quay lại'}</button>` : ''}
          <button class="btn btn-primary btn-lg" id="${st.id}-verify" onclick="UI.otp.verify()">${st.o.verifyText || 'Xác nhận'}</button>
        </div>
        <div class="demo-hint">Mô phỏng demo — mã hợp lệ: <strong>${CONFIG.otp.mockCode}</strong></div>`;
      const first = el.querySelector('.otp-box'); if (first) first.focus();
      this.startResendTimer();
    },
    renderLocked: function(el, minutes) {
      el.innerHTML = `<div class="alert alert-error">${UI.icon('lock', 22)}<div><span class="alert-title">Tạm khoá gửi OTP</span>Số điện thoại này đã vượt giới hạn gửi/nhập mã. Vui lòng thử lại sau <strong>${minutes} phút</strong> hoặc liên hệ hỗ trợ ${UI.esc(CONFIG.brand.supportHotline)}.</div></div>
        <div class="actions">${UI._otp.o.onBack ? `<button class="btn btn-secondary btn-lg" onclick="UI._otp.o.onBack()">Quay lại</button>` : ''}
        <button class="btn btn-ghost" onclick="Store.otpResetAll(); UI.toast('Đã gỡ khoá OTP (demo).'); UI._otp.o.onBack ? UI._otp.o.onBack() : App.reload()">Gỡ khoá (chỉ demo)</button></div>`;
    },
    startResendTimer: function() {
      const st = UI._otp; let s = CONFIG.otp.resendSeconds;
      App.clearTimer('otp');
      App.timers.otp = setInterval(() => {
        s--; const btn = document.getElementById(st.id + '-resend');
        if (!btn) { App.clearTimer('otp'); return; }
        if (s > 0) btn.textContent = `Gửi lại (${s}s)`;
        else { App.clearTimer('otp'); btn.disabled = false; btn.textContent = 'Gửi lại mã'; btn.onclick = () => UI.otp.resend(); }
      }, 1000);
    },
    resend: function() {
      const st = UI._otp; const el = document.getElementById(st.id);
      const can = Store.otpCanSend(st.phone);
      if (!can.ok) { this.renderLocked(el, can.minutes); return; }
      const count = Store.otpSend(st.phone);
      UI.toast(`Đã gửi lại mã (lần ${count}/${CONFIG.otp.maxSendsPerWindow} trong ${CONFIG.otp.windowMinutes} phút).`, 'info');
      this.render(el);
    },
    boxes: function() { return Array.from(document.querySelectorAll('#' + UI._otp.id + '-boxes .otp-box')); },
    input: function(input, i) {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      this.clearError();
      const b = this.boxes();
      if (input.value && b[i + 1]) b[i + 1].focus();
      if (b.every(x => x.value)) this.verify();
    },
    key: function(e, i) {
      const b = this.boxes();
      if (e.key === 'Backspace' && !e.target.value && b[i - 1]) { b[i - 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' && b[i - 1]) b[i - 1].focus();
      if (e.key === 'ArrowRight' && b[i + 1]) b[i + 1].focus();
      if (e.key === 'Enter') this.verify();
    },
    paste: function(e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      const b = this.boxes(); b.forEach((x, i) => { x.value = text[i] || ''; });
      const next = b.find(x => !x.value) || b[b.length - 1]; if (next) next.focus();
      if (b.every(x => x.value)) this.verify();
    },
    clearError: function() { const st = UI._otp; const g = document.getElementById(st.id + '-boxes'); const e = document.getElementById(st.id + '-err'); if (g) g.classList.remove('is-error'); if (e) e.innerHTML = ''; },
    showError: function(msg) { const st = UI._otp; const g = document.getElementById(st.id + '-boxes'); const e = document.getElementById(st.id + '-err'); if (g) g.classList.add('is-error'); if (e) e.innerHTML = UI.icon('warning', 16) + '<span>' + UI.esc(msg) + '</span>'; const b = this.boxes(); b.forEach(x => { x.value = ''; }); if (b[0]) b[0].focus(); },
    verify: function() {
      const st = UI._otp; if (!st) return;
      const code = this.boxes().map(x => x.value).join('');
      if (code.length < CONFIG.otp.length) { this.showError('Vui lòng nhập đủ ' + CONFIG.otp.length + ' số.'); return; }
      const btn = document.getElementById(st.id + '-verify'); UI.setLoading(btn, true);
      setTimeout(() => {
        const r = Store.otpVerify(st.phone, code);
        UI.setLoading(btn, false);
        if (r.ok) { App.clearTimer('otp'); st.o.onVerified(); return; }
        if (r.locked) { this.renderLocked(document.getElementById(st.id), r.minutes); return; }
        if (r.expired) { this.showError('Mã đã hết hiệu lực. Vui lòng bấm "Gửi lại mã".'); return; }
        this.showError(`Mã không đúng. Bạn còn ${r.remaining} lần thử.`);
        const a = document.getElementById(st.id + '-attempts'); if (a) a.textContent = `Còn ${r.remaining}/${CONFIG.otp.maxWrong} lần nhập`;
      }, 350);
    }
  },

  // ---------------- Countdown giữ đơn (BR-06) ----------------
  countdown: {
    mount: function(elId, expiresAt, o) {
      App.clearTimer('countdown');
      const tick = () => {
        const el = document.getElementById(elId); if (!el) { App.clearTimer('countdown'); return; }
        const left = Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000);
        const t = el.querySelector('.countdown-time'); if (t) t.textContent = RULES.formatDuration(Math.max(0, left));
        el.classList.toggle('is-warning', left > 0 && left <= CONFIG.order.warnSeconds);
        el.setAttribute('aria-label', 'Còn ' + RULES.formatDuration(Math.max(0, left)) + ' để thanh toán');
        if (left <= 0) { el.classList.add('is-expired'); App.clearTimer('countdown'); if (o && o.onExpire) o.onExpire(); }
      };
      tick();
      App.timers.countdown = setInterval(tick, 1000);
    },
    markup: function(id, label) {
      return `<span class="countdown" id="${id}" role="timer" aria-live="off">${UI.icon('clock', 18)}<span>${label || 'Giữ đơn'}</span><span class="countdown-time">--:--</span></span>`;
    }
  },

  // ---------------- QR ----------------
  qrSvg: function(text, size) {
    const s = size || 180;
    try {
      if (typeof qrcode === 'function') {
        const q = qrcode(0, 'M'); q.addData(text); q.make();
        return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }).replace('<svg ', `<svg width="${s}" height="${s}" role="img" aria-label="Mã QR" `);
      }
    } catch (e) { /* rơi xuống fallback */ }
    // Fallback: hoạ tiết giả lập tất định từ chuỗi (khi không tải được thư viện QR)
    let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) & 0x7fffffff;
    const n = 25; let cells = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { h = (h * 1103515245 + 12345) & 0x7fffffff; if ((h >> 8) % 3 === 0) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
    const eye = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#122544"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#122544"/>`;
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${n} ${n}" role="img" aria-label="Mã QR (mô phỏng)"><rect width="${n}" height="${n}" fill="#fff"/><g fill="#122544">${cells}</g>${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}</svg>`;
  },

  /** Khối VietQR: QR + STK + số tiền + nội dung = mã đơn + nút sao chép. */
  vietqr: function(order) {
    const v = CONFIG.vietqr;
    const payload = `VIETQR|${v.bankShort}|${v.accountNo}|${order.price}|${order.id}`;
    const row = (label, value, copyVal) => `<dt>${label}</dt><dd><span class="mono">${this.esc(value)}</span><button class="btn btn-secondary btn-sm btn-icon" aria-label="Sao chép ${label}" onclick="UI.copy('${this.esc(copyVal || value)}')">${this.icon('copy', 18)}</button></dd>`;
    return `<div class="vietqr">
      <div><div class="vietqr-image">${this.qrSvg(payload, 200)}</div><div class="qr-label">Quét bằng app ngân hàng hỗ trợ VietQR</div></div>
      <div class="vietqr-info"><dl class="dl">
        <dt>Ngân hàng</dt><dd><span>${this.esc(v.bankName)}</span></dd>
        ${row('Số tài khoản', v.accountNo)}
        <dt>Chủ tài khoản</dt><dd><span>${this.esc(v.accountName)}</span></dd>
        ${row('Số tiền', this.money(order.price), String(order.price))}
        ${row('Nội dung CK', order.id)}
      </dl></div></div>`;
  },

  // ---------------- Bảng, phân trang, skeleton, empty ----------------
  paginate: function(list, page, size) {
    const ps = size || CONFIG.admin.pageSize; const total = list.length; const totalPages = Math.max(1, Math.ceil(total / ps));
    const p = Math.min(Math.max(1, page || 1), totalPages);
    return { rows: list.slice((p - 1) * ps, p * ps), page: p, totalPages, total, from: total ? (p - 1) * ps + 1 : 0, to: Math.min(total, p * ps) };
  },
  pagination: function(pg, handlerExpr) {
    if (pg.total === 0) return '';
    return `<div class="pagination"><span>Hiển thị ${pg.from}–${pg.to} / ${pg.total} bản ghi</span>
      <div class="pagination-controls">
        <button class="btn btn-secondary btn-sm" ${pg.page <= 1 ? 'disabled' : ''} onclick="${handlerExpr}(${pg.page - 1})">${this.icon('arrow-left', 16)} Trước</button>
        <span class="pagination-current">Trang ${pg.page}/${pg.totalPages}</span>
        <button class="btn btn-secondary btn-sm" ${pg.page >= pg.totalPages ? 'disabled' : ''} onclick="${handlerExpr}(${pg.page + 1})">Sau ${this.icon('arrow-right', 16)}</button>
      </div></div>`;
  },
  skeletonTable: function(cols, rows) {
    return `<div class="table-wrap" aria-busy="true"><span class="sr-only">Đang tải dữ liệu…</span><table class="table"><tbody>${Array.from({ length: rows || 5 }, () => `<tr>${Array.from({ length: cols || 6 }, () => '<td><span class="skeleton"></span></td>').join('')}</tr>`).join('')}</tbody></table></div>`;
  },
  skeletonCards: function(n) { return `<div class="stack" aria-busy="true">${Array.from({ length: n || 3 }, () => '<span class="skeleton skeleton-block"></span>').join('')}</div>`; },
  empty: function(icon, title, desc, actionHtml) {
    return `<div class="empty">${this.icon(icon || 'inbox', 44)}<div class="empty-title">${this.esc(title)}</div>${desc ? `<p class="empty-desc">${this.esc(desc)}</p>` : ''}${actionHtml || ''}</div>`;
  },
  /** Vẽ skeleton rồi nội dung thật sau độ trễ giả lập (chỉ ở lần nạp đầu). */
  withLoading: function(regionId, skeletonHtml, renderFn) {
    const region = document.getElementById(regionId); if (!region) return;
    const delay = CONFIG.demo.simulatedLatencyMs;
    if (!delay) { renderFn(); return; }
    region.innerHTML = skeletonHtml;
    this._loadTokens = this._loadTokens || {};
    const token = (this._loadTokens[regionId] = (this._loadTokens[regionId] || 0) + 1);
    setTimeout(() => { if (token !== this._loadTokens[regionId] || !document.getElementById(regionId)) return; renderFn(); }, delay);
  },

  // ---------------- Biểu đồ SVG ----------------
  chart: {
    /** Cột + đường: series = [{label, bar, line}] */
    combo: function(series, o) {
      const opt = o || {}; const W = 640, H = opt.height || 220, padL = 44, padR = 12, padT = 12, padB = 28;
      const iw = W - padL - padR, ih = H - padT - padB;
      const maxBar = Math.max(1, ...series.map(s => s.bar || 0));
      const maxLine = Math.max(1, ...series.map(s => s.line || 0));
      const n = series.length; const bw = Math.max(3, (iw / n) * 0.6); const step = iw / n;
      const yb = (v) => padT + ih - (v / maxBar) * ih;
      const yl = (v) => padT + ih - (v / maxLine) * ih;
      const grid = [0, .25, .5, .75, 1].map(f => `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${padT + ih - f * ih}" y2="${padT + ih - f * ih}"/><text class="axis-text" x="${padL - 6}" y="${padT + ih - f * ih + 4}" text-anchor="end">${opt.yFormat ? opt.yFormat(f * maxBar) : Math.round(f * maxBar)}</text>`).join('');
      const bars = series.map((s, i) => `<rect class="bar ${opt.accent ? 'is-accent' : ''}" x="${padL + i * step + (step - bw) / 2}" y="${yb(s.bar || 0)}" width="${bw}" height="${padT + ih - yb(s.bar || 0)}" rx="2"><title>${UI.esc(s.label)}: ${opt.barName || ''} ${UI.num(s.bar || 0)}${s.line !== undefined ? ' · ' + (opt.lineName || '') + ' ' + UI.num(s.line) : ''}</title></rect>`).join('');
      const hasLine = series.some(s => s.line !== undefined);
      const pts = series.map((s, i) => `${padL + i * step + step / 2},${yl(s.line || 0)}`);
      const line = hasLine ? `<polyline class="line" points="${pts.join(' ')}"/>${series.map((s, i) => `<circle class="dot" r="3" cx="${padL + i * step + step / 2}" cy="${yl(s.line || 0)}"><title>${UI.esc(s.label)}: ${UI.num(s.line || 0)}</title></circle>`).join('')}` : '';
      const every = Math.ceil(n / 8);
      const labels = series.map((s, i) => i % every === 0 ? `<text class="axis-text" x="${padL + i * step + step / 2}" y="${H - 8}" text-anchor="middle">${UI.esc(s.label)}</text>` : '').join('');
      return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${UI.esc(opt.aria || 'Biểu đồ')}">${grid}${bars}${line}${labels}</svg>
        ${opt.legend ? `<div class="chart-legend">${opt.legend.map(l => `<span class="${l.cls || ''}">${UI.esc(l.text)}</span>`).join('')}</div>` : ''}</div>`;
    }
  },

  // ---------------- Xuất Excel (CSV UTF-8 BOM, mở được bằng Excel) ----------------
  exportCsv: function(filename, header, rows) {
    const cell = (v) => { const s = String(v === null || v === undefined ? '' : v); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = '﻿' + [header, ...rows].map(r => r.map(cell).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    this.toast('Đã xuất ' + filename + ' (' + rows.length + ' dòng).');
  },

  dayLabel: function(dateStr) { const d = new Date(dateStr); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }
};
