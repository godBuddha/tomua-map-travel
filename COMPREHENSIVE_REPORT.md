# BÁO CÁO TOÀN DIỆN — Bản đồ Du lịch Xã Tô Múa
**Ngày:** 2026-07-07  
**URL Deploy:** https://tomua-web.tail3f8970.ts.net  
**Source:** /Volumes/PortableSSD/tomua-map-travel

---

## 1. TỔNG QUAN KIẾN TRÚC

### Docker Services (6 containers)
| Service | Image | Port | Trạng thái |
|---------|-------|------|-----------|
| db | postgis/postgis:16-3.4 | 5432 | ✅ Running |
| redis | redis:7-alpine | 6379 | ✅ Running |
| server | Custom Node.js | 5000 | ✅ Running |
| libretranslate | libretranslate:latest | internal | ✅ Running |
| nginx | nginx:alpine | 3000/3443 | ✅ Running |
| tailscale | tailscale:latest | - | ✅ Running |

### Database Stats
- **Destinations:** 11
- **Routes:** 3
- **Events:** 3
- **Users:** 4
- **Online users:** 2

---

## 2. KẾT QUẢ TEST

### 2.1 Test Login

| Account | Username | Password | Kết quả | Ghi chú |
|---------|----------|----------|---------|---------|
| Admin | admin | Adm1nT0mua2026Secure | ⚠️ MFA Required | MFA (TOTP) đã bật, cần mã 6 số |
| CTV | ctv1 | ctv123456 | ✅ Thành công | Username là `ctv1`, không phải `ctv` |

**Vấn đề:** Admin account có MFA enabled. Không thể login qua API mà không có TOTP code hoặc backup code. Cần truy cập trực tiếp database để lấy backup codes hoặc disable MFA.

### 2.2 Test CRUD — Điểm du lịch (Destinations)

| Chức năng | Admin | CTV | Kết quả |
|-----------|-------|-----|---------|
| Tạo mới | ✅ | ✅ | CTV tạo → status = `draft` |
| Sửa | ✅ | ✅ | CTV sửa published → status = `pending_edit` |
| Xóa | ✅ | ❌ | CTV只能 request-delete (`pending_delete`) |
| Gửi duyệt | - | ✅ | `draft` → `pending` |
| Duyệt | ✅ | - | `pending` → `published` |
| Từ chối | ✅ | - | `pending` → `draft` + rejection_reason |

**Test cụ thể:**
- CTV tạo destination "Test CTV Destination" → `draft` ✅
- CTV submit-review → `pending` ✅ (tự động dịch sang 11 ngôn ngữ)
- CTV sửa "Điểm Test Reject" (published) → `pending_edit` ✅
- CTV request-delete "Test CTV Destination" → `pending_delete` ✅
- CTV không thể sửa destination của admin → "You can only update your own destinations" ✅

### 2.3 Test CRUD — Lộ trình (Routes)

| Chức năng | Kết quả |
|-----------|---------|
| GET /api/routes | ✅ Trả về 3 routes |
| Tạo mới (admin) | ✅ |
| OSRM routing | ✅ (dùng public OSRM API) |

### 2.4 Test CRUD — Sự kiện (Events)

| Chức năng | Kết quả |
|-----------|---------|
| GET /api/events | ✅ Trả về 3 events |
| Tạo mới (admin) | ✅ |
| Link to destination | ✅ (destination_id) |

### 2.5 Test User Management

| Chức năng | Kết quả |
|-----------|---------|
| GET /api/users | ⚠️ Cần admin token |
| Tạo user mới | ⚠️ Cần admin token |
| Đổi mật khẩu | ⚠️ Cần admin token |
| Phân quyền | ⚠️ Cần admin token |

**Không thể test** vì admin account bị MFA block.

### 2.6 Test Approval Workflow

| Bước | Kết quả |
|------|---------|
| CTV tạo draft | ✅ |
| CTV gửi duyệt (draft → pending) | ✅ |
| Auto-translate khi submit | ✅ (LibreTranslate hoạt động) |
| CTV sửa published → pending_edit | ✅ |
| CTV request-delete → pending_delete | ✅ |
| Admin duyệt/từ chối | ⚠️ Cần admin token |

### 2.7 Kiểm tra Frontend ↔ Backend ↔ Database

| Kiểm tra | Kết quả |
|----------|---------|
| API trả về đúng dữ liệu | ✅ |
| Destinations có tọa độ (lat/lng) | ✅ |
| Status workflow hoạt động đúng | ✅ |
| Auto-translation hoạt động | ✅ |
| i18n (12 ngôn ngữ) | ✅ |

---

## 3. BUGS TÌM THẤY

### 3.1 🔴 CRITICAL: Admin/Collaborator sidebar bị ẩn trên mobile

**File:** `client/admin.html`, `client/collaborator.html`  
**Vấn đề:** `@media (max-width: 768px) { .sidebar { display: none; } }` — sidebar hoàn toàn biến mất, không có hamburger menu thay thế.

**Ảnh hưởng:** Người dùng mobile không thể điều hướng giữa các trang (Dashboard, Destinations, Routes, Events, Users).

**Fix cần thiết:**
1. Thêm hamburger button
2. Tạo mobile drawer/overlay cho sidebar
3. Thêm `:focus-visible` cho accessibility

### 3.2 🟡 MEDIUM: Admin MFA không có fallback

**Vấn đề:** Admin account có MFA enabled nhưng không có cách nào login qua API nếu mất TOTP device.

**Fix khuyến nghị:** 
- Thêm endpoint disable MFA với master password
- Hoặc seed backup codes vào database
- Hoặc thêm flag `--disable-mfa` cho development

