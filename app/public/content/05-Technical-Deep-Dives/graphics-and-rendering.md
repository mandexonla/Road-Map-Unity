# 🎨 Graphics & Rendering (Graphics/Rendering Engineer)

[⬅️ Technical Index](./README.md)

> 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior) — hướng chuyên sâu cho **Graphics/Rendering Engineer**

Hướng đòi hỏi toán & tư duy GPU, nhưng giá trị cao và khan hiếm. Làm game đẹp + chạy mượt.

---

## 🟡 0. Nền tảng cần có

- **Toán:** vector, ma trận, dot/cross product, không gian tọa độ (local/world/view/clip), lượng giác.
  - 📺 **Freya Holmér** (YouTube) — toán cho game dev tuyệt vời.
- Hiểu **pipeline render** ở mức khái niệm: vertex → fragment(pixel) → output.

---

## 🟡 1. Render Pipelines trong Unity

| Pipeline | Dùng cho |
|----------|----------|
| **Built-in (legacy)** | Cũ, đang giảm dần |
| **URP (Universal RP)** | ⭐ Phổ biến nhất — mobile, đa nền tảng, cân bằng đẹp/nhẹ |
| **HDRP (High Definition RP)** | PC/Console cao cấp, đồ họa AAA, nặng |

> 📌 Học **URP** trước (thị trường dùng nhiều nhất, đặc biệt mobile & indie). HDRP khi làm dự án high-end.

- **Scriptable Render Pipeline (SRP):** nền tảng cho phép tùy biến pipeline.
- **Render Features / Render Passes:** chèn hiệu ứng tùy biến vào URP.

---

## 🟡 2. Shader — trái tim của graphics

### Bắt đầu: Shader Graph (visual, không cần code)
- Node-based, trực quan, dễ học → làm hầu hết hiệu ứng.
- Học làm: dissolve, hologram, toon/cel shading, water, force field, glow.

### Tiến tới: HLSL (viết code shader)
- Hiểu vertex shader & fragment shader.
- UV manipulation, sampling texture, lighting model.
- Custom function trong Shader Graph → HLSL.
- Hiểu shader chạy song song trên GPU (tư duy khác CPU).

### Khái niệm shader cốt lõi
- Vertex transformation (object → clip space).
- Texture sampling, UV, mipmap.
- Lighting models (Lambert, Blinn-Phong, PBR).
- Blending, depth, stencil.
- Shader variants & keywords (và chi phí của chúng).

---

## 🟡 3. VFX & Particles

- **Shuriken (Particle System):** particle truyền thống, CPU.
- **VFX Graph:** particle trên GPU, hàng triệu hạt (cần URP/HDRP + compute).
- Kết hợp shader + particle cho hiệu ứng đẹp.

---

## 🟡 4. Lighting

- **Realtime vs Baked vs Mixed lighting.**
- **Lightmapping:** bake ánh sáng tĩnh → rẻ runtime (quan trọng cho mobile).
- **Light Probes, Reflection Probes.**
- **Global Illumination** (khái niệm).
- **Shadow:** cascade, resolution, chi phí.
- Post-processing: bloom, color grading, vignette, depth of field, ambient occlusion.

---

## 🟡 5. Tối ưu Rendering (giao với Performance)

- Draw call, batching (SRP Batcher, GPU Instancing).
- Overdraw (transparent, particle, UI).
- LOD, culling (frustum, occlusion).
- Texture: nén, atlas, mipmap, resolution.
- Shader complexity (mobile cần shader nhẹ).
- Fill rate vs vertex count — biết đâu là bottleneck.

Xem: [performance.md](./performance.md).

---

## 🔴 6. Nâng cao (Senior)

- **Compute Shaders:** tính toán song song trên GPU (simulation, procedural, GPU particle).
- **Custom SRP / Render Features:** viết render pass riêng (outline, custom lighting, special effects).
- **Stylized / NPR rendering:** toon, cel, hand-painted, pixel — kỹ thuật làm phong cách riêng.
- **Procedural generation:** mesh/texture sinh bằng code.
- **Advanced lighting:** custom GI, volumetric, screen-space effects.
- **Platform-specific GPU optimization:** mobile GPU (tile-based), console.
- **Frame Debugger & GPU profiling sâu:** RenderDoc, Xcode/Android GPU tools.
- **Shader optimization:** giảm instruction, branch, texture lookup.

---

## 🎯 Lộ trình rèn luyện

```
Mid:     Toán nền · URP · Shader Graph (làm 10+ hiệu ứng) · HLSL cơ bản · VFX Graph
         · lighting/bake · post-processing · tối ưu render cơ bản
Senior:  Compute shader · custom SRP/render feature · NPR/stylized · procedural
         · platform GPU optimization · RenderDoc · shader optimization sâu
```

**Dự án gợi ý:** bộ shader stylized hoàn chỉnh (water, foliage, toon character), custom outline render feature, hệ thống VFX cho combat.

---

## 📚 Tài nguyên
- **Catlike Coding** (⭐ tutorial render/shader sâu nhất, miễn phí).
- **Freya Holmér** (YouTube) — toán game.
- **Cyanilux** (blog) — URP shader & Shader Graph.
- **Ben Cloward** (YouTube) — shader tutorials.
- "The Book of Shaders" (thebookofshaders.com).
- Unity URP/HDRP docs · Shader Graph docs.
- RenderDoc (GPU debugging).

---

## 🔗 Liên quan
- Giao chặt với [performance.md](./performance.md).
- Cần toán nền tảng vững.

---

[⬅️ Tools & Editor](./tools-and-editor.md) | [Multiplayer ➡️](./multiplayer-networking.md)
