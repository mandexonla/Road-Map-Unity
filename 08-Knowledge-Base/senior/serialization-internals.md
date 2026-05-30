# 🔬 Unity Serialization Internals (Sâu)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Serialization (Intern)](../intern/serialization-and-inspector.md) · [ScriptableObject](../junior/scriptableobject.md)

> Hiểu serialization ở mức sâu giải thích vô số hành vi "kỳ lạ" của Unity và giúp bạn thiết kế data bền vững qua nhiều phiên bản. Đây là kiến thức phân biệt Senior.

---

## 1. Bản chất sâu hơn

Serialization của Unity **không phải** serialization C# thông thường (`System.Serializable` của .NET). Unity dùng **hệ serialization riêng**, tối ưu cho engine, chạy ở tầng C++ native. Điều này lý giải nhiều giới hạn đặc thù (không có Dictionary, vấn đề polymorphism).

> 🔑 Mọi thứ trong Unity dựa trên serialization nhiều hơn bạn tưởng: Inspector, scene, prefab, instantiate, hot-reload code, undo/redo trong Editor, **và cả việc giữ trạng thái khi Unity reload domain**. Hiểu nó = hiểu nền móng engine.

---

## 2. Khi nào Unity serialize (nhiều hơn bạn nghĩ)

- Lưu/nạp **scene & prefab**.
- Hiển thị & chỉnh **Inspector**.
- **Instantiate** (sao chép object = serialize rồi deserialize).
- **Hot reload** khi bạn sửa code lúc đang mở Editor (Unity serialize state, reload assembly, deserialize lại).
- **Undo/Redo** trong Editor.
- Prefab override, variant.

> 💡 Đây là lý do: nếu một field **không serialize được** (vd `Dictionary`, biến không đánh dấu), giá trị của nó **biến mất** sau hot reload hoặc khi vào/ra Play Mode — một bug "ma" kinh điển mà chỉ hiểu serialization mới giải thích được.

---

## 3. Quy tắc serialize (nhắc lại + sâu)

Field được serialize khi: `public` hoặc `[SerializeField]`, không `static`/`const`/`readonly`, **và kiểu được hỗ trợ**. Kiểu hỗ trợ: primitive, enum, kiểu Unity (Vector, Color...), `UnityEngine.Object` reference, `List`/array, class/struct `[System.Serializable]`.

### Các giới hạn gốc rễ (và vì sao)
- **Không Dictionary:** hệ serialize Unity không hỗ trợ. Giải: list của struct key-value, hoặc `ISerializationCallbackReceiver` (xem mục 5).
- **Không null cho custom class:** một field custom class `[Serializable]` null sẽ được serialize thành **instance rỗng** (không phải null) — gây ngạc nhiên.
- **Độ sâu giới hạn:** serialize lồng nhau quá sâu bị cắt (cảnh báo "depth limit").
- **Không polymorphism (mặc định):** xem mục 4.

---

## 4. ⚠️ Polymorphism & `[SerializeReference]`

### Vấn đề
Mặc định, serialize một field kiểu base class/interface chứa object lớp con → Unity **mất kiểu con**, chỉ giữ phần base ("object slicing"). Vd `List<IAbility>` với nhiều loại ability khác nhau → không serialize đúng.

### Giải pháp cũ: ScriptableObject
Mỗi biến thể là một SO asset → serialize bằng **reference** (giữ kiểu). Đây là lý do SO phổ biến cho data đa hình (xem [ScriptableObject](../junior/scriptableobject.md)).

### Giải pháp mới: `[SerializeReference]`
Cho phép serialize **đa hình "by reference"** ngay trong object (không cần asset riêng):
```csharp
[SerializeReference] private List<IAbility> abilities;  // giữ được kiểu con thật
```
- ✅ Đa hình trong một object, không cần nhiều asset.
- ⚠️ Cẩn thận: đổi tên/namespace class có thể làm mất data; quản lý phiên bản phức tạp hơn.

---

## 5. `ISerializationCallbackReceiver` (kiểm soát thủ công)

Cho phép can thiệp **trước khi serialize / sau khi deserialize** — dùng để hỗ trợ kiểu Unity không serialize trực tiếp (như Dictionary):
```csharp
public class SerializableDict : ISerializationCallbackReceiver {
    [SerializeField] List<string> keys;     // serialize được
    [SerializeField] List<int> values;
    Dictionary<string,int> dict = new();     // dùng runtime, KHÔNG serialize

    public void OnBeforeSerialize() {        // dict → lists (để lưu)
        keys = new(dict.Keys); values = new(dict.Values);
    }
    public void OnAfterDeserialize() {       // lists → dict (sau khi nạp)
        dict = new();
        for (int i = 0; i < keys.Count; i++) dict[keys[i]] = values[i];
    }
}
```

---

## 6. Versioning & Migration (tư duy Senior)

Data sống lâu qua nhiều phiên bản game. Senior thiết kế để data **không vỡ khi cấu trúc đổi**:
- **Đổi tên field** → dùng `[FormerlySerializedAs("oldName")]` giữ giá trị cũ.
- **Thêm field** → đặt giá trị mặc định hợp lý (data cũ thiếu field này).
- **Xóa/đổi nghĩa field** → cần migration logic (đọc cũ, chuyển sang mới).
- Cân nhắc field **`version`** trong save data để xử lý migration (xem [Save/Load](../junior/save-load.md)).

---

## 7. Lỗi thường gặp (cấp Senior)

- ❌ Field không serialize được (Dictionary) → mất data sau hot reload/Play Mode, debug mất hàng giờ nếu không hiểu serialization.
- ❌ Đổi tên/namespace class dùng `[SerializeReference]` → mất data đa hình.
- ❌ Dựa vào reference giữa object trong các scene khác nhau (không serialize cross-scene như mong đợi).
- ❌ Serialize cấu trúc quá sâu/đệ quy → depth limit, cảnh báo.
- ❌ Đổi cấu trúc save không có migration → save người chơi hỏng sau update (mất tiến độ — thảm họa).
- ❌ Nhầm serialization Unity với `System.Serializable`/.NET binary.

---

## 8. Best practices

- ✅ Hiểu rõ field nào serialize được; kiểu không hỗ trợ → dùng `ISerializationCallbackReceiver` hoặc cấu trúc thay thế.
- ✅ Đa hình: SO (asset) cho data lớn/chia sẻ; `[SerializeReference]` cho đa hình trong-object (cẩn thận versioning).
- ✅ Luôn thiết kế **migration** cho data sống lâu (save, config); `[FormerlySerializedAs]` khi đổi tên.
- ✅ Thêm `version` vào save data.
- ✅ Tránh cấu trúc serialize quá sâu/đệ quy.
- ✅ Tài liệu hóa cấu trúc data quan trọng cho team.

---

## 9. Liên kết
- [Serialization (Intern)](../intern/serialization-and-inspector.md) — nền tảng.
- [ScriptableObject](../junior/scriptableobject.md) — đa hình by reference.
- [Save/Load](../junior/save-load.md) — versioning & migration.
- [Script Execution & Player Loop](./execution-order-playerloop.md) — hot reload, domain reload.

---

[⬅️ Knowledge Base](../README.md) | [Memory Model ➡️](./memory-model.md)
