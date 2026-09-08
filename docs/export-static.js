/*
 * Xuất prototype thành site nhiều trang: node docs/export-static.js
 *
 * Mỗi màn hình → một file .html riêng trong site/, double-click là chạy, không cần server.
 * Mỗi trang có HAI lớp:
 *
 *   1. Markup dựng sẵn trong <div id="app-root"> — HTML thuần, không còn {{ }} hay {% if %}.
 *      Xem được ngay cả khi tắt JS; điều hướng bằng thẻ <a> và bảng "Màn hình" góc phải.
 *   2. Bộ script của prototype nạp phía dưới. Có JS thì App render đè lên lớp 1 và từ đó
 *      MỌI THỨ chạy như index.html: OTP, đếm ngược giữ đơn, polling đối soát, drawer,
 *      modal, duyệt 2 lớp, job xét hạng, dữ liệu ghi vào localStorage.
 *
 * window.__ROUTE__ ở mỗi trang cho App biết khởi động ở màn nào. Trang cần đăng nhập tự dựng
 * phiên demo trước khi App.boot() chạy (xem bootScript). site/js/templates.js được sinh kèm nên
 * TPL không phải fetch — chạy được bằng giao thức file://.
 *
 * Xuất lại sau mỗi lần sửa markup, JS hoặc dữ liệu mẫu.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SCREENS = path.join(ROOT, 'screens');
const OUT = path.join(ROOT, 'site');

/* ---------------------------------------------------------------- trang cần xuất */
// file: tên file trong site/ · route: hash như trên prototype · as: phiên cần dựng trước khi render
const PAGES = [
  { file: 'index', route: 'home', title: 'Trang bìa prototype' },
  { file: 'buy', route: 'buy', title: 'Trang mua hàng', ref: true },
  { file: 'buy-invalid', route: 'buy?state=invalid', title: 'Link giới thiệu không hợp lệ' },
  { file: 'buy-inactive', route: 'buy?state=inactive', title: 'Thành viên bị khoá' },
  { file: 'payment', route: 'payment?state=demo', title: 'Thanh toán', ref: true },
  { file: 'order-result-paid', route: 'order-result?state=paid', title: 'Đơn hàng đã thanh toán' },
  { file: 'order-result-awaiting', route: 'order-result?state=reconcile', title: 'Chờ đối soát chuyển khoản' },
  { file: 'order-result-failed', route: 'order-result?state=failed', title: 'Thanh toán thất bại' },
  { file: 'order-result-rejected', route: 'order-result?state=rejected', title: 'Đơn bị từ chối đối soát' },
  { file: 'order-result-later', route: 'order-result?state=later', title: 'Đã gửi mã qua SMS, đăng ký sau' },
  { file: 'order-result-nocode', route: 'order-result?state=nocode', title: 'Đã thanh toán, kho hết mã' },
  { file: 'order-lookup', route: 'order-lookup', title: 'Tra cứu đơn hàng' },
  { file: 'login', route: 'login', title: 'Đăng nhập thành viên' },
  { file: 'login-forgot', route: 'login?view=forgot', title: 'Quên mật khẩu' },
  { file: 'register', route: 'register', title: 'Đăng ký thành viên' },
  { file: 'register-pending', route: 'register?state=pending', title: 'Hồ sơ chờ duyệt' },
  { file: 'register-rejected', route: 'register?state=rejected', title: 'Hồ sơ bị từ chối' },

  { file: 'dashboard', route: 'dashboard', title: 'Thành viên · Tổng quan', as: 'agent' },
  { file: 'my-package', route: 'my-package', title: 'Thành viên · Gói của tôi', as: 'agent' },
  { file: 'wallet', route: 'wallet', title: 'Thành viên · Ví & rút tiền', as: 'agent' },
  { file: 'profile', route: 'profile', title: 'Thành viên · Hồ sơ', as: 'agent' },

  { file: 'admin-login', route: 'admin-login', title: 'Quản trị · Đăng nhập' },
  { file: 'admin-dashboard', route: 'admin-dashboard', title: 'Quản trị · Tổng quan', as: 'admin' },
  { file: 'agents', route: 'agents', title: 'Quản trị · Thành viên', as: 'admin' },
  { file: 'orders', route: 'orders', title: 'Quản trị · Đơn hàng & đối soát', as: 'admin' },
  { file: 'products', route: 'products', title: 'Quản trị · Sản phẩm & hoa hồng', as: 'admin' },
  { file: 'inventory', route: 'inventory', title: 'Quản trị · Kho mã & thiết bị', as: 'admin' },
  { file: 'ranks', route: 'ranks', title: 'Quản trị · Hạng & quy tắc', as: 'admin' },
  { file: 'withdrawals', route: 'withdrawals', title: 'Quản trị · Rút tiền & sổ hoa hồng', as: 'admin' },
  { file: 'registrations', route: 'registrations', title: 'Quản trị · Duyệt đăng ký', as: 'admin' },
  { file: 'admin-users', route: 'admin-users', title: 'Quản trị · Tài khoản admin', as: 'admin' },

  { file: 'policy', route: 'policy', title: 'Chính sách' },
  { file: '403', route: '403', title: 'Không có quyền truy cập' }
];

