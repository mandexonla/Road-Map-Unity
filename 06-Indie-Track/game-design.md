# 🎯 Game Design cho Indie Developer

[⬅️ Indie Index](./README.md)

> Là lập trình viên, bạn có lợi thế: **prototype nhanh**. Nhưng code giỏi không cứu được game không vui. Học design để biết **làm gì** chứ không chỉ **làm thế nào**.

---

## 1. Cốt lõi: cái gì làm game "vui"?

- **Core loop (vòng lặp cốt lõi):** chuỗi hành động người chơi lặp đi lặp lại (vd: bắn → nhặt đồ → mạnh hơn → bắn tiếp). Nếu loop không vui → game không vui.
- **Game feel ("juice"):** phản hồi tức thì làm hành động "đã tay" (xem [gameplay-systems.md](../05-Technical-Deep-Dives/gameplay-systems.md) phần Game Feel).
- **Risk/Reward, mastery, flow:** người chơi phải cảm thấy tiến bộ & thử thách vừa sức.
- **Player motivation:** họ chơi vì gì? (chinh phục, sáng tạo, thư giãn, cạnh tranh, khám phá, xã hội).

---

## 2. Các trụ cột thiết kế

| Trụ cột | Câu hỏi |
|---------|---------|
| **Core mechanic** | Hành động chính người chơi làm là gì? Nó có vui khi lặp lại? |
| **Goals & feedback** | Người chơi biết phải làm gì? Có nhận phản hồi rõ? |
| **Progression** | Người chơi tiến bộ thế nào? Mở khóa gì? |
| **Difficulty curve** | Độ khó tăng có hợp lý? Có "tutorial" tự nhiên? |
| **Balance** | Các lựa chọn có cân bằng? Không có "lựa chọn đúng duy nhất"? |

---

## 3. Quy trình thiết kế của lập trình viên indie

```
Ý tưởng → Prototype gameplay thô (xấu, nhanh) → TEST: có vui không?
   │                                              │
   │  ← Nếu KHÔNG vui: đổi/bỏ, đừng tiếc            │
   ▼                                              ▼
Nếu VUI → mở rộng, thêm content, polish, ship
```

> 🔑 **"Find the fun" trước.** Dành 1-2 tuần làm prototype xấu chỉ để kiểm tra core loop có vui. Đừng làm art/menu/polish trước khi biết game vui.

---

## 4. Prototype & Iteration

- **Prototype nhanh & xấu:** dùng hình hộp, không art. Mục tiêu test cơ chế.
- **Playtest sớm & thường xuyên:** cho người khác chơi (không hướng dẫn), quan sát họ bối rối ở đâu.
- **Iterate:** sửa dựa trên quan sát thật, không dựa trên cảm giác của mình.
- **Kill your darlings:** sẵn sàng bỏ tính năng bạn yêu nếu nó không phục vụ game.

---

## 5. Thiết kế thực dụng cho Indie

- **Một cơ chế hay > mười cơ chế tầm thường.** Đào sâu một ý tưởng độc đáo.
- **Constraint sinh sáng tạo:** giới hạn (1 nút, 1 màn hình, 1 màu) thường tạo game hay.
- **Đứng trên vai genre có sẵn:** đổi mới 1 thứ trên công thức đã được chứng minh, đừng phát minh lại tất cả.
- **Onboarding:** 30 giây đầu quyết định người chơi ở lại hay bỏ.
- **"Feel" > "realism":** game vui hơn game "đúng vật lý".

---

## 6. Tài liệu thiết kế (vừa đủ)

- **One-page design:** game gì, cho ai, core loop, điểm độc đáo (USP) — 1 trang.
- **GDD nhẹ:** đừng viết GDD 100 trang cho game indie. Viết đủ để bạn & team không lạc hướng.
- Với indie nhỏ: prototype + ghi chú ngắn thường tốt hơn tài liệu dày.

---

## 7. Học design từ đâu

- **Game Maker's Toolkit** (Mark Brown — YouTube) — ⭐ phân tích design tuyệt vời.
- **"The Art of Game Design" — Jesse Schell** (sách kinh điển, "100 lenses").
- **"A Theory of Fun" — Raph Koster.**
- **Chơi game có chủ đích:** phân tích game bạn chơi — tại sao nó vui? cơ chế gì? loop gì?
- **GDC Design talks** (YouTube).
- **Tham gia game jam:** cách học design nhanh nhất (ép bạn ra quyết định design liên tục).

---

## 🎯 Thực hành

```
Junior:  Làm 3-5 prototype "find the fun" · phân tích 10 game yêu thích · game jam
Mid:     Ship 1 game nhỏ có core loop chặt · playtest có hệ thống · iterate
Senior:  Thiết kế game có chiều sâu/độc đáo · cân bằng phức tạp · USP rõ ràng
```

---

[⬅️ Indie Index](./README.md) | [Art & Audio ➡️](./art-and-audio.md)
