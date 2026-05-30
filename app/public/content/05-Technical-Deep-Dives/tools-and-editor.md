# 🔧 Tools & Editor Programming (Tools/Engine Programmer)

[⬅️ Technical Index](./README.md)

> 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior) — hướng chuyên sâu cho **Tools/Engine Programmer**

Tools programmer viết code **cho lập trình viên & designer khác dùng**, không phải cho người chơi. Đòn bẩy cực lớn: một tool tốt làm cả team nhanh hơn. Hướng này hiếm người giỏi → giá trị cao.

---

## 🟡 1. Editor Scripting cơ bản

| Công cụ | Dùng để |
|---------|---------|
| **Custom Inspector** (`Editor`, `OnInspectorGUI`) | Tùy biến cách hiển thị component trong Inspector |
| **Property Drawer** (`PropertyDrawer`) | Tùy biến cách vẽ 1 kiểu field (tái dùng) |
| **Editor Window** (`EditorWindow`) | Cửa sổ tool riêng (level editor, dashboard) |
| **Gizmos & Handles** | Vẽ trong Scene view, kéo thả trực quan |
| **Menu Items** (`[MenuItem]`) | Thêm lệnh vào menu Unity |
| **Context Menu** (`[ContextMenu]`) | Lệnh nhanh trên component |
| **`[CustomEditor]`, `[CanEditMultipleObjects]`** | — |

> 💡 Bắt đầu nhỏ: viết một tool tự động đặt tên, một button "regenerate" trong Inspector. Quen dần lên level editor.

---

## 🟡 2. Attribute & cải thiện workflow

- `[SerializeField]`, `[HideInInspector]`, `[Range]`, `[Tooltip]`, `[Header]`, `[Space]`.
- Custom attribute + PropertyDrawer (vd `[ReadOnly]`, `[ShowIf]`).
- **Odin Inspector** (asset thương mại): siêu mạnh cho editor UI, nhiều studio dùng → biết là một lợi thế.

---

## 🟡 3. Automation & Pipeline Tools

- **AssetPostprocessor:** tự động áp import settings khi import asset (texture, model).
- **Build automation:** script build từ command line, build nhiều nền tảng (`BuildPipeline`).
- **Asset validation:** tool kiểm tra asset sai chuẩn (texture quá to, naming sai, missing reference).
- **Batch processing:** xử lý hàng loạt asset.
- **Scene/Prefab tools:** tự động setup, kiểm tra, sửa lỗi scene.
- **Data import:** import từ CSV/Google Sheet/JSON thành ScriptableObject (designer chỉnh ngoài, import vào).

---

## 🟡 4. UI Toolkit (cho editor & runtime hiện đại)

- **UI Toolkit (UIElements):** hệ UI mới của Unity, dùng UXML (markup) + USS (như CSS).
- Là tương lai cho **editor tooling** (và dần cho runtime UI).
- Học khi làm tool phức tạp — UI Toolkit mạnh hơn IMGUI cho editor window lớn.

---

## 🔴 5. Nâng cao (Senior / Engine-level)

- **Code generation / Source Generators:** tự sinh code (boilerplate, binding).
- **Custom Package (UPM):** đóng gói tool thành package tái dùng nhiều dự án.
- **Custom Build Pipeline:** tích hợp build với CI/CD, hooks, post-process.
- **Editor performance:** tool không làm chậm editor (quan trọng khi dự án lớn).
- **Scriptable Build Pipeline, Addressables build hooks.**
- **Roslyn analyzers:** enforce coding standard tự động.
- **Native plugin / interop** (C++ ↔ C#) khi cần khả năng engine không có.
- Xây **framework nội bộ** cho cả studio.

---

## 🎯 Tại sao hướng này giá trị cao?

> Một gameplay programmer làm 1 feature. Một tools programmer giỏi làm **cả team** nhanh hơn 20%. Đòn bẩy nhân lên. Studio luôn thiếu tools engineer giỏi. Đây cũng là kỹ năng cực hữu ích cho **Indie** (tự xây tool tăng tốc chính mình).

---

## 🎯 Lộ trình rèn luyện

```
Mid:     Custom Inspector/PropertyDrawer · EditorWindow · MenuItem · AssetPostprocessor
         · build automation · data import từ Sheet/CSV · validation tool
Senior:  UPM package · source generator · custom build pipeline · UI Toolkit editor
         · framework nội bộ · Roslyn analyzer · native plugin
```

**Dự án gợi ý:** level editor trực quan, dialogue/quest editor, tool import data từ Google Sheet, build dashboard cho team.

---

## 📚 Tài nguyên
- Unity Editor scripting docs (chính thống).
- "Editor Scripting" tutorials — git-amend, Warped Imagination (YouTube).
- UI Toolkit docs.
- Odin Inspector (tham khảo asset thương mại).
- Unity UPM (package) docs.

---

## 🔗 Liên quan
- Bổ trợ mọi hướng khác (tool cho gameplay/graphics/multiplayer).
- Cần [architecture.md](./architecture.md) + [build-and-pipeline.md](./build-and-pipeline.md).

---

[⬅️ Gameplay Systems](./gameplay-systems.md) | [Graphics & Rendering ➡️](./graphics-and-rendering.md)
