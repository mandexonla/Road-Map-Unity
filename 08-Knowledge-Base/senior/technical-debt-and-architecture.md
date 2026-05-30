# 🏗️ Technical Debt & Tư Duy Kiến Trúc Senior

[⬅️ Knowledge Base](../README.md) | Liên quan: [Architecture](../../05-Technical-Deep-Dives/architecture.md) · [ADR & Technical Docs](./adr-and-technical-docs.md)

> Ở Senior, kỹ thuật là điều kiện cần. Cái phân biệt là **phán đoán**: biết khi nào làm kỹ, khi nào "đủ tốt", và quản lý nợ kỹ thuật để dự án sống lâu.

---

## 1. Bản chất: Technical Debt (Nợ kỹ thuật)

**Nợ kỹ thuật là cái giá tương lai phải trả cho một quyết định "đi tắt" hôm nay.** Giống nợ tài chính: vay (đi tắt) để nhanh bây giờ, nhưng trả "lãi" (chậm hơn, bug hơn) về sau cho tới khi "trả nợ" (refactor).

> 🔑 Hiểu lầm phổ biến: "nợ kỹ thuật = code xấu". Sai. Nợ kỹ thuật có thể là **quyết định khôn ngoan có chủ đích** (ship nhanh để kịp thị trường, rồi trả nợ sau). Vấn đề không phải *có* nợ, mà là **vay vô ý thức và không bao giờ trả** → "vỡ nợ" (codebase không thể đụng vào).

---

## 2. Phân loại nợ (ma trận Fowler)

| | Cố ý (Deliberate) | Vô ý (Inadvertent) |
|--|-------------------|---------------------|
| **Thận trọng (Prudent)** | "Ship giờ, refactor sau — ta biết hậu quả" ✅ | "Giờ ta hiểu lẽ ra nên thiết kế khác" (học được) |
| **Liều lĩnh (Reckless)** | "Không có thời gian cho thiết kế" ⚠️ | "Layer là gì?" ❌ (thiếu kiến thức) |

- **Nợ thận trọng + cố ý** là công cụ hợp lệ của Senior (đánh đổi có ý thức).
- **Nợ liều lĩnh** (cẩu thả hoặc thiếu hiểu biết) là thứ phải tránh.

---

## 3. Quản lý nợ kỹ thuật (kỹ năng Senior)

1. **Nhận diện & ghi nhận:** nợ ẩn là nguy hiểm nhất. Ghi lại (TODO có cấu trúc, issue, [ADR](./adr-and-technical-docs.md)) "chỗ này đi tắt vì X, cần trả khi Y".
2. **Đo tác động:** nợ ở code ít đụng tới ≠ nợ ở code sửa hàng ngày. Ưu tiên trả nợ chỗ **cản trở thường xuyên**.
3. **Trả nợ có chiến lược:** refactor dần khi đụng vào (boy scout rule: "để lại sạch hơn lúc đến"), hoặc dành sprint refactor cho nợ lớn.
4. **Ngăn nợ liều lĩnh:** code review, chuẩn chung, kiến trúc rõ.
5. **Truyền đạt cho non-tech:** giải thích nợ kỹ thuật cho PM/sếp bằng ngôn ngữ business ("không trả nợ này, mỗi feature sau chậm 30%").

---

## 4. ⚠️ Over-engineering — nợ ngược chiều

Senior non kinh nghiệm dễ mắc lỗi **ngược**: thiết kế quá mức cho tương lai không tới.
> Kiến trúc phức tạp "phòng xa" cũng là một dạng nợ: tốn thời gian xây, làm code khó hiểu, cho linh hoạt **không ai dùng**. **YAGNI** áp dụng kể cả ở Senior.

**Cân bằng vàng:**
- Đừng under-engineer (nợ liều lĩnh) **lẫn** over-engineer (phức tạp vô ích).
- Thiết kế cho **thay đổi đã thấy trước có khả năng cao**, không cho mọi thay đổi tưởng tượng.
- "Đơn giản nhất có thể, nhưng không đơn giản hơn."

