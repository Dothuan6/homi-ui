# HOMI365 / Medigo — prototype v2 (spec v3)

Prototype giao diện theo **CHANGE SPEC v3** (`docs/CHANGE-SPEC-v3.md`, 05/09/2026): mô hình **thành viên (agent) 6 hạng** Copper → Lithium, **hoa hồng chênh lệch cấp bậc** ghi nhận ngay khi đơn thanh toán, **đăng ký thành viên + rút tiền duyệt 2 lớp**, admin 2 vai (Head / Specialist). Nhận diện HOMI365 (navy/teal · Archivo · Source Sans 3 · JetBrains Mono).

Bản v1 (thư mục gốc repo, mô hình GoCare) và kế hoạch redesign 04/09 được giữ để đối chiếu.

## Chạy

```bash
python serve.py           # http://localhost:5174/index.html
```

Không cần build. Hash router, thuần HTML/CSS/JS, dữ liệu lưu `localStorage` (khoá `homi365_proto_v3`). Mở không có hash → trang bìa `#HOME` liệt kê điểm vào và tài khoản mẫu.

**Phải chạy qua máy chủ web** (serve.py, Netlify…): giao diện các màn hình nằm trong `screens/*.html` và được nạp bằng `fetch` khi khởi động, nên mở trực tiếp `index.html` từ ổ đĩa (file://) sẽ không chạy.

## Tài khoản & điểm vào demo

| Mục | Giá trị |
|---|---|
| Link giới thiệu (ref_code) · link mua hàng cá nhân (alias) | `#r/AN7K2Q` · `#p/NVA3456` (Nguyễn Văn An, Lithium) |
| Link không hợp lệ / thành viên bị khoá | `#r/XXXXXX` · `#r/EM9QZT` |
| OTP hợp lệ (mọi nơi) | `123456` |
| Thành viên đăng nhập (A-05) | `0908123456` / `Homi@123` (Lithium) · `0912345678` Gold · `0933222111` Silver · `0987654321` Copper |
| Người mua đã mua, chưa đăng ký | `0901111222` (qua Lithium → đăng ký được) · `0902222333` (qua Copper → bị chặn) |
| Hồ sơ đăng ký mẫu | `0913000888` chờ duyệt 1/2 · `0914000999` bị từ chối |
| Admin (D-00) | `head` (Head Admin) · `admin` · `admin2` (Specialist) / `Homi@2026` |
| SĐT mô phỏng lỗi SMS · SĐT admin bị từ chối ở A-05 | `0911111111` · `0900000000` |

## Luồng chính (spec mục 5)

1. **Mua**: `#p/NVA3456` → A-01 (họ tên · SĐT · email · địa chỉ) → OTP → A-02 (cổng / VietQR, giữ đơn 15') → A-03. Người giới thiệu ≥ Silver → "Đăng ký thành viên / Thoát ra"; Copper → chỉ "Đơn hàng thành công". Hoa hồng ghi nhận ngay (D-03 chi tiết đơn: phân bổ Σ = 3.850.000đ).
2. **Đăng ký**: A-03 → A-06 (autofill từ đơn) → T&C → OTP → Chờ duyệt (0/2). Hoặc A-05 → thông báo → A-06.
3. **Duyệt**: `admin` D-09 xác nhận → 1/2 → `admin2` xác nhận → Đã duyệt → kích hoạt Copper + email mock. `head` xác nhận 1 lần là đủ.
4. **Đăng nhập**: SĐT + mật khẩu → C-01 (hạng, điểm, còn thiếu, 2 link, thống kê, hoa hồng 4 thẻ, bảng kê, F1). Quên mật khẩu → OTP → đặt lại.
5. **Rút tiền**: C-03 → số tiền ≤ khả dụng → xác nhận TK → Chờ duyệt (0/2), giữ tiền; lần 2 trong tháng bị chặn. D-07: 2 admin (hoặc head) → Đã duyệt → Đánh dấu đã chi trả. Từ chối → hoàn tiền + lý do.
6. **Cuối tháng**: D-01 (head) "Chạy xét hạng" → giáng 1 bậc nếu 0 đơn trong tháng, thăng thẳng theo luỹ kế; lịch sử tại C-PROFILE & D-02.
7. **Kho**: D-05 1.200 mã HW01 + serial, 3 trạng thái Sẵn hàng → Đã gắn đơn → Đã kích hoạt, drawer "Mô phỏng kích hoạt từ app".
8. **Phân quyền**: `admin` mở `#D-10` → 403; `head` quản lý tài khoản admin.

## Cấu trúc

```
config/business-rules.js  CONFIG (ranks, rankRules, withdraw, approval, admin.accounts, tc, rules…) · LABELS · RULES (alias, hạng, kiểm tra bảng HH)
mock/data.js              SEED (cây Case 5 + breakaway + nhánh gốc Gold, 1.200 mã, đăng ký/rút tiền 5 trạng thái) + Store (engine hoa hồng, ví, duyệt 2 lớp, job xét hạng, admin vai, audit)
js/ui.js                  thành phần dùng chung (badge, modal, drawer, OTP, countdown, QR, VietQR, bảng, chart, CSV)
js/tpl.js                 engine template ({{ }}, {% if %}, {% each %}, include) + manifest danh sách screens/ nạp khi khởi động
js/app.js                 router (#r/ #p/), guard phiên & vai trò (D-10 Head), 3 khung layout, trang bìa — chỉ logic
js/views-buyer.js         A-01 → A-06 — logic + view-model, gọi TPL.render
js/views-seller.js        C-01 → C-03 + hồ sơ — logic + view-model
js/views-admin.js         D-00 → D-10 — logic + view-model
screens/                  MARKUP các màn hình (HTML): shell-*.html (3 khung), home, policy, 403, a-*.html, c-*.html, d-*.html,
                          partials/ (khối dùng chung: pkg-header, product-intro, alert, admin-timeline, seller-tree…)
css/                      tokens · base · components · buyer · seller · admin
styleguide.html           design system
docs/CHANGE-SPEC-v3.md    spec gốc
docs/TEMPLATE-GUIDE.md    cú pháp template & quy ước tách markup/logic
docs/check-templates.js   node docs/check-templates.js — biên dịch thử toàn bộ screens/ và đối chiếu manifest
docs/sync-manifest.js     node docs/sync-manifest.js — cập nhật TPL.manifest theo file thực tế trong screens/
```

Thêm/sửa màn hình: sửa file trong `screens/` (markup) và hàm tương ứng trong `js/views-*.js` (dữ liệu). Tạo file mới → chạy `node docs/sync-manifest.js` để đăng ký vào manifest.

## Điểm chờ xác nhận (spec mục 9 — đặt trong CONFIG)

Ngưỡng hạng 10/18/24/28/30 · giáng có reset luỹ kế (mặc định không) · tỷ lệ điểm 1:1 · từ chối được nộp lại (mặc định có) · OTP khi mua giữ, khi rút bỏ · 1 gói/SĐT + ngoại lệ (mặc định tắt) · nội dung T&C · khách qua link Copper được đăng ký sau khi Copper lên Silver (mặc định có).
