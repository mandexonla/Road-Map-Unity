# ♻️ Instantiate & Destroy (Tạo & Hủy Object)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Prefab](./prefab.md) · [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md)

---

## 1. Bản chất

- **`Instantiate`** = **nhân bản** một object đã có (thường là [Prefab](./prefab.md)) thành một bản sao mới sống trong scene. Như "in" thêm một bản từ khuôn.
- **`Destroy`** = đánh dấu một object để **xóa khỏi scene** và giải phóng.

Đây là cách game tạo nội dung **động** lúc chạy: đạn bắn ra, kẻ địch sinh thêm, hiệu ứng nổ, vật phẩm rơi...

> 🔑 Điểm tinh tế bị bỏ qua: cả hai thao tác này **không "miễn phí"**. `Instantiate` cấp phát bộ nhớ + chạy `Awake`/`OnEnable`/`Start`; `Destroy` sinh rác cho GC. Làm liên tục (mỗi viên đạn) → **giật**. Đây là lý do tồn tại **Object Pooling** (mục 7).

---

## 2. Vấn đề nó giải quyết

Không thể đặt sẵn mọi object trong scene (vô số đạn, kẻ địch sinh theo thời gian). Cần **tạo lúc cần, hủy khi xong**. `Instantiate`/`Destroy` cho phép scene **thay đổi nội dung động** theo diễn biến game.

---

## 3. Cách hoạt động bên trong

### `Instantiate`
1. Cấp phát object mới, **sao chép** toàn bộ GameObject + component + giá trị từ bản gốc.
2. Đưa vào scene, kích hoạt **lifecycle**: `Awake` → `OnEnable` → (frame sau) `Start`.
3. Trả về tham chiếu tới bản sao.

### `Destroy` — **KHÔNG xóa ngay lập tức**
Đây là hiểu lầm cực phổ biến. `Destroy(obj)` **không** xóa object ngay tại dòng đó. Nó **đánh dấu** object để hủy **vào cuối frame hiện tại** (sau khi mọi `Update` chạy xong). Trong phần còn lại của frame, object **vẫn tồn tại**.

```csharp
Destroy(enemy);
enemy.DoSomething(); // VẪN CHẠY ĐƯỢC — object chưa bị xóa tới cuối frame
```

Lý do thiết kế: tránh việc một object bị xóa giữa chừng làm hỏng các đoạn code khác đang xử lý nó trong cùng frame.

---

## 4. Cú pháp & ví dụ

```csharp
[SerializeField] private GameObject bulletPrefab; // kéo prefab vào Inspector

void Shoot()
{
    // Tạo tại vị trí & hướng của súng
    GameObject bullet = Instantiate(bulletPrefab, firePoint.position, firePoint.rotation);

    // Lấy component của bản sao để cấu hình
    bullet.GetComponent<Rigidbody>().velocity = firePoint.forward * bulletSpeed;
}

// Hủy ngay (đánh dấu hủy cuối frame)
Destroy(enemy);

// Hủy sau 3 giây (vd đạn tự biến mất)
Destroy(bullet, 3f);

// Hủy một COMPONENT thay vì cả object
Destroy(GetComponent<Rigidbody>());

// Tạo làm con của một transform (vd hiệu ứng gắn vào nhân vật)
Instantiate(effectPrefab, transform); // tham số cuối = parent
```

---

## 5. Ứng dụng thực tế

- **Spawn đạn / kẻ địch / vật phẩm** theo thời gian hoặc sự kiện.
- **Hiệu ứng tạm thời** (nổ, máu, particle) → `Instantiate` rồi `Destroy(obj, time)`.
- **Sinh level theo procedural** (tạo gạch, phòng).
- **Tách object khỏi cha** rồi hủy có điều kiện.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Tạo nội dung động linh hoạt | Tốn chi phí CPU (cấp phát + lifecycle) |
| Đơn giản, trực quan | `Destroy` sinh rác → **GC spike → giật** |
| Hợp object không sinh thường xuyên | Lạm dụng (đạn/particle liên tục) gây lag rõ rệt |

---

## 7. Lỗi thường gặp & Object Pooling

### ❌ `Instantiate`/`Destroy` liên tục cho đạn, hiệu ứng
Đây là **nguyên nhân lag số 1** của game bắn súng/bullet-hell người mới. Mỗi viên đạn tạo+hủy → cấp phát + GC liên tục → giật.

✅ **Giải pháp: Object Pooling.** Thay vì tạo/hủy, **tái sử dụng**: giữ sẵn một "hồ" object tắt sẵn, khi cần thì **bật lên** (thay Instantiate), khi xong thì **tắt đi trả về hồ** (thay Destroy).
```csharp
// Ý tưởng (Unity có sẵn UnityEngine.Pool.ObjectPool<T> từ 2021+)
var bullet = pool.Get();        // lấy từ hồ, bật lên — KHÔNG cấp phát mới
// ...dùng xong...
pool.Release(bullet);            // tắt, trả về hồ — KHÔNG sinh rác
```
Chi tiết & pattern: [Performance](../../05-Technical-Deep-Dives/performance.md), [Architecture](../../05-Technical-Deep-Dives/architecture.md).

### ❌ Dùng object sau khi `Destroy` ở frame sau → NullReference
Object bị hủy cuối frame. Frame sau, tham chiếu tới nó thành "fake null" của Unity → gọi vào gây lỗi. Kiểm tra `if (obj != null)` hoặc đừng giữ tham chiếu cũ.

### ❌ Quên hủy đạn/hiệu ứng → object tích tụ
Đạn bay ra khỏi màn không bị hủy → hàng nghìn object sống ngầm → memory phình + lag. Luôn có cơ chế dọn (`Destroy(obj, time)`, hoặc trả pool khi ra khỏi màn).

### ❌ `Instantiate` trong vòng lặp lớn cùng một frame
Tạo 1000 object trong 1 frame → khựng. Rải ra nhiều frame (coroutine) hoặc dùng pool + kỹ thuật batch.

### ❌ Quên set parent → object spawn lộn xộn trong Hierarchy
Cân nhắc truyền parent để Hierarchy gọn (nhưng nhớ ảnh hưởng local/world position, xem [Transform](./transform.md)).

---

## 8. Best practices

- ✅ **Object sinh thường xuyên (đạn, enemy, particle) → dùng Object Pool**, không Instantiate/Destroy.
- ✅ Object sinh hiếm (vài cái cả game) → Instantiate/Destroy bình thường là ổn.
- ✅ Luôn có cơ chế **dọn dẹp** (đừng để object tích tụ).
- ✅ `Instantiate` từ **Prefab** (xem [Prefab](./prefab.md)), không từ object trong scene.
- ✅ Hiểu `Destroy` hoãn tới cuối frame — đừng giả định object biến mất tức thì.
- ✅ Hủy hiệu ứng tạm bằng `Destroy(obj, lifetime)`.

---

## 9. Liên kết
- [Prefab](./prefab.md) — thứ bạn thường Instantiate.
- [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) — Instantiate kích hoạt `Awake`/`Start`; thời điểm Destroy.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — Object Pooling, GC, vì sao Instantiate/Destroy tốn kém.

---

[⬅️ Physics: Rigidbody & Collider](./physics-rigidbody-collider.md) | [Prefab ➡️](./prefab.md)
