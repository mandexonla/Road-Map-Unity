# 📦 Build, Asset Pipeline & CI/CD

[⬅️ Technical Index](./README.md)

> 🟢 Cơ bản (Intern build) · 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior)

"Chạy trong editor" ≠ "ship được". Hiểu build & pipeline là bước biến code thành sản phẩm thật.

---

## 🟢 1. Build cơ bản (từ Intern)

- **Build Settings:** chọn nền tảng (PC/Mac, WebGL, Android, iOS), thêm scene, build.
- **Player Settings:** tên app, icon, resolution, quality, scripting backend.
- Build ra file chạy được → test ngoài editor (hành vi khác editor!).
- WebGL: dễ chia sẻ portfolio (upload itch.io).

---

## 🟡 2. Scripting Backend & Compilation

| | Mono | IL2CPP |
|--|------|--------|
| Tốc độ build | Nhanh | Chậm hơn |
| Hiệu năng runtime | Khá | Tốt hơn |
| Bảo mật code | Dễ decompile | Khó hơn (compile sang C++) |
| Bắt buộc | — | iOS, một số nền tảng |

- **IL2CPP:** Unity dịch IL → C++ → native. Hiệu năng tốt, bảo mật hơn, bắt buộc nhiều nền tảng.
- **Managed Stripping:** loại code không dùng → giảm build size (cẩn thận với reflection).
- **AOT vs JIT:** một số nền tảng (iOS) không cho JIT → ảnh hưởng reflection/dynamic code.

---

## 🟡 3. Asset Pipeline & Import

- **Import settings** ảnh hưởng lớn tới size & hiệu năng:
  - Texture: compression (ASTC mobile), max size, mipmap, sprite atlas.
  - Audio: load type (decompress on load / streaming / compressed in memory), nén.
  - Mesh: read/write enabled (tốn memory nếu bật thừa), compression.
- **Presets & AssetPostprocessor:** tự động áp import settings → nhất quán cả team.
- **Sprite Atlas:** gộp sprite giảm draw call.

---

## 🟡 4. Addressables (chuẩn quản lý asset hiện đại)

> Thay thế cho Resources (lỗi thời) và AssetBundle thủ công.

**Lợi ích:**
- Load/unload asset **theo nhu cầu** → giảm memory & build size.
- **Remote content:** tải asset từ server → update nội dung không cần update app (DLC, live ops).
- Quản lý dependency tự động, đếm reference.

**Khái niệm cần nắm:**
- Address, Label, Group.
- `Addressables.LoadAssetAsync` / `Release` (phải release đúng để tránh leak).
- Local vs Remote groups.
- Content catalog & update.

> 📌 Mid bắt buộc nắm Addressables nếu làm mobile/live game.

---

## 🟡 5. Build size & tối ưu phân phối

- Audit asset: tìm asset lớn/thừa (texture quá to, audio không nén).
- Texture compression đúng nền tảng.
- Managed code stripping.
- Addressables để asset không cần thiết không nằm trong build gốc.
- **Android:** App Bundle (AAB), giảm APK; **iOS:** app thinning.

---

## 🔴 6. CI/CD (Senior / dự án team)

> Tự động hóa: mỗi commit/PR → tự build + test → phát hiện lỗi sớm.

**Công cụ:**
- **GitHub Actions** + **game-ci** (miễn phí, phổ biến).
- **Unity Cloud Build / Unity DevOps** (chính thống).
- **Jenkins / GitLab CI / TeamCity** (studio lớn).

**Pipeline điển hình:**
```
Push → Lint/Format → Compile → Unit Test → Play Mode Test →
Build (multi-platform) → Perf Test → Deploy (TestFlight/Internal/itch)
```

**Lợi ích:**
- Phát hiện build hỏng ngay (không "trên máy tôi chạy được").
- Test tự động → ít regression.
- Build nhất quán, không phụ thuộc máy cá nhân.
- Phát hiện regression hiệu năng tự động (perf budget).

---

## 🔴 7. Release & Live Ops (Senior, game service)

- **Versioning:** semantic versioning, version code/name nhất quán.
- **Remote Config:** đổi tham số game không cần update (Unity Remote Config, Firebase).
- **A/B testing, feature flags.**
- **Crash reporting & analytics:** Unity Cloud Diagnostics, Firebase Crashlytics, Sentry.
- **Hotfix strategy:** sửa nhanh không cần app update (qua Addressables/remote config).
- **Staged rollout:** phát hành dần để giảm rủi ro.

---

## ✅ Tiến trình học theo level

```
Intern:  Build PC/WebGL · Player Settings cơ bản
Junior:  Build mobile · import settings · sprite atlas · IL2CPP cơ bản
Mid:     Addressables · build size optimization · asset pipeline tự động · stripping
Senior:  CI/CD pipeline · perf test tự động · remote content · live ops · release strategy
```

---

## 📚 Tài nguyên
- Unity Addressables docs + The Gamedev Guru (Addressables series).
- game-ci docs (GitHub Actions for Unity).
- Unity build & player settings docs.
- Unity DevOps / Cloud Build docs.

---

[⬅️ Version Control](./version-control.md) | [Technical Index ➡️](./README.md)
