# 💾 Serialization & Inspector

[⬅️ Knowledge Base](../README.md) | Liên quan: [GameObject & Component](./gameobject-component.md)

> Hiểu serialization giải thích **rất nhiều thứ "kỳ lạ"** của Unity: tại sao `public` lại hiện ra Inspector, tại sao đổi code mà giá trị không đổi, tại sao một số kiểu không lưu được.

---

## 1. Bản chất

**Serialization (tuần tự hóa) = biến dữ liệu trong bộ nhớ thành dạng lưu được** (text/binary) để Unity ghi xuống đĩa, rồi **deserialize** (nạp lại) khi mở. Nghe khô khan, nhưng nó là cơ chế đứng sau:
- **Inspector** hiển thị & chỉnh được giá trị của script.
- **Scene & Prefab** lưu được trạng thái object.
- Giá trị bạn set trong Editor **được nhớ** khi chạy game.

> 🔑 Khi bạn kéo một object vào ô trong Inspector, hay gõ số máu = 100, Unity đang **serialize** giá trị đó vào file scene/prefab. Inspector chỉ là **giao diện trực quan của serialization**.

---

## 2. Vấn đề nó giải quyết

Code và dữ liệu là hai thứ khác nhau:
- **Code** (logic) nằm trong file `.cs`.
- **Dữ liệu** (máu = 100, tốc độ = 5, prefab nào để spawn) cần **lưu riêng** và **chỉnh được mà không sửa code**.

Serialization cho phép **designer chỉnh số liệu trong Inspector** mà không đụng tới code, và những chỉnh sửa đó **được lưu lại**. Đây là nền tảng của tư duy **data-driven** (xem [Architecture](../../05-Technical-Deep-Dives/architecture.md)).

---

## 3. Cách hoạt động bên trong

### Field nào được serialize?
Unity serialize một field khi nó thỏa **tất cả**:
1. `public` **HOẶC** có attribute `[SerializeField]`.
2. **Không** `static`, **không** `const`, **không** `readonly`.
3. Kiểu của nó **Unity hỗ trợ serialize** (xem dưới).

```csharp
public int health;          // ✅ serialize (public) → hiện Inspector
[SerializeField] int speed;  // ✅ serialize (private nhưng có attribute) → hiện Inspector
private int temp;            // ❌ không serialize → không hiện, không lưu
public static int count;     // ❌ static → không serialize
[System.NonSerialized] public int runtimeOnly; // ❌ ép không serialize dù public
```

### Kiểu nào serialize được?
- ✅ Kiểu cơ bản: `int`, `float`, `bool`, `string`, `enum`.
- ✅ Kiểu Unity: `Vector3`, `Color`, `Quaternion`, `AnimationCurve`...
- ✅ Tham chiếu tới `UnityEngine.Object` (GameObject, Component, ScriptableObject, asset...).
- ✅ `List<T>` và **mảng** của các kiểu trên.
- ✅ Class/struct của bạn nếu đánh dấu `[System.Serializable]`.
- ❌ `Dictionary` (KHÔNG serialize mặc định — bẫy phổ biến!).
- ❌ Property (chỉ field, không serialize property có `{ get; set; }`).
- ❌ Kiểu generic tùy biến, interface (mặc định; có `[SerializeReference]` cho nâng cao).

### `public` ≠ "nên cho Inspector"
Nhiều người để `public` **chỉ để hiện Inspector**. Nhưng `public` còn nghĩa là "mọi script khác sửa được biến này" → phá vỡ đóng gói (encapsulation). **Cách đúng:** dùng `[SerializeField] private`.

```csharp
// ❌ public chỉ để lộ Inspector → ai cũng sửa được health
public int health;

// ✅ private + SerializeField → hiện Inspector NHƯNG vẫn đóng gói
[SerializeField] private int health;
```

---

## 4. Cú pháp & ví dụ

```csharp
public class Enemy : MonoBehaviour
{
    [Header("Chỉ số")]                 // tạo tiêu đề nhóm trong Inspector
    [SerializeField] private int maxHealth = 100;
    [SerializeField, Range(0, 20)] private float speed = 5; // thanh trượt 0-20
    [Tooltip("Phần thưởng khi chết")]  // chú thích khi rê chuột
    [SerializeField] private int reward = 10;

    [Space]                            // khoảng trống cho dễ nhìn
    [SerializeField] private GameObject deathEffect; // kéo prefab vào Inspector

    [System.Serializable]              // class lồng nhau muốn hiện Inspector
    public class LootDrop {
        public GameObject item;
        public float chance;
    }
    [SerializeField] private List<LootDrop> drops; // list class serialize được
}
```

