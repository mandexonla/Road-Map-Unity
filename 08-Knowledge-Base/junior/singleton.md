# 🟦 Singleton Pattern

[⬅️ Design Patterns](./design-patterns.md) | Liên quan: [Dependency Injection](../mid/dependency-injection.md) · [ScriptableObject](./scriptableobject.md)

> ⚠️ Đây là pattern **bị lạm dụng nhất** trong game dev. Trang này dạy bạn cả cách dùng **VÀ** vì sao phải dùng tiết kiệm.

---

## 1. Bản chất

**Singleton đảm bảo một class chỉ có ĐÚNG MỘT instance, và cho truy cập nó từ bất cứ đâu** qua một điểm toàn cục (`GameManager.Instance`).

> 🔑 Hai lời hứa: (1) **chỉ một** bản tồn tại, (2) **truy cập toàn cục** dễ dàng. Chính lời hứa thứ 2 là con dao hai lưỡi — tiện nhưng tạo phụ thuộc ngầm.

---

## 2. Vấn đề nó giải quyết

Một số thứ trong game **về bản chất chỉ có một**: trình quản lý game, hệ thống audio, pool quản lý, quản lý scene. Bạn muốn:
- Đảm bảo không ai vô tình tạo hai `AudioManager`.
- Truy cập nó từ mọi script mà không cần kéo tham chiếu khắp nơi.

```csharp
AudioManager.Instance.Play(clip);   // gọi từ bất cứ đâu, tiện
```

---

## 3. Cách hoạt động & cú pháp (Unity)

```csharp
public class GameManager : MonoBehaviour {
    public static GameManager Instance { get; private set; }

    private void Awake() {
        if (Instance != null && Instance != this) {
            Destroy(gameObject);   // đã có một cái → hủy bản thừa
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject); // (tùy) sống qua các scene
    }
}
```
- `static Instance` → điểm truy cập toàn cục.
- `Awake` kiểm tra trùng → đảm bảo chỉ một.
- `DontDestroyOnLoad` → giữ qua chuyển scene (chỉ dùng khi cần).

### Generic Singleton base (tái dùng)
```csharp
public class Singleton<T> : MonoBehaviour where T : MonoBehaviour {
    public static T Instance { get; private set; }
    protected virtual void Awake() {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this as T;
    }
}
// Dùng: public class AudioManager : Singleton<AudioManager> { }
```

---

## 4. ⚠️ Vì sao Singleton nguy hiểm (phần quan trọng nhất)

Singleton tiện tới mức **gây nghiện** — và đó là vấn đề:

### Tác hại 1: Phụ thuộc ẩn (hidden coupling)
```csharp
class Enemy {
    void Die() {
        AudioManager.Instance.Play(...);   // phụ thuộc ngầm
        ScoreManager.Instance.Add(10);      // không thấy trong constructor
        UIManager.Instance.Update();         // Enemy dính chặt 3 hệ thống
    }
}
```
Nhìn class `Enemy` bạn **không biết** nó phụ thuộc những gì — phụ thuộc nằm rải rác trong code, ẩn sau `.Instance`. Đổi/tách `Enemy` ra game khác → kéo theo cả 3 manager.

### Tác hại 2: Khó test
Không thể "giả lập" (mock) `AudioManager.Instance` trong unit test → logic dính singleton không test được. Xem [Unit Testing](../mid/unit-testing.md).

### Tác hại 3: Trạng thái toàn cục khó lần
Bất cứ đâu cũng sửa được `GameManager.Instance.score` → khi score sai, **ai đã sửa?** Khó debug.

### Tác hại 4: Vòng đời & thứ tự khởi tạo
`Instance` có thể `null` nếu truy cập trước khi `Awake` chạy → `NullReferenceException` lúc khởi động. Thứ tự khởi tạo singleton rối rắm trong dự án lớn.

> 🎯 **Kết luận:** Singleton không "xấu", nhưng **lạm dụng** nó là dấu hiệu kiến trúc yếu. Mỗi singleton là một biến toàn cục trá hình.

---

## 5. Khi nào NÊN và KHÔNG NÊN dùng

| ✅ Cân nhắc Singleton | ❌ Đừng Singleton |
|----------------------|-------------------|
| Thật sự chỉ có một & toàn cục (AudioManager, GameManager) | Vì "tiện truy cập" cho mọi thứ |
| Game nhỏ/vừa, cần đơn giản nhanh | Logic cần test |
| Hạ tầng ổn định ít đổi | Thứ có thể có nhiều bản (Enemy, Player, Weapon) |

### Thay thế tốt hơn (khi lớn lên)
- **Dependency Injection** — tiêm dependency rõ ràng thay vì `.Instance` (xem [DI](../mid/dependency-injection.md)).
- **ScriptableObject** — shared data/event channel không cần singleton (xem [SO](./scriptableobject.md)).
- **Service Locator** — đăng ký/lấy service (vẫn global, nhẹ hơn chút).
- **Truyền tham chiếu qua Inspector** (`[SerializeField]`) cho quan hệ cục bộ.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Truy cập toàn cục cực tiện | Phụ thuộc ẩn, coupling chặt |
| Đảm bảo một instance | Khó test (không mock được) |
| Đơn giản, nhanh cho game nhỏ | Trạng thái toàn cục khó debug |
| — | Bẫy thứ tự khởi tạo & null |

---

## 7. Lỗi thường gặp

### ❌ Singleton hóa MỌI thứ
Dấu hiệu kiến trúc yếu. Chỉ singleton thứ thật sự "một & toàn cục".
### ❌ Truy cập `.Instance` trước khi nó được set
NullReference lúc khởi động. Đảm bảo thứ tự (Script Execution Order) hoặc lazy init cẩn thận.
### ❌ `DontDestroyOnLoad` rồi load lại scene gốc → tạo bản trùng
Phải có check `if (Instance != null) Destroy` để hủy bản thừa.
### ❌ Lưu trạng thái game quan trọng chỉ trong singleton static
Static không reset đúng cách giữa các phiên/scene trong Unity → giá trị "ma".

---

## 8. Best practices

- ✅ Dùng Singleton **tiết kiệm** — chỉ cho hạ tầng thật sự một & toàn cục.
- ✅ Có check trùng instance trong `Awake`.
- ✅ Giữ singleton **không chứa logic game phức tạp** (chỉ điều phối/hạ tầng).
- ✅ Khi dự án lớn lên & cần test → chuyển dần sang DI / SO.
- ✅ Đừng để mọi class gọi `.Instance` lung tung — giới hạn điểm truy cập.
- ✅ Hiểu rằng mỗi singleton là một đánh đổi: tiện ↔ coupling.

---

## 9. Liên kết
- [Design Patterns (tổng quan)](./design-patterns.md) — triết lý chống lạm dụng.
- [Dependency Injection](../mid/dependency-injection.md) — giải pháp thay thế trưởng thành.
- [ScriptableObject](./scriptableobject.md) — shared data/event không cần singleton.
- [Unit Testing](../mid/unit-testing.md) — vì sao singleton khó test.

---

[⬅️ Design Patterns](./design-patterns.md) | [Observer / Event System ➡️](./observer-event-system.md)