/* Routing cho bản tĩnh: nút không có App.navigate() thì tra id ở đây để biết bấm xong đi đâu.
   Đây là các bước trong luồng mà bản chạy thật xử lý bằng JS (validate, OTP…) — bản tĩnh nhảy thẳng. */
const FLOW = {
  'a01-form': 'payment', 'a01-submit': 'payment',   // Trang mua hàng → Thanh toán
  'lg-submit': 'dashboard',                          // Đăng nhập thành viên → Tổng quan
  'ad-submit': 'admin-dashboard',                    // Đăng nhập quản trị → Tổng quan
  'lk-submit': 'order-lookup'                        // Tra cứu đơn (ở lại trang)
};

const CSS = ['tokens', 'base', 'components', 'buyer', 'seller', 'admin'];
const DEMO = { agentPhone: '0908123456', agentPass: 'Homi@123', adminUser: 'head', adminPass: 'Homi@2026', refCode: 'AN7K2Q' };

/* ---------------------------------------------------------------- sandbox */
function stubEl() {
  const el = {
    hidden: false, innerHTML: '', outerHTML: '', textContent: '', value: '', checked: false,
    style: {}, dataset: {}, children: [], firstChild: null, parentNode: null,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    appendChild() {}, removeChild() {}, insertAdjacentHTML() {}, remove() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, focus() {}, blur() {}, click() {}, scrollIntoView() {},
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 }; }
  };
  return el;
}

function makeContext() {
  const mem = Object.create(null);
  const localStorage = {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: k => { delete mem[k]; },
    clear: () => { for (const k in mem) delete mem[k]; }
  };
  const document = {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => stubEl(), createTextNode: () => stubEl(),
    addEventListener() {}, removeEventListener() {},
    body: stubEl(), head: stubEl(), documentElement: stubEl(), title: ''
  };
  const location = { hash: '', href: 'file:///site/index.html', protocol: 'file:', reload() {}, assign() {}, replace() {} };
  const ctx = {
    console, localStorage, document, location,
    navigator: { userAgent: 'node', clipboard: { writeText: () => Promise.resolve() } },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    URLSearchParams, TextEncoder, TextDecoder, Intl,
    fetch: () => Promise.reject(new Error('fetch không có trong bản xuất tĩnh')),
    qrcode: undefined
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.self = ctx;
  return ctx;
}

const SOURCES = [
  'config/business-rules.js', 'config/policies.js', 'mock/data.js',
  'js/ui.js', 'js/tpl.js', 'js/views-buyer.js', 'js/views-seller.js', 'js/views-admin.js', 'js/app.js'
];

function boot() {
  const ctx = makeContext();
  vm.createContext(ctx);
  let src = SOURCES.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
  src += '\n;this.__api = { CONFIG, LABELS, RULES, Store, UI, TPL, Buyer, Seller, Admin, App,' +
         ' POLICIES: typeof POLICIES !== "undefined" ? POLICIES : [] };\n';
  vm.runInContext(src, ctx, { filename: 'prototype-bundle.js' });
  return ctx.__api;
}

function walk(dir, out) {
  fs.readdirSync(dir).sort().forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.html')) out.push(p);
  });
  return out;
}

/* ---------------------------------------------------------------- render */
function routeMap() {
  const m = new Map();
  // Khớp chính xác trước (buy?state=invalid), rồi mới tới route trần (buy) —
  // trang đầu tiên khai báo cho một route trần là trang chuẩn của route đó.
  PAGES.forEach(p => m.set(p.route, p.file + '.html'));
  PAGES.forEach(p => { const b = p.route.split('?')[0]; if (!m.has(b)) m.set(b, p.file + '.html'); });
  return m;
}

/** route (có thể kèm ?query) → tên file tĩnh. */
function fileFor(route, map) {
  if (!route) return null;
  if (/^(r|p)\//i.test(route)) return 'buy.html';
  return map.get(route) || map.get(route.split('?')[0]) || null;
}

/** Đích của một thẻ dựa vào onclick (App.navigate) hoặc id (bảng FLOW). */
function targetOf(attrs, map) {
  const nav = /App\.navigate\(\s*['"]([^'"]+)['"]/.exec(attrs);
  if (nav) { const f = fileFor(nav[1], map); if (f) return f; }
  const id = /\bid="([^"]+)"/.exec(attrs);
  if (id && FLOW[id[1]]) { const f = fileFor(FLOW[id[1]], map); if (f) return f; }
  return null;
}

