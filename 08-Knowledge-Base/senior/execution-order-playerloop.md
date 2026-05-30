# ⏱️ Script Execution Order & Player Loop (Sâu)

[⬅️ Knowledge Base](../README.md) | Liên quan: [MonoBehaviour & Lifecycle](../intern/monobehaviour-lifecycle.md)

> Đào sâu cơ chế engine gọi code của bạn — kiến thức để debug các bug "thứ tự" khó hiểu và can thiệp vòng lặp engine ở mức Senior.

---

## 1. Bản chất: Player Loop

**Player Loop là vòng lặp chính của engine, chạy mỗi frame, gồm một chuỗi cố định các "giai đoạn" (phases).** Các hàm MonoBehaviour của bạn (`Update`, `FixedUpdate`...) được engine gọi tại các điểm cụ thể trong vòng lặp này.

> 🔑 [MonoBehaviour lifecycle](../intern/monobehaviour-lifecycle.md) (Intern) cho bạn biết *các hàm chạy khi nào tương đối với nhau*. Player Loop cho biết *chúng nằm ở đâu trong cỗ máy engine* — và từ Unity 2018+, bạn có thể **chèn callback tùy biến** vào vòng lặp này (`PlayerLoopSystem`), điều mà UniTask & nhiều thư viện khai thác.

---

## 2. Player Loop gồm gì (đơn giản hóa)

```
Mỗi frame, engine chạy tuần tự các phase:
  Initialization
  EarlyUpdate          (xử lý input, sự kiện hệ thống)
  FixedUpdate phase    → MonoBehaviour.FixedUpdate (lặp 0..n lần) + physics
  PreUpdate
  Update phase         → MonoBehaviour.Update + coroutine (yield null)
  PreLateUpdate
  PostLateUpdate       → MonoBehaviour.LateUpdate + rendering
```
> Mỗi phase chứa nhiều "system" con. Bạn có thể **thêm system của riêng mình** vào bất kỳ phase nào (vd chạy logic trước physics, hoặc sau render) — kiểm soát cực mịn cho hệ thống tùy biến.

---

## 3. Thứ tự thực thi giữa các script (Script Execution Order)

### Vấn đề
Khi nhiều object có `Awake`/`Update`, **thứ tự giữa chúng KHÔNG xác định mặc định** (Unity không đảm bảo script nào chạy trước). Nếu logic của bạn ngầm phụ thuộc "A `Awake` trước B" → bug không tái lập, lúc được lúc không.

### Giải pháp
- **Tránh phụ thuộc thứ tự** là tốt nhất: `Awake` lo bản thân, `Start` lo liên kết (vì mọi `Awake` xong trước mọi `Start`).
- **Script Execution Order** (Project Settings): ép một số script chạy trước/sau script khác — dùng **tiết kiệm**, chỉ cho hạ tầng quan trọng (vd Manager khởi tạo trước).
- **Kiến trúc rõ ràng:** dùng một điểm khởi tạo điều phối (bootstrap/installer, [DI](../mid/dependency-injection.md)) thay vì dựa thứ tự ngầm.

> 🔑 Senior **không dựa vào** thứ tự thực thi ngầm — thiết kế để thứ tự không quan trọng, hoặc kiểm soát tường minh. Phụ thuộc thứ tự ngầm là nguồn bug khó nhất.

---

## 4. Domain Reload & Enter Play Mode (đặc thù Editor)

### Domain Reload là gì
Khi bạn nhấn Play hoặc sửa code, Unity (mặc định) **reload toàn bộ domain C#**: reset mọi **static field**, serialize-deserialize state. Điều này làm Play Mode "sạch" như chạy mới.

### Vấn đề & "Enter Play Mode Options"
Domain reload **chậm** (vài giây mỗi lần Play) → Unity cho **tắt** nó để vào Play Mode nhanh. Nhưng khi tắt:
- ⚠️ **Static field KHÔNG tự reset** → giá trị "sót lại" từ lần Play trước → bug "ma".
- Event static không tự dọn → leak qua các phiên Play.

→ Senior phải viết code **không phụ thuộc domain reload**: tự reset static (`[RuntimeInitializeOnLoadMethod]`), hủy event đúng, không giả định static sạch.

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void ResetStatics() { /* reset static state thủ công */ }
```

---

## 5. Ứng dụng thực tế (Senior)

- **Chèn custom system vào Player Loop:** chạy logic ở phase chính xác (trước physics, sau render) cho framework/ECS/timing chính xác.
- **Kiểm soát khởi tạo:** bootstrap điều phối thứ tự thay vì dựa Execution Order ngầm.
- **Hỗ trợ "fast enter play mode":** code an toàn khi không có domain reload (giảm thời gian iterate cho cả team — đòn bẩy năng suất lớn).
- **Debug bug thứ tự:** hiểu lifecycle + execution order để lần bug "lúc chạy lúc không".

---

## 6. Lỗi thường gặp

- ❌ Phụ thuộc ngầm thứ tự `Awake`/`Update` giữa các object → bug không tái lập.
- ❌ Lạm dụng Script Execution Order (nhiều script ép thứ tự → rối, khó bảo trì).
- ❌ Giả định static luôn sạch → vỡ khi tắt domain reload (giá trị sót).
- ❌ Static event không hủy → leak qua các phiên Play Mode.
- ❌ Truy cập Singleton `.Instance` trước khi nó `Awake` → null lúc khởi động.
- ❌ Đặt logic phụ thuộc timing vào sai phase (vd cần trước physics nhưng để ở Update).

---

## 7. Best practices

- ✅ Thiết kế để **thứ tự thực thi không quan trọng**; dùng `Start` cho liên kết liên-object.
- ✅ Script Execution Order **tiết kiệm**, chỉ cho hạ tầng; ưu tiên bootstrap điều phối.
- ✅ Viết code **an toàn khi không có domain reload** (tự reset static, hủy event).
- ✅ Dùng `[RuntimeInitializeOnLoadMethod]` để khởi tạo/reset chủ động.
- ✅ Hiểu Player Loop để chèn system tùy biến đúng phase khi cần.
- ✅ Bật "fast enter play mode" cho team + làm code tương thích → tăng tốc iterate.

---

## 8. Liên kết
- [MonoBehaviour & Lifecycle](../intern/monobehaviour-lifecycle.md) — nền tảng lifecycle.
- [Serialization Internals](./serialization-internals.md) — domain reload dùng serialization.
- [C# Advanced](./csharp-advanced-performance.md) — static, memory.
- [Architecture](../../05-Technical-Deep-Dives/architecture.md) — bootstrap & khởi tạo.

---

[⬅️ Rendering Pipeline Internals](./rendering-pipeline-internals.md) | [C# Advanced & Performance ➡️](./csharp-advanced-performance.md)
