# 🧠 Junior — Kỹ Năng & Kiến Thức Cần Nắm

[⬅️ Junior Overview](./README.md) | [Projects ➡️](./projects.md)

---

## A. C# Trung Cấp (nâng cấp tư duy)

### 1. Interface & Abstract
- `interface` — hợp đồng (vd: `IDamageable`, `IInteractable`).
- `abstract class` — lớp cơ sở không tạo trực tiếp.
- Khi nào dùng interface vs abstract vs kế thừa thường.
> 💡 Interface là chìa khóa để code "lỏng" (loose coupling), dễ test, dễ mở rộng.

### 2. Delegate, Event, Action/Func
- `delegate` — con trỏ hàm.
- `event` — phát/đăng ký sự kiện (nền tảng của Observer pattern).
- `Action`, `Action<T>`, `Func<T>` — delegate dựng sẵn.
- `UnityEvent` — event hiện trong Inspector.
> 🔑 Đây là nền tảng để các hệ thống "nói chuyện" mà không phụ thuộc cứng vào nhau.

### 3. Generics
- `class Pool<T>`, `List<T>` — viết code tái dùng cho nhiều kiểu.
- Constraint: `where T : Component`.

### 4. LINQ cơ bản
- `Where`, `Select`, `FirstOrDefault`, `Any`, `OrderBy`.
- ⚠️ Tiện nhưng tốn GC/hiệu năng — tránh trong `Update`/hot path.

### 5. Properties & các kỹ thuật C#
- Auto-property, getter/setter logic.
- `readonly`, `const`, `static`.
- `out`, `ref`, nullable (`?`), null-coalescing (`??`).
- `try/catch/finally`, exception (dùng đúng chỗ).

---

## B. Clean Code — Viết Cho Người Đọc

### Nguyên tắc cốt lõi
| Nguyên tắc | Ý nghĩa |
|-----------|---------|
| **Đặt tên rõ ràng** | `enemySpawnInterval` > `t`, `time2` |
| **SRP** (Single Responsibility) | Mỗi class/hàm làm **một** việc |
| **DRY** (Don't Repeat Yourself) | Code lặp 3 lần → tách hàm |
| **KISS** (Keep It Simple) | Giải pháp đơn giản nhất chạy được |
| **YAGNI** (You Aren't Gonna Need It) | Đừng code tính năng "biết đâu sau cần" |
| **Hàm ngắn** | Một hàm gọn trong một màn hình |

### Refactor
- Nhận diện "code smell": hàm quá dài, class quá to, tham số quá nhiều, đặt tên mơ hồ.
- Refactor an toàn: đổi nhỏ, test sau mỗi bước, dựa vào Git.

---

## C. Design Patterns Thực Tế (học theo VẤN ĐỀ)

> ⚠️ Đừng học pattern để "khoe". Học vì nó giải một vấn đề thật. Lạm dụng pattern = code tệ.

| Pattern | Giải vấn đề gì | Ví dụ trong game |
|---------|----------------|------------------|
| **Singleton** | Cần 1 thực thể truy cập toàn cục | GameManager, AudioManager (cẩn thận lạm dụng!) |
| **Observer / Event** | Tách rời "ai phát" và "ai nghe" | Player chết → UI, Audio, Score cùng phản ứng |
| **State Machine** | Quản lý trạng thái phức tạp | Enemy AI (patrol/chase/attack), Player (idle/run/jump) |
| **Object Pool** | Tránh Instantiate/Destroy liên tục (lag) | Đạn, kẻ địch, hiệu ứng |
| **Factory** | Tạo object phức tạp theo điều kiện | Spawn enemy theo loại |
| **Command** | Đóng gói hành động (undo, input) | Undo move, replay, input buffer |
| **Strategy** | Đổi thuật toán linh hoạt | Các kiểu di chuyển/tấn công khác nhau |

Xem sâu hơn: [Technical → Architecture](../05-Technical-Deep-Dives/architecture.md).

---

## D. ScriptableObject — Vũ Khí Bí Mật Của Unity

> 🔑 Hiểu ScriptableObject (SO) là dấu hiệu rõ của một Junior tốt → Mid.

- **Là gì:** Container data sống trong Asset, không cần gắn vào GameObject.
- **Dùng cho:**
  - Cấu hình (config): chỉ số nhân vật, vũ khí, level data.
  - Tách data khỏi logic (designer chỉnh được không đụng code).
  - **Event channel** (SO làm kênh sự kiện — kiến trúc rất sạch).
  - Shared state giữa các object.
- **Lợi ích:** giảm phụ thuộc, dễ chỉnh trong Editor, tái dùng, tiết kiệm bộ nhớ.

---

## E. Hệ Thống Unity Sâu Hơn

### Animator nâng cao
- State machine, transition, parameters (bool/trigger/float).
- Blend tree (di chuyển 8 hướng, tốc độ).
- Animation events (gọi hàm tại frame cụ thể).
- Layers & avatar mask (tùy chọn).

### New Input System
- Action map, action, binding.
- Hỗ trợ nhiều thiết bị (keyboard, gamepad, touch) cùng lúc.
- Rebinding (cho phép người chơi đổi phím).

### UI nâng cao
- Layout Group, Content Size Fitter, anchor/pivot.
- UI responsive cho nhiều độ phân giải/tỉ lệ màn hình.
- Canvas types (Overlay, Camera, World).
- ⚠️ Hiểu chi phí UI rebuild (Canvas batching) — cơ bản thôi.

### Save / Load
- PlayerPrefs (đơn giản, cho setting/highscore).
- JSON serialize (`JsonUtility`) lưu file.
- Tổ chức save data thành class riêng.

---

## F. Hiệu Năng — Bắt Đầu Quan Tâm

### Profiler cơ bản
- Mở Profiler, đọc CPU/GPU/Memory cơ bản.
- Tìm spike, hiểu "frame này tốn ở đâu".
- Phân biệt CPU-bound vs GPU-bound (khái niệm).

### Tối ưu sơ cấp (thói quen tốt)
- **Cache** `GetComponent`, không gọi trong `Update`.
- Tránh `Find`, `FindObjectOfType` trong hot path.
- Object Pooling thay Instantiate/Destroy liên tục.
- Hạn chế cấp phát GC trong `Update` (tránh `new`, LINQ, string concat).
- Hiểu Draw Call cơ bản, batching.

Xem sâu: [Technical → Performance](../05-Technical-Deep-Dives/performance.md).

---

## G. Quy Trình Làm Việc (chuẩn bị đi làm)

### Git nâng cao
- Branch strategy (feature branch).
- Merge, rebase cơ bản, giải quyết conflict.
- Pull Request / Merge Request, code review.
- Commit message quy ước (Conventional Commits).
- ⚠️ Unity + Git: dùng `.gitignore` đúng, cẩn thận file `.meta`, cân nhắc Git LFS cho asset lớn.

### Làm việc nhóm
- Agile/Scrum cơ bản (sprint, standup, backlog).
- Task management (Jira/Trello/Notion).
- Giao tiếp: hỏi đúng, báo cáo tiến độ, ước lượng task.

---

## Bản đồ phụ thuộc

```
C# trung cấp ──► Clean Code ──► Design Patterns ──► Architecture cơ bản
     │                                                      │
     └──► ScriptableObject ──► Hệ thống Unity sâu ──────────┤
                                                            ▼
                          Profiler + Tối ưu + Git/Quy trình ──► Sẵn sàng đi làm
```

---

[⬅️ Junior Overview](./README.md) | [Projects ➡️](./projects.md)
