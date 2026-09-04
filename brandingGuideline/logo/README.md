# HOMI365 — bộ logo & favicon

Vẽ lại dạng vector từ ảnh dựng phòng khám (04.09.2026). **Không phải bản crop từ ảnh** — xem phần "Trạng thái" bên dưới.

## File

| File | Dùng cho |
|---|---|
| `homi365-mark.svg` | Biểu tượng đơn (nhà + tim). App icon, watermark, con dấu. |
| `homi365-logo-horizontal.svg` | Logo ngang đầy đủ. Header web, tài liệu, chữ ký email. |
| `favicon.svg` | Favicon nền navy bo góc — **khuyến nghị dùng**. Đọc rõ ở 16px. |
| `favicon-transparent.svg` | Favicon nền trong suốt, giữ nguyên hình nhà. Dùng khi cần đặt trên nền sáng. |

## Trạng thái — cần làm trước khi dùng chính thức

1. **Chữ "HOMI365" trong file ngang đang là `<text>`, chưa outline.** Trên máy không cài font Archivo, chữ sẽ đổ về Arial Black và lệch so với bản gốc. Mở file trong Figma/Illustrator → chọn text → *Outline stroke / Convert to outlines* → lưu đè. Sau bước này logo hiển thị giống nhau trên mọi máy.

2. **Font gốc trong ảnh chưa xác định.** Ảnh render dùng một face grotesk đậm, hơi hẹp. `Archivo Bold` là ước lượng gần nhất. Nếu công ty đã có font chính thức, thay lại rồi outline.

3. **Kiểm tra tỷ lệ hình nhà.** Tôi vẽ lại theo quan sát: mái dốc ~42°, thân nhà bo góc nhẹ, tim đặt lệch lên trên tâm. Đối chiếu với file logo gốc (AI/EPS) nếu có và chỉnh lại path.

## Màu

| Thành phần | Token | HEX |
|---|---|---|
| Viền nhà, chữ "HOMI" | `--navy-600` | `#1E3A66` |
| Trái tim, chữ "365" | `--teal-500` | `#1BA3BE` |
| Tim trên nền navy (favicon) | `--teal-300` | `#4FB8CE` |

Chi tiết đầy đủ: `../tokens.css` và `../homi365-palette.html`.

## Nhúng favicon

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#1E3A66">
```

## Xuất PNG / ICO

Chưa xuất được vì môi trường xử lý ảnh không chạy trong phiên này. Chạy lệnh sau khi có ImageMagick + rsvg:

```bash
# PNG các kích thước
for s in 16 32 48 180 192 512; do
  rsvg-convert -w $s -h $s favicon.svg -o favicon-$s.png
done

# ICO đa kích thước
magick favicon-16.png favicon-32.png favicon-48.png favicon.ico

# Apple touch icon
cp favicon-180.png apple-touch-icon.png
```

Hoặc kéo `favicon.svg` vào realfavicongenerator.net.

## Quy tắc dùng

- **Khoảng thở:** chừa lề trống quanh logo tối thiểu bằng chiều cao mái nhà.
- **Kích thước nhỏ nhất:** logo ngang 120px chiều rộng; biểu tượng đơn 24px.
- **Không** đổi màu, kéo méo tỷ lệ, thêm đổ bóng, hay đặt logo lên ảnh nền rối.
- Trên nền tối: dùng bản một màu trắng (chưa có — báo nếu cần tôi tạo thêm).
