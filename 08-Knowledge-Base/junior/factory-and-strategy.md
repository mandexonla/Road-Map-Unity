# 🏭 Factory & Strategy Pattern

[⬅️ Design Patterns](./design-patterns.md) | Liên quan: [Interface & Abstract](./interface-and-abstract.md) · [ScriptableObject](./scriptableobject.md)

> Hai pattern này hay đi cùng nhau và đều dựa trên [interface](./interface-and-abstract.md). Factory lo **TẠO** object; Strategy lo **ĐỔI HÀNH VI**.

---

# Phần A — FACTORY (Nhà Máy)

## 1. Bản chất
**Factory tập trung việc TẠO object vào một chỗ, ẩn đi chi tiết "tạo cái gì, tạo thế nào".** Người gọi chỉ nói "tôi cần một enemy loại X", factory lo phần còn lại.

> 🔑 Thay vì rải `new`/`Instantiate` khắp code, gom vào một "nhà máy". Đổi cách tạo → sửa một chỗ.

## 2. Vấn đề nó giải quyết
```csharp
// ❌ Logic tạo rải khắp nơi, lặp lại
if (type == "goblin") e = Instantiate(goblinPrefab);
else if (type == "orc") e = Instantiate(orcPrefab);
// ...lặp đoạn này ở 5 nơi khác nhau
```
Thêm loại enemy → sửa 5 nơi. Factory gom lại một chỗ:
```csharp
public class EnemyFactory {
    public Enemy Create(EnemyType type) {
        return type switch {
            EnemyType.Goblin => Instantiate(goblinPrefab),
            EnemyType.Orc    => Instantiate(orcPrefab),
            _ => null
        };
    }
}
// Mọi nơi: factory.Create(EnemyType.Goblin); — thêm loại chỉ sửa factory
```

## 3. Factory + ScriptableObject (rất Unity)
Kết hợp SO làm data → factory đọc data tạo object, **data-driven** hoàn toàn:
```csharp
// EnemyData (SO) chứa prefab + chỉ số; factory dùng SO để tạo
public Enemy Create(EnemyData data) {
    var e = Instantiate(data.prefab);
    e.Init(data);   // truyền chỉ số từ SO
    return e;
}
```
Thêm enemy mới = tạo một `EnemyData.asset`, **không sửa code** factory.

## 4. Ứng dụng
- Spawn enemy/item/projectile theo loại.
- Tạo UI element theo data.
- Tạo object phức tạp cần nhiều bước setup.
- Kết hợp [Object Pool](./object-pooling.md): factory tạo, pool tái dùng.

---

# Phần B — STRATEGY (Chiến Lược)

## 1. Bản chất
**Strategy: đóng gói các "cách làm" khác nhau (thuật toán/hành vi) sau một interface chung, rồi HOÁN ĐỔI chúng linh hoạt — kể cả lúc chạy.**

> 🔑 Thay vì `if/else` chọn hành vi mỗi lần, ta "cắm" một hành vi vào object như cắm pin. Đổi pin = đổi hành vi.

## 2. Vấn đề nó giải quyết
```csharp
// ❌ if/else chọn cách di chuyển khắp nơi, khó thêm kiểu mới
void Move() {
    if (moveType == "straight") { ... }
    else if (moveType == "zigzag") { ... }
    else if (moveType == "homing") { ... }
}
```
Thêm kiểu di chuyển → sửa hàm này + mọi nơi tương tự.

**Strategy:** mỗi cách di chuyển là một class sau interface chung:
```csharp
public interface IMoveBehaviour { void Move(Transform self); }

public class StraightMove : IMoveBehaviour { public void Move(Transform t){ /*...*/ } }
public class ZigzagMove   : IMoveBehaviour { public void Move(Transform t){ /*...*/ } }
public class HomingMove   : IMoveBehaviour { public void Move(Transform t){ /*...*/ } }

public class Enemy : MonoBehaviour {
    IMoveBehaviour moveBehaviour;          // "cắm" một chiến lược
    void Update() => moveBehaviour.Move(transform);
    public void SetMove(IMoveBehaviour b) => moveBehaviour = b; // đổi lúc chạy!
}
```
Thêm kiểu di chuyển = thêm một class, **không sửa Enemy**. Đổi hành vi runtime (vd enemy nổi điên → đổi sang HomingMove).

## 3. Strategy + ScriptableObject
Biến mỗi strategy thành SO → designer chọn hành vi trong Inspector, data-driven. Đây là mẫu rất mạnh trong Unity (ability system, AI behaviour).

## 4. Ứng dụng
- Kiểu di chuyển/tấn công của enemy.
- Thuật toán AI khác nhau.
- Cách tính damage/giá/score linh hoạt.
- Ability/skill effect (mỗi skill một strategy).
- Thay đổi hành vi theo độ khó.

---

## 5. So sánh nhanh Factory vs Strategy

| | Factory | Strategy |
|--|---------|----------|
| Lo việc | **TẠO** object | **ĐỔI HÀNH VI** của object |
| Câu hỏi | "tạo cái gì?" | "làm việc đó kiểu nào?" |
| Ví dụ | Tạo Goblin vs Orc | Goblin di chuyển thẳng vs zigzag |
| Nền tảng | switch/data | interface + hoán đổi |

> 💡 Chúng bổ trợ: factory **tạo** enemy rồi **gắn** cho nó một strategy di chuyển.

---

## 6. Ưu / Nhược (chung)

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Thêm loại/hành vi không sửa code cũ (Open/Closed) | Thêm tầng class/interface |
| Logic tạo/hành vi tập trung, rõ ràng | Over-engineer nếu chỉ có 1-2 loại cố định |
| Data-driven khi kết hợp SO | Nhiều class nhỏ cần quản lý |

---

## 7. Lỗi thường gặp
- ❌ Dùng Factory/Strategy khi chỉ có **một** loại/hành vi cố định → thừa. (YAGNI)
- ❌ Strategy nhưng vẫn `if/else` chọn strategy ở nơi khác → chưa giải quyết gốc.
- ❌ Interface strategy quá rộng (làm nhiều việc) → khó implement.
- ❌ Quên rằng [SO + polymorphism] thường là cách Unity-idiomatic nhất cho cả hai.

---

## 8. Best practices
- ✅ Dùng khi có **nhiều** biến thể (loại object / cách hành xử) và còn tăng.
- ✅ Kết hợp [ScriptableObject](./scriptableobject.md) để data-driven, designer chọn được.
- ✅ Giữ interface nhỏ, tập trung.
- ✅ Đừng dùng khi chỉ 1-2 loại cố định (viết thẳng đơn giản hơn).
- ✅ Factory + Pool + Strategy phối hợp tạo hệ thống spawn linh hoạt & hiệu năng.

---

## 9. Liên kết
- [Interface & Abstract](./interface-and-abstract.md) — nền của cả hai.
- [ScriptableObject](./scriptableobject.md) — data-driven factory/strategy.
- [Object Pooling](./object-pooling.md) — phối hợp với factory.
- [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md) — ability system dùng strategy.

---

[⬅️ Object Pooling](./object-pooling.md) | [Command Pattern ➡️](./command-pattern.md)
