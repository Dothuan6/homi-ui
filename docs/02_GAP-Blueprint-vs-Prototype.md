# Rà soát Blueprint ↔ Prototype — chênh lệch còn lại

*Ngày rà: 08/09/2026 · Đối chiếu `docs/01_Homi365_Blueprint_Luong-nghiep-vu_Man-hinh.md` với toàn bộ mã nguồn prototype-v2.*

Tài liệu này liệt kê **những gì tài liệu mô tả mà prototype chưa làm, hoặc làm khác**, để làm đầu vào viết specs cho dev. Phần đã khớp không liệt kê (chiếm phần lớn: engine hoa hồng chênh lệch, breakaway, ngưỡng hạng, job xét hạng, ví 4 số, duyệt rút tiền 2 lớp, kho một chiều, audit đăng ký/rút tiền, phân quyền, export, phân trang…).

## A. Đã sửa trong lượt rà này

| # | Vấn đề | Mức | Đã xử lý |
|---|---|---|---|
| A1 | `captureRef` chặn mọi agent `status !== 'active'` → **link của agent chờ kích hoạt bị coi là vô hiệu**, khách vào màn "link không còn hiệu lực". Toàn bộ tính năng "bán được ngay, hoa hồng treo" là mã chết | Blocker | Cho `pending` đi qua; chỉ `locked` mới chặn |
| A2 | Màn Tài khoản admin **không có option vai Manager** → Head không cấp được người làm lớp 2; `manager` nghỉ là quy trình bế tắc | Blocker | Thêm `MANAGER` vào dropdown vai |
| A3 | `canWithdraw` không chặn agent `pending` — chặn gián tiếp qua số dư 0, thông báo sai ngữ cảnh; agent pending có khoản `RECORDED` cũ vẫn rút được | Cao | Thêm chốt chặn `isPendingAgent` với thông báo đúng |
| A4 | `releaseFrozenCommissions` **ghi đè** `cumulativeSales` → xoá lũy kế mang từ trước (Head chỉ định hạng, dữ liệu chuyển đổi), trái tinh thần "không reset lũy kế" | Cao | Đổi thành `Math.max`, chỉ cộng lên |
| A5 | `rejectRegistration` không kiểm vai — Specialist (bị cấm lớp 2) vẫn từ chối được hồ sơ | Cao | Gate theo `activateRoles`, chặn cả ở nút |
| A6 | Nút "Xác nhận thanh toán" vẫn enable với Manager, chỉ báo lỗi sau khi bấm | Trung bình | Disable + ghi lý do, dùng `canConfirmPayment()` |
| A7 | Bộ lọc trạng thái hồ sơ và badge tiêu đề drawer vẫn hiện "Chờ duyệt (0/2) · (1/2)" | Trung bình | Chuyển sang nhãn `activation` |
| A8 | Banner màn Kích hoạt thành viên còn mô tả "duyệt 2 lớp… sinh ref_code khi Đã duyệt" (sai từ 08/09) | Trung bình | Viết lại theo quy trình lớp 1 / lớp 2 |
| A9 | Bộ lọc màn Thành viên thiếu trạng thái "Chờ kích hoạt" (badge có, lọc không) | Trung bình | Thêm option |
| A10 | Xuất CSV sổ hoa hồng bỏ qua ô tìm kiếm — xuất toàn bộ | Trung bình | Tách `filteredCm()` dùng chung cho bảng và export |
| A11 | Văn bản phía người mua còn nói "duyệt 2 lớp (0/2 → 1/2)", "duyệt trong 1–2 ngày", "hồ sơ đang chờ duyệt" | Thấp | Viết lại theo luồng vào thẳng dashboard |
| A12 | Ghi click chỉ khi resolve link thành công → link hỏng/khoá không được đếm | Thấp | Tách `logClick`, ghi trước khi kiểm trạng thái |
| A13 | Dữ liệu mẫu còn hồ sơ `PENDING_1` với lượt duyệt của tài khoản `admin2` đã bị xoá | Thấp | Chuẩn hoá về `PENDING_0`; RG002 dùng để demo ràng buộc tách người |

## B. Chênh lệch còn lại — cần quyết định trước khi viết specs

