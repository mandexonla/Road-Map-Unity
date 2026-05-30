# 🏛️ SOLID Principles

[⬅️ Knowledge Base](../README.md) | Liên quan: [Dependency Injection](./dependency-injection.md) · [Architecture](../../05-Technical-Deep-Dives/architecture.md)

> SOLID là 5 nguyên tắc nền tảng cho code dễ bảo trì & mở rộng. Nhưng nhớ: chúng là **kim chỉ nam, không phải luật cứng**. Game nhỏ đừng over-apply.

---

## 1. Bản chất

SOLID = 5 nguyên tắc thiết kế hướng đối tượng, mỗi nguyên tắc nhắm vào **làm cho thay đổi rẻ hơn**:

> 🔑 Tất cả SOLID xoay quanh **một mục tiêu: cô lập thay đổi.** Code thay đổi liên tục (game design đổi ý). SOLID giúp khi đổi một thứ, bạn không phải sửa mười thứ khác. Nếu code của bạn không cần thay đổi nhiều (prototype), SOLID ít giá trị.

---

## 2. S — Single Responsibility (Trách nhiệm đơn)

**Mỗi class chỉ nên có MỘT lý do để thay đổi.**

```csharp
// ❌ Player làm quá nhiều → đổi UI cũng phải sửa Player, đổi save cũng vậy
class Player { void Move(){} void UpdateHealthBar(){} void SaveGame(){} }

// ✅ Tách: mỗi class một trách nhiệm, một lý do đổi
class PlayerMovement { }   // đổi khi cách di chuyển đổi
class PlayerHealthUI { }   // đổi khi UI đổi
class SaveSystem { }       // đổi khi cách lưu đổi
```
**Dấu hiệu vi phạm:** class tên chung chung (`GameManager` ôm đủ thứ), hàm dài, "và" trong mô tả class ("quản lý player **và** UI **và** save").

---

## 3. O — Open/Closed (Mở để mở rộng, đóng để sửa)

**Thêm tính năng mới bằng cách THÊM code, không SỬA code đã chạy ổn.**

```csharp
// ❌ Thêm enemy type phải SỬA hàm này mỗi lần → dễ làm hỏng cái cũ
float CalcDamage(string type) {
    if (type == "fire") return ...;
    else if (type == "ice") return ...;   // thêm type = sửa đây
}

// ✅ Thêm type = thêm class mới, KHÔNG đụng code cũ
interface IDamageType { float Calc(); }
class FireDamage : IDamageType { public float Calc() => ...; }
class IceDamage  : IDamageType { public float Calc() => ...; }
// Thêm PoisonDamage = tạo class mới, code cũ nguyên vẹn
```
Đạt được nhờ [interface](../junior/interface-and-abstract.md), [Strategy](../junior/factory-and-strategy.md), [event](../junior/delegates-events.md). Đây là lý do pattern tồn tại.

---

## 4. L — Liskov Substitution (Thay thế Liskov)

**Lớp con phải thay thế được lớp cha mà không làm hỏng chương trình.**

```csharp
// ❌ Vi phạm: Penguin LÀ Bird nhưng không bay được → hỏng kỳ vọng
class Bird { virtual void Fly(){} }
class Penguin : Bird { override void Fly(){ throw new Exception(); } } // bom hẹn giờ

// ✅ Tách khả năng: chỉ loài bay được mới có IFlyable
interface IFlyable { void Fly(); }
class Sparrow : Bird, IFlyable { }
class Penguin : Bird { }   // không IFlyable → không ai mong nó bay
```
**Ý nghĩa thực tế:** đừng kế thừa chỉ để "tái dùng code" nếu lớp con phá vỡ hợp đồng của lớp cha. Ưu tiên [composition](../intern/gameobject-component.md) (đúng tinh thần Unity).

---

## 5. I — Interface Segregation (Phân tách Interface)

**Nhiều interface nhỏ chuyên biệt tốt hơn một interface khổng lồ.**

