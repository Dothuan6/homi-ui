# HOMI365 / Medigo — prototype v2 (spec v3)

Prototype giao diện theo **CHANGE SPEC v3** (`docs/CHANGE-SPEC-v3.md`, 05/09/2026): mô hình **thành viên (agent) 6 hạng** Copper → Lithium, **hoa hồng chênh lệch cấp bậc** ghi nhận ngay khi đơn thanh toán, **đăng ký thành viên + rút tiền duyệt 2 lớp**, admin 2 vai (Head / Specialist). Nhận diện HOMI365 (navy/teal · Archivo · Source Sans 3 · JetBrains Mono).

Bản v1 (thư mục gốc repo, mô hình GoCare) và kế hoạch redesign 04/09 được giữ để đối chiếu.

## Chạy

**Khi phát triển** — sửa file là refresh thấy ngay, không cần build:

```bash
python serve.py           # http://localhost:5174/index.html
```

**Khi gửi cho người khác xem** — chạy một lần rồi double-click `index.html`, không cần cài gì:

```bash
python build.py           # gom screens/*.html → js/templates.js
```

Lý do: markup các màn hình nằm trong `screens/*.html`, nạp bằng `fetch` khi khởi động — mà `fetch` bị trình duyệt chặn trên `file://`. `build.py` gom sẵn markup vào `js/templates.js`; TPL dùng bundle khi mở bằng `file://` và vẫn ưu tiên `fetch` khi chạy qua http, nên **không phải build lại mỗi lần sửa** — chỉ chạy trước khi bàn giao. Nhớ chạy lại nếu vừa sửa `screens/`.

**Bản nhiều trang — mỗi màn một file `.html`:**

```bash
node docs/export-static.js    # → site/index.html
```

Mỗi trang có hai lớp. Lớp dưới là markup dựng sẵn (HTML thuần, không còn `{{ }}` — xem được cả khi tắt JS, điều hướng bằng thẻ `<a>` và bảng **Màn hình** góc phải). Lớp trên là bộ script prototype: có JS thì App render đè lên và **mọi thứ chạy như `index.html`** — OTP, đếm ngược giữ đơn, polling đối soát, drawer, modal, duyệt 2 lớp, job xét hạng, dữ liệu ghi `localStorage`.

Trang cần đăng nhập tự dựng phiên demo trước khi App khởi động, nên mở thẳng `site/agents.html` là vào được ngay. Xuất lại sau mỗi lần sửa markup, JS hoặc dữ liệu mẫu.

Hash router, thuần HTML/CSS/JS, dữ liệu lưu `localStorage` (khoá `homi365_proto_v3`) — hoạt động cả trên `file://`. Mở không có hash → trang bìa `#HOME` liệt kê điểm vào và tài khoản mẫu. Thư viện QR tải từ CDN; nếu mở offline thì `UI.qrSvg` tự rơi về hoạ tiết mô phỏng.

## Tài khoản & điểm vào demo

| Mục | Giá trị |
|---|---|
| Link giới thiệu (ref_code) · link mua hàng cá nhân (alias) | `#r/AN7K2Q` · `#p/NVA3456` (Nguyễn Văn An, Lithium) |
| Link không hợp lệ / thành viên bị khoá | `#r/XXXXXX` · `#r/EM9QZT` |
| OTP hợp lệ (mọi nơi) | `123456` |
| Thành viên đăng nhập (`#login`) | `0908123456` / `Homi@123` (Lithium) · `0912345678` Gold · `0933222111` Silver · `0987654321` Copper |
| Người mua đã mua, chưa đăng ký | `0901111222` (qua Lithium → đăng ký được) · `0902222333` (qua Copper → bị chặn) |
| Hồ sơ đăng ký mẫu | `0913000888` chờ duyệt 1/2 · `0914000999` bị từ chối |
| Admin (`#admin-login`) | `head` (Trưởng bộ phận — lớp 1: xác nhận thanh toán) · `manager` (Ms Trinh — lớp 2: kích hoạt Agent) / `Homi@2026` |
| SĐT mô phỏng lỗi SMS · SĐT admin bị từ chối ở `#login` | `0911111111` · `0900000000` |

## Luồng chính (spec mục 5)