| # | Tài liệu nói | Prototype đang làm | Đề xuất |
|---|---|---|---|
| B1 | A1: thanh toán có **idempotency key**, "bấm nhiều lần không trùng Order" | Idempotent ở bước **PAID** (`markPaid` thoát sớm nếu đã PAID), nhưng `createOrder` luôn tạo đơn mới — khách bấm mua 2 lần ra 2 đơn `PENDING_PAYMENT` | Dev **phải** làm idempotency key ở tạo đơn. Prototype không chặn được vì không có backend |
| B2 | F4: "Hạng dùng tính = **hạng tại thời điểm đơn**" | Engine đọc `a.rank` là hạng **hiện tại** của upline. Đơn có sẵn trường `referrerRankAtOrder` nhưng không dùng | Với đơn realtime hai cách trùng nhau, nhưng khi tính lại hoặc đối soát lịch sử sẽ lệch. Dev nên snapshot hạng của **cả chuỗi upline** vào đơn lúc PAID |
| B3 | A1.1: hết hạn → **Tạo lại QR** cho cùng đơn | Đơn hết hạn → nút "Đặt lại" đưa về form, khách nhập lại và sinh **đơn mới** | Chốt: gia hạn cùng `order_id` hay tạo đơn mới? Ảnh hưởng đối soát nội dung CK |
| B4 | C2.1: OTP "tối đa 3 lần sai", "**sai lần 4** → khoá tạm" | `maxWrong = 3` → khoá ngay ở lần sai thứ 3 | Câu hỏi mở #9 của tài liệu. Chốt con số chính xác |
| B5 | C1: "lỗi đăng nhập **không lộ SĐT tồn tại**" | Chỉ nhánh sai mật khẩu dùng thông báo chung; các nhánh khác nói rõ "số này đã mua gói", "tài khoản bị khoá", "chưa đăng ký" | Đây là yêu cầu bảo mật (sheet 4 NFR). Dev cần gộp về một thông báo chung, hoặc chốt rằng UX ưu tiên hơn |
| B6 | C1.1: quên mật khẩu qua **SĐT/email** | Chỉ có SĐT | Chốt có làm nhánh email không |
| B7 | C3: "Cần: … **danh sách F1**" (7.3.5) | Hàm `f1Table` và template có sẵn nhưng **không nơi nào gọi**; dashboard chỉ có cây tuyến 3 cấp | Bật lại bảng F1 hay bỏ khỏi specs |
| B8 | S1/A0: alias dạng `[EEEE][PPPP]` (4 chữ + 4 số) | Ghép chữ cái đầu của **mọi từ** trong họ tên → độ dài thay đổi (`NVA3456` chỉ 3 chữ) | Chốt quy tắc sinh alias chính xác, nhất là tên 2 từ và tên 5+ từ |
| B9 | F1: "Customer theo SĐT tồn tại → dùng Customer cũ" + gán tuyến | `markPaid` chỉ set `referrerId` khi **tạo mới** user; khách mua lần 2 qua link người khác không cập nhật tuyến | Chốt: tuyến trên gắn **một lần vĩnh viễn** hay theo đơn gần nhất. Ảnh hưởng trực tiếp hoa hồng |
| B10 | F5: job "0h ngày cuối tháng" + "**chốt hoa hồng tháng**" trước khi xét hạng | Chỉ có nút bấm tay của Head; không có bước chốt kỳ, không có `closedAt` trên hoa hồng | Dev cần scheduler + khái niệm kỳ hoa hồng. Prototype không mô phỏng được |
| B11 | Sheet 5 G: **1 VNĐ = 10 điểm** | Code dùng 1 điểm = 1 VNĐ theo quyết định 04/09 | Câu hỏi mở #1, vẫn chưa đóng. Cần chốt trước khi dev làm Point Ledger |
| B12 | D5.1: chi tiết thiết bị có **thêm/sửa** | Drawer chỉ đọc; có sinh hàng loạt và nhập file, không sửa từng bản ghi | Chốt có cần sửa serial/SKU lẻ không |
| B13 | D3.1: chi tiết hồ sơ hiển thị **số hoa hồng đang tạm giữ** | Chỉ hiện trong hộp xác nhận kích hoạt | Nên đưa lên drawer để Manager thấy trước khi quyết |
| B14 | D7: tỷ lệ điểm thuộc màn Quản lý sản phẩm, **lưu phiên bản** | Tỷ lệ điểm nằm ở màn Hạng & quy tắc và để readonly | Chốt vị trí và có versioning không |
| B15 | Mục 11 #8: audit **mọi** chuyển trạng thái, ghi ai/vai/thời điểm | Đơn hàng và mã kích hoạt **không ghi audit** — chỉ lưu `reconciledBy`/`activatedBy` là username, không có vai | Dev cần thêm audit cho vòng đời đơn và mã. Đây là yêu cầu truy vết của NFR |
| B16 | Mục 2: ma trận quyền có vai **Specialist** | Không còn tài khoản demo Specialist (chỉ `head`, `manager`) | Hàng "Specialist" trong ma trận không kiểm thử được trên bản demo. Tạo tài khoản ở màn Tài khoản admin khi cần test |

## C. Ngoài phạm vi prototype

Các mục sau tài liệu có nêu nhưng bản mô phỏng không thể hiện được, dev cần tự thiết kế: idempotency key thật, webhook/callback cổng thanh toán và đối soát tự động, scheduler job cuối tháng, gửi email/SMS thật, mã hóa dữ liệu tài chính, 2FA admin, hiệu năng < 2–3 s với vài trăm tuyến dưới / 1.000+ thiết bị, và toàn bộ cột SLA trong bảng lỗi kỹ thuật (phản hồi ≤ 30 phút · xử lý tạm ≤ 4 giờ · khắc phục ≤ 12/24 giờ).

## D. Câu hỏi mở của tài liệu chưa đóng

Từ mục 6 của blueprint: **#1** tỷ lệ điểm · **#2** điểm hay số gói dùng xét hạng · **#8** domain · **#9** OTP lần 4 · **#10** nội dung T&C và cho nộp lại · **#12** mốc "tháng" của rút tiền vs chi trả · **#13** các dòng requirement đã xoá · **#14** đơn bị từ chối đối soát nhưng agent đã đăng ký · **#15** quy trình xử lý chuyển khoản sai số tiền.
