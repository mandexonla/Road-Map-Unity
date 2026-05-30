# 🧩 Assembly Definitions (asmdef)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Architecture](../../05-Technical-Deep-Dives/architecture.md) · [Unit Testing](./unit-testing.md)

---

## 1. Bản chất

**Assembly Definition (.asmdef) chia code của bạn thành các "assembly" (đơn vị biên dịch) riêng biệt, thay vì tất cả nằm chung một khối.**

Mặc định, **mọi script** trong project được biên dịch vào một assembly khổng lồ (`Assembly-CSharp.dll`). asmdef cho phép tách thành nhiều assembly nhỏ (`Game.Core.dll`, `Game.UI.dll`, `Game.Enemies.dll`...).

> 🔑 Đây không phải "tổ chức thư mục cho đẹp" — nó thay đổi **cách code biên dịch và phụ thuộc lẫn nhau**. Hai lợi ích lớn: **biên dịch nhanh hơn** (chỉ build lại assembly thay đổi) và **kiểm soát phụ thuộc** (ranh giới rõ giữa các module).

---

## 2. Vấn đề nó giải quyết

### Vấn đề A: Thời gian biên dịch (compile time)
Mọi script chung một assembly → sửa **một** file → Unity biên dịch lại **toàn bộ** code → chờ lâu (dự án lớn: hàng chục giây mỗi lần sửa). Với asmdef, sửa file trong `Game.UI` → chỉ `Game.UI.dll` biên dịch lại → **nhanh hơn nhiều**.

### Vấn đề B: Kiểm soát phụ thuộc (dependency)
Một khối code → mọi thứ gọi được mọi thứ → coupling hỗn loạn, không có ranh giới. asmdef **buộc khai báo** assembly nào phụ thuộc assembly nào:
```
Game.Core      (không phụ thuộc ai)
   ▲
Game.Enemies   (phụ thuộc Core)
   ▲
Game.UI        (phụ thuộc Core, KHÔNG được phụ thuộc Enemies nếu không khai báo)
```
→ Ngăn phụ thuộc lộn xộn (vd UI không nên dính trực tiếp logic enemy). Ranh giới kiến trúc trở nên **được enforce bởi compiler**, không chỉ "quy ước".

---

## 3. Cách hoạt động

- Tạo file `.asmdef` trong một thư mục → **mọi script trong thư mục đó (và con)** thuộc assembly này.
- Khai báo **References** (assembly này được phép dùng assembly nào).
- Code chỉ gọi được code ở assembly mà nó **tham chiếu** → nếu không khai báo, **không** gọi được (lỗi biên dịch) → đó là điểm mạnh (kiểm soát).

### asmdef cho Test
Đây là lý do phổ biến đầu tiên nhiều người gặp asmdef: **Unity Test Framework cần asmdef riêng** cho thư mục test (tham chiếu code cần test + thư viện test). Xem [Unit Testing](./unit-testing.md).

---

## 4. Ứng dụng thực tế

- **Tăng tốc compile** trong dự án lớn (chia module → build lại ít).
- **Enforce ranh giới kiến trúc:** Core / Gameplay / UI / Networking tách bạch, phụ thuộc rõ ràng.
- **Package nội bộ:** đóng gói module tái dùng giữa dự án (xem [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md)).
- **Test assembly:** cô lập test.
- **Platform-specific code:** assembly chỉ build cho nền tảng nhất định.
- **Plugin/third-party:** cô lập code bên thứ ba.

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Compile nhanh hơn (build lại chọn lọc) | Setup & quản lý reference thêm việc |
| Enforce ranh giới phụ thuộc (kiến trúc) | Chia quá nhỏ → quản lý reference rối |
| Cô lập module/test/platform | Refactor ranh giới assembly tốn công |
| Nền cho package nội bộ | Over-engineer cho dự án nhỏ |

---

## 6. Lỗi thường gặp

- ❌ Chia assembly **quá sớm / quá nhỏ** cho dự án nhỏ → quản lý reference phiền hơn lợi ích.
- ❌ Tạo **phụ thuộc vòng** (A→B và B→A) → lỗi biên dịch. Thiết kế phụ thuộc một chiều (dùng interface/event để phá vòng).
- ❌ Quên thêm reference → code "không thấy" class ở assembly khác (tưởng lỗi code, thực ra thiếu reference).
- ❌ Đặt mọi thứ vào một asmdef khổng lồ → mất lợi ích.
- ❌ Không hiểu asmdef là lý do test/một số code "không compile".

---

## 7. Best practices

- ✅ Dùng asmdef khi dự án **đủ lớn** để compile time hoặc ranh giới phụ thuộc thành vấn đề (thường từ Mid trở đi).
- ✅ Chia theo **ranh giới kiến trúc có nghĩa** (Core, Gameplay, UI, Net), không vụn vặt.
- ✅ Giữ phụ thuộc **một chiều**, tránh vòng (dùng interface/event để phá vòng).
- ✅ `Game.Core` không phụ thuộc gì; các module cấp cao phụ thuộc Core.
- ✅ Dùng asmdef riêng cho test (chuẩn của Test Framework).
- ✅ Dự án nhỏ/prototype → chưa cần, đừng over-engineer.

---

## 8. Liên kết
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — ranh giới module, layering.
- [Unit Testing](./unit-testing.md) — test cần asmdef.
- [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md) — package nội bộ (UPM).
- [Senior: kiến trúc hệ thống lớn](../../04-Senior/skills.md).

---

[⬅️ Unit Testing](./unit-testing.md) | [Knowledge Base ➡️](../README.md)
