# 📕 Knowledge Base — Thư Viện Kiến Thức Chi Tiết

[⬅️ Về trang chủ](../README.md)

> Đây là phần **giải thích sâu bản chất** từng khái niệm Unity/C#, kiểu "Unity Docs bằng tiếng Việt nhưng đào tới gốc rễ". Khi roadmap nhắc tới một khái niệm (vd MonoBehaviour, Input), bạn **click vào đây** để hiểu tới nơi tới chốn — bản chất, cách hoạt động bên trong, ứng dụng, ưu/nhược điểm, lỗi thường gặp — **không phải đi tìm chỗ khác và hiểu sai**.

---

## 🧭 Mỗi trang được trình bày theo khuôn mẫu

```
1. Bản chất            — Nó THỰC SỰ là gì (không phải định nghĩa thuộc lòng)
2. Vấn đề nó giải quyết — Tại sao nó tồn tại
3. Cách hoạt động bên trong — Engine làm gì "dưới mui xe"
4. Cú pháp & ví dụ     — Code minh họa, giải thích rõ
5. Ứng dụng thực tế    — Dùng khi nào, ví dụ dự án thật
6. Ưu điểm / Nhược điểm — Đánh đổi
7. Lỗi thường gặp      — Bẫy & cách tránh
8. Best practices      — Cách dùng đúng
9. Liên kết            — Khái niệm liên quan
```

> 💡 Triết lý: **Hiểu bản chất một lần, dùng đúng cả đời.** Học vẹt cú pháp sẽ quên; hiểu *tại sao* thì không.

---

## 📂 Mục lục theo level

### 🌱 Nền tảng Intern — [`intern/`](./intern/)
| Chủ đề | Mô tả ngắn |
|--------|-----------|
| [GameObject & Component](./intern/gameobject-component.md) | Khối xây dựng cốt lõi + tư duy "composition over inheritance" |
| [MonoBehaviour & Lifecycle](./intern/monobehaviour-lifecycle.md) | Vòng đời script, thứ tự thực thi, Update vs FixedUpdate |
| [Transform & Hệ tọa độ](./intern/transform.md) | Vị trí/xoay/scale, local vs world space, parent-child |
| [Serialization & Inspector](./intern/serialization-and-inspector.md) | Cách Unity lưu dữ liệu, `[SerializeField]`, tại sao `public` lộ biến |
| [Input](./intern/input.md) | Đọc input, polling vs event, Input Manager cũ vs Input System mới |
| [Physics: Rigidbody & Collider](./intern/physics-rigidbody-collider.md) | Engine vật lý hoạt động thế nào, collision vs trigger, kinematic |
| [Instantiate & Destroy](./intern/instantiate-destroy.md) | Tạo/hủy object, thời điểm thực sự xảy ra, bẫy null |
| [Prefab](./intern/prefab.md) | Bản chất prefab, instance, override, variant |
| [Coroutine](./intern/coroutine.md) | Coroutine thực chất là gì (iterator), cách chạy, vs async |

