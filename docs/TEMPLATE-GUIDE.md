# Quy ước template màn hình (screens/*.html)

Mục tiêu: **markup nằm trong `screens/*.html`**, file `js/views-*.js` chỉ giữ logic + dữ liệu (view-model) rồi gọi `TPL.render('ten-template', data)`.

## Engine `js/tpl.js`

| Cú pháp | Ý nghĩa |
|---|---|
| `{{ expr }}` | chèn giá trị, **có escape HTML** |
| `{{{ expr }}}` | chèn HTML thô (badge, icon, `UI.field(...)`, include, chuỗi HTML đã dựng sẵn) |
| `{% if expr %} … {% elif expr %} … {% else %} … {% endif %}` | điều kiện |
| `{% each item in list %} … {% endeach %}` / `{% each item, i in list %}` | lặp (`i` là chỉ số) |
| `{% set x = expr %}` | biến cục bộ |
| `{{{ include('partials/ten', { ... }) }}}` | gọi template con |

- `expr` là **JavaScript thuần** (được chạy trong `with(helpers){ with(data){ … } }`).
- Biến sẵn có: mọi key của `data` + helpers `UI, RULES, CONFIG, LABELS, Store, App, POLICIES, esc, money, num, date, dt, badge, icon, label, include`.
- **Chỉ tham chiếu key có trong `data`** (hoặc helper/global). Tham chiếu biến không tồn tại → `ReferenceError`. Nếu key tuỳ chọn, luôn truyền (có thể `null`) từ JS.
- `{{ }}` với `null/undefined` in ra chuỗi rỗng.
- Không dùng `<script>` trong template. Sự kiện vẫn là `onclick="Seller.xxx('…')"` như cũ.
- Tên template = đường dẫn tương đối trong `screens/` không có `.html` (`'d-03-drawer'`, `'partials/pkg-header'`). Mọi template phải có trong `TPL.manifest` (js/tpl.js) để được nạp trước khi chạy — chạy `node docs/sync-manifest.js` sau khi thêm/xoá file.
- Trong `{{ }}` / `{{{ }}}` tránh viết biểu thức kết thúc bằng `}}` liền nhau (ví dụ object lồng `{ a: { b: 1 }}`): thêm dấu cách hoặc dấu `)` trước `}}` vì engine tìm cặp `}}` đầu tiên.

## Cách chuyển một view

Trước (JS):
```js
D10: function() {
  const me = this.me(); const list = Store.adminUsers();
  const html = `<table>…${list.map(a => `<tr><td>${UI.esc(a.username)}</td>…`).join('')}…</table>`;
  return App.adminShell('D-10', 'Tài khoản admin', html, { actions: `<button onclick="Admin.adminForm()">Thêm</button>` });
}
```
Sau (JS chỉ còn dữ liệu):
```js
D10: function() {
  const me = this.me();
  const html = TPL.render('d-10', { me, list: Store.adminUsers() });
  return App.adminShell('D-10', 'Tài khoản admin', html, { actions: TPL.render('d-10-actions', {}) });
}
```
`screens/d-10.html`:
```html
<div class="card"><div class="card-body"><div class="table-wrap"><table class="table">
  <thead><tr><th>Tên đăng nhập</th>…</tr></thead>
  <tbody>
  {% each a in list %}
    <tr><td class="mono text-strong">{{ a.username }}{% if a.username === me.username %} <span class="badge badge-navy badge-plain">bạn</span>{% endif %}</td>
    <td>{{{ badge('role', a.role) }}}</td>
    …
  {% endeach %}
  </tbody></table></div></div></div>
```

- Bảng/drawer/modal render lại động (`renderOrders`, `orderDrawer`, `UI.modal({ body })`) cũng dùng template riêng: `el.innerHTML = TPL.render('d-03-table', {...})`, `UI.drawer({ title: TPL.render(...), body: TPL.render(...), foot: TPL.render(...) })`.
- Tính toán (filter, sort, paginate, tổng, timeline…) làm trong JS, đưa kết quả vào `data`. Template chỉ hiển thị.
- Các component design system (`UI.badge`, `UI.icon`, `UI.field`, `UI.pagination`, `UI.empty`, `UI.skeletonTable`, `UI.otp`, `UI.qrSvg`, `UI.vietqr`…) **giữ trong `js/ui.js`**, gọi từ template bằng `{{{ … }}}`.
- Giữ nguyên id/class/onclick để CSS và các hàm hiện có không đổi hành vi.

## Kiểm tra

```bash
node docs/sync-manifest.js     # đăng ký mọi file screens/**/*.html vào TPL.manifest (js/tpl.js)
node docs/check-templates.js   # biên dịch thử toàn bộ template, báo lỗi cú pháp và lệch manifest
```
