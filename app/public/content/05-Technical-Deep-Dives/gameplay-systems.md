# 🎮 Gameplay Systems (Gameplay Programmer)

[⬅️ Technical Index](./README.md)

> 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior) — hướng chuyên sâu cho **Gameplay Programmer**

Gameplay programmer làm cho game "có cảm giác chơi" — combat, AI, inventory, progression. Đây là hướng phổ biến & gần với game design nhất (rất hợp Indie).

---

## 🟡 1. Các hệ thống gameplay nền tảng

| Hệ thống | Thách thức kỹ thuật |
|----------|---------------------|
| **Character Controller** | Di chuyển mượt, cảm giác tốt, xử lý slope/step/ledge |
| **Combat System** | Damage, hitbox/hurtbox, combo, cancel, hit feedback |
| **Inventory** | Data-driven, stack, equip, UI tách logic, save |
| **Ability/Skill System** | Modular, data-driven, cooldown, effect, scaling |
| **Quest System** | State machine, điều kiện, trigger, save tiến độ |
| **Dialogue System** | Branching, biến, localization, tích hợp narrative |
| **Progression/Leveling** | XP, unlock, balance curve |
| **Save System** | Serialize toàn bộ trạng thái, version, migration |

> 🔑 Điểm chung của hệ thống tốt: **data-driven** (thêm nội dung không sửa code) + **tách logic/UI/data**.

---

## 🟡 2. AI cho gameplay

- **Finite State Machine (FSM):** patrol/chase/attack/flee — nền tảng, dễ hiểu.
- **Behaviour Tree:** AI phức tạp hơn, modular, dễ mở rộng (asset: Behavior Designer, hoặc Unity Behavior mới).
- **Utility AI:** quyết định theo điểm số (chọn hành động "đáng giá nhất").
- **Pathfinding:** NavMesh (Unity built-in), A* (asset A* Pathfinding Project).
- **Steering behaviours:** seek, flee, flocking (đám đông).
- **Sensors:** vision cone, hearing, detection.

---

## 🟡 3. Game Feel ("juice") — kỹ thuật tạo cảm giác

Cái khác biệt giữa game "ổn" và game "đã tay":
- **Animation:** anticipation, follow-through, squash & stretch.
- **Screen shake, hit stop (freeze frame), knockback.**
- **Particle & VFX** đúng lúc.
- **Audio feedback** (mỗi hành động có âm thanh).
- **Tweening** (DOTween) cho UI/object mượt.
- **Input buffering, coyote time, jump forgiveness** (làm điều khiển "công bằng").
- **Camera:** follow mượt, look-ahead, screen shake (Cinemachine).

> 📺 Xem: GDC "Math for Game Programmers: Juicing Your Cameras", "The Art of Screen Shake".

---

## 🟡 4. Kiến trúc cho gameplay system

- **ScriptableObject** cho data (item, ability, enemy stats).
- **Event system** cho giao tiếp (combat → UI → audio → analytics).
- **Component-based design** (Unity's strength): ghép hành vi từ component nhỏ.
- **State Machine** tái dùng được cho nhiều entity.
- Tách **simulation (logic)** khỏi **presentation (visual)** — quan trọng cho cả test lẫn multiplayer.

Xem: [architecture.md](./architecture.md).

---

## 🔴 5. Nâng cao (Senior)

- **Ability system phức tạp** kiểu Gameplay Ability System (GAS của Unreal — học tư duy, áp dụng vào Unity): effect, attribute, tag, modifier stacking.
- **Deterministic simulation:** cùng input → cùng kết quả (cần cho lockstep multiplayer, replay).
- **Data-oriented gameplay (DOTS):** mô phỏng hàng nghìn entity (RTS, autobattler, bullet hell).
- **Modding support:** thiết kế hệ thống cho người ngoài thêm nội dung.
- **Tooling cho designer:** editor để designer tự tạo ability/quest/level không cần code (cầu nối Tools).
- **Balancing tools:** data tuning, simulation để cân bằng.

---

## 🎯 Lộ trình rèn luyện

```
Mid:     Dựng 3-4 hệ thống lớn data-driven (inventory/ability/quest/dialogue)
         + AI (FSM/BT) + game feel + Cinemachine + DOTween
Senior:  Ability system phức tạp · deterministic sim · designer tooling · DOTS gameplay · modding
```

**Dự án gợi ý:** ARPG nhỏ với ability system kiểu MOBA, hoặc autobattler, hoặc immersive sim nhỏ.

---

## 📚 Tài nguyên
- GDC talks về combat, AI, game feel (rất nhiều, chất lượng cao).
- "Game Feel" — Steve Swink.
- "Game AI Pro" (sách AI game).
- Cinemachine, DOTween, A* Pathfinding Project (asset).
- iHeartGameDev, Tarodev (YouTube) — gameplay architecture.

---

## 🔗 Liên quan
- Hợp với nhánh [Indie](../06-Indie-Track/README.md) (gameplay = trái tim game indie).
- Cần [architecture.md](./architecture.md) làm nền.

---

[⬅️ Technical Index](./README.md) | [Tools & Editor ➡️](./tools-and-editor.md)
