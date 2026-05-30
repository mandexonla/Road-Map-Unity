# 🌿 Level 2: JUNIOR Developer

[⬅️ Về trang chủ](../README.md) | [Skills](./skills.md) · [Projects](./projects.md) · [Resources](./resources.md) · [Checklist](./checklist.md)

> ⏱️ **Thời gian:** 6-12 tháng (toàn thời gian)
> 🎯 **Mục tiêu cuối level:** Nhảy được vào codebase có sẵn của người khác, làm feature và fix bug mà không phá vỡ thứ khác.

---

## 1. Bạn là ai ở level này?

Bạn đã làm được game nhỏ một mình. Giờ mục tiêu là trở thành **lập trình viên đi làm được**:
- Code **người khác đọc hiểu được** (không chỉ "chạy là được").
- Hiểu và áp dụng **design pattern** cơ bản.
- Biết **đọc code người khác** và làm việc trong codebase chung.
- Bắt đầu quan tâm **chất lượng, cấu trúc, hiệu năng**, không chỉ "chạy".

> 🔑 Bước nhảy lớn nhất từ Intern → Junior: từ **"code cho máy chạy"** sang **"code cho người đọc"**.

---

## 2. Tư duy quan trọng nhất ở Junior

> **Code được đọc nhiều hơn được viết. Viết cho người sau (kể cả bạn 3 tháng sau).**

Và:

> **Học cách HỎI và NHẬN feedback.** Code review là bạn, không phải kẻ thù. Mỗi comment là một bài học.

---

## 3. Lộ trình học trong level

```
Tháng 1-2:  C# trung cấp (interface, delegate/event, properties, LINQ cơ bản, generics)
Tháng 2-3:  Clean code, đặt tên, tách trách nhiệm (SRP), refactor
Tháng 3-5:  Design patterns thực tế (Singleton, Observer/Event, State, Object Pool, Factory)
Tháng 4-6:  Hệ thống Unity sâu hơn (ScriptableObject, Animator nâng cao, New Input System, UI nâng cao)
Tháng 6-8:  Profiler cơ bản, tối ưu sơ cấp, build đa nền tảng
Tháng 7-12: Dự án vừa (game có nhiều hệ thống) + đóng góp vào project có sẵn / open source
```

---

## 4. Phạm vi kiến thức (tóm tắt)

| Mảng | Cần đạt được |
|------|--------------|
| **C# trung cấp** | Interface, abstract, delegate, event, Action/Func, properties, generics, LINQ cơ bản, `try/catch` |
| **Clean Code** | Đặt tên tốt, SRP, hàm ngắn, tránh code lặp (DRY), refactor |
| **Design Patterns** | Singleton, Observer/Event, State, Object Pool, Factory, Command (cơ bản) |
| **ScriptableObject** | Lưu data, cấu hình, event channel — cực quan trọng |
| **Architecture cơ bản** | Tách logic khỏi MonoBehaviour, quản lý dependency thủ công |
| **Animator** | State machine, blend tree, parameters, transitions |
| **Input System (mới)** | Action map, binding, hỗ trợ nhiều thiết bị |
| **UI nâng cao** | Layout, anchor, responsive, UI cho nhiều độ phân giải |
| **Save/Load** | PlayerPrefs, JSON serialize, save file |
| **Profiler** | Tìm chỗ chậm cơ bản, hiểu CPU/GPU/Memory cơ bản |
| **Quy trình** | Git nâng cao (branch, merge, PR, conflict), code review, task management |

Chi tiết: [skills.md](./skills.md).

---

## 5. ✅ Cách đánh giá ĐÚNG bạn đã qua Junior

Bạn qua Junior khi:

- ✅ Được giao một **task rõ ràng trong codebase có sẵn** và làm xong mà không phá vỡ phần khác.
- ✅ Code của bạn được người khác **đọc hiểu mà không cần bạn giải thích**.
- ✅ Tự **tìm và fix bug** ở mức trung bình (không chỉ bug đơn giản).
- ✅ Áp dụng được **ít nhất 3-4 design pattern** đúng ngữ cảnh (không lạm dụng).
- ✅ Dùng **Profiler** tìm được nguyên nhân lag cơ bản.
- ✅ Hiểu và dùng **ScriptableObject** cho data/config.
- ✅ Tham gia code review (nhận và bắt đầu cho feedback).

👉 Chi tiết: [checklist.md](./checklist.md).

> 🧪 **Bài test:** Cho bạn một dự án Unity nhỏ-vừa của người khác (vd open source game), yêu cầu "thêm tính năng X" (vd: thêm hệ thống combo, hoặc thêm loại kẻ địch). Bạn đọc hiểu code và làm được không? Nếu CÓ → sẵn sàng lên Mid.

---

## 6. Lỗi thường gặp ở Junior

| Lỗi | Cách tránh |
|-----|-----------|
| Lạm dụng Singleton cho mọi thứ | Hiểu khi nào cần, khi nào hại (xem [architecture.md](../05-Technical-Deep-Dives/architecture.md)) |
| Nhồi mọi logic vào 1 script khổng lồ ("God class") | Tách trách nhiệm (SRP), mỗi class một việc |
| Over-engineering (làm phức tạp quá mức cần thiết) | KISS — giải pháp đơn giản nhất chạy được trước |
| Copy pattern mà không hiểu vấn đề nó giải | Học vấn đề trước, pattern sau |
| Sợ code review / tự ái khi bị chê code | Coi feedback là quà tặng để lên trình |
| `Update()` chứa `GetComponent`/`Find` mỗi frame | Cache reference, hiểu chi phí (xem [performance.md](../05-Technical-Deep-Dives/performance.md)) |

---

## 7. Bắt đầu nhánh Indie & Technical

Từ Junior, bạn nên:
- 🎨 Bắt đầu đọc [06-Indie-Track](../06-Indie-Track/README.md) — game design cơ bản.
- 🔧 Bắt đầu đọc [05-Technical-Deep-Dives](../05-Technical-Deep-Dives/README.md) — performance & architecture cơ bản.

---

[⬅️ Về trang chủ](../README.md) | [Skills ➡️](./skills.md)
