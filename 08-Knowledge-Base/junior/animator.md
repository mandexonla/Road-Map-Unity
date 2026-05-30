# 🎞️ Animator & Animation System

[⬅️ Knowledge Base](../README.md) | Liên quan: [State Machine](./state-machine.md)

---

## 1. Bản chất

Unity tách animation thành nhiều lớp:
- **Animation Clip:** một đoạn chuyển động cụ thể (Idle, Run, Jump) — dữ liệu "thay đổi giá trị gì theo thời gian".
- **Animator Controller:** một **state machine** quyết định **lúc nào** phát clip nào và **chuyển** giữa chúng thế nào.
- **Animator (component):** gắn vào GameObject, chạy controller đó.

> 🔑 Điểm cốt lõi: **Animator Controller CHÍNH LÀ một [State Machine](./state-machine.md) trực quan.** Mỗi state = một animation; transition = điều kiện chuyển. Hiểu state machine → hiểu Animator.

---

## 2. Vấn đề nó giải quyết

Nhân vật cần chuyển mượt giữa nhiều chuyển động (đứng → chạy → nhảy → rơi → tiếp đất) theo trạng thái game. Tự code việc này (phát clip nào, blend ra sao, khi nào chuyển) rất rối. Animator cung cấp **công cụ trực quan** quản lý các trạng thái animation và chuyển tiếp giữa chúng.

---

## 3. Cách hoạt động: các thành phần

### State & Transition
- Mỗi ô trong Animator window = một **state** (gắn một clip).
- Mũi tên giữa state = **transition**, có **điều kiện** dựa trên **parameter**.

### Parameters (cầu nối code ↔ animation)
Code không gọi clip trực tiếp; code **set parameter**, Animator dựa vào parameter để chuyển state:
| Loại | Dùng cho |
|------|----------|
| **Bool** | Trạng thái bật/tắt (isRunning, isGrounded) |
| **Trigger** | Sự kiện một lần (Jump, Attack) — tự reset sau khi dùng |
| **Float** | Giá trị liên tục (speed, để blend) |
| **Int** | Phân loại (weaponType) |

```csharp
Animator anim;
void Update() {
    anim.SetFloat("speed", Mathf.Abs(velocity.x));  // điều khiển blend chạy
    anim.SetBool("isGrounded", isGrounded);
    if (jumpPressed) anim.SetTrigger("Jump");        // sự kiện một lần
}
```

### Blend Tree
**Trộn nhiều clip theo một giá trị liên tục.** Vd: theo `speed`, blend mượt Idle → Walk → Run; hoặc theo hướng (x,y) blend di chuyển 8 hướng. Tránh chuyển "giật cục" giữa các clip.

### Animation Events
Gọi **hàm C#** tại một frame cụ thể của clip. Vd: tại frame chân chạm đất trong clip Attack → gọi `DealDamage()`, hoặc phát âm bước chân đúng nhịp.

### Layers & Avatar Mask
Cho phép animation chạy **chồng** (vd thân dưới chạy + thân trên bắn súng độc lập) bằng cách tách layer theo phần cơ thể.

---

## 4. Ứng dụng thực tế

- Nhân vật: Idle/Walk/Run/Jump/Attack/Hurt/Die.
- Blend di chuyển mượt theo tốc độ/hướng.
- Đồng bộ hành động với gameplay (Animation Event gọi damage, âm thanh, spawn hitbox).
- UI animation (nút, popup) — dù UI thường dùng Tween (DOTween) tiện hơn.
- Layer cho hành động đồng thời (chạy + vẫy tay).

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Trực quan, không cần code nhiều | State machine phức tạp dễ thành "mạng nhện" rối |
| Blend mượt, layer linh hoạt | Khó version control / merge (asset nhị phân-ish) |
| Animation Event đồng bộ gameplay | Overhead nếu quá nhiều animator/parameter |
| Chuẩn cho nhân vật | Khó tái dùng controller giữa nhân vật khác cấu trúc |

> 💡 Cho UI & hiệu ứng tween đơn giản (di chuyển, scale, fade), **DOTween** thường gọn & dễ kiểm soát hơn Animator. Animator mạnh nhất cho **nhân vật/skeletal animation**.

---

## 6. Lỗi thường gặp

### ❌ Animator "mạng nhện" — quá nhiều state/transition chằng chịt
Khó bảo trì. Dùng **Trigger** + **Any State** hợp lý, tách **Sub-state machine**, hoặc cân nhắc code-driven state cho logic phức tạp.
### ❌ Dùng Bool cho sự kiện một lần (nên dùng Trigger)
Bool phải tự tắt → dễ kẹt. Trigger tự reset sau khi tiêu thụ — hợp cho Attack/Jump.
### ❌ Transition có thời gian (exit time) gây trễ phản hồi
Animation chuyển chậm làm điều khiển "ì". Tắt "Has Exit Time" cho hành động cần phản hồi tức thì.
### ❌ Logic GAME đặt trong Animation Event quá nhiều
Animation Event tiện nhưng khó lần. Dùng cho đồng bộ visual/âm thanh; logic quan trọng cân nhắc giữ trong code.
### ❌ Quên `Mathf.Abs` hay giá trị âm khi set Float blend
Blend tree sai vì giá trị parameter không như mong đợi.

---

## 7. Best practices

- ✅ Hiểu Animator = [State Machine](./state-machine.md); thiết kế state gọn gàng.
- ✅ Trigger cho sự kiện một lần, Bool cho trạng thái kéo dài, Float cho blend.
- ✅ Blend Tree cho chuyển động mượt theo tốc độ/hướng.
- ✅ Tắt "Has Exit Time" cho hành động cần phản hồi nhanh.
- ✅ Animation Event để đồng bộ hitbox/âm thanh/VFX với frame.
- ✅ Sub-state machine & layer để quản phức tạp.
- ✅ Cân nhắc DOTween cho UI/tween đơn giản thay vì Animator.

---

## 8. Liên kết
- [State Machine](./state-machine.md) — bản chất của Animator Controller.
- [MonoBehaviour & Lifecycle](../intern/monobehaviour-lifecycle.md) — set parameter trong Update.
- [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md) — game feel, combat timing.

---

[⬅️ Garbage Collection](./garbage-collection-basics.md) | [New Input System ➡️](./new-input-system.md)
