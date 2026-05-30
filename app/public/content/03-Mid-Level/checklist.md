# ✅ Mid-Level — Checklist Tự Đánh Giá

[⬅️ Resources](./resources.md) | [Lên Senior ➡️](../04-Senior/README.md)

> Cần tick ~85% và qua "bài test" để tự tin lên Senior.

---

## Kiến trúc
- [ ] Hiểu và áp dụng SOLID hợp lý (không cứng nhắc).
- [ ] Dùng Dependency Injection (thủ công và/hoặc container).
- [ ] Tách data ↔ logic ↔ UI rõ ràng.
- [ ] Thiết kế kiến trúc (vẽ sơ đồ) TRƯỚC khi code hệ thống lớn.
- [ ] Code data-driven: thêm nội dung mới không cần sửa code.
- [ ] Tách logic game khỏi MonoBehaviour để test được.

## Async & Asset
- [ ] Dùng async/await, UniTask hoặc Coroutine nâng cao đúng chỗ.
- [ ] Dùng Addressables: load/unload, quản lý memory, tránh leak.
- [ ] (Bonus) Job System + Burst cơ bản.

## Hiệu năng (chuyên nghiệp)
- [ ] Profiler sâu: CPU/GPU/Memory/Rendering.
- [ ] Dùng Memory Profiler tìm leak.
- [ ] Tối ưu draw call (batching, instancing), LOD, overdraw.
- [ ] Giảm GC allocation có hệ thống.
- [ ] Test & tối ưu trên thiết bị thật (mobile).
- [ ] Có số liệu trước/sau khi tối ưu.

## Chuyên sâu
- [ ] Chuyên sâu rõ rệt ở ít nhất 1 mảng (Gameplay/Tools/Graphics/Multiplayer).
- [ ] Làm được sản phẩm đủ sâu để trình bày trong phỏng vấn.

## Hệ thống lớn
- [ ] Tự thiết kế + dựng được hệ thống lớn (inventory/quest/save...) từ yêu cầu mơ hồ.
- [ ] Hệ thống mở rộng được dễ dàng (test bằng "thêm nội dung mới mất bao lâu").
- [ ] Code bền: 6 tháng sau vẫn dễ làm việc cùng.

## Testing & Build
- [ ] Viết unit test cho logic cốt lõi.
- [ ] Hiểu CI/CD, có dùng auto build (GitHub Actions/Cloud Build).
- [ ] Build & quản lý nhiều nền tảng.

## Teamwork & leadership mầm
- [ ] Làm việc tốt trong dự án nhiều người, quản lý conflict.
- [ ] Review code người khác có chất lượng.
- [ ] Mentor được Junior.
- [ ] Viết design doc / tài liệu kỹ thuật.
- [ ] Ước lượng feature tương đối chính xác.

## Quyết định kỹ thuật
- [ ] Ra quyết định kỹ thuật và GIẢI THÍCH được trade-off.
- [ ] Tránh over-engineering — chọn giải pháp phù hợp bối cảnh.
- [ ] Cân được kỹ thuật vs deadline.

## Dự án (bằng chứng)
- [ ] Project 1: hệ thống lớn, kiến trúc tốt, có sơ đồ.
- [ ] Project 2: chuyên sâu 1 mảng.
- [ ] Project 3: làm việc trong team/dự án lớn thật.

---

## 🧪 Bài test tốt nghiệp Mid

> **Đề:** *"Thiết kế và xây dựng hệ thống Inventory + Crafting cho một game RPG. Yêu cầu: dễ thêm vật phẩm/công thức mới (data-driven), tách UI khỏi logic, save/load được, có unit test cho logic crafting, và moddable (người ngoài thêm item không cần đụng code)."*
>
> Bạn có thể:
> 1. Tự thiết kế kiến trúc (vẽ sơ đồ data/logic/UI)?
> 2. Giải thích **tại sao** chọn cách đó, đánh đổi gì?
> 3. Dựng xong chạy tốt, có test, mở rộng dễ?
>
> - ✅ **CÓ cả 3** → Sẵn sàng lên [Senior](../04-Senior/README.md)!
> - ❌ **CHƯA** → Làm thêm hệ thống lớn, đào sâu kiến trúc.

---

## 📈 Tự chấm

| Mức tick | Kết luận |
|----------|----------|
| < 70% | Giữa Mid, làm thêm hệ thống lớn |
| 70-85% | Tập trung kiến trúc + chuyên sâu + trade-off |
| > 85% + qua bài test | ✅ Sẵn sàng bước vào hành trình Senior |

> ⚠️ Mid → Senior không chỉ là kỹ thuật, mà là **tầm ảnh hưởng, phán đoán, và lãnh đạo**. Xem kỹ [04-Senior](../04-Senior/README.md).

---

[⬅️ Resources](./resources.md) | [🎉 Lên Senior ➡️](../04-Senior/README.md)
