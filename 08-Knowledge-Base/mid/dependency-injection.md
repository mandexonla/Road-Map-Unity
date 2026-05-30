# 💉 Dependency Injection (DI)

[⬅️ Knowledge Base](../README.md) | Liên quan: [SOLID](./solid-principles.md) · [Singleton](../junior/singleton.md) · [Unit Testing](./unit-testing.md)

---

## 1. Bản chất

**Dependency Injection: thay vì một class TỰ TẠO/TỰ TÌM những thứ nó cần (dependency), ta ĐƯA (tiêm) chúng từ bên ngoài vào.**

```csharp
// ❌ Tự tìm dependency (coupling chặt)
class Player {
    AudioManager audio = AudioManager.Instance;   // tự đi tìm
    Weapon weapon = GetComponent<Weapon>();         // tự lấy
}

// ✅ Được tiêm dependency từ ngoài
class Player {
    IAudioService audio;
    public void Init(IAudioService audio) { this.audio = audio; } // ai đó đưa vào
}
```

> 🔑 Đảo ngược trách nhiệm: class **không tự lo** việc lấy dependency, mà **khai báo "tôi cần X"** rồi để bên ngoài cung cấp. Giống bạn không tự xây nhà máy điện — bạn cắm phích, điện được "tiêm" vào.

---

## 2. Vấn đề nó giải quyết

`Singleton.Instance`, `GameObject.Find`, `new ConcreteClass()` rải khắp code tạo **phụ thuộc cứng**:
- **Khó test:** không thay được dependency thật bằng giả (mock).
- **Khó đổi:** đổi implementation phải sửa mọi nơi tạo nó.
- **Phụ thuộc ẩn:** nhìn class không biết nó cần gì (ẩn trong thân hàm).
- **Coupling chặt:** class dính chặt class cụ thể.

DI giải tất cả: dependency **rõ ràng** (khai báo ở constructor/init), **thay được** (mock để test, đổi implementation), **lỏng** (phụ thuộc interface).

---

## 3. Các kiểu tiêm (injection)

```csharp
// 1. Constructor injection (rõ nhất — cho class C# thuần)
class DamageCalculator {
    readonly ILogger logger;
    public DamageCalculator(ILogger logger) { this.logger = logger; }
}

// 2. Method injection
public void Init(IAudioService audio) { this.audio = audio; }

// 3. Property/Inspector injection (phổ biến trong Unity — kéo vào Inspector)
[SerializeField] private WeaponData weaponData;
```
> Trong Unity, MonoBehaviour **không có constructor bạn kiểm soát** (Unity tự tạo) → thường dùng method/property injection, hoặc dùng **DI container** lo việc tiêm.

---

## 4. DI thủ công vs DI Container

### DI thủ công (đủ cho game nhỏ-vừa)
Bạn tự truyền dependency tay (ở một nơi "lắp ráp" như một bootstrap/installer):
```csharp
// Composition Root — nơi lắp ráp mọi thứ một lần
var logger = new FileLogger();
var audio = new AudioService();
player.Init(audio, logger);   // tiêm thủ công
```
✅ Đơn giản, không thư viện, dễ hiểu. Đủ cho phần lớn game indie/nhỏ.

### DI Container (cho dự án lớn)
Thư viện tự động tạo & tiêm dependency dựa trên cấu hình ("đăng ký" một lần, container lo phần còn lại):
- **VContainer** — nhẹ, nhanh, hiện đại (được ưa chuộng cho Unity).
- **Zenject / Extenject** — mạnh, lâu đời, nhiều tính năng (nặng hơn).

```csharp
// Ý tưởng (VContainer): đăng ký, container tự tiêm vào nơi cần
builder.Register<IAudioService, AudioService>(Lifetime.Singleton);
builder.RegisterEntryPoint<GameController>();
```
✅ Quản lý dependency phức tạp tự động. ❌ Thêm độ phức tạp, dốc học, "magic" khó debug nếu lạm dụng.

> 💡 Quy tắc: **DI thủ công cho tới khi nó đau** rồi mới cân nhắc container. Đừng thêm container cho game jam.

---

## 5. Ứng dụng thực tế

- **Test:** tiêm mock thay service thật → unit test logic (xem [Unit Testing](./unit-testing.md)).
- **Đổi implementation:** dev dùng `FakePaymentService`, production dùng thật — không sửa logic.
- **Thay Singleton:** tiêm `IGameManager` thay vì gọi `GameManager.Instance` khắp nơi.
- **Quản lý vòng đời service:** container lo singleton/scoped/transient.
- **Tách module:** hệ thống phụ thuộc interface, lắp ráp ở một chỗ.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Dependency rõ ràng (không ẩn) | Thêm tầng "lắp ráp" |
| Dễ test (mock được) | Container có learning curve & "magic" |
| Đổi implementation dễ | Over-engineer cho game nhỏ |
| Loose coupling, đúng SOLID-D | MonoBehaviour không có constructor → hơi vướng |

---

## 7. Lỗi thường gặp

### ❌ Dùng DI container cho game jam/nhỏ
Over-engineering. DI thủ công đủ. Container đáng giá khi dependency nhiều & phức tạp.
### ❌ "Service locator trá hình"
Tiêm một container/locator rồi gọi `Resolve<X>()` khắp nơi → quay lại phụ thuộc ẩn như Singleton. Tiêm cái **cụ thể cần**, không tiêm "cái lấy được mọi thứ".
### ❌ Quên Unity không cho constructor MonoBehaviour
Dùng method/property injection hoặc container hỗ trợ Unity.
### ❌ Tiêm quá nhiều dependency vào một class
Class cần 8 dependency → dấu hiệu vi phạm SRP. Tách nhỏ.
### ❌ Lạm dụng interface cho mọi thứ chỉ để DI
Class chỉ có một implementation mãi → interface thừa (YAGNI).

---

## 8. Best practices

- ✅ Bắt đầu **DI thủ công**; lên container khi thật cần.
- ✅ Tiêm **interface** cho thứ cần đổi/test; cụ thể cho thứ ổn định.
- ✅ Có một **Composition Root** (nơi lắp ráp) rõ ràng.
- ✅ Constructor injection cho C# thuần; method/Inspector cho MonoBehaviour.
- ✅ Đừng tiêm container rồi `Resolve` khắp nơi (anti-pattern).
- ✅ Số dependency nhiều → xem lại SRP.
- ✅ Dùng DI để làm code **test được** (mục tiêu thực tế lớn nhất).

---

## 9. Liên kết
- [SOLID](./solid-principles.md) — DI hiện thực chữ D (Dependency Inversion).
- [Singleton](../junior/singleton.md) — vấn đề DI thay thế.
- [Unit Testing](./unit-testing.md) — DI làm test khả thi.
- [Interface & Abstract](../junior/interface-and-abstract.md) — nền của DI.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md).

---

[⬅️ SOLID](./solid-principles.md) | [UI Architecture (MVC/MVVM) ➡️](./ui-architecture-mvc-mvvm.md)
