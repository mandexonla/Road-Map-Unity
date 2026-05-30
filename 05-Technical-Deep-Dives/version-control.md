# 🔀 Version Control (Git) cho Unity

[⬅️ Technical Index](./README.md)

> 🟢 Cơ bản (Intern) · 🟡 Trung cấp (Junior/Mid) · 🔴 Nâng cao (Senior)

Git là kỹ năng **bắt buộc từ ngày đầu**. Không dùng Git = nghiệp dư. Unity có vài điểm đặc thù cần biết.

---

## 🟢 1. Git cơ bản (học ngay từ Intern)

```bash
git init                    # khởi tạo repo
git add .                   # đưa thay đổi vào staging
git commit -m "message"     # lưu một bản ghi
git push                    # đẩy lên remote (GitHub)
git pull                    # kéo về
git status                  # xem trạng thái
git log                     # xem lịch sử
```

**Branch cơ bản:**
```bash
git branch feature-x        # tạo nhánh
git checkout feature-x      # chuyển nhánh (hoặc git switch)
git merge feature-x         # gộp nhánh
```

> 💡 Commit **nhỏ, thường xuyên, message rõ ràng**. "Fix bug" thì fix bug gì? Viết "Fix player double-jump on slope".

---

## 🟢 2. `.gitignore` cho Unity (CỰC QUAN TRỌNG)

Unity sinh nhiều file/thư mục **không nên commit** (Library, Temp, Build...). Phải có `.gitignore` đúng ngay từ đầu.

- Dùng template chính thức: **github.com/github/gitignore → Unity.gitignore**.
- Những thứ KHÔNG commit: `Library/`, `Temp/`, `Obj/`, `Build/`, `Logs/`, `*.csproj`, `*.sln` (sinh tự động).
- Những thứ PHẢI commit: `Assets/`, `ProjectSettings/`, `Packages/manifest.json`, và **file `.meta`**.

> ⚠️ Nếu commit nhầm `Library/` (vài GB) → repo phình to. Sửa `.gitignore` ngay từ commit đầu tiên.

---

## 🟡 3. File `.meta` — đặc thù Unity

- Mỗi asset trong Unity có 1 file `.meta` đi kèm (chứa GUID, import settings).
- **PHẢI commit file `.meta`.** Mất `.meta` → Unity gán lại GUID → đứt reference (script mất, prefab hỏng).
- Bật **Visible Meta Files** + **Force Text** serialization (Project Settings → Editor):
  - `Asset Serialization = Force Text` → file dạng text, merge được, đọc diff được.

---

## 🟡 4. Git LFS — cho asset lớn (binary)

- Game có nhiều file binary lớn (texture, model, audio, video) → Git thường xử lý kém.
- **Git LFS (Large File Storage):** lưu file lớn riêng, repo nhẹ.
- Cấu hình `.gitattributes` để track binary:
  ```
  *.psd filter=lfs diff=lfs merge=lfs -text
  *.png filter=lfs diff=lfs merge=lfs -text
  *.fbx filter=lfs diff=lfs merge=lfs -text
  ```
- ⚠️ LFS có giới hạn dung lượng/băng thông (GitHub) → cân nhắc cho dự án lớn.

> 📌 Một số studio dùng **Plastic SCM (Unity Version Control)** hoặc **Perforce** thay Git cho asset nặng & team lớn. Biết là có, học khi cần.

---

## 🟡 5. Workflow nhóm (Junior/Mid)

### Feature Branch Workflow (phổ biến)
```
main (luôn ổn định)
  └── feature/inventory   ← làm tính năng ở nhánh riêng
  └── feature/enemy-ai
  └── bugfix/jump-glitch
```
1. Tạo branch từ `main` cho mỗi feature/fix.
2. Làm xong → mở **Pull Request (PR)**.
3. Team **review code** → sửa theo feedback.
4. Merge vào `main`.

### Quy ước commit (Conventional Commits)
```
feat: add inventory drag-drop
fix: prevent double jump on slope
refactor: extract damage calculation
perf: pool bullet objects
docs: update build instructions
```

---

## 🟡 6. Giải quyết conflict & merge

- Conflict xảy ra khi 2 người sửa cùng vùng.
- ⚠️ **Scene & Prefab (.unity, .prefab) rất khó merge** dù là text → tránh 2 người sửa cùng scene.
  - Giải pháp: chia scene nhỏ, dùng prefab, additive scene, phân chia ai làm scene nào.
  - Unity có **Smart Merge (UnityYAMLMerge)** giúp merge scene/prefab.
- Code (.cs) merge dễ hơn nhiều.

---

## 🔴 7. Nâng cao (Senior)

- **Branching strategy** cho team lớn: Git Flow, trunk-based, release branch.
- **CI/CD tích hợp:** mỗi PR auto build + test (xem [build-and-pipeline.md](./build-and-pipeline.md)).
- **Monorepo vs multi-repo** cho nhiều dự án/package.
- **Hooks:** pre-commit (lint, format), pre-push (test).
- Quản lý **package nội bộ** qua Git (UPM Git dependency).
- Chiến lược cho **binary nặng** ở quy mô studio (Perforce/Plastic).

---

## ✅ Tiến trình học theo level

```
Intern:  add/commit/push/pull · branch · .gitignore Unity · commit .meta
Junior:  feature branch · PR · code review · conventional commits · LFS · conflict
Mid:     merge scene/prefab · smart merge · CI tích hợp · package qua Git
Senior:  branching strategy team · trunk-based · hooks · binary scale · monorepo
```

---

## 📚 Tài nguyên
- "Pro Git" book (miễn phí).
- Atlassian Git tutorials.
- GitHub's Unity.gitignore template.
- Git LFS docs · UnityYAMLMerge docs.

---

[⬅️ Technical Index](./README.md) | [Build & Pipeline ➡️](./build-and-pipeline.md)
