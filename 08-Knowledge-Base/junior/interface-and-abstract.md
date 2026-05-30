# 🔌 Interface & Abstract Class

[⬅️ Knowledge Base](../README.md) | Liên quan: [Delegate & Event](./delegates-events.md) · [Design Patterns](./design-patterns.md)

> Đây là công cụ #1 để viết code **lỏng (loose coupling)** — nền tảng của mọi kiến trúc tốt. Hiểu chỗ này mở khóa toàn bộ phần Mid.

---

## 1. Bản chất

- **Interface là một "hợp đồng" (contract):** nó nói *"bất cứ ai ký vào tôi PHẢI có những hàm này"*, nhưng **không** nói cách làm. Chỉ có **chữ ký hàm**, không có thân hàm.
- **Abstract class là một "bản thiết kế dở dang":** nó **vừa** có phần chung đã viết sẵn (như class thường), **vừa** có phần để trống bắt lớp con phải hoàn thiện. Không thể tạo trực tiếp.

> 🔑 Cách nhớ: *Interface = "CÓ THỂ LÀM GÌ" (khả năng). Abstract class = "LÀ LOẠI GÌ" (bản chất chung).*
> Một con vịt **LÀ** Animal (abstract), nhưng nó **CÓ THỂ** Swim, Fly (interface). Cá cũng Swim được nhưng không phải Animal cùng nhánh — interface cho phép chia sẻ khả năng xuyên cây kế thừa.

---

## 2. Vấn đề nó giải quyết: phụ thuộc vào "cái cụ thể"

Code tệ phụ thuộc vào **class cụ thể**:
```csharp
class Player {
    void Attack(Goblin enemy) { enemy.TakeDamage(10); } // chỉ đánh được Goblin!
}
```
Muốn đánh Dragon, Slime, Barrel... phải viết lại. Code **cứng (tight coupling)**.

Giải pháp — phụ thuộc vào **interface (cái trừu tượng)**:
```csharp
interface IDamageable { void TakeDamage(int amount); }

class Player {
    void Attack(IDamageable target) { target.TakeDamage(10); } // đánh được MỌI thứ IDamageable
}
```
Giờ Goblin, Dragon, Barrel, Crate — bất cứ gì `implement IDamageable` đều bị đánh. Player **không cần biết** chúng là gì. Đây là **Dependency Inversion** (chữ D trong [SOLID](../mid/solid-principles.md)).

---

## 3. Cách hoạt động & khác biệt cốt lõi

| | Interface | Abstract class |
|--|-----------|----------------|
| Chứa code thực thi? | Không (truyền thống) | Có (phần chung) + phần abstract |
| Có field/state? | Không | Có |
| Kế thừa nhiều? | ✅ Một class implement **nhiều** interface | ❌ Chỉ kế thừa **một** class |
| Constructor? | Không | Có |
| Ý nghĩa | "có khả năng X" | "là một loại X, chia sẻ phần chung" |
| Tạo trực tiếp? | Không | Không (abstract) |

### Quy tắc chọn
- Cần **nhiều khả năng độc lập** ghép vào nhiều loại object → **interface** (`IDamageable`, `IInteractable`, `IMovable`).
- Có **phần code/state chung** mà nhiều lớp con dùng lại → **abstract class** (vd `Enemy` base có máu + di chuyển chung, để lại `Attack()` cho con).
- Thường dùng **cả hai**: abstract class cho "khung chung", interface cho "khả năng".

---

## 4. Cú pháp

```csharp
// INTERFACE — chỉ hợp đồng
public interface IDamageable {
    int Health { get; }              // property trong hợp đồng
    void TakeDamage(int amount);     // hàm, không thân
}

// Một class CÓ THỂ implement nhiều interface
public class Barrel : MonoBehaviour, IDamageable, IInteractable {
    public int Health { get; private set; } = 20;
    public void TakeDamage(int amount) { Health -= amount; if (Health <= 0) Explode(); }
    public void Interact() { /* ... */ }
}

// ABSTRACT CLASS — khung chung + phần để trống
public abstract class Enemy : MonoBehaviour {
    [SerializeField] protected float speed = 3;   // state chung
    protected void Move() { /* logic di chuyển chung */ } // code chung dùng lại

    public abstract void Attack();   // BẮT con phải tự viết
    protected virtual void Die() { Destroy(gameObject); } // có sẵn, con override được
}

public class Archer : Enemy {
    public override void Attack() { /* bắn tên */ } // BẮT BUỘC viết
}
```

---

## 5. Ứng dụng thực tế

- **`IDamageable`** — mọi thứ nhận damage (enemy, player, vật phá được).
- **`IInteractable`** — mọi thứ tương tác (cửa, rương, NPC).
- **`IPickup`** — mọi vật phẩm nhặt được.
- **Tách hệ thống:** UI nhận `ISaveable` để lưu, không cần biết class cụ thể.
- **Strategy pattern:** `IMovementBehaviour` đổi cách di chuyển linh hoạt.
- **Test:** thay implementation thật bằng "giả" (mock) qua interface → unit test được (xem [Unit Testing](../mid/unit-testing.md)).

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Loose coupling — code linh hoạt, dễ mở rộng | Thêm tầng trừu tượng (đọc khó hơn nếu lạm dụng) |
| Một class nhiều khả năng (đa interface) | Quá nhiều interface nhỏ → "interface soup" |
| Dễ test (mock qua interface) | Người mới dễ over-abstract khi chưa cần |
| Nền tảng cho DI & pattern | — |

---

## 7. Lỗi thường gặp

### ❌ Lạm dụng interface khi chưa cần
Game jam/prototype tạo interface cho mọi thứ → phức tạp vô ích. **YAGNI**: chỉ tạo interface khi có **nhiều** implementation hoặc cần test/đổi. Một class duy nhất thì chưa cần interface.

### ❌ Dùng abstract class khi nên dùng interface (và ngược lại)
Cần ghép khả năng xuyên cây kế thừa → interface. Có code chung cho một họ → abstract.

### ❌ Interface khổng lồ ("fat interface")
Interface 20 hàm bắt mọi implementer viết cả 20 dù chỉ cần 3. Tách nhỏ (Interface Segregation — chữ I trong SOLID).

### ❌ Quên: MonoBehaviour vẫn implement interface được
Nhiều người mới không biết script Unity có thể `: MonoBehaviour, IDamageable`. Hoàn toàn được và rất hữu ích.

---

## 8. Best practices

- ✅ Interface đặt tên bắt đầu bằng `I` + tả khả năng: `IDamageable`, `IMovable`.
- ✅ Giữ interface **nhỏ & tập trung** (1 khả năng).
- ✅ Phụ thuộc vào interface ở **ranh giới hệ thống** (nơi cần linh hoạt/test), không phải mọi nơi.
- ✅ Abstract class cho "is-a + code chung"; interface cho "can-do".
- ✅ Dùng `virtual`/`override` để con tùy biến phần của abstract.
- ✅ Đừng abstract sớm — refactor sang interface **khi** xuất hiện implementation thứ hai.

---

## 9. Liên kết
- [Delegate & Event](./delegates-events.md) — cùng họ "giảm phụ thuộc".
- [Design Patterns](./design-patterns.md) — Strategy, State, Factory đều dựa vào interface.
- [SOLID](../mid/solid-principles.md) — Dependency Inversion & Interface Segregation.
- [Dependency Injection](../mid/dependency-injection.md) — tiêm implementation qua interface.

---

[⬅️ Knowledge Base](../README.md) | [Delegate & Event ➡️](./delegates-events.md)
