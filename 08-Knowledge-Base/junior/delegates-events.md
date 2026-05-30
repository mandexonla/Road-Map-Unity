# 📡 Delegate, Event & Action/Func

[⬅️ Knowledge Base](../README.md) | Liên quan: [Interface & Abstract](./interface-and-abstract.md) · [Observer / Event System](./observer-event-system.md)

> Đây là cơ chế để các hệ thống "nói chuyện" mà **không phụ thuộc cứng** vào nhau. Nền tảng của Observer pattern và kiến trúc event-driven.

---

## 1. Bản chất

- **Delegate là "biến chứa hàm".** Bình thường biến chứa số/chuỗi; delegate chứa **một (hoặc nhiều) hàm** để gọi sau. Nó là **con trỏ hàm** an toàn kiểu.
- **Event là delegate được "bọc lại" cho an toàn:** chỉ class sở hữu mới được **phát (invoke)**, bên ngoài chỉ được **đăng ký/hủy (`+=` / `-=`)**.
- **Action / Func là delegate dựng sẵn** để khỏi tự khai báo: `Action` (không trả về), `Func` (có trả về).

> 🔑 Ý tưởng cốt lõi: thay vì A **gọi thẳng** B, C, D (phụ thuộc cứng), A chỉ **"hô lên một tiếng" (phát event)**. Ai quan tâm thì **tự đăng ký nghe**. A không cần biết ai đang nghe → **loose coupling**.

---

## 2. Vấn đề nó giải quyết

Khi người chơi chết, nhiều thứ phải phản ứng: UI hiện Game Over, Audio phát nhạc buồn, Score lưu điểm, Analytics ghi nhận...

**Cách cứng (xấu):**
```csharp
void Die() {
    uiManager.ShowGameOver();
    audioManager.PlayDeath();
    scoreManager.Save();
    analytics.Log("death");
    // Thêm thứ phản ứng = sửa hàm này. Player phụ thuộc vào TẤT CẢ.
}
```

**Cách event (tốt):**
```csharp
public static event Action OnPlayerDied;
void Die() { OnPlayerDied?.Invoke(); } // chỉ "hô": tôi chết rồi!
// UI, Audio, Score tự đăng ký nghe. Player KHÔNG biết họ tồn tại.
// Thêm thứ phản ứng = thêm 1 subscriber, KHÔNG sửa Player.
```

> Đây chính là nguyên tắc **Open/Closed** (mở rộng không sửa code cũ) trong [SOLID](../mid/solid-principles.md).

---

## 3. Cách hoạt động bên trong

- Delegate giữ một **danh sách hàm (invocation list)**. Khi `Invoke`, nó gọi **lần lượt** mọi hàm trong danh sách.
- `+=` thêm hàm vào danh sách; `-=` gỡ ra.
- `event` chỉ cho phép bên ngoài `+=`/`-=`, **cấm** bên ngoài `Invoke` hoặc gán `=` (ghi đè cả danh sách) → bảo vệ.
- `?.Invoke()` — nếu **không ai đăng ký**, danh sách là `null`; `?.` tránh `NullReferenceException`.

---

## 4. Cú pháp

```csharp
// 1. Delegate tự khai báo (ít dùng trực tiếp ngày nay)
public delegate void HealthChanged(int newHealth);

// 2. Action — delegate dựng sẵn, KHÔNG trả về
Action onJump;                    // không tham số
Action<int> onScoreChanged;       // 1 tham số int
Action<int, int> onDamage;        // 2 tham số

// 3. Func — delegate dựng sẵn, CÓ trả về (tham số cuối là kiểu trả về)
Func<int> getScore;               // trả int
Func<int, int, int> add;          // nhận 2 int, trả int

// 4. event — phát/đăng ký an toàn
public class Health : MonoBehaviour {
    public event Action<int> OnHealthChanged; // event công khai để nghe

    private int hp = 100;
    public void TakeDamage(int dmg) {
        hp -= dmg;
        OnHealthChanged?.Invoke(hp);  // PHÁT — chỉ class này được làm
    }
}

// 5. Đăng ký / hủy ở nơi khác (vd UI)
void OnEnable()  => health.OnHealthChanged += UpdateBar; // nghe
void OnDisable() => health.OnHealthChanged -= UpdateBar; // HỦY (bắt buộc!)
void UpdateBar(int hp) { bar.fillAmount = hp / 100f; }
```

