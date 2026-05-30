# 📊 Cách Tự Đánh Giá Đúng Từng Level

[⬅️ Hướng nghề nghiệp](./career-paths.md) | [Về trang chủ ➡️](../README.md)

---

> "Bạn ở level nào" không đo bằng số năm, mà bằng **phạm vi ảnh hưởng (scope)**, **mức độ độc lập (autonomy)**, và **độ phức tạp của vấn đề bạn giải quyết được**.

## 1. Bảng phân biệt 4 level (chuẩn ngành)

| Tiêu chí | Intern | Junior | Mid | Senior |
|----------|--------|--------|-----|--------|
| **Độ độc lập** | Cần hướng dẫn từng bước | Làm task rõ ràng có giám sát | Tự làm feature lớn độc lập | Tự định nghĩa vấn đề & giải pháp |
| **Phạm vi (scope)** | Một function/script nhỏ | Một feature nhỏ | Một hệ thống/module | Nhiều hệ thống / cả kiến trúc |
| **Khi gặp bug** | Bí ngay, cần người gỡ | Tự gỡ bug đơn giản | Tự gỡ bug phức tạp | Gỡ bug hệ thống, ngăn bug từ thiết kế |
| **Tư duy** | "Làm sao cho chạy" | "Làm đúng yêu cầu" | "Làm sao cho tốt/bền" | "Có nên làm không? Đánh đổi gì?" |
| **Code review** | Được review nhiều | Được review, bắt đầu tự review | Review code người khác | Định chuẩn, mentor, review kiến trúc |
| **Ảnh hưởng** | Bản thân | Task của mình | Cả team feature | Cả dự án / nhiều team |
| **Ước lượng** | Không ước lượng được | Ước lượng task nhỏ (sai nhiều) | Ước lượng feature (khá đúng) | Ước lượng dự án, thấy rủi ro trước |

---

## 2. Câu hỏi "litmus test" cho mỗi level

### Bạn đã qua INTERN khi:
- [ ] Tự dựng được một game nhỏ hoàn chỉnh (start → chơi → win/lose → restart) **không cần xem tutorial từng bước**.
- [ ] Hiểu vòng đời MonoBehaviour (`Awake`, `Start`, `Update`...) và dùng đúng.
- [ ] Dùng được Git cơ bản (commit, push, pull, branch).
- [ ] Đọc được lỗi trong Console và tự sửa lỗi đơn giản.

### Bạn đã qua JUNIOR khi:
- [ ] Nhảy vào một **codebase có sẵn** (của người khác) và làm được feature/fix bug mà không phá vỡ thứ khác.
- [ ] Viết code người khác đọc hiểu được (đặt tên tốt, tách hàm, comment hợp lý).
- [ ] Biết dùng Profiler để tìm chỗ lag cơ bản.
- [ ] Hiểu và áp dụng được vài design pattern (Singleton, Observer, State).

### Bạn đã qua MID khi:
- [ ] Được giao "làm hệ thống inventory" (chỉ một câu) và **tự thiết kế + dựng xong** mà không cần ai cầm tay.
- [ ] Code của bạn **bền** — dễ mở rộng, ít bug, người khác build lên được.
- [ ] Tự đưa ra quyết định kỹ thuật và giải thích được **tại sao** chọn vậy.
- [ ] Bắt đầu nghĩ về kiến trúc, không chỉ feature đơn lẻ.

### Bạn đã là SENIOR khi:
- [ ] Người khác **hỏi ý kiến bạn** trước khi ra quyết định kỹ thuật quan trọng.
- [ ] Bạn thấy được **rủi ro & đánh đổi** mà người khác không thấy.
- [ ] Bạn **mentor** được Junior/Mid và nâng cả team lên.
- [ ] Bạn cân được **kỹ thuật vs deadline vs business** — biết khi nào "đủ tốt".
- [ ] Bạn thiết kế hệ thống mà 6 tháng sau vẫn dễ làm việc cùng.

---

## 3. Những hiểu lầm về level cần tránh

| Hiểu lầm | Sự thật |
|----------|---------|
| "Đủ 3 năm là Senior" | Sai. Nhiều người 5 năm vẫn là Junior nâng cao. Scope mới quyết định. |
| "Senior là người code nhanh nhất" | Sai. Senior là người ra quyết định đúng, ngăn vấn đề trước khi xảy ra. |
| "Biết nhiều công nghệ = giỏi" | Sai. Hiểu sâu nguyên lý quan trọng hơn biết tên nhiều thứ. |
| "Viết code phức tạp = pro" | Ngược lại. Pro viết code đơn giản giải quyết vấn đề phức tạp. |

---

## 4. Cách dùng bảng đánh giá thực tế

1. **Mỗi cuối tháng**, tự chấm mình theo bảng mục 1 và 2.
2. **Xin feedback thật** từ mentor/đồng nghiệp/cộng đồng — tự đánh giá thường lệch.
3. **Không vội lên level.** Nền vững quan trọng hơn danh xưng. Người "Junior giỏi" được trọng dụng hơn "Mid hổng kiến thức".
4. Dùng `checklist.md` trong mỗi thư mục level để theo dõi chi tiết.

---

## 5. Thang đo "phỏng vấn thật" cho mỗi level

Nhà tuyển dụng thường đánh giá qua:
- **Coding test:** giải bài C#/thuật toán + một task Unity nhỏ.
- **Portfolio review:** xem game bạn đã làm, hỏi sâu về quyết định kỹ thuật.
- **System design (Mid+):** "Thiết kế hệ thống save game / inventory / multiplayer lobby".
- **Behavioral:** cách bạn làm việc nhóm, xử lý conflict, học hỏi.

Xem chi tiết tại [07-Interview-and-Portfolio](../07-Interview-and-Portfolio/README.md).

---

[⬅️ Hướng nghề nghiệp](./career-paths.md) | [Về trang chủ ➡️](../README.md)
