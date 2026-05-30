# 🧩 GameObject & Component

[⬅️ Knowledge Base](../README.md) | Liên quan: [MonoBehaviour](./monobehaviour-lifecycle.md) · [Transform](./transform.md)

> Đây là khái niệm **nền móng nhất** của Unity. Hiểu sai chỗ này thì mọi thứ sau đều lệch. Hãy đọc kỹ.

---

## 1. Bản chất

**GameObject là một cái "thùng rỗng".** Tự nó **không làm gì cả** — không có hình dạng, không có hành vi, không có vật lý. Nó chỉ là một **vật chứa (container)** có:
- Một cái tên.
- Một vị trí trong thế giới (qua Transform — component duy nhất bắt buộc).
- Một **danh sách các Component** gắn vào nó.

**Component là "khả năng".** Mỗi component thêm **một khả năng cụ thể** cho GameObject:
- `MeshRenderer` → cho nó **hiển thị** hình.
- `Rigidbody` → cho nó **chịu vật lý**.
- `Collider` → cho nó **va chạm**.
- `AudioSource` → cho nó **phát âm thanh**.
- Script của bạn (`PlayerController`) → cho nó **hành vi riêng**.

> 🔑 **Câu thần chú:** *GameObject = "cái gì đó tồn tại". Component = "nó có thể làm gì".* Một nhân vật game = 1 GameObject (rỗng) + nhiều component ghép lại (renderer + rigidbody + collider + script).

```
        GameObject "Player"
        ┌──────────────────────────┐
        │ Transform   (vị trí)      │  ← bắt buộc, luôn có
        │ SpriteRenderer (hình)     │  ← khả năng hiển thị
        │ Rigidbody2D (vật lý)      │  ← khả năng vật lý
        │ BoxCollider2D (va chạm)   │  ← khả năng va chạm
        │ PlayerController (script) │  ← hành vi do bạn viết
        └──────────────────────────┘
```

---

## 2. Vấn đề nó giải quyết: "Composition over Inheritance"

Đây là **lý do sâu xa** Unity thiết kế như vậy. Có hai cách xây dựng đối tượng game:

### ❌ Cách cũ — Kế thừa (Inheritance)
```
        Entity
          ├── Character
          │     ├── Player
          │     └── Enemy
          │           ├── FlyingEnemy
          │           └── SwimmingEnemy
          └── ...
```
Vấn đề: Nếu cần một kẻ địch **vừa bay vừa bơi**? Cây kế thừa sụp đổ. Bạn không thể kế thừa từ cả `FlyingEnemy` và `SwimmingEnemy`. Đây gọi là **"the diamond problem"** / **"gorilla-banana problem"**: muốn quả chuối nhưng nhận cả con khỉ và cả khu rừng.

### ✅ Cách Unity — Lắp ghép (Composition)
Thay vì "Enemy **LÀ** một loại Character", ta nói "Enemy **CÓ** khả năng bay + khả năng bơi":
```
GameObject "Enemy" = [FlyAbility] + [SwimAbility] + [Health] + [AI]
```
Cần thêm khả năng → **gắn thêm component**. Cần bớt → **gỡ component**. Cực kỳ linh hoạt.

> 🔑 **Đây là triết lý cốt lõi của Unity:** xây đối tượng bằng cách **ghép các mảnh khả năng nhỏ**, thay vì xây cây kế thừa cứng nhắc. Hiểu điều này = hiểu "tư duy Unity".

---

## 3. Cách hoạt động bên trong

- GameObject thực ra là một **ID nhẹ** trong engine, giữ một danh sách tham chiếu tới các component của nó.
- Engine (viết bằng C++) quản lý các component theo loại để xử lý hiệu quả: tất cả `Rigidbody` được hệ vật lý xử lý cùng nhau, tất cả `Renderer` được hệ render xử lý cùng nhau...
- Khi bạn gọi `GetComponent<T>()`, engine **duyệt danh sách component** của GameObject đó tìm cái khớp kiểu `T`. → Vì là **tìm kiếm**, nó **tốn chi phí** nếu gọi liên tục (xem mục Lỗi thường gặp).
- Mỗi GameObject **bắt buộc có Transform** — đó là lý do bạn không bao giờ gỡ được Transform.

---

## 4. Cú pháp & ví dụ

### Truy cập component
```csharp
// Lấy component trên CHÍNH GameObject này
Rigidbody rb = GetComponent<Rigidbody>();

// Lấy trên con / cha
Renderer r = GetComponentInChildren<Renderer>();
Health h  = GetComponentInParent<Health>();

// Lấy nhiều cùng loại
Collider[] all = GetComponents<Collider>();

// Thêm component bằng code
var audio = gameObject.AddComponent<AudioSource>();

// Kiểm tra có component không (C# pattern hiện đại)
if (TryGetComponent<Rigidbody>(out var body)) {
    body.AddForce(Vector3.up);
}
```

