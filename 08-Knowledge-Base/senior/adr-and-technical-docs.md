# 📝 ADR & Tài Liệu Kỹ Thuật

[⬅️ Knowledge Base](../README.md) | Liên quan: [Technical Debt & Architecture](./technical-debt-and-architecture.md) · [Senior level](../../04-Senior/README.md)

> Senior không chỉ ra quyết định kỹ thuật — họ **ghi lại lý do** để team hiểu, để 6 tháng sau không ai hỏi "sao hồi đó làm vậy?", và để quyết định được phản biện đúng cách.

---

## 1. Bản chất

**Tài liệu kỹ thuật ở mức Senior không phải "viết cho có" — nó là công cụ giao tiếp, ra quyết định, và bảo tồn tri thức.** Đặc biệt **ADR (Architecture Decision Record)**: một ghi chép ngắn về *một quyết định kiến trúc quan trọng, lý do, và đánh đổi.*

> 🔑 Giá trị thật: code cho biết **"làm gì"**, nhưng không cho biết **"tại sao chọn cách này thay vì cách kia"**. Cái "tại sao" đó (bối cảnh, đánh đổi, phương án đã loại) là tri thức quý nhất — và dễ mất nhất khi người ra quyết định rời đi. Tài liệu giữ nó lại.

---

## 2. Vấn đề nó giải quyết

- **"Sao hồi đó làm vậy?"** — 6 tháng sau không ai nhớ lý do, sợ đụng vào, hoặc lặp lại sai lầm đã cân nhắc và bác bỏ.
- **Quyết định trong đầu một người** — người đó nghỉ → tri thức biến mất.
- **Tranh luận lặp lại** — cùng một câu hỏi kiến trúc bị bàn đi bàn lại vì không ai ghi kết luận.
- **Onboarding chậm** — người mới không hiểu bức tranh & lý do hệ thống.

---

## 3. ADR — cấu trúc (ngắn gọn là sức mạnh)

Một ADR tốt **ngắn (1 trang)**, gồm:
```markdown
# ADR-005: Dùng Addressables thay Resources cho asset loading

## Bối cảnh (Context)
Game mobile, RAM hạn chế, cần update nội dung sau ra mắt.
Resources nạp hết vào build, không unload chọn lọc → phình RAM.

## Quyết định (Decision)
Dùng Addressables cho mọi asset động (nhân vật, level, skin).

## Đánh đổi / Hệ quả (Consequences)
+ Kiểm soát RAM, hỗ trợ remote content/DLC.
+ Giảm build size ban đầu.
- Phức tạp hơn, phải quản lý Release (rủi ro leak).
- Cần setup build pipeline & test trên thiết bị.

## Phương án đã cân nhắc & loại (Alternatives)
- Resources: loại vì không unload chọn lọc.
- AssetBundle thủ công: loại vì quản lý dependency quá thủ công.

## Trạng thái: Accepted (2026-01) | thay thế ADR-002
```
> Lưu **"phương án đã loại & vì sao"** — phần này ngăn team lặp lại tranh luận cũ.

---

## 4. Các loại tài liệu kỹ thuật Senior viết

| Loại | Mục đích | Độ dài |
|------|----------|--------|
| **ADR** | Ghi một quyết định kiến trúc + lý do | 1 trang |
| **Design Doc / RFC** | Đề xuất thiết kế hệ thống TRƯỚC khi code, lấy ý kiến | Vài trang |
| **README / Onboarding** | Cách build, chạy, kiến trúc tổng quan | Vừa |
| **System overview / sơ đồ** | Bức tranh các module & luồng data | Sơ đồ + chú thích |
| **Runbook / postmortem** | Xử lý sự cố / bài học sau sự cố | Theo nhu cầu |
| **API/Tool docs** | Cách dùng framework/tool nội bộ | Theo nhu cầu |

### RFC / Design Doc — viết TRƯỚC khi code hệ thống lớn
Với hệ thống lớn, Senior viết design doc đề xuất hướng tiếp cận **trước**, để team phản biện sớm (rẻ hơn sửa code sau). Gồm: vấn đề, mục tiêu, phương án, đánh đổi, rủi ro, kế hoạch test.

---

## 5. Nguyên tắc viết tài liệu kỹ thuật tốt

- **Viết cho người đọc, không cho mình:** giả định người đọc không có context trong đầu bạn.
- **Tập trung "tại sao", không chỉ "cái gì":** code đã nói "cái gì"; tài liệu nói "tại sao".
- **Ngắn & sống được:** tài liệu quá dài không ai đọc/cập nhật → chết. Ngắn, đúng trọng tâm.
- **Đặt gần code:** ADR/doc trong repo (markdown) → version cùng code, dễ tìm.
- **Sơ đồ khi hợp:** một sơ đồ luồng data hơn ngàn lời.
- **Cập nhật hoặc đánh dấu lỗi thời:** tài liệu sai tệ hơn không có. Đánh dấu "superseded" khi thay.

---

## 6. Giao tiếp với non-tech (kỹ năng Senior)

Tài liệu/giải thích cho PM, designer, sếp cần **ngôn ngữ của họ**:
- Diễn đạt đánh đổi kỹ thuật bằng **tác động business** ("không làm X giờ thì mỗi feature sau chậm 30%, hoặc rủi ro crash mobile tăng").
- Tránh jargon; dùng ẩn dụ, sơ đồ.
- Trình bày **lựa chọn + hệ quả**, để họ quyết định có thông tin.

---

## 7. Lỗi thường gặp

- ❌ Không viết gì → tri thức trong đầu một người, mất khi họ đi.
- ❌ Viết quá dài/chi tiết → không ai đọc/cập nhật → chết.
- ❌ Chỉ tả "cái gì" (lặp lại code) mà không "tại sao".
- ❌ Tài liệu lỗi thời không đánh dấu → gây hiểu sai (tệ hơn không có).
- ❌ Đặt tài liệu xa code (wiki riêng ít ai vào) thay vì trong repo.
- ❌ Viết cho bản thân, giả định người đọc có context của mình.
- ❌ Giải thích cho non-tech bằng jargon → không ai hiểu, quyết định sai.

---

## 8. Best practices

- ✅ Ghi **ADR** cho mọi quyết định kiến trúc khó đảo — ngắn, gồm bối cảnh/quyết định/đánh đổi/phương án loại.
- ✅ Viết **design doc/RFC trước** khi xây hệ thống lớn → phản biện sớm.
- ✅ Tài liệu **ngắn, tập trung "tại sao", sống được, gần code** (markdown trong repo).
- ✅ Dùng sơ đồ cho kiến trúc & luồng data.
- ✅ Cập nhật hoặc đánh dấu lỗi thời.
- ✅ Giao tiếp non-tech bằng **tác động business**, không jargon.
- ✅ Coi viết tài liệu là **đòn bẩy** (nhân tri thức ra cả team), không phải việc phụ.

---

## 9. Liên kết
- [Technical Debt & Architecture](./technical-debt-and-architecture.md) — ghi lại quyết định & đánh đổi.
- [Senior level](../../04-Senior/README.md) — leadership, giao tiếp, business sense.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — nội dung kiến trúc cần tài liệu hóa.
- [Interview & Portfolio](../../07-Interview-and-Portfolio/portfolio.md) — design doc trong portfolio.

---

[⬅️ Technical Debt & Architecture](./technical-debt-and-architecture.md) | [Knowledge Base ➡️](../README.md)
