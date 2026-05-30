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

### 🌿 Junior — `junior/` *(đợt sau)*
Sẽ có: Interface & Abstract, Delegate/Event, ScriptableObject (sâu), Design Patterns từng cái, Animator, GC & memory cơ bản...

### 🌳 Mid — `mid/` *(đợt sau)*
Sẽ có: SOLID từng nguyên tắc, Dependency Injection, Addressables, async/await/UniTask, Job System...

### 🏔️ Senior — `senior/` *(đợt sau)*
Sẽ có: Unity serialization sâu, rendering pipeline internals, memory model, assembly definitions...

---

## 🔗 Quan hệ với phần roadmap

- **Roadmap** (`01-Intern` → `04-Senior`) cho bạn biết **học gì, theo thứ tự nào, đánh giá thế nào**.
- **Technical Deep Dives** (`05-`) cho bạn cái nhìn **theo chủ đề kỹ thuật lớn** (architecture, performance...).
- **Knowledge Base** (`08-`, đây) giải thích **bản chất từng khái niệm cụ thể** — chi tiết nhất, để tra cứu & hiểu gốc rễ.

> Ba phần bổ trợ nhau: roadmap = lộ trình, deep dives = chủ đề, knowledge base = từ điển bản chất.

---

[⬅️ Về trang chủ](../README.md) | [Bắt đầu: GameObject & Component ➡️](./intern/gameobject-component.md)
