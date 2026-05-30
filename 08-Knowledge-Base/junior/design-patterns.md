# 🎨 Design Patterns — Tổng Quan & Triết Lý

[⬅️ Knowledge Base](../README.md) | Các pattern: [Singleton](./singleton.md) · [Observer/Event](./observer-event-system.md) · [State Machine](./state-machine.md) · [Object Pool](./object-pooling.md) · [Factory & Strategy](./factory-and-strategy.md) · [Command](./command-pattern.md)

> ⚠️ **Đọc trang này TRƯỚC khi học từng pattern.** Hiểu sai triết lý → lạm dụng pattern → code TỆ HƠN không dùng. Pattern là thuốc, không phải kẹo.

---

## 1. Bản chất: Pattern là gì?

**Design pattern là "giải pháp đã được kiểm chứng cho một VẤN ĐỀ lặp đi lặp lại".** Nó không phải code copy-paste, mà là **một cách tư duy/cấu trúc** để giải một loại vấn đề.

> 🔑 Điều quan trọng nhất: **Pattern gắn với VẤN ĐỀ, không phải với việc "trông pro".** Học pattern = học *"vấn đề nào → pattern nào"*, không phải học thuộc cách viết. Dùng pattern khi gặp đúng vấn đề nó giải; dùng sai chỗ làm code phức tạp vô ích.

---

## 2. Vì sao pattern dễ bị LẠM DỤNG (đọc kỹ)

Người mới học pattern thường mắc bẫy: thấy pattern hay quá → nhét vào mọi nơi. Hậu quả:
- Game jam đơn giản nhưng có 5 factory, 10 interface, abstract chồng abstract.
- Code khó đọc hơn nếu viết thẳng.
- Tốn thời gian "kiến trúc" thay vì làm game.

> 🎯 **Quy tắc vàng:** Đừng hỏi *"dùng pattern nào?"*. Hãy hỏi *"mình đang gặp vấn đề gì?"*. Nếu không có vấn đề rõ ràng → **không dùng pattern**. Code đơn giản chạy được luôn thắng pattern phức tạp không cần thiết (KISS + YAGNI, xem [Clean Code](./clean-code.md)).

---

## 3. Bản đồ: Vấn đề → Pattern

| Bạn đang gặp vấn đề... | Pattern phù hợp | Trang |
|------------------------|-----------------|-------|
| Cần đúng **một** thực thể truy cập toàn cục (manager) | **Singleton** ⚠️ | [singleton.md](./singleton.md) |
| Nhiều thứ cần **phản ứng** khi một sự kiện xảy ra | **Observer / Event** | [observer-event-system.md](./observer-event-system.md) |
| Object có **nhiều trạng thái** với hành vi khác nhau (AI, player) | **State Machine** | [state-machine.md](./state-machine.md) |
| Tạo/hủy object **liên tục** gây lag (đạn, hiệu ứng) | **Object Pool** | [object-pooling.md](./object-pooling.md) |
| Tạo object phức tạp **theo điều kiện/loại** | **Factory** | [factory-and-strategy.md](./factory-and-strategy.md) |
| Cần **đổi thuật toán/hành vi** linh hoạt lúc chạy | **Strategy** | [factory-and-strategy.md](./factory-and-strategy.md) |
| Cần **đóng gói hành động** (undo, replay, input buffer) | **Command** | [command-pattern.md](./command-pattern.md) |
| Tách **UI khỏi logic & data** | **MVC/MVP/MVVM** | [UI Architecture (Mid)](../mid/ui-architecture-mvc-mvvm.md) |

---

## 4. Phân loại pattern (tham khảo — "Gang of Four")

| Nhóm | Giải quyết | Ví dụ |
|------|-----------|-------|
| **Creational** (khởi tạo) | Cách tạo object | Factory, Object Pool, Singleton, Builder |
| **Structural** (cấu trúc) | Cách ghép object/class | Adapter, Decorator, Composite, Facade |
| **Behavioral** (hành vi) | Cách object tương tác | Observer, State, Strategy, Command |

> 📌 Bạn không cần thuộc lòng 23 pattern GoF. Trong game Unity, **~7-8 pattern** ở mục 3 chiếm phần lớn giá trị thực tế.

---

## 5. Pattern trong ngữ cảnh Unity (lưu ý đặc thù)

Unity đã "tích hợp sẵn" tinh thần một số pattern → đôi khi **không cần** tự viết:
- **Component pattern** — đã có sẵn (GameObject + Component, xem [GameObject & Component](../intern/gameobject-component.md)).
- **Observer** — `event` / `UnityEvent` / SO event channel.
- **Update Method / Game Loop** — chính là `Update()`.
- **Prototype** — chính là [Prefab](../intern/prefab.md) + Instantiate.

> Hiểu điều này tránh "phát minh lại bánh xe" — nhiều pattern sách dạy đã có cơ chế Unity tương ứng.

---

## 6. Cách HỌC pattern đúng

1. **Gặp vấn đề thật trước** (code rối vì lý do cụ thể).
2. Nhận ra "à, đây là vấn đề mà pattern X giải".
3. Hiểu **pattern X giải vấn đề đó NHƯ THẾ NÀO** (không học vẹt cú pháp).
4. Áp dụng, quan sát code có sạch hơn không.
5. Học **nhược điểm & khi nào KHÔNG dùng** (quan trọng ngang khi nào dùng).

---

## 7. Lỗi thường gặp (toàn cục)

- ❌ Học pattern để "khoe" → nhồi vào mọi nơi → over-engineering.
- ❌ Lạm dụng Singleton (xem [singleton.md](./singleton.md) — pattern bị lạm dụng nhất).
- ❌ Áp pattern khi chưa có vấn đề pattern giải.
- ❌ Copy cú pháp pattern mà không hiểu vấn đề gốc.
- ❌ Cho rằng "nhiều pattern = code tốt". Sai. **Đơn giản phù hợp = code tốt.**

---

## 8. Best practices

- ✅ Bắt đầu từ **vấn đề**, không từ **pattern**.
- ✅ Dùng pattern khi nó làm code **đơn giản hơn**, không phức tạp hơn.
- ✅ Học cả **nhược điểm** & **khi nào không dùng** mỗi pattern.
- ✅ Ưu tiên cơ chế Unity có sẵn trước khi tự viết pattern.
- ✅ Prototype/jam → ít pattern. Production sống lâu → đầu tư cấu trúc hợp lý.
- ✅ Đọc **"Game Programming Patterns" (Nystrom)** — miễn phí, đúng ngữ cảnh game.

---

## 9. Liên kết
- Các pattern cụ thể: [Singleton](./singleton.md), [Observer/Event](./observer-event-system.md), [State Machine](./state-machine.md), [Object Pool](./object-pooling.md), [Factory & Strategy](./factory-and-strategy.md), [Command](./command-pattern.md).
- [Clean Code](./clean-code.md) — KISS/YAGNI chống lạm dụng pattern.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — pattern trong bức tranh kiến trúc lớn.
- [SOLID](../mid/solid-principles.md) — nguyên tắc nền dưới các pattern.

---

[⬅️ ScriptableObject](./scriptableobject.md) | [Singleton ➡️](./singleton.md)
