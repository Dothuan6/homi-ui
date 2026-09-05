# CHANGE SPEC v3 — Đưa prototype-v2 về đúng requirement Homi365 (04/09/2026 + quyết định 05/09)

> Tài liệu này dành cho Claude Code. Đọc hết mục 0–3 trước khi sửa bất kỳ file nào.
> Nguồn chuẩn: sheet **Homi365_CNTT – Requirement_092026** (48 mã YC) + **Logic hoa hồng** (mục A–H) + 2 quyết định 05/09:
> (1) landing / Order / thanh toán nằm trong Homi365; (2) Quản lý sản phẩm **có UI**.
> Khi tài liệu này mâu thuẫn với `README.md` hoặc comment cũ trong code ("kế hoạch redesign mục 6", BR-xx, US-xx) → **tài liệu này thắng**.

---

## 0. Kết quả rà soát prototype hiện tại

### 0.1 Khác biệt mô hình (gốc rễ)

| Chủ đề | Prototype v2 hiện tại | Requirement 04/09 | Hành động |
|---|---|---|---|
| Vai người bán | `seller`, tạo tài khoản **tức thì** từ đơn (1 click) | `agent`/thành viên: form đăng ký (TK ngân hàng, T&C, OTP) → **Chờ duyệt 0/2 → 1/2 → Đã duyệt** | Thêm màn đăng ký + máy trạng thái duyệt |
| Hoa hồng | % theo tầng F1/F2/F3 (12 · 5 · 3 %), admin **duyệt lô** rồi mới vào ví | **Chênh lệch cấp bậc** 6 hạng (VNĐ/gói), ghi nhận **ngay** khi đơn PAID, không duyệt hoa hồng | Viết lại engine; bỏ tab duyệt hoa hồng |
| Hạng / điểm | Không có | 6 hạng Copper→Lithium, ngưỡng lũy kế, giáng 1 bậc/tháng, điểm = hoa hồng (1 điểm = 1 VNĐ) | Thêm rank engine + job cuối tháng |
| Đăng nhập agent | SĐT + OTP, không mật khẩu | SĐT + **mật khẩu**; quên MK qua OTP | Sửa A-05 |
| Quyền tuyển | Ai cũng mời "Tạo tài khoản seller" | Chỉ người giới thiệu **≥ Silver** mới được tuyển; Copper chỉ bán | Điều kiện ở A-03 & màn đăng ký |
| Link giới thiệu | 1 refCode ngẫu nhiên 6 ký tự | ref_code + **link mua hàng cá nhân** `[EEEE][PPPP]` (chữ đầu tên + 4 số cuối SĐT, hậu tố -2/-3 khi trùng) | Thêm alias |
| Rút tiền | Ngưỡng tối thiểu + holding + OTP + CCCD; duyệt 1 cấp | **1 lần/tháng**, duyệt **2 lớp**, chi trả tay đầu tháng sau | Sửa C-03, D-07 |
| Admin | 1 tài khoản, 1 vai | **Admin Specialist** & **Head Admin**; Head quản lý tài khoản admin | Thêm role + màn D-10 |
| Sản phẩm | D-04 CRUD gói, D-06 chính sách % | D-04 gói (tên/giá/ảnh/bật tắt) + **bảng hoa hồng 6 hạng theo sản phẩm** | Gộp/sửa D-04, D-06 |
| Kho mã | `IN_STOCK → ISSUED → BOUND` | `in_stock → assigned → activated`; có **mã sản phẩm thiết bị** + cột agent | Đổi nhãn, thêm cột |
| 1 gói / 1 SĐT (BR-03) + Cấp ngoại lệ (D-08) | Có | Không có trong requirement | Giữ dạng **cấu hình tắt mặc định** (`CONFIG.rules.onePackagePerPhone=false`), D-08 ẩn khi tắt |
| Đối soát chuyển khoản (D-03), tra cứu đơn (A-04), hoàn tiền | Có | Không có nhưng cần cho QR/VietQR | **Giữ** (tiện ích vận hành) |
| Đổi người giới thiệu (D-02) | Có | Xung đột nguyên tắc "gán tuyến 100% chính xác, khóa tại thời điểm mua" | Giữ nhưng **chỉ Head Admin**, bắt buộc lý do, ghi audit; hiển thị cảnh báo |
| Thuật ngữ | seller, aff_id, "Medigo" trong admin | agent / thành viên, ref_code, HOMI365 | Đổi toàn bộ nhãn UI (giữ tên biến nội bộ nếu muốn) |

### 0.2 Kết luận từng màn hình

