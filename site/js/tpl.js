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
 *
 * Tên template = đường dẫn trong screens/ bỏ đuôi .html ('buyer/a-01'). Có thể gọi tắt bằng tên file
 * ('a-01') nếu không trùng ở thư mục khác — nhờ vậy sắp xếp lại screens/ không phải sửa js/views-*.js.
 *
 * MỘT FILE CHỨA NHIỀU TEMPLATE — mỗi route gói trong một file, các mảnh con đặt trong khối:
 *   {% block admin/agents-table %} … {% endblock %}
 * Lúc nạp, TPL tách từng khối thành template riêng mang đúng tên đó, phần nằm ngoài mọi khối là
 * template chính của file. Nên TPL.render('admin/agents-table') vẫn chạy dù markup nằm trong admin/d-02.html.
 * Khối không lồng nhau được; tên khối là tên đầy đủ ('partials/alert'), không phải tên tương đối.
 */
const TPL = {
  cache: {}, fns: {}, base: './screens/',
  /** Bundle markup do build.py sinh ra (js/templates.js) — dùng khi mở bằng file://. */
  bundle: null,
  /** Danh sách template nạp khi khởi động (tên file không đuôi .html). */
  manifest: [
    'admin/agents', 'admin/dashboard', 'admin/exceptions', 'admin/inventory', 'admin/login', 'admin/orders', 'admin/products', 'admin/ranks', 'admin/registrations', 'admin/users', 'admin/withdrawals',
    'buyer/buy', 'buyer/login', 'buyer/order-lookup', 'buyer/order-result', 'buyer/payment', 'buyer/register',
    'common/common', 'common/partials',
    'seller/dashboard', 'seller/my-package', 'seller/profile', 'seller/wallet'
  ],
  /** Nạp markup từ bundle (file://) hoặc fetch từng file (http:// — sửa file là thấy ngay). */
  load: function() {
    if (this.bundle && location.protocol === 'file:') { this.useBundle(); return Promise.resolve(); }
    return Promise.all(this.manifest.map(n => fetch(this.base + n + '.html', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('Không nạp được template ' + n); return r.text(); }).then(t => { this.put(n, t); })))
      .then(() => { this.alias = null; })
      .catch((e) => { if (!this.bundle) throw e; this.useBundle(); });
  },
  useBundle: function() { this.cache = {}; this.fns = {}; this.owner = {}; Object.keys(this.bundle).forEach(n => { this.put(n, this.bundle[n]); }); this.alias = null; },

  /**
   * Nạp nội dung một file vào cache, tách {% block tên %}…{% endblock %} thành template riêng.
   * Phần nằm ngoài mọi khối là template chính, mang tên file. File không có khối nào thì giữ nguyên.
   */
  owner: {},
  put: function(name, src) {
    const re = /\{%\s*block\s+([\w./-]+)\s*%\}([\s\S]*?)\{%\s*endblock\s*%\}/g;
    let m, last = 0, rest = '';
    while ((m = re.exec(src))) {
      rest += src.slice(last, m.index); last = re.lastIndex;
      const b = m[1];
      if (this.owner[b] && this.owner[b] !== name) throw new Error('Khối "' + b + '" khai báo ở cả ' + this.owner[b] + ' và ' + name + '.');
      this.owner[b] = name; this.cache[b] = m[2]; delete this.fns[b];
    }
    this.cache[name] = last ? rest + src.slice(last) : src;
    delete this.fns[name];
  },

  /**
   * Tên ngắn → đường dẫn thật: gọi TPL.render('buyer/buy') vẫn chạy khi file nằm ở screens/buyer/a-01.html,
   * nên đổi chỗ file trong screens/ không phải sửa js/views-*.js. Muốn chỉ đích danh thì ghi cả
   * thư mục ('partials/alert'). Trùng tên ở hai thư mục → báo lỗi rõ thay vì lấy nhầm file.
   */
  alias: null,
  buildAlias: function() {
    const a = {};
    Object.keys(this.cache).forEach(n => { const b = n.slice(n.lastIndexOf('/') + 1); if (b !== n) a[b] = (b in a) ? null : n; });
    this.alias = a;
  },
  resolve: function(name) {
    if (this.cache[name] !== undefined) return name;
    if (!this.alias) this.buildAlias();
    const hit = this.alias[name];
    if (hit) return hit;
    if (name in this.alias) throw new Error('Tên template "' + name + '" trùng ở nhiều thư mục — gọi kèm thư mục, ví dụ "admin/' + name + '".');
    throw new Error('Chưa nạp template ' + name);
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
    const key = this.resolve(name);
    if (!this.fns[key]) this.fns[key] = this.compile(this.cache[key], key);
    return this.fns[key](data || {}, this.helpers());
  }
};
