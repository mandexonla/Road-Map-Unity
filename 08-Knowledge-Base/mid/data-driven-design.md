# 📊 Data-Driven Design

[⬅️ Knowledge Base](../README.md) | Liên quan: [ScriptableObject](../junior/scriptableobject.md) · [Factory & Strategy](../junior/factory-and-strategy.md)

---

## 1. Bản chất

**Data-driven design: hành vi của game được điều khiển bởi DỮ LIỆU (chỉnh được ngoài code), không phải bởi code hardcode.** Thêm/đổi nội dung = sửa data, **không** sửa & build lại code.

> 🔑 Câu hỏi kiểm chứng: *"Thêm một loại vũ khí / enemy / quest mới mất bao lâu?"* — Data-driven tốt: vài phút (tạo một asset data). Hardcode: phải sửa code, build lại, dễ sinh bug. **Đây là một trong những thước đo rõ nhất của kiến trúc tốt.**

---

## 2. Vấn đề nó giải quyết

```csharp
// ❌ Hardcode — thêm enemy phải sửa code & build lại
Enemy CreateEnemy(string type) {
    if (type == "goblin") return new Enemy { hp=30, dmg=5, speed=3 };
    if (type == "orc")    return new Enemy { hp=80, dmg=12, speed=2 };
    // 50 loại = 50 nhánh hardcode, designer không đụng được
}
```
Vấn đề: **designer không tự cân bằng được** (phải nhờ coder + build), số liệu lẫn trong code, khó so sánh/bảo trì, mỗi thay đổi nhỏ tốn cả vòng build.

**Data-driven:** số liệu nằm trong **data asset**; code chỉ là "động cơ" đọc data và thực thi.

---

## 3. Cách hiện thực trong Unity

### ScriptableObject (cách phổ biến & idiomatic nhất)
Mỗi enemy/weapon/item là một SO asset (xem [ScriptableObject](../junior/scriptableobject.md)):
```csharp
[CreateAssetMenu(menuName = "Game/EnemyData")]
public class EnemyData : ScriptableObject {
    public string enemyName;
    public int health, damage;
    public float speed;
    public GameObject prefab;
    public LootTable loot;
}
// Code "động cơ" đọc data, không hardcode số:
enemy.Init(enemyData);   // mọi chỉ số đến từ asset
```
Thêm enemy = tạo `Dragon.asset` trong Project. Không sửa code.

### Bảng ngoài (CSV / Google Sheet / JSON)
Designer chỉnh số trong **Google Sheet/Excel**, import thành SO/data. Hợp khi nhiều dữ liệu dạng bảng (hàng trăm item, level), nhiều người chỉnh. Cần tool import (xem [Tools & Editor](../../05-Technical-Deep-Dives/tools-and-editor.md)).

### Kết hợp polymorphism (behaviour data-driven)
Không chỉ số liệu — cả **hành vi** cũng data-driven: SO chứa "cách hành xử" (ability effect, AI behaviour) qua [Strategy](../junior/factory-and-strategy.md). Designer ghép hành vi trong Inspector.

---

## 4. Ứng dụng thực tế

- **Item/weapon/enemy database:** chỉ số, prefab, hiệu ứng.
- **Level/wave config:** thứ tự, độ khó, nội dung mỗi màn.
- **Ability/skill system:** mỗi skill là data (cost, cooldown, effect).
- **Dialogue/quest:** nội dung & nhánh từ data.
- **Balance tuning:** designer chỉnh số liên tục không cần coder.
- **Localization:** chuỗi văn bản từ data theo ngôn ngữ.
- **Modding:** người ngoài thêm nội dung qua data (xem [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md)).

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Thêm nội dung không sửa code | Cần đầu tư "động cơ" đọc data ban đầu |
| Designer tự cân bằng (không cần coder) | Quá linh hoạt → khó kiểm soát/validate |
| Mở rộng cực nhanh, ít bug code | Data sai → bug khó lần (cần validation tool) |
| Hỗ trợ modding, localization | Over-engineer cho game có ít nội dung cố định |

---

## 6. Lỗi thường gặp

- ❌ Data-driven hóa thứ **chỉ có một biến thể cố định** → thừa (YAGNI).
- ❌ Không **validate data** → asset thiếu field/sai giá trị gây bug runtime khó lần. Viết validation tool.
- ❌ Trộn data tĩnh (config) với trạng thái runtime trong cùng SO → bẫy sửa-Play-Mode (xem [ScriptableObject](../junior/scriptableobject.md)).
- ❌ "Động cơ" code quá cứng → data có nhưng vẫn phải sửa code khi thêm loại → chưa thực sự data-driven.
- ❌ Dữ liệu khổng lồ nhồi vào một asset thay vì chia nhỏ hợp lý.

---

## 7. Best practices

- ✅ Tách rõ **data (asset)** ↔ **logic (code động cơ)** ↔ **trạng thái runtime (biến)**.
- ✅ Dùng [ScriptableObject](../junior/scriptableobject.md) cho data trong-Unity; Sheet/CSV cho bảng lớn nhiều người.
- ✅ Viết **validation tool** kiểm tra data hợp lệ (xem [Tools & Editor](../../05-Technical-Deep-Dives/tools-and-editor.md)).
- ✅ Thiết kế "động cơ" đủ tổng quát để thêm loại = thêm data, không sửa code.
- ✅ Áp dụng khi có **nhiều biến thể & cần cân bằng**; bỏ qua cho nội dung ít cố định.
- ✅ Đo "thời gian thêm nội dung mới" làm thước đo kiến trúc.

---

## 8. Liên kết
- [ScriptableObject](../junior/scriptableobject.md) — công cụ chính.
- [Factory & Strategy](../junior/factory-and-strategy.md) — behaviour data-driven.
- [Tools & Editor](../../05-Technical-Deep-Dives/tools-and-editor.md) — import & validate data.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) · [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md).

---

[⬅️ UI Architecture](./ui-architecture-mvc-mvvm.md) | [Async / Await / UniTask ➡️](./async-await-unitask.md)
