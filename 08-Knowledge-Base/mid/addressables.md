# 📦 Addressables (Quản Lý Asset Hiện Đại)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Memory Management](../../05-Technical-Deep-Dives/memory-management.md) · [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md)

---

## 1. Bản chất

**Addressables là hệ thống nạp/giải phóng asset theo nhu cầu, dựa trên "địa chỉ" (address) thay vì tham chiếu trực tiếp.** Bạn yêu cầu asset bằng một cái tên/khóa, hệ thống lo việc tìm, nạp (kể cả từ server), và quản lý bộ nhớ + dependency.

> 🔑 Thay vì "asset luôn nằm trong build và load hết vào RAM", Addressables cho phép **nạp khi cần, giải phóng khi xong** — và thậm chí **tải từ xa (server)** để cập nhật nội dung không cần update app. Đây là chuẩn thay thế cho `Resources` (lỗi thời) và AssetBundle thủ công.

---

## 2. Vấn đề nó giải quyết

### Vấn đề với cách cũ
- **Tham chiếu trực tiếp** (kéo prefab vào field): asset bị nạp cùng scene/prefab cha → không kiểm soát thời điểm, dễ phình RAM.
- **`Resources` folder:** ⚠️ nạp **toàn bộ** vào build, **không unload** chọn lọc, phình build size & RAM. Unity khuyến cáo **tránh**.
- **AssetBundle thủ công:** mạnh nhưng quản lý dependency & lifecycle cực thủ công, dễ sai.

### Addressables giải
- Nạp/giải phóng **chọn lọc theo nhu cầu** → kiểm soát RAM (quan trọng cho mobile).
- Quản lý **dependency tự động**.
- **Remote content:** tải asset từ server → cập nhật/bổ sung nội dung (DLC, live event) **không cần update app**.
- Giảm **build size** ban đầu (asset không cần thiết không nằm trong build gốc).

---

## 3. Khái niệm cốt lõi

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **Address** | "Tên" để yêu cầu asset (vd `"boss_dragon"`) |
| **Group** | Nhóm asset đóng gói cùng nhau (local/remote) |
| **Label** | Nhãn để nạp nhiều asset cùng loại |
| **Content Catalog** | "Danh bạ" ánh xạ address → vị trí asset thật |
| **AsyncOperationHandle** | "Vé" theo dõi tác vụ nạp + để giải phóng |

---

## 4. Cách dùng & vòng đời (quan trọng nhất: GIẢI PHÓNG)

```csharp
// Nạp một asset (bất đồng bộ)
AsyncOperationHandle<GameObject> handle =
    Addressables.LoadAssetAsync<GameObject>("boss_dragon");
GameObject prefab = await handle.Task;     // hoặc handle.Completed += ...
Instantiate(prefab);

// ⚠️ PHẢI giải phóng khi không dùng nữa — nếu không → MEMORY LEAK
Addressables.Release(handle);

// Instantiate trực tiếp (tự quản lý ref):
var instHandle = Addressables.InstantiateAsync("enemy");
// ...sau:
Addressables.ReleaseInstance(instHandle);   // hủy instance + giảm ref
```

> 🔑 **Reference counting:** Addressables đếm số nơi đang dùng một asset. Mỗi `Load` tăng đếm, mỗi `Release` giảm. Khi đếm về 0 → asset được giải phóng khỏi RAM. **Quên `Release` = đếm không về 0 = leak.** Đây là lỗi #1 với Addressables.

---

## 5. Ứng dụng thực tế

- **Mobile:** nạp asset theo màn/khu vực, giải phóng khi rời → giữ RAM thấp (tránh crash).
- **Remote content / DLC:** tải nhân vật/skin/level mới từ server sau khi ra mắt.
- **Giảm build size ban đầu** (tải nội dung khi cần).
- **Live ops:** đổi nội dung sự kiện theo mùa không cần update app.
- **Streaming open world:** nạp/giải phóng vùng theo vị trí người chơi.
- **A/B asset, localization theo vùng.**

---

## 6. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Kiểm soát RAM & build size | Phức tạp hơn tham chiếu trực tiếp |
| Remote content / update không cần app | Phải quản lý Release đúng (dễ leak) |
| Quản lý dependency tự động | Build/catalog setup cần học |
| Thay thế chuẩn cho Resources/AssetBundle | Async → code phức tạp hơn (await) |

---

## 7. Lỗi thường gặp

### ❌ Quên `Release` / `ReleaseInstance` → MEMORY LEAK
Reference count không về 0 → asset ở mãi trong RAM. **Luôn cặp Load↔Release.** Xem [Memory Management](../../05-Technical-Deep-Dives/memory-management.md).
### ❌ Vẫn dùng `Resources` folder cho asset lớn
Lỗi thời, phình build/RAM. Chuyển sang Addressables.
### ❌ Load lại asset đã load (không cache handle)
Tăng ref nhiều lần, quản lý rối. Cache handle, tái dùng.
### ❌ Quên build Addressables content trước khi build player
Catalog cũ → asset thiếu/lỗi runtime. Build content đúng quy trình (xem [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md)).
### ❌ Trộn remote/local group sai → asset không tải được trên thiết bị
Cấu hình group & profile cẩn thận, test trên thiết bị thật.

---

## 8. Best practices

- ✅ **Luôn `Release`** mọi thứ đã `Load` (cặp đôi như event subscribe/unsubscribe).
- ✅ Dùng Addressables thay `Resources` cho dự án nghiêm túc/mobile.
- ✅ Tổ chức **Group** hợp lý (local cho thứ cần ngay, remote cho nội dung cập nhật).
- ✅ Cache handle; tránh load trùng.
- ✅ Build Addressables content đúng quy trình trước khi build player.
- ✅ Test memory trên **thiết bị thật** (Profiler) — kiểm chứng giải phóng đúng.
- ✅ Cân nhắc thư viện/Addressables wrapper để quản lý lifecycle an toàn.

---

## 9. Liên kết
- [Memory Management](../../05-Technical-Deep-Dives/memory-management.md) — asset memory, leak, reference counting.
- [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md) — build content, remote, live ops.
- [Async / UniTask](./async-await-unitask.md) — Load là async, await được.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — RAM & loading.

---

[⬅️ Async / UniTask](./async-await-unitask.md) | [Job System & Burst ➡️](./job-system-burst.md)
