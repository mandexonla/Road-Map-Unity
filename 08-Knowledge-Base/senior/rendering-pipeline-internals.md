# 🎨 Rendering Pipeline Internals (Sâu)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Graphics & Rendering](../../05-Technical-Deep-Dives/graphics-and-rendering.md) · [Performance](../../05-Technical-Deep-Dives/performance.md)

> Hiểu một frame được dựng thế nào ở mức kiến trúc giúp bạn ra quyết định render & tối ưu đúng. Đây là kiến thức nền cho Graphics Engineer và Senior nói chung.

---

## 1. Bản chất: render pipeline là gì?

**Render pipeline là chuỗi các bước biến scene 3D/2D (object, đèn, camera, vật liệu) thành các pixel cuối cùng trên màn hình mỗi frame.** Nó điều phối CPU (chuẩn bị lệnh vẽ) và GPU (thực thi vẽ).

> 🔑 Mấu chốt: CPU và GPU làm việc **khác nhau và song song**. CPU **chuẩn bị & gửi lệnh vẽ (draw call)**; GPU **thực thi** (xử lý vertex → pixel). Hiệu năng render = tìm xem **CPU hay GPU** là nút thắt, rồi tối ưu đúng bên.

---

## 2. Ba render pipeline của Unity

| Pipeline | Bản chất | Dùng cho |
|----------|----------|----------|
| **Built-in (legacy)** | Pipeline cố định cũ, ít tùy biến | Dự án cũ, đang giảm dần |
| **URP (Universal RP)** | SRP cân bằng đẹp/nhẹ, đa nền tảng | ⭐ Phổ biến nhất (mobile, indie, đa platform) |
| **HDRP (High Definition RP)** | SRP cho đồ họa cao cấp, nặng | PC/Console AAA |

### SRP (Scriptable Render Pipeline)
URP & HDRP đều xây trên **SRP** — cho phép **lập trình tùy biến** pipeline bằng C# (render pass riêng, render feature). Đây là điểm Senior khai thác: chèn hiệu ứng custom (outline, custom lighting, post effect) vào đúng chỗ trong pipeline.

---

## 3. Một frame được dựng thế nào (đơn giản hóa)

```
CPU side:
  Culling (loại object ngoài tầm nhìn / bị che)
   → Sắp xếp & batch các draw call
   → Gửi lệnh vẽ tới GPU (mỗi draw call = một lệnh)
GPU side:
  Vertex shader (biến đổi đỉnh → vị trí màn hình)
   → Rasterization (đỉnh → pixel)
   → Fragment/Pixel shader (tính màu mỗi pixel: texture, ánh sáng)
   → Tests (depth, stencil) & Blending
   → Ghi vào framebuffer → màn hình
```

### Forward vs Deferred Rendering
- **Forward:** vẽ từng object, tính ánh sáng ngay. Đơn giản, hợp ít đèn, tốt mobile (URP mặc định forward).
- **Deferred:** vẽ thông tin hình học trước (G-buffer), tính ánh sáng sau một lần. Hợp **nhiều đèn**, nhưng tốn bandwidth/memory hơn.

---

## 4. CPU-bound vs GPU-bound (chẩn đoán cốt lõi)

| Nút thắt | Triệu chứng | Nguyên nhân thường gặp | Hướng tối ưu |
|----------|-------------|------------------------|--------------|
| **CPU-bound** | CPU frame time cao, GPU rảnh | Quá nhiều **draw call**, logic, culling kém | Giảm draw call (batching, instancing), giảm object |
| **GPU-bound** | GPU frame time cao | **Overdraw**, shader nặng, fill-rate, độ phân giải | Giảm overdraw, shader nhẹ, LOD, giảm pixel |

> 🔑 Senior **luôn xác định bound nào trước** (qua Profiler/Frame Debugger) rồi mới tối ưu — tối ưu sai bên là vô ích.

---

## 5. Khái niệm hiệu năng render then chốt

- **Draw Call & Batching:** mỗi draw call tốn CPU gửi lệnh. Gộp lại bằng **SRP Batcher** (URP/HDRP), **GPU Instancing** (object giống nhau), **Static Batching** (object tĩnh). Giảm số material khác nhau.
- **Overdraw:** pixel bị vẽ nhiều lần (transparent, particle, UI chồng) → tốn fill-rate (đặc biệt mobile). Giảm lớp trong suốt.
- **Culling:** Frustum culling (ngoài tầm camera) tự động; **Occlusion culling** (bị vật khác che) cần bake.
- **LOD:** object xa dùng mesh đơn giản hơn.
- **Shader variants:** keyword sinh nhiều biến thể shader → tốn build/memory; quản lý cẩn thận.
- **Mobile GPU (tile-based):** kiến trúc khác desktop → overdraw & bandwidth nhạy cảm hơn; tránh đọc framebuffer giữa chừng.

Xem áp dụng thực tế: [Performance](../../05-Technical-Deep-Dives/performance.md), [Graphics & Rendering](../../05-Technical-Deep-Dives/graphics-and-rendering.md).

---

## 6. Ứng dụng thực tế (cấp Senior)

- Chọn pipeline (URP/HDRP) theo target & đo đánh đổi.
- Viết **Render Feature/Pass** tùy biến (outline, custom post-process, special effect).
- Đặt & bảo vệ **render budget** (ms GPU, draw call) cho dự án.
- Tối ưu cho **mobile GPU** đặc thù (tile-based, bandwidth).
- Dùng **Frame Debugger / RenderDoc** phân tích từng draw call.
- Cân bằng chất lượng hình ảnh ↔ hiệu năng cho nhiều cấu hình thiết bị.

---

## 7. Lỗi thường gặp

- ❌ Tối ưu sai bound (giảm draw call khi đang GPU-bound vì overdraw).
- ❌ Quá nhiều material khác nhau → phá batching → draw call bùng nổ.
- ❌ Lạm dụng transparent/particle → overdraw giết hiệu năng mobile.
- ❌ Realtime lighting/shadow nặng trên mobile (nên bake).
- ❌ Shader nhiều keyword → variant explosion (build lâu, memory cao).
- ❌ Không hiểu mobile GPU tile-based → tối ưu kiểu desktop, sai.
- ❌ Không đo (Frame Debugger/Profiler) mà đoán.

---

## 8. Best practices

- ✅ Luôn xác định **CPU-bound hay GPU-bound** trước khi tối ưu.
- ✅ Giảm draw call: batching, instancing, ít material.
- ✅ Kiểm soát overdraw (transparent, UI, particle), đặc biệt mobile.
- ✅ Dùng LOD, occlusion culling cho cảnh lớn.
- ✅ Bake lighting cho mobile; realtime chỉ khi cần.
- ✅ Quản lý shader variants; profile bằng Frame Debugger/RenderDoc.
- ✅ Đặt render budget theo target và bảo vệ qua thời gian.
- ✅ Hiểu đặc thù GPU từng nền tảng (mobile tile-based vs desktop).

---

## 9. Liên kết
- [Graphics & Rendering](../../05-Technical-Deep-Dives/graphics-and-rendering.md) — shader, URP/HDRP, VFX, học chuyên sâu.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — đo, draw call, overdraw, mobile.
- [Memory Model](./memory-model.md) — native memory của texture/mesh.

---

[⬅️ Memory Model](./memory-model.md) | [Script Execution & Player Loop ➡️](./execution-order-playerloop.md)
