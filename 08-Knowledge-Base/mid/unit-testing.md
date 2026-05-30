# 🧪 Unit Testing trong Unity

[⬅️ Knowledge Base](../README.md) | Liên quan: [Dependency Injection](./dependency-injection.md) · [Architecture](../../05-Technical-Deep-Dives/architecture.md)

---

## 1. Bản chất

**Unit test là code tự động kiểm tra rằng một "đơn vị" logic (hàm/class) cho ra kết quả đúng.** Bạn viết code để test code: cho input, kỳ vọng output, máy tự chạy & báo đúng/sai.

> 🔑 Giá trị thật của test không chỉ là "bắt bug hôm nay", mà là **"lưới an toàn khi thay đổi"**: khi bạn refactor/thêm tính năng, test chạy lại tự động báo nếu bạn làm hỏng thứ cũ. Nó cho bạn **tự tin sửa code** mà không sợ phá ngầm.

---

## 2. Vấn đề nó giải quyết

Không có test, mỗi thay đổi là canh bạc: "sửa cái này có làm hỏng cái kia không?" → phải test tay thủ công, dễ sót. Trong dự án lớn/sống lâu, điều này không bền vững.

Test tự động: chạy hàng trăm kiểm tra trong vài giây, bắt regression ngay. Đặc biệt giá trị cho **logic phức tạp** (tính damage, crafting, save/load, state machine, kinh tế game).

---

## 3. Hai loại test trong Unity (Unity Test Framework)

### Edit Mode Test — nhanh, cho logic thuần
Chạy **không cần vào Play Mode**, không cần scene. Test **logic C# thuần** (không phụ thuộc MonoBehaviour/engine).
```csharp
using NUnit.Framework;

public class DamageTests {
    [Test]
    public void CritDamage_DoublesBaseDamage() {
        var calc = new DamageCalculator();
        int result = calc.Calculate(baseDmg: 10, isCrit: true);
        Assert.AreEqual(20, result);   // kỳ vọng = 20
    }
}
```

### Play Mode Test — chậm hơn, cho hành vi runtime
Chạy **trong Play Mode**, test hành vi cần engine (vật lý, coroutine, GameObject tương tác).
```csharp
[UnityTest]
public IEnumerator Enemy_DiesAfterTakingLethalDamage() {
    var enemy = Object.Instantiate(enemyPrefab).GetComponent<Enemy>();
    enemy.TakeDamage(999);
    yield return null;                 // đợi 1 frame
    Assert.IsTrue(enemy == null);      // đã bị Destroy
}
```

---

## 4. ⚠️ Vì sao kiến trúc tốt là điều kiện để test (mấu chốt)

**Code khó test = code thiết kế kém.** Bạn chỉ test được khi logic **tách khỏi** engine & dependency cứng:
- Logic dính chặt `MonoBehaviour`, `Singleton.Instance`, `GameObject.Find` → **không test được** (cần cả engine + không mock được).
- Logic tách ra **class C# thuần**, dependency tiêm qua [interface](../junior/interface-and-abstract.md) ([DI](./dependency-injection.md)) → **test dễ** (Edit Mode, mock dependency).

> 🔑 Đây là vòng tròn đẹp: **muốn test được → phải tách logic khỏi engine → kiến trúc tốt hơn.** Viết test "ép" bạn thiết kế sạch. Nhiều dev kinh nghiệm nói: lợi ích lớn nhất của test là **buộc bạn viết code có kiến trúc**.

### Mock qua interface (test logic độc lập)
```csharp
// Logic phụ thuộc interface → test thay bằng "giả"
class ShopService { public ShopService(IWallet wallet){...} }

[Test]
public void Buy_FailsWhenNotEnoughGold() {
    var fakeWallet = new FakeWallet(gold: 5);     // mock, không cần ví thật
    var shop = new ShopService(fakeWallet);
    Assert.IsFalse(shop.TryBuy(price: 10));
}
```

---

## 5. Ứng dụng thực tế (test cái gì?)

- ✅ **Đáng test:** logic tính toán (damage, kinh tế, crafting), state machine, save/load, thuật toán, quy tắc game phức tạp, code dễ sai & quan trọng.
- ❌ **Không đáng test:** code dính chặt engine khó tách, UI thuần hiển thị, prototype vứt đi, getter/setter tầm thường.
- **Regression:** mỗi bug sửa xong → viết test để nó không tái diễn.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Lưới an toàn khi refactor/thêm tính năng | Tốn thời gian viết & bảo trì test |
| Bắt regression tự động | Không hợp mọi loại code (UI, prototype) |
| **Ép kiến trúc tốt** (tách logic) | Test code dính engine khó/chậm |
| Tài liệu sống (test mô tả hành vi) | Quá nhiều test cho code hay đổi → gánh nặng |

---

## 7. Lỗi thường gặp

- ❌ Cố test code dính chặt MonoBehaviour/Singleton → khó, chậm. Tách logic ra trước.
- ❌ Test mọi thứ kể cả getter tầm thường → lãng phí.
- ❌ Test phụ thuộc lẫn nhau / phụ thuộc thứ tự → giòn (flaky).
- ❌ Test phụ thuộc trạng thái ngoài (file, mạng, thời gian thật) → không ổn định. Mock chúng.
- ❌ Viết test sau khi code đã rối không tách được → quá muộn. Thiết kế test-friendly từ đầu.
- ❌ Bỏ test vì "game nhỏ" rồi nó lớn lên thành không thể test.

---

## 8. Best practices

- ✅ Test **logic quan trọng & phức tạp**, bỏ qua thứ tầm thường/UI thuần.
- ✅ Tách logic khỏi engine ([DI](./dependency-injection.md) + [interface](../junior/interface-and-abstract.md)) để Edit Mode test nhanh.
- ✅ Mỗi test **độc lập**, không phụ thuộc thứ tự/trạng thái ngoài.
- ✅ Đặt tên test mô tả hành vi: `CritDamage_DoublesBaseDamage`.
- ✅ Mock dependency (file/mạng/thời gian) để test ổn định.
- ✅ Viết test cho mỗi bug đã sửa (chống regression).
- ✅ Tích hợp test vào [CI](../../05-Technical-Deep-Dives/build-and-pipeline.md) → chạy tự động mỗi commit.

---

## 9. Liên kết
- [Dependency Injection](./dependency-injection.md) — làm code test được.
- [Interface & Abstract](../junior/interface-and-abstract.md) — mock qua interface.
- [SOLID](./solid-principles.md) — thiết kế test-friendly.
- [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md) — chạy test trong CI.

---

[⬅️ Job System & Burst](./job-system-burst.md) | [Assembly Definitions ➡️](./assembly-definitions.md)
