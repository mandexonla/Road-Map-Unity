# 🖼️ Art & Audio cho Indie Developer

[⬅️ Indie Index](./README.md)

> Là programmer, bạn không cần thành artist. Bạn cần **đủ để tự làm game nhỏ trông ổn**, hoặc **đủ để điều phối/thuê artist hiệu quả**.

---

## 1. Triết lý art cho programmer-indie

> 🎯 **"Style > skill."** Một phong cách nhất quán đơn giản (pixel, low-poly, flat, hình học) trông chuyên nghiệp hơn art "đẹp nhưng lộn xộn". Chọn style trong tầm tay bạn.

**Các style dễ cho programmer:**
- **Pixel art:** dễ bắt đầu, công cụ rẻ, cộng đồng asset lớn.
- **Low-poly 3D:** ít chi tiết, dễ làm, trông hiện đại.
- **Flat / minimalist / hình học:** dùng shape đơn giản + màu tốt.
- **Asset store + đồng bộ style:** mua asset nhưng chọn cùng phong cách.

---

## 2. Kiến thức art tối thiểu cần biết

| Mảng | Đủ dùng nghĩa là |
|------|-------------------|
| **Color theory** | Chọn palette hài hòa (dùng coolors.co, lospec palettes) |
| **Composition** | Bố cục, focal point, readability (người chơi thấy rõ cái quan trọng) |
| **Animation cơ bản** | 12 principles (ít nhất squash/stretch, anticipation, timing) |
| **UI/UX** | Layout sạch, readable, feedback rõ |
| **Consistency** | Cùng style, cùng scale, cùng palette xuyên suốt |

> 💡 Không cần vẽ giỏi. Cần **gu thẩm mỹ** + **nhất quán** + biết **dùng asset/tham chiếu**.

---

## 3. Công cụ Art

| Mục đích | Công cụ |
|----------|---------|
| Pixel art | Aseprite (⭐ rẻ, chuẩn ngành), Libresprite (free) |
| 2D vẽ/illustration | Krita (free), Photoshop, Affinity, Procreate |
| 3D modeling | Blender (⭐ free, mạnh) |
| Texture | Substance, Krita, Materialize (free) |
| UI design | Figma (free) |
| Asset có sẵn | Unity Asset Store, itch.io, Kenney.nl (⭐ free asset chất lượng) |

> 📌 **Kenney.nl** — kho asset miễn phí khổng lồ, cùng style. Cứu tinh cho prototype & programmer-indie.

---

## 4. Audio cho Indie

Âm thanh thường bị xem nhẹ nhưng **tăng 50% cảm giác game** với rất ít công.

| Mảng | Cần gì |
|------|--------|
| **SFX** | Mỗi hành động có âm thanh (jump, hit, pickup, UI click) |
| **Music** | Nhạc nền hợp tông game, loop tốt |
| **Implementation** | Mixing, ducking, random pitch (tránh lặp nhàm), spatial audio |

**Nguồn audio:**
- **Tự tạo SFX:** Bfxr, jsfxr, ChipTone (free, retro SFX trong 1 phút).
- **Nhạc/SFX free:** freesound.org, OpenGameArt, Kenney, incompetech (nhạc CC).
- **Mua:** Asset Store, Humble Bundle audio packs.
- **Audio middleware:** FMOD, Wwise (cho game lớn; tích hợp Unity).

> 💡 Mẹo rẻ-mà-hiệu-quả: thêm **random pitch** cho SFX lặp, **screen shake + SFX** cho hit → cảm giác tăng vọt.

---

## 5. Khi nào tự làm, khi nào thuê?

| Tình huống | Lời khuyên |
|-----------|-----------|
| Prototype / game jam | Tự làm / asset free (Kenney) |
| Game nhỏ itch.io | Tự làm style đơn giản hoặc asset |
| Game thương mại Steam | Cân nhắc thuê artist/composer cho key art & polish |
| Marketing (capsule, trailer) | Đầu tư — đây là "bộ mặt" bán game |

**Làm việc với artist/freelancer:**
- Chuẩn bị style reference rõ ràng.
- Định nghĩa scope & deliverable cụ thể.
- Nguồn thuê: ArtStation, các cộng đồng game dev, Fiverr/Upwork (cẩn thận chất lượng).

---

## 6. Lỗi thường gặp

- ❌ Làm art đẹp trước khi biết game có vui (lãng phí).
- ❌ Style không nhất quán (mua asset lung tung).
- ❌ Bỏ qua audio (game "câm" mất 50% cảm giác).
- ❌ UI lộn xộn, khó đọc.
- ❌ Cầu toàn art trong khi nên ship.

---

## 🎯 Thực hành

```
Junior:  Học 1 style (pixel/low-poly) đủ làm prototype · dùng Kenney asset · thêm SFX/nhạc free
Mid:     Một game nhỏ có style nhất quán + audio đầy đủ · biết Aseprite/Blender cơ bản
Senior:  Điều phối artist/composer · key art & trailer cho thương mại · audio middleware
```

---

## 📚 Tài nguyên
- Kenney.nl, OpenGameArt, itch.io (asset free).
- Aseprite, Blender, Krita, Figma (công cụ).
- Bfxr/jsfxr/ChipTone, freesound.org (audio).
- "Game Art" tutorials (Blender Guru, Brackeys art videos, Pixel Pete).

---

[⬅️ Game Design](./game-design.md) | [Production & Scope ➡️](./production-and-scope.md)
