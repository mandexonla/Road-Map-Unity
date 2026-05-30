# 🔔 Observer / Event System Pattern

[⬅️ Design Patterns](./design-patterns.md) | Liên quan: [Delegate & Event](./delegates-events.md) · [ScriptableObject](./scriptableobject.md)

---

## 1. Bản chất

**Observer pattern: một đối tượng (subject) phát thông báo khi có gì đó xảy ra, và nhiều đối tượng khác (observers) đăng ký nghe để phản ứng — mà subject KHÔNG cần biết observers là ai.**

> 🔑 Ẩn dụ: kênh YouTube (subject) đăng video mới → mọi subscriber (observer) nhận thông báo. Kênh **không biết** từng subscriber là ai, chỉ "phát sóng". Subscriber tự đăng ký/hủy bất cứ lúc nào.

Đây là pattern hiện thực hóa nguyên tắc **loose coupling** mạnh nhất — cơ sở của kiến trúc **event-driven**.

---

## 2. Vấn đề nó giải quyết

Khi player chết, nhiều hệ thống phải phản ứng (UI, audio, score, analytics, achievements...). Nếu player **gọi thẳng** từng cái → coupling chặt, thêm hệ thống phải sửa player (xem ví dụ trong [Delegate & Event](./delegates-events.md)).

Observer đảo ngược: player chỉ **phát** "tôi chết", ai quan tâm **tự nghe**. Thêm/bớt observer **không đụng** player → tuân nguyên tắc **Open/Closed**.

---

## 3. Ba cách hiện thực trong Unity (từ đơn giản → kiến trúc)

### 🅰️ C# `event` (đơn giản, code-to-code)
```csharp
public class Health : MonoBehaviour {
    public event Action OnDied;            // subject phát
    void Die() => OnDied?.Invoke();
}
// Observer:
void OnEnable()  => health.OnDied += ShowGameOver;
void OnDisable() => health.OnDied -= ShowGameOver;   // nhớ hủy!
```
Phù hợp: quan hệ trực tiếp giữa các script. Chi tiết cú pháp: [Delegate & Event](./delegates-events.md).

### 🅱️ `UnityEvent` (designer nối trong Inspector)
```csharp
public UnityEvent onDied;     // hiện trong Inspector, kéo-thả hàm vào
void Die() => onDied.Invoke();
```
Phù hợp: cho designer nối logic không cần code. Chậm hơn C# event.

### 🅲 ScriptableObject Event Channel (kiến trúc sạch nhất, dự án lớn)
SO làm "kênh" trung gian → các hệ thống **hoàn toàn không biết nhau**, chỉ biết kênh chung. Xem chi tiết [ScriptableObject](./scriptableobject.md) mục Event Channel. Phù hợp: dự án lớn, muốn loose coupling tối đa + designer nối được.

> 💡 Chọn theo nhu cầu: nhỏ → C# event; cần designer → UnityEvent; kiến trúc lớn → SO channel.

---

## 4. Cách hoạt động bên trong

- Subject giữ **danh sách observer** (qua invocation list của delegate, hoặc list listener).
- Khi sự kiện xảy ra → subject **duyệt danh sách, gọi từng observer**.
- Observer **tự thêm/gỡ** mình khỏi danh sách (`+=`/`-=` hoặc Register/Unregister).
- Subject **không giữ kiểu cụ thể** của observer → không phụ thuộc.

---

## 5. Ứng dụng thực tế

- **Phản ứng dây chuyền:** chết, lên level, nhặt đồ, hoàn thành quest → nhiều hệ thống phản ứng.
- **UI reactive:** health bar, score, minimap nghe event thay vì hỏi mỗi frame (tiết kiệm + sạch).
- **Achievement/analytics:** lặng lẽ nghe mọi sự kiện game mà không ai biết.
- **Tách input:** input phát "Jump/Fire", gameplay nghe.
- **Decoupling hệ thống lớn:** combat phát "DamageDealt", nhiều hệ thống (UI, audio, VFX, stats) cùng phản ứng.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Loose coupling tối đa | Khó lần luồng ("ai phát? ai nghe?") |
| Mở rộng không sửa subject (Open/Closed) | Quên hủy đăng ký → **memory leak** |
| Reactive — không polling mỗi frame | Quá nhiều event → "event spaghetti" |
| Nhiều observer độc lập | Thứ tự gọi observer không đảm bảo |

---

## 7. Lỗi thường gặp

### ❌ Quên hủy đăng ký → MEMORY LEAK (lỗi #1)
Luôn cặp `OnEnable` (đăng ký) ↔ `OnDisable`/`OnDestroy` (hủy). Xem [Delegate & Event](./delegates-events.md) và [Memory Management](../../05-Technical-Deep-Dives/memory-management.md).

### ❌ Observer phụ thuộc thứ tự được gọi
Đừng giả định observer A chạy trước B. Nếu cần thứ tự → thiết kế lại (không dùng observer cho cái cần thứ tự chặt).

### ❌ Lạm dụng → mọi thứ là event → không lần được logic
Khi mọi giao tiếp là event ngầm, debug thành ác mộng. Dùng cho **quan hệ một-nhiều** thật sự; quan hệ trực tiếp 1-1 đơn giản thì gọi thẳng cũng được.

### ❌ Observer làm việc nặng trong callback
Event phát → mọi observer chạy đồng bộ ngay. Observer nặng làm khựng. Giữ callback nhẹ.

---

## 8. Best practices

- ✅ **Luôn hủy đăng ký** trong `OnDisable`/`OnDestroy`.
- ✅ Dùng cho quan hệ **một-nhiều** (một sự kiện, nhiều phản ứng).
- ✅ Truyền dữ liệu cần thiết qua tham số event (observer không phải đi hỏi lại).
- ✅ Chọn cơ chế đúng tầm: C# event (nhỏ) / UnityEvent (designer) / SO channel (lớn).
- ✅ Giữ callback nhẹ & không phụ thuộc thứ tự.
- ✅ Đặt tên sự kiện rõ: `OnPlayerDied`, `OnWaveCompleted`.

---

## 9. Liên kết
- [Delegate & Event](./delegates-events.md) — cơ chế C# nền dưới Observer.
- [ScriptableObject](./scriptableobject.md) — event channel kiến trúc.
- [Memory Management](../../05-Technical-Deep-Dives/memory-management.md) — leak do quên hủy.
- [Design Patterns](./design-patterns.md) — bức tranh tổng quan.

---

[⬅️ Singleton](./singleton.md) | [State Machine ➡️](./state-machine.md)
