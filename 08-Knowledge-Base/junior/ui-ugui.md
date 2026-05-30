# 🖥️ UI System (uGUI / Canvas)

[⬅️ Knowledge Base](../README.md) | Liên quan: [UI Architecture - MVC/MVVM (Mid)](../mid/ui-architecture-mvc-mvvm.md)

> Unity có 2 hệ UI: **uGUI** (Canvas-based, phổ biến nhất cho game) và **UI Toolkit** (mới, mạnh cho editor & UI hiện đại). Trang này tập trung uGUI — cái bạn dùng cho gameplay UI.

---

## 1. Bản chất

**uGUI dựng UI từ GameObject + Component, sống trong một Canvas.** Mỗi nút, text, ảnh là một GameObject có component UI (`Button`, `Image`, `TextMeshProUGUI`). UI là một phần của hệ GameObject quen thuộc — không phải thế giới riêng.

> 🔑 UI trong uGUI cũng là GameObject như mọi thứ khác, chỉ khác: chúng nằm dưới **Canvas** và dùng **RectTransform** (thay vì Transform thường) để định vị theo không gian 2D màn hình.

---

## 2. Vấn đề nó giải quyết

Game cần hiển thị thông tin (máu, điểm, menu) và nhận tương tác (nút bấm) theo cách **thích ứng nhiều kích thước màn hình**. uGUI cung cấp hệ thống layout, anchor, scaling để UI **trông đúng trên mọi độ phân giải** mà không phải đặt pixel thủ công.

---

## 3. Các thành phần cốt lõi

### Canvas (gốc của mọi UI)
3 chế độ **Render Mode**:
| Mode | Ý nghĩa | Dùng cho |
|------|---------|----------|
| **Screen Space - Overlay** | UI vẽ đè lên màn hình, không phụ thuộc camera | HUD, menu (phổ biến nhất) |
| **Screen Space - Camera** | UI ở khoảng cách trước một camera | UI cần hiệu ứng/perspective |
| **World Space** | UI là object trong thế giới 3D | Thanh máu trên đầu enemy, UI trong VR |

### RectTransform — Anchor & Pivot (phần khó nhất)
- **Anchor (neo):** định nghĩa phần tử "bám" vào đâu của cha. Anchor đúng → UI **tự co giãn/định vị** theo kích thước màn hình.
- **Pivot:** điểm gốc của chính phần tử (để xoay/scale/định vị quanh đó).
> ⚠️ Hiểu sai anchor là lý do #1 khiến "UI đẹp trên máy tôi, vỡ trên máy khác". Anchor góc → bám góc; anchor stretch → giãn theo cha.

### Canvas Scaler (responsive)
Quyết định UI scale thế nào theo độ phân giải. Chế độ **"Scale With Screen Size"** + reference resolution → UI co giãn nhất quán trên nhiều màn hình. Bắt buộc hiểu cho mobile.

### Layout Components
- **Horizontal/Vertical/Grid Layout Group:** tự sắp xếp con theo hàng/cột/lưới.
- **Content Size Fitter:** tự co kích thước theo nội dung.
- **Layout Element:** ghi đè kích thước cho item cụ thể.

### Các element thường dùng
- **TextMeshPro (TMP):** hiển thị chữ (⭐ dùng TMP, **không** dùng Text cũ — TMP nét & nhiều tính năng hơn).
- **Image / RawImage:** ảnh, icon, thanh fill (health bar dùng Image type Filled).
- **Button:** nút + sự kiện `OnClick`.
- **Slider, Toggle, ScrollRect, InputField, Dropdown.**

---

## 4. Cú pháp tương tác cơ bản

```csharp
[SerializeField] Button playButton;
[SerializeField] TextMeshProUGUI scoreText;
[SerializeField] Image healthBar;

void Start() {
    playButton.onClick.AddListener(OnPlay);   // gắn sự kiện
}
void OnPlay() => SceneManager.LoadScene("Game");

void UpdateScore(int score) => scoreText.text = $"Score: {score}";
void UpdateHealth(float pct) => healthBar.fillAmount = pct;   // 0..1
```

---

## 5. Ứng dụng thực tế

- **HUD:** máu, điểm, mana, minimap, ammo.
- **Menu:** main menu, pause, settings, inventory, shop.
- **World-space UI:** thanh máu trên đầu enemy, biển báo.
- **Popup/dialog, tooltip, notification.**

---

## 6. Hiệu năng UI (điều ít người mới biết)

uGUI có chi phí ẩn cần hiểu sớm:
- **Canvas rebuild (batching):** khi **bất kỳ** element nào trong một Canvas đổi → **cả Canvas** rebuild → tốn. Đặc biệt UI động (số đổi mỗi frame).
- ✅ **Tách Canvas:** UI tĩnh và UI động ở **Canvas riêng** → đổi động không rebuild cả phần tĩnh.
- **Overdraw:** UI nhiều lớp trong suốt chồng nhau → tốn fill rate (đặc biệt mobile).
- **Raycast Target:** tắt `Raycast Target` cho element không cần bấm (text, icon trang trí) → giảm chi phí xử lý input.
- Xem [Performance](../../05-Technical-Deep-Dives/performance.md).

---

## 7. Lỗi thường gặp

### ❌ Anchor sai → UI vỡ ở độ phân giải khác
Test nhiều tỉ lệ màn hình; đặt anchor đúng (góc/giãn) theo ý đồ.
### ❌ Dùng Text cũ thay vì TextMeshPro
TMP nét hơn, nhiều tính năng. Luôn dùng TMP.
### ❌ Cập nhật UI mỗi frame dù không đổi
`scoreText.text = ...` mỗi frame → rebuild Canvas + sinh rác string. Chỉ cập nhật **khi giá trị đổi** (event-driven).
### ❌ Mọi UI trong một Canvas khổng lồ
UI động làm rebuild cả Canvas. Tách Canvas tĩnh/động.
### ❌ Quên tắt Raycast Target cho element trang trí
Tốn xử lý raycast vô ích.

---

## 8. Best practices

- ✅ Hiểu **Anchor/Pivot** và **Canvas Scaler** để UI responsive.
- ✅ Luôn dùng **TextMeshPro**.
- ✅ Cập nhật UI **theo event/khi đổi**, không mỗi frame.
- ✅ **Tách Canvas** tĩnh vs động (tối ưu rebuild).
- ✅ Tắt **Raycast Target** cho element không tương tác.
- ✅ Dùng Layout Group cho list/grid tự sắp; pool item cho list dài (xem [Object Pool](./object-pooling.md)).
- ✅ Tách logic UI khỏi data/gameplay (chuẩn bị cho [UI Architecture](../mid/ui-architecture-mvc-mvvm.md)).
- ✅ UI Toolkit cho editor tooling & UI rất động phức tạp (học sau).

---

## 9. Liên kết
- [UI Architecture - MVC/MVVM (Mid)](../mid/ui-architecture-mvc-mvvm.md) — tách UI khỏi logic ở quy mô lớn.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — Canvas rebuild, overdraw.
- [Object Pooling](./object-pooling.md) — list/grid UI dài.

---

[⬅️ New Input System](./new-input-system.md) | [Save / Load ➡️](./save-load.md)
