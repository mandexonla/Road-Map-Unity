# 🧠 Senior — Kỹ Năng & Kiến Thức Cần Nắm

[⬅️ Senior Overview](./README.md) | [Projects ➡️](./projects.md)

> Ở Senior, kỹ thuật là điều kiện cần, không phải đủ. **Phán đoán + Lãnh đạo** là cái phân biệt.

> 📕 **Hiểu BẢN CHẤT (internals) từng chủ đề Senior:** [Serialization Internals](../08-Knowledge-Base/senior/serialization-internals.md) · [Memory Model](../08-Knowledge-Base/senior/memory-model.md) · [Rendering Pipeline Internals](../08-Knowledge-Base/senior/rendering-pipeline-internals.md) · [Execution Order & Player Loop](../08-Knowledge-Base/senior/execution-order-playerloop.md) · [C# Advanced & Performance](../08-Knowledge-Base/senior/csharp-advanced-performance.md) · [Technical Debt & Architecture](../08-Knowledge-Base/senior/technical-debt-and-architecture.md) · [ADR & Technical Docs](../08-Knowledge-Base/senior/adr-and-technical-docs.md)

---

## A. Technical Mastery — Hiểu Sâu Nguyên Lý

### 1. Unity "dưới mui xe"
- **Serialization:** cách Unity serialize, `[SerializeField]`, ScriptableObject, custom serialization, vấn đề với polymorphism (`SerializeReference`).
- **Rendering pipeline:** hiểu URP/HDRP/Built-in ở mức kiến trúc, custom render pass.
- **Memory model:** managed vs native memory, GC behavior, object lifetime.
- **Execution order & lifecycle ẩn:** script execution order, khi nào cái gì chạy.
- **Assembly Definitions:** tổ chức code thành assembly, compile time, dependency.
- **Player loop:** hiểu vòng lặp engine, chèn custom logic.

### 2. C# nâng cao
- Memory & performance: `struct` vs `class`, stack vs heap, boxing, `Span<T>`, `ref struct`.
- `unsafe`, pointer (khi thật cần).
- Advanced async, `IAsyncEnumerable`, channels.
- Source generators (tự sinh code), reflection (và chi phí của nó).
- Hiểu IL & cách C# biên dịch (đủ để tối ưu & debug sâu).

### 3. Giải quyết vấn đề "không có trên Google"
- Đọc source code (Unity C# reference, package source).
- Debug ở mức sâu: native crash, platform-specific bug, race condition.
- Tự xây công cụ chẩn đoán khi cần.

---

## B. Kiến Trúc Cấp Hệ Thống Lớn

### Thiết kế cho quy mô & tuổi thọ
- Kiến trúc cho **dự án nhiều người, nhiều năm** — không chỉ "chạy được hôm nay".
- **Quản lý nợ kỹ thuật (technical debt):** nhận diện, đo lường, trả nợ có chiến lược.
- **Module hóa & ranh giới:** assembly, package nội bộ, plugin architecture.
- **Khả năng bảo trì:** code 6-12 tháng sau người mới vẫn vào được.
- **Mở rộng & migration:** thiết kế cho thay đổi; chiến lược refactor lớn không làm sập sản phẩm.

### Đánh đổi kiến trúc
- Build vs Buy (tự làm vs dùng asset/middleware).
- Đơn giản vs linh hoạt vs hiệu năng.
- Khi nào dùng pattern phức tạp, khi nào KHÔNG (chống over-engineering ở quy mô lớn).
- Đánh giá rủi ro kỹ thuật của lựa chọn.

Xem: [Technical → Architecture](../05-Technical-Deep-Dives/architecture.md).

---

## C. Tối Ưu Cấp Hệ Thống

- **Performance budget:** đặt ngân sách (ms/frame, MB memory, build size) và bảo vệ nó.
- Tối ưu **cả pipeline**, không chỉ một hàm: asset pipeline, build, loading, runtime.
- Hiểu sâu **CPU/GPU bottleneck**, platform-specific (mobile thermal throttling, console, WebGL).
- **Automation:** tự động phát hiện regression hiệu năng (perf test trong CI).
- Dẫn dắt "optimization pass" cho cả dự án.

Xem: [Performance](../05-Technical-Deep-Dives/performance.md), [Memory](../05-Technical-Deep-Dives/memory-management.md).

---

## D. DevOps, Pipeline & Quy Trình

- **CI/CD nâng cao:** pipeline build/test/deploy đa nền tảng, tự động hóa release.
- **Tooling cho team:** xây công cụ làm cả team nhanh hơn (đây là đòn bẩy lớn của Senior).
- **Quy trình kỹ thuật:** code review standard, branching strategy, release process.
- **Quản lý phụ thuộc & package:** UPM, package nội bộ, versioning.
- Hiểu **live ops** (nếu game service): update, hotfix, remote config, A/B test.

Xem: [Build & Pipeline](../05-Technical-Deep-Dives/build-and-pipeline.md).

---

## E. Leadership & Influence (NỬA QUAN TRỌNG NHẤT)

### Mentoring
- Nâng Junior/Mid lên: dạy tư duy, không chỉ giải pháp.
- Code review như công cụ dạy học, không phải phán xét.
- Tạo môi trường an toàn để hỏi & sai.

### Giao tiếp
- Giải thích kỹ thuật cho **non-tech** (PM, designer, business) bằng ngôn ngữ của họ.
- Viết **design doc / RFC / ADR** (Architecture Decision Record) rõ ràng.
- Trình bày, thuyết phục, đạt đồng thuận kỹ thuật.

### Định chuẩn & dẫn dắt
- Đặt coding standard, kiến trúc chuẩn, best practice cho team.
- Chia việc hợp lý theo năng lực từng người.
- Cân bằng autonomy (trao quyền) và alignment (cùng hướng).

### Ra quyết định
- Quyết trong bất định & thiếu thông tin.
- Cân kỹ thuật ↔ deadline ↔ business ↔ con người.
- Biết khi nào "đủ tốt" và ship.

---

## F. Business & Product Sense

- Hiểu **sản phẩm phục vụ ai**, ưu tiên kỹ thuật theo giá trị business.
- Hiểu **chi phí** (thời gian, tiền, người) của quyết định kỹ thuật.
- Cân **kỹ thuật lý tưởng vs thực tế kinh doanh**.
- (Cho Indie) hiểu thị trường, monetization, scope phù hợp nguồn lực.

---

## G. Học Tập Suốt Đời

Senior giỏi không ngừng học:
- Theo dõi roadmap Unity, công nghệ mới (DOTS, render, AI tools...).
- Đọc source, talk, paper.
- Học từ các ngành/engine khác (Unreal, Godot, web, backend).
- Dạy lại — dạy là cách học sâu nhất.

---

## Bản đồ năng lực Senior

```
        TECHNICAL MASTERY          JUDGEMENT              LEADERSHIP
        ─────────────────        ─────────────        ─────────────────
        Hiểu engine sâu          Thấy trade-off        Mentor & nâng team
        Kiến trúc hệ thống lớn   Thấy rủi ro trước     Giao tiếp đa chiều
        Chuyên gia 1 mảng        Cân nhiều ràng buộc   Định chuẩn & dẫn dắt
        Tối ưu cấp hệ thống      Quyết trong bất định  Business sense
                  └──────────────────┴──────────────────┘
                          = SENIOR (ảnh hưởng > năng suất cá nhân)
```

---

[⬅️ Senior Overview](./README.md) | [Projects ➡️](./projects.md)
