# ⏳ Coroutine

[⬅️ Knowledge Base](../README.md) | Liên quan: [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md)

> Coroutine bị hiểu lầm nhiều nhất là "chạy đa luồng / song song". **KHÔNG PHẢI.** Hiểu đúng bản chất sẽ tránh vô số ngộ nhận.

---

## 1. Bản chất

**Coroutine là một hàm có thể "tạm dừng" giữa chừng và "tiếp tục" ở frame sau, từ đúng chỗ nó dừng.** Nó cho phép viết logic **trải dài theo thời gian** mà trông như code tuần tự bình thường.

> 🔑 **Cực kỳ quan trọng:** Coroutine **KHÔNG phải đa luồng (thread).** Nó chạy trên **chính main thread**, xen kẽ với Update. "Tạm dừng" nghĩa là *trả quyền điều khiển lại cho Unity* rồi *được gọi lại sau*, **không** phải "chạy ngầm song song". Mọi thứ vẫn tuần tự trên một luồng.

Ẩn dụ: bạn đang đọc sách (main thread). Coroutine giống việc **kẹp bookmark** ở trang đang đọc, đi làm việc khác, rồi quay lại đọc tiếp **từ đúng chỗ đã kẹp** — chứ không phải thuê người khác đọc song song.

---

## 2. Vấn đề nó giải quyết

Nhiều logic game cần **diễn ra theo thời gian**, không phải tức thì:
- "Đợi 2 giây rồi mới nổ."
- "Mờ dần màn hình trong 1 giây."
- "Spawn một kẻ địch mỗi 3 giây."
- "Chạy animation từng bước, đợi mỗi bước xong."

Không có coroutine, bạn phải tự đếm giờ trong `Update` bằng biến trạng thái → code rối, đầy `if timer >= ...`. Coroutine cho viết logic theo-thời-gian **gọn và đọc như tuần tự**:

```csharp
// Không coroutine: phải quản lý timer thủ công trong Update (rối)
// Có coroutine: đọc như kể chuyện
IEnumerator Explode() {
    ShowWarning();
    yield return new WaitForSeconds(2f); // "đợi 2 giây" — tự nhiên
    Boom();
}
```

---

## 3. Cách hoạt động bên trong: Iterator + yield

Coroutine được xây trên cơ chế **`IEnumerator` / `yield`** của C# (vốn dùng để duyệt tuần tự). Unity "mượn" cơ chế này:

- Hàm coroutine trả kiểu `IEnumerator`.
- Mỗi `yield return X` = **"dừng ở đây, X cho Unity biết KHI NÀO gọi lại tôi"**.
- Unity giữ coroutine trong một danh sách và mỗi frame **hỏi**: "coroutine này đã tới lúc chạy tiếp chưa?". Nếu rồi → chạy tiếp từ sau `yield` đó tới `yield` kế.

### Các loại `yield` (điều khiển "khi nào tiếp tục")
```csharp
yield return null;                       // tiếp tục ở FRAME SAU
yield return new WaitForSeconds(2f);     // đợi 2 giây (theo thời gian game, bị Time.timeScale ảnh hưởng)
yield return new WaitForSecondsRealtime(2f); // đợi 2 giây thật (kệ pause/timeScale)
yield return new WaitForFixedUpdate();   // tới FixedUpdate kế
yield return new WaitForEndOfFrame();    // cuối frame (sau render)
yield return new WaitUntil(() => isReady);   // đợi tới khi điều kiện đúng
yield return new WaitWhile(() => isLoading);  // đợi trong khi điều kiện còn đúng
yield return StartCoroutine(Other());    // đợi coroutine khác xong rồi mới tiếp
```

### Vòng đời gắn với GameObject
Coroutine **gắn với MonoBehaviour đã khởi động nó**. Nếu GameObject đó **bị tắt (`SetActive(false)`) hoặc hủy**, coroutine **dừng luôn**. Đây vừa là tính năng vừa là bẫy (mục 7).

---

## 4. Cú pháp & ví dụ

```csharp
// 1. Hàm coroutine trả IEnumerator
IEnumerator FadeOut()
{
    float t = 0;
    while (t < 1f)
    {
        t += Time.deltaTime;       // chạy dần qua nhiều frame
        SetAlpha(1 - t);
        yield return null;          // đợi tới frame sau rồi lặp tiếp
    }
    SetAlpha(0);
}

// 2. Khởi động bằng StartCoroutine
void Start() { StartCoroutine(FadeOut()); }

// 3. Spawn lặp lại theo thời gian
IEnumerator SpawnLoop()
{
    while (true)                    // vòng lặp vô hạn — an toàn vì có yield
    {
        Spawn();
        yield return new WaitForSeconds(3f); // mỗi 3 giây một lần
    }
}

// 4. Dừng coroutine
Coroutine handle;
void Begin() { handle = StartCoroutine(SpawnLoop()); }
void Stop()  { if (handle != null) StopCoroutine(handle); }
// hoặc StopAllCoroutines();
```

