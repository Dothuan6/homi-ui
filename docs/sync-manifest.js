/* Cập nhật TPL.manifest trong js/tpl.js theo danh sách file trong screens/ (đệ quy, .html): node docs/sync-manifest.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
function walk(dir, out) { fs.readdirSync(dir).sort().forEach(f => { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (f.endsWith('.html')) out.push(p); }); return out; }
const names = walk(path.join(root, 'screens'), []).map(f => path.relative(path.join(root, 'screens'), f).split(path.sep).join('/').replace(/\.html$/, ''));
// nhóm theo tiền tố (a-, c-, d-, partials/…) để dễ đọc
const groups = {};
names.forEach(n => { const k = n.includes('/') ? n.split('/')[0] : (/^[a-z]-\d/.test(n) ? n[0] : 'misc'); (groups[k] = groups[k] || []).push(n); });
const body = Object.keys(groups).sort().map(k => '    ' + groups[k].map(n => "'" + n + "'").join(', ')).join(',\n');
const file = path.join(root, 'js/tpl.js'); const src = fs.readFileSync(file, 'utf8');
const out = src.replace(/manifest: \[[\s\S]*?\n  \],/, 'manifest: [\n' + body + '\n  ],');
fs.writeFileSync(file, out); console.log('manifest: ' + names.length + ' template');
