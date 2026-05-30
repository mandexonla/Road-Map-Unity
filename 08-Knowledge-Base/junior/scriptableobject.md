# ⭐ ScriptableObject (Vũ Khí Kiến Trúc Của Unity)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Serialization](../intern/serialization-and-inspector.md) · [Observer / Event System](./observer-event-system.md) · [Data-Driven Design](../mid/data-driven-design.md)

> Đây là khái niệm **phân biệt rõ nhất** một Junior tốt với một người "chỉ biết dùng Unity". Hiểu ScriptableObject (SO) mở khóa cả một trường phái kiến trúc sạch. Đọc thật kỹ.

---

## 1. Bản chất

**ScriptableObject là một class chứa DỮ LIỆU, sống như một Asset trong project (file `.asset`), KHÔNG cần gắn vào GameObject.**

So sánh với MonoBehaviour:
| | MonoBehaviour | ScriptableObject |
|--|---------------|------------------|
| Sống ở đâu | Gắn vào GameObject trong **scene** | Là **Asset** trong project (file riêng) |
| Cần GameObject? | ✅ Bắt buộc | ❌ Không |
| Có `Update`, vật lý? | ✅ Có lifecycle game | ❌ Không (chỉ chứa data + hàm) |
| Mục đích chính | **Hành vi** trên object | **Dữ liệu** chia sẻ, độc lập |
| Tồn tại | Theo object trong scene | Suốt project, độc lập scene |

> 🔑 Cách nhớ: *MonoBehaviour = "hành vi gắn vào object". ScriptableObject = "dữ liệu tồn tại độc lập, như một file."* Một SO giống một "container data thông minh" mà bạn tạo trong cửa sổ Project và chỉnh trong Inspector.

---

## 2. Vấn đề nó giải quyết

### Vấn đề A: Data bị nhồi vào code / prefab
Bạn có 50 loại vũ khí, mỗi cái có damage, tốc độ, tầm bắn. Để ở đâu?
- Hardcode trong script → đổi số phải sửa code + build lại.
- Để trên prefab → data dính chặt vào một GameObject, khó tái dùng, khó so sánh.

**SO giải:** mỗi vũ khí là một **asset data** riêng (`Sword.asset`, `Bow.asset`). Designer chỉnh số trong Inspector, không đụng code. Đây là **data-driven design**.

### Vấn đề B: Trùng lặp data tốn bộ nhớ
1000 con goblin dùng chung chỉ số. Nếu mỗi prefab lưu riêng → lặp 1000 lần. SO cho 1000 goblin **trỏ chung tới một asset** `GoblinData` → một bản data, tiết kiệm bộ nhớ.

### Vấn đề C: Hệ thống phụ thuộc cứng (Singleton hell)
Để các hệ thống nói chuyện, người ta hay lạm dụng Singleton → coupling chặt, khó test. SO làm **kênh trung gian** (event channel, shared variable) → các hệ thống giao tiếp **không cần biết nhau**.

---

## 3. Ba ứng dụng cốt lõi (quan trọng nhất)

### 🅰️ SO làm DATA CONTAINER / CONFIG
```csharp
[CreateAssetMenu(fileName = "Weapon", menuName = "Game/Weapon")]
public class WeaponData : ScriptableObject {
    public string weaponName;
    public int damage;
    public float fireRate;
    public GameObject projectilePrefab;
    public AudioClip fireSound;
}
```
→ Trong Project: chuột phải → Create → Game → Weapon → tạo `Sword.asset`, `Bow.asset`... Chỉnh số trong Inspector. Code chỉ đọc:
```csharp
public class Weapon : MonoBehaviour {
    [SerializeField] WeaponData data;   // kéo asset vào Inspector
    void Fire() { /* dùng data.damage, data.fireRate... */ }
}
```
> Thêm vũ khí mới = tạo asset mới, **không sửa code**. Đây là sức mạnh data-driven.

### 🅱️ SO làm EVENT CHANNEL (kênh sự kiện) — kiến trúc cực sạch
Thay vì Singleton hay event tĩnh, dùng SO làm "kênh phát sóng":
```csharp
[CreateAssetMenu(menuName = "Events/Game Event")]
public class GameEvent : ScriptableObject {
    private readonly List<GameEventListener> listeners = new();
    public void Raise() {
        for (int i = listeners.Count - 1; i >= 0; i--) listeners[i].OnRaised();
    }
    public void Register(GameEventListener l) => listeners.Add(l);
    public void Unregister(GameEventListener l) => listeners.Remove(l);
}
```
→ Tạo asset `OnPlayerDied.asset`. Player giữ tham chiếu nó và `Raise()` khi chết. UI, Audio, Score mỗi cái có một listener trỏ tới **cùng asset đó** và phản ứng. **Không hệ thống nào biết hệ thống nào** — chỉ biết "kênh" chung. Cực kỳ loose coupling và designer nối được trong Inspector.

### 🅲 SO làm SHARED VARIABLE (biến chia sẻ)
```csharp
[CreateAssetMenu(menuName = "Variables/Float")]
public class FloatVariable : ScriptableObject { public float value; }
```
→ Tạo `PlayerHealth.asset`. Player ghi vào nó; UI đọc từ nó. Hai bên **không tham chiếu trực tiếp nhau**, chỉ qua asset chung. Đổi nguồn data không cần sửa UI.