### UnityEvent — event hiện trong Inspector
```csharp
public UnityEvent onDeath;   // designer kéo-thả hàm vào trong Inspector
// Phát: onDeath.Invoke();
```
Khác biệt: `UnityEvent` gán được trong **Inspector** (không cần code), tiện cho designer; nhưng **chậm hơn** C# event và ít kiểm soát kiểu. Dùng khi cần designer nối, dùng C# `event` cho code-to-code.

---

## 5. Ứng dụng thực tế

- **Phản ứng dây chuyền:** player chết / lên level / nhặt đồ → nhiều hệ thống phản ứng.
- **UI cập nhật theo data:** health bar, điểm số nghe event thay vì hỏi mỗi frame.
- **Tách input khỏi logic:** input phát event "Jump", nhân vật nghe.
- **Observer pattern** (xem [Observer / Event System](./observer-event-system.md)).
- **Callback:** "làm xong việc này thì gọi hàm kia" (vd tải xong → `onComplete?.Invoke()`).

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Loose coupling — A không cần biết ai nghe | Khó lần luồng chạy (event ngầm, "ai gọi cái này?") |
| Mở rộng không sửa code cũ (Open/Closed) | Quên `-=` → **memory leak** + lỗi |
| UI/hệ thống cập nhật theo sự kiện, không polling | Lạm dụng → "event spaghetti" khó debug |
| Linh hoạt, tái dùng | Thứ tự subscriber không đảm bảo |

---

## 7. Lỗi thường gặp

### ❌ Quên hủy đăng ký (`-=`) → MEMORY LEAK
Đây là lỗi nghiêm trọng & phổ biến nhất. Đăng ký trong `OnEnable`/`Start` mà không hủy trong `OnDisable`/`OnDestroy`:
- Object bị hủy nhưng delegate **vẫn giữ tham chiếu** tới nó → GC không dọn được → **leak**.
- Event phát → gọi vào object đã "chết" → lỗi.
✅ **Luôn cặp đôi:**
```csharp
void OnEnable()  => Manager.OnWaveStart += HandleWave;
void OnDisable() => Manager.OnWaveStart -= HandleWave;
```
Xem [Memory Management](../../05-Technical-Deep-Dives/memory-management.md).

### ❌ Quên `?.` khi Invoke
Không ai đăng ký → danh sách `null` → `Invoke()` ném `NullReferenceException`. Luôn `OnEvent?.Invoke()`.

### ❌ Dùng `=` thay vì `+=`
`OnEvent = MyHandler` **xóa** mọi subscriber khác. Luôn `+=`. (Dùng `event` để cấm ghi đè từ ngoài.)

### ❌ Lạm dụng static event
Static event tiện nhưng giữ subscriber suốt vòng đời app → dễ leak & khó test. Dùng có chủ đích, nhớ hủy.

---

## 8. Best practices

- ✅ **Luôn `-=` trong `OnDisable`/`OnDestroy`** cho mọi `+=`.
- ✅ Dùng `Action`/`Func` thay vì tự khai báo delegate (gọn, chuẩn).
- ✅ Dùng `event` (không phải delegate trần) để bảo vệ — bên ngoài chỉ nghe.
- ✅ Luôn `?.Invoke()`.
- ✅ Đặt tên event theo "đã/sắp xảy ra": `OnHealthChanged`, `OnPlayerDied`.
- ✅ Truyền dữ liệu cần thiết qua tham số (`Action<int>`), tránh subscriber phải tự đi hỏi lại.
- ✅ Cân nhắc [ScriptableObject Event Channel](./scriptableobject.md) cho kiến trúc sạch hơn ở dự án lớn.

---

## 9. Liên kết
- [Observer / Event System](./observer-event-system.md) — pattern xây trên event.
- [ScriptableObject](./scriptableobject.md) — event channel bằng SO (kiến trúc nâng cao).
- [Interface & Abstract](./interface-and-abstract.md) — cùng mục tiêu loose coupling.
- [Memory Management](../../05-Technical-Deep-Dives/memory-management.md) — vì sao quên `-=` gây leak.

---

[⬅️ Interface & Abstract](./interface-and-abstract.md) | [Generics ➡️](./generics.md)