### 🌿 Junior — [`junior/`](./junior/)
| Chủ đề | Mô tả ngắn |
|--------|-----------|
| [Interface & Abstract Class](./junior/interface-and-abstract.md) | Hợp đồng vs khung chung; loose coupling |
| [Delegate, Event & Action/Func](./junior/delegates-events.md) | Cơ chế "nói chuyện" không phụ thuộc cứng |
| [Generics](./junior/generics.md) | Code cho mọi kiểu, an toàn kiểu, tránh boxing |
| [LINQ](./junior/linq.md) | Truy vấn gọn + bẫy hiệu năng/GC |
| [C# Trung Cấp](./junior/csharp-intermediate.md) | Property, static, nullable, exception |
| [Clean Code](./junior/clean-code.md) | Code cho người đọc: SRP, DRY, KISS, naming |
| [⭐ ScriptableObject](./junior/scriptableobject.md) | Vũ khí kiến trúc: data, event channel, shared state |
| [Design Patterns (tổng quan)](./junior/design-patterns.md) | Triết lý: vấn đề → pattern, chống lạm dụng |
| [Singleton](./junior/singleton.md) | Pattern bị lạm dụng nhất — dùng sao cho đúng |
| [Observer / Event System](./junior/observer-event-system.md) | Phản ứng dây chuyền, event-driven |
| [State Machine](./junior/state-machine.md) | Diệt "boolean hell" cho AI/player |
| [Object Pooling](./junior/object-pooling.md) | Tái dùng object, diệt GC spike |
| [Factory & Strategy](./junior/factory-and-strategy.md) | Tạo object & đổi hành vi linh hoạt |
| [Command Pattern](./junior/command-pattern.md) | Đóng gói hành động: undo, replay, input buffer |
| [Animator & Animation](./junior/animator.md) | State machine animation, blend tree, event |
| [New Input System](./junior/new-input-system.md) | Action, rebinding, đa thiết bị |
| [UI System (uGUI)](./junior/ui-ugui.md) | Canvas, anchor, responsive, hiệu năng UI |
| [Save / Load](./junior/save-load.md) | PlayerPrefs, JSON, versioning |
| [Garbage Collection (cơ bản)](./junior/garbage-collection-basics.md) | Vì sao game "giật một cái", giảm rác |

### 🌳 Mid — [`mid/`](./mid/)
| Chủ đề | Mô tả ngắn |
|--------|-----------|
| [⭐ SOLID Principles](./mid/solid-principles.md) | 5 nguyên tắc cô lập thay đổi (kim chỉ nam) |
| [⭐ Dependency Injection](./mid/dependency-injection.md) | Tiêm dependency, thay Singleton, test được |
| [UI Architecture (MVC/MVP/MVVM)](./mid/ui-architecture-mvc-mvvm.md) | Tách UI khỏi logic & data |
| [Data-Driven Design](./mid/data-driven-design.md) | Hành vi điều khiển bởi data, không hardcode |
| [Async / Await / UniTask](./mid/async-await-unitask.md) | Bất đồng bộ, vì sao cần UniTask |
| [⭐ Addressables](./mid/addressables.md) | Quản lý asset/RAM, remote content |
| [Job System & Burst (DOTS)](./mid/job-system-burst.md) | Tính toán song song quy mô lớn |
| [Unit Testing](./mid/unit-testing.md) | Test tự động, ép kiến trúc tốt |
| [Assembly Definitions](./mid/assembly-definitions.md) | Chia code: compile nhanh, kiểm soát phụ thuộc |

### 🏔️ Senior — [`senior/`](./senior/)
| Chủ đề | Mô tả ngắn |
|--------|-----------|
| [Serialization Internals](./senior/serialization-internals.md) | Serialize sâu, polymorphism, migration |
| [Memory Model](./senior/memory-model.md) | Stack/heap, managed vs native, boxing, struct |
| [Rendering Pipeline Internals](./senior/rendering-pipeline-internals.md) | Frame dựng thế nào, CPU vs GPU bound |
| [Script Execution & Player Loop](./senior/execution-order-playerloop.md) | Player loop, execution order, domain reload |
| [C# Advanced & Performance](./senior/csharp-advanced-performance.md) | Span, stackalloc, alloc ẩn, IL2CPP |
| [Technical Debt & Architecture](./senior/technical-debt-and-architecture.md) | Quản lý nợ kỹ thuật, phán đoán, đánh đổi |
| [ADR & Technical Docs](./senior/adr-and-technical-docs.md) | Ghi quyết định, design doc, giao tiếp |

---

## 🔗 Quan hệ với phần roadmap

- **Roadmap** (`01-Intern` → `04-Senior`) cho bạn biết **học gì, theo thứ tự nào, đánh giá thế nào**.
- **Technical Deep Dives** (`05-`) cho bạn cái nhìn **theo chủ đề kỹ thuật lớn** (architecture, performance...).
- **Knowledge Base** (`08-`, đây) giải thích **bản chất từng khái niệm cụ thể** — chi tiết nhất, để tra cứu & hiểu gốc rễ.

> Ba phần bổ trợ nhau: roadmap = lộ trình, deep dives = chủ đề, knowledge base = từ điển bản chất.

---

[⬅️ Về trang chủ](../README.md) | [Bắt đầu: GameObject & Component ➡️](./intern/gameobject-component.md)
