# 🛠️ Mid-Level — Dự Án Thực Hành

[⬅️ Skills](./skills.md) | [Resources ➡️](./resources.md)

> Mục tiêu Mid: tự **thiết kế kiến trúc** cho hệ thống lớn, code **bền & mở rộng được**, và làm trong **dự án quy mô**.

---

## 🎯 Dự án bắt buộc

### Project 1: Hệ thống lớn, kiến trúc tốt ⭐⭐⭐ (3-5 tháng)
Làm một game **có chiều sâu hệ thống**, ví dụ: **RPG/ARPG nhỏ, Roguelike, Simulation, Strategy nhỏ**.

**Yêu cầu kiến trúc (đây là điểm khác Junior):**
- [ ] **Thiết kế kiến trúc trước khi code** (vẽ sơ đồ data flow, module).
- [ ] Tách **data ↔ logic ↔ UI** rõ ràng (MVC/MVP/MVVM).
- [ ] **Dependency Injection** (thủ công hoặc VContainer/Zenject).
- [ ] Ít nhất 3 hệ thống lớn nối nhau: vd **Inventory + Crafting + Save/Load**, hoặc **Quest + Dialogue + Progression**.
- [ ] **Data-driven** (thêm item/quest/enemy mới chỉ cần thêm data, không sửa code).
- [ ] **Addressables** cho quản lý asset.
- [ ] **Unit test** cho logic cốt lõi.
- [ ] Tối ưu hiệu năng (đo bằng Profiler, có số liệu trước/sau).

> 💡 Tiêu chí thành công: **"Thêm một loại vật phẩm/quest/enemy mới mất bao lâu?"** Nếu chỉ vài phút (thêm data) → kiến trúc tốt. Nếu phải sửa nhiều file → cần refactor.

---

### Project 2: Chuyên sâu 1 mảng ⭐⭐⭐ (2-3 tháng)
Chọn theo hướng chuyên sâu của bạn:

| Hướng | Dự án gợi ý |
|-------|-------------|
| 🎮 Gameplay | Ability/skill system kiểu MOBA, hoặc combat system có combo/cancel/buffer |
| 🔧 Tools | Bộ editor tool: level editor, dialogue editor, hoặc tool build pipeline cho team |
| 🎨 Graphics | Bộ shader/VFX (water, dissolve, toon, stylized), custom render feature URP |
| 🌐 Multiplayer | Game multiplayer nhỏ (lobby + đồng bộ + authority) với Netcode for GameObjects |

**Yêu cầu:** sản phẩm đủ sâu để chứng minh chuyên môn, có thể trình bày trong phỏng vấn.

---

### Project 3: Làm trong dự án/team thật ⭐⭐⭐ (song song)
**Kỹ năng quan trọng nhất để lên Senior.** Chọn 1:
- Làm việc trong một **team thật** (công ty, hoặc nhóm indie nhiều người).
- Đóng góp **nghiêm túc** vào một open-source game lớn (nhiều PR, nhiều feature).
- Dẫn dắt kỹ thuật một game jam nhóm.

**Yêu cầu:**
- [ ] Làm việc trong codebase nhiều người, quản lý conflict.
- [ ] Modular hóa để nhiều người làm song song.
- [ ] Review code người khác.
- [ ] Viết design doc cho feature mình làm.

---

## 📐 Checklist thiết kế trước khi code (thói quen Mid)

Trước khi viết hệ thống lớn, trả lời:
1. **Vấn đề thật là gì?** (không phải giải pháp vội)
2. **Data nào cần lưu? Lưu ở đâu?** (SO? Save file? Runtime?)
3. **Những module nào? Chúng nói chuyện thế nào?** (vẽ sơ đồ)
4. **Phần nào sẽ thay đổi nhiều?** (cô lập nó sau interface)
5. **Đánh đổi gì?** (đơn giản vs linh hoạt, nhanh vs bền)
6. **Test thế nào?**

> 💡 Dành 20% thời gian thiết kế tiết kiệm 50% thời gian sửa sau này.

---

## 🔬 Yêu cầu đo lường hiệu năng (mới ở Mid)

Với dự án Mid, bạn phải có **số liệu thật**:
- [ ] Profiler screenshot trước/sau tối ưu.
- [ ] Frame time, memory, draw call cụ thể.
- [ ] Test trên thiết bị thật (đặc biệt mobile).
- [ ] Một bài viết: "Tôi đã giảm X ms / Y MB như thế nào".

---

## 📦 Portfolio cấp Mid

- [ ] 1 dự án thể hiện **kiến trúc tốt** (kèm sơ đồ + giải thích quyết định).
- [ ] 1 dự án thể hiện **chuyên môn sâu** một mảng.
- [ ] Bằng chứng làm việc **team/dự án lớn** (PR, đóng góp).
- [ ] Devlog/blog kỹ thuật (2-3 bài chất lượng).
- [ ] (Bonus) Một asset/tool chia sẻ cho cộng đồng.

---

[⬅️ Skills](./skills.md) | [Resources ➡️](./resources.md)
