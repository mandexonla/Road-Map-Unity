# 💾 Save / Load (Lưu & Nạp Dữ Liệu)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Serialization](../intern/serialization-and-inspector.md) · [ScriptableObject](./scriptableobject.md)

---

## 1. Bản chất

**Save/Load = biến trạng thái game (điểm, tiến độ, settings, inventory) thành dữ liệu lưu được xuống đĩa, rồi nạp lại ở phiên chơi sau.** Đây là **serialization áp dụng cho dữ liệu người chơi** (khác serialization của Editor — xem [Serialization](../intern/serialization-and-inspector.md)).

> 🔑 Điểm cần hiểu rõ: dữ liệu trong RAM biến mất khi tắt game. Muốn "nhớ" qua các phiên → phải **ghi ra file/bộ nhớ bền (persistent)**. Save = đóng gói + ghi; Load = đọc + khôi phục.

---

## 2. Các phương án (từ đơn giản → mạnh)

### 🅰️ PlayerPrefs — đơn giản nhất
Kho key-value nhỏ (Unity tự lo nơi lưu theo nền tảng).
```csharp
PlayerPrefs.SetInt("highScore", 1000);
PlayerPrefs.SetFloat("volume", 0.8f);
PlayerPrefs.SetString("playerName", "Chau");
PlayerPrefs.Save();                       // ghi xuống đĩa
int hs = PlayerPrefs.GetInt("highScore", 0);  // 0 = mặc định nếu chưa có
```
- ✅ Dùng cho: **settings, high score, cờ nhỏ** (đã xem tutorial chưa, âm lượng).
- ❌ KHÔNG dùng cho: save game phức tạp (inventory, world state). Không bảo mật, không cấu trúc, dễ lạm dụng.

### 🅱️ JSON + File — cho save game thật
Serialize cả một object dữ liệu thành text JSON, ghi ra file.
```csharp
[System.Serializable]
public class SaveData {
    public int level;
    public int gold;
    public List<string> unlockedItems;
    public Vector3 playerPosition;
}

void Save(SaveData data) {
    string json = JsonUtility.ToJson(data, prettyPrint: true);
    File.WriteAllText(Application.persistentDataPath + "/save.json", json);
}

SaveData Load() {
    string path = Application.persistentDataPath + "/save.json";
    if (!File.Exists(path)) return new SaveData();      // chưa có → mới
    string json = File.ReadAllText(path);
    return JsonUtility.FromJson<SaveData>(json);
}
```
> 📌 **`Application.persistentDataPath`** là thư mục lưu **bền** đúng cho từng nền tảng (Windows/Android/iOS). Luôn dùng nó — **đừng** hardcode đường dẫn.

### 🅲 Binary / thư viện chuyên (nâng cao)
Cho save lớn/nhanh/khó sửa: binary serialization, hoặc thư viện (Json.NET, MessagePack, Easy Save asset). Json.NET xử lý được cấu trúc phức tạp mà `JsonUtility` không (Dictionary, polymorphism).

---

## 3. Giới hạn của `JsonUtility` (cần biết)

`JsonUtility` của Unity nhanh nhưng hạn chế (giống quy tắc serialize của Unity):
- ❌ Không serialize **Dictionary** trực tiếp.
- ❌ Không serialize **property**, chỉ field.
- ❌ Khó với **polymorphism** (list các kiểu con khác nhau).
- ✅ Tốt cho cấu trúc đơn giản (field, list, kiểu cơ bản, class [Serializable]).

→ Cấu trúc phức tạp: dùng **Json.NET (Newtonsoft)** hoặc asset như **Easy Save**.

---

## 4. ⚠️ ScriptableObject KHÔNG phải save system

Lỗi hiểu lầm phổ biến: "ghi runtime vào SO để lưu". **Sai.** SO ghi runtime có thể đổi asset trong **Editor** nhưng **không bền** trong **build** qua các phiên chơi. SO là **data tĩnh/config**, không phải nơi lưu tiến độ. Save thật → PlayerPrefs/file. Xem [ScriptableObject](./scriptableobject.md).

---

## 5. Ứng dụng thực tế

- **Settings:** âm lượng, độ phân giải, ngôn ngữ → PlayerPrefs.
- **High score, tiến độ nhỏ** → PlayerPrefs.
- **Save game:** level, inventory, vị trí, unlock, quest → JSON file.
- **Cloud save** (mobile/Steam) → file + đồng bộ qua dịch vụ.

---

## 6. Ưu điểm / Nhược điểm các phương án

| | PlayerPrefs | JSON file | Binary/Library |
|--|-------------|-----------|----------------|
| Dễ dùng | ✅ Rất dễ | ✅ Vừa | ⚠️ Phức tạp hơn |
| Cấu trúc phức tạp | ❌ | ✅ | ✅✅ |
| Đọc được (debug) | ⚠️ | ✅ (text) | ❌ (binary) |
| Bảo mật/chống sửa | ❌ | ❌ (text dễ sửa) | ⚠️ (khá hơn) |
| Phù hợp | Settings/score | Save game | Save lớn/cần bảo mật |

---

## 7. Lỗi thường gặp

### ❌ Hardcode đường dẫn file thay vì `persistentDataPath`
Chạy editor được, build/mobile lỗi (không quyền ghi). Luôn `Application.persistentDataPath`.
### ❌ Dùng PlayerPrefs cho save game lớn
Sai mục đích — không cấu trúc, dễ hỏng. Dùng file JSON.
### ❌ Không xử lý file chưa tồn tại / hỏng
Lần chơi đầu chưa có file, hoặc file hỏng → crash. Luôn kiểm tra `File.Exists` + try/catch + fallback save mới.
### ❌ Không versioning save data
Update game đổi cấu trúc SaveData → save cũ load lỗi. Thêm field `version` và logic **migration** (chuyển save cũ sang mới).
### ❌ Tưởng SO lưu được tiến độ
Xem mục 4.
### ❌ Lưu mỗi frame
Ghi file tốn I/O. Lưu ở checkpoint / khi thoát / định kỳ, không mỗi frame.

---

## 8. Best practices

- ✅ PlayerPrefs cho **settings & số nhỏ**; JSON file cho **save game**.
- ✅ Luôn dùng `Application.persistentDataPath`.
- ✅ Gói save vào **một class `[Serializable]`** rõ ràng (SaveData).
- ✅ Xử lý file thiếu/hỏng (File.Exists + try/catch + fallback).
- ✅ Thêm **version + migration** cho save (game sẽ update).
- ✅ Cấu trúc phức tạp (Dictionary, polymorphism) → Json.NET / Easy Save.
- ✅ Lưu ở thời điểm hợp lý (checkpoint/thoát), không mỗi frame.
- ✅ Cân nhắc mã hóa/checksum nếu cần chống gian lận (không tuyệt đối).

---

## 9. Liên kết
- [Serialization & Inspector](../intern/serialization-and-inspector.md) — nền serialization & quy tắc field.
- [ScriptableObject](./scriptableobject.md) — vì sao SO ≠ save.
- [C# Trung Cấp](./csharp-intermediate.md) — exception handling cho I/O.
- Build & platform paths — [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md).

---

[⬅️ UI System (uGUI)](./ui-ugui.md) | [Knowledge Base ➡️](../README.md)