/** Bỏ mọi thuộc tính on*= trong một chuỗi thuộc tính thẻ. */
function stripHandlers(attrs) {
  return attrs.replace(/\son[a-z]+="[^"]*"/gi, '').replace(/\son[a-z]+='[^']*'/gi, '');
}

function rewriteLinks(html, map) {
  // 1. href="#route" → tên file tĩnh
  html = html.replace(/href="#([^"]*)"/g, (all, hash) => {
    const f = fileFor(hash, map);
    return f ? 'href="' + f + '"' : 'href="#"';
  });

  // 2. <button> có đích điều hướng → <a href> để bấm được mà không cần JS
  html = html.replace(/<button([^>]*)>([\s\S]*?)<\/button>/gi, (all, attrs, inner) => {
    const to = targetOf(attrs, map);
    if (!to) return '<button' + stripHandlers(attrs) + '>' + inner + '</button>';
    const keep = stripHandlers(attrs).replace(/\s(type|disabled|aria-expanded)="[^"]*"/gi, '');
    return '<a href="' + to + '" role="button"' + keep + '>' + inner + '</a>';
  });

  // 3. <tr>/<div> có onclick điều hướng → bọc bằng thuộc tính data để CSS hover vẫn đúng,
  //    và gắn href qua thẻ <a> phủ kín nếu là hàng bảng thì bỏ qua (drawer không có ở bản tĩnh).
  html = html.replace(/<form([^>]*)>/gi, (all, attrs) => {
    const to = targetOf(attrs, map);
    const keep = stripHandlers(attrs);
    return to ? '<form' + keep + ' action="' + to + '" method="get">' : '<form' + keep + '>';
  });

  // 4. Còn lại: gỡ handler để bấm không văng lỗi console
  html = html.replace(/\son[a-z]+="[^"]*"/gi, '').replace(/\son[a-z]+='[^']*'/gi, '');
  return html;
}

const NAV_CSS = `
  .proto-nav{position:fixed;right:16px;bottom:16px;z-index:9999;font:13px/1.4 system-ui,sans-serif}
  .proto-nav>summary{list-style:none;cursor:pointer;background:#1E3A66;color:#fff;padding:8px 14px;
    border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.25);user-select:none}
  .proto-nav>summary::-webkit-details-marker{display:none}
  .proto-nav[open]>summary{border-radius:8px 8px 0 0}
  .proto-nav .panel{background:#fff;border:1px solid #d8dee9;border-radius:8px;padding:12px 14px;
    max-height:70vh;overflow:auto;min-width:230px;box-shadow:0 8px 28px rgba(0,0,0,.18)}
  .proto-nav h4{margin:10px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7a90}
  .proto-nav h4:first-child{margin-top:0}
  .proto-nav a{display:block;padding:3px 0;color:#1E3A66;text-decoration:none}
  .proto-nav a:hover{text-decoration:underline}
  .proto-nav a[aria-current]{font-weight:700}`;

/** Bảng nhảy màn — thay cho demo navigator (F9) của bản chạy được. Thuần HTML, không cần JS. */
function navPanel(current) {
  const groups = new Map();
  PAGES.forEach(p => {
    const g = p.title.includes(' · ') ? p.title.split(' · ')[0] : 'Người mua & công khai';
    const label = p.title.includes(' · ') ? p.title.split(' · ').slice(1).join(' · ') : p.title;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push({ file: p.file, label });
  });
  let out = '<details class="proto-nav"><summary>Màn hình</summary><div class="panel">';
  groups.forEach((items, g) => {
    out += '<h4>' + g + '</h4>';
    items.forEach(it => {
      out += '<a href="' + it.file + '.html"' + (it.file === current ? ' aria-current="page"' : '') + '>' + it.label + '</a>';
    });
  });
  return out + '</div></details>';
}

const SCRIPTS = [
  'config/business-rules.js', 'config/policies.js', 'mock/data.js',
  'js/ui.js', 'js/tpl.js', 'js/templates.js',
  'js/views-buyer.js', 'js/views-seller.js', 'js/views-admin.js', 'js/app.js'
];

/** Script dựng sẵn phiên demo cho trang cần đăng nhập — chạy trước App.boot() nhờ thứ tự thẻ script. */
function bootScript(p) {
  const lines = [];
  if (p.as === 'agent') lines.push("if (!Store.currentAgent()) Store.loginAgent(" + JSON.stringify(DEMO.agentPhone) + ", " + JSON.stringify(DEMO.agentPass) + ", true);");
  if (p.as === 'admin') lines.push("if (!Store.currentAdmin()) Store.adminLogin(" + JSON.stringify(DEMO.adminUser) + ", " + JSON.stringify(DEMO.adminPass) + ");");
  if (p.ref) lines.push("Store.captureRef(" + JSON.stringify(DEMO.refCode) + ");");
  if (!lines.length) return '';
  return '<script>document.addEventListener("DOMContentLoaded", function () { try {\n  ' +
    lines.join('\n  ') + '\n} catch (e) { console.error(e); } });<\/script>\n';
}

