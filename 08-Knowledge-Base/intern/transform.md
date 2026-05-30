# 📐 Transform & Hệ Tọa Độ

[⬅️ Knowledge Base](../README.md) | Liên quan: [GameObject & Component](./gameobject-component.md)

---

## 1. Bản chất

**Transform là component bắt buộc, không bao giờ gỡ được, có trên MỌI GameObject.** Nó trả lời 3 câu hỏi về object trong không gian:
- **Position** — ở đâu?
- **Rotation** — xoay thế nào?
- **Scale** — to nhỏ ra sao?

Nhưng Transform còn một vai trò quan trọng hơn nhiều: **nó định nghĩa quan hệ cha-con (hierarchy)** giữa các object. Cây Hierarchy bạn thấy trong Editor **chính là cây Transform**.

> 🔑 Transform không chỉ là "tọa độ". Nó là **xương sống không gian** của scene: vừa định vị object, vừa nối chúng thành cây cha-con.

---

## 2. Vấn đề nó giải quyết: Parent-Child & không gian tương đối

Tưởng tượng một nhân vật cầm đuốc. Khi nhân vật đi, đuốc phải đi theo. Nếu mỗi object có tọa độ tuyệt đối riêng, bạn phải tự cập nhật vị trí đuốc mỗi frame — mệt và dễ sai.

**Giải pháp:** đặt đuốc làm **con (child)** của tay nhân vật. Khi cha di chuyển/xoay, **con tự động đi theo**. Đuốc chỉ cần giữ vị trí **tương đối** so với tay.

```
Player (cha)
  └── Hand
        └── Torch (con)   ← chỉ cần biết "cách tay 0.5m", cha đi đâu con theo đó
```

Đây là sức mạnh của hierarchy: **chuyển động phức tạp = lồng các chuyển động đơn giản**.

---

## 3. Cách hoạt động bên trong: Local Space vs World Space

Đây là phần **gây nhầm lẫn nhất** — hiểu kỹ sẽ tránh vô số bug.

### Hai hệ tọa độ
- **World Space (không gian thế giới):** tọa độ tuyệt đối trong cả scene. Gốc (0,0,0) là tâm thế giới.
- **Local Space (không gian cục bộ):** tọa độ **tương đối so với cha**. Nếu không có cha, local = world.

```csharp
transform.position      // vị trí trong WORLD space (tuyệt đối)
transform.localPosition // vị trí so với CHA (tương đối)

transform.rotation      // xoay trong world (kiểu Quaternion)
transform.localRotation // xoay so với cha

transform.localScale    // tỉ lệ so với cha (không có "scale world" trực tiếp)
transform.lossyScale    // scale world gần đúng (chỉ đọc)
```

**Ví dụ trực giác:** Bạn ngồi trên tàu hỏa.
- **Local position** của bạn = ghế số 12 (so với tàu). Tàu chạy, bạn vẫn ở ghế 12 → localPosition không đổi.
- **World position** của bạn = đang ở Hà Nội, rồi Vinh, rồi Huế... → world position thay đổi liên tục dù bạn ngồi yên.

> 🔑 Engine lưu transform của con ở **local space**, rồi **nhân dồn** qua chuỗi cha (ma trận) để ra **world space** khi cần. Đó là lý do đổi `localScale` của cha làm con "méo" theo.

### Quaternion — tại sao xoay không dùng góc thường?
`transform.rotation` là **Quaternion** (4 số), không phải 3 góc Euler dễ đọc. Lý do: góc Euler bị lỗi **Gimbal Lock** (mất một trục xoay ở góc nhất định) và khó nội suy mượt. Quaternion tránh được. Bạn thường dùng:
```csharp
transform.rotation = Quaternion.Euler(0, 90, 0);   // tạo từ góc dễ đọc
transform.Rotate(0, 90 * Time.deltaTime, 0);        // xoay dần
```

---

## 4. Cú pháp & ví dụ

