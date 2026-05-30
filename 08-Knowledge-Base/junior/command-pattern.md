# 🎯 Command Pattern

[⬅️ Design Patterns](./design-patterns.md) | Liên quan: [Interface & Abstract](./interface-and-abstract.md)

---

## 1. Bản chất

**Command pattern đóng gói một "hành động" thành một object** — thay vì gọi hàm trực tiếp, bạn tạo một object "lệnh" chứa hành động đó, để có thể **lưu, xếp hàng, hoàn tác (undo), phát lại (replay)** sau này.

> 🔑 Ý tưởng: biến **động từ** (di chuyển, tấn công, nhảy) thành **danh từ** (một object MoveCommand, AttackCommand). Khi hành động là object, bạn làm được nhiều thứ mà gọi hàm trực tiếp không cho: hủy nó, lưu nó, gửi nó qua mạng, phát lại nó.

---

## 2. Vấn đề nó giải quyết

Gọi hàm trực tiếp `player.Move()` là "làm rồi quên" — không lưu lại, không hoàn tác được. Nhiều tính năng cần "nhớ hành động":
- **Undo/Redo** (game chiến thuật, editor, puzzle).
- **Replay** (xem lại trận đấu).
- **Input buffering / input remapping** (đổi phím, đệm input combat).
- **Hàng đợi lệnh** (RTS: ra nhiều lệnh xếp hàng).
- **Gửi hành động qua mạng** (multiplayer gửi command thay vì state).

Command biến hành động thành dữ liệu → lưu/xử lý được.

---

## 3. Cách hoạt động & cú pháp

```csharp
public interface ICommand {
    void Execute();   // làm hành động
    void Undo();      // hoàn tác
}

public class MoveCommand : ICommand {
    Transform unit; Vector3 from, to;
    public MoveCommand(Transform unit, Vector3 to) {
        this.unit = unit; this.from = unit.position; this.to = to;
    }
    public void Execute() => unit.position = to;
    public void Undo()    => unit.position = from;   // quay về vị trí cũ
}

// Quản lý lịch sử để undo/redo
public class CommandManager {
    Stack<ICommand> history = new();
    public void Do(ICommand cmd) { cmd.Execute(); history.Push(cmd); }
    public void UndoLast() { if (history.Count > 0) history.Pop().Undo(); }
}
```
Mỗi command **tự biết** cách làm và cách hoàn tác. Manager chỉ giữ lịch sử và gọi.

### Ứng dụng input remapping
```csharp
// Thay vì hardcode: if (Space) Jump();
// Gán command cho phím → đổi phím dễ, đổi hành vi dễ
ICommand jumpKey = new JumpCommand(player);
if (Input.GetKeyDown(KeyCode.Space)) jumpKey.Execute();
```

---

## 4. Ứng dụng thực tế

- **Undo/Redo:** game puzzle (Sokoban, Baba Is You), strategy, level editor.
- **Replay system:** lưu chuỗi command, phát lại tạo lại trận đấu.
- **Input handling linh hoạt:** rebinding phím, AI dùng chung command với người chơi.
- **Combat input buffer:** đệm lệnh combo (fighting game).
- **RTS command queue:** xếp hàng lệnh cho unit.
- **Networked actions:** gửi command nhỏ gọn thay vì đồng bộ cả state.

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Undo/redo, replay, queue trở nên dễ | Nhiều class command (boilerplate) |
| Tách "ai ra lệnh" khỏi "ai thực hiện" | Over-engineer nếu không cần undo/replay |
| AI & người chơi dùng chung command | Undo phức tạp với hành động có side-effect lớn |
| Lưu/gửi hành động được | Quản lý lịch sử tốn bộ nhớ |

---

## 6. Lỗi thường gặp

### ❌ Dùng Command khi không cần undo/replay/queue
Nếu chỉ gọi hành động một lần rồi quên → gọi hàm thẳng đơn giản hơn. Command **chỉ đáng giá** khi cần lưu/hoàn tác/phát lại.
### ❌ Undo không khôi phục đủ trạng thái
Hành động có nhiều side-effect (đổi điểm, sinh object, phát âm) → undo phải hoàn nguyên **tất cả**, dễ sót. Lưu đủ state cần để undo.
### ❌ Lịch sử command phình to không giới hạn
Giới hạn số bước undo hoặc dọn lịch sử cũ.

---

## 7. Best practices

- ✅ Dùng khi cần **undo/redo, replay, input buffer, command queue, hoặc gửi hành động**.
- ✅ Mỗi command lưu đủ thông tin để `Execute` **và** `Undo` chính xác.
- ✅ Giới hạn kích thước lịch sử.
- ✅ Cho AI và người chơi dùng chung tập command (tái dùng + nhất quán).
- ✅ Đừng dùng cho hành động một-lần-rồi-quên (YAGNI).

---

## 8. Liên kết
- [Interface & Abstract](./interface-and-abstract.md) — `ICommand` là interface.
- [Input](../intern/input.md) — command cho input remapping/buffer.
- [Design Patterns](./design-patterns.md).
- Multiplayer (gửi command) — [Multiplayer & Networking](../../05-Technical-Deep-Dives/multiplayer-networking.md).

---

[⬅️ Factory & Strategy](./factory-and-strategy.md) | [Animator ➡️](./animator.md)
