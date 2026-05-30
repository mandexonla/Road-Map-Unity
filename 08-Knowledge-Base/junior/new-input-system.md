# 🎮 New Input System (Hệ Thống Input Mới)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Input (cơ bản)](../intern/input.md)

> Đọc [Input (Intern)](../intern/input.md) trước để hiểu nền tảng polling vs event. Trang này đào sâu hệ thống Input System mới — chuẩn cho dự án nghiêm túc.

---

## 1. Bản chất

**Input System mới tách rời "HÀNH ĐỘNG game" khỏi "phím/nút vật lý".** Bạn định nghĩa các **Action** (Jump, Move, Fire) trong một **asset** riêng, rồi map chúng tới nhiều loại input (phím, nút gamepad, chạm). Code chỉ quan tâm "action Jump xảy ra", **không** quan tâm nó đến từ Space, nút A gamepad, hay nút cảm ứng.

> 🔑 Đảo ngược tư duy: hệ cũ hỏi *"phím Space có nhấn không?"*. Hệ mới nói *"action Jump vừa xảy ra"*. Tách biệt này cho phép đổi phím, đa thiết bị, nhiều người chơi — dễ dàng.

---

## 2. Vấn đề nó giải quyết (vì sao có hệ mới)

Hệ cũ (`Input.GetKey`) hardcode phím vào logic → khó:
- **Rebinding** (người chơi đổi phím).
- **Đa thiết bị** (bàn phím + nhiều gamepad + cảm ứng đồng thời).
- **Local multiplayer** (2 người 1 máy, mỗi người một thiết bị).
- **Đổi context** (input lúc chơi vs lúc trong menu khác nhau).

Input System sinh ra để giải các vấn đề này một cách có cấu trúc.

---

## 3. Các khái niệm cốt lõi

```
Input Actions Asset (.inputactions)
   └── Action Map "Gameplay"          ← nhóm action theo context
        ├── Action "Move"  (Value, Vector2)
        │     └── Bindings: WASD / Left Stick / Touch
        ├── Action "Jump"  (Button)
        │     └── Bindings: Space / Gamepad South
        └── Action "Fire"  (Button)
   └── Action Map "UI"                ← context khác (menu)
```

| Khái niệm | Là gì |
|-----------|-------|
| **Action** | Một "hành động game" (Move, Jump) |
| **Binding** | Nối action tới input cụ thể (phím/nút/trục) |
| **Action Map** | Nhóm action theo ngữ cảnh (Gameplay, UI, Driving) |
| **Control Scheme** | Bộ binding cho một loại thiết bị (Keyboard&Mouse, Gamepad) |
| **Interactions** | Cách kích hoạt (Press, Hold, Tap, MultiTap) |
| **Processors** | Xử lý giá trị (deadzone, invert, normalize) |

### Action Type
- **Button:** bật/tắt (Jump, Fire).
- **Value:** giá trị liên tục, gửi mỗi frame khi đổi (Move - Vector2).
- **Pass-Through:** mọi thay đổi, không "tranh chấp" giữa control.

---

## 4. Ba cách dùng (từ dễ → linh hoạt)

### 🅰️ Component PlayerInput + callback (dễ nhất)
Gắn `PlayerInput`, trỏ tới asset, nhận callback theo tên action:
```csharp
public void OnMove(InputAction.CallbackContext ctx) => moveInput = ctx.ReadValue<Vector2>();
public void OnJump(InputAction.CallbackContext ctx) { if (ctx.performed) Jump(); }
```
> `ctx.phase`: `started` (bắt đầu) → `performed` (kích hoạt) → `canceled` (thả). Thường dùng `performed`.

### 🅱️ Generated C# class (kiểm soát tốt)
Unity sinh class từ asset → đăng ký event trong code, rõ ràng & type-safe.

### 🅲 Đọc trực tiếp (đơn giản, ít cấu trúc)
```csharp
moveAction.ReadValue<Vector2>();
```

---

## 5. Ứng dụng thực tế

- **Rebinding:** cho người chơi đổi phím lúc runtime (`PerformInteractiveRebinding`).
- **Đa nền tảng:** một asset chạy PC + console + mobile, tự nhận thiết bị.
- **Local co-op:** `PlayerInputManager` tự gán thiết bị cho từng người chơi.
- **Đổi context:** bật/tắt Action Map khi vào menu / vào xe / vào cutscene.
- **Mobile:** on-screen controls (joystick ảo, nút cảm ứng) qua cùng action.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Rebinding & đa thiết bị mạnh mẽ | Dốc học hơn hệ cũ, nhiều khái niệm |
| Local multiplayer dễ | Setup ban đầu nhiều bước |
| Tách action khỏi phím (sạch) | Overkill cho prototype/jam đơn giản |
| Đổi context bằng Action Map | Một số bug/khác biệt phiên bản |

> 💡 Chọn: prototype/jam/game nhỏ 1 thiết bị → hệ cũ đủ. Game thương mại cần rebinding/đa thiết bị/co-op → hệ mới.

---

## 7. Lỗi thường gặp

### ❌ Quên enable Action Map / Action
Action không bật → không nhận input. `actionMap.Enable()` hoặc bật qua PlayerInput.
### ❌ Xử lý trong `canceled` nhầm với `performed`
Đọc kỹ phase. Nhảy nên ở `performed`; thả nút có thể cần `canceled`.
### ❌ Trộn lẫn hệ cũ và mới gây xung đột
Project Settings có "Active Input Handling" (Old/New/Both). Đặt đúng; trộn dễ rối.
### ❌ Đọc input vật lý sai timing
Vẫn nguyên tắc: logic/đọc ở Update-ish, áp vật lý ở FixedUpdate (xem [Lifecycle](../intern/monobehaviour-lifecycle.md)).

---

## 8. Best practices

- ✅ Tách action theo **Action Map** đúng ngữ cảnh (Gameplay/UI).
- ✅ Thiết kế cho **rebinding** từ đầu nếu là game thương mại.
- ✅ Tách input khỏi logic: input điền giá trị → hệ thống khác đọc (dễ test, đổi sang AI/network).
- ✅ Dùng PlayerInput callback cho đơn giản; generated class khi cần kiểm soát.
- ✅ Đặt "Active Input Handling" đúng, tránh trộn hệ.
- ✅ Mobile: thiết kế on-screen control qua cùng action.

---

## 9. Liên kết
- [Input (cơ bản)](../intern/input.md) — nền tảng, hệ cũ vs mới.
- [Command Pattern](./command-pattern.md) — kết hợp cho input remapping nâng cao.
- [MonoBehaviour & Lifecycle](../intern/monobehaviour-lifecycle.md) — timing input.

---

[⬅️ Animator](./animator.md) | [UI System (uGUI) ➡️](./ui-ugui.md)
