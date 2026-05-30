# 🏗️ UI Architecture: MVC / MVP / MVVM

[⬅️ Knowledge Base](../README.md) | Liên quan: [UI (uGUI)](../junior/ui-ugui.md) · [Data-Driven Design](./data-driven-design.md)

> Khi UI lớn lên, code "nhồi logic vào script UI" trở thành ác mộng. Các mẫu này tách **UI (hiển thị)** khỏi **data & logic** — giúp UI dễ test, dễ đổi, dễ tái dùng.

---

## 1. Bản chất: tách 3 thứ

Mọi mẫu (MVC/MVP/MVVM) đều giải cùng một vấn đề: **tách rời 3 mối quan tâm:**
- **Model** — **dữ liệu & logic nghiệp vụ** (máu, điểm, inventory). Không biết gì về UI.
- **View** — **phần hiển thị** (Canvas, Text, Button). Chỉ vẽ, không chứa logic game.
- **Phần ở giữa** (Controller/Presenter/ViewModel) — **nối** Model và View.

> 🔑 Nguyên tắc cốt lõi: **Model không được biết View, View không được chứa logic game.** Khi tách được, bạn đổi giao diện không đụng logic, và test logic không cần UI.

---

## 2. Vấn đề nó giải quyết

```csharp
// ❌ Script UI nhồi mọi thứ — logic game dính chặt hiển thị
class HealthBarUI : MonoBehaviour {
    Image bar;
    int health = 100;
    void TakeDamage(int d) {           // logic game NẰM TRONG UI!
        health -= d;
        if (health <= 0) GameOver();    // logic
        bar.fillAmount = health / 100f; // hiển thị
        PlayerPrefs.SetInt("hp", health); // lưu
    }
}
```
Vấn đề: logic game (máu, game over, save) **dính chặt** vào UI. Không test được logic mà không có UI. Đổi UI phải đụng logic. Tái dùng logic cho UI khác → không thể.

**Giải:** tách logic ra Model, UI chỉ hiển thị.

---

## 3. Ba biến thể (khác nhau ở "phần giữa")

### MVC (Model - View - Controller)
- Controller nhận input, cập nhật Model, Model thông báo View cập nhật.
- Kinh điển nhưng ranh giới View/Controller trong game dễ mờ.

### MVP (Model - View - Presenter) — hợp Unity nhất
- **View thụ động** (chỉ hiển thị + chuyển sự kiện input cho Presenter).
- **Presenter** chứa logic trình bày, cập nhật View qua interface.
```csharp
public interface IHealthView { void SetHealth(float pct); }     // View ký hợp đồng

public class HealthPresenter {                                    // không phải MonoBehaviour → test được
    IHealthView view; HealthModel model;
    public HealthPresenter(IHealthView view, HealthModel model) {
        this.view = view; this.model = model;
        model.OnChanged += () => view.SetHealth(model.Percent);   // model đổi → cập nhật view
    }
}

public class HealthView : MonoBehaviour, IHealthView {           // chỉ hiển thị
    [SerializeField] Image bar;
    public void SetHealth(float pct) => bar.fillAmount = pct;
}
```

### MVVM (Model - View - ViewModel) — data binding
- **ViewModel** phơi dữ liệu dạng "bindable"; View **tự động** cập nhật khi data đổi (data binding).
- Hợp với **UI Toolkit** (hỗ trợ binding) hoặc thư viện binding cho uGUI.
- Ít boilerplate cập nhật tay, nhưng cần cơ chế binding.

> 💡 Trong Unity game, **MVP** thường thực dụng nhất cho uGUI. **MVVM** sáng giá với UI Toolkit. Đừng quá sa đà tên gọi — nắm **tinh thần tách Model/View** là đủ.

---

## 4. Kết hợp với ScriptableObject

[ScriptableObject](../junior/scriptableobject.md) làm Model/shared-data cực hợp: Model là một SO (`PlayerHealth.asset`), View nghe SO đổi → cập nhật. UI và logic **không tham chiếu trực tiếp nhau**, chỉ qua SO. Kiến trúc rất sạch & designer nối được.

---

## 5. Ứng dụng thực tế

- **HUD phức tạp:** health/mana/ammo/minimap nghe model, không tự chứa logic.
- **Inventory/Shop:** model giữ data items, view render, presenter nối.
- **Settings menu:** model = settings data, view = sliders/toggles.
- **Khi UI cần test** hoặc **nhiều skin/giao diện** dùng chung logic.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Logic test được (tách khỏi UI) | Thêm class/tầng (boilerplate) |
| Đổi UI không đụng logic | Over-engineer cho UI đơn giản |
| Tái dùng logic cho nhiều View | Cần kỷ luật giữ ranh giới |
| Nhiều người làm song song (UI vs logic) | MVVM cần cơ chế binding |

---

## 7. Lỗi thường gặp

- ❌ Áp MVC/MVVM cho **mọi** UI kể cả nút "Quit" đơn giản → thừa. UI đơn giản gọi thẳng cũng được.
- ❌ View "rò rỉ" logic game (tính toán, save) — phải đẩy hết về Model/Presenter.
- ❌ Model biết về View (tham chiếu ngược) — phá vỡ nguyên tắc; dùng event/interface.
- ❌ Tranh cãi tên gọi MVC vs MVP vs MVVM thay vì nắm tinh thần tách.
- ❌ Cập nhật UI mỗi frame thay vì khi data đổi (xem [UI uGUI](../junior/ui-ugui.md)).

---

## 8. Best practices

- ✅ **Model không biết View; View không chứa logic game.**
- ✅ Dùng cho UI **phức tạp / cần test / nhiều giao diện**; UI đơn giản thì gọn nhẹ.
- ✅ MVP cho uGUI; MVVM cho UI Toolkit.
- ✅ Kết hợp [ScriptableObject](../junior/scriptableobject.md) làm Model/shared-data.
- ✅ View cập nhật **theo event** khi model đổi, không polling.
- ✅ Tách để UI-artist & gameplay-dev làm song song.

---

## 9. Liên kết
- [UI (uGUI)](../junior/ui-ugui.md) — nền tảng UI.
- [ScriptableObject](../junior/scriptableobject.md) — Model/shared-data.
- [Data-Driven Design](./data-driven-design.md) · [Architecture](../../05-Technical-Deep-Dives/architecture.md).
- [Unit Testing](./unit-testing.md) — tách UI để test logic.

---

[⬅️ Dependency Injection](./dependency-injection.md) | [Data-Driven Design ➡️](./data-driven-design.md)
