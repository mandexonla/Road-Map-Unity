# 🔄 MonoBehaviour & Vòng Đời (Lifecycle)

[⬅️ Knowledge Base](../README.md) | Liên quan: [GameObject & Component](./gameobject-component.md) · [Coroutine](./coroutine.md)

> Đây là khái niệm bạn sẽ dùng **mỗi ngày, mọi script**. Hiểu sai lifecycle là nguồn gốc của vô số bug khó hiểu.

---

## 1. Bản chất

**MonoBehaviour là lớp cơ sở mà mọi script gắn vào GameObject phải kế thừa.** Khi bạn viết:
```csharp
public class PlayerController : MonoBehaviour { }
```
bạn đang nói: *"Đây là một **Component** (xem [GameObject & Component](./gameobject-component.md)), và tôi muốn Unity **tự động gọi** các hàm đặc biệt của nó vào những thời điểm nhất định."*

**Điểm mấu chốt:** Bạn **KHÔNG tự gọi** `Start()`, `Update()`... **Unity gọi chúng cho bạn.** Đây gọi là mô hình **"đừng gọi chúng tôi, chúng tôi sẽ gọi bạn"** (Inversion of Control / Hollywood Principle).

> 🔑 MonoBehaviour là **cầu nối** giữa code C# của bạn và **vòng lặp game (game loop)** của engine. Engine chạy một vòng lặp khổng lồ mỗi frame, và tại các điểm trong vòng lặp đó, nó gọi các hàm "magic" (`Update`, `FixedUpdate`...) trên mọi MonoBehaviour đang active.

---

## 2. Vấn đề nó giải quyết

Game là một chương trình **chạy liên tục theo frame** (60 lần/giây). Bạn cần code chạy:
- **Một lần** khi object sinh ra (khởi tạo).
- **Mỗi frame** (di chuyển, kiểm tra input).
- **Đều theo thời gian** (vật lý).
- Khi **va chạm**, khi **bật/tắt**, khi **hủy**...

MonoBehaviour cung cấp các "móc" (hook) để bạn đặt code vào **đúng thời điểm** trong vòng đời object, mà không cần tự viết game loop.

---

## 3. Cách hoạt động bên trong: Game Loop

Mỗi frame, engine chạy một chuỗi cố định. Đơn giản hóa:

```
┌─ MỘT FRAME ──────────────────────────────────────────────┐
│                                                           │
│  1. Xử lý Input                                           │
│                                                           │
│  2. ── Vòng lặp Vật lý (có thể chạy 0, 1 hoặc NHIỀU lần)─┐│
│     │   FixedUpdate()                                    ││
│     │   Mô phỏng vật lý (di chuyển Rigidbody)            ││
│     │   OnCollision/OnTrigger                            ││
│     └─────────────────────────────────────────────────  ┘│
│                                                           │
│  3. Update()           ← logic game của bạn (1 lần/frame) │
│                                                           │
│  4. Coroutine (yield)                                     │
│                                                           │
│  5. LateUpdate()       ← sau mọi Update (camera bám theo) │
│                                                           │
│  6. Render (vẽ hình lên màn hình)                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
        ↑ lặp lại ~60 lần/giây
```

**Điểm cực kỳ quan trọng:** Bước 2 (vật lý) **không đồng bộ** với bước 3 (Update). Vật lý chạy theo **nhịp thời gian cố định** (mặc định 0.02s = 50 lần/giây), còn Update chạy **theo tốc độ frame** (phụ thuộc máy mạnh/yếu, 30/60/144 FPS...). Đây là lý do có `FixedUpdate` riêng — xem mục 5.

---

## 4. Các hàm lifecycle theo thứ tự

### Giai đoạn KHỞI TẠO (chạy một lần)

```csharp
Awake()
```
- **Khi nào:** Ngay khi object được tạo/nạp, **trước** mọi `Start`. Chạy **kể cả khi GameObject đang inactive** (nếu component active)... thực ra Awake chạy khi object active lần đầu.
- **Bản chất:** Nơi **tự khởi tạo nội bộ** — `GetComponent`, cache tham chiếu, set giá trị mặc định.
- **Quy tắc vàng:** Trong `Awake`, **chỉ động tới CHÍNH object này**, đừng giả định object khác đã sẵn sàng (chúng có thể chưa `Awake`).

