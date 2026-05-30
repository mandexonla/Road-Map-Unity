# 🧠 Memory Model (Sâu — Stack, Heap, Managed vs Native)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Garbage Collection (Junior)](../junior/garbage-collection-basics.md) · [Memory Management (Deep Dive)](../../05-Technical-Deep-Dives/memory-management.md)

> Đây là mô hình tinh thần nền tảng để hiểu hiệu năng, GC, và bug bộ nhớ ở mức sâu. Senior cần "nhìn xuyên" được object nằm ở đâu trong bộ nhớ.

---

## 1. Bản chất: bộ nhớ không phải một khối

Bộ nhớ chương trình chia thành các vùng với tính chất khác nhau. Hiểu object của bạn nằm ở **vùng nào** giải thích vì sao nó nhanh/chậm, có sinh GC hay không, có leak hay không.

```
┌──────────────────────────────────────────────────────────┐
│                    MANAGED MEMORY (C#)                    │
│  ┌─────────────┐         ┌──────────────────────────┐    │
│  │   STACK     │         │         HEAP             │    │
│  │ value types │         │ reference types (class), │    │
│  │ tạm, hàm    │         │ array — GC quản lý       │    │
│  │ tự dọn      │         │ (GC chạy = giật)         │    │
│  └─────────────┘         └──────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│              NATIVE MEMORY (engine C++)                   │
│  Texture, Mesh, AudioClip, AssetBundle, buffer engine    │
│  → BẠN tự quản lý load/unload (GC KHÔNG đụng tới)         │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Stack vs Heap (managed)

### Stack
- Lưu **value types** (`int`, `float`, `bool`, `struct`) và biến cục bộ tạm.
- **Cực nhanh**, tự động dọn khi hàm kết thúc (không GC).
- Kích thước nhỏ, vòng đời ngắn (theo phạm vi hàm).

### Heap
- Lưu **reference types** (`class`, array, string, delegate) — bất cứ gì `new` ra (trừ struct cục bộ).
- **GC quản lý:** khi không còn tham chiếu → GC thu hồi (nhưng GC chạy = tốn CPU = giật).
- Vòng đời dài hơn, linh hoạt hơn, nhưng "đắt".

> 🔑 Hệ quả thực tiễn: **value type (struct) tạm trong hàm → stack → không sinh rác GC.** **Reference type → heap → GC phải dọn.** Đây là gốc của nhiều tối ưu (dùng struct cho data nhỏ tạm, tránh alloc trong hot path).

---

## 3. struct vs class (quyết định Senior hay cân nhắc)

| | `struct` (value type) | `class` (reference type) |
|--|------------------------|--------------------------|
| Nằm ở | Stack (hoặc inline) | Heap |
| Khi gán/truyền | **Copy toàn bộ giá trị** | Copy **tham chiếu** (cùng object) |
| GC | Không (nếu không box) | Có |
| Phù hợp | Data nhỏ, bất biến, tạm (Vector3, điểm) | Object có danh tính, lớn, chia sẻ |

### Cạm bẫy struct
- **Struct lớn copy tốn kém:** mỗi lần truyền/gán copy cả khối → struct to (>16-32 byte) hại hơn lợi.
- **Mutable struct gây bug:** sửa một bản copy không ảnh hưởng bản gốc → nhầm lẫn. Ưu tiên struct **bất biến (readonly)**.

---

## 4. ⚠️ Boxing (kẻ giấu mặt sinh GC)

**Boxing:** khi một **value type** bị "đóng hộp" thành **reference type** → nó **nhảy lên heap** → sinh GC.
```csharp
object o = 5;                 // box int → heap alloc
void Log(object x) {}         // truyền int vào param object → box
IComparable c = 10;           // gán int vào interface → box
enum so sánh qua object       // boxing ngầm phổ biến
```
> Boxing ngầm trong: dùng `object`/non-generic interface với value type, một số API cũ, so sánh enum sai cách, struct implement interface gọi qua interface. Senior phải "ngửi" được boxing để tránh trong hot path. Generic ([Generics](../junior/generics.md)) là cách chính tránh boxing.

---

## 5. Managed vs Native (đặc thù Unity)

- **Managed:** object C# (class của bạn, MonoBehaviour wrapper) — GC quản.
- **Native:** asset thật (texture, mesh, audio, render buffer) sống ở tầng C++ — **GC không đụng tới**. Bạn phải **chủ động unload** (qua [Addressables](../mid/addressables.md) Release, hoặc `Resources.UnloadUnusedAssets`).
- ⚠️ Một `UnityEngine.Object` (vd Texture) có **phần managed nhỏ** (wrapper) + **phần native lớn** (pixel data). Quên giải phóng → phần native phình → crash mobile dù "managed memory" trông ít.

> 🔑 Đây là lý do "Profiler báo managed heap nhỏ mà app vẫn hết RAM": native memory mới là phần lớn (texture/mesh), và nó không hiện ở managed heap. Senior nhìn cả hai (Memory Profiler).

---

## 6. GC sâu hơn

- Unity dùng **Boehm GC** (non-generational, non-compacting truyền thống) → có thể gây **fragmentation** (phân mảnh: tổng còn trống nhưng không cấp được khối liền).
- **Incremental GC:** chia việc dọn ra nhiều frame → giảm spike (đánh đổi: tổng thời gian dọn hơi tăng).
- Mục tiêu vẫn là **giảm allocation** để GC ít chạy (xem [GC Junior](../junior/garbage-collection-basics.md)).
- **Fragmentation** đặc biệt nguy hiểm trên mobile dài phiên — Senior thiết kế để hạn chế (pool, pre-allocate, tránh alloc-rồi-free liên tục object kích thước thay đổi).

---

## 7. Lỗi thường gặp (Senior)

- ❌ Tưởng "managed heap nhỏ = ổn" trong khi native memory (texture/mesh) mới gây hết RAM.
- ❌ Quên giải phóng native asset (Addressables không Release) → leak native.
- ❌ Dùng struct lớn → copy tốn kém ngầm (đôi khi tệ hơn class).
- ❌ Mutable struct → bug "sửa không ăn" (sửa bản copy).
- ❌ Boxing ngầm trong hot path → GC mà không thấy `new`.
- ❌ Fragmentation do alloc/free liên tục kích thước thay đổi → mobile hết RAM dù tổng còn.

---

## 8. Best practices

- ✅ Hiểu object của mình nằm stack/heap/native → dự đoán chi phí.
- ✅ Struct cho data **nhỏ, bất biến, tạm**; class cho object lớn/chia sẻ/có danh tính.
- ✅ Tránh boxing (dùng generic, tránh `object`/non-generic interface với value type).
- ✅ Quản lý **native memory** chủ động (Addressables Release, unload texture/mesh).
- ✅ Dùng **Memory Profiler** xem cả managed + native, tìm leak & fragmentation.
- ✅ Giảm allocation trong hot path; pool & pre-allocate để hạn chế fragmentation.
- ✅ Đặt **memory budget** theo nền tảng & bảo vệ nó.

---

## 9. Liên kết
- [Garbage Collection (Junior)](../junior/garbage-collection-basics.md) — nền tảng.
- [Memory Management (Deep Dive)](../../05-Technical-Deep-Dives/memory-management.md) — leak, fragmentation, budget.
- [Generics](../junior/generics.md) — tránh boxing.
- [Addressables](../mid/addressables.md) — quản lý native asset.
- [C# Advanced & Performance](./csharp-advanced-performance.md).

---

[⬅️ Serialization Internals](./serialization-internals.md) | [Rendering Pipeline Internals ➡️](./rendering-pipeline-internals.md)
