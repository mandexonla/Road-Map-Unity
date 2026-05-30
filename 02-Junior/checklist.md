# ✅ Junior — Checklist Tự Đánh Giá

[⬅️ Resources](./resources.md) | [Lên Mid-Level ➡️](../03-Mid-Level/README.md)

> Cần tick ~85% và làm được "bài test" để tự tin lên Mid.

---

## C# Trung cấp
- [ ] Dùng interface để giảm phụ thuộc (`IDamageable`, `IInteractable`).
- [ ] Dùng abstract class đúng chỗ.
- [ ] Dùng delegate, event, Action/Func thành thạo.
- [ ] Viết generic class/method (`Pool<T>`).
- [ ] Dùng LINQ cơ bản (và biết khi nào KHÔNG nên dùng).
- [ ] Hiểu và xử lý exception đúng chỗ.

## Clean Code
- [ ] Đặt tên rõ ràng, nhất quán trong cả dự án.
- [ ] Áp dụng SRP — mỗi class một trách nhiệm.
- [ ] Tránh code lặp (DRY), biết khi nào tách hàm.
- [ ] Refactor được code cũ mà không làm hỏng.
- [ ] Tránh được "God class" và hàm quá dài.

## Design Patterns
- [ ] Áp dụng đúng Singleton (và biết khi nào KHÔNG dùng).
- [ ] Xây dựng Event/Observer system.
- [ ] Implement State Machine cho AI hoặc player.
- [ ] Implement Object Pool.
- [ ] Dùng ít nhất 1 trong: Factory / Command / Strategy.
- [ ] Giải thích được pattern giải vấn đề gì (không chỉ "cách làm").

## ScriptableObject
- [ ] Dùng SO cho data/config (enemy, weapon, level).
- [ ] Hiểu lợi ích tách data khỏi logic.
- [ ] (Bonus) Dùng SO làm event channel.

## Hệ thống Unity
- [ ] Animator: state machine + blend tree + parameters.
- [ ] New Input System: action map, hỗ trợ nhiều thiết bị.
- [ ] UI responsive cho nhiều độ phân giải.
- [ ] Save/Load bằng JSON + PlayerPrefs.
- [ ] Scene management, audio management.

## Hiệu năng
- [ ] Dùng Profiler tìm được nguyên nhân lag cơ bản.
- [ ] Cache component, tránh Find/GetComponent trong Update.
- [ ] Hiểu và giảm GC allocation trong hot path.
- [ ] Hiểu Draw Call & batching cơ bản.

## Quy trình & teamwork
- [ ] Git: branch, merge, rebase, giải quyết conflict, PR.
- [ ] Commit message rõ ràng, có quy ước.
- [ ] Đọc hiểu code người khác trong codebase có sẵn.
- [ ] Nhận và cho code review một cách xây dựng.
- [ ] Hiểu Agile/Scrum cơ bản, ước lượng task nhỏ.

## Dự án (bằng chứng)
- [ ] Hoàn thành Project 1 (game nhiều hệ thống, code sạch).
- [ ] Hoàn thành Project 2 (đóng góp vào codebase có sẵn).
- [ ] Portfolio có ít nhất 1 dự án "ngon" với README chuyên nghiệp.
- [ ] (Bonus) Đã làm một editor tool nhỏ.

---

## 🧪 Bài test tốt nghiệp Junior

> **Đề:** Cho bạn một dự án Unity của người khác (vd open source). Yêu cầu:
> *"Thêm hệ thống X (vd: combo counter, hoặc loại enemy mới có AI khác, hoặc hệ thống nâng cấp vũ khí) — phải tuân theo cấu trúc code có sẵn, dùng pattern phù hợp, không phá vỡ tính năng khác."*
>
> Bạn đọc hiểu codebase và làm được trong **vài ngày** không?
> - ✅ **CÓ** → Sẵn sàng lên [Mid-Level](../03-Mid-Level/README.md)!
> - ❌ **CHƯA** → Làm thêm Project 2, đọc thêm code người khác.

---

## 📈 Tự chấm điểm

| Mức tick | Kết luận |
|----------|----------|
| < 60% | Giữa Junior, làm thêm dự án có hệ thống |
| 60-85% | Tập trung phần yếu (thường là pattern/architecture) |
| > 85% + qua bài test | ✅ Sẵn sàng lên Mid |

> ⚠️ Junior → Mid là bước **rất quan trọng và khó**. Đừng vội. Nền vững ở đây quyết định bạn có thành Senior tốt sau này không.

---

[⬅️ Resources](./resources.md) | [🎉 Lên Mid-Level ➡️](../03-Mid-Level/README.md)
