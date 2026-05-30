# ⚙️ Physics: Rigidbody & Collider

[⬅️ Knowledge Base](../README.md) | Liên quan: [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) · [Transform](./transform.md)

> Vật lý là nơi người mới gặp nhiều bug "ma quái" nhất (xuyên tường, rung lắc, va chạm không nhận). Gần như tất cả đến từ hiểu sai 3 thứ: **Rigidbody, Collider, và FixedUpdate**.

---

## 1. Bản chất: ba mảnh ghép tách biệt

Vật lý trong Unity là sự phối hợp của **ba thành phần riêng biệt** — hiểu rõ vai trò từng cái là chìa khóa:

| Component | Vai trò | Ẩn dụ |
|-----------|---------|-------|
| **Rigidbody** | Cho object **chịu sự điều khiển của engine vật lý** (trọng lực, lực, va đập đẩy nhau) | "Linh hồn vật lý" |
| **Collider** | Định nghĩa **hình dạng va chạm** (vùng nào là "đặc") | "Lớp da để chạm" |
| **Physics Engine** | Mỗi bước, tính toán mọi Rigidbody + Collider để mô phỏng | "Bộ não" |

> 🔑 **Rigidbody và Collider là hai thứ KHÁC NHAU, làm việc KHÁC NHAU:**
> - Có **Collider** mà **không** Rigidbody → vật cản **tĩnh** (tường, sàn). Không tự di chuyển, không rơi.
> - Có **Rigidbody** → object được engine vật lý "nhận quản lý": rơi theo trọng lực, bị đẩy khi va chạm.
> - Va chạm chỉ "đầy đủ" khi **có Collider**; phản ứng vật lý (đẩy nhau) cần **ít nhất một bên có Rigidbody**.

---

## 2. Vấn đề nó giải quyết

Bạn muốn vật rơi, nảy, trượt, va đập, không xuyên qua nhau — **một cách chân thực** mà không tự viết toán vật lý. Engine (PhysX cho 3D, Box2D cho 2D) làm hết: phát hiện va chạm, tính lực, giải quyết chồng lấn, áp trọng lực. Bạn chỉ cần **cấu hình** (khối lượng, trọng lực, hình collider) và **ra lệnh** (thêm lực, đặt vận tốc).

---

## 3. Cách hoạt động bên trong

### Bước thời gian cố định (Fixed Timestep)
Engine vật lý chạy theo **nhịp cố định** (mặc định 0.02s = 50 lần/giây), **độc lập với FPS**. Lý do: mô phỏng vật lý cần bước thời gian đều mới **ổn định và tái lập được**. Đây chính là lý do `FixedUpdate` tồn tại và vì sao **mọi tác động vật lý phải nằm trong `FixedUpdate`**. Xem [Lifecycle](./monobehaviour-lifecycle.md).

### Vòng đời một bước vật lý
```
FixedUpdate() của bạn (thêm lực, đặt velocity)
   → Engine di chuyển các Rigidbody
   → Phát hiện va chạm (collision detection)
   → Giải quyết (đẩy nhau ra, tính phản lực)
   → Gọi OnCollisionEnter/Stay/Exit, OnTriggerEnter/Stay/Exit
```

### Collision Detection & "Tunneling"
Khi object đi **quá nhanh**, trong một bước vật lý nó có thể "nhảy" từ trước bức tường sang sau bức tường mà engine không kịp thấy va chạm → **xuyên tường (tunneling)**. Giải pháp: đổi **Collision Detection** từ `Discrete` sang `Continuous` cho object nhanh.

---

## 4. Ba loại Rigidbody (rất quan trọng)

| Loại | Trọng lực | Lực đẩy | Ai điều khiển | Dùng cho |
|------|-----------|---------|---------------|----------|
| **Dynamic** (mặc định) | ✅ Có | ✅ Bị đẩy | Engine vật lý | Vật rơi, đạn, thùng, vật thể tự do |
| **Kinematic** (`isKinematic=true`) | ❌ Không | ❌ Không bị đẩy | **Bạn** (qua code) | Bệ di chuyển, cửa, vật do script điều khiển nhưng vẫn cần va chạm |
| **Static** (chỉ Collider, không Rigidbody) | — | — | Không di chuyển | Tường, sàn, vật cản cố định |

> 🔑 **Kinematic** là loại hay bị hiểu lầm: nó **có** trong hệ vật lý (gây trigger, đẩy vật Dynamic khác) nhưng **không bị vật lý điều khiển** — bạn tự di chuyển nó bằng `MovePosition`. Hợp cho nhân vật/bệ mà bạn muốn kiểm soát hoàn toàn nhưng vẫn tương tác va chạm.

---

## 5. Collision vs Trigger — phân biệt cốt lõi

| | **Collision** (collider đặc) | **Trigger** (`Is Trigger = true`) |
|--|------------------------------|-----------------------------------|
| Hành vi | Hai vật **đẩy nhau**, không chồng lên | **Xuyên qua nhau**, chỉ phát hiện |
| Callback | `OnCollisionEnter/Stay/Exit` | `OnTriggerEnter/Stay/Exit` |
| Tham số | Nhận `Collision` (có điểm chạm, lực) | Nhận `Collider` (chỉ object kia) |
| Dùng cho | Tường, sàn, va đập vật lý | Nhặt đồ, vùng nguy hiểm, checkpoint, cửa cảm ứng |

