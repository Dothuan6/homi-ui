# HOMI365 / Medigo — prototype v2

Prototype dựng lại theo **Kế hoạch bổ sung & thiết kế lại UI/UX (04/09/2026)**: mô hình A-01→A-05 · C-01→C-03 · D-00→D-08 (17 màn chính + trạng thái phụ), nhận diện **HOMI365** (navy/teal · Archivo · Source Sans 3 · JetBrains Mono).

Bản cũ (thư mục gốc repo, mô hình GoCare + landing + giỏ hàng + wizard) được giữ nguyên để đối chiếu với khách.

## Chạy

```bash
python serve.py           # http://localhost:5174/index.html
```

Không cần build. Hash router, thuần HTML/CSS/JS, dữ liệu lưu `localStorage` (khoá `homi365_proto_v2`).

## Điểm vào & tài khoản demo

| Mục | Giá trị |
|---|---|
| Link giới thiệu hợp lệ | `#r/AN7K2Q` (seller Nguyễn Văn An) |
| Link không hợp lệ / seller bị khoá | `#r/XXXXXX` · `#r/EM9QZT` |
| OTP hợp lệ (mọi nơi) | `123456` |
| Seller đăng nhập (A-05) | SĐT `0908123456` |
| Người mua đã có đơn, chưa TK (A-04/A-05 kích hoạt) | SĐT `0901111222` |
| Seller bị khoá · chưa đăng ký · admin | `0977000111` · `0999999999` · `0900000000` |
| Admin (D-00) | `admin` / `Homi@2026` |

Mở `index.html` không có hash → **trang bìa prototype** (`#HOME`) liệt kê điểm vào và tài khoản mẫu cho khách. Nút **Demo** (bảng nhảy tới mọi màn/trạng thái, F9) mặc định **tắt** ở bản gửi khách; bật lại bằng `demo.navigator: true` trong `config/business-rules.js` khi review nội bộ. SĐT `0911111111` mô phỏng lỗi dịch vụ SMS.

## Cấu trúc

```
index.html            khung SPA
styleguide.html       design system: màu, chữ, nút 6 trạng thái, field, badge, OTP, VietQR, bảng, modal…
css/tokens.css        token HOMI365 + phần BỔ SUNG (tint, spacing, radius, shadow, font) — chờ duyệt
css/base.css          reset, typography, form, button
css/components.css    thành phần dùng chung
css/buyer.css         nhóm A (mobile-first, ≤520px)
css/seller.css        nhóm C (mobile-first, bottom nav / top nav ≥900px)
css/admin.css         nhóm D (desktop-first, sidebar 220px)
config/business-rules.js  CONFIG (BR-05/06/07, VietQR, kho mã…) · LABELS (badge) · RULES (hàm suy diễn)
mock/data.js          SEED (sinh tất định quanh ngày hiện tại) + Store (mọi nghiệp vụ: tạo đơn, thanh toán, cấp mã, hoa hồng đa tầng, ví, rút tiền, duyệt, khoá, chính sách phiên bản, ngoại lệ…)
js/ui.js              UI: esc, icon, logo, badge, toast, modal/confirm, drawer, OTP, countdown, QR, VietQR, bảng/phân trang/skeleton/empty, chart SVG, xuất CSV
js/app.js             router, guard phiên (C cần seller, D cần admin, seller vào D → 403), 3 khung layout, demo navigator
js/views-buyer.js     A-01 → A-05
js/views-seller.js    C-01 → C-03 + hồ sơ
js/views-admin.js     D-00 → D-08
public/image/         logo HOMI365 (+ bản trắng cho nền navy), favicon
brandingGuideline/    bản sao token & logo gốc
```

## Giả định đã chốt tạm (kế hoạch mục 6 — chờ TTS xác nhận)

1. Header/logo **HOMI365**; gói vẫn là **CN02 · Gói Bác sĩ 24/7** (không còn chữ GoCare).
2. Gói CN02 10.000.000đ, license 12 tháng, **có giao hàng** (đồng hồ HW01) → có trạng thái giao hàng.
3. **Bỏ** hạng thành viên, điểm tích luỹ, danh sách tuyến dưới trên C-01 (D-02 vẫn xem tuyến trên/dưới).
4. **D-07 gộp** duyệt hoa hồng + duyệt rút tiền, 2 tab.
5. Cổng online: nút chung + màn cổng **giả lập** (callback PAID / FAILED).
6. Hoa hồng **3 tầng** F1/F2/F3 (v2: 12% · 5% · 3%), cấu hình động tại D-06, lưu phiên bản.
7. Kích hoạt thiết bị qua app — C-02 chỉ hiển thị mã, trạng thái, thiết bị.
8. Token bổ sung (tint, spacing, radius, shadow, Source Sans 3) — xem `styleguide.html`.

## Đối chiếu nhanh với DoD

US-01→10, 24 → `views-buyer.js` · US-18→23 → `views-seller.js` · US-25→34, 36 → `views-admin.js` · US-11/13/14/15/16/17 (logic) → `Store.markPaid / issueLicense / createCommissions / wallet / ledger` trong `mock/data.js`.