```csharp
// Di chuyển (world)
transform.position += Vector3.right * speed * Time.deltaTime;
transform.Translate(Vector3.forward * speed * Time.deltaTime); // theo hướng local

// Xoay
transform.Rotate(Vector3.up, 90 * Time.deltaTime);
transform.LookAt(target);                    // quay mặt về target

// Quan hệ cha-con
transform.SetParent(parentTransform);        // đặt làm con
transform.parent = null;                      // bỏ cha (ra world)
int childCount = transform.childCount;
Transform child = transform.GetChild(0);

// Hướng (vector đơn vị theo trục của object)
transform.forward; transform.right; transform.up;
```

---

## 5. Ứng dụng thực tế

- **Di chuyển object đơn giản** (không vật lý): `transform.position`/`Translate`.
- **Gắn vũ khí/phụ kiện vào nhân vật:** đặt làm child.
- **Tổ chức scene:** GameObject rỗng làm "thư mục" (parent) gom object con.
- **Spawn point, waypoint:** dùng Transform làm điểm mốc (chỉ cần vị trí).
- **Camera bám/ngắm:** `LookAt`, di chuyển theo target trong `LateUpdate`.
- **Đo khoảng cách / hướng:** `Vector3.Distance(a.position, b.position)`.

---

## 6. Ưu điểm / Nhược điểm của di chuyển bằng Transform

| | Di chuyển bằng `transform` | Di chuyển bằng `Rigidbody` |
|--|----------------------------|-----------------------------|
| Đơn giản | ✅ Rất dễ | Phức tạp hơn |
| Vật lý/va chạm đúng | ❌ Có thể "xuyên tường" | ✅ Đúng vật lý |
| Khi nào dùng | UI, object không cần vật lý, hiệu ứng | Nhân vật/vật thể cần va chạm thật |

> ⚠️ Di chuyển object **có Rigidbody** bằng `transform.position` trực tiếp sẽ **phá vỡ mô phỏng vật lý** (xuyên tường, va chạm sai). Object có Rigidbody → di chuyển qua Rigidbody. Xem [Physics](./physics-rigidbody-collider.md).

---

## 7. Lỗi thường gặp

### ❌ Nhầm local và world position
Đặt object làm con rồi ngạc nhiên vì `position` không như mong đợi. Nhớ: con dùng `localPosition` so với cha; `position` luôn là world.

### ❌ Cộng dồn Euler angles và mong nó "nhớ"
```csharp
transform.eulerAngles += new Vector3(0, 1, 0); // dễ sinh hành vi lạ
```
`eulerAngles` được suy ra từ Quaternion mỗi lần đọc → cộng dồn không ổn định. Dùng `transform.Rotate(...)` để xoay tương đối.

### ❌ Di chuyển Rigidbody bằng transform
Như mục 6 — xuyên tường, va chạm hỏng.

### ❌ `SetParent` làm scale méo
Khi đặt con vào cha có scale khác (1,1,1), con bị "méo". Dùng `SetParent(parent, worldPositionStays: true)` để giữ biến đổi world, hoặc giữ scale cha = 1.

---

## 8. Best practices

- ✅ Object cần vật lý → di chuyển qua Rigidbody, không qua transform.
- ✅ Luôn `Time.deltaTime` khi di chuyển/xoay trong `Update`.
- ✅ Dùng hierarchy để gom object & tạo chuyển động lồng nhau.
- ✅ Giữ scale của object cha = (1,1,1) khi có thể, tránh méo con.
- ✅ Xoay tương đối → `Rotate`; đặt xoay tuyệt đối → `Quaternion.Euler`.
- ✅ Cẩn thận hierarchy quá sâu (ảnh hưởng hiệu năng tính ma trận).

---

## 9. Liên kết
- [GameObject & Component](./gameobject-component.md) — Transform là component bắt buộc.
- [Physics: Rigidbody & Collider](./physics-rigidbody-collider.md) — khi nào KHÔNG dùng transform để di chuyển.
- [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) — camera follow đặt ở `LateUpdate`.

---

[⬅️ MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) | [Serialization & Inspector ➡️](./serialization-and-inspector.md)