```csharp
OnEnable()
```
- **Khi nào:** Mỗi lần object/component được **bật** (kể cả bật lại sau khi tắt).
- **Bản chất:** Nơi **đăng ký sự kiện** (`event += `). Cặp đôi với `OnDisable` để hủy đăng ký.

```csharp
Start()
```
- **Khi nào:** **Trước frame đầu tiên** mà object active, **sau** khi MỌI object đã `Awake`.
- **Bản chất:** Nơi khởi tạo cần **object khác đã sẵn sàng** (vì mọi `Awake` đã chạy xong).
- **Khác Awake:** `Start` chỉ chạy nếu object **active**; bị **hoãn** tới frame đầu nếu object đang inactive lúc tạo.

> 🔑 **Awake vs Start:** *Awake = "tự lo bản thân tôi". Start = "kết nối với người khác".* Dùng Awake để cache component của mình; dùng Start để lấy dữ liệu từ object/manager khác.

### Giai đoạn CHẠY (lặp lại)

```csharp
FixedUpdate()
```
- **Khi nào:** Theo **nhịp thời gian cố định** (mặc định mỗi 0.02s). Trong một frame có thể chạy **0 lần** (frame nhanh), **1 lần**, hoặc **nhiều lần** (frame chậm, phải "đuổi kịp").
- **Bản chất:** Dành cho **VẬT LÝ**. Mọi thao tác với `Rigidbody` (lực, velocity) phải ở đây.
- **Vì sao:** Vật lý cần bước thời gian đều để chính xác & ổn định, không phụ thuộc FPS.

```csharp
Update()
```
- **Khi nào:** **Một lần mỗi frame.** Tần suất = FPS (không cố định).
- **Bản chất:** Trái tim logic game — đọc **input**, di chuyển không-vật-lý, đếm giờ, kiểm tra điều kiện, cập nhật trạng thái.
- **Bẫy:** Vì phụ thuộc FPS, mọi chuyển động ở đây **phải nhân `Time.deltaTime`** (xem mục 7).

```csharp
LateUpdate()
```
- **Khi nào:** Sau khi **mọi** `Update` của mọi object đã chạy.
- **Bản chất:** Dùng khi cần **chắc chắn thứ khác đã cập nhật xong**. Kinh điển: **camera bám theo nhân vật** (phải đợi nhân vật di chuyển trong Update xong rồi camera mới theo, tránh giật).

### Giai đoạn VA CHẠM (theo sự kiện vật lý)

```csharp
OnCollisionEnter / Stay / Exit       (3D)
OnCollisionEnter2D / Stay2D / Exit2D (2D)
```
- Khi 2 collider **đặc** chạm nhau (có phản ứng vật lý đẩy nhau). Cần ít nhất 1 Rigidbody.

```csharp
OnTriggerEnter / Stay / Exit         (3D)
OnTriggerEnter2D / Stay2D / Exit2D   (2D)
```
- Khi vào/ở trong/ra khỏi một **vùng trigger** (collider có `Is Trigger = true`). **Xuyên qua nhau**, không đẩy — dùng cho vùng phát hiện (nhặt đồ, vùng nguy hiểm, checkpoint).
- Chi tiết: [Physics: Rigidbody & Collider](./physics-rigidbody-collider.md).

### Giai đoạn KẾT THÚC

```csharp
OnDisable()   // khi object/component bị tắt → HỦY đăng ký event ở đây
OnDestroy()   // khi object bị hủy hoàn toàn → dọn dẹp lần cuối
```

---

## 5. ⭐ Update vs FixedUpdate — hiểu nhầm kinh điển nhất

| | `Update` | `FixedUpdate` |
|--|----------|---------------|
| Nhịp gọi | Mỗi frame (theo FPS, **không đều**) | Mỗi 0.02s (**đều**, theo thời gian) |
| Dùng cho | Input, logic, di chuyển thường | **Vật lý** (Rigidbody, lực) |
| Bước thời gian | `Time.deltaTime` (thay đổi) | `Time.fixedDeltaTime` (cố định) |
| Đọc input ở đây? | ✅ Có (`GetKeyDown` chỉ đúng ở Update) | ❌ Không (dễ bỏ lỡ input) |

