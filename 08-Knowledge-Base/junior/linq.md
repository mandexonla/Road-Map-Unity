# 🔎 LINQ (Truy Vấn Dữ Liệu)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Generics](./generics.md) · [Garbage Collection](./garbage-collection-basics.md)

> LINQ rất tiện nhưng là **con dao hai lưỡi** về hiệu năng. Biết khi nào dùng và khi nào TRÁNH quan trọng hơn cú pháp.

---

## 1. Bản chất

**LINQ (Language Integrated Query) là cú pháp gọn để lọc, biến đổi, sắp xếp, gộp dữ liệu** trên collection — thay vì viết vòng lặp `for` thủ công.

```csharp
// Không LINQ
List<Enemy> alive = new();
foreach (var e in enemies) if (e.Health > 0) alive.Add(e);

// LINQ — diễn đạt "ý định" gọn hơn
var alive = enemies.Where(e => e.Health > 0).ToList();
```

> 🔑 Bản chất LINQ = **mô tả "BẠN MUỐN GÌ"** (lọc enemy còn sống) thay vì **"LÀM THẾ NÀO"** (lặp, kiểm tra, thêm vào list). Code đọc gần như tiếng Anh.

---

## 2. Vấn đề nó giải quyết

Code xử lý collection thủ công dài dòng và dễ sai. LINQ làm nó ngắn, rõ, ít bug logic:
```csharp
// "Lấy 3 enemy gần nhất còn sống, sắp theo khoảng cách"
var targets = enemies
    .Where(e => e.IsAlive)
    .OrderBy(e => Vector3.Distance(transform.position, e.transform.position))
    .Take(3)
    .ToList();
```
Viết tay đoạn này bằng `for` sẽ dài và dễ lỗi hơn nhiều.

---

## 3. Cách hoạt động bên trong (và vì sao tốn GC)

- LINQ dựa trên **`IEnumerable<T>` + deferred execution (thực thi trễ)**: `Where`, `Select`... **không chạy ngay** mà tạo một "chuỗi xử lý". Chỉ khi bạn **duyệt** (foreach, `ToList`, `Count`...) nó mới thực sự chạy.
- **Mỗi toán tử tạo object trung gian + iterator + closure** cho lambda → **sinh rác (GC allocation)**.
- Với lambda bắt biến ngoài (`e => e.Health > threshold`), C# tạo một object closure → thêm alloc.

> ⚠️ Đây là lý do **không dùng LINQ trong hot path** (`Update`, vòng lặp mỗi frame): nó sinh rác mỗi lần → GC spike → giật. Xem [Garbage Collection](./garbage-collection-basics.md) và [Performance](../../05-Technical-Deep-Dives/performance.md).

---

## 4. Các toán tử hay dùng

```csharp
.Where(x => điều_kiện)        // lọc
.Select(x => biến_đổi)        // ánh xạ/chuyển đổi
.OrderBy(x => khóa)           // sắp tăng (.OrderByDescending giảm)
.First() / .FirstOrDefault()  // phần tử đầu (OrDefault: null nếu rỗng, không ném lỗi)
.Any(x => đk)                 // có phần tử nào thỏa không? (bool)
.All(x => đk)                 // mọi phần tử đều thỏa?
.Count(x => đk)               // đếm
.Sum() / .Max() / .Min() / .Average()
.Take(n) / .Skip(n)           // lấy/bỏ n phần tử
.GroupBy(x => khóa)           // nhóm
.ToList() / .ToArray() / .ToDictionary()  // "vật chất hóa" kết quả
.Contains(x)
```

> 💡 `First()` ném lỗi nếu rỗng; `FirstOrDefault()` trả `null`/giá trị mặc định. Dùng `FirstOrDefault` khi không chắc có phần tử.

---

## 5. Ứng dụng thực tế (nơi LINQ TỐT)

- **Code khởi tạo / không lặp mỗi frame:** lọc danh sách level, xử lý save data, thiết lập wave.
- **Tool / Editor script:** xử lý asset, validate dữ liệu (hiệu năng không quan trọng).
- **Logic chạy thưa:** khi người chơi mở inventory, tính toán một lần.
- **Code dễ đọc quan trọng hơn vài microsecond.**

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Code ngắn, rõ ý định | **Sinh GC** → không hợp hot path |
| Ít bug logic hơn vòng lặp tay | Chậm hơn `for` thủ công |
| Ghép chuỗi xử lý mạnh mẽ | Deferred execution gây nhầm lẫn (chạy lúc nào?) |
| Chuẩn, quen thuộc | Khó debug từng bước |

---

## 7. Lỗi thường gặp

### ❌ Dùng LINQ trong `Update` / vòng lặp mỗi frame
```csharp
void Update() {
    var nearest = enemies.OrderBy(e => Dist(e)).First(); // SAI: alloc mỗi frame → giật
}
```
✅ Viết vòng lặp `for` thủ công trong hot path, hoặc tính sẵn/cache.

### ❌ Duyệt lại nhiều lần (deferred execution)
```csharp
var query = enemies.Where(e => e.IsAlive); // chưa chạy
int a = query.Count();   // chạy lần 1
foreach (var e in query) // chạy LẠI lần 2 (tốn gấp đôi!)
```
✅ `.ToList()` một lần nếu cần dùng kết quả nhiều lần.

### ❌ `First()` trên collection có thể rỗng
Ném `InvalidOperationException`. Dùng `FirstOrDefault()` + kiểm tra null.

### ❌ Lạm dụng LINQ lồng nhau khó đọc
Chuỗi 8 toán tử lồng lambda phức tạp → khó hiểu hơn vòng lặp. Cân bằng.

---

## 8. Best practices

- ✅ **Tránh LINQ trong hot path** (Update, vòng lặp mỗi frame, hàng nghìn phần tử mỗi frame).
- ✅ Dùng LINQ thoải mái ở code **khởi tạo, tool, logic chạy thưa**.
- ✅ `.ToList()` khi cần dùng kết quả nhiều lần (tránh chạy lại).
- ✅ `FirstOrDefault` + null check thay vì `First` khi có thể rỗng.
- ✅ Nếu hiệu năng tới hạn → đo bằng [Profiler](../../05-Technical-Deep-Dives/performance.md), thay bằng `for` nếu LINQ là điểm nghẽn.
- ✅ Ưu tiên rõ ràng; đừng nhồi quá nhiều toán tử vào một chuỗi.

---

## 9. Liên kết
- [Generics](./generics.md) — LINQ xây trên `IEnumerable<T>`.
- [Garbage Collection](./garbage-collection-basics.md) — vì sao LINQ sinh rác.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — hot path & tối ưu.

---

[⬅️ Generics](./generics.md) | [C# Trung Cấp ➡️](./csharp-intermediate.md)
