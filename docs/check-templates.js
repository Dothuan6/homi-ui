/*
 * Kiểm tra toàn bộ template: node docs/check-templates.js
 *   1. Nạp mọi file screens/ (đệ quy), tách {% block %} như TPL làm lúc chạy thật
 *   2. Biên dịch thử từng template — bắt lỗi cú pháp {{ }} / {% if %} / {% each %}
 *   3. Đối chiếu TPL.manifest với file thực tế
 *   4. Soát mọi tên template được gọi trong js/*.js và trong include() của markup — phải resolve được
 * Thoát mã 1 nếu có lỗi.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { UI: {}, RULES: {}, CONFIG: {}, LABELS: {}, Store: {}, App: {}, POLICIES: [], fetch: () => Promise.resolve({ ok: true, text: () => '' }), console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/tpl.js'), 'utf8') + '\nthis.TPL = TPL;', ctx);
const TPL = ctx.TPL;

function walk(dir, out) { fs.readdirSync(dir).sort().forEach(f => { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (f.endsWith('.html')) out.push(p); }); return out; }

const screens = path.join(root, 'screens');
const files = walk(screens, []);
const fileNames = files.map(f => path.relative(screens, f).replace(/\\/g, '/').replace(/\.html$/, ''));

// 1. Nạp + tách khối
let bad = 0;
files.forEach((f, i) => {
  try { TPL.put(fileNames[i], fs.readFileSync(f, 'utf8')); }
  catch (e) { bad++; console.error('✗ nạp', fileNames[i], '→', e.message); }
});

// 2. Biên dịch thử mọi template (file chính + khối con)
const all = Object.keys(TPL.cache).sort();
all.forEach(name => {
  try { TPL.compile(TPL.cache[name], name); }
  catch (e) { bad++; console.error('✗ biên dịch', name, '→', e.message); }
});

// 3. Manifest ↔ file thực tế
const missing = TPL.manifest.filter(n => !fileNames.includes(n));
const extra = fileNames.filter(n => !TPL.manifest.includes(n));
if (missing.length) { bad++; console.error('✗ manifest trỏ tới file không tồn tại:', missing.join(', ')); }
if (extra.length) { bad++; console.error('✗ file chưa khai báo trong manifest:', extra.join(', '), '→ chạy python docs/merge-screens.py hoặc node docs/sync-manifest.js'); }

// 4. Mọi tên được gọi trong JS và trong include() phải resolve được
const callRe = /(?:TPL\.render|this\.parts|include)\(\s*'([^']+)'/g;
const refs = new Map();
function scan(file, src) { let m; while ((m = callRe.exec(src))) { if (!refs.has(m[1])) refs.set(m[1], file); } }
fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js') && f !== 'templates.js').forEach(f => scan('js/' + f, fs.readFileSync(path.join(root, 'js', f), 'utf8')));
files.forEach((f, i) => scan('screens/' + fileNames[i] + '.html', fs.readFileSync(f, 'utf8')));

const placeholder = new Set(['partials/ten-file']); // ví dụ trong chú thích tpl.js
refs.forEach((where, name) => {
  if (placeholder.has(name)) return;
  try { TPL.resolve(name); }
  catch (e) { bad++; console.error('✗ gọi', JSON.stringify(name), 'tại', where, '→', e.message); }
});

console.log((bad ? bad + ' lỗi' : 'OK') + ' · ' + files.length + ' file · ' + all.length + ' template · ' + refs.size + ' lời gọi');
process.exit(bad ? 1 : 0);
