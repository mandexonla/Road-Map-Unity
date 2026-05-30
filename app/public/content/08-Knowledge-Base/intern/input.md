# 🎮 Input (Xử Lý Đầu Vào)

[⬅️ Knowledge Base](../README.md) | Liên quan: [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md)

---

## 1. Bản chất

**Input là cầu nối giữa người chơi và game.** Bàn phím, chuột, gamepad, cảm ứng — tất cả được engine đọc và đưa vào code dưới dạng số/sự kiện để bạn xử lý.

Unity có **hai hệ thống input song song tồn tại**:
- **Input Manager (cũ / "legacy")** — `Input.GetKey(...)`. Đơn giản, có sẵn, hợp người mới.
- **Input System (mới)** — package riêng, dựa trên Action & Asset. Mạnh, linh hoạt, chuẩn cho dự án lớn/đa thiết bị.

> 🔑 Hiểu khác biệt cốt lõi: hệ cũ là **"hỏi trạng thái mỗi frame" (polling)**; hệ mới thiên về **"đăng ký nhận sự kiện" (event-driven)** và **tách hành động khỏi phím cụ thể**.

---

## 2. Vấn đề mỗi hệ giải quyết

### Vì sao có hệ cũ?
Đơn giản, đủ dùng cho game nhỏ. "Phím Space có đang được nhấn không?" → một dòng code.

### Vì sao Unity làm hệ mới?
Hệ cũ có giới hạn thật khi game lớn:
- **Hardcode phím:** `Input.GetKeyDown(KeyCode.Space)` gắn chặt hành động "nhảy" với phím Space → khó cho người chơi đổi phím (rebinding).
- **Đa thiết bị rắc rối:** hỗ trợ đồng thời bàn phím + nhiều gamepad + cảm ứng rất khổ.
- **Local multiplayer** (2 người 1 máy) khó.

Hệ mới tách **"hành động" (Action: Jump, Move)** khỏi **"thiết bị/phím cụ thể"**, nên đổi phím, đổi thiết bị, nhiều người chơi đều dễ.

---

## 3. Cách hoạt động bên trong

### Polling (hệ cũ)
Mỗi frame, engine cập nhật trạng thái tất cả phím. Bạn **chủ động hỏi** trong `Update`:
- `GetKey` → phím **đang** được giữ (true liên tục khi giữ).
- `GetKeyDown` → đúng **frame bắt đầu** nhấn (true 1 frame).
- `GetKeyUp` → đúng **frame thả** (true 1 frame).

> ⚠️ Vì `GetKeyDown/Up` chỉ đúng **một frame**, phải đọc trong `Update` (chạy mỗi frame), **không** trong `FixedUpdate` (có thể bỏ lỡ). Xem [Lifecycle](./monobehaviour-lifecycle.md).

### Event-driven (hệ mới)
Bạn định nghĩa các **Action** trong một **Input Actions Asset**, map chúng tới phím/nút/trục. Khi người chơi tác động, hệ thống **gọi callback** (`OnJump`, `OnMove`) hoặc bạn đọc giá trị action. Bạn nghĩ theo **"hành động game"** chứ không phải "phím vật lý".

---

## 4. Cú pháp & ví dụ

### Hệ cũ (Input Manager)
```csharp
void Update()
{
    // Phím
    if (Input.GetKeyDown(KeyCode.Space))  Jump();        // đúng frame nhấn
    if (Input.GetKey(KeyCode.LeftShift))  Run();         // khi đang giữ

    // Trục ảo (mượt, có sẵn): trả -1..1
    float h = Input.GetAxis("Horizontal"); // A/D hoặc mũi tên hoặc joystick
    float v = Input.GetAxis("Vertical");
    Move(new Vector2(h, v));

    // GetAxisRaw: trả thẳng -1/0/1, không làm mượt (hợp điều khiển "gắt")
    float hRaw = Input.GetAxisRaw("Horizontal");

    // Chuột
    if (Input.GetMouseButtonDown(0)) Shoot();            // 0=trái,1=phải,2=giữa
    Vector3 mousePos = Input.mousePosition;              // pixel trên màn hình
}
```

