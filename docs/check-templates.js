/* Kiểm tra cú pháp toàn bộ template screens/ (đệ quy, *.html): node docs/check-templates.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { UI: {}, RULES: {}, CONFIG: {}, LABELS: {}, Store: {}, App: {}, POLICIES: [], fetch: () => Promise.resolve({ ok: true, text: () => '' }), console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/tpl.js'), 'utf8') + '\nthis.TPL = TPL;', ctx);
const TPL = ctx.TPL;
function walk(dir, out) { fs.readdirSync(dir).forEach(f => { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (f.endsWith('.html')) out.push(p); }); return out; }
const files = walk(path.join(root, 'screens'), []);
let bad = 0; const names = [];
files.forEach(f => {
  const name = path.relative(path.join(root, 'screens'), f).replace(/\\/g, '/').replace(/\.html$/, ''); names.push(name);
  try { TPL.compile(fs.readFileSync(f, 'utf8'), name); } catch (e) { bad++; console.error('✗', name, '→', e.message); }
});
const missing = TPL.manifest.filter(n => !names.includes(n)); const extra = names.filter(n => !TPL.manifest.includes(n));
if (missing.length) console.error('Thiếu file cho manifest:', missing.join(', '));
if (extra.length) console.warn('Có file chưa khai báo trong manifest:', extra.join(', '));
console.log((bad ? bad + ' template lỗi' : 'OK') + ' · ' + files.length + ' template');
process.exit(bad || missing.length ? 1 : 0);