### GameObject vs gameObject (chữ hoa/thường)
```csharp
// "gameObject" (thường) = GameObject mà script này đang gắn vào
gameObject.SetActive(false);          // tắt object hiện tại

// "GameObject" (hoa) = cái CLASS, dùng cho hàm static
GameObject.Find("Player");            // tìm object theo tên (chậm!)
GameObject.Instantiate(prefab);       // tạo object mới
```

---

## 5. Ứng dụng thực tế

- **Mọi thứ trong scene đều là GameObject:** nhân vật, camera, đèn, UI, điểm spawn, vùng trigger, manager vô hình...
- **GameObject rỗng làm "manager"/"điểm neo":** một GameObject không có hình, chỉ chứa script quản lý (`GameManager`, `AudioManager`) hoặc đánh dấu vị trí (spawn point).
- **Tổ chức scene:** dùng GameObject rỗng làm "thư mục" chứa các object con (vd object "Enemies" chứa mọi kẻ địch).
- **Bật/tắt khả năng động:** `enabled = false` cho một component để tắt riêng khả năng đó mà không xóa object.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Cực kỳ linh hoạt (ghép/tháo khả năng) | Dễ tạo GameObject "ôm đồm" quá nhiều component |
| Tái sử dụng component cho nhiều loại object | `GetComponent` tốn chi phí nếu lạm dụng |
| Designer lắp ráp object không cần code | Quá nhiều object/component nhỏ → khó quản lý |
| Trực quan trong Inspector | Giao tiếp giữa các component cần thiết kế (dễ thành rối) |

---

## 7. Lỗi thường gặp

### ❌ Gọi `GetComponent` mỗi frame trong `Update`
```csharp
void Update() {
    GetComponent<Rigidbody>().velocity = ...; // SAI: tìm kiếm mỗi frame → chậm
}
```
✅ **Đúng — cache một lần:**
```csharp
Rigidbody rb;
void Awake() { rb = GetComponent<Rigidbody>(); } // tìm 1 lần
void Update() { rb.velocity = ...; }              // dùng lại
```

### ❌ Nhầm `gameObject.SetActive(false)` với `component.enabled = false`
- `gameObject.SetActive(false)` → **tắt cả object** (mọi component ngừng, không nhận Update, biến mất).
- `component.enabled = false` → chỉ tắt **một component** đó (vd tắt script nhưng object vẫn hiển thị).

### ❌ `GetComponent` trả về `null` không kiểm tra
Nếu component không tồn tại, `GetComponent` trả `null` → gọi vào nó gây `NullReferenceException`. Luôn kiểm tra hoặc dùng `TryGetComponent`.

### ❌ Lạm dụng `GameObject.Find` / `FindObjectOfType`
Các hàm này **quét toàn scene** → rất chậm. Tránh trong `Update`. Thay bằng tham chiếu trực tiếp ([SerializeField]) hoặc event.

---

## 8. Best practices

- ✅ **Cache** mọi component bạn dùng nhiều lần (trong `Awake`).
- ✅ Ưu tiên **gán tham chiếu qua Inspector** (`[SerializeField]`) thay vì `Find`.
- ✅ Mỗi component nên làm **một việc rõ ràng** (Single Responsibility) — đừng nhồi tất cả vào 1 script khổng lồ.
- ✅ Dùng `RequireComponent(typeof(Rigidbody))` để Unity tự thêm component phụ thuộc.
- ✅ Tư duy "object này **cần khả năng gì**?" rồi ghép component, thay vì "object này **là loại gì**?".

```csharp
[RequireComponent(typeof(Rigidbody))] // đảm bảo luôn có Rigidbody
public class Mover : MonoBehaviour {
    Rigidbody rb;
    void Awake() => rb = GetComponent<Rigidbody>();
}
```

---

## 9. Liên kết
- [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) — script của bạn chính là một loại Component đặc biệt.
- [Transform](./transform.md) — component bắt buộc của mọi GameObject.
- [Prefab](./prefab.md) — "khuôn" lưu một GameObject + component đã cấu hình sẵn.
- Tư duy composition liên hệ với [Architecture](../../05-Technical-Deep-Dives/architecture.md).

---

[⬅️ Knowledge Base](../README.md) | [MonoBehaviour & Lifecycle ➡️](./monobehaviour-lifecycle.md)
