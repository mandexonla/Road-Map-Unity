# 🧠 Mid-Level — Kỹ Năng & Kiến Thức Cần Nắm

[⬅️ Mid Overview](./README.md) | [Projects ➡️](./projects.md)

---

## A. Kiến Trúc Phần Mềm (trọng tâm của Mid)

### 1. Nguyên tắc SOLID
| Chữ | Nguyên tắc | Ý nghĩa trong game |
|-----|-----------|--------------------|
| **S** | Single Responsibility | Mỗi class một lý do để thay đổi |
| **O** | Open/Closed | Mở để mở rộng, đóng để sửa (thêm enemy type không sửa code cũ) |
| **L** | Liskov Substitution | Lớp con thay được lớp cha mà không hỏng |
| **I** | Interface Segregation | Interface nhỏ, chuyên biệt (`IDamageable`, `IMovable`) |
| **D** | Dependency Inversion | Phụ thuộc vào abstraction, không vào implementation cụ thể |

> ⚠️ SOLID là **kim chỉ nam**, không phải luật cứng. Game nhỏ đừng over-apply.

### 2. Dependency Injection (DI)
- Vấn đề: Singleton & `Find` tạo phụ thuộc cứng, khó test, khó đổi.
- Giải pháp: tiêm dependency từ ngoài vào (constructor/method/property injection).
- **DI Container cho Unity:** VContainer (nhẹ, nhanh, được ưa chuộng) hoặc Zenject/Extenject.
- Hiểu khi nào cần DI container, khi nào DI thủ công là đủ.

### 3. Tách lớp (Layering) & tách concern
- Tách **data ↔ logic ↔ presentation (UI)**.
- Mẫu kiến trúc UI: **MVC / MVP / MVVM** (MVVM hợp với data binding).
- **Data-driven design:** hành vi điều khiển bởi data (ScriptableObject), không hardcode.
- Tránh logic game phụ thuộc cứng vào MonoBehaviour (giúp test & tái dùng).

### 4. Tư duy hệ thống
- Thiết kế module: input/output rõ ràng, ít phụ thuộc, dễ thay thế.
- Vẽ sơ đồ trước khi code (luồng data, quan hệ giữa hệ thống).
- Nghĩ về **khả năng mở rộng** từ đầu (nhưng không over-engineer).

Xem sâu: [Technical → Architecture](../05-Technical-Deep-Dives/architecture.md).

---

## B. Lập Trình Bất Đồng Bộ (Async)

- **Coroutine nâng cao:** custom yield, quản lý vòng đời, dừng đúng cách.
- **async/await trong Unity:** khi nào dùng thay coroutine.
- **UniTask:** thư viện async hiệu năng cao, ít GC — chuẩn công nghiệp cho async Unity.
- **Job System + Burst (cơ bản):** chạy song song, tối ưu CPU.
- ⚠️ Hiểu Unity main thread — đa số API Unity không thread-safe.

---

## C. Quản Lý Asset Nâng Cao

### Addressables (quan trọng cho dự án lớn/mobile)
- Load/unload asset theo nhu cầu (giảm memory, giảm build size).
- Quản lý reference, tránh memory leak.
- Remote content (tải asset từ server, cập nhật không cần update app).
- Thay thế cho Resources (đã lỗi thời) và AssetBundle thủ công.

### Hiểu AssetBundle (nền tảng của Addressables)
- Cách Unity đóng gói & nạp asset.
- Dependency giữa bundle.

Xem: [Technical → Build & Asset Pipeline](../05-Technical-Deep-Dives/build-and-pipeline.md).

---

## D. Hiệu Năng — Mức Chuyên Nghiệp

### Profiler sâu
- CPU/GPU/Memory/Rendering modules chi tiết.
- **Memory Profiler** (package riêng): tìm memory leak, fragment.
- Frame Debugger: phân tích draw call.
- Profile trên **thiết bị thật** (mobile), không chỉ editor.

### Các mặt trận tối ưu
| Mặt trận | Kỹ thuật |
|----------|----------|
| **CPU** | Tránh GC, cache, pool, giảm Update, Job System |
| **GPU** | Giảm draw call, batching (SRP Batcher, GPU Instancing), LOD, giảm overdraw |
| **Memory** | Quản lý texture, audio, mesh; unload; atlas; nén |
| **Build size** | Stripping, texture compression, Addressables, asset audit |
| **Loading** | Async load, scene additive, preload thông minh |

Xem chi tiết: [Technical → Performance](../05-Technical-Deep-Dives/performance.md) và [Memory Management](../05-Technical-Deep-Dives/memory-management.md).

---

## E. Chuyên Sâu 1 Mảng (chọn 1, đào sâu)

> Đây là lúc xây "thân chữ T". Chọn theo sở thích & thị trường.

| Mảng | Học gì | Link |
|------|--------|------|
| 🎮 **Gameplay Systems** | Inventory, quest, dialogue, ability system, AI nâng cao, combat | [gameplay-systems.md](../05-Technical-Deep-Dives/gameplay-systems.md) |
| 🔧 **Tools & Editor** | Custom Editor, EditorWindow, property drawer, automation, pipeline tools | [tools-and-editor.md](../05-Technical-Deep-Dives/tools-and-editor.md) |
| 🎨 **Graphics & Shader** | Shader Graph/HLSL, URP/HDRP, VFX Graph, post-processing, tối ưu render | [graphics-and-rendering.md](../05-Technical-Deep-Dives/graphics-and-rendering.md) |
| 🌐 **Multiplayer** | Netcode, đồng bộ state, client prediction, server authority, matchmaking | [multiplayer-networking.md](../05-Technical-Deep-Dives/multiplayer-networking.md) |

---

## F. Testing & Chất Lượng

- **Unit Test (NUnit):** test logic thuần (tách khỏi MonoBehaviour mới test được → lý do cần kiến trúc tốt).
- **Play Mode Test:** test hành vi trong runtime.
- **Test-friendly architecture:** DI + interface giúp mock & test.
- **Edge case & defensive coding:** nghĩ về trường hợp biên, null, sai input.
- Code review chất lượng (cho và nhận).

---

## G. Build, CI/CD & Quy Trình Lớn

- **Build automation:** build từ dòng lệnh, build nhiều nền tảng.
- **CI/CD cơ bản:** GitHub Actions / GitLab CI / Unity Cloud Build / Jenkins — auto build & test.
- **Versioning:** semantic versioning, quản lý release.
- Làm trong **dự án lớn nhiều người:** quản lý conflict, modular hóa để nhiều người làm song song, code ownership.

Xem: [Technical → Build & Pipeline](../05-Technical-Deep-Dives/build-and-pipeline.md).

---

## H. Kỹ Năng Mềm Bắt Đầu Quan Trọng

- Viết **tài liệu kỹ thuật** (design doc, API doc) cho hệ thống mình làm.
- **Ước lượng** feature (chia nhỏ, dự đoán rủi ro).
- **Mentor** Junior, giải thích kiến thức rõ ràng.
- Giao tiếp trade-off với team/PM/designer.

---

## Bản đồ phụ thuộc

```
SOLID + DI + Layering ──► Tư duy hệ thống ──► Tự dựng hệ thống lớn
        │                                            │
        ├──► Async + Addressables ───────────────────┤
        │                                            ▼
        ├──► Hiệu năng chuyên nghiệp ──► Chuyên sâu 1 mảng
        │                                            │
        └──► Testing + CI/CD + Doc ───────────────────► Sẵn sàng dẫn dắt (Senior)
```

---

[⬅️ Mid Overview](./README.md) | [Projects ➡️](./projects.md)
