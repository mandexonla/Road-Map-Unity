# 🧼 Clean Code (Code Sạch)

[⬅️ Knowledge Base](../README.md) | Liên quan: [C# Trung Cấp](./csharp-intermediate.md) · [Design Patterns](./design-patterns.md)

> Bước nhảy Intern → Junior là từ **"code cho máy chạy"** sang **"code cho người đọc"**. Code được đọc nhiều hơn được viết — kể cả bởi chính bạn 3 tháng sau.

---

## 1. Bản chất

**Clean code = code mà người khác đọc hiểu nhanh, sửa an toàn, ít bug.** Nó không phải "code thông minh" hay "code ngắn nhất" — mà là **code rõ ràng**.

> 🔑 Thước đo chất lượng code thật sự: *"WTF/phút"* khi người khác đọc. Code sạch = ít "WTF". Máy không quan tâm code đẹp hay xấu (đều chạy như nhau); **con người** mới là người phải sống với nó.

---

## 2. Vấn đề nó giải quyết

Game luôn thay đổi. Code bạn viết hôm nay sẽ bị sửa hàng chục lần. Code bẩn làm mỗi lần sửa thành ác mộng:
- Không hiểu code làm gì → sợ đụng vào.
- Sửa một chỗ hỏng ba chỗ.
- Bug ẩn trong hàm 500 dòng.

Clean code làm **thay đổi rẻ** và **bug ít**.

---

## 3. Các nguyên tắc cốt lõi

### 📛 Đặt tên rõ ràng (quan trọng nhất)
Tên tốt là "tài liệu sống". Tên xấu là nguồn hiểu lầm.
```csharp
// ❌ Xấu
float t; int x1; void Do(); List<GameObject> list2;

// ✅ Tốt — tên nói rõ ý nghĩa
float enemySpawnInterval;
int currentWaveIndex;
void SpawnNextWave();
List<GameObject> activeEnemies;
```
Quy tắc: biến = danh từ (`playerHealth`), hàm = động từ (`TakeDamage`), bool = câu hỏi (`isAlive`, `hasKey`). Không viết tắt khó hiểu, không `data`/`temp`/`manager2`.

### 🎯 SRP — Single Responsibility (mỗi thứ một việc)
Một class/hàm chỉ nên có **một lý do để thay đổi**.
```csharp
// ❌ God class — làm mọi thứ
class Player {
    void Move(){} void TakeDamage(){} void UpdateUI(){}
    void SaveGame(){} void PlaySound(){} void SpawnEnemies(){}
}
// ✅ Tách trách nhiệm
class PlayerMovement {} class PlayerHealth {} class PlayerUI {}
```
Dấu hiệu vi phạm: tên class chung chung (`Manager`, `Handler`, `System`) ôm đủ thứ; hàm dài; class >300 dòng.

### 🔁 DRY — Don't Repeat Yourself
Cùng một đoạn logic xuất hiện 3 lần → tách thành hàm. Sửa một chỗ thay vì ba.
```csharp
// ❌ Lặp: 3 nơi tính damage giống nhau → sửa 1 chỗ quên 2 chỗ
// ✅ Tách: int CalcDamage(...) dùng chung
```
> ⚠️ Đừng DRY thái quá: hai đoạn **trông giống** nhưng **khác bản chất** thì đừng gộp (gộp sai làm chúng dính nhau, sau khó tách).

### 💋 KISS — Keep It Simple
Giải pháp đơn giản nhất chạy được. Code phức tạp không làm bạn "pro" — nó làm bạn (và team) khổ.

### 🚫 YAGNI — You Aren't Gonna Need It
Đừng code tính năng "biết đâu sau cần". Phần lớn "sau" không bao giờ tới, mà code thừa thì phải bảo trì mãi.

### ✂️ Hàm ngắn, một mức trừu tượng
Hàm lý tưởng gọn trong một màn hình, làm một việc. Hàm dài → tách thành các hàm nhỏ tên rõ (chính các tên hàm kể câu chuyện).

---

## 4. Ví dụ refactor

```csharp
// ❌ TRƯỚC — một hàm làm mọi thứ, khó đọc
void Update() {
    for (int i = 0; i < e.Count; i++) {
        if (e[i].h <= 0) { Destroy(e[i].gameObject); e.RemoveAt(i); i--;
            s += 10; t.text = "Score: " + s;
            if (s > hs) { hs = s; PlayerPrefs.SetInt("hs", hs); } } }
}

// ✅ SAU — tách trách nhiệm, tên rõ, đọc như kể chuyện
void Update() {
    RemoveDeadEnemies();
}
void RemoveDeadEnemies() {
    for (int i = activeEnemies.Count - 1; i >= 0; i--) {
        if (!activeEnemies[i].IsAlive) KillEnemy(i);
    }
}
void KillEnemy(int index) {
    Destroy(activeEnemies[index].gameObject);
    activeEnemies.RemoveAt(index);
    scoreSystem.Add(KILL_REWARD);   // điểm số là việc của scoreSystem, không phải hàm này
}
```

---

## 5. Ứng dụng thực tế

- Mỗi khi viết xong một hàm, đọc lại: "người khác hiểu ngay không?".
- Trước khi commit, refactor nhanh: đổi tên mơ hồ, tách hàm dài.
- Trong code review: bắt tên xấu, God class, code lặp.
- Khi quay lại code cũ thấy khó hiểu → đó là tín hiệu cần refactor.

---

## 6. Ưu điểm / Nhược điểm (của việc đầu tư clean code)

| Ưu điểm | "Chi phí" |
|---------|-----------|
| Sửa/mở rộng dễ & an toàn | Tốn thời gian hơn lúc viết đầu |
| Ít bug, dễ debug | Cần kỷ luật |
| Người khác (và bạn sau này) cảm ơn | Dễ over-engineer nếu nhầm clean = phức tạp |
| Nền tảng cho mọi kiến trúc | — |

> 💡 Cân bằng: prototype/game jam cần **chạy nhanh**, không cần sạch hoàn hảo. Code sẽ sống lâu (production) thì đầu tư clean. Biết bối cảnh.

---

## 7. Lỗi thường gặp

### ❌ Nhầm "clean code" = "code phức tạp/nhiều pattern"
Ngược lại. Clean = **đơn giản & rõ**. Nhồi pattern không cần thiết là **bẩn**.
### ❌ God class / God script
Một `GameManager` 2000 dòng làm mọi thứ. Tách theo trách nhiệm.
### ❌ Comment thay vì đặt tên tốt
```csharp
int d; // khoảng cách tới player  ← cần comment vì tên xấu
float distanceToPlayer;            // ✅ tên tự giải thích, khỏi comment
```
Comment giải thích **"tại sao"**, không phải **"cái gì"** (cái gì để code tự nói).
### ❌ Over-engineer nhân danh "clean"
Tạo 10 interface + factory cho game jam 2 ngày. YAGNI.

---

## 8. Best practices

- ✅ Đặt tên tốt > mọi kỹ thuật khác. Dành thời gian nghĩ tên.
- ✅ Mỗi class/hàm **một việc** (SRP).
- ✅ Tách hàm dài; class quá to thì chia.
- ✅ Code lặp 3 lần → tách (nhưng không gộp cái khác bản chất).
- ✅ Comment "tại sao", để code tự nói "cái gì".
- ✅ Đơn giản trước, chỉ thêm phức tạp khi vấn đề đòi hỏi.
- ✅ Refactor liên tục (dựa vào Git để an toàn).
- ✅ Đọc code người giỏi (open source) để học cách tổ chức.

---

## 9. Liên kết
- [C# Trung Cấp](./csharp-intermediate.md) — property & encapsulation.
- [Design Patterns](./design-patterns.md) — pattern là công cụ, dùng khi cần (không nhồi).
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — coupling/cohesion, SOLID.
- Sách: "Clean Code" (R.C. Martin), "A Philosophy of Software Design" (Ousterhout).

---

[⬅️ C# Trung Cấp](./csharp-intermediate.md) | [ScriptableObject ➡️](./scriptableobject.md)