---

## 4. Cách hoạt động bên trong (điều phải hiểu kỹ)

- SO được Unity **serialize** như asset (xem [Serialization](../intern/serialization-and-inspector.md)). Cùng quy tắc field serialize.
- **Một asset SO = MỘT instance data.** Nhiều object trỏ vào nó dùng **chung** instance đó.
- ⚠️ **BẪY LỚN:** Sửa giá trị một SO **lúc Play Mode** sẽ **thay đổi chính asset** đó và **giữ nguyên sau khi thoát Play** (khác MonoBehaviour trên scene tự revert). Đây vừa là tính năng (tweak rồi giữ) vừa là bẫy (vô tình làm hỏng data gốc).
- Vòng đời: `OnEnable`/`OnDisable` của SO chạy khi nạp/gỡ; **không** có `Update`.
- Trong **build**, SO thường **read-only về mặt ý nghĩa** — đừng coi runtime data ghi vào SO là "save" (nó không persistent qua các phiên chơi như bạn tưởng; để lưu thật cần save file, xem [Save/Load](./save-load.md)).

---

## 5. Ứng dụng thực tế

- **Config game:** chỉ số nhân vật, vũ khí, enemy, level, item database.
- **Event architecture:** kênh sự kiện toàn cục sạch (thay Singleton/static event).
- **Shared state:** health, score, game state dùng chung giữa hệ thống.
- **Strategy/behaviour data:** SO chứa "cách hành xử" (AI behaviour, ability) — kết hợp polymorphism.
- **Settings & themes:** cấu hình audio, đồ họa, localization.
- **Runtime sets:** danh sách "mọi enemy đang sống" mà nhiều hệ thống truy cập.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm / Lưu ý |
|---------|---------------------|
| Tách data khỏi code → data-driven, designer tự chỉnh | Bẫy sửa-lúc-Play-Mode làm hỏng asset gốc |
| Giảm phụ thuộc (event channel, shared var) | Đường đi data "ẩn" hơn → khó lần nếu lạm dụng |
| Tiết kiệm bộ nhớ (chia sẻ instance) | Không phải nơi lưu save game (nhầm lẫn phổ biến) |
| Dễ test, dễ tái dùng, dễ mở rộng | Cần kỷ luật đặt tên/tổ chức asset |
| Designer nối logic trong Inspector | Người mới khó nắm lúc đầu |

---

## 7. Lỗi thường gặp

### ❌ Coi SO là nơi "lưu save game"
SO **không** persistent qua các phiên chơi như save file. Ghi runtime vào SO có thể đổi asset trong Editor nhưng **không đáng tin** trong build. Save thật → file (JSON/PlayerPrefs), xem [Save/Load](./save-load.md).

### ❌ Sửa SO lúc Play Mode rồi ngạc nhiên vì asset bị đổi vĩnh viễn
Khác MonoBehaviour. Nếu cần data runtime thay đổi mà không đụng gốc → **copy** SO lúc runtime (`Instantiate(so)`), hoặc tách "data tĩnh (SO)" khỏi "trạng thái runtime (biến thường)".

### ❌ Nhồi logic phức tạp/Update-style vào SO
SO không có lifecycle game. Đừng cố biến nó thành MonoBehaviour.

### ❌ Lạm dụng SO event cho mọi thứ → khó debug
Event channel mạnh nhưng quá nhiều kênh ẩn → khó lần "ai phát, ai nghe". Dùng có chủ đích.

### ❌ Quên `[CreateAssetMenu]` nên không tạo được asset
Không có attribute này thì không có menu chuột-phải để tạo asset.

---

## 8. Best practices

- ✅ Dùng SO cho **mọi data tĩnh/config** (item, enemy, weapon, level) thay vì hardcode.
- ✅ Tách rõ **data tĩnh (SO)** và **trạng thái runtime (biến thường)** — đừng ghi runtime đè asset gốc.
- ✅ Dùng SO event channel cho giao tiếp hệ thống thay vì lạm dụng Singleton.
- ✅ Tổ chức asset SO gọn gàng theo thư mục, đặt tên rõ.
- ✅ `[CreateAssetMenu]` với `menuName` có cấu trúc (`Game/Weapon`).
- ✅ Save thật → file, **không** dựa vào SO.
- ✅ Xem talk kinh điển: **"Game Architecture with Scriptable Objects" — Ryan Hipple (Unite 2017)**.

---

## 9. Liên kết
- [Serialization & Inspector](../intern/serialization-and-inspector.md) — SO dựa trên serialization.
- [Observer / Event System](./observer-event-system.md) — SO event channel.
- [Data-Driven Design](../mid/data-driven-design.md) — triết lý SO mở rộng.
- [Save/Load](./save-load.md) — vì sao SO ≠ save.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — SO trong kiến trúc tổng thể.

---

[⬅️ Clean Code](./clean-code.md) | [Design Patterns ➡️](./design-patterns.md)