> ⚠️ `while(true)` trong coroutine **an toàn** chỉ vì có `yield` (nhường quyền mỗi vòng). `while(true)` thường (không yield) sẽ **treo game**.

---

## 5. Ứng dụng thực tế

- **Đợi / delay:** nổ sau X giây, hiện thông báo rồi tự ẩn.
- **Hiệu ứng dần dần:** fade, di chuyển mượt, đếm điểm tăng dần (không cần Tween).
- **Spawn theo nhịp:** wave kẻ địch, sinh vật phẩm.
- **Chuỗi sự kiện (sequence):** cutscene đơn giản, tutorial từng bước (đợi bước này xong mới sang bước kia).
- **Tải dần / chia việc nặng ra nhiều frame:** tránh khựng khi xử lý lớn.

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Viết logic theo-thời-gian gọn, dễ đọc | Không phải đa luồng (không tăng tốc tính toán nặng) |
| Tránh "rừng timer" trong Update | Dừng khi GameObject tắt/hủy (dễ quên) |
| Có sẵn, không cần thư viện | Khó trả về kết quả / bắt lỗi so với async |
| Kiểm soát "khi nào tiếp tục" linh hoạt | `WaitForSeconds` tạo rác nhỏ nếu lạm dụng (cache lại được) |

### Coroutine vs async/await (so sánh nhanh)
- **Coroutine:** gắn Unity lifecycle, hợp logic game theo frame, đơn giản. Dừng theo GameObject.
- **async/await (+ UniTask):** mạnh cho tác vụ I/O, mạng, trả kết quả, xử lý lỗi; không tự dừng theo GameObject. Học ở [Mid](../../03-Mid-Level/skills.md).

---

## 7. Lỗi thường gặp

### ❌ Tưởng coroutine chạy song song / đa luồng
Không. Nó vẫn trên main thread. Việc tính toán nặng trong coroutine **vẫn làm giật** nếu không `yield` để chia nhỏ.

### ❌ Quên `StartCoroutine` (gọi hàm trực tiếp)
```csharp
FadeOut();                 // SAI: chỉ tạo iterator, KHÔNG chạy gì cả
StartCoroutine(FadeOut()); // ĐÚNG
```
Gọi trực tiếp hàm `IEnumerator` **không chạy** thân hàm — đây là bẫy im lặng khó nhận ra.

### ❌ Coroutine "tự nhiên dừng"
GameObject bị `SetActive(false)` hoặc Destroy → coroutine dừng giữa chừng. Nếu cần chạy độc lập, đặt coroutine trên một object luôn active (vd manager).

### ❌ Khởi động trùng nhiều coroutine
Bấm nút nhiều lần → nhiều coroutine `FadeOut` chạy chồng. Lưu handle và `StopCoroutine` cái cũ trước khi start cái mới, hoặc dùng cờ.

### ❌ Dùng `WaitForSeconds` với `Time.timeScale = 0` (đang pause)
`WaitForSeconds` theo **thời gian game** → khi pause (`timeScale=0`) nó **đứng yên mãi**. Dùng `WaitForSecondsRealtime` cho UI/menu lúc pause.

### ❌ Tạo `new WaitForSeconds` mỗi vòng lặp
Sinh rác nhỏ. Cache lại nếu dùng nhiều:
```csharp
WaitForSeconds wait = new WaitForSeconds(1f); // tạo 1 lần
while (true) { ...; yield return wait; }       // tái dùng
```

---

## 8. Best practices

- ✅ Dùng coroutine cho logic **trải theo thời gian** (delay, fade, sequence, spawn nhịp).
- ✅ Luôn `StartCoroutine(...)`, không gọi hàm trực tiếp.
- ✅ Lưu handle để `StopCoroutine` khi cần; tránh chạy chồng.
- ✅ Đặt coroutine "nền" (spawn loop, timer toàn cục) trên object luôn active.
- ✅ `WaitForSecondsRealtime` cho UI/menu khi game có thể pause.
- ✅ Cache `WaitForSeconds` nếu lặp nhiều.
- ✅ Tác vụ nặng (tính toán lớn) → chia nhỏ bằng `yield`, hoặc cân nhắc Job System (không phải coroutine).
- ✅ Tác vụ mạng/I-O/trả kết quả → cân nhắc async/await + UniTask khi lên Mid.

---

## 9. Liên kết
- [MonoBehaviour & Lifecycle](./monobehaviour-lifecycle.md) — coroutine xen vào game loop, gắn vòng đời object.
- async/await, UniTask, Job System — [Mid skills](../../03-Mid-Level/skills.md).
- Object pooling thay cho spawn/destroy trong coroutine spawn — [Instantiate & Destroy](./instantiate-destroy.md).

---

[⬅️ Prefab](./prefab.md) | [Knowledge Base ➡️](../README.md)
