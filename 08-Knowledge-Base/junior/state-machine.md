# 🔀 State Machine (Máy Trạng Thái)

[⬅️ Design Patterns](./design-patterns.md) | Liên quan: [Animator](./animator.md) · [Interface & Abstract](./interface-and-abstract.md)

---

## 1. Bản chất

**State Machine (FSM - Finite State Machine): một object tại mỗi thời điểm ở trong ĐÚNG MỘT trạng thái, và chỉ chuyển sang trạng thái khác theo các "đường chuyển" (transition) có quy tắc rõ ràng.**

> 🔑 Ý tưởng: thay vì một mớ `if/else` lồng nhau kiểm tra đủ thứ cờ (`isJumping && !isAttacking && isGrounded...`), ta nói rõ: *"object đang ở trạng thái X; từ X chỉ được sang Y hoặc Z khi điều kiện này."* Mỗi trạng thái tự lo hành vi của riêng nó.

```
   ┌────────┐  thấy player   ┌────────┐  tới gần   ┌────────┐
   │ Patrol │ ───────────►   │ Chase  │ ────────►  │ Attack │
   └────────┘                └────────┘            └────────┘
        ▲   mất dấu player        │   player chạy xa     │
        └─────────────────────────┴──────────────────────┘
```

---

## 2. Vấn đề nó giải quyết: "boolean hell"

AI hoặc player có nhiều trạng thái → code không có FSM biến thành rừng cờ:
```csharp
// ❌ Boolean hell — không thể bảo trì
void Update() {
    if (isPatrolling && seesPlayer && !isDead) { isPatrolling=false; isChasing=true; }
    if (isChasing && distance < 2 && !isStunned) { isChasing=false; isAttacking=true; }
    if (isAttacking && distance > 2) { ... }
    // ...20 dòng if lồng cờ, mỗi thêm trạng thái nhân đôi độ rối
}
```
Vấn đề: tổ hợp cờ bùng nổ, dễ vào trạng thái vô lý (vừa chết vừa tấn công), không ai hiểu nổi.

**FSM giải:** mỗi trạng thái là một "hộp" riêng biệt, tự lo hành vi + điều kiện thoát. Thêm trạng thái = thêm một hộp, không đụng hộp khác.

---

## 3. Cách hoạt động & cú pháp

### Cách đơn giản: enum + switch (cho ít trạng thái)
```csharp
enum State { Patrol, Chase, Attack }
State current = State.Patrol;

void Update() {
    switch (current) {
        case State.Patrol:
            Patrol();
            if (SeesPlayer()) current = State.Chase;
            break;
        case State.Chase:
            ChasePlayer();
            if (InAttackRange()) current = State.Attack;
            else if (!SeesPlayer()) current = State.Patrol;
            break;
        case State.Attack:
            Attack();
            if (!InAttackRange()) current = State.Chase;
            break;
    }
}
```
Đủ tốt cho 2-4 trạng thái đơn giản.

### Cách bài bản: State pattern (mỗi state một class)
Khi nhiều trạng thái/phức tạp, tách mỗi state thành class (dùng [interface](./interface-and-abstract.md)):
```csharp
public interface IState {
    void Enter();   // chạy khi VÀO trạng thái (1 lần)
    void Tick();    // chạy mỗi frame khi Ở trạng thái
    void Exit();    // chạy khi RỜI trạng thái
}

public class StateMachine {
    private IState current;
    public void ChangeState(IState next) {
        current?.Exit();      // dọn trạng thái cũ
        current = next;
        current.Enter();      // khởi tạo trạng thái mới
    }
    public void Tick() => current?.Tick();
}
```
> Lợi ích: mỗi state là một file riêng, dễ đọc, dễ thêm. `Enter/Exit` xử lý sạch việc vào/ra (vd Enter bật animation, Exit tắt hiệu ứng).

---

## 4. Ứng dụng thực tế

- **AI enemy:** Patrol / Chase / Attack / Flee / Dead.
- **Player controller:** Idle / Run / Jump / Dash / Climb / Attack.
- **Game flow:** MainMenu / Playing / Paused / GameOver.
- **UI flow:** màn hình chuyển trạng thái.
- **Quá trình tải:** Loading / Ready / Error.
- **Animator** của Unity **chính là một state machine trực quan** (xem [Animator](./animator.md)).

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Loại bỏ boolean hell | Nhiều state → nhiều transition cần quản |
| Mỗi state độc lập, dễ đọc/thêm | FSM đơn giản hạn chế với AI rất phức tạp |
| Vào/ra trạng thái rõ ràng (Enter/Exit) | Class-based FSM hơi nhiều boilerplate |
| Trạng thái bất hợp lý bị loại trừ | — |

> 💡 Khi FSM không đủ (AI phức tạp, nhiều nhánh quyết định) → tiến lên **Behaviour Tree** hoặc **Hierarchical FSM** (xem [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md)).

---

## 6. Lỗi thường gặp

### ❌ Không có Enter/Exit → trạng thái "dây dưa"
Quên reset khi chuyển state (animation cũ còn chạy, hiệu ứng không tắt). Dùng `Enter()`/`Exit()` để vào/ra sạch.
### ❌ Transition rải rác khắp nơi
Điều kiện chuyển nằm lung tung → khó kiểm soát. Tập trung logic transition rõ ràng.
### ❌ State biết quá nhiều về state khác
State nên độc lập; chuyển trạng thái qua state machine, không để state tự nhảy lung tung vào nội bộ state khác.
### ❌ Dùng FSM class-based cho game jam 2 trạng thái
Over-engineer. Enum + switch là đủ. Chọn độ phức tạp hợp bối cảnh.

---

## 7. Best practices

- ✅ Ít trạng thái đơn giản → enum + switch. Nhiều/phức tạp → State pattern (class).
- ✅ Luôn có `Enter`/`Exit` để vào/ra trạng thái sạch sẽ.
- ✅ Mỗi state lo hành vi + điều kiện thoát của riêng nó.
- ✅ Một object **chỉ một state** tại một thời điểm (đó là điểm mạnh — đừng phá vỡ).
- ✅ Tập trung quản lý transition, đặt tên state rõ.
- ✅ Vượt giới hạn FSM → cân nhắc Behaviour Tree.

---

## 8. Liên kết
- [Animator](./animator.md) — state machine trực quan của Unity.
- [Interface & Abstract](./interface-and-abstract.md) — nền cho State pattern.
- [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md) — Behaviour Tree, AI nâng cao.
- [Design Patterns](./design-patterns.md).

---

[⬅️ Observer / Event System](./observer-event-system.md) | [Object Pooling ➡️](./object-pooling.md)
