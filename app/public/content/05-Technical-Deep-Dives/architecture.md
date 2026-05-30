# 🏛️ Kiến Trúc Phần Mềm trong Unity

[⬅️ Technical Index](./README.md)

> 🟢 Cơ bản (Junior) · 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior)

Kiến trúc tốt = code **dễ đọc, dễ sửa, dễ mở rộng, ít bug**. Đây là cái phân biệt rõ nhất giữa các level.

---

## 🟢 1. Vấn đề kiến trúc giải quyết là gì?

Game luôn thay đổi. Designer đổi ý, thêm tính năng, sửa cân bằng. Kiến trúc tốt làm thay đổi **rẻ**. Kiến trúc tệ làm mỗi thay đổi thành ác mộng (sửa 1 chỗ hỏng 5 chỗ).

**Dấu hiệu kiến trúc tệ:**
- Sửa feature A làm hỏng feature B (coupling chặt).
- 1 script 2000 dòng làm mọi thứ (God class).
- Thêm 1 loại item phải sửa 10 file.
- Không ai dám đụng vào "phần đó".

---

## 🟢 2. Coupling & Cohesion (khái niệm gốc)

- **Coupling (phụ thuộc):** các phần phụ thuộc vào nhau bao nhiêu. **Càng lỏng càng tốt.**
- **Cohesion (gắn kết):** một module có tập trung làm một việc không. **Càng cao càng tốt.**

> 🎯 Mục tiêu: **Low coupling, high cohesion.** Mỗi module làm một việc rõ, ít phụ thuộc bên ngoài.

**Ví dụ coupling chặt (xấu):**
```csharp
// Player gọi trực tiếp đủ thứ → đổi 1 cái là Player hỏng
class Player {
    void Die() {
        GameObject.Find("UI").GetComponent<UIManager>().ShowGameOver();
        GameObject.Find("Audio").GetComponent<AudioManager>().PlayDeath();
        GameObject.Find("Score").GetComponent<ScoreManager>().Save();
    }
}
```

**Ví dụ coupling lỏng (tốt) — dùng event:**
```csharp
// Player chỉ "thông báo", ai quan tâm tự xử lý
class Player {
    public static event Action OnPlayerDied;
    void Die() => OnPlayerDied?.Invoke();
}
// UI, Audio, Score tự đăng ký nghe — Player không cần biết họ tồn tại
```

---

## 🟢🟡 3. Design Patterns (theo VẤN ĐỀ, không theo tên)

| Pattern | Giải vấn đề | Cảnh báo |
|---------|-------------|----------|
| **Singleton** | Cần 1 instance truy cập toàn cục | ⚠️ Lạm dụng tạo coupling ẩn, khó test. Dùng tiết kiệm! |
| **Observer/Event** | Tách "ai phát" khỏi "ai nghe" | Khó debug nếu quá nhiều event ngầm |
| **State Machine** | Quản lý trạng thái rõ ràng | — |
| **Object Pool** | Tránh Instantiate/Destroy liên tục | — |
| **Factory** | Tạo object phức tạp theo điều kiện | — |
| **Command** | Đóng gói hành động (undo, replay, input buffer) | — |
| **Strategy** | Đổi thuật toán linh hoạt | — |
| **Service Locator** | Truy cập service không qua Singleton cứng | Vẫn là global, dùng cẩn thận |
| **MVC/MVP/MVVM** | Tách UI khỏi logic & data | — |

> 📖 Đọc bắt buộc: **"Game Programming Patterns"** (Nystrom, miễn phí online).

### ⚠️ Về Singleton (vấn đề kinh điển)
Singleton tiện nhưng nguy hiểm khi lạm dụng:
- Tạo phụ thuộc ẩn (không thấy trong constructor).
- Khó test (không mock được).
- Trạng thái toàn cục → bug khó lần.

**Thay thế tốt hơn:** Dependency Injection, ScriptableObject, Event channel.

---

## 🟡 4. ScriptableObject Architecture

ScriptableObject (SO) là công cụ kiến trúc mạnh nhất & đặc trưng nhất của Unity.

**Dùng SO để:**
- **Config/Data:** chỉ số nhân vật, vũ khí, level (data-driven design).
- **Event Channel:** SO làm kênh event → hệ thống nói chuyện không phụ thuộc cứng.
- **Shared State / Runtime Set:** chia sẻ data giữa object mà không cần Singleton.

