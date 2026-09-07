/**
 * TPL — mini template engine: markup nằm trong screens/*.html, JS chỉ đổ dữ liệu.
 *
 * Cú pháp trong file .html:
 *   {{ expr }}            → chèn giá trị, có escape HTML
 *   {{{ expr }}}          → chèn HTML thô (dùng cho badge/icon/include…)
 *   {% if expr %} … {% elif expr %} … {% else %} … {% endif %}
 *   {% each item in list %} … {% endeach %}      (có thể {% each item, i in list %})
 *   {% set name = expr %}                          (biến cục bộ)
 *   {{{ include('partials/ten-file', { ... }) }}}  (gọi template con)
 *
 * Biến sẵn có trong template: dữ liệu view truyền vào + helpers (UI, RULES, CONFIG, LABELS, Store, App,
 * esc, money, num, date, dt, badge, icon, label, include).
 */
const TPL = {
  cache: {}, fns: {}, base: './screens/',
  /** Danh sách template nạp khi khởi động (tên file không đuôi .html). */
  manifest: [
    'a-01-state', 'a-01', 'a-02-bank', 'a-02-choose', 'a-02-expired', 'a-02-gateway', 'a-02', 'a-03-awaiting', 'a-03-failed', 'a-03-later', 'a-03-nocode', 'a-03-paid', 'a-03-reg-prompt-foot', 'a-03-reg-prompt', 'a-03-rejected', 'a-04-card', 'a-04-result', 'a-04', 'a-05-reset', 'a-05', 'a-06-blocked', 'a-06-check', 'a-06-done', 'a-06-form', 'a-06-status', 'a-06',
    'c-01-cmchart', 'c-01-commissions-table', 'c-01-commissions', 'c-01-stats-body', 'c-01-stats', 'c-01-tree', 'c-01', 'c-02', 'c-03-ledger', 'c-03-requests', 'c-03-withdraw', 'c-03',
    'd-00-alert', 'd-00', 'd-01-job-result', 'd-01', 'd-02-drawer', 'd-02-modal-rank', 'd-02-modal-referrer', 'd-02-modal-root', 'd-02-table', 'd-02', 'd-03-allocation', 'd-03-drawer', 'd-03-table', 'd-03', 'd-04-commission-table', 'd-04-modal-package', 'd-04-modal-table', 'd-04', 'd-05-drawer', 'd-05-modal-generate', 'd-05-modal-import', 'd-05-table', 'd-05', 'd-06', 'd-07-drawer', 'd-07-ledger', 'd-07-withdraw', 'd-07', 'd-08', 'd-09-drawer', 'd-09-table', 'd-09', 'd-10-form', 'd-10',
    '403', 'c-profile', 'demo-nav', 'home', 'policy', 'shell-admin', 'shell-buyer', 'shell-seller',
    'partials/admin-actions', 'partials/admin-approval-cell', 'partials/admin-audit-list', 'partials/admin-period-seg', 'partials/admin-timeline', 'partials/admin-tree', 'partials/alert', 'partials/btn-reload', 'partials/card-head', 'partials/intro-panel', 'partials/order-info', 'partials/otp-frame', 'partials/pkg-header', 'partials/product-intro', 'partials/reg-cta', 'partials/seller-approval-timeline', 'partials/seller-f1-table', 'partials/seller-period-seg', 'partials/seller-rank-ladder', 'partials/seller-tree-node', 'partials/seller-tree', 'partials/seller-wd-steps'
  ],
  load: function() {
    return Promise.all(this.manifest.map(n => fetch(this.base + n + '.html', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('Không nạp được template ' + n); return r.text(); }).then(t => { this.cache[n] = t; })));
  },
  helpers: function() {
    return { UI, RULES, CONFIG, LABELS, Store, App, POLICIES: typeof POLICIES !== 'undefined' ? POLICIES : [], esc: UI.esc.bind(UI), money: UI.money.bind(UI), num: UI.num.bind(UI), date: UI.date.bind(UI), dt: UI.dt.bind(UI), badge: UI.badge.bind(UI), icon: UI.icon.bind(UI), label: UI.label.bind(UI), include: (n, d) => TPL.render(n, d || {}) };
  },
  compile: function(src, name) {
    const re = /\{%\s*([\s\S]*?)\s*%\}|\{\{\{\s*([\s\S]*?)\s*\}\}\}|\{\{\s*([\s\S]*?)\s*\}\}/g;
    let code = "let __o = '';\n", last = 0, m;
    const lit = (s) => s ? '__o += ' + JSON.stringify(s) + ';\n' : '';
    while ((m = re.exec(src))) {
      code += lit(src.slice(last, m.index)); last = re.lastIndex;
      if (m[1] !== undefined) {
        const t = m[1];
        if (t.startsWith('if ')) code += 'if (' + t.slice(3) + ') {\n';
        else if (t.startsWith('elif ')) code += '} else if (' + t.slice(5) + ') {\n';
        else if (t === 'else') code += '} else {\n';
        else if (t === 'endif') code += '}\n';
        else if (t.startsWith('each ')) { const mm = /^each\s+(\w+)(?:\s*,\s*(\w+))?\s+in\s+([\s\S]+)$/.exec(t); if (!mm) throw new Error(name + ': each sai cú pháp: ' + t); code += 'for (const [' + (mm[2] || '__i') + ', ' + mm[1] + '] of Array.from((' + mm[3] + ') || []).entries()) {\n'; }
        else if (t === 'endeach') code += '}\n';
        else if (t.startsWith('set ')) code += 'var ' + t.slice(4) + ';\n';
        else throw new Error(name + ': tag không hỗ trợ: ' + t);
      } else if (m[2] !== undefined) code += '{ const __v = (' + m[2] + '); __o += (__v === null || __v === undefined) ? "" : String(__v); }\n';
      else code += '{ const __v = (' + m[3] + '); __o += esc((__v === null || __v === undefined) ? "" : __v); }\n';
    }
    code += lit(src.slice(last)) + 'return __o;';
    try { return new Function('data', 'helpers', 'with (helpers) { with (data) { ' + code + ' } }'); }
    catch (e) { throw new Error('Template ' + name + ' lỗi: ' + e.message); }
  },
  render: function(name, data) {
    if (!this.fns[name]) { const src = this.cache[name]; if (src === undefined) throw new Error('Chưa nạp template ' + name); this.fns[name] = this.compile(src, name); }
    return this.fns[name](data || {}, this.helpers());
  }
};
