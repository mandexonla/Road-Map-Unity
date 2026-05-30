# 🧱 Prefab (Khuôn Object Tái Sử Dụng)

[⬅️ Knowledge Base](../README.md) | Liên quan: [GameObject & Component](./gameobject-component.md) · [Instantiate & Destroy](./instantiate-destroy.md)

---

## 1. Bản chất

**Prefab là một GameObject (kèm toàn bộ component, giá trị, và con của nó) được lưu thành một Asset để tái sử dụng.** Nó là **"khuôn" (template/blueprint)**: cấu hình một lần, dùng ra vô số bản.

> 🔑 Ẩn dụ: Prefab giống **bản thiết kế ngôi nhà**. Bạn vẽ một lần, xây được nhiều ngôi nhà giống nhau. Sửa bản thiết kế → mọi ngôi nhà (instance) cập nhật theo. Đó là sức mạnh cốt lõi của prefab.

Một prefab gói trọn: GameObject + mọi Component + giá trị đã serialize + cây con (children) + tham chiếu. Tạo trong scene từ nó được gọi là **instance (thể hiện)**.

---

## 2. Vấn đề nó giải quyết

Không có prefab, mỗi kẻ địch bạn phải dựng lại từ đầu (thêm collider, rigidbody, script, set giá trị...). Và nếu muốn sửa tốc độ **mọi** kẻ địch, bạn phải sửa **từng cái** trong scene. Ác mộng.

Prefab giải quyết:
1. **Tái sử dụng:** dựng một lần, đặt/spawn nhiều lần.
2. **Sửa tập trung:** đổi prefab → mọi instance tự cập nhật.
3. **Spawn lúc runtime:** [Instantiate](./instantiate-destroy.md) cần một prefab làm nguồn.

---

## 3. Cách hoạt động bên trong

### Liên kết Prefab ↔ Instance
Mỗi instance trong scene **không sao chép toàn bộ** prefab — nó giữ một **liên kết** tới prefab gốc và chỉ lưu phần **khác biệt (override)** của riêng nó. Khi prefab đổi, instance đọc giá trị mới từ prefab (trừ những field đã bị override riêng).

### Override (ghi đè)
Bạn có thể sửa một instance cụ thể (vd con boss này máu nhiều hơn) → tạo **override** trên field đó. Field bị override **không** còn theo prefab nữa (hiện chữ đậm + thanh xanh trong Inspector). Bạn có thể:
- **Apply:** đẩy thay đổi của instance **lên** prefab (mọi instance khác theo).
- **Revert:** bỏ override, quay về giá trị prefab.

### GUID & tham chiếu
Prefab là asset có **GUID** (lưu trong file `.meta`). Mất `.meta` → đứt liên kết. Đây là lý do phải commit `.meta` (xem [Version Control](../../05-Technical-Deep-Dives/version-control.md)).

---

## 4. Prefab Variant (biến thể)

**Variant = prefab "con kế thừa" từ một prefab "cha".** Nó giữ mọi thứ của cha nhưng override một số phần.

Ví dụ: prefab `Enemy` (cha) → variant `FastEnemy` (đổi tốc độ), `TankEnemy` (đổi máu + scale). Sửa cha (vd thêm component mới) → mọi variant nhận theo, mà vẫn giữ điểm riêng của chúng.

> 💡 Variant với prefab giống **kế thừa với class** — tái dùng + chuyên biệt hóa. Cực mạnh để quản lý nhiều biến thể của cùng một loại object.

---

## 5. Cú pháp & ví dụ

```csharp
[SerializeField] private GameObject enemyPrefab; // kéo prefab vào ô Inspector

void SpawnEnemy(Vector3 pos)
{
    // Tạo instance từ prefab
    GameObject enemy = Instantiate(enemyPrefab, pos, Quaternion.identity);

    // Cấu hình riêng instance này (tạo override lúc runtime)
    enemy.GetComponent<Enemy>().SetLevel(currentWave);
}
```
> Lưu ý: trong code, bạn **tham chiếu prefab qua `[SerializeField]`** rồi kéo vào Inspector — cách an toàn & nhanh nhất. Tránh `Resources.Load` (lỗi thời) cho prefab.

