# 🧠 Quản Lý Bộ Nhớ trong Unity

[⬅️ Technical Index](./README.md)

> 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior) — (Junior nên đọc lướt phần GC)

Memory là nguyên nhân lớn của crash (đặc biệt mobile) và giật (GC spike). Hiểu nó là dấu hiệu của dev trưởng thành.

---

## 🟡 1. Hai loại bộ nhớ trong Unity

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   MANAGED MEMORY (C#)   │     │   NATIVE MEMORY (engine) │
│   - Object C#, class    │     │   - Texture, Mesh, Audio │
│   - GC quản lý          │     │   - Asset, buffer engine │
│   - GC spike = giật     │     │   - Bạn quản lý load/unload│
└─────────────────────────┘     └─────────────────────────┘
```

- **Managed:** GC tự dọn, nhưng dọn = giật. Mục tiêu: **ít sinh rác**.
- **Native:** asset (texture, mesh, audio...). Bạn phải **chủ động unload** khi không dùng, nếu không → memory phình → crash.

---

## 🟡 2. Garbage Collection sâu hơn

- Unity dùng **Boehm GC** (và đang chuyển sang incremental GC giảm spike).
- **Incremental GC:** chia việc dọn rác ra nhiều frame → giảm spike (bật trong Player Settings).
- Nhưng giải pháp tốt nhất vẫn là **không sinh rác** trong hot path.

### Stack vs Heap
- **`struct`** (value type) → thường trên **stack**, không tạo rác GC. Dùng cho data nhỏ, tạm.
- **`class`** (reference type) → trên **heap**, GC phải dọn.
- ⚠️ Nhưng struct lớn copy tốn kém; struct bị box (gán vào object/interface) lại lên heap.

### Boxing — kẻ giấu mặt
```csharp
object o = 5;            // box int → heap alloc
void Log(object x){}     // truyền struct vào param object → box
IInterface i = myStruct; // box struct vào interface → alloc
```
Tránh boxing trong hot path. Dùng generic thay `object`.

---

## 🟡 3. Quản lý Asset Memory (native)

- Asset được load vào native memory khi tham chiếu.
- **Resources folder:** ⚠️ lỗi thời, load hết vào build, khó unload → tránh.
- **Addressables:** load/unload theo nhu cầu, đếm reference, giải phóng đúng → chuẩn hiện đại.
- `Resources.UnloadUnusedAssets()` và `AssetBundle.Unload()` — hiểu khi nào gọi.
- **Texture** thường chiếm memory lớn nhất: nén, mipmap, giảm resolution.

Xem: [build-and-pipeline.md](./build-and-pipeline.md).

---

## 🟡 4. Memory Leak trong Unity

Nguyên nhân thường gặp:
- **Event không unsubscribe:** đăng ký event mà không hủy → object không được GC. **Luôn `-=` trong `OnDisable`/`OnDestroy`.**
- **Static reference:** giữ reference trong static → sống mãi.
- **Asset load không unload:** Addressables không `Release`.
- **Coroutine/async không hủy** giữ reference.
- Closure/lambda giữ reference ngầm.

```csharp
void OnEnable()  => GameEvents.OnDied += Handle;
void OnDisable() => GameEvents.OnDied -= Handle;  // QUAN TRỌNG: luôn hủy
```

---

## 🔴 5. Công cụ & kỹ thuật nâng cao (Senior)

- **Memory Profiler (package):** chụp snapshot, so sánh, tìm object không nên còn sống, tìm leak, xem fragmentation.
- **Fragmentation:** heap phân mảnh → không cấp phát được dù tổng còn trống → quan trọng trên mobile.
- **Native Collections (DOTS):** `NativeArray`, `NativeList` — memory thủ công, không GC, nhưng phải `Dispose`.
- **`Span<T>` / `Memory<T>`:** thao tác memory không alloc.
- **Object pooling toàn diện:** pool cả managed object lẫn asset.
- **Memory budget per platform:** đặt ngân sách RAM cho từng thiết bị target.

---

## 🔴 6. Chiến lược memory cho dự án lớn

- Đặt **memory budget** rõ ràng theo nền tảng (vd mobile thấp: tổng < X MB).
- **Streaming:** load/unload theo vùng (open world), không giữ tất cả trong RAM.
- **Audit định kỳ:** snapshot memory ở các thời điểm, phát hiện phình.
- **Pool & reuse** có hệ thống.
- Test trên **thiết bị RAM thấp nhất** trong target.

---

## ✅ Tiến trình học theo level

```
Junior:  Hiểu GC spike · unsubscribe event · tránh alloc cơ bản
Mid:     Managed vs native · boxing · asset memory · leak phổ biến · Memory Profiler
Senior:  Fragmentation · Native Collections · memory budget · streaming · audit hệ thống
```

---

## 📚 Tài nguyên
- Unity Memory Profiler docs.
- Unity "Understanding memory" best practice guide.
- The Gamedev Guru (memory articles).

---

[⬅️ Performance](./performance.md) | [Build & Pipeline ➡️](./build-and-pipeline.md)