```csharp
// Event channel bằng SO — kiến trúc cực sạch
[CreateAssetMenu]
public class GameEvent : ScriptableObject {
    private List<GameEventListener> listeners = new();
    public void Raise() { for (int i = listeners.Count-1; i>=0; i--) listeners[i].OnRaised(); }
    public void Register(GameEventListener l) => listeners.Add(l);
    public void Unregister(GameEventListener l) => listeners.Remove(l);
}
```

> 📺 Xem bắt buộc: **"Game Architecture with Scriptable Objects" — Ryan Hipple (Unite Austin 2017)**.

---

## 🟡 5. SOLID (kim chỉ nam, không phải luật cứng)

| | Nguyên tắc | Trong game |
|--|-----------|-----------|
| **S** | Single Responsibility | `PlayerHealth` chỉ lo máu, không lo UI |
| **O** | Open/Closed | Thêm enemy type không sửa code cũ (dùng interface/SO) |
| **L** | Liskov Substitution | Enemy con thay được Enemy cha không hỏng |
| **I** | Interface Segregation | `IDamageable`, `IMovable` nhỏ gọn, không "interface khổng lồ" |
| **D** | Dependency Inversion | Phụ thuộc interface, không class cụ thể |

> ⚠️ **Game nhỏ đừng over-apply SOLID.** SOLID phục vụ khả năng thay đổi; nếu không cần thay đổi nhiều thì đừng làm phức tạp. **YAGNI > SOLID** cho prototype.

---

## 🟡 6. Dependency Injection (DI)

**Vấn đề:** `GetComponent`, `Find`, Singleton tạo phụ thuộc cứng → khó test, khó đổi.

**Giải pháp:** đưa dependency từ ngoài vào.
```csharp
// Thay vì tự tìm
class Weapon { AudioManager audio = AudioManager.Instance; } // cứng

// Tiêm vào
class Weapon {
    IAudioService audio;
    public void Init(IAudioService audio) => this.audio = audio; // lỏng, test được
}
```

**DI Container cho Unity:** **VContainer** (nhẹ, nhanh, hiện đại) hoặc **Zenject/Extenject**.

> 💡 DI thủ công (truyền tay) là đủ cho game nhỏ-vừa. Container đáng dùng khi dự án lớn, nhiều dependency.

---

## 🔴 7. Kiến trúc cấp hệ thống lớn (Senior)

- **Tách tầng (layering):** data ↔ domain logic ↔ presentation. Logic không phụ thuộc Unity → test & tái dùng được.
- **Assembly Definitions:** chia code thành assembly → compile nhanh, ranh giới rõ, kiểm soát dependency.
- **Modular / Plugin architecture:** tính năng độc lập, lắp/tháo được.
- **Technical debt:** nhận diện, đo, trả nợ có chiến lược (không để tích tụ thành "không thể đụng").
- **Thiết kế cho tuổi thọ:** code phải sống qua nhiều update, nhiều người, nhiều năm.
- **ADR (Architecture Decision Record):** ghi lại quyết định kiến trúc & lý do.

### Nguyên tắc Senior về kiến trúc
> **Kiến trúc tốt nhất là kiến trúc phù hợp nhất với bối cảnh, không phải "xịn" nhất.** Game jam 48h và live-service 5 năm cần kiến trúc hoàn toàn khác. Đọc bối cảnh trước.

---

## ✅ Tiến trình học kiến trúc theo level

```
Junior:  Coupling/cohesion · pattern cơ bản · SO config · tránh God class
Mid:     SOLID · DI · MVC/MVVM · SO event channel · data-driven · tách logic/UI
Senior:  Layering · assembly · modular · technical debt · thiết kế tuổi thọ · ADR
```

---

## 📚 Tài nguyên
- "Game Programming Patterns" — Nystrom (miễn phí).
- "A Philosophy of Software Design" — Ousterhout.
- "Clean Architecture" — Martin.
- Unity e-books: pattern & SO architecture.
- YouTube: Tarodev, Jason Weimann, git-amend.

---

[⬅️ Technical Index](./README.md) | [Performance ➡️](./performance.md)
