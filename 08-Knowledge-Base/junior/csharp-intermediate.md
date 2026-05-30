# 🧮 C# Trung Cấp cho Unity

[⬅️ Knowledge Base](../README.md) | Liên quan: [Generics](./generics.md) · [Clean Code](./clean-code.md)

> Gom các tính năng C# quan trọng mà Junior cần nắm chắc: properties, các từ khóa, nullable, exception. Hiểu đúng tránh nhiều bug & code xấu.

---

## 1. Properties (Thuộc tính) — không chỉ là "field public đẹp"

### Bản chất
**Property là cặp hàm get/set ngụy trang thành field.** Bên ngoài dùng như biến (`player.Health = 10`), nhưng bên trong có thể **chạy logic** khi đọc/ghi.

```csharp
private int health;
public int Health {
    get => health;                       // chạy khi đọc
    set {
        health = Mathf.Clamp(value, 0, max); // chạy khi ghi: tự kẹp 0..max
        OnHealthChanged?.Invoke(health);      // phát event mỗi khi đổi
    }
}
```

### Vì sao quan trọng (Encapsulation)
Field `public` cho ai cũng sửa **tùy tiện** (gán máu = -999). Property kiểm soát:
- **Read-only ra ngoài, write trong nhà:** `public int Score { get; private set; }`.
- **Validate khi gán** (clamp, kiểm tra).
- **Phản ứng khi đổi** (phát event, cập nhật UI).

```csharp
public int Score { get; private set; }    // đọc mọi nơi, chỉ class này sửa
public float Speed { get; } = 5;           // chỉ đọc, set 1 lần
public bool IsAlive => health > 0;         // computed — tính từ thứ khác, không lưu
```

> 🔑 Quy tắc: **Field thì `private`. Lộ ra ngoài bằng property.** Đừng để field `public` trừ khi có lý do (và trong Unity, để hiện Inspector dùng `[SerializeField] private`, xem [Serialization](../intern/serialization-and-inspector.md)).

---

## 2. Các từ khóa quan trọng

| Từ khóa | Nghĩa | Ví dụ dùng |
|---------|-------|-----------|
| `const` | Hằng số, cố định lúc biên dịch, không đổi | `const int MaxLevel = 100;` |
| `readonly` | Gán một lần (lúc khai báo hoặc constructor), sau đó khóa | `readonly List<int> items;` |
| `static` | Thuộc về **class**, không thuộc instance (dùng chung) | `static int totalEnemies;` |
| `this` | Tham chiếu tới instance hiện tại | `this.health` |
| `base` | Gọi thành viên của lớp cha | `base.Die();` |

### `static` — hiểu kỹ kẻo lạm dụng
`static` = "có **một** bản duy nhất cho cả chương trình". Tiện để chia sẻ (`GameManager.Instance`), nhưng:
- Trạng thái static **tồn tại suốt app** → dễ rò rỉ, khó test, khó reset.
- ⚠️ Trong Unity, static **không tự reset** khi đổi scene/restart (đặc biệt khi tắt "Domain Reload") → bug "giá trị còn sót từ lần chơi trước". Cẩn thận.

---

## 3. Nullable & xử lý null

```csharp
int? maybeNumber = null;          // int nullable — được phép null
string name = null;

// ?. (null-conditional): chỉ gọi nếu KHÔNG null
target?.TakeDamage(10);           // không lỗi nếu target null

// ?? (null-coalescing): giá trị thay thế nếu null
string display = name ?? "Unknown";

// ??= : gán nếu đang null
config ??= LoadDefaultConfig();
```

> ⚠️ **Bẫy Unity:** Unity override toán tử `==` cho `UnityEngine.Object`. Một object đã `Destroy` so sánh `== null` trả `true` (gọi là "fake null"), **nhưng** `?.` lại **không** nhận ra fake null → có thể gọi vào object đã hủy. Với object Unity, ưu tiên `if (obj != null)` hơn là `obj?.`.

---

## 4. Exception (Ngoại lệ)

```csharp
try {
    var data = LoadSave(path);
} catch (FileNotFoundException e) {
    Debug.LogWarning($"Không tìm thấy save: {e.Message}");
    data = NewGame();
} finally {
    stream?.Close();   // luôn chạy, dù lỗi hay không
}
```

### Khi nào dùng exception?
- ✅ Cho **tình huống bất thường thật** (file hỏng, mạng lỗi, input ngoài dự kiến).
- ❌ **KHÔNG** dùng exception cho luồng logic bình thường (vd "hết máu") → exception **chậm** và sinh rác.
- ❌ Tránh `try/catch` trong hot path.
- ✅ Dùng kiểm tra điều kiện (`if`) cho luồng thường; exception cho lỗi thật.

---

## 5. Vài tính năng C# hiện đại hữu ích

```csharp
// Pattern matching
if (component is Rigidbody rb) rb.AddForce(...);

// Switch expression
string label = state switch {
    GameState.Menu => "Menu",
    GameState.Play => "Đang chơi",
    _ => "Khác"
};

// String interpolation (thay vì "a" + b + "c")
Debug.Log($"Player {name} có {health} máu");

// Tuple
(int min, int max) GetRange() => (0, 100);

// Expression-bodied member (gọn)
public bool IsAlive => health > 0;
void Reset() => health = max;
```

> ⚠️ String interpolation/concat **sinh rác** — tránh trong `Update`. Dùng `StringBuilder` nếu nối chuỗi nhiều.

---

## 6. Lỗi thường gặp

### ❌ Để field `public` thay vì property
Mất kiểm soát, ai cũng sửa. Dùng property + `private set`.

### ❌ Lạm dụng `static` làm trạng thái toàn cục
Khó test, leak, không reset giữa scene. Dùng tiết kiệm, có chủ đích.

### ❌ Dùng `?.` cho object Unity đã Destroy
Fake null — `?.` không nhận ra. Dùng `!= null` cho `UnityEngine.Object`.

### ❌ Dùng exception cho logic thường
Chậm + sinh rác. Dùng `if`.

### ❌ Nối chuỗi `+` trong Update
Sinh rác mỗi frame. Cache hoặc `StringBuilder`.

---

## 7. Best practices

- ✅ Field `private`, lộ ra bằng property; dùng `private set` cho read-only ngoài.
- ✅ `const`/`readonly` cho giá trị không đổi → an toàn + rõ ý.
- ✅ `static` chỉ khi thật cần dùng chung; cẩn thận reset trong Unity.
- ✅ `!= null` cho object Unity; `?.`/`??` cho object C# thuần.
- ✅ Exception cho lỗi thật, `if` cho luồng thường.
- ✅ Tận dụng pattern matching, switch expression, interpolation để code gọn — nhưng nhớ chi phí GC của chuỗi trong hot path.

---

## 8. Liên kết
- [Serialization & Inspector](../intern/serialization-and-inspector.md) — property KHÔNG serialize; field mới serialize.
- [Generics](./generics.md) · [Clean Code](./clean-code.md).
- [Garbage Collection](./garbage-collection-basics.md) — vì sao string/exception trong hot path xấu.

---

[⬅️ LINQ](./linq.md) | [Clean Code ➡️](./clean-code.md)
