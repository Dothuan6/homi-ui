# screens/ — bảng tra màn hình

**23 file cho 25 route.** Mỗi màn hình gói gọn trong một file; các mảnh con (bảng, drawer, modal,
trạng thái) nằm cùng file dưới dạng khối `{% block %}`.

```
screens/
  buyer/    buy · payment · order-result · order-lookup · login · register      (6 file)
  seller/   dashboard · my-package · wallet · profile                            (4)
  admin/    login · dashboard · agents · orders · products · inventory · ranks
            withdrawals · exceptions · registrations · users                     (11)
  common/   common.html · partials.html                                          (2)
```

Mã cũ theo `docs/CHANGE-SPEC-v3.md` (A-01, D-02…) ghi ở cột cuối mỗi bảng để tra ngược về spec.

## Ba lớp tên, đừng nhầm

| Lớp | Ví dụ | Dùng ở đâu |
|---|---|---|
| **Route** (URL) | `#payment`, `#agents`, `#admin-dashboard` | `App.routes`, mọi `href="#…"`, `App.navigate()` |
| **Template** | `buyer/payment`, `admin/agents-table` | `TPL.render()`, `include()`, `{% block %}` |
| **Hàm view** | `Buyer.A02`, `Admin.D02` | vẫn giữ mã cũ — `Admin.login` đã có nên chưa đổi được |

Route của nhóm admin có tiền tố `admin-` khi tên trùng với thành viên (`#dashboard` là của thành
viên, `#admin-dashboard` là của quản trị). Template thì không cần vì đã có thư mục phân biệt.

## Cách một file chứa nhiều template

```html
<!-- screens/admin/agents.html -->
<div class="card">…markup chính của màn Thành viên…</div>

{% block admin/agents-table %}
  <tbody>…</tbody>
{% endblock %}

{% block admin/agents-drawer %}
  …ngăn kéo chi tiết…
{% endblock %}
```

`TPL.put()` tách từng khối thành một template riêng lúc nạp. Phần ngoài mọi khối là template chính,
mang tên file. Khối không lồng nhau được, tên khối phải duy nhất trong toàn `screens/`.

## Khung người mua — `screens/buyer/`

| Route | Màn hình | File · khối bên trong | Mã cũ |
|---|---|---|---|
| `#buy` | Trang mua hàng `/r/{mã}` | `buy.html` + `buy-state` (link hỏng · thành viên khoá · gói ngừng bán) | A-01 |
| `#payment` | Thanh toán, giữ đơn 15 phút | `payment.html` + `-choose` `-gateway` `-bank` `-expired` | A-02 |
| `#order-result` | Kết quả thanh toán | `order-result.html` — **không có phần chính**, 8 khối: `-paid` `-nocode` `-later` `-failed` `-awaiting` `-rejected` `-reg-prompt` `-reg-prompt-foot` | A-03 |
| `#order-lookup` | Tra cứu đơn hàng | `order-lookup.html` + `-result` `-card` | A-04 |
| `#login` | Đăng nhập · quên mật khẩu | `login.html` + `login-reset` | A-05 |
| `#register` | Đăng ký thành viên | `register.html` + `-check` `-blocked` `-status` `-form` `-done` | A-06 |

`Buyer.A03()` chọn khối theo `order.status`, nên `#order-result` không có markup chính.
Điểm vào `#r/{ref_code}` · `#p/{alias}` không phải màn hình — bắt mã rồi chuyển sang `#buy`.

## Khung thành viên — `screens/seller/` · cần đăng nhập agent

| Route | Màn hình | File · khối bên trong | Mã cũ |
|---|---|---|---|
| `#dashboard` | Tổng quan | `dashboard.html` + `-stats` `-stats-body` `-cmchart` `-commissions` `-commissions-table` `-tree` | C-01 |
| `#my-package` | Gói của tôi & mã kích hoạt | `my-package.html` | C-02 |
| `#wallet` | Ví & rút tiền | `wallet.html` + `-withdraw` `-requests` `-ledger` | C-03 |
| `#profile` | Hồ sơ & lịch sử xét hạng | `profile.html` | C-PROFILE |

