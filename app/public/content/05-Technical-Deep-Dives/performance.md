# 🚀 Tối Ưu Hiệu Năng trong Unity

[⬅️ Technical Index](./README.md)

> 🟢 Cơ bản (Junior) · 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior)

Kỹ năng tối ưu được trả giá cao ở **mọi** thị trường. Đặc biệt quan trọng cho mobile & indie (thiết bị yếu, ngân sách thấp).

---

## 🟢 0. Quy tắc vàng: ĐO TRƯỚC, TỐI ƯU SAU

> **"Premature optimization is the root of all evil."**
> Đừng đoán chỗ chậm. **Dùng Profiler đo**, tìm điểm nghẽn thật, rồi mới tối ưu. 90% thời gian thường nằm ở 10% code.

---

## 🟢 1. Hiểu vòng đời 1 frame

```
Input → Update() → Physics(FixedUpdate) → Animation → LateUpdate() → Rendering → Frame xong
```
- Mục tiêu: **60 FPS = 16.6ms/frame** (hoặc 30 FPS = 33ms cho mobile nhẹ).
- Nếu frame tốn >16.6ms → giật. Tìm xem **CPU** hay **GPU** là thủ phạm.

**CPU-bound vs GPU-bound:**
- CPU-bound: quá nhiều logic/script/physics → giảm tải CPU.
- GPU-bound: quá nhiều pixel/vertex/draw call/overdraw → giảm tải GPU.

---

## 🟢 2. Lỗi hiệu năng phổ biến của người mới (sửa ngay)

| Lỗi | Tại sao chậm | Sửa |
|-----|--------------|-----|
| `GetComponent` trong `Update` | Tìm component mỗi frame | Cache vào field trong `Awake` |
| `Find` / `FindObjectOfType` trong hot path | Quét cả scene, rất chậm | Cache reference, dùng event/DI |
| `Instantiate`/`Destroy` liên tục | Cấp phát + GC spike | **Object Pooling** |
| `new` / LINQ / string concat trong `Update` | Sinh rác → GC giật | Tránh alloc trong hot path |
| `Camera.main` lặp lại | Là `Find` ngầm | Cache lại |
| Nhiều `Update` rỗng | Vẫn tốn overhead gọi | Bỏ Update không dùng |
| `Debug.Log` nhiều trong build | Tốn CPU + string alloc | Tắt log ở release |

---

## 🟢🟡 3. Object Pooling

Thay vì tạo/hủy liên tục (đạn, enemy, hiệu ứng) → tái sử dụng.
```csharp
// Khái niệm: lấy từ pool thay vì Instantiate, trả về pool thay vì Destroy
var bullet = pool.Get();      // thay Instantiate
pool.Release(bullet);          // thay Destroy
```
Unity có sẵn `UnityEngine.Pool` (ObjectPool<T>) từ 2021+.

---

## 🟡 4. Garbage Collection (GC) — kẻ thù của frame ổn định

- C# có **managed memory** + GC tự dọn rác. Nhưng GC chạy = **frame giật** (GC spike).
- Mục tiêu: **zero allocation trong hot path** (Update, vòng lặp game).

**Nguồn sinh rác cần tránh trong Update:**
- `new` class/array/List.
- LINQ (`Where`, `Select`...).
- String concatenation (`"Score: " + score`).
- Boxing (gán struct vào object/interface).
- `foreach` trên một số collection (cũ — phần lớn nay đã ổn).
- Lambda capture biến.

**Giải pháp:** cache, reuse buffer, `StringBuilder`, struct, pre-allocate, tránh boxing.

Xem sâu: [memory-management.md](./memory-management.md).

---

## 🟡 5. Tối ưu Rendering (GPU)

### Draw Call & Batching
- Mỗi draw call = 1 lệnh gửi GPU. Quá nhiều → CPU nghẽn ở khâu gửi lệnh.
- **Giảm draw call bằng:**
  - **SRP Batcher** (URP/HDRP) — bật, dùng vật liệu tương thích.
  - **GPU Instancing** — nhiều object giống nhau.
  - **Static Batching** — object tĩnh.
  - **Texture Atlas / Sprite Atlas** — gộp texture.
  - Giảm số material khác nhau.

