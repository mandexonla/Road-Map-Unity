# ⚡ Async / Await & UniTask

[⬅️ Knowledge Base](../README.md) | Liên quan: [Coroutine](../intern/coroutine.md) · [Job System & Burst](./job-system-burst.md)

> Đọc [Coroutine](../intern/coroutine.md) trước. Trang này so sánh async/await với coroutine và giới thiệu UniTask — chuẩn công nghiệp cho async trong Unity.

---

## 1. Bản chất

**async/await là cơ chế C# để viết code bất đồng bộ (chạy việc tốn thời gian mà không chặn luồng) trông như code tuần tự.** Giống coroutine ở chỗ "tạm dừng & tiếp tục", nhưng mạnh hơn về **trả kết quả, xử lý lỗi, và làm việc với I/O/mạng**.

> 🔑 Điểm chung với coroutine: **KHÔNG phải đa luồng mặc định** — `await` trên main thread vẫn nhường quyền rồi tiếp tục, không tự chạy song song. Khác biệt: async/await trả về **giá trị** (`Task<T>`), bắt lỗi bằng **try/catch** tự nhiên, và tích hợp tốt với API mạng/file (vốn trả `Task`).

---

## 2. Vấn đề nó giải quyết (so với Coroutine)

Coroutine tuyệt cho logic game theo frame, nhưng yếu ở:
- **Trả kết quả:** coroutine không `return` giá trị dễ dàng.
- **Xử lý lỗi:** try/catch quanh `yield` hạn chế.
- **I/O & mạng:** API hiện đại (HTTP, file async) trả `Task`, hợp await hơn.
- **Kết hợp nhiều tác vụ:** chờ nhiều việc xong (`WhenAll`) dễ với Task.

```csharp
// async trả kết quả + bắt lỗi tự nhiên
async Task<PlayerData> LoadPlayerAsync(string id) {
    try {
        var json = await httpClient.GetStringAsync(url);   // chờ mạng, không chặn
        return JsonUtility.FromJson<PlayerData>(json);     // TRẢ kết quả
    } catch (Exception e) {
        Debug.LogError($"Load failed: {e.Message}");        // bắt lỗi dễ
        return null;
    }
}
```

---

## 3. ⚠️ Vấn đề của async/await "thuần" trong Unity → vì sao cần UniTask

`Task` của .NET **không thiết kế cho Unity**:
- **Sinh rác (GC alloc):** mỗi `Task` cấp phát → giật nếu dùng nhiều.
- **Không tự gắn Unity lifecycle:** `Task` không tự dừng khi GameObject bị hủy → có thể chạy tiếp vào object đã chết (nguy hiểm).
- **Không tự về main thread** đúng cách trong mọi trường hợp.
- Thiếu các "chờ theo frame Unity" (PlayerLoop timing).

### UniTask — giải pháp chuẩn
**UniTask** (thư viện mã nguồn mở Cysharp) là thay thế `Task` **tối ưu cho Unity**:
- **Zero allocation** (struct-based) → không sinh rác như Task.
- Tích hợp **PlayerLoop** (await theo Update/FixedUpdate/frame).
- Hỗ trợ **CancellationToken** gắn vòng đời GameObject (tự hủy khi object destroy).
- Chuyển đổi qua lại với coroutine, AsyncOperation (Addressables, SceneManager...).

```csharp
async UniTask FadeAndLoad() {
    await Fade(1f);
    await SceneManager.LoadSceneAsync("Game");   // await thẳng AsyncOperation
    await UniTask.Delay(1000);                     // chờ 1s, không sinh rác
}
```

---

## 4. Khi nào dùng cái nào?

| Tình huống | Nên dùng |
|-----------|----------|
| Logic game theo frame (fade, spawn nhịp, sequence) | Coroutine hoặc UniTask đều ổn |
| Tải file/mạng, trả kết quả, bắt lỗi | **async/await (UniTask)** |
| Chờ nhiều tác vụ song song (`WhenAll`) | **UniTask** |
| Cần zero-GC + hủy theo lifecycle | **UniTask** |
| Tính toán nặng song song (CPU) | **Job System + Burst** (không phải async) — xem [Job System](./job-system-burst.md) |
| Game jam / đơn giản, đã quen coroutine | Coroutine |

> 📌 async/await/UniTask **không** tăng tốc tính toán nặng (vẫn main thread). Muốn song song hóa CPU thật → Job System/threads.

---

## 5. ⚠️ Cẩn thận về Threading

- API Unity (Transform, GameObject, hầu hết) **chỉ gọi được trên main thread**. `await` thường quay về main thread (với UniTask/context đúng), nhưng nếu chạy việc trên thread khác (Task.Run, Job) → **không** chạm API Unity ở đó.
- Tính toán thuần (toán, xử lý data không-Unity) có thể đưa sang thread/Job; thao tác scene phải về main thread.

---

## 6. Ưu điểm / Nhược điểm

| | async/await (UniTask) | Coroutine |
|--|------------------------|-----------|
| Trả kết quả | ✅ Dễ (`UniTask<T>`) | ❌ Khó |
| Xử lý lỗi | ✅ try/catch tự nhiên | ⚠️ Hạn chế |
| I/O & mạng | ✅ Mạnh | ⚠️ Vụng |
| GC | ✅ UniTask zero-alloc (Task thì alloc) | Có chút (WaitForSeconds) |
| Học | ⚠️ Khó hơn | ✅ Dễ |
| Tự dừng theo GameObject | ⚠️ Cần CancellationToken | ✅ Tự (coroutine) |

---

## 7. Lỗi thường gặp

- ❌ Dùng `Task` thuần trong Unity → GC + không hủy theo lifecycle. Dùng **UniTask**.
- ❌ `async void` (trừ event handler) → không await/bắt lỗi được, nuốt exception. Dùng `async UniTask`/`Task`.
- ❌ Quên **CancellationToken** → tác vụ chạy tiếp vào object đã hủy → lỗi/leak.
- ❌ Chạm API Unity từ thread khác (Task.Run) → crash. Về main thread trước.
- ❌ Tưởng async tăng tốc tính toán nặng (không — vẫn một luồng).
- ❌ `await` trong hot path mỗi frame không cần thiết.

---

## 8. Best practices

- ✅ Unity → dùng **UniTask** thay `Task` thuần.
- ✅ Dùng async cho **I/O, mạng, tải, chuỗi tác vụ trả kết quả**; coroutine cho logic game đơn giản theo frame.
- ✅ Luôn truyền **CancellationToken** gắn lifecycle (hủy khi object destroy).
- ✅ Tránh `async void` (trừ event handler bắt buộc).
- ✅ Thao tác API Unity trên main thread.
- ✅ Tính toán nặng CPU → [Job System + Burst](./job-system-burst.md), không async.

---

## 9. Liên kết
- [Coroutine](../intern/coroutine.md) — nền tảng, so sánh.
- [Job System & Burst](./job-system-burst.md) — song song hóa CPU thật.
- [Addressables](./addressables.md) — load async (await được).
- [Garbage Collection](../junior/garbage-collection-basics.md) — vì sao Task thuần xấu.

---

[⬅️ Data-Driven Design](./data-driven-design.md) | [Addressables ➡️](./addressables.md)
