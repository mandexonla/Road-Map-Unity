# 🧠 Intern — Kỹ Năng & Kiến Thức Cần Nắm

[⬅️ Intern Overview](./README.md) | [Projects ➡️](./projects.md)

> 📕 **Muốn hiểu BẢN CHẤT từng khái niệm?** Mỗi mục dưới đây có link 🔎 dẫn tới [**Knowledge Base**](../08-Knowledge-Base/README.md) — giải thích sâu cách hoạt động bên trong, ưu/nhược điểm, lỗi thường gặp. Học ở đây, đừng đi tìm chỗ khác.

---

## A. C# Nền Tảng (HỌC TRƯỚC TIÊN — quan trọng nhất)

> 🔑 90% người mới yếu Unity vì yếu C#. Đừng bỏ qua phần này.

### 1. Cú pháp cơ bản
- Biến và kiểu dữ liệu: `int`, `float`, `bool`, `string`, `char`.
- Toán tử: `+ - * / %`, so sánh `== != < >`, logic `&& || !`.
- `if / else if / else`, `switch`.
- Vòng lặp: `for`, `while`, `foreach`.

### 2. Hàm (Method)
- Khai báo, tham số, giá trị trả về.
- `void` vs có return.
- Hiểu "tách logic ra hàm để tái dùng".

### 3. Lập trình hướng đối tượng (OOP) — cốt lõi
- **Class & Object:** khuôn mẫu và thực thể.
- **Field, Property, Method.**
- **Đóng gói (Encapsulation):** `public`, `private`, `protected`.
- **Kế thừa (Inheritance):** `class Enemy : MonoBehaviour`.
- **Đa hình (Polymorphism):** `virtual` / `override`.
- Hiểu `this`, constructor.

### 4. Cấu trúc dữ liệu hay dùng
- `Array` (mảng cố định).
- `List<T>` (danh sách động) — dùng cực nhiều.
- `Dictionary<K,V>` (cơ bản).
- `enum` (liệt kê trạng thái).

> 💡 Học C# ở mức "viết được logic game", chưa cần LINQ, async, delegate sâu (để dành Junior).

---

## B. Unity Editor — Hiểu Giao Diện & Khái Niệm

> 🔎 Đọc sâu: [GameObject & Component](../08-Knowledge-Base/intern/gameobject-component.md) · [Transform & Hệ tọa độ](../08-Knowledge-Base/intern/transform.md) · [Prefab](../08-Knowledge-Base/intern/prefab.md) · [Serialization & Inspector](../08-Knowledge-Base/intern/serialization-and-inspector.md)

### 1. Các khái niệm cốt lõi
| Khái niệm | Là gì |
|-----------|-------|
| **GameObject** | Mọi thứ trong scene đều là GameObject (nhân vật, camera, đèn...) |
| **Component** | "Mảnh ghép" gắn vào GameObject để cho nó khả năng (Rigidbody, script...) |
| **Transform** | Vị trí, xoay, tỉ lệ — mọi GameObject đều có |
| **Prefab** | "Khuôn" GameObject tái sử dụng được (rất quan trọng) |
| **Scene** | Một "màn"/level chứa các GameObject |
| **Asset** | File tài nguyên (sprite, model, audio, script...) |

### 2. Các cửa sổ chính
- **Hierarchy:** cây GameObject trong scene.
- **Inspector:** chỉnh thuộc tính của object đang chọn.
- **Project:** quản lý file/asset.
- **Scene view / Game view:** dựng cảnh / xem game chạy.
- **Console:** xem log và lỗi (BẠN SẼ SỐNG Ở ĐÂY khi debug).

---

## C. MonoBehaviour — Linh Hồn Của Script Unity

> 🔎 Đọc sâu: [MonoBehaviour & Vòng đời (Lifecycle)](../08-Knowledge-Base/intern/monobehaviour-lifecycle.md) — bản chất game loop, Update vs FixedUpdate, thứ tự thực thi.

