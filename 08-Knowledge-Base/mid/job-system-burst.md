# 🧵 Job System & Burst (DOTS cơ bản)

[⬅️ Knowledge Base](../README.md) | Liên quan: [Performance](../../05-Technical-Deep-Dives/performance.md) · [Async / UniTask](./async-await-unitask.md)

> Đây là cách Unity cho phép **tính toán song song thật trên nhiều CPU core** một cách an toàn. Chỉ học khi bạn có bài toán cần nó — đừng dùng cho mọi thứ.

---

## 1. Bản chất

- **Job System** cho phép chạy code trên **nhiều luồng (CPU core)** một cách **an toàn** — Unity quản lý threading, tránh race condition giúp bạn.
- **Burst Compiler** dịch code job sang mã máy **siêu tối ưu** (nhanh hơn nhiều lần code C# thường).
- Cùng với **ECS**, chúng tạo thành **DOTS** (Data-Oriented Technology Stack).

> 🔑 Ý tưởng: code game thường chạy trên **một luồng** (main thread). Máy có 4-8+ core nhưng ngồi không. Job System tận dụng các core đó cho việc tính toán nặng. Burst làm mỗi core chạy nhanh hơn nữa. Kết quả: xử lý hàng nghìn-triệu phần tử mượt.

---

## 2. Vấn đề nó giải quyết

Một số game cần tính toán **khổng lồ mỗi frame**: hàng nghìn đơn vị RTS, hàng vạn viên đạn bullet-hell, mô phỏng vật lý/hạt lớn, pathfinding đám đông. Code main-thread thông thường **không kịp** → giật.

Job System + Burst song song hóa + tối ưu → làm được những thứ bất khả thi với cách thường.

> ⚠️ Nhưng: phần lớn game **không cần** điều này. Đây là công cụ cho bài toán **đặc thù về hiệu năng số lượng lớn**, không phải mặc định.

---

## 3. Cách hoạt động (khái niệm)

### Data-Oriented (khác Object-Oriented)
Chìa khóa hiệu năng: **bố trí dữ liệu liền mạch trong bộ nhớ** (cache-friendly) thay vì rải rác như object thường. CPU đọc data liền kề cực nhanh. Đây là triết lý "DOD" (Data-Oriented Design).

### Job — đơn vị công việc
```csharp
// Một job xử lý song song nhiều phần tử
[BurstCompile]
struct MoveJob : IJobParallelFor {
    public float deltaTime;
    public NativeArray<float3> positions;   // dữ liệu liền mạch
    public NativeArray<float3> velocities;

    public void Execute(int i) {            // chạy cho từng phần tử, song song
        positions[i] += velocities[i] * deltaTime;
    }
}
// Lập lịch: Unity chia việc lên nhiều core
var job = new MoveJob { deltaTime = Time.deltaTime, positions = pos, velocities = vel };
JobHandle handle = job.Schedule(pos.Length, 64);
handle.Complete();
```

### Native Collections (bộ nhớ thủ công)
Job dùng `NativeArray`, `NativeList`... — bộ nhớ **không qua GC**, nhưng **phải tự `Dispose`** (nếu không → leak). Đây là đánh đổi: hiệu năng cao + trách nhiệm quản lý.

### An toàn threading
Job System có **Safety System** phát hiện race condition (hai job ghi cùng data) lúc dev → ngăn bug threading kinh điển.

---

## 4. Khi nào dùng / KHÔNG dùng

| ✅ Cân nhắc Job/Burst/ECS | ❌ Không cần |
|---------------------------|-------------|
| Hàng nghìn+ phần tử update mỗi frame | Game thường, ít object |
| RTS, autobattler, bullet-hell, simulation | Logic gameplay thông thường |
| Mô phỏng vật lý/hạt/đám đông lớn | UI, turn-based, puzzle nhỏ |
| Pathfinding/AI số lượng lớn | Khi chưa đo thấy CPU là bottleneck |

> 🎯 **Quy tắc:** Đo bằng [Profiler](../../05-Technical-Deep-Dives/performance.md) trước. Chỉ dùng khi CPU thực sự là điểm nghẽn vì **số lượng lớn**. ECS/DOTS phức tạp hơn nhiều — chi phí học & bảo trì cao.

---

## 5. Ưu điểm / Nhược điểm

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Hiệu năng cực cao (đa core + Burst) | Phức tạp, dốc học |
| Xử lý số lượng khổng lồ mượt | Tư duy data-oriented khác hẳn OOP |
| An toàn threading (Safety System) | Native Collections phải tự Dispose |
| Không qua GC (Native) | Over-engineer nếu không cần quy mô lớn |

---

## 6. Lỗi thường gặp

- ❌ Dùng DOTS/Job cho game không cần → tốn công vô ích, code khó.
- ❌ Quên `Dispose` Native Collections → memory leak.
- ❌ Chạm API Unity (Transform, GameObject) trong job → cấm (job không trên main thread). Dùng `TransformAccessArray` hoặc ECS.
- ❌ Không `Complete()` job trước khi dùng kết quả → đọc data chưa xong.
- ❌ Bỏ qua tư duy data-oriented → không đạt hiệu năng kỳ vọng.
- ❌ Áp dụng trước khi đo (premature optimization).

---

## 7. Best practices

- ✅ **Đo trước** — chỉ dùng khi bottleneck là CPU vì số lượng lớn.
- ✅ Học **tư duy data-oriented** (bố trí data liền mạch) — đó là gốc hiệu năng.
- ✅ Luôn `Dispose` Native Collections (dùng `using` hoặc Allocator phù hợp).
- ✅ Bật **Burst** cho job tính toán nặng.
- ✅ Không chạm API Unity trong job; dùng cơ chế chuyên (TransformAccess, ECS).
- ✅ Bắt đầu với Job System đơn lẻ trước khi nhảy vào full ECS.
- ✅ Cân nhắc chi phí học & bảo trì so với lợi ích — đừng theo trend.

---

## 8. Liên kết
- [Performance](../../05-Technical-Deep-Dives/performance.md) — đo trước, CPU bottleneck, DOTS khi nào.
- [Memory Management](../../05-Technical-Deep-Dives/memory-management.md) — Native Collections.
- [Async / UniTask](./async-await-unitask.md) — async ≠ song song hóa CPU (khác Job).
- [Gameplay Systems](../../05-Technical-Deep-Dives/gameplay-systems.md) — DOTS gameplay quy mô lớn.

---

[⬅️ Addressables](./addressables.md) | [Unit Testing ➡️](./unit-testing.md)
