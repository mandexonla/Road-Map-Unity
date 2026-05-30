# 🎤 Chuẩn Bị Phỏng Vấn Unity Developer

[⬅️ Interview Index](./README.md)

> Phỏng vấn game dev thường gồm: **coding test + Unity/C# knowledge + portfolio review + (Mid+) system design + behavioral**.

---

## 1. Các vòng phỏng vấn điển hình

```
1. Screening (CV + portfolio)          → portfolio tốt là chìa khóa
2. Coding test / Take-home assignment  → giải bài C# + task Unity nhỏ
3. Technical interview                 → kiến thức Unity/C#, hỏi sâu portfolio
4. System design (Mid+)                → "thiết kế hệ thống X"
5. Behavioral / culture fit            → teamwork, cách làm việc
6. (Đôi khi) gặp team / final          → —
```

---

## 2. Coding Test — luyện gì?

### C# / Thuật toán cơ bản
- Cấu trúc dữ liệu: array, list, dictionary, stack, queue.
- Thuật toán: tìm kiếm, sắp xếp, đệ quy, độ phức tạp Big-O cơ bản.
- Bài C# thực tế (không cần leetcode hard, nhưng nắm cơ bản vững).
- Luyện: LeetCode (easy/medium), HackerRank.

### Unity-specific task
- Take-home: "làm một mini-game/feature trong Unity" (vd: inventory, grid movement, simple AI).
- ⚠️ Họ chấm **code quality** (cấu trúc, đặt tên, pattern) không chỉ "chạy được".
- Làm sạch, có README, commit history rõ — như một mini-portfolio.

---

## 3. Câu hỏi kiến thức Unity/C# hay gặp

### Junior
- Vòng đời MonoBehaviour? `Awake` vs `Start`? `Update` vs `FixedUpdate`?
- `GetComponent` tốn kém không? Tối ưu thế nào?
- Coroutine là gì? Khác async/await?
- Prefab, ScriptableObject là gì? Khi nào dùng?
- Collision vs Trigger?
- Value type vs reference type (`struct` vs `class`)?

### Mid
- ScriptableObject dùng cho architecture thế nào?
- Object pooling — tại sao & cách làm?
- Giải thích GC trong Unity, cách giảm allocation?
- Design pattern bạn dùng & tại sao?
- Cách bạn debug perf issue? (Profiler workflow)
- DI là gì, giải vấn đề gì?
- Addressables vs Resources?

### Senior
- Thiết kế kiến trúc cho hệ thống lớn thế nào?
- Cách quản lý technical debt?
- Trade-off khi chọn DOTS/ECS?
- Cách bạn mentor & nâng team?
- Quyết định kỹ thuật khó nhất bạn từng làm? Tại sao?
- Cách bạn cân kỹ thuật vs deadline vs business?

> 💡 Đừng học vẹt. Hiểu **tại sao** — phỏng vấn viên giỏi sẽ hỏi sâu ("tại sao?", "khi nào không nên?").

---

## 4. System Design (Mid+) — rất quan trọng

Câu hỏi mẫu:
- "Thiết kế hệ thống Inventory cho RPG."
- "Thiết kế save/load linh hoạt, version được."
- "Thiết kế ability system cho game MOBA."
- "Thiết kế multiplayer lobby + matchmaking."
- "Thiết kế hệ thống quest data-driven."

**Cách trả lời tốt:**
1. **Làm rõ yêu cầu** (hỏi lại — họ thích bạn hỏi): scale? nền tảng? moddable?
2. **Vẽ kiến trúc** (data/logic/UI, các module, luồng data).
3. **Nêu trade-off** (cách A vs B, đánh đổi gì).
4. **Nghĩ về mở rộng, edge case, test.**
5. Cho thấy bạn nghĩ về **maintainability**, không chỉ "chạy được".

> 🎯 Họ đánh giá **tư duy & giao tiếp**, không phải đáp án "đúng" duy nhất.

---

## 5. Portfolio Review — show your thinking

Họ sẽ hỏi sâu về dự án của bạn:
- "Tại sao chọn kiến trúc này?"
- "Phần khó nhất là gì? Bạn giải quyết thế nào?"
- "Nếu làm lại, bạn đổi gì?"
- "Tối ưu phần nào? Đo thế nào?"

**Chuẩn bị:** với mỗi dự án, chuẩn bị kể được **một câu chuyện kỹ thuật** (vấn đề → cách tiếp cận → kết quả → bài học).

---

## 6. Behavioral — đừng xem nhẹ

- Cách bạn làm việc nhóm, xử lý bất đồng.
- Cách bạn nhận feedback / code review.
- Cách bạn học công nghệ mới.
- Lần bạn thất bại & học được gì.
- Dùng phương pháp **STAR** (Situation, Task, Action, Result).

> Game dev là teamwork. Thái độ học hỏi & dễ hợp tác đôi khi quan trọng hơn kỹ thuật top.

---

## 7. Checklist trước phỏng vấn

- [ ] Portfolio sẵn sàng, link chơi được, README ngon.
- [ ] Chuẩn bị 1 câu chuyện kỹ thuật cho mỗi dự án.
- [ ] Ôn câu hỏi Unity/C# theo level.
- [ ] (Mid+) Luyện 3-5 bài system design.
- [ ] Chuẩn bị câu hỏi NGƯỢC cho họ (về tech stack, quy trình, team — thể hiện sự quan tâm).
- [ ] Tìm hiểu công ty & game của họ (chơi thử game của họ!).
- [ ] Luyện behavioral với STAR.

---

## 8. Sau phỏng vấn

- Gửi follow-up cảm ơn (tùy văn hóa).
- Nếu rớt: xin feedback, ghi lại câu hỏi bí, ôn lại → lần sau mạnh hơn.
- Mỗi phỏng vấn là một lần luyện tập — đừng nản.

---

## 📚 Tài nguyên
- LeetCode/HackerRank (coding).
- "Cracking the Coding Interview" (nền tảng).
- Unity interview question lists (GitHub có nhiều bộ tổng hợp).
- Mock interview với bạn bè/cộng đồng.
- Đọc job description để biết họ cần gì → ôn trúng.

---

[⬅️ Portfolio](./portfolio.md) | [Market & Salary ➡️](./market-and-salary.md)
