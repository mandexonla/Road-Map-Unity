# 🌳 Level 3: MID-LEVEL Developer

[⬅️ Về trang chủ](../README.md) | [Skills](./skills.md) · [Projects](./projects.md) · [Resources](./resources.md) · [Checklist](./checklist.md)

> ⏱️ **Thời gian:** 12-18 tháng (toàn thời gian)
> 🎯 **Mục tiêu cuối level:** Được giao một yêu cầu mơ hồ ("làm hệ thống inventory") và tự thiết kế + dựng xong, code bền vững, người khác build lên được.

---

## 1. Bạn là ai ở level này?

Bạn là **xương sống của team** — người làm được việc thật, độc lập. Khác biệt cốt lõi với Junior:
- Junior cần **task rõ ràng**. Mid nhận **vấn đề mơ hồ** và tự chia nhỏ, tự thiết kế.
- Junior nghĩ về **feature**. Mid nghĩ về **hệ thống & kiến trúc**.
- Junior hỏi "làm thế nào?". Mid hỏi "**tại sao** và **đánh đổi gì**?".

> 🔑 Bước nhảy Junior → Mid: từ **"làm đúng yêu cầu"** sang **"tự định nghĩa giải pháp tốt và bền"**.

---

## 2. Tư duy quan trọng nhất ở Mid

> **Code không chỉ phải chạy, mà phải DỄ THAY ĐỔI.** Yêu cầu game luôn đổi. Hệ thống tốt là hệ thống dễ sửa khi designer đổi ý lần thứ 5.

Và:

> **Mọi quyết định kỹ thuật đều có ĐÁNH ĐỔI (trade-off).** Không có giải pháp "đúng tuyệt đối", chỉ có giải pháp phù hợp với bối cảnh (deadline, team, nền tảng, quy mô).

---

## 3. Lộ trình học trong level

```
Tháng 1-3:   Kiến trúc phần mềm sâu (SOLID, dependency injection, layering, MVC/MVVM)
Tháng 3-5:   Hệ thống Unity nâng cao (Addressables, Async/await & Coroutine nâng cao, DI container)
Tháng 5-8:   Chuyên sâu 1 mảng (chọn: Gameplay / Tools / Graphics / Multiplayer)
Tháng 6-10:  Tối ưu hiệu năng thật (Profiler sâu, memory, GC, build size, mobile)
Tháng 8-14:  Tự dựng một hệ thống lớn từ đầu (dự án Mid)
Tháng 12-18: Test/CI, build pipeline, làm trong dự án lớn nhiều người
```

---

## 4. Phạm vi kiến thức (tóm tắt)

| Mảng | Cần đạt được |
|------|--------------|
| **Kiến trúc** | SOLID, Dependency Injection, layering, tách biệt concern, MVC/MVP/MVVM, data-driven design |
| **Async** | Coroutine sâu, async/await, UniTask, Job System (cơ bản) |
| **Asset management** | Addressables (load/unload, memory, remote), AssetBundle (hiểu) |
| **Hiệu năng** | Profiler sâu, Memory Profiler, GC, draw call, batching, LOD, tối ưu mobile thật |
| **Chuyên sâu 1 mảng** | Gameplay systems / Tools & Editor / Graphics & Shader / Multiplayer (chọn) |
| **Testing** | Unit test (NUnit), Play mode test, test-friendly architecture |
| **Build & DevOps** | CI/CD cơ bản, build automation, multi-platform, versioning |
| **Hệ thống lớn** | Inventory, quest, dialogue, save system, modular & mở rộng được |
| **Leadership mầm** | Review code người khác, viết tài liệu kỹ thuật, ước lượng feature |

Chi tiết: [skills.md](./skills.md). Các mảng chuyên sâu: [05-Technical-Deep-Dives](../05-Technical-Deep-Dives/README.md).

---

## 5. ✅ Cách đánh giá ĐÚNG bạn đã qua Mid

Bạn qua Mid khi:

- ✅ Nhận yêu cầu mơ hồ ("cần hệ thống save/load linh hoạt") và **tự thiết kế + dựng xong** không cần cầm tay.
- ✅ Code của bạn **bền**: 6 tháng sau người khác (hoặc chính bạn) vẫn dễ mở rộng, ít bug.
- ✅ Ra quyết định kỹ thuật và **giải thích được trade-off** (tại sao chọn cách này, đánh đổi gì).
- ✅ Tối ưu được hiệu năng thật (giảm lag/memory đo được bằng Profiler).
- ✅ **Chuyên sâu rõ rệt** ở ít nhất 1 mảng.
- ✅ Review code người khác có chất lượng, mentor được Junior.
- ✅ Viết được unit test cho logic quan trọng.

👉 Chi tiết: [checklist.md](./checklist.md).

> 🧪 **Bài test:** Được giao *"thiết kế và xây dựng hệ thống inventory + crafting cho RPG, phải dễ mở rộng vật phẩm mới và moddable"*. Bạn tự thiết kế kiến trúc (data, logic, UI tách biệt), giải thích được lựa chọn, và dựng xong chạy tốt? → Sẵn sàng lên Senior.

---

## 6. Lỗi thường gặp ở Mid

| Lỗi | Cách tránh |
|-----|-----------|
| Over-engineering — kiến trúc phức tạp quá mức | Cân nhắc bối cảnh: game nhỏ không cần kiến trúc AAA. YAGNI. |
| Áp dụng pattern/architecture cứng nhắc | Kiến trúc phục vụ sản phẩm, không ngược lại |
| Quá tập trung "code đẹp" mà chậm deliver | Cân kỹ thuật vs deadline — đây là kỹ năng Mid→Senior |
| Tối ưu sớm (premature optimization) | Đo trước (Profiler), tối ưu chỗ thật sự nghẽn |
| Không viết tài liệu/test | Hệ thống lớn cần doc & test để bền |
| Ngại giải thích quyết định cho team | Tập communicate — đây là kỹ năng Senior cần |

---

## 7. Chọn hướng chuyên sâu

Đây là lúc bắt đầu xây "thân chữ T". Đọc [career-paths.md](../00-Overview/career-paths.md) rồi chọn 1 mảng đào sâu qua [05-Technical-Deep-Dives](../05-Technical-Deep-Dives/README.md):
- 🎮 **Gameplay systems** → [gameplay-systems.md](../05-Technical-Deep-Dives/gameplay-systems.md)
- 🔧 **Tools & Editor** → [tools-and-editor.md](../05-Technical-Deep-Dives/tools-and-editor.md)
- 🎨 **Graphics & Shader** → [graphics-and-rendering.md](../05-Technical-Deep-Dives/graphics-and-rendering.md)
- 🌐 **Multiplayer** → [multiplayer-networking.md](../05-Technical-Deep-Dives/multiplayer-networking.md)

> Vẫn giữ nhánh Indie chạy song song: [06-Indie-Track](../06-Indie-Track/README.md).

---

[⬅️ Về trang chủ](../README.md) | [Skills ➡️](./skills.md)