```csharp
// Collision: phản ứng khi va chạm vật lý thật
void OnCollisionEnter(Collision col) {
    if (col.gameObject.CompareTag("Ground")) isGrounded = true;
}

// Trigger: phát hiện đi vào vùng (xuyên qua)
void OnTriggerEnter(Collider other) {
    if (other.CompareTag("Coin")) { Collect(other.gameObject); }
}
```

### Bảng "khi nào callback được gọi" (rất hay bị quên)
Va chạm/trigger chỉ kích hoạt khi **ít nhất một trong hai object có Rigidbody**. Hai Collider tĩnh (không Rigidbody nào) chạm nhau → **KHÔNG có callback nào**. Đây là lý do #1 khiến "trigger của tôi không chạy".

---

## 6. Cú pháp di chuyển bằng vật lý

```csharp
Rigidbody rb;
void Awake() => rb = GetComponent<Rigidbody>();

void FixedUpdate()   // LUÔN trong FixedUpdate
{
    // Cách 1: đặt vận tốc trực tiếp (kiểm soát tốt, hay dùng cho nhân vật)
    rb.velocity = new Vector3(moveInput * speed, rb.velocity.y, 0);

    // Cách 2: thêm lực (cảm giác quán tính, vật lý thật)
    rb.AddForce(Vector3.forward * thrust);

    // Cách 3: Kinematic → di chuyển có nhận va chạm
    rb.MovePosition(rb.position + move * speed * Time.fixedDeltaTime);
}
```

---

## 7. Ứng dụng thực tế

- **Nhân vật platformer:** Rigidbody Dynamic (hoặc Kinematic + tự xử lý), collider, ground check qua collision/raycast.
- **Đạn:** Rigidbody Dynamic + `Continuous` detection (vì nhanh) + trigger để trúng đích.
- **Nhặt vật phẩm / checkpoint:** Trigger.
- **Bệ di chuyển, cửa:** Kinematic Rigidbody + `MovePosition`.
- **Tường, sàn:** chỉ Collider (static), không Rigidbody.

---

## 8. Lỗi thường gặp

### ❌ Di chuyển Rigidbody bằng `transform.position`
Phá mô phỏng → xuyên tường, va chạm sai, rung lắc. Object có Rigidbody → dùng `rb.velocity` / `AddForce` / `MovePosition`.

### ❌ Tác động vật lý trong `Update`
Không ổn định, giật. Luôn `FixedUpdate`.

### ❌ Trigger/Collision không kích hoạt
Kiểm tra: (1) có **ít nhất một** Rigidbody không? (2) Collider có bật không? (3) đúng cặp Trigger/Collision callback? (4) Layer Collision Matrix có cho 2 layer va chạm? (5) `Is Trigger` set đúng?

### ❌ Object nhanh xuyên qua tường (tunneling)
Đổi Collision Detection sang `Continuous`/`Continuous Dynamic`.

### ❌ Nhân vật rung lắc / dính tường
Thường do di chuyển bằng transform + collider, hoặc ma sát/contact offset. Dùng Rigidbody đúng cách, cân nhắc Physic Material không ma sát cho thành nhân vật.

### ❌ Quên `Time.fixedDeltaTime` với `MovePosition`
Khi di chuyển thủ công Kinematic, nhân `Time.fixedDeltaTime` để tốc độ đúng.

### ❌ Dùng `OnCollisionStay` để check grounded mỗi frame nhưng tốn kém
Cân nhắc raycast/spherecast cho ground check — kiểm soát tốt hơn.

---

## 9. Best practices

- ✅ Vật lý → `FixedUpdate`; input → `Update`.
- ✅ Object có Rigidbody → di chuyển qua Rigidbody, không qua transform.
- ✅ Vật tĩnh (tường/sàn) → chỉ Collider, **đừng** thêm Rigidbody (tốn vô ích).
- ✅ Object nhanh → `Continuous` collision detection.
- ✅ Dùng **Layer Collision Matrix** để tắt va chạm không cần thiết (tối ưu + tránh bug).
- ✅ Dùng `CompareTag("x")` thay vì `tag == "x"` (nhanh hơn, không tạo rác).
- ✅ Collider đơn giản (Box/Sphere/Capsule) rẻ hơn Mesh Collider nhiều — ưu tiên dùng.
- ✅ Hiểu rõ Dynamic vs Kinematic vs Static trước khi chọn.

---

## 10. Liên kết
- [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) — vì sao `FixedUpdate` tồn tại.
- [Transform](./transform.md) — khi nào di chuyển bằng transform (object KHÔNG vật lý).
- [Input](./input.md) — đọc input ở Update, áp lực ở FixedUpdate.
- Tối ưu vật lý — [Performance](../../05-Technical-Deep-Dives/performance.md).

---

[⬅️ Input](./input.md) | [Instantiate & Destroy ➡️](./instantiate-destroy.md)
