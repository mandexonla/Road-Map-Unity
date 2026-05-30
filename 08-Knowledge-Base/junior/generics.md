# 📦 Generics (Kiểu Tổng Quát)

[⬅️ Knowledge Base](../README.md) | Liên quan: [LINQ](./linq.md) · [Object Pooling](./object-pooling.md)

---

## 1. Bản chất

**Generics cho phép viết code hoạt động với "một kiểu bất kỳ" mà không cần biết trước kiểu đó là gì.** Bạn để một "chỗ trống" `T` (type parameter), và kiểu thật được điền vào lúc dùng.

`List<T>` bạn dùng hằng ngày chính là generic: `List<int>`, `List<Enemy>`, `List<string>` — **một** class `List` phục vụ **mọi** kiểu.

> 🔑 Ý tưởng: *Viết logic một lần, dùng cho mọi kiểu — mà vẫn an toàn kiểu (type-safe).* Không cần copy-paste `IntList`, `EnemyList`, `StringList`.

---

## 2. Vấn đề nó giải quyết

Không có generics, bạn có 2 lựa chọn tệ:

**Cách 1 — copy code cho từng kiểu (lặp):**
```csharp
class IntStack { void Push(int x){} int Pop(){} }
class EnemyStack { void Push(Enemy x){} Enemy Pop(){} } // lặp y hệt!
```

**Cách 2 — dùng `object` (mất an toàn kiểu + boxing):**
```csharp
class Stack { void Push(object x){} object Pop(){} }
int x = (int)stack.Pop(); // phải ép kiểu, dễ lỗi runtime, boxing tốn GC
```

**Generics — tốt cả hai mặt:**
```csharp
class Stack<T> { void Push(T x){} T Pop(){} }
Stack<int> s = new();    // an toàn kiểu, không ép, không boxing
int x = s.Pop();          // trả thẳng int
```

---

## 3. Cách hoạt động bên trong

- Khi bạn viết `List<int>`, trình biên dịch tạo phiên bản chuyên cho `int`. Với **kiểu value** (`int`, struct), mỗi kiểu có code riêng (nhanh, không boxing). Với **kiểu reference** (class), các phiên bản chia sẻ code.
- **An toàn kiểu lúc biên dịch:** `List<int>` không cho thêm `string` → bắt lỗi **trước khi chạy**, không phải runtime.
- **Không boxing với value type:** `List<int>` lưu int trực tiếp, không "đóng hộp" thành object → tiết kiệm GC (xem [Garbage Collection](./garbage-collection-basics.md)).

---

## 4. Cú pháp

```csharp
// Generic method — hàm dùng cho mọi kiểu
public T GetRandom<T>(List<T> list) {
    return list[Random.Range(0, list.Count)];
}
int n = GetRandom(new List<int>{1,2,3});
Enemy e = GetRandom(enemyList);

// Generic class
public class Pool<T> where T : Component {   // "where" = ràng buộc
    private Queue<T> items = new();
    public T Get() { return items.Count > 0 ? items.Dequeue() : null; }
    public void Release(T item) { items.Enqueue(item); }
}

// Ràng buộc (constraints) — giới hạn T phải thỏa điều kiện
where T : class            // T phải là reference type
where T : struct           // T phải là value type
where T : Component         // T phải kế thừa Component
where T : IDamageable       // T phải implement interface
where T : new()             // T phải có constructor rỗng
```

> Ràng buộc `where` cho phép bạn **dùng được các thành viên** của kiểu ràng buộc bên trong generic. Vd `where T : Component` cho phép gọi `item.gameObject` trên `T`.

---

## 5. Ứng dụng thực tế

- **Collection:** `List<T>`, `Dictionary<K,V>`, `Queue<T>`, `Stack<T>` — dùng mỗi ngày.
- **Object Pool generic:** một `Pool<T>` cho mọi loại object (xem [Object Pooling](./object-pooling.md)).
- **Singleton generic:** `Singleton<T>` base cho mọi manager (xem [Singleton](./singleton.md)).
- **Event system generic:** `EventBus<T>` cho nhiều loại event.
- **Service/Factory generic:** `GetComponent<T>()` của Unity chính là generic method.
- **Save system:** `Save<T>(T data)` serialize bất kỳ kiểu nào.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Tái dùng code cho mọi kiểu | Khó đọc hơn với người mới (`Pool<T> where T : ...`) |
| An toàn kiểu lúc biên dịch | Lạm dụng generic phức tạp → khó hiểu |
| Không boxing → tiết kiệm GC | Một số giới hạn (không generic được mọi thứ) |
| Nền tảng cho thư viện/pattern | — |

---

## 7. Lỗi thường gặp

### ❌ Dùng `object` thay vì generic
Quay lại boxing + ép kiểu + mất an toàn. Nếu thấy mình `(SomeType)something`, cân nhắc generic.

### ❌ Quên ràng buộc `where` nên không gọi được method
Muốn gọi `item.gameObject` nhưng `T` chưa ràng buộc `Component` → lỗi biên dịch. Thêm `where T : Component`.

### ❌ Tưởng `List<Enemy>` chứa được `List<Animal>` (covariance)
Generics class **không** tự động "kế thừa theo kiểu T". `List<Dog>` **không phải** `List<Animal>`. Đây là chủ đề covariance/contravariance — nâng cao, cẩn thận khi giả định.

---

## 8. Best practices

- ✅ Ưu tiên generic thay vì `object` khi cần "mọi kiểu".
- ✅ Đặt ràng buộc `where` tối thiểu cần thiết để dùng được method.
- ✅ Dùng generic cho hạ tầng tái dùng (pool, event, save, singleton base).
- ✅ Đừng generic hóa sớm — chỉ khi thật sự cần nhiều kiểu.
- ✅ Đặt tên type parameter có nghĩa khi nhiều: `Dictionary<TKey, TValue>` rõ hơn `<T, U>`.

---

## 9. Liên kết
- [LINQ](./linq.md) — xây trên generics.
- [Object Pooling](./object-pooling.md) · [Singleton](./singleton.md) — dùng generic base.
- [Garbage Collection](./garbage-collection-basics.md) — generic tránh boxing.

---

[⬅️ Delegate & Event](./delegates-events.md) | [LINQ ➡️](./linq.md)