1. **Mua**: `#p/NVA3456` → `#buy` (họ tên · SĐT · email · địa chỉ) → OTP → `#payment` (cổng / VietQR, giữ đơn 15') → `#order-result`. Người giới thiệu ≥ Silver → "Đăng ký thành viên / Thoát ra"; Copper → chỉ "Đơn hàng thành công". Hoa hồng ghi nhận ngay (`#orders` chi tiết đơn: phân bổ Σ = 3.850.000đ).
2. **Đăng ký**: `#order-result` → `#register` (autofill từ đơn) → T&C → OTP → **vào thẳng `#dashboard`**. Tài khoản ở trạng thái *Chờ kích hoạt*: có link bán hàng, nhưng điểm = 0 và hoa hồng bị tạm giữ.
3. **Kích hoạt — 2 người, 2 màn**: `head` bấm **Xác nhận thanh toán & cấp mã** ở `#orders` khi thấy tiền về bank (chọn mã kích hoạt, gửi email cho khách) → `manager` bấm **Kích hoạt Agent** ở `#registrations` → agent active, hoa hồng tạm giữ vào ví, email mock. Nút lớp 2 khoá tới khi đơn PAID, **và khoá với chính người đã làm lớp 1**.
4. **Đăng nhập**: SĐT + mật khẩu → `#dashboard` (hạng, điểm, còn thiếu, 2 link, thống kê, hoa hồng 4 thẻ, bảng kê, F1). Quên mật khẩu → OTP → đặt lại.
5. **Rút tiền**: `#wallet` → số tiền ≤ khả dụng → xác nhận TK → Chờ duyệt (0/2), giữ tiền; lần 2 trong tháng bị chặn. `#withdrawals`: 2 admin (hoặc head) → Đã duyệt → Đánh dấu đã chi trả. Từ chối → hoàn tiền + lý do.
6. **Cuối tháng**: `#admin-dashboard` (head) "Chạy xét hạng" → giáng 1 bậc nếu 0 đơn trong tháng, thăng thẳng theo luỹ kế; lịch sử tại `#profile` & `#agents`.
7. **Kho**: `#inventory` 1.200 mã HW01 + serial, 3 trạng thái Sẵn hàng → Đã gắn đơn → Đã kích hoạt, drawer "Mô phỏng kích hoạt từ app".
8. **Phân quyền**: `admin` mở `#admin-users` → 403; `head` quản lý tài khoản admin.

Bảng đối chiếu mã spec (A-01, D-02…) ↔ route mới ↔ file: `screens/INDEX.md`.

## Cấu trúc

```
config/business-rules.js  CONFIG (ranks, rankRules, withdraw, approval, admin.accounts, tc, rules…) · LABELS · RULES (alias, hạng, kiểm tra bảng HH)
mock/data.js              SEED (cây Case 5 + breakaway + nhánh gốc Gold, 1.200 mã, đăng ký/rút tiền 5 trạng thái) + Store (engine hoa hồng, ví, duyệt 2 lớp, job xét hạng, admin vai, audit)
js/ui.js                  thành phần dùng chung (badge, modal, drawer, OTP, countdown, QR, VietQR, bảng, chart, CSV)
js/tpl.js                 engine template ({{ }}, {% if %}, {% each %}, {% block %}, include) + manifest danh sách screens/ nạp khi khởi động
js/app.js                 router (#r/ #p/), guard phiên & vai trò (D-10 Head), 3 khung layout, trang bìa — chỉ logic
js/views-buyer.js         A-01 → A-06 — logic + view-model, gọi TPL.render
js/views-seller.js        C-01 → C-03 + hồ sơ — logic + view-model
js/views-admin.js         D-00 → D-10 — logic + view-model
screens/                  MARKUP các màn hình — 23 file cho 25 route, xem screens/INDEX.md
  buyer/                  buy · payment · order-result · order-lookup · login · register (6 file)
  seller/                 dashboard · my-package · wallet · profile (4)
  admin/                  login · dashboard · agents · orders · products · inventory · ranks ·
                          withdrawals · exceptions · registrations · users (11)
  common/                 common.html (home, policy, 403, demo-nav, 3 shell) · partials.html (22 khối dùng chung)
css/                      tokens · base · components · buyer · seller · admin
styleguide.html           design system
docs/CHANGE-SPEC-v3.md    spec gốc
docs/TEMPLATE-GUIDE.md    cú pháp template & quy ước tách markup/logic
docs/check-templates.js   node docs/check-templates.js — biên dịch thử toàn bộ screens/ và đối chiếu manifest
docs/sync-manifest.js     node docs/sync-manifest.js — cập nhật TPL.manifest theo file thực tế trong screens/
docs/reorganize.py        python docs/reorganize.py — sắp xếp screens/ theo vai + cập nhật manifest (chạy một lần)
docs/merge-screens.py     python docs/merge-screens.py — gộp các mảnh của cùng màn hình vào một file (chạy một lần)
docs/rename-screens.py    python docs/rename-screens.py — đổi mã a-01/D-02 sang tên tiếng Anh (chạy một lần)
docs/export-static.js     node docs/export-static.js — xuất site/ HTML thuần, mỗi màn một file (ảnh chụp tĩnh)
screens/INDEX.md          bảng tra 25 route ↔ file markup ↔ quy ước hậu tố -table/-drawer/-modal
build.py                  python build.py — gom screens/ → js/templates.js (chạy được bằng file://)
serve.py                  python serve.py — dev server no-cache, cổng 5174
```

Mỗi màn hình gói trong **một file**; các mảnh con (bảng, drawer, modal, trạng thái) nằm cùng file dưới dạng `{% block tên %} … {% endblock %}`, được `TPL.put()` tách lại thành template riêng lúc nạp. Thêm mảnh con → thêm một khối vào file đó, không tạo file mới. Chi tiết và bảng tra: `screens/INDEX.md`.

Trong `js/views-*.js` gọi template bằng **tên ngắn** — `TPL.render('a-01')` ra `screens/buyer/a-01.html`, `TPL.render('d-02-table')` ra khối cùng tên trong `admin/d-02.html`. Nhờ vậy đổi chỗ hay gộp file không phải sửa JS.

Sau khi sửa markup: `node docs/check-templates.js` (biên dịch thử + soát mọi lời gọi), `python build.py` trước khi bàn giao.

## Điểm chờ xác nhận (spec mục 9 — đặt trong CONFIG)

Ngưỡng hạng 10/18/24/28/30 · giáng có reset luỹ kế (mặc định không) · tỷ lệ điểm 1:1 · từ chối được nộp lại (mặc định có) · OTP khi mua giữ, khi rút bỏ · 1 gói/SĐT + ngoại lệ (mặc định tắt) · nội dung T&C · khách qua link Copper được đăng ký sau khi Copper lên Silver (mặc định có).