### Hệ mới (Input System) — ý tưởng
```csharp
// Cách dùng phổ biến: gắn component PlayerInput + Input Actions Asset,
// rồi nhận callback. (Cần cài package "Input System".)
public void OnJump(InputAction.CallbackContext ctx)
{
    if (ctx.performed) Jump();   // khi action "Jump" được kích hoạt
}
public void OnMove(InputAction.CallbackContext ctx)
{
    moveInput = ctx.ReadValue<Vector2>(); // đọc giá trị trục
}
```

---

## 5. Ứng dụng thực tế

| Tình huống | Nên dùng |
|-----------|----------|
| Game jam / prototype / học | Hệ cũ (`Input.GetKey`) cho nhanh |
| Game nhỏ 1 thiết bị, không cần đổi phím | Hệ cũ vẫn ổn |
| Game thương mại, cần rebinding phím | **Hệ mới** |
| Hỗ trợ gamepad + bàn phím + cảm ứng | **Hệ mới** |
| Local co-op (nhiều người 1 máy) | **Hệ mới** |
| Mobile (touch, gesture) | Hệ mới hoặc touch API |

---

## 6. Ưu điểm / Nhược điểm

| | Hệ cũ (Input Manager) | Hệ mới (Input System) |
|--|------------------------|------------------------|
| Dễ học | ✅ Rất dễ | ❌ Dốc hơn, nhiều khái niệm |
| Có sẵn | ✅ Không cần cài | Cần cài package |
| Rebinding phím | ❌ Khó | ✅ Hỗ trợ sẵn |
| Đa thiết bị | ❌ Vất vả | ✅ Mạnh |
| Local multiplayer | ❌ Khó | ✅ Hỗ trợ |
| Phù hợp | Người mới, game nhỏ | Dự án nghiêm túc/lớn |

---

## 7. Lỗi thường gặp

### ❌ Đọc `GetKeyDown` trong `FixedUpdate`
`GetKeyDown` chỉ true 1 frame; `FixedUpdate` không chạy mỗi frame → **bỏ lỡ input**. Luôn đọc input ở `Update`.

### ❌ Áp dụng input vật lý sai chỗ
Đọc input ở `Update`, nhưng **tác động Rigidbody ở `FixedUpdate`**. Mẫu: lưu input vào biến ở Update, dùng ở FixedUpdate.

### ❌ Quên `Time.deltaTime` khi di chuyển bằng input
```csharp
transform.position += dir * speed; // SAI: phụ thuộc FPS
transform.position += dir * speed * Time.deltaTime; // ĐÚNG
```

### ❌ Nhầm `GetAxis` và `GetAxisRaw`
`GetAxis` **làm mượt** (tăng/giảm dần) → điều khiển "trượt", có quán tính. `GetAxisRaw` trả ngay -1/0/1 → phản hồi tức thì, "gắt" hơn. Chọn theo cảm giác game muốn.

### ❌ So sánh vị trí chuột màn hình với tọa độ thế giới
`Input.mousePosition` là **pixel màn hình**, không phải tọa độ world. Phải chuyển: `Camera.main.ScreenToWorldPoint(...)`.

---

## 8. Best practices

- ✅ Người mới: bắt đầu hệ cũ cho đơn giản, học hệ mới khi làm dự án nghiêm túc.
- ✅ Đọc input ở `Update`, áp vật lý ở `FixedUpdate`.
- ✅ **Tách input khỏi logic:** đừng để code di chuyển dính chặt `Input.GetKey`. Đọc input rồi truyền giá trị vào hàm di chuyển → dễ test, dễ đổi sang AI/network điều khiển.
```csharp
void Update() { float h = Input.GetAxisRaw("Horizontal"); mover.SetInput(h); }
// mover không biết input đến từ bàn phím, AI, hay mạng → linh hoạt
```
- ✅ Game thương mại: dùng Input System để hỗ trợ rebinding & đa thiết bị từ đầu.
- ✅ Mobile: nghĩ về touch/cảm ứng ngay từ thiết kế.

---

## 9. Liên kết
- [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) — vì sao đọc input ở `Update`.
- [Physics: Rigidbody & Collider](./physics-rigidbody-collider.md) — áp input lên vật lý ở `FixedUpdate`.
- Tách input khỏi logic liên hệ [Architecture](../../05-Technical-Deep-Dives/architecture.md).
- Input System (sâu) — [Junior skills](../../02-Junior/skills.md).

---

[⬅️ Serialization & Inspector](./serialization-and-inspector.md) | [Physics: Rigidbody & Collider ➡️](./physics-rigidbody-collider.md)
