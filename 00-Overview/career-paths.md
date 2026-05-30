# 🛣️ Các Hướng Nghề Nghiệp Unity Developer

[⬅️ Cách dùng](./how-to-use.md) | [Cách tự đánh giá ➡️](./self-assessment.md)

---

Unity là một công cụ rộng. "Unity Developer" không phải một nghề duy nhất mà là nhiều hướng. Hiểu rõ các hướng giúp bạn không lan man.

## 1. Bản đồ các vai trò trong ngành

```
                          UNITY DEVELOPER
                                │
   ┌──────────────┬─────────────┼─────────────┬──────────────┐
   ▼              ▼             ▼             ▼              ▼
Gameplay     Tools/Engine   Graphics/    Backend/        Generalist
Programmer   Programmer     Rendering    Multiplayer     (Indie)
   │              │             │             │              │
"Làm cơ chế   "Làm công cụ  "Shader,    "Server,        "Làm tất cả,
 game, AI,     cho team,     VFX, render  netcode,        từ A-Z"
 UI, input"    pipeline"     pipeline"    matchmaking"
```

| Vai trò | Làm gì | Phù hợp nếu bạn thích |
|---------|--------|----------------------|
| **Gameplay Programmer** | Cơ chế chơi, AI, combat, UI, input, level logic | Thiết kế trải nghiệm, logic game |
| **Tools/Engine Programmer** | Editor tools, build pipeline, framework nội bộ | Kiến trúc, tối ưu quy trình, code "cho lập trình viên" |
| **Graphics/Rendering Engineer** | Shader, VFX, render pipeline (URP/HDRP), tối ưu GPU | Toán, đồ họa, hiệu năng hình ảnh |
| **Multiplayer/Backend Engineer** | Netcode, server, đồng bộ, matchmaking | Hệ thống phân tán, mạng, độ trễ |
| **Generalist / Indie Dev** | Tất cả, để tự ship một game hoàn chỉnh | Tự chủ, sáng tạo, sản phẩm cuối |

> 📌 **Bạn chọn cả 3 mục tiêu (Technical + Công ty + Indie).** Lộ trình này sẽ build cho bạn một **nền Generalist vững** ở giai đoạn đầu, rồi cho phép bạn **chuyên sâu** (Technical) khi lên Mid/Senior, đồng thời có **nhánh Indie** chạy song song.

---

## 2. Ba mục tiêu của bạn kết hợp ra sao?

### 🔧 Technical chuyên sâu
- Đào sâu performance, architecture, rendering, multiplayer, tools.
- Đây là cái phân biệt Senior thật với người "biết dùng Unity".
- Tài liệu: [05-Technical-Deep-Dives](../05-Technical-Deep-Dives/README.md).

### 🏢 Đi làm công ty / studio
- Cần: làm việc nhóm, Git, quy trình (Agile/Scrum), đọc code người khác, code review, giao tiếp.
- Cần portfolio + kỹ năng phỏng vấn. Tài liệu: [07-Interview-and-Portfolio](../07-Interview-and-Portfolio/README.md).
- Đây là nơi bạn học "làm trong dự án lớn, nhiều người" — kinh nghiệm khó tự có khi làm một mình.

### 🎨 Làm game Indie
- Cần thêm: game design, một chút art/audio, marketing, phát hành (Steam/mobile), kinh doanh.
- Tài liệu: [06-Indie-Track](../06-Indie-Track/README.md).
- Bạn không cần giỏi mọi thứ, nhưng cần biết đủ để tự ship hoặc điều phối freelancer.

### 💡 Lời khuyên kết hợp
> **Đi làm công ty 2-4 năm trước khi all-in Indie** là con đường an toàn và mạnh nhất. Công ty dạy bạn quy trình, kỷ luật kỹ thuật, và cách làm dự án lớn — những thứ cực khó tự học. Đồng thời bạn vẫn làm Indie nhỏ vào buổi tối/cuối tuần để giữ lửa và xây portfolio.

---

## 3. Thị trường thực tế (cập nhật theo bối cảnh ngành)

### Tại Việt Nam
- Nhiều studio mobile game (hyper-casual, casual, midcore), outsource, và một số studio sản phẩm.
- Yêu cầu phổ biến: C# vững, Unity UI, tối ưu mobile, tích hợp SDK (ads, analytics, IAP), Git.
- Mức lương tăng rõ theo level: Junior → Mid → Senior chênh lệch lớn; Senior/Lead có giá trị cao.

### Quốc tế / Remote
- Cơ hội remote nhiều hơn cho Mid/Senior có portfolio mạnh và tiếng Anh tốt.
- PC/Console studio đòi hỏi kiến thức sâu hơn (rendering, performance, gameplay phức tạp).

### Xu hướng kỹ thuật đáng chú ý
- **URP** là render pipeline mặc định phổ biến nhất cho đa nền tảng.
- **DOTS/ECS** cho game cần hiệu năng cực cao (nhiều entity).
- **Addressables** thay cho Resources/AssetBundle cũ.
- **Netcode for GameObjects** cho multiplayer.
- Kỹ năng **tối ưu hiệu năng** luôn được trả giá cao ở mọi thị trường.

---

## 4. Bạn không cần chọn ngay bây giờ

Ở Intern/Junior, hãy làm **Generalist** — chạm vào mọi thứ. Đến Mid mới bắt đầu thấy mình thích/giỏi mảng nào và chuyên sâu dần. Senior là người **sâu một mảng + rộng nhiều mảng** (mô hình chữ T).

```
   Kiến thức rộng (biết nhiều mảng)
   ─────────────────────────────────
                  │
                  │  ← Chuyên sâu một mảng
                  │     (Gameplay? Tools? Graphics?)
                  ▼
              Mô hình chữ T của Senior
```

---

[⬅️ Cách dùng](./how-to-use.md) | [Cách tự đánh giá ➡️](./self-assessment.md)