function page(p, body) {
  const title = p.title;
  return '<!DOCTYPE html>\n<html lang="vi">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' + title + ' · HOMI365</title>\n' +
    '  <meta name="theme-color" content="#1E3A66">\n' +
    '  <link rel="icon" href="./public/image/favicon.svg" type="image/svg+xml">\n' +
    CSS.map(c => '  <link rel="stylesheet" href="./css/' + c + '.css">').join('\n') + '\n' +
    '  <style>' + NAV_CSS + '\n  </style>\n' +
    '</head>\n<body>\n' +
    '<!-- Nội dung dựng sẵn: xem được ngay cả khi tắt JS. Có JS thì app thật render đè lên. -->\n' +
    '<div id="app-root">\n' + body + '\n</div>\n' +
    navPanel(p.file) + '\n\n' +
    '<script>window.__ROUTE__ = ' + JSON.stringify(p.route) + ';<\/script>\n' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js" crossorigin="anonymous"><\/script>\n' +
    SCRIPTS.filter(s => s !== 'js/app.js').map(s => '<script src="./' + s + '"><\/script>').join('\n') + '\n' +
    bootScript(p) +
    '<script src="./js/app.js"><\/script>\n' +
    '</body>\n</html>\n';
}

/** Sinh site/js/templates.js từ screens/ để app chạy được bằng file:// (không fetch). */
function writeBundle(files) {
  const obj = {};
  files.forEach(f => {
    const name = path.relative(SCREENS, f).replace(/\\/g, '/').replace(/\.html$/, '');
    obj[name] = fs.readFileSync(f, 'utf8');
  });
  const body = Object.keys(obj).sort()
    .map(k => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(obj[k])).join(',\n');
  fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'js', 'templates.js'),
    '/* Sinh tự động bởi docs/export-static.js — nguồn: screens/ */\nTPL.bundle = {\n' + body + '\n};\n', 'utf8');
  return Object.keys(obj).length;
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src).forEach(f => {
    const s = path.join(src, f), d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  });
}

function main() {
  const api = boot();
  const { TPL, Store, App } = api;

  // Nạp markup + tách {% block %} y như lúc chạy thật
  const files = walk(SCREENS, []);
  files.forEach(f => TPL.put(path.relative(SCREENS, f).replace(/\\/g, '/').replace(/\.html$/, ''), fs.readFileSync(f, 'utf8')));

  if (typeof Store.load === 'function') Store.load(); else Store.reset(true);

  const missing = PAGES.filter(p => !App.routes[p.route.split('?')[0]]);
  if (missing.length) {
    console.error('Không có route: ' + missing.map(p => p.route).join(', '));
    console.error('Có vẻ chưa chạy: python docs/rename-screens.py');
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  copyDir(path.join(ROOT, 'css'), path.join(OUT, 'css'));
  copyDir(path.join(ROOT, 'public'), path.join(OUT, 'public'));
  copyDir(path.join(ROOT, 'js'), path.join(OUT, 'js'));
  copyDir(path.join(ROOT, 'config'), path.join(OUT, 'config'));
  copyDir(path.join(ROOT, 'mock'), path.join(OUT, 'mock'));
  const nTpl = writeBundle(files);

  const map = routeMap();
  let ok = 0, failed = 0;
  PAGES.forEach(p => {
    const [base, qs] = p.route.split('?');
    try {
      Store.logoutAgent(); Store.logoutAdmin();
      if (p.as === 'agent') Store.loginAgent(DEMO.agentPhone, DEMO.agentPass, false);
      if (p.as === 'admin') Store.adminLogin(DEMO.adminUser, DEMO.adminPass);
      if (p.ref && typeof Store.captureRef === 'function') Store.captureRef(DEMO.refCode);

      App.current = base;
      const body = App.routes[base](new URLSearchParams(qs || '')) || '';
      if (!body.trim()) throw new Error('view trả về rỗng (thiếu dữ liệu mẫu hoặc bị guard chuyển hướng)');
      fs.writeFileSync(path.join(OUT, p.file + '.html'), page(p, rewriteLinks(body, map)), 'utf8');
      ok++;
    } catch (e) {
      failed++;
      console.error('✗ ' + p.file + '.html  (' + p.route + ') → ' + e.message);
    }
  });

  console.log('\nsite/: ' + ok + ' trang, ' + nTpl + ' template' + (failed ? ', ' + failed + ' lỗi' : '') + '. Mở site/index.html.');
  process.exit(failed ? 1 : 0);
}

main();