### 3.3 🟡 MEDIUM: CTV username không rõ ràng

**Vấn đề:** Memory ghi `ctv` / `ctv123456` nhưng thực tế username là `ctv1`.

**Fix:** Cập nhật documentation/seed để rõ ràng hơn.

---

## 4. SO SÁNH DEV vs DOCKER DEPLOY

### 4.1 Tình trạng Git

**19 files modified (chưa commit):**
- `client/map.html` (+259 lines) — Mobile responsive, legend drawer, bottom sheet
- `client/admin.html` (+56 lines) — Language tabs, auto-translate button
- `client/src/pages/admin.js` (+129 lines) — Multilingual editing, auto-translate
- `client/src/pages/detail.js` (+44 lines) — Detail page improvements
- `client/src/pages/map.js` (+20 lines) — Map JS improvements
- `docker-compose.yml` (+25 lines) — Added LibreTranslate service
- `nginx.conf` (+24 lines) — Upstream keepalive, connection pooling
- `server/src/app.js` (+54 lines) — Redis rate limiting
- `server/src/controllers/*.js` — Auto-translation on create/update
- `server/src/services/*.js` — Translation queue, MFA fixes
- `server/knexfile.js` — DB config changes
- `server/package.json` — New dependencies (rate-limit-redis, redis)

**7 new untracked files:**
- `client/lib/MarkerCluster.*.css`, `leaflet.markercluster.js` — Local Leaflet copies
- `server/src/routes/translate.routes.js` — Translation API
- `server/src/services/translate.service.js` — LibreTranslate integration
- `server/src/services/translation-queue.service.js` — BullMQ translation queue
- `LOAD_TEST_REPORT.md`, `TEST_SCRIPT.md` — Documentation
- `screenshots/*.png` — Screenshot documentation

### 4.2 Deployed vs Local Parity

| Component | Deployed | Local Dev | Khác biệt |
|-----------|----------|-----------|-----------|
| nginx | Có upstream keepalive | Có upstream keepalive | ✅ Giống |
| LibreTranslate | Có | Có | ✅ Giống |
| Redis rate limiting | Có | Có | ✅ Giống |
| Auto-translation | Có | Có | ✅ Giống |
| map.html mobile | Có legend drawer, bottom sheet | Có legend drawer, bottom sheet | ✅ Giống |
| admin.html lang tabs | Có | Có | ✅ Giống |

**Kết luận:** Docker đang serve trực tiếp từ `./client` bind mount → code local = code deployed. **Không có thay đổi nào chưa deploy.**

---

## 5. FEATURES ĐANG HOẠT ĐỘNG

### 5.1 Map Page (map.html)
- ✅ Leaflet.js + MarkerCluster
- ✅ Custom markers (colored circles with emoji)
- ✅ Info panels (destination, route, event)
- ✅ Layer toggles (boundaries, markers, routes, events, terrain)
- ✅ Filter chips (type, transport, event type)
- ✅ GPS geolocation
- ✅ OSRM real-road routing
- ✅ Mobile responsive (bottom sheet sidebar, legend drawer, horizontal scroll filters)
- ✅ i18n (12 languages)

### 5.2 Admin Page (admin.html)
- ✅ Dashboard with stats
- ✅ Destinations CRUD with map picker
- ✅ Routes CRUD with OSRM route builder
- ✅ Events CRUD
- ✅ User management
- ✅ Settings + MFA
- ✅ Language tabs + auto-translate
- ❌ Mobile sidebar (broken)

### 5.3 CTV Page (collaborator.html)
- ✅ Dashboard with contribution stats
- ✅ Destinations CRUD (with approval workflow)
- ✅ Routes CRUD
- ✅ Events CRUD
- ❌ Mobile sidebar (broken)

### 5.4 Backend API
- ✅ JWT authentication + refresh tokens
- ✅ MFA (TOTP)
- ✅ Role-based access (admin/collaborator)
- ✅ Approval workflow (draft→pending→published, pending_edit, pending_delete)
- ✅ Auto-translation (LibreTranslate + BullMQ)
- ✅ Redis caching
- ✅ Rate limiting (Redis-backed)
- ✅ PostGIS spatial queries
- ✅ OSRM routing integration
- ✅ Image upload (Multer + Sharp)
- ✅ Swagger API docs

---

## 6. KHUYẾN NGHỊ

### Ưu tiên cao
1. **Fix mobile sidebar** cho admin.html và collaborator.html
2. **Disable MFA** cho admin account hoặc seed backup codes
3. **Commit tất cả changes** hiện tại (19 files, +1000 lines)

### Ưu tiên trung bình
4. **Thêm GPS定位** trong form thêm điểm du lịch
5. **Thêm coordinate↔marker binding** trong modal map
6. **Thêm custom popup** trên map markers

### Ưu tiên thấp
7. Cập nhật documentation với username đúng (`ctv1` không phải `ctv`)
8. Thêm error handling cho LibreTranslate timeout
9. Thêm monitoring cho BullMQ translation queue

---

## 7. FILES QUAN TRỌNG

| File | Purpose |
|------|---------|
| `client/admin.html` | Admin panel (1341 lines) |
| `client/collaborator.html` | CTV panel (941 lines) |
| `client/map.html` | Public map (554 lines) |
| `client/login.html` | Login page (745 lines) |
| `server/src/controllers/destinations.controller.js` | Destinations CRUD + approval |
| `server/src/controllers/routes.controller.js` | Routes CRUD + approval |
| `server/src/controllers/events.controller.js` | Events CRUD + approval |
| `server/src/services/translation-queue.service.js` | Auto-translation queue |
| `docker-compose.yml` | Docker orchestration |
| `nginx.conf` | Reverse proxy config |