```csharp
// ❌ "Fat interface" — bắt mọi implementer viết cả những hàm không liên quan
interface IEntity { void Move(); void Attack(); void Heal(); void OpenChest(); }
// Một cái rương phải implement Move/Attack/Heal vô nghĩa!

// ✅ Tách nhỏ — implement đúng cái cần
interface IMovable { void Move(); }
interface IDamageable { void TakeDamage(int d); }
interface IInteractable { void Interact(); }
class Chest : IInteractable { }              // chỉ cái nó cần
class Enemy : IMovable, IDamageable { }
```
Khớp với cách dùng [interface](../junior/interface-and-abstract.md) ở Junior.

---

## 6. D — Dependency Inversion (Đảo ngược phụ thuộc)

**Phụ thuộc vào ABSTRACTION (interface), không vào IMPLEMENTATION cụ thể.**

```csharp
// ❌ Player phụ thuộc class cụ thể → khó đổi, khó test
class Player { ConsoleLogger logger = new ConsoleLogger(); }

// ✅ Player phụ thuộc interface → đổi/test thoải mái
class Player {
    ILogger logger;
    public Player(ILogger logger) { this.logger = logger; }  // tiêm vào
}
// Đổi sang FileLogger, hay MockLogger để test — không sửa Player
```
Đây là nền tảng của [Dependency Injection](./dependency-injection.md). "Đảo ngược" = thay vì module cấp cao phụ thuộc module cấp thấp, **cả hai** phụ thuộc abstraction.

---

## 7. ⚠️ SOLID không phải luật cứng

> Người mới học SOLID hay **over-apply**: tạo interface cho mọi class, tách class tới mức vụn vặt, abstract chồng abstract → code khó đọc hơn. Đây là phản tác dụng.

**Cân bằng:**
- Prototype/game jam → SOLID ít quan trọng, ưu tiên tốc độ.
- Hệ thống sống lâu, nhiều người, hay đổi → SOLID đáng giá.
- Áp dụng **khi có dấu hiệu cần** (class phình to, thêm tính năng phải sửa nhiều chỗ), không phải "phòng xa" mọi nơi (**YAGNI**).
- SOLID phục vụ **dễ thay đổi**; nếu không cần thay đổi thì đừng thêm phức tạp.

---

## 8. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm (khi lạm dụng) |
|---------|---------------------------|
| Code dễ mở rộng, sửa an toàn | Quá nhiều interface/class nhỏ → khó theo dõi |
| Dễ test (DIP + ISP) | Tầng trừu tượng thừa làm chậm đọc hiểu |
| Giảm coupling, tăng cohesion | Over-engineer prototype |
| Nền cho pattern & DI | Cần kinh nghiệm để cân bằng |

---

## 9. Lỗi thường gặp

- ❌ Áp SOLID cứng nhắc cho game nhỏ → over-engineering.
- ❌ Tách class quá vụn (anemic) tới mức logic phân mảnh khó theo.
- ❌ Tạo interface cho class chỉ có một implementation mãi mãi (YAGNI).
- ❌ Hiểu nhầm S = "class chỉ một method" (sai — là một **lý do thay đổi**).
- ❌ Kế thừa vi phạm Liskov để tái dùng code (dùng composition thay thế).

---

## 10. Best practices

- ✅ Coi SOLID là **kim chỉ nam**, áp dụng theo bối cảnh & dấu hiệu cần.
- ✅ Ưu tiên **composition over inheritance** (hợp Unity).
- ✅ Refactor sang interface/tách class **khi** xuất hiện nhu cầu thật (implementation thứ 2, class phình).
- ✅ Kết hợp với [Clean Code](../junior/clean-code.md) (KISS/YAGNI) để không lạm dụng.
- ✅ Dùng DIP làm nền cho [DI](./dependency-injection.md) & [testing](./unit-testing.md).

---

## 11. Liên kết
- [Dependency Injection](./dependency-injection.md) — hiện thực hóa chữ D.
- [Interface & Abstract](../junior/interface-and-abstract.md) · [Strategy](../junior/factory-and-strategy.md) — công cụ đạt O & D.
- [Clean Code](../junior/clean-code.md) — SRP, chống over-engineer.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — bức tranh lớn.

---

[⬅️ Knowledge Base](../README.md) | [Dependency Injection ➡️](./dependency-injection.md)
