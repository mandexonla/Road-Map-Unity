# 🎱 Object Pooling

[⬅️ Design Patterns](./design-patterns.md) | Liên quan: [Instantiate & Destroy](../intern/instantiate-destroy.md) · [Garbage Collection](./garbage-collection-basics.md)

---

## 1. Bản chất

**Object Pooling: thay vì tạo (Instantiate) và hủy (Destroy) object liên tục, ta giữ sẵn một "hồ" (pool) các object, tái sử dụng chúng — bật lên khi cần, tắt đi trả về hồ khi xong.**

> 🔑 Ẩn dụ: nhà hàng không **đập bỏ** đĩa sau mỗi khách rồi **làm đĩa mới** cho khách sau (tốn kém, rác). Họ **rửa và dùng lại**. Object pool = "rửa và dùng lại" object thay vì tạo/hủy.

---

## 2. Vấn đề nó giải quyết

`Instantiate`/`Destroy` **tốn kém**: cấp phát bộ nhớ, chạy lifecycle, và đặc biệt `Destroy` **sinh rác → GC spike → giật** (xem [Instantiate & Destroy](../intern/instantiate-destroy.md), [GC](./garbage-collection-basics.md)).

Với thứ sinh **liên tục** (đạn bullet-hell, hạt particle, enemy wave, damage number) → tạo/hủy hàng trăm lần/giây → game giật rõ rệt. Đây là **nguyên nhân lag số 1** của game bắn súng người mới.

Pool loại bỏ chi phí này: object được tạo **một lần**, sau đó chỉ **bật/tắt** (rẻ).

---

## 3. Cách hoạt động

```
        POOL (hồ chứa)
   ┌─────────────────────────┐
   │ [tắt][tắt][tắt][tắt]... │   ← object tạo sẵn, đang ngủ
   └─────────────────────────┘
         │ Get()              ▲ Release()
         ▼ (bật lên dùng)     │ (tắt, trả về)
   ┌─────────────────────────┐
   │  Object đang hoạt động   │
   └─────────────────────────┘
```
- **Get():** lấy một object đang ngủ từ hồ, bật lên (`SetActive(true)`), reset trạng thái. (Nếu hồ rỗng → tạo mới hoặc mở rộng.)
- **Release():** tắt object (`SetActive(false)`), trả về hồ — **không Destroy**.

### Dùng pool có sẵn của Unity (2021+)
```csharp
using UnityEngine.Pool;

ObjectPool<Bullet> pool;
void Awake() {
    pool = new ObjectPool<Bullet>(
        createFunc: () => Instantiate(bulletPrefab),   // tạo khi hồ thiếu
        actionOnGet: b => b.gameObject.SetActive(true),// khi lấy ra
        actionOnRelease: b => b.gameObject.SetActive(false), // khi trả về
        actionOnDestroy: b => Destroy(b.gameObject),   // khi pool bị thu nhỏ
        defaultCapacity: 50
    );
}
void Shoot() { var b = pool.Get(); b.Init(pool); }     // bullet tự Release mình khi xong
```

---

## 4. Ứng dụng thực tế

- **Đạn / projectile** (đặc biệt bullet-hell).
- **Particle / VFX** lặp lại (nổ, máu, lửa).
- **Enemy** sinh theo wave (survivor-like, tower defense).
- **Damage number / floating text.**
- **UI element** tạo động (ô inventory, dòng leaderboard, item list dài).
- **Audio source** cho nhiều âm thanh đồng thời.

> 📌 Quy tắc: thứ gì **sinh/hủy thường xuyên** → pool. Thứ sinh **hiếm** (vài lần cả game) → Instantiate/Destroy bình thường, đừng pool thừa.

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Loại bỏ GC spike → frame mượt | Phức tạp hơn Instantiate/Destroy |
| Tránh chi phí cấp phát lặp lại | Object phải **reset trạng thái** đúng khi tái dùng |
| Hiệu năng tốt cho số lượng lớn | Tốn bộ nhớ giữ object ngủ |
| — | Quên trả về pool → "leak" object trong hồ |

---

## 6. Lỗi thường gặp

### ❌ Không reset trạng thái khi tái dùng
Object cũ còn velocity, máu, hiệu ứng từ lần trước → bug "đạn nhớ vận tốc cũ", "enemy hồi sinh với máu âm". **Luôn reset** đầy đủ trong `Get`/`OnGet`.

### ❌ Quên trả object về pool
Bật lên dùng nhưng không bao giờ `Release` → hồ cạn, phải tạo mới mãi → mất tác dụng pool. Đảm bảo mọi đường ra đều trả pool (hết thời gian, ra khỏi màn, va chạm).

### ❌ Vẫn gọi `Destroy` trên object của pool
Phá vỡ pool (object biến mất khỏi hồ). Dùng `Release`, không `Destroy`.

### ❌ Pool quá nhỏ → liên tục tạo mới
Đặt capacity hợp lý theo số lượng đồng thời tối đa thực tế.

### ❌ Pool hóa thứ sinh hiếm
Over-engineering. Chỉ pool thứ sinh thường xuyên.

---

## 7. Best practices

- ✅ Pool mọi thứ sinh/hủy thường xuyên (đạn, particle, enemy, UI list).
- ✅ **Reset đầy đủ** trạng thái object mỗi lần `Get` (velocity, health, visual, timer).
- ✅ Đảm bảo **mọi đường ra** đều `Release` (có thể cho object tự release khi xong).
- ✅ Dùng `UnityEngine.Pool.ObjectPool<T>` có sẵn thay vì tự viết (2021+).
- ✅ Đặt capacity theo số đồng thời tối đa thực tế.
- ✅ Không `Destroy` object thuộc pool.
- ✅ Cân nhắc warm-up (tạo sẵn) lúc load để tránh hitch lần đầu.

---

## 8. Liên kết
- [Instantiate & Destroy](../intern/instantiate-destroy.md) — vấn đề gốc pool giải quyết.
- [Garbage Collection](./garbage-collection-basics.md) — vì sao Destroy gây giật.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — pool trong bức tranh tối ưu.
- [Generics](./generics.md) — `ObjectPool<T>` là generic.

---

[⬅️ State Machine](./state-machine.md) | [Factory & Strategy ➡️](./factory-and-strategy.md)