---

## 6. Ứng dụng thực tế

- **Mọi thứ spawn được:** đạn, kẻ địch, vật phẩm, hiệu ứng, UI element.
- **Object tái dùng nhiều nơi:** nút bấm, ô inventory, card.
- **Khối dựng level:** gạch, chướng ngại, platform (dựng bằng cách đặt nhiều instance).
- **Variant cho nhiều cấp độ/loại:** Enemy → FastEnemy/TankEnemy/BossEnemy.
- **Chia nhỏ scene để làm việc nhóm:** mỗi người làm prefab riêng, tránh sửa cùng scene (xem [Version Control](../../05-Technical-Deep-Dives/version-control.md)).

---

## 7. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm / Lưu ý |
|---------|---------------------|
| Tái sử dụng, sửa tập trung | Override lộn xộn nếu không kỷ luật |
| Cần thiết cho Instantiate runtime | Nested prefab phức tạp có thể rối |
| Variant = kế thừa linh hoạt | Mất `.meta` → đứt liên kết |
| Hỗ trợ làm việc nhóm (tránh đụng scene) | Reference giữa prefab cần cẩn thận |

---

## 8. Lỗi thường gặp

### ❌ Sửa instance trong scene, tưởng đã sửa prefab
Sửa một instance chỉ tạo **override** cho riêng nó. Muốn áp cho mọi instance → mở **Prefab Mode** (double-click prefab) sửa, hoặc **Apply** override lên prefab.

### ❌ Vô tình override hàng loạt
Sửa instance rồi quên, sau này khó hiểu vì sao instance không theo prefab. Để ý field **chữ đậm/thanh xanh** = đang override.

### ❌ Mất liên kết prefab (instance thành object thường)
Thường do mất file `.meta` hoặc thao tác sai. Commit `.meta`, cẩn thận khi di chuyển file.

### ❌ Tham chiếu object trong SCENE từ một prefab asset
Prefab asset **không thể** giữ tham chiếu trực tiếp tới object trong scene (vì prefab tồn tại độc lập scene). Giải pháp: gán tham chiếu lúc runtime, hoặc dùng event/manager.

### ❌ Dùng `Resources.Load` để nạp prefab
Lỗi thời, nạp hết vào build, khó unload. Ưu tiên `[SerializeField]` + Inspector, hoặc Addressables cho dự án lớn.

---

## 9. Best practices

- ✅ **Biến mọi object tái dùng/spawn thành prefab** ngay từ đầu.
- ✅ Sửa logic chung trong **Prefab Mode**, chỉ override khi thật cần riêng.
- ✅ Dùng **Variant** cho các biến thể của cùng một loại.
- ✅ Tham chiếu prefab qua `[SerializeField]`, kéo vào Inspector.
- ✅ Commit file `.meta` (giữ liên kết).
- ✅ Dùng prefab để **chia nhỏ scene** → làm việc nhóm dễ, ít conflict.
- ✅ Giữ override tối thiểu & có chủ đích.

---

## 10. Liên kết
- [GameObject & Component](./gameobject-component.md) — prefab gói một GameObject + component đã cấu hình.
- [Instantiate & Destroy](./instantiate-destroy.md) — spawn instance từ prefab lúc runtime.
- [Serialization & Inspector](./serialization-and-inspector.md) — override là giá trị serialize riêng của instance.
- [Version Control](../../05-Technical-Deep-Dives/version-control.md) — `.meta`, merge prefab, chia scene.

---

[⬅️ Instantiate & Destroy](./instantiate-destroy.md) | [Coroutine ➡️](./coroutine.md)
