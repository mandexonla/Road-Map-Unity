# 🛠️ Intern — Dự Án Thực Hành

[⬅️ Skills](./skills.md) | [Resources ➡️](./resources.md)

> Quy tắc: **Mỗi dự án phải HOÀN THÀNH** (start → play → win/lose → restart). Làm dở không tính.

---

## 🎯 Dự án bắt buộc (làm theo thứ tự)

### Project 1: Pong hoặc Flappy Bird ⭐ (Tuần 6-8)
**Mục tiêu:** Làm quen input, vật lý 2D, va chạm, vòng lặp game.

**Yêu cầu hoàn thành:**
- [ ] Nhân vật/paddle di chuyển theo input.
- [ ] Vật lý va chạm hoạt động.
- [ ] Có điểm số hiển thị (UI).
- [ ] Có điều kiện thua (Game Over).
- [ ] Có thể chơi lại (Restart).

**Học được:** MonoBehaviour, Rigidbody2D, Collider2D, Input, UI Text cơ bản.

---

### Project 2: Endless Runner hoặc Brick Breaker ⭐ (Tuần 9-12)
**Mục tiêu:** Spawn object động, quản lý điểm/mạng, độ khó tăng dần.

**Yêu cầu hoàn thành:**
- [ ] Sinh chướng ngại vật/gạch tự động (dùng Prefab + Instantiate).
- [ ] Hệ thống điểm số.
- [ ] Hệ thống mạng (3 lives).
- [ ] Tăng độ khó theo thời gian.
- [ ] Màn hình Game Over + nút Restart + lưu high score (PlayerPrefs).

**Học được:** Prefab, `Instantiate`/`Destroy`, object pooling đơn giản (tùy chọn), PlayerPrefs, quản lý trạng thái game.

---

### Project 3: 2D Platformer nhỏ ⭐⭐ (Tuần 13-16)
**Mục tiêu:** Game có "chất game" thật — nhân vật, di chuyển, nhảy, kẻ địch, level.

**Yêu cầu hoàn thành:**
- [ ] Nhân vật chạy + nhảy (cảm giác điều khiển tốt).
- [ ] Phát hiện chạm đất (ground check).
- [ ] Animation cơ bản (idle, run, jump) — dùng Animator.
- [ ] Ít nhất 1 loại kẻ địch/bẫy.
- [ ] Thu thập vật phẩm (coin).
- [ ] 1-2 level + điều kiện thắng (về đích).
- [ ] Âm thanh (nhảy, ăn coin, nhạc nền).
- [ ] Menu chính + Game Over + Win.

**Học được:** Animator/Animation, sprite, tilemap (tùy chọn), state đơn giản, audio, chuyển scene, polish.

---

## 🌟 Dự án nâng cao (nếu còn thời gian/hứng thú)

- **Match-3 nhỏ** (Candy Crush mini): logic lưới, swap, match detection.
- **Top-down shooter đơn giản:** bắn đạn, kẻ địch đuổi theo, wave.
- **Clone một hyper-casual game** từ store: tập "đọc vị" game thương mại.

---

## 📦 Cách "đóng gói" mỗi dự án (rất quan trọng)

Mỗi game xong, làm thêm:
1. ✅ **Build ra file chạy được** (PC standalone hoặc WebGL). Học quy trình Build.
2. ✅ **Push lên GitHub** với README ngắn (game gì, cách chơi, ảnh chụp).
3. ✅ **Quay video 30s** gameplay.
4. ✅ Viết 1 đoạn ghi chú: "Mình học được gì, gặp khó gì, sửa thế nào".

> Đây là khởi đầu của **portfolio**. Xem [07-Interview-and-Portfolio](../07-Interview-and-Portfolio/portfolio.md).

---

## 🧩 Game Jam — thử thách tuyệt vời

Khi xong Project 2, hãy thử tham gia một **game jam** (Ludum Dare, GMTK Jam, hoặc jam trên itch.io):
- Làm 1 game nhỏ trong 48-72h theo chủ đề.
- Rèn kỹ năng **hoàn thành dưới áp lực** và **giới hạn scope**.
- Cực kỳ tốt cho cả kỹ thuật lẫn tư duy Indie.

---

## ⚖️ Tiêu chí đánh giá một dự án "đạt"

| Tiêu chí | Đạt | Chưa đạt |
|----------|-----|----------|
| Hoàn chỉnh vòng game | Có start/play/end/restart | Chỉ có gameplay rời rạc |
| Tự code | Tự viết, hiểu mọi dòng | Copy nguyên tutorial |
| Không crash | Chơi mượt, không lỗi đỏ | Lỗi liên tục |
| Có polish tối thiểu | Âm thanh + UI + feedback | Trắng trơn, không feedback |
| Đóng gói | Build được + lên Git | Chỉ chạy trong editor |

---

[⬅️ Skills](./skills.md) | [Resources ➡️](./resources.md)