---

## 5. Tư duy kiến trúc cho dự án sống lâu

- **Thiết kế cho thay đổi, không cho hoàn hảo:** yêu cầu game luôn đổi; kiến trúc tốt làm đổi rẻ, không phải "đúng tuyệt đối".
- **Ranh giới & module:** cô lập phần hay đổi sau interface; [assembly definitions](../mid/assembly-definitions.md) enforce ranh giới.
- **Tối ưu cho việc đọc & sửa của team:** code sống với người 6-12 tháng sau, không phải "thông minh" hôm nay.
- **Quyết định có thể đảo ngược vs không:** quyết định khó đảo (chọn netcode, kiến trúc lõi) → cân nhắc kỹ, tài liệu hóa ([ADR](./adr-and-technical-docs.md)). Quyết định dễ đảo → làm nhanh, sửa sau.
- **Bối cảnh quyết định kiến trúc:** game jam 48h vs live-service 5 năm cần kiến trúc khác hẳn. **Không có "kiến trúc đúng" tuyệt đối — chỉ có phù hợp bối cảnh.**

---

## 6. Cân kỹ thuật ↔ deadline ↔ business (phán đoán cốt lõi)

Senior liên tục cân:
- **Khi nào "đủ tốt" và ship?** Hoàn hảo kỹ thuật mà trễ thị trường = thất bại.
- **Khi nào đầu tư làm kỹ?** Code lõi sống lâu, đụng nhiều → đáng đầu tư.
- **Khi nào nhận nợ có chủ đích?** Deadline gấp + nợ ở chỗ ít đụng → chấp nhận, ghi lại.
- Quyết định dựa trên **giá trị business + rủi ro + chi phí dài hạn**, không chỉ "code đẹp".

> 🔑 Đây là điều phân biệt Senior thật: không phải viết code đẹp nhất, mà **ra quyết định đúng dưới ràng buộc** (thời gian, người, tiền, chất lượng) và **chịu trách nhiệm** về nó.

---

## 7. Lỗi thường gặp (cấp Senior)

- ❌ Theo đuổi "kiến trúc hoàn hảo" mà trễ deadline / xa thực tế sản phẩm.
- ❌ Over-engineer "phòng xa" cho linh hoạt không ai dùng.
- ❌ Để nợ liều lĩnh tích tụ vô ý thức → codebase "không thể đụng".
- ❌ Không truyền đạt được nợ/đánh đổi cho team & non-tech.
- ❌ Áp một "kiến trúc đúng" cố định bất kể bối cảnh.
- ❌ Refactor lớn "big bang" làm sập sản phẩm thay vì cải thiện dần.

---

## 8. Best practices

- ✅ Nhận **nợ có chủ đích & ghi lại**; tránh nợ liều lĩnh.
- ✅ Trả nợ **có chiến lược** (ưu tiên chỗ cản trở thường xuyên; boy scout rule).
- ✅ Tránh cả under- lẫn over-engineering — thiết kế cho thay đổi **có khả năng cao**.
- ✅ Tài liệu hóa quyết định khó đảo ([ADR](./adr-and-technical-docs.md)).
- ✅ Cân kỹ thuật ↔ deadline ↔ business; biết khi nào "đủ tốt".
- ✅ Refactor **dần & an toàn** (dựa test + Git), không big-bang.
- ✅ Truyền đạt đánh đổi cho cả dev & non-tech.
- ✅ Chọn kiến trúc theo **bối cảnh dự án**, không theo trend/giáo điều.

---

## 9. Liên kết
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — nền kiến trúc, SOLID, layering.
- [ADR & Technical Docs](./adr-and-technical-docs.md) — ghi lại quyết định.
- [Assembly Definitions](../mid/assembly-definitions.md) — enforce ranh giới.
- [Senior level](../../04-Senior/README.md) — phán đoán, leadership, business sense.

---

[⬅️ C# Advanced & Performance](./csharp-advanced-performance.md) | [ADR & Technical Docs ➡️](./adr-and-technical-docs.md)