| Route hiện tại | Trạng thái | Việc phải làm (chi tiết ở mục 4) |
|---|---|---|
| `#r/{mã}` resolver | Sửa | Nhận thêm alias `#p/{EEEEPPPP}`; agent bị khóa → lỗi "link ngừng hoạt động" (đã có) |
| A-01 Landing + form | Sửa | Thêm **email** (LP-2); hiển thị hạng người giới thiệu (ẩn nếu Copper? — không, chỉ dùng nội bộ); giữ OTP xác thực SĐT (ngoài yêu cầu, có lợi) |
| A-02 Thanh toán | Giữ | Đúng quyết định 05/09 (QR trong Homi365, 15', idempotency). Đổi chữ "webhook GoCare" → "callback cổng thanh toán" |
| A-03 Kết quả | Sửa | Nút "Đăng ký thành viên" **chỉ khi người giới thiệu ≥ Silver**; Copper → chỉ báo đơn thành công; nút dẫn sang **A-06** (không tạo tức thì) |
| A-04 Tra cứu đơn | Giữ | Bỏ khối "Kích hoạt tài khoản seller" tức thì → nút "Đăng ký thành viên" sang A-06 |
| A-05 Đăng nhập | Sửa | SĐT + mật khẩu; "Quên mật khẩu" (OTP → đặt lại); trạng thái: chưa đăng ký → A-06; chờ duyệt x/2; bị khóa |
| **A-06 Đăng ký thành viên** | **Thêm** | Form + T&C + OTP → Chờ duyệt (0/2) |
| C-01 Tổng quan | Sửa | Thẻ hạng/điểm/còn thiếu; hoa hồng 4 trạng thái; 2 link; bảng kê theo mô hình chênh lệch; biểu đồ hoa hồng; danh sách F1; lọc khoảng ngày tùy chọn |
| C-02 Gói của tôi | Giữ | Đổi nhãn trạng thái mã |
| C-03 Ví & rút tiền | Sửa | Quy tắc 1 lần/tháng; bỏ ngưỡng tối thiểu/holding (để config = 0); TK ngân hàng lấy từ hồ sơ đăng ký; hiển thị tiến trình duyệt 0/2 · 1/2; lý do từ chối |
| C-PROFILE | Sửa | Thêm hạng, điểm, ref_code, link mua hàng, TK ngân hàng (sửa được), đổi mật khẩu, lịch sử thăng/giáng hạng |
| D-00 Đăng nhập admin | Sửa | Nhiều tài khoản + vai trò; hiển thị vai trò sau đăng nhập |
| D-01 Tổng quan | Sửa | Việc cần làm: đăng ký chờ duyệt, rút tiền chờ duyệt (0/2, 1/2); nút demo "Chạy job cuối tháng" |
| D-02 Người dùng | Sửa | Cột ref_code, link mua hàng, tuyến trên trực tiếp, **hạng**; lọc hạng; drawer: **cây tuyến dưới 3 cấp**, lịch sử **thăng/giáng hạng**, lịch sử đơn, lịch sử hoa hồng; **Chỉ định hạng** & **Tạo agent gốc** (Head Admin) |
| D-03 Đơn & đối soát | Giữ | Thêm cột hạng người bán tại thời điểm đơn; drawer: bảng phân bổ hoa hồng theo chuỗi upline |
| D-04 Gói sản phẩm | Sửa | Thêm ảnh; bỏ "license tháng / giao hàng" khỏi bắt buộc; **bảng hoa hồng 6 hạng của gói** (có lịch sử phiên bản) |
| D-05 Kho mã | Sửa | Nhãn 3 trạng thái mới; cột mã sản phẩm (thiết bị), agent, ngày nhập kho; phân trang ≥1.000 |
| D-06 Chính sách | Sửa → "Hạng & quy tắc" | Bảng hạng: ngưỡng lũy kế, quyền tuyển; quy tắc giáng cấp, rút 1 lần/tháng, tỷ lệ điểm, phiên bản T&C |
| D-07 Duyệt & chi trả | Sửa | Bỏ tab "duyệt hoa hồng" (→ tab "Sổ hoa hồng" chỉ đọc). Tab rút tiền: **duyệt 2 lớp** + timeline + chi trả tay |
| D-08 Ngoại lệ | Giữ (ẩn) | Chỉ hiện khi `CONFIG.rules.onePackagePerPhone=true` |
| **D-09 Duyệt đăng ký thành viên** | **Thêm** | Danh sách + chi tiết + timeline 2 lớp |
| **D-10 Tài khoản admin** | **Thêm** | Head Admin: tạo/sửa/vô hiệu, gán vai |
| 403 | Sửa | Thêm trường hợp Specialist vào D-10 |

---

## 1. Ánh xạ mã màn hình (blueprint ↔ prototype)

| Blueprint (tài liệu mô hình hóa) | Prototype route | Ghi chú |
|---|---|---|
| A0 Resolver | `#r/{ref}` · `#p/{alias}` | |
| A1 Landing + form | `A-01` | |
| A1.1 Thanh toán QR | `A-02` | |
| A2 Thanh toán thành công | `A-03` | |
| C1 Đăng nhập agent · C1.1 Quên MK | `A-05` · `A-05?view=forgot` | |
| C2 Đăng ký · C2.1 OTP · C2.2 Chờ duyệt | `A-06` · `A-06?step=otp` · `A-06?step=done` | mới |
| C3 Dashboard · C3.1 Rút tiền · C3.2 Lịch sử | `C-01` · `C-03` (panel) · `C-03` (tabs) | |
| D1 · D2 · D2.1 · D2.2 | `D-00` · `D-02` · drawer · modal `Admin.createRootAgent()` | |
| D3 · D3.1 Duyệt đăng ký | `D-09` · drawer | mới |
| D4 · D4.1 Rút tiền | `D-07?tab=withdraw` · drawer | |
| D5 · D5.1 Kho hàng | `D-05` · drawer | |
| D6 Tài khoản admin | `D-10` | mới |
| D7 Sản phẩm + bảng hoa hồng | `D-04` (+ `D-06` quy tắc) | |

---

## 2. Thay đổi cấu hình & mô hình dữ liệu

### 2.1 `config/business-rules.js`

```js
CONFIG.brand.publicDomain = 'Homi365.com.vn';          // hiển thị link cá nhân
CONFIG.terminology = { agent: 'Thành viên', agentShort: 'Agent' }; // dùng thay chữ "seller" ở UI

/** Hạng — thứ tự tăng dần. threshold = TỔNG gói bán lũy kế (từ khi là agent) để ĐẠT hạng đó.
 *  Sheet: Copper→Silver 10, Silver→Gold 8, Gold→Diamond 6, Diamond→Titanium 4, Titanium→Lithium 2 (cộng dồn). [cần xác nhận cách cộng dồn] */
CONFIG.ranks = [
  { id: 'COPPER',   label: 'Copper',   threshold: 0,  canRecruit: false },
  { id: 'SILVER',   label: 'Silver',   threshold: 10, canRecruit: true },
  { id: 'GOLD',     label: 'Gold',     threshold: 18, canRecruit: true },
  { id: 'DIAMOND',  label: 'Diamond',  threshold: 24, canRecruit: true },
  { id: 'TITANIUM', label: 'Titanium', threshold: 28, canRecruit: true },
  { id: 'LITHIUM',  label: 'Lithium',  threshold: 30, canRecruit: true }
];
CONFIG.rankRules = {
  minSalesPerMonth: 1,        // không đạt → giáng
  demoteSteps: 1,             // giáng 1 bậc liền kề (04/09)
  demoteResetsCumulative: false, // [cần xác nhận]
  jobTime: '0h ngày cuối tháng, sau khi chốt hoa hồng'
};
CONFIG.points = { perVnd: 1 };                 // 1 điểm = 1 VNĐ (04/09). Sheet 5 ghi 10 — giữ config
CONFIG.withdraw = { maxPerMonth: 1, payoutNote: 'Chi trả đầu tháng kế tiếp', minAmount: 0, holdingDays: 0 };
CONFIG.approval = { requiredConfirms: 2, headCanFinalizeAlone: true, sameUserTwice: false };
CONFIG.admin.roles = { SPECIALIST: 'Admin Specialist', HEAD: 'Head Admin' };
CONFIG.admin.accounts = [
  { username: 'head',   password: 'Homi@2026', role: 'HEAD',       fullName: 'Trưởng bộ phận' },
  { username: 'admin',  password: 'Homi@2026', role: 'SPECIALIST', fullName: 'Chuyên viên 1' },
  { username: 'admin2', password: 'Homi@2026', role: 'SPECIALIST', fullName: 'Chuyên viên 2' }
];
CONFIG.otp.maxWrong = 3;    // 7.2.3: sai 3 lần → lần 4 khóa tạm, bắt gửi lại mã
CONFIG.otp.ttlSeconds = 300;
CONFIG.rules = { onePackagePerPhone: false };  // BR-03 cũ — tắt mặc định
CONFIG.tc = { version: '1.0', updatedAt: '2026-09-04', text: '…nội dung T&C placeholder — chờ stakeholder…' };
CONFIG.email = { from: 'admin@homi365.com.vn' };
```

`LABELS` bổ sung:

```js
LABELS.rank = { COPPER:{text:'Copper',tone:'neutral'}, SILVER:{text:'Silver',tone:'info'}, GOLD:{text:'Gold',tone:'warning'}, DIAMOND:{…}, TITANIUM:{…}, LITHIUM:{text:'Lithium',tone:'navy'} };
LABELS.license = { IN_STOCK:{text:'Sẵn hàng'}, ASSIGNED:{text:'Đã gắn đơn hàng'}, ACTIVATED:{text:'Đã kích hoạt'} }; // thay ISSUED/BOUND
LABELS.approval = { PENDING_0:{text:'Chờ duyệt (0/2)',tone:'warning'}, PENDING_1:{text:'Chờ duyệt (1/2)',tone:'warning'}, APPROVED:{text:'Đã duyệt',tone:'info'}, REJECTED:{text:'Từ chối',tone:'error'} };
LABELS.withdrawal = { PENDING_0, PENDING_1, APPROVED:{text:'Đã duyệt – chờ chi trả'}, REJECTED, PAID:{text:'Đã chi trả'} };
LABELS.commission = { RECORDED:{text:'Đã ghi nhận',tone:'success'}, CANCELLED:{text:'Đã hủy',tone:'error'} }; // bỏ PENDING/APPROVED/PAID
LABELS.commissionKind = { SELF:'Tự bán', DIFF:'Chênh lệch tuyến dưới', COMPANY:'Về công ty (khuyết Lithium)' };
LABELS.registration = LABELS.approval;
LABELS.rankEvent = { PROMOTE:'Thăng hạng', DEMOTE:'Giáng hạng', ASSIGN:'Admin chỉ định', INIT:'Khởi điểm' };
```

`RULES` bổ sung:

```js
RULES.rankIndex(id)                       // vị trí trong CONFIG.ranks
RULES.nextRank(id)                        // hạng kế tiếp hoặc null
RULES.rankByCumulativeSales(n)            // hạng cao nhất có threshold <= n (cho phép nhảy cấp)
RULES.salesToNextRank(cumulative, rankId) // số gói còn thiếu (7.3.3)
RULES.canRecruit(rankId)
RULES.deaccent(str)                       // bỏ dấu tiếng Việt, 'Đ'→'D'
RULES.purchaseAlias(fullName, phone)      // 'Hoàng Thị Mỹ Trinh','0937630083' → 'HTMT0083'
RULES.purchaseUrl(alias)                  // `https://${publicDomain}/${alias}`
RULES.pointsOf(vnd)                       // vnd * CONFIG.points.perVnd
RULES.inSameMonth(isoA, isoB)
```

### 2.2 `mock/data.js` — thực thể

**packages** (D-04): thêm `image` (đường dẫn), `commissionByRank: { COPPER:2000000, SILVER:3000000, GOLD:3500000, DIAMOND:3700000, TITANIUM:3800000, LITHIUM:3850000 }`, `commissionVersions: [{version, effectiveFrom, byRank, createdBy, createdAt, note}]`. Bỏ ràng buộc bắt buộc `licenseMonths/hasShipping` (giữ trường, không bắt nhập).

**users** (agent): thêm

```js
email, password (mock: lưu plain 'Homi@123' — ghi chú "hash ở bản thật"),
rank: 'COPPER', rankSince, cumulativeSales (số gói PAID bán qua ref_code từ activatedAt),
salesThisMonth (tính động), points (tính động = tổng commission RECORDED * perVnd),
purchaseAlias: 'HTMT0083', // link mua hàng cá nhân
bank: { bankName, accountNo, owner }, // bắt buộc từ lúc đăng ký (7.2.2)
tcConsent: { version, at },
activatedAt, registrationId,
rankHistory: [{ at, from, to, event: 'INIT'|'PROMOTE'|'DEMOTE'|'ASSIGN', by, reason }]
```
`type`: `'buyer' | 'agent'` (đổi từ `seller`; nếu giữ `seller` nội bộ thì đổi hết nhãn UI).

**registrations** (mới, D-09):

```js
{ id:'RG0001', phone, email, fullName, orderId, referrerId, referrerRankAtSubmit, bank, password, tcVersion, tcAt,
  status:'PENDING_0'|'PENDING_1'|'APPROVED'|'REJECTED', approvals:[{ by, role, action:'APPROVE'|'REJECT', at, reason }],
  createdAt, decidedAt, agentId }
```

**withdrawals**: `status` theo `LABELS.withdrawal`; thêm `approvals[]` như trên, `createdBy` (`'agent'` hoặc username admin tạo hộ), `paidAt`, `paidBy`, `auditLog:[{at, by, from, to, note}]`.

**commissions** (sổ hoa hồng): mỗi dòng phân bổ

```js
{ id:'CM0001', orderId, beneficiaryId | 'COMPANY', kind:'SELF'|'DIFF'|'COMPANY', depth (0 = người bán, 1 = F1 upline…),
  rankAtCalc, amount, status:'RECORDED'|'CANCELLED', createdAt, cancelReason }
```

**adminUsers**: `{ username, password, role, fullName, status:'active'|'disabled', createdAt, createdBy }` (seed từ `CONFIG.admin.accounts`).

**codes** (kho): `{ code, deviceSku:'HW01', deviceSerial, status:'IN_STOCK'|'ASSIGNED'|'ACTIVATED', orderId, agentId, stockedAt, assignedAt, activatedAt, batch, device }`.

**audit** (mới): `{ at, actor, actorRole, entity:'withdrawal'|'registration'|'agent'|'policy'|'code', entityId, from, to, note }` — mọi thao tác duyệt/từ chối/chi trả/khóa/chỉ định hạng đều ghi.

**clicks**: giữ; ghi thêm `alias` nếu vào qua `#p/`.

---

## 3. Nghiệp vụ Store — hàm phải thêm / sửa

### 3.1 Resolver & link
- `captureRef(codeOrAlias)`: nếu không tìm thấy `refCode` → thử `purchaseAlias` (so sánh không phân biệt hoa thường) → resolve về agent. Agent `locked` → `{ok:false, reason:'locked'}`.
- `genPurchaseAlias(fullName, phone)`: `RULES.purchaseAlias` → nếu tồn tại trong mọi agent (kể cả locked/inactive — 8.1.C-5 "không cấp lại") → thêm `-2`, `-3`… Trả về alias duy nhất.

### 3.2 Đơn hàng & thanh toán (giữ, sửa nhỏ)
- `createOrder(draft)`: thêm `email`; lưu `referrerRankAtOrder = seller.rank`.
- `markPaid(id, method)`: giữ cấp mã (`ASSIGNED`), tạo/ghép Customer theo SĐT, gán `referrerId`; gọi `createCommissions(o)` mới; tăng `seller.cumulativeSales += 1` **chỉ khi seller là agent active** (không đếm đơn tự mua của chính agent trước khi kích hoạt — sheet 5 mục C).
- Bỏ `RULES.ownsPackage` chặn mua khi `CONFIG.rules.onePackagePerPhone=false`.

### 3.3 Commission engine (viết lại `createCommissions`)

```js
createCommissions(o) {
  if (!o.sellerId) return;
  const rates = this.commissionByRank(o.packageId, o.paidAt);   // phiên bản hiệu lực tại paidAt
  const top = rates.LITHIUM;
  let paid = 0, depth = 0;
  for (const agent of this.uplineChain(o.sellerId, 99)) {       // không giới hạn tầng (sheet 5 E)
    const mine = rates[agent.rank];
    const diff = mine - paid;
    if (diff > 0) {                                              // = 0 hoặc < 0 → breakaway, bỏ qua nhưng vẫn đi tiếp lên
      this.pushCommission({ orderId:o.id, beneficiaryId:agent.id, kind: depth===0?'SELF':'DIFF', depth, rankAtCalc:agent.rank, amount:diff });
      paid = mine;
    }
    depth++;
    if (paid >= top) break;
  }
  if (paid < top) this.pushCommission({ orderId:o.id, beneficiaryId:'COMPANY', kind:'COMPANY', depth, rankAtCalc:'LITHIUM', amount: top - paid });
}
```
Bất biến để test: tổng `amount` mọi dòng của 1 đơn = `rates.LITHIUM` (3.850.000). Seed phải tái hiện 5 case sheet 5 (mục 6.2).

### 3.4 Ví & điểm (sửa `wallet`)
```js
wallet(agentId) {
  recorded  = Σ commissions RECORDED của agent            // "đã ghi nhận" (7.3.4)
  held      = Σ withdrawals PENDING_0|PENDING_1|APPROVED  // "đang chờ duyệt" (hold)
  withdrawn = Σ withdrawals PAID                           // "đã rút"
  available = recorded - held - withdrawn                  // "khả dụng"
  points    = RULES.pointsOf(recorded)
}
```
Bỏ khái niệm hoa hồng PENDING/APPROVED.

### 3.5 Rút tiền (sửa)
- `canWithdraw(agentId, amount)` → `{ok, reason}`: `amount > available` → lỗi; tồn tại withdrawal của agent trong **tháng hiện tại** với status ∈ {PENDING_0, PENDING_1, APPROVED} → lỗi "chỉ rút 1 lần/tháng" (7.3.6). `minAmount`/`holdingDays` chỉ áp khi > 0.
- `createWithdrawal(agentId, amount, createdBy='agent')`: `bank` lấy từ `user.bank` (không nhập lại, không cần CCCD); `status:'PENDING_0'`; audit.
- `approveWithdrawal(id, admin)` / `rejectWithdrawal(id, admin, reason)` → dùng `applyApproval(entity, admin, action, reason)` chung (3.7).
- `markWithdrawalPaid(id, admin)`: chỉ khi `APPROVED`; → `PAID`, audit. Trạng thái cuối.

### 3.6 Đăng ký thành viên (mới)
- `registrationEligibility(phone)` → `{ok, reason, order, referrer}`:
  1. không có Order PAID theo SĐT → `'no_order'`;
  2. `referrer.rank` không `canRecruit` → `'referrer_copper'` (#50) — kiểm tra **tại thời điểm đăng ký**;
  3. SĐT/email đã gắn agent active → `'duplicate'` (7.2.7);
  4. đã có registration PENDING → `'pending'`.
- `submitRegistration(data)` → tạo `registrations[]` status `PENDING_0`, lưu `tcConsent`, audit. **Không** tạo agent.
- `approveRegistration(id, admin)` → `applyApproval`; khi `APPROVED` → `activateAgent(reg)`:
  - user theo SĐT: `type:'agent'`, `rank:'COPPER'` (hoặc `reg.assignedRank`), `refCode = genRefCode()`, `purchaseAlias = genPurchaseAlias()`, `referrerId = order.sellerId`, `bank`, `password`, `email`, `activatedAt`, `rankHistory:[INIT]`;
  - `sendActivationEmail(agent)` (mock: ghi vào `emails[]` để UI hiển thị "Email đã gửi" với 2 link + link portal).
- `rejectRegistration(id, admin, reason)` → `REJECTED`, lưu lý do (KH thấy ở A-05/A-06). [Chờ xác nhận: có cho nộp lại không → mặc định **cho nộp lại**.]

### 3.7 Máy trạng thái duyệt 2 lớp (dùng chung)

```js
applyApproval(entity, admin, action, reason) {
  if (action === 'REJECT') { require(reason); entity.status = 'REJECTED'; ... }
  else {
    if (entity.approvals.some(a => a.by === admin.username && a.action === 'APPROVE')) throw 'Đã xác nhận rồi';       // 7.9.4
    if (entity.createdBy === admin.username) throw 'Người tạo không được tự duyệt';                                    // 7.9.3
    entity.approvals.push({ by: admin.username, role: admin.role, action: 'APPROVE', at: now });
    const n = entity.approvals.filter(a => a.action === 'APPROVE').length;
    if (admin.role === 'HEAD' || n >= CONFIG.approval.requiredConfirms) entity.status = 'APPROVED';                   // Head tự chốt
    else entity.status = 'PENDING_1';
  }
  audit(...)
}
```

### 3.8 Rank engine (mới)
- `runMonthEndJob(admin)` (nút demo ở D-01 + có thể tự chạy khi đổi tháng): với từng agent active:
  - `salesThisMonth = count(orders PAID, sellerId=agent, paidAt trong tháng)`.
  - Nếu `< minSalesPerMonth` → giáng `demoteSteps` bậc (không dưới Copper) → `rankHistory DEMOTE`.
  - Ngược lại: `target = RULES.rankByCumulativeSales(cumulativeSales)`; nếu `target > rank` → **thăng thẳng** lên `target` (nhảy cấp) → `PROMOTE`.
  - Ghi audit, trả về báo cáo `{promoted:[], demoted:[]}` để hiển thị toast/modal.
- `assignRank(agentId, rankId, admin, reason)` (Head Admin) → `ASSIGN`.
- `createRootAgent(data, admin)` (Head Admin, D-02): tạo agent active không qua mua hàng/duyệt; `referrerId = null` hoặc chọn; `rank` chọn; sinh ref_code + alias; email kích hoạt.

### 3.9 Admin
- `adminLogin(username, password)` tra `adminUsers` (status active), trả `{ok, admin:{username, role, fullName}}`; giữ khóa 5 lần sai.
- `adminUsers()`, `saveAdminUser(u, byHead)`, `setAdminStatus(username, status, byHead)`.
- Guard: route `D-10` chỉ `HEAD`; Specialist vào → 403 ("Chỉ Head Admin").

### 3.10 Kho hàng
- Đổi trạng thái `ISSUED→ASSIGNED`, `BOUND→ACTIVATED`; `issueLicense(o)` set `assignedAt`, `agentId = o.sellerId`.
- `activateCode(code, device, admin?)` (demo: nút trong drawer D-05 mô phỏng app kích hoạt) → `ACTIVATED`, không quay lại.
- `importCodes` nhận thêm `deviceSku`, `deviceSerial` (cột 2, 3 CSV) — nếu thiếu thì `HW01`, serial rỗng.

### 3.11 Xóa/tắt
- `approveCommissions`, `payCommissions`, `cancelCommissions` theo lô → chỉ giữ `cancelCommissions` (dùng khi hoàn tiền).
- `savePolicy` (% tầng) → thay bằng `saveCommissionTable(packageId, byRank, effectiveFrom, note, admin)` (validate tăng đơn điệu theo hạng) và `saveRankRules(...)`.

---

## 4. Thay đổi từng màn hình

Quy ước chung: giữ design system (`tokens.css`, `components.css`), hash router, `App.after`, `UI.*`. Mọi chữ **"seller"** trên UI → **"thành viên"** (danh từ) / **"agent"** (khi ghép mã). "Quản trị Medigo" → "Quản trị HOMI365".

### 4.1 Resolver `#r/` · `#p/`
- Thêm nhánh `/^p\//i` → `Store.captureRef(alias)`. Cả 2 lưu `s.ref`, `s.refAt` (7 ngày — giữ), `s.entry:'ref'|'alias'`.
- Lỗi: không tồn tại → A-01?state=invalid; agent khóa → A-01?state=inactive (đã có). Không cho mua khi không có mã (đã có).

### 4.2 A-01 Landing + form (LP-1, LP-2, 6.1.C-5)
- Form: **Họ tên · SĐT · Email (bắt buộc, validate) · Địa chỉ nhận hàng · Ghi chú**. Số lượng cố định 1.
- Thẻ người giới thiệu: tên + mã; **không** hiện hạng.
- Giữ OTP xác thực SĐT trước khi tạo đơn (ghi rõ trong UI: "Xác thực số điện thoại để nhận mã kích hoạt và đăng ký thành viên sau này").
- Bỏ chặn "SĐT đã mua gói" khi `onePackagePerPhone=false`.
- Sau OTP → `Store.createOrder` → A-02 (giữ).

### 4.3 A-02 Thanh toán (LP-4, LP-5, 6.1.C-5) — giữ
- Đổi text: "Cổng thanh toán (mô phỏng)… gọi callback về hệ thống Homi365".
- Nút "Thanh toán" bấm nhiều lần không sinh đơn mới (đã có qua `s.orderId`). Thêm test hint.

### 4.4 A-03 Kết quả (LP-3, LP-6, 7.2.1, #50)
- Sau PAID: khối bên phải phụ thuộc `order.referrerRankAtOrder` (hoặc hạng hiện tại của người giới thiệu — dùng **hiện tại**):
  - `canRecruit` → tiêu đề "Trở thành thành viên HOMI365", mô tả quyền lợi (hoa hồng theo hạng, link riêng), 2 nút **Đăng ký thành viên** → `A-06?order={id}` và **Thoát ra** → `A-03?later=1` (giữ màn "đã gửi SMS").
  - Không `canRecruit` (Copper) → chỉ "Đơn hàng thành công", không lời mời. Có dòng nhỏ: "Bạn có thể đăng ký thành viên sau tại Đăng nhập → Đăng ký".
  - SĐT đã là agent → nút "Đăng nhập".
  - SĐT có registration đang chờ → "Đăng ký của bạn đang chờ duyệt (x/2)".
- Bỏ hoàn toàn `a03CreateSeller` (tạo tức thì).

### 4.5 A-04 Tra cứu đơn — giữ
- Khối "Kích hoạt tài khoản seller" → "Đăng ký thành viên" → `A-06?phone=…` (đi qua kiểm tra điều kiện). Bỏ `a04Activate`.

### 4.6 A-05 Đăng nhập thành viên (7.1.1–7.1.3)
- Form: **SĐT + Mật khẩu** (+ Ghi nhớ). Lỗi chung "Số điện thoại hoặc mật khẩu không đúng" — không lộ SĐT tồn tại.
- Link **Quên mật khẩu** → `A-05?view=forgot`: nhập SĐT → OTP → mật khẩu mới ×2 → về đăng nhập.
- Link **Đăng ký thành viên** → `A-06`.
- Sau xác thực: agent `locked` → thông báo khóa; agent active → `next`; user có Order PAID nhưng chưa agent → **redirect A-06** (7.1.3) với autofill; registration PENDING → màn "Đang chờ duyệt (x/2)"; REJECTED → hiển thị lý do + nút nộp lại.
- Bỏ đăng nhập bằng OTP-only; SĐT admin (`CONFIG.demo.adminPhone`) vẫn từ chối (giữ).

### 4.7 **A-06 Đăng ký thành viên** (mới — 7.2.1–7.2.8, 7.9.2, #50)
Route `A-06`, query: `order` (từ A-03) hoặc `phone` (từ A-04) hoặc trống (từ A-05).

Bước 0 — Xác định SĐT: nếu có `order` → SĐT từ Order, **ẩn** ô SĐT; nếu không → ô SĐT + nút "Kiểm tra". `Store.registrationEligibility(phone)`:
- `no_order` → lỗi "Số điện thoại chưa có đơn hàng CN02 thành công. Mua qua link giới thiệu trước."
- `referrer_copper` → lỗi "Người giới thiệu của bạn chưa đủ điều kiện tuyển thành viên (cần từ hạng Silver)."
- `duplicate` → lỗi "SĐT/email đã gắn với thành viên khác."
- `pending` → chuyển màn chờ duyệt.

Bước 1 — Form (Bước 1/3): **Họ tên** (autofill từ Order, nguồn sinh alias — hint "Dùng để tạo link mua hàng cá nhân"), **Email** (autofill), SĐT (readonly), **Ngân hàng** (select `CONFIG.banks`), **Số tài khoản**, **Chủ tài khoản**, **Mật khẩu** + **Nhập lại**, khối **Điều khoản tham gia** (scroll box hiển thị `CONFIG.tc.text`, phiên bản) + checkbox bắt buộc "Tôi đã đọc và đồng ý". Hiển thị người giới thiệu (tên · mã) từ Order (7.2.5). Preview link cá nhân dự kiến: `Homi365.com.vn/HTMT0083`.

Bước 2 — OTP (Bước 2/3): `UI.otp.mount`, hết hạn 5', sai 3 lần → lần 4 khóa tạm & yêu cầu gửi lại (7.2.3).

Bước 3 — Kết quả (Bước 3/3): "Đăng ký đã gửi — Chờ duyệt (0/2)". Giải thích: admin xác nhận 2 lượt; sau khi duyệt sẽ nhận email từ `admin@homi365.com.vn` gồm 2 link bán hàng + link portal. Nút "Về trang đăng nhập". Demo hint: mở D-09 để duyệt.

Trạng thái phụ: `?state=pending` (đang chờ x/2, timeline), `?state=rejected` (lý do + nút "Nộp lại").

### 4.8 C-01 Tổng quan (7.3.1–7.3.6, 7.3.10, #50)
- Header: "Xin chào, {tên}" + **badge hạng** + "tham gia {ngày}".
- Khối **Link của bạn**: 2 dòng — *Link giới thiệu* `…/#r/{ref}` và *Link mua hàng cá nhân* `Homi365.com.vn/{alias}` (prototype mở bằng `#p/{alias}`), mỗi dòng nút Sao chép; QR cho link cá nhân; chia sẻ (giữ). Nếu hạng Copper: ghi chú "Bạn có thể bán hàng; quyền tuyển thành viên mở từ hạng Silver."
- Khối **Hạng & điểm**: hạng hiện tại, **điểm tích lũy** (= hoa hồng đã ghi nhận × perVnd), **đã bán lũy kế N gói**, **còn thiếu M gói để lên {hạng kế}** với progress bar; **bán trong tháng: k gói** + cảnh báo "cần ≥1 gói/tháng để giữ hạng"; link "Xem lịch sử hạng" → C-PROFILE.
- Khối **Thống kê đơn hàng**: seg 7/30/90 ngày **+ khoảng ngày tùy chọn** (2 input date) (7.3.2). Thẻ: Lượt click, Đơn đã đặt, Đơn thanh toán, Doanh số. Biểu đồ combo giữ.
- Khối **Hoa hồng** (7.3.4) 4 thẻ: Đã ghi nhận · Đang chờ duyệt (hold rút tiền) · Đã rút · **Khả dụng** (bấm → C-03). Nút **Tạo yêu cầu rút tiền** (disabled + tooltip nếu đã có yêu cầu trong tháng). **Biểu đồ hoa hồng theo ngày/tháng** (7.3.10 — dùng `UI.chart.combo` cột = hoa hồng).
- **Bảng kê hoa hồng** cột: Ngày · Đơn gốc · Nguồn (Tự bán / F1 / F2… — `depth`) · Hạng lúc tính · Số tiền · Trạng thái (Đã ghi nhận/Đã hủy). Lọc kỳ + xuất CSV (giữ).
- **Tuyến dưới trực tiếp (F1)** (7.3.5): bảng tên (mask SĐT) · hạng · ngày tham gia · đơn đã bán.

### 4.9 C-02 Gói của tôi — giữ; đổi nhãn mã `Đã gắn đơn hàng / Đã kích hoạt`.

### 4.10 C-03 Ví & rút tiền (7.3.4, 7.3.6, 7.9.3)
- Hero: Khả dụng · Đã ghi nhận · Đang giữ (chờ duyệt) · Đã rút.
- Nút "Tạo yêu cầu rút tiền": disabled nếu `!canWithdraw` với lý do ("Bạn đã có yêu cầu trong tháng này — chỉ rút 1 lần/tháng" / "Số dư khả dụng 0").
- Form 2 bước: **Số tiền** (validate ≤ khả dụng) + **Xác nhận tài khoản nhận** (hiển thị `user.bank` readonly, link "Sửa trong Hồ sơ") → **Xác nhận** (modal). Bỏ OTP & CCCD (không có trong yêu cầu; giữ được nếu muốn — để config `CONFIG.withdraw.requireOtp=false`).
- Quy định: "Rút 1 lần/tháng · duyệt 2 lớp bởi admin · chi trả đầu tháng kế tiếp".
- Tab **Lịch sử rút tiền**: cột Mã · Ngày · Số tiền · Tiến trình (badge `PENDING_0/1`, `APPROVED`, `PAID`, `REJECTED` + lý do) · timeline nhỏ (ai/khi nào — ẩn tên admin, chỉ vai trò). Tab **Sổ hoa hồng** (ledger) giữ.

### 4.11 C-PROFILE
- Thêm: Hạng + lịch sử thăng/giáng (bảng `rankHistory`), điểm, ref_code, link cá nhân, **Tài khoản nhận hoa hồng** (sửa được: ngân hàng/số TK/chủ TK — audit), **Đổi mật khẩu** (mật khẩu cũ + mới ×2), email. Người giới thiệu (giữ).

### 4.12 D-00 Đăng nhập admin (7.4.1, 7.9.1)
- Tra `adminUsers`. Sau đăng nhập, sidebar hiển thị **họ tên + vai trò** (Admin Specialist / Head Admin). Mục "Tài khoản admin" chỉ hiện với HEAD. Demo hint 3 tài khoản.

### 4.13 D-01 Tổng quan
- Thẻ: Doanh thu · Đơn · Thành viên mới · **Đăng ký chờ duyệt** · **Rút tiền chờ duyệt** · Mã còn trong kho.
- Việc cần làm: đăng ký chờ (0/2, 1/2) → D-09; rút tiền chờ → D-07; đơn chờ đối soát → D-03; kho sắp cạn → D-05.
- Khối **Job cuối tháng** (demo): "Kỳ {tháng}: X thành viên chưa bán đơn nào" + nút "Chạy xét hạng cuối tháng" → modal kết quả (thăng/giáng) — chỉ HEAD.

### 4.14 D-02 Thành viên (7.5.1–7.5.5, 7.2.4, sheet 5 D)
- Bảng: Thành viên (tên/SĐT/email) · Loại (Khách hàng / Thành viên) · **ref_code** · **Link cá nhân** · **Tuyến trên trực tiếp** · **Hạng** · Đơn đã bán · Tuyến dưới · Tham gia · Trạng thái · Chi tiết.
- Lọc: tìm tên/SĐT/ref_code/alias; loại; **hạng**; trạng thái. Export CSV toàn bộ cột hiển thị (7.5.5).
- Nút header (HEAD): **Tạo thành viên gốc** → modal: họ tên, SĐT, email, ngân hàng/số TK/chủ TK, hạng khởi điểm, tuyến trên (tuỳ chọn, nhập ref_code), mật khẩu tạm, lý do → `createRootAgent`.
- Drawer chi tiết (7.5.2): Hồ sơ (kèm TK ngân hàng, T&C phiên bản/thời điểm) · **Hạng** (hiện tại, lũy kế, bán trong tháng, nút **Chỉ định hạng** — HEAD, bắt buộc lý do) · **Cây tuyến dưới 3 cấp** (render `<ul>` lồng: tên · hạng · số đơn; giới hạn 3 cấp, có "+n" khi nhiều) · Tuyến trên (chuỗi đến gốc) · **Lịch sử đơn hàng** (đã mua + đã bán) · **Lịch sử hoa hồng** (10 dòng gần nhất) · **Lịch sử thăng/giáng hạng** · Nhật ký/audit.
- Foot: Khóa/Mở khóa (giữ — khóa → link vô hiệu, 7.5.4); Đổi người giới thiệu (**chỉ HEAD**, cảnh báo, lý do).

### 4.15 D-03 Đơn hàng & đối soát — giữ
- Thêm cột "Hạng người bán (lúc đơn)". Drawer: mục "Phân bổ hoa hồng" liệt kê theo `depth`: Tự bán → F1 → … → Công ty, tổng = 3.850.000. Hoàn tiền → `cancelCommissions` (giữ).

### 4.16 D-04 Gói sản phẩm (7.7.1 — có UI)
- Bảng: Mã · Tên · Giá · Ảnh · Hoa hồng Lithium (tổng chi/gói) · Cập nhật · Bán · Sửa.
- Modal Sửa/Thêm: Mã, Tên, Giá, **Ảnh (URL/upload mock)**, Mô tả, Quyền lợi, **Bảng hoa hồng theo hạng** (6 ô VNĐ, validate tăng đơn điệu theo thứ tự hạng, hiển thị cột "Chênh lệch so với hạng dưới" tự tính), **Ngày hiệu lực**, Ghi chú → `saveCommissionTable` tạo phiên bản. Khối "Lịch sử phiên bản bảng hoa hồng" (diff như D-06 cũ).
- Bật/tắt tham gia chương trình (giữ). Bỏ bắt buộc license/giao hàng.

### 4.17 D-06 → "Hạng & quy tắc chương trình"
- Bảng hạng (chỉ đọc từ `CONFIG.ranks` hoặc cho sửa ngưỡng): Hạng · Ngưỡng lũy kế · Quyền tuyển.
- Quy tắc: bán tối thiểu/tháng, số bậc giáng, rút tối đa/tháng, tỷ lệ điểm, ngày chi trả — form lưu vào `Store.rules` (có lịch sử).
- **Điều khoản T&C**: phiên bản, nội dung, ngày hiệu lực (lưu phiên bản; đăng ký mới dùng phiên bản mới nhất).

### 4.18 D-07 Rút tiền & sổ hoa hồng (7.6.1–7.6.5, 7.9.3, 7.9.4)
- Tab **Rút tiền**: lọc trạng thái (Chờ duyệt 0/2 · 1/2 · Đã duyệt–chờ chi trả · Từ chối · Đã chi trả). Bảng: Mã · Thành viên · Số tiền · Đối chiếu số dư (khả dụng thực tế tại thời điểm xem; cảnh báo nếu thiếu) · Nhận về · **Tiến trình** (0/2, 1/2 + ai/vai trò) · Hành động.
  - Hành động theo vai/trạng thái: `PENDING_*` → **Xác nhận** (disabled nếu chính mình đã xác nhận lượt 1 hoặc là người tạo hộ) / **Từ chối** (lý do bắt buộc). `APPROVED` → **Đánh dấu đã chi trả** (sau khi chuyển khoản tay; hiện file ngân hàng export như cũ). `PAID`/`REJECTED` → không còn nút.
  - Drawer chi tiết: TK nhận tiền đầy đủ (7.6.2), số dư khả dụng, **timeline** (bước 1: ai/vai/khi nào; bước 2; chi trả), audit log (7.6.5).
  - Khi Từ chối → gỡ hold, agent thấy lý do tại C-03.
  - Xuất CSV (giữ). Bỏ "chọn lô để duyệt" (duyệt từng yêu cầu vì 2 lớp).
- Tab **Sổ hoa hồng** (thay tab duyệt): chỉ đọc, lọc theo thành viên/đơn/kỳ, cột Nguồn/Hạng lúc tính/Số tiền/Trạng thái; tổng kiểm "Σ theo đơn = 3.850.000".

### 4.19 **D-09 Duyệt đăng ký thành viên** (mới — 7.9.2, 7.9.4)
- Bảng: Mã · Họ tên/SĐT/email · Người giới thiệu (tên · mã · hạng) · Đơn gốc · Ngày nộp · **Tiến trình** · Hành động (Xác nhận/Từ chối theo cùng quy tắc 3.7).
- Lọc trạng thái. Drawer: toàn bộ form đã nộp (TK ngân hàng), Order gốc, T&C (phiên bản, thời điểm), timeline 2 lớp, audit. Khi APPROVED → toast "Đã kích hoạt thành viên {tên} · ref_code {…} · link {alias} · email đã gửi" + drawer hiển thị khối "Email kích hoạt" (mock).
- Ghi chú: duyệt **không** ảnh hưởng đơn/tuyến/hoa hồng đã ghi tại lúc mua.

### 4.20 **D-10 Tài khoản admin** (mới — 7.9.1) — chỉ HEAD
- Bảng: Tên đăng nhập · Họ tên · Vai trò · Trạng thái · Tạo bởi/khi nào. Thêm/Sửa (đổi vai, đặt lại mật khẩu) / Vô hiệu hóa. Không cho tự hạ vai/vô hiệu chính mình.
- Specialist vào D-10 → 403 ("Chỉ Head Admin có quyền").

### 4.21 D-05 Kho hàng (7.8.1–7.8.5)
- Summary 3 thẻ: Sẵn hàng · Đã gắn đơn hàng · Đã kích hoạt (tổng = N; bỏ thẻ "Tổng").
- Bảng: **Mã sản phẩm (HW01 · serial)** · Mã kích hoạt · Đơn hàng gắn · **Thành viên bán** · Ngày nhập kho · Trạng thái · Chi tiết. Lọc trạng thái; tìm mã SP/mã kích hoạt; rỗng rõ ràng (đã có). Export theo bộ lọc (đã có). Phân trang (đã có — seed ≥ 1.000 mã để thấy).
- Drawer chi tiết: vòng đời + mốc thời gian; nút demo "Mô phỏng kích hoạt từ app" (chỉ khi ASSIGNED).
- Sinh hàng loạt / Nhập file: thêm cột `deviceSku, deviceSerial`.

### 4.22 Trang bìa `#HOME`, Demo navigator, README
- Cập nhật tài khoản mẫu (mục 6.3), thêm A-06, D-09, D-10, các state mới; đổi chữ seller → thành viên.

---

## 5. Luồng UX sau khi sửa (kiểm tra bằng tay)

1. **Mua**: `#p/HTMT0083` (hoặc `#r/AN7K2Q`) → A-01 (họ tên/SĐT/email/địa chỉ) → OTP → A-02 QR/cổng → callback PAID → A-03.
   - Người giới thiệu ≥ Silver → 2 nút *Đăng ký thành viên* / *Thoát ra*. Copper → chỉ "Đơn hàng thành công".
   - Kiểm tra: D-03 drawer thấy phân bổ hoa hồng tổng 3.850.000; C-01 người giới thiệu thấy "Đã ghi nhận" tăng ngay; `cumulativeSales` +1.
2. **Đăng ký**: A-03 → A-06 (autofill, ẩn SĐT) → T&C → OTP → "Chờ duyệt 0/2". Hoặc A-05 → "Đăng ký" → nhập SĐT → validate (3 lỗi) → A-06.
3. **Duyệt đăng ký**: D-00 `admin` → D-09 → Xác nhận → 1/2 (nút của `admin` disabled). Đăng xuất → `admin2` → Xác nhận → Đã duyệt → agent active, email mock. Hoặc `head` xác nhận 1 lượt → Đã duyệt ngay. Từ chối → lý do → KH thấy ở A-05.
4. **Đăng nhập**: A-05 SĐT + mật khẩu → C-01 (hạng Copper, điểm, còn thiếu 10 gói). Quên MK → OTP → đặt lại.
5. **Rút tiền**: C-03 → số tiền ≤ khả dụng → xác nhận TK → Chờ duyệt 0/2 → số dư hold. Tạo lần 2 trong tháng → chặn. D-07: 2 admin khác nhau xác nhận (hoặc head) → Đã duyệt → "Đánh dấu đã chi trả" → Đã chi trả. Từ chối → hoàn hold, agent thấy lý do.
6. **Cuối tháng**: D-01 (head) "Chạy xét hạng" → agent bán ≥10 lũy kế lên Silver (hoặc nhảy cấp), agent 0 đơn trong tháng giáng 1 bậc; C-PROFILE thấy lịch sử; D-02 drawer thấy lịch sử.
7. **Breakaway**: seed 1 nhánh Silver → Silver: đơn của Silver dưới không sinh dòng DIFF cho Silver trên (0đ), phần trên đi tiếp lên Gold/Lithium/Công ty.
8. **Kho**: D-05 sinh 1.200 mã → phân trang; PAID gán mã (ASSIGNED, cột agent) → drawer "Mô phỏng kích hoạt" → ACTIVATED; lọc + export đúng bộ lọc.
9. **Phân quyền**: `admin` vào `#D-10` → 403; `head` vào → CRUD admin.

---

## 6. Dữ liệu mẫu (SEED) cần sửa

### 6.1 Agent
- Cây theo Case 5 sheet 5: **Lithium (U001 An)** → **Gold (U002 Bình)** → { **Copper cũ (U003 Cường)**, **Silver mới (U004 Dung)** → **Copper mới (U006 Hoa)** }. Thêm 1 nhánh **Silver → Silver** (breakaway) và 1 nhánh thiếu Lithium (gốc là Gold) để thấy dòng "Về công ty".
- Mỗi agent: `email`, `password:'Homi@123'`, `bank`, `purchaseAlias` sinh từ tên/SĐT (ví dụ Nguyễn Văn An 0908123456 → `NVA3456`), `rankHistory` INIT + 1–2 sự kiện, `cumulativeSales` khớp số đơn PAID, `tcConsent`.
- Agent bị khóa (U005) giữ. 1 agent Copper có 0 đơn trong tháng (để job giáng — vẫn Copper), 1 Silver 0 đơn (→ giáng Copper).
- 2 người mua chưa đăng ký: 1 mua qua link agent ≥ Silver (đăng ký được), 1 mua qua link Copper (bị chặn #50).

### 6.2 Đơn & hoa hồng
- Sinh hoa hồng bằng chính `createCommissions` mới (không hard-code %). Kiểm tra tự động khi load: `console.assert(Σ per order === 3_850_000)`.
- Đưa 5 case sheet 5 thành 5 đơn có thể tìm trong D-03 (ghi chú `note: 'Case 1 – …'`).

### 6.3 Registrations, withdrawals, admins
- 3 registrations: PENDING_0, PENDING_1 (đã có `admin` xác nhận), REJECTED (lý do).
- Withdrawals: PENDING_0, PENDING_1, APPROVED (chờ chi trả), PAID, REJECTED; 1 agent đã có yêu cầu tháng này (để test chặn).
- adminUsers: `head` / `admin` / `admin2` (mật khẩu `Homi@2026`).

### 6.4 Kho
- ≥ 1.200 mã, `deviceSku:'HW01'`, serial `HW01-000001…`, phân bố 3 trạng thái.

### 6.5 Tài khoản demo (cập nhật README & `#HOME`)
| Mục | Giá trị |
|---|---|
| Link giới thiệu | `#r/AN7K2Q` · link cá nhân `#p/NVA3456` |
| Link của Copper (không được tuyển) | `#p/{alias Copper}` |
| OTP | `123456` |
| Agent đăng nhập | `0908123456` / `Homi@123` |
| Người mua đã có đơn (qua Silver+) chưa đăng ký | `0901111222` |
| Người mua đã có đơn qua Copper | (SĐT mới) |
| Admin | `head`, `admin`, `admin2` / `Homi@2026` |

---

## 7. Thứ tự triển khai đề xuất (mỗi bước chạy được)

1. **Nền**: CONFIG/LABELS/RULES mới; đổi nhãn seller→thành viên; adminUsers + role + guard D-10/403; kho đổi trạng thái. *(không đổi luồng)*
2. **Engine**: `ranks`, `commissionByRank`, `createCommissions` mới, `wallet` mới, seed lại; D-03 drawer phân bổ; C-01 bảng kê + 4 thẻ; D-07 tab Sổ hoa hồng. Assert tổng 3.850.000.
3. **Đăng ký & duyệt**: A-06, `registrationEligibility`, `applyApproval`, D-09, email mock; A-03/A-04/A-05 đổi nút; bỏ tạo tức thì.
4. **Đăng nhập mật khẩu** + quên MK; C-PROFILE đổi MK/TK ngân hàng.
5. **Rút tiền 2 lớp** + 1 lần/tháng: C-03, D-07 tab rút tiền + timeline + chi trả.
6. **Hạng**: C-01 khối hạng/điểm, D-02 cột/lọc/drawer/cây 3 cấp/chỉ định hạng/tạo gốc, job cuối tháng ở D-01, C-PROFILE lịch sử.
7. **Sản phẩm & quy tắc**: D-04 bảng hoa hồng theo hạng + phiên bản; D-06 quy tắc + T&C.
8. **Link cá nhân**: alias + resolver `#p/`; hiển thị ở C-01/C-PROFILE/D-02; xử lý trùng.
9. Dọn: README, `#HOME`, demo navigator, styleguide (badge hạng, badge tiến trình 0/2).

---

## 8. Definition of Done — đối chiếu mã YC

| Mã YC | Kiểm tra trên prototype |
|---|---|
| LP-1 | `#r/` & `#p/` giữ ref 7 ngày; sai mã → lỗi, không có form |
| LP-2 | A-01 có họ tên, SĐT, email, địa chỉ; không cần tài khoản |
| LP-3 | PAID → Order có refCode/sellerId, Customer tạo/ghép theo SĐT, commissions sinh ngay, cumulativeSales +1 |
| LP-4/5 | A-02 QR 15', tạo lại QR, callback PAID/FAILED |
| LP-6 | A-03: Đăng ký / Thoát; Thoát vẫn giữ Order & tuyến |
| 7.1.1–7.1.3 | A-05 mật khẩu; lỗi chung; quên MK OTP; đã mua chưa agent → A-06 |
| 7.2.1 · #50 | A-03 mời chỉ khi referrer ≥ Silver; A-06 chặn Copper |
| 7.2.2 | A-06 có họ tên/SĐT/email/ngân hàng/số TK; autofill |
| 7.2.3 | OTP 5', sai 3 lần → khóa tạm |
| 7.2.4 · 6.1.C-1 | ref_code sinh khi APPROVED, duy nhất; Copper mặc định |
| 7.2.5 | referrerId = order.sellerId bất kể thời gian |
| 7.2.6 | T&C bắt buộc; lưu version/at |
| 7.2.7 | trùng SĐT/email agent active → lỗi |
| 7.2.8 | quay lại sau Thoát vẫn autofill |
| 7.3.1–7.3.6, 7.3.10 | C-01 đủ khối; khoảng ngày tùy chọn; 4 thẻ hoa hồng; nút rút tiền chặn 1 lần/tháng; biểu đồ hoa hồng; F1 |
| 7.4.1 · 7.9.1 | D-00 riêng; 2 vai; D-10 chỉ HEAD |
| 7.5.1–7.5.5 | D-02 cột đủ; drawer cây 3 cấp + 3 lịch sử; lọc; khóa → link chết; export khớp |
| 7.6.1–7.6.5 · 7.9.3 · 7.9.4 | D-07 tiến trình 0/2 → 1/2 → Đã duyệt → Đã chi trả; lý do bắt buộc; cảnh báo vượt số dư; nút tự xác nhận 2 lần disabled; log |
| 7.7.1 | D-04 có UI: tên/giá/ảnh + bảng hoa hồng 6 hạng, phiên bản |
| 7.8.1–7.8.5 | D-05 3 trạng thái một chiều, summary tổng = N, lọc/tìm/rỗng, export theo lọc, phân trang 1.000+ |
| 7.9.2 | D-09 duyệt 2 lớp; Head tự chốt; người thứ 2 khác người thứ 1 |
| 6.1.C-3 · sheet 5 | Σ hoa hồng/đơn = 3.850.000; breakaway; khuyết Lithium → công ty; job giáng 1 bậc; nhảy cấp |
| 6.1.C-5 | bấm Thanh toán nhiều lần không sinh đơn |
| 8.1.C-4/5 | alias EEEEPPPP, bỏ dấu, 1 từ vẫn tạo; trùng → -2, -3 |

---

## 9. Điểm còn chờ xác nhận (đặt trong `CONFIG`, ghi chú `[cần xác nhận]` trên UI)

1. Ngưỡng hạng cộng dồn: 10/18/24/28/30 hay cách khác.
2. Giáng cấp có reset lũy kế không.
3. Điểm: 1 điểm = 1 VNĐ (04/09) vs ×10 (sheet 5); có redeem điểm để mua hàng không (Phase 1: không).
4. Đăng ký bị từ chối → được nộp lại? (mặc định: có).
5. Có giữ OTP khi mua & khi rút tiền không (ngoài yêu cầu; mặc định: giữ khi mua, bỏ khi rút).
6. Có giữ quy tắc 1 gói/SĐT + cấp ngoại lệ (BR-03/D-08)? (mặc định: tắt).
7. Nội dung T&C thật.
8. Khách mua qua link Copper: sau khi Copper lên Silver có được đăng ký? (mặc định: kiểm tra hạng tại thời điểm đăng ký → được).