## Khung quản trị — `screens/admin/` · cần đăng nhập admin

| Route | Màn hình | File · khối bên trong | Mã cũ |
|---|---|---|---|
| `#admin-login` | Đăng nhập quản trị | `login.html` + `login-alert` | D-00 |
| `#admin-dashboard` | Tổng quan · job xét hạng | `dashboard.html` + `dashboard-job-result` | D-01 |
| `#agents` | Thành viên | `agents.html` + `-table` `-drawer` `-modal-referrer` `-modal-rank` `-modal-root` | D-02 |
| `#orders` | Đơn hàng & đối soát | `orders.html` + `-table` `-drawer` `-allocation` | D-03 |
| `#products` | Sản phẩm & bảng hoa hồng | `products.html` + `-commission-table` `-modal-table` `-modal-package` | D-04 |
| `#inventory` | Kho mã & thiết bị | `inventory.html` + `-table` `-drawer` `-modal-generate` `-modal-import` | D-05 |
| `#ranks` | Hạng & quy tắc chương trình | `ranks.html` | D-06 |
| `#withdrawals` | Rút tiền & sổ hoa hồng | `withdrawals.html` + `-list` `-ledger` `-drawer` | D-07 |
| `#exceptions` | Cấp phát ngoại lệ | `exceptions.html` — ẩn khi `CONFIG.rules.onePackagePerPhone = false` | D-08 |
| `#registrations` | Duyệt đăng ký thành viên | `registrations.html` + `-table` `-drawer` | D-09 |
| `#admin-users` | Tài khoản admin | `users.html` + `users-form` — **chỉ Head Admin** | D-10 |

Route cần đăng nhập được liệt kê trong `App.sellerRoutes` và `App.adminRoutes` (js/app.js).

## Dùng chung — `screens/common/`

**`common.html`** — 7 khối: `common/home` (trang bìa prototype) · `common/policy` · `common/403` ·
`common/demo-nav` (bảng nhảy nhanh, phím **F9**) · `common/shell-buyer` · `common/shell-seller` ·
`common/shell-admin` (3 khung layout, mọi màn đều bọc trong một trong ba).

**`partials.html`** — 22 khối dùng chung, giữ nguyên tiền tố `partials/`:
`pkg-header` `product-intro` `intro-panel` `alert` `card-head` `order-info` `reg-cta` `otp-frame`
`btn-reload` · `admin-actions` `admin-approval-cell` `admin-audit-list` `admin-period-seg`
`admin-timeline` `admin-tree` · `seller-approval-timeline` `seller-f1-table` `seller-period-seg`
`seller-rank-ladder` `seller-tree` `seller-tree-node` `seller-wd-steps`.

`partials/admin-tree` và `partials/seller-tree-node` gọi lại chính nó để vẽ cây nhiều tầng.

## Quy ước hậu tố khối

| Hậu tố | Nghĩa |
|---|---|
| `-table` | thân bảng — lọc/phân trang render lại riêng bảng, không dựng lại cả trang |
| `-drawer` | ngăn kéo chi tiết bên phải, mở theo yêu cầu |
| `-modal-*` | hộp thoại qua `UI.modal`; template trả về `title`/`body`/`foot` theo biến `part` |
| còn lại | trạng thái của cùng một route (`payment-expired`, `register-blocked`…) |

## Khi thêm màn hình mới

1. Màn hình mới → tạo file trong thư mục đúng vai, thêm route trong `App.routes`, và thêm vào
   `App.sellerRoutes` / `App.adminRoutes` nếu route đó cần đăng nhập.
2. Mảnh con của màn đã có → thêm `{% block <thư mục>/<tên> %}` vào chính file đó, không tạo file mới.
3. `node docs/sync-manifest.js` nếu vừa thêm file.
4. `node docs/check-templates.js` — biên dịch thử và soát mọi lời gọi.
5. `python build.py` trước khi bàn giao.
