# 🛠️ Junior — Dự Án Thực Hành

[⬅️ Skills](./skills.md) | [Resources ➡️](./resources.md)

> Mục tiêu Junior: dự án **có nhiều hệ thống nối nhau**, code **sạch và có cấu trúc**, và **làm việc trong codebase người khác**.

---

## 🎯 Dự án bắt buộc

### Project 1: Game có nhiều hệ thống ⭐⭐ (2-3 tháng)
Chọn 1 trong: **Tower Defense / Survivor-like (kiểu Vampire Survivors) / RPG nhỏ / Card game**.

**Yêu cầu — phải dùng các kỹ thuật Junior:**
- [ ] **ScriptableObject** cho data (enemy stats, weapon config, level data).
- [ ] **Event/Observer system** (vd: enemy die → score + UI + audio cùng phản ứng).
- [ ] **State Machine** cho AI hoặc player.
- [ ] **Object Pooling** cho đạn/enemy/hiệu ứng.
- [ ] **Save/Load** (progress, settings, highscore).
- [ ] **UI có cấu trúc** (menu, HUD, pause, settings, game over).
- [ ] Code tách trách nhiệm rõ (không God class).
- [ ] Audio manager, scene management.

**Đây là dự án "lên trình" quan trọng nhất của Junior.** Nó chứng minh bạn làm được hệ thống nối nhau, không chỉ game đơn lẻ.

---

### Project 2: Đóng góp vào codebase có sẵn ⭐⭐ (1-2 tháng)
**Đây là kỹ năng số 1 để đi làm.** Chọn 1:
- Đóng góp vào một **Unity open-source game** trên GitHub.
- Lấy một project mẫu/asset phức tạp, **thêm feature mới** vào.
- Làm chung với một bạn khác (mỗi người một nhánh, merge, review nhau).

**Yêu cầu:**
- [ ] Đọc hiểu code người khác viết.
- [ ] Thêm feature mà không phá vỡ phần khác.
- [ ] Tuân theo style/cấu trúc có sẵn (không áp đặt style của bạn).
- [ ] Dùng Git đúng quy trình (branch, PR).

---

## 🌟 Dự án nâng cao (tùy chọn)

- **Editor Tool nhỏ:** viết một custom Inspector hoặc EditorWindow đơn giản (vd: tool spawn level). → khởi đầu cho Tools programming.
- **Mobile game hoàn chỉnh:** build + tối ưu cho điện thoại, test trên máy thật.
- **Game jam có chủ đề kỹ thuật:** ép mình dùng một pattern/kỹ thuật mới.

---

## 📋 Yêu cầu chất lượng code (khác Intern)

| Tiêu chí | Intern chấp nhận | Junior phải đạt |
|----------|------------------|-----------------|
| Cấu trúc | 1 script làm tất cả OK | Tách class theo trách nhiệm |
| Đặt tên | Miễn chạy | Rõ ràng, nhất quán |
| Data | Hardcode trong script | Dùng ScriptableObject/config |
| Coupling | Gọi trực tiếp lung tung | Dùng event/interface giảm phụ thuộc |
| Hiệu năng | Không quan tâm | Cache component, pool object |
| Git | Commit lung tung | Branch + commit message rõ |

---

## 🔍 Tự review code của mình

Sau khi xong dự án, tự hỏi:
1. Nếu 3 tháng sau quay lại, mình có hiểu code này không?
2. Nếu muốn thêm 1 loại enemy mới, mình sửa bao nhiêu chỗ? (càng ít càng tốt)
3. Có class nào quá to (>300 dòng) cần tách không?
4. Có chỗ nào lặp code 3+ lần không?
5. Chạy Profiler — có spike rõ ràng nào không?

> 💡 Thử nhờ người giỏi hơn (mentor/cộng đồng) review code. Đây là cách lên trình nhanh nhất.

---

## 📦 Đóng gói (nâng cấp portfolio)

Mỗi dự án Junior nên có:
- [ ] Build chạy được (PC + mobile/WebGL).
- [ ] GitHub repo với README chuyên nghiệp (mô tả, ảnh GIF, kiến trúc tóm tắt, cách build).
- [ ] Video gameplay + (bonus) video nói về quyết định kỹ thuật.
- [ ] Một bài viết ngắn (blog/devlog) về một thử thách kỹ thuật bạn giải quyết.

Xem [07-Interview-and-Portfolio/portfolio.md](../07-Interview-and-Portfolio/portfolio.md).

---

[⬅️ Skills](./skills.md) | [Resources ➡️](./resources.md)