**Quy tắc thực tế:**
- Đọc input → `Update`.
- Đẩy Rigidbody bằng lực/velocity → `FixedUpdate`.
- Mẫu phổ biến: đọc input ở `Update`, lưu vào biến, rồi **dùng** biến đó để tác động vật lý ở `FixedUpdate`.

```csharp
float moveInput;
void Update()      { moveInput = Input.GetAxis("Horizontal"); } // đọc input
void FixedUpdate() { rb.velocity = new Vector2(moveInput * speed, rb.velocity.y); } // áp vật lý
```

---

## 6. Ứng dụng thực tế (đặt code vào đâu?)

| Tôi muốn... | Đặt ở |
|-------------|-------|
| Cache `GetComponent` của chính mình | `Awake` |
| Lấy tham chiếu tới Manager khác | `Start` |
| Đăng ký / hủy đăng ký event | `OnEnable` / `OnDisable` |
| Đọc input bàn phím/chuột | `Update` |
| Di chuyển nhân vật bằng Rigidbody | `FixedUpdate` |
| Đếm thời gian, cooldown | `Update` (× `Time.deltaTime`) |
| Camera bám theo nhân vật | `LateUpdate` |
| Phản ứng khi nhặt vật phẩm | `OnTriggerEnter` |
| Dọn dẹp khi object chết | `OnDestroy` |

---

## 7. Lỗi thường gặp

### ❌ Quên `Time.deltaTime` trong Update
```csharp
void Update() { transform.position += Vector3.right * speed; } // SAI
```
Máy 144 FPS chạy nhanh gấp ~5 lần máy 30 FPS → game không công bằng.
✅ **Đúng:**
```csharp
void Update() { transform.position += Vector3.right * speed * Time.deltaTime; }
// Nhân deltaTime → "mỗi GIÂY đi speed mét", không phụ thuộc FPS
```

### ❌ Tác động vật lý trong `Update`
Đẩy Rigidbody trong `Update` → giật, không ổn định. Luôn dùng `FixedUpdate`.

### ❌ Đọc `GetKeyDown` trong `FixedUpdate`
`GetKeyDown` chỉ `true` đúng frame phím được nhấn. `FixedUpdate` không chạy mỗi frame → có thể **bỏ lỡ** lần nhấn. Đọc input ở `Update`.

### ❌ Giả định thứ tự `Awake` giữa các object
Bạn **không biết** object nào `Awake` trước. Đừng trong `Awake` của A mà gọi dữ liệu được set trong `Awake` của B. Dùng `Start` cho việc liên-object, hoặc đặt Script Execution Order nếu thật cần.

### ❌ Quên hủy đăng ký event trong `OnDisable`
Đăng ký event trong `OnEnable` mà không `-=` trong `OnDisable` → memory leak + lỗi gọi vào object đã chết. Xem [Memory Management](../../05-Technical-Deep-Dives/memory-management.md).

### ❌ `Update` rỗng vẫn tốn chi phí
Unity vẫn gọi qua mọi `Update` (kể cả rỗng) → overhead khi có hàng nghìn object. Xóa `Update` không dùng.

---

## 8. Best practices

- ✅ `Awake` lo bản thân, `Start` lo liên kết bên ngoài.
- ✅ Luôn `Time.deltaTime` cho chuyển động/đếm giờ trong `Update`.
- ✅ Vật lý ở `FixedUpdate`, input ở `Update`.
- ✅ Cặp `OnEnable` (đăng ký) ↔ `OnDisable` (hủy) cho event.
- ✅ Xóa hàm lifecycle rỗng.
- ✅ Khi nhiều object cần phối hợp thứ tự, cân nhắc một "manager" điều phối thay vì dựa vào thứ tự lifecycle ngầm.

---

## 9. Liên kết
- [GameObject & Component](./gameobject-component.md) — MonoBehaviour chính là một Component.
- [Coroutine](./coroutine.md) — chạy logic trải dài nhiều frame, gắn vào lifecycle.
- [Physics: Rigidbody & Collider](./physics-rigidbody-collider.md) — vì sao FixedUpdate tồn tại.
- [Input](./input.md) — vì sao đọc input ở Update.
- Nâng cao: Script Execution Order & player loop → [Senior skills](../../04-Senior/skills.md).

---

[⬅️ GameObject & Component](./gameobject-component.md) | [Transform ➡️](./transform.md)