### Các kỹ thuật GPU khác
- **Overdraw:** vẽ chồng nhiều lớp (đặc biệt UI, particle, transparent) → tốn fill rate. Giảm transparent, tối ưu UI.
- **LOD (Level of Detail):** object xa dùng mesh đơn giản hơn.
- **Culling:** Frustum culling (tự động) + Occlusion culling (object bị che không vẽ).
- **Texture:** nén đúng định dạng (ASTC cho mobile), mipmap, giảm resolution thừa.
- **Shader:** shader phức tạp tốn GPU; mobile cần shader nhẹ.

---

## 🟡 6. Profiler — công cụ số 1

| Module | Dùng để |
|--------|---------|
| **CPU Usage** | Tìm hàm tốn thời gian, GC spike |
| **GPU Usage** | Tải GPU, render |
| **Memory** | Theo dõi bộ nhớ, alloc |
| **Rendering** | Draw call, batch, triangle |
| **Memory Profiler** (package riêng) | Snapshot chi tiết, tìm leak |
| **Frame Debugger** | Xem từng draw call dựng frame thế nào |

**Quy trình tối ưu:**
1. Profile trên **thiết bị thật** (mobile khác editor rất nhiều).
2. Tìm spike/bottleneck lớn nhất.
3. Sửa **một** thứ, đo lại.
4. Lặp lại. Ghi số liệu trước/sau.

---

## 🟡 7. Tối ưu Mobile (rất quan trọng cho thị trường VN)

- **Thermal throttling:** điện thoại nóng → tự giảm xung → giật. Đừng chỉ test 1 phút.
- Target 30 hoặc 60 FPS rõ ràng, dùng `Application.targetFrameRate`.
- Texture compression: ASTC.
- Giảm overdraw (UI & particle là thủ phạm lớn trên mobile).
- Giảm realtime light/shadow; dùng baked lighting.
- Quản lý memory chặt (thiết bị RAM thấp).
- Giảm draw call quyết liệt.

---

## 🔴 8. Tối ưu cấp hệ thống (Senior)

- **Performance budget:** đặt ngân sách (ms/frame cho từng hệ thống, MB memory, draw call) và **bảo vệ** nó qua thời gian.
- **DOTS / ECS + Job System + Burst:** cho game cần xử lý hàng nghìn-triệu entity (RTS, simulation, bullet hell). Data-oriented design, cache-friendly, đa luồng.
- **Native Collections, `Span<T>`, unsafe:** tối ưu sâu khi cần.
- **Automation:** perf regression test trong CI (báo động khi frame time tăng).
- **Dẫn dắt optimization pass:** phối hợp cả team tối ưu có hệ thống, không "tối ưu mò".

### DOTS/ECS — khi nào cần?
- ✅ Cần: hàng nghìn+ entity cùng update (đám đông, đạn, hạt, sim).
- ❌ Không cần: game thường, ít object. ECS phức tạp hơn nhiều — chỉ dùng khi bài toán đòi hỏi.

---

## ✅ Tiến trình học theo level

```
Junior:  Đo bằng Profiler · cache component · object pool · tránh GC cơ bản · draw call cơ bản
Mid:     GC sâu · batching/instancing · LOD/culling · Memory Profiler · tối ưu mobile thật (có số liệu)
Senior:  Perf budget · DOTS/ECS/Burst · tối ưu cấp pipeline · perf test tự động · dẫn dắt
```

---

## 📚 Tài nguyên
- The Gamedev Guru (blog + YouTube) — ⭐ chuyên sâu.
- Unity "Optimize your game" best practice guides (chính thống).
- Unity Profiler & Memory Profiler docs.
- GDC talks về optimization.

---

[⬅️ Architecture](./architecture.md) | [Memory Management ➡️](./memory-management.md)