### Vòng đời (Lifecycle) — PHẢI THUỘC
```csharp
Awake()        // Gọi 1 lần khi object được tạo (trước Start). Khởi tạo nội bộ.
OnEnable()     // Mỗi khi object được bật.
Start()        // Gọi 1 lần trước frame đầu. Khởi tạo cần object khác đã sẵn sàng.
Update()       // Gọi MỖI FRAME. Logic game, input. (Tốc độ phụ thuộc FPS)
FixedUpdate()  // Gọi đều theo thời gian. Dùng cho VẬT LÝ (Rigidbody).
LateUpdate()   // Sau Update. Dùng cho camera theo dõi.
OnDisable()    // Khi object bị tắt.
OnDestroy()    // Khi object bị hủy.
```

> 🔑 Hiểu sai `Update` vs `FixedUpdate` là lỗi kinh điển. **Vật lý → FixedUpdate. Input/logic → Update.**

### Va chạm
```csharp
OnCollisionEnter(2D)  // Khi 2 collider đặc va vào nhau (có vật lý đẩy).
OnTriggerEnter(2D)    // Khi vào vùng trigger (xuyên qua, dùng cho vùng phát hiện).
```

---

## D. Vật Lý Cơ Bản

> 🔎 Đọc sâu: [Physics: Rigidbody & Collider](../08-Knowledge-Base/intern/physics-rigidbody-collider.md) — engine vật lý hoạt động thế nào, collision vs trigger, Dynamic/Kinematic/Static, xuyên tường.

- **Rigidbody / Rigidbody2D:** cho object chịu vật lý (trọng lực, lực).
- **Collider:** hình va chạm (Box, Circle/Sphere, Capsule, Polygon).
- **Is Trigger:** biến collider thành vùng phát hiện (không đẩy).
- Di chuyển: `transform.position` (đơn giản) vs `Rigidbody.velocity`/`MovePosition` (đúng vật lý).

> 💡 Học 2D trước, 3D sau. 2D dễ hình dung và đủ để làm nhiều game hay.

---

## E. Input

> 🔎 Đọc sâu: [Input](../08-Knowledge-Base/intern/input.md) — polling vs event, Input Manager cũ vs Input System mới, tách input khỏi logic.

- `Input.GetKey / GetKeyDown / GetKeyUp` — bàn phím.
- `Input.GetAxis("Horizontal")` — trục di chuyển mượt.
- `Input.GetMouseButtonDown` — chuột.
- Touch cơ bản cho mobile.

> 📌 Unity có **Input System (mới)** và **Input Manager (cũ)**. Ở Intern dùng cái cũ (`Input.GetKey`) cho đơn giản. Học Input System ở Junior.

---

## F. UI Cơ Bản

- **Canvas:** vùng chứa mọi UI.
- **Text (TextMeshPro):** hiển thị chữ/điểm số. Dùng **TextMeshPro**, không dùng Text cũ.
- **Button:** nút bấm + sự kiện `OnClick`.
- **Image:** ảnh, thanh máu...
- Hiển thị điểm số, mạng, màn hình Game Over / Win.

---

## G. Âm Thanh

- **AudioSource:** component phát âm thanh.
- **AudioClip:** file âm thanh.
- `audioSource.PlayOneShot(clip)` cho SFX.
- Nhạc nền vs hiệu ứng (SFX).

---

## H. Công Cụ & Thói Quen (bắt đầu xây ngay)

### Git (bắt buộc, học ngay)
- `git init`, `git add`, `git commit`, `git push`, `git pull`.
- `.gitignore` cho Unity (Unity tự tạo, hoặc dùng template chuẩn).
- Branch cơ bản: `git branch`, `git checkout`.
- Xem chi tiết: [Version Control](../05-Technical-Deep-Dives/version-control.md).

### Debug
- `Debug.Log()`, `Debug.LogWarning()`, `Debug.LogError()`.
- Đọc stack trace trong Console.
- Đặt breakpoint trong IDE (Visual Studio/Rider).

### Thói quen tốt
- Đặt tên biến/hàm rõ ràng (tiếng Anh): `playerSpeed`, không `a`, `x1`.
- Comment khi code khó hiểu.
- Commit nhỏ, thường xuyên, message rõ ràng.

---

## Bản đồ phụ thuộc kiến thức

```
C# nền tảng ──► MonoBehaviour ──► Vật lý + Input ──► UI + Audio ──► Game hoàn chỉnh
     │                                                                    │
     └────────────────────► Git + Debug (xuyên suốt) ◄────────────────────┘
```

---

[⬅️ Intern Overview](./README.md) | [Projects ➡️](./projects.md)
