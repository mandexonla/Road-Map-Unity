# 🗑️ Garbage Collection (Cơ Bản)

[⬅️ Knowledge Base](../README.md) | Liên quan: [LINQ](./linq.md) · [Object Pooling](./object-pooling.md) · [Memory Management (sâu)](../../05-Technical-Deep-Dives/memory-management.md)

> Hiểu GC ở mức cơ bản là dấu hiệu Junior chững chạc. Đây là nguồn của hiện tượng "game tự nhiên giật một cái" mà người mới không lý giải được.

---

## 1. Bản chất

**Garbage Collector (GC) là cơ chế tự động dọn bộ nhớ không còn dùng.** C# quản lý bộ nhớ giúp bạn: khi một object không còn ai tham chiếu, GC sẽ thu hồi bộ nhớ của nó. Bạn **không cần** tự giải phóng như C++.

Nghe tuyệt, nhưng có cái giá: **khi GC chạy để dọn, nó tốn thời gian CPU → frame đó bị kéo dài → giật (GC spike).**

> 🔑 Vấn đề không phải "có GC", mà là **"sinh rác (allocation) quá nhiều" → GC phải chạy thường xuyên → giật thường xuyên.** Mục tiêu của bạn: **sinh ít rác nhất có thể trong code chạy liên tục.**

---

## 2. Vấn đề nó giải quyết (và tạo ra)

GC giải quyết: bạn không phải quản lý bộ nhớ thủ công (an toàn, ít bug memory).

GC tạo ra: nếu code **liên tục cấp phát** (mỗi frame `new` cái gì đó), "rác" tích tụ nhanh → GC kích hoạt giữa lúc chơi → **khựng hình**. Trên mobile, GC spike càng rõ.

---

## 3. Cách hoạt động bên trong (đơn giản hóa)

- Bộ nhớ managed chia thành "heap". Mỗi lần `new` (class, array, một số thao tác) → cấp một mẩu trên heap.
- Khi heap đầy tới ngưỡng → GC chạy: tìm object **không còn ai tham chiếu** → thu hồi.
- Quá trình thu hồi **tạm dừng** việc khác → frame dài ra.
- Unity dùng GC kiểu "stop-the-world" (cũ) hoặc **Incremental GC** (chia nhỏ việc dọn ra nhiều frame → giảm spike, bật trong Player Settings).

> 💡 Lưu ý: **value type** (`int`, `float`, `struct`, `bool`) thường nằm trên **stack** hoặc inline → **không** tạo rác heap. **Reference type** (`class`, array) nằm trên **heap** → GC quản. Đây là gốc của nhiều mẹo tối ưu.

---

## 4. Những thứ SINH RÁC (cần tránh trong hot path)

| Thủ phạm | Vì sao |
|----------|--------|
| `new` class / array / `List` mỗi frame | Cấp phát heap |
| **LINQ** (`Where`, `Select`...) | Tạo iterator + closure (xem [LINQ](./linq.md)) |
| **Nối chuỗi** `"Score: " + n` / interpolation | String là object mới mỗi lần |
| **Boxing** (gán struct/int vào `object` hoặc interface) | Đóng hộp lên heap |
| `foreach` trên vài collection cũ | (phần lớn nay đã ổn) |
| **Lambda bắt biến** (closure) | Tạo object closure |
| Gọi hàm Unity trả mảng mới (`GetComponents`, `Physics.RaycastAll`) | Cấp mảng mới mỗi lần |

> ⚠️ "Hot path" = code chạy **mỗi frame hoặc rất thường xuyên**: `Update`, `FixedUpdate`, vòng lặp game, callback va chạm.

---

## 5. Cách GIẢM rác

```csharp
// ❌ Sinh rác mỗi frame
void Update() {
    string s = "Score: " + score;             // string mới mỗi frame
    var nearest = enemies.Where(e => e.alive); // LINQ alloc
    Vector3[] dirs = new Vector3[4];           // mảng mới mỗi frame
}

// ✅ Giảm rác
StringBuilder sb = new();                       // cache, tái dùng
Vector3[] dirsCache = new Vector3[4];           // cấp 1 lần
void Update() {
    // chỉ cập nhật UI khi score ĐỔI, không phải mỗi frame
    // dùng for thủ công thay LINQ trong hot path
    // tái dùng dirsCache thay vì new
}
```
Kỹ thuật chính:
- **Cache & tái dùng** thay vì `new` mỗi frame.
- **Object Pooling** thay Instantiate/Destroy (xem [Object Pool](./object-pooling.md)).
- **Tránh LINQ/string concat** trong hot path.
- **Chỉ cập nhật khi đổi** (event-driven) thay vì mỗi frame.
- Dùng **struct** cho data nhỏ tạm thời (tránh heap).
- Tránh **boxing** (dùng generic thay `object`).

---

## 6. Ứng dụng thực tế / khi nào quan tâm

- ✅ **Quan tâm** trong: Update, vòng lặp lớn, game bullet-hell/nhiều object, **mobile** (GC đắt hơn).
- ❌ **Không cần lo** ở: code khởi tạo (Start/Awake), tool/editor, sự kiện chạy thưa (mở menu). Tối ưu sớm chỗ không cần là lãng phí — **đo bằng Profiler trước** (xem [Performance](../../05-Technical-Deep-Dives/performance.md)).

---

## 7. Lỗi thường gặp

### ❌ Tối ưu GC mọi nơi (premature optimization)
Viết code xấu khó đọc để "tiết kiệm" ở chỗ chạy 1 lần. Chỉ tối ưu **hot path** và **sau khi đo**.
### ❌ Không biết LINQ/string sinh rác
Rải LINQ trong Update → giật mà không hiểu vì sao.
### ❌ Quên hủy đăng ký event → object không được GC
Đây là dạng "leak" managed: delegate giữ tham chiếu → GC không dọn được (xem [Delegate & Event](./delegates-events.md), [Memory sâu](../../05-Technical-Deep-Dives/memory-management.md)).
### ❌ Tưởng `Destroy` giải phóng managed memory ngay
`Destroy` hủy object Unity nhưng managed object/rác vẫn do GC dọn theo lịch riêng.

---

## 8. Best practices

- ✅ **Đo trước** (Profiler) — tìm chỗ sinh rác thật, đừng đoán.
- ✅ Trong hot path: tránh `new`, LINQ, string concat, boxing.
- ✅ Cache & tái dùng buffer/collection.
- ✅ Object Pooling cho thứ sinh thường xuyên.
- ✅ Cập nhật theo event thay vì mỗi frame khi có thể.
- ✅ Bật **Incremental GC** để giảm spike.
- ✅ Test trên **thiết bị thật** (mobile) — GC ở đó đắt hơn editor.

---

## 9. Liên kết
- [Memory Management (sâu)](../../05-Technical-Deep-Dives/memory-management.md) — managed vs native, leak, fragmentation.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — Profiler, hot path.
- [LINQ](./linq.md) · [Object Pooling](./object-pooling.md) · [Delegate & Event](./delegates-events.md).

---

[⬅️ Command Pattern](./command-pattern.md) | [Animator ➡️](./animator.md)