Các attribute hữu ích: `[Header]`, `[Tooltip]`, `[Range]`, `[Space]`, `[Min]`, `[TextArea]`, `[HideInInspector]` (không hiện dù public), `[SerializeField]`, `[System.NonSerialized]`.

---

## 5. Ứng dụng thực tế

- **Lộ tham số cho designer chỉnh** (máu, tốc độ, damage) mà không sửa code.
- **Gán tham chiếu qua Inspector** (kéo prefab/object vào ô) thay vì `Find` trong code → nhanh & rõ ràng.
- **Lưu trạng thái scene/prefab.**
- Nền tảng cho [ScriptableObject](../../05-Technical-Deep-Dives/architecture.md) — data asset cũng dựa trên serialization.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm / Giới hạn |
|---------|------------------------|
| Designer chỉnh data trực quan, không cần code | Không serialize `Dictionary`, property |
| Tách data khỏi logic (data-driven) | Đổi tên field → mất giá trị đã set (xem mục 7) |
| Gán tham chiếu an toàn qua Inspector | Kiểu tùy biến cần `[System.Serializable]` |
| Tự lưu/nạp scene & prefab | Polymorphism cần `[SerializeReference]` (nâng cao) |

---

## 7. Lỗi thường gặp

### ❌ Dùng `public` chỉ để hiện Inspector
Phá đóng gói. Dùng `[SerializeField] private`.

### ❌ Đổi tên field → giá trị "biến mất"
Unity nhận diện field theo **tên**. Đổi `health` → `hp`, Unity coi `hp` là field MỚI (giá trị mặc định), còn `health` cũ bị bỏ → **mất giá trị đã set trong Inspector**.
✅ Giải: dùng `[FormerlySerializedAs("health")]` khi đổi tên để giữ giá trị.
```csharp
using UnityEngine.Serialization;
[FormerlySerializedAs("health")]
[SerializeField] private int hp;
```

### ❌ Mong `Dictionary` hiện trong Inspector
Không serialize được. Giải pháp: dùng `List` của một class `[Serializable]` chứa key+value, hoặc thư viện serialize dictionary.

### ❌ Sửa giá trị trong Inspector lúc Play Mode rồi mất
Mọi thay đổi trong **Play Mode không được lưu** (Unity revert khi thoát Play). Đây là tính năng, không phải bug — để bạn thử nghiệm an toàn.

### ❌ Đặt giá trị mặc định trong code nhưng Inspector "không đổi"
Khi field đã serialize, **giá trị trong Inspector ĐÈ giá trị khởi tạo trong code**. Bạn sửa `= 100` thành `= 200` trong code nhưng object cũ vẫn hiện 100 vì giá trị 100 đã được serialize. Đây là nguồn nhầm lẫn lớn của người mới.

---

## 8. Best practices

- ✅ Mặc định dùng `[SerializeField] private`, chỉ `public` khi thật sự cần script khác truy cập.
- ✅ Dùng `[Header]`, `[Tooltip]`, `[Range]` để Inspector gọn gàng, dễ cho designer.
- ✅ Gán tham chiếu qua Inspector thay vì `GameObject.Find`.
- ✅ Dùng `[FormerlySerializedAs]` khi đổi tên field đã có dữ liệu.
- ✅ Hiểu rằng giá trị Inspector **đè** giá trị mặc định trong code.
- ✅ Cân nhắc chuyển data tĩnh sang [ScriptableObject](../../02-Junior/skills.md) khi dữ liệu được chia sẻ/tái dùng.

---

## 9. Liên kết
- [GameObject & Component](./gameobject-component.md) — Inspector hiển thị component & field serialize của chúng.
- ScriptableObject (data asset) — [Junior skills](../../02-Junior/skills.md), [Architecture](../../05-Technical-Deep-Dives/architecture.md).
- Serialization nâng cao (`[SerializeReference]`, custom serialization) — [Senior skills](../../04-Senior/skills.md).

---

[⬅️ Transform](./transform.md) | [Input ➡️](./input.md)
