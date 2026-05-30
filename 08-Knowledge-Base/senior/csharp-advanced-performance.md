# ⚙️ C# Nâng Cao & Hiệu Năng

[⬅️ Knowledge Base](../README.md) | Liên quan: [Memory Model](./memory-model.md) · [Performance](../../05-Technical-Deep-Dives/performance.md)

> Các kỹ thuật C# mức sâu để viết code hiệu năng cao khi cần. Dùng **có đo lường & có chọn lọc** — không phải mọi nơi.

---

## 1. Bản chất

Ở mức Senior, bạn cần hiểu code C# **biên dịch & chạy thế nào** để viết code nhanh khi cần: tránh allocation, tận dụng stack, thao tác bộ nhớ trực tiếp an toàn. Đây là công cụ cho **hot path & hệ thống quy mô lớn**, không phải phong cách mặc định.

> 🔑 Nguyên tắc xuyên suốt: **đo trước (Profiler), tối ưu chỗ thật sự nghẽn.** Code hiệu năng cao thường **khó đọc hơn** — chỉ trả giá đó ở nơi xứng đáng (10% code chiếm 90% thời gian). Áp dụng mọi nơi = premature optimization = code tệ.

---

## 2. `Span<T>` & `Memory<T>` — thao tác bộ nhớ không alloc

`Span<T>` là "cửa sổ" nhìn vào một vùng bộ nhớ (array, stack, native) **mà không sao chép**:
```csharp
Span<int> numbers = stackalloc int[16];   // cấp trên STACK — không GC
ReadOnlySpan<char> slice = text.AsSpan(0, 5);  // "lát cắt" string không tạo string mới
```
- Cho phép xử lý sub-array, parse, buffer **không sinh rác**.
- `stackalloc` cấp bộ nhớ tạm trên stack (nhanh, tự dọn, không GC) — cho buffer nhỏ.
- `ref struct` (như `Span`) **chỉ sống trên stack** → không box, không lên heap được (giới hạn dùng nhưng an toàn hiệu năng).

---

## 3. `in` / `ref` / `out` — kiểm soát truyền tham số

```csharp
void Apply(in BigStruct data) { }   // truyền tham chiếu READ-ONLY → không copy struct lớn
void Modify(ref int value) { }       // truyền tham chiếu, sửa được
bool TryGet(out int result) { }      // trả thêm giá trị qua tham số
```
- `in`: tránh **copy struct lớn** khi truyền (xem cạm bẫy struct ở [Memory Model](./memory-model.md)) mà vẫn an toàn (read-only).
- `ref`: truyền tham chiếu để sửa tại chỗ.
- `ref return` / `ref local`: trả/giữ tham chiếu trực tiếp tới phần tử (vd sửa phần tử struct trong array không copy).

---

## 4. Tránh allocation ẩn (kỹ năng Senior)

Senior "ngửi" được allocation ngầm:
| Nguồn ẩn | Cách tránh |
|----------|-----------|
| **Boxing** (value → object/interface) | Generic, tránh non-generic API |
| **Closure** (lambda bắt biến) | Cache delegate, tránh capture trong hot path |
| **Iterator** (`yield`, LINQ) | Vòng lặp thủ công trong hot path |
| **`params` array** | Overload cố định tham số |
| **String concat/interpolation** | `StringBuilder`, cache |
| **`foreach` trên interface** (`IEnumerable`) | Lặp trên kiểu cụ thể (struct enumerator) |
| **Delegate gán mới mỗi lần** | Cache delegate static |

> 💡 Dùng **Profiler (GC Alloc column)** và phân tích IL nếu cần để phát hiện alloc ẩn — đừng đoán.

---

## 5. `struct` enumerator, collection & API không-alloc

- Một số collection (`List<T>`) có **struct enumerator** → `foreach` không alloc. Nhưng cast sang `IEnumerable` → box enumerator → alloc. Giữ kiểu cụ thể.
- API Unity có biến thể không-alloc: `Physics.RaycastNonAlloc`, `GetComponents(list)` (truyền list để fill thay vì trả mảng mới).
- Pre-allocate buffer & tái dùng thay vì cấp mỗi lần.

---

## 6. `unsafe` & pointer (chỉ khi thật cần)

```csharp
unsafe { fixed (byte* p = buffer) { /* thao tác con trỏ */ } }
```
- Cho hiệu năng tối đa với bộ nhớ thô (xử lý ảnh, parse nhị phân, interop).
- ⚠️ Bỏ qua an toàn của C# → dễ crash/bug bộ nhớ. Chỉ dùng khi đo thấy cần & cô lập kỹ.
- Thường kết hợp [Job System/Burst](../mid/job-system-burst.md) hoặc Native Collections cho song song hiệu năng cao.

---

## 7. Hiểu cách C# biên dịch (đủ để tối ưu & debug)

- C# → **IL (Intermediate Language)** → (Mono JIT hoặc **IL2CPP** dịch sang C++ → native, xem [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md)).
- **IL2CPP:** một số tính năng động (reflection nặng) chậm/hạn chế; AOT không cho JIT (iOS) → cẩn thận code động.
- Hiểu inlining, devirtualization, generic sharing giúp dự đoán hiệu năng — nhưng **luôn đo**, đừng chỉ lý thuyết.
- **Source Generators:** sinh code lúc biên dịch (thay reflection runtime) → nhanh hơn, hợp framework/serialization.

---

## 8. Lỗi thường gặp

- ❌ Áp tối ưu vi mô **mọi nơi** → code khó đọc, ít lợi (premature optimization).
- ❌ Dùng `unsafe`/pointer khi không cần → rủi ro crash cao, lợi ích nhỏ.
- ❌ Tưởng struct luôn nhanh hơn class → struct lớn copy tốn; cần `in`.
- ❌ Không nhận ra alloc ẩn (boxing, closure, LINQ) → "không thấy `new` mà vẫn GC".
- ❌ Reflection nặng trong hot path / vấn đề với IL2CPP AOT.
- ❌ Tối ưu mà **không đo** → tối ưu nhầm chỗ.

---

## 9. Best practices

- ✅ **Đo trước (Profiler), tối ưu chỗ nghẽn** — không mọi nơi.
- ✅ Hot path: tránh boxing/closure/LINQ/string-concat; dùng generic, `Span`, `stackalloc`, struct enumerator.
- ✅ Struct lớn → truyền bằng `in`; cân nhắc class nếu copy quá tốn.
- ✅ Dùng API Unity không-alloc (`NonAlloc`, fill list).
- ✅ `unsafe`/pointer chỉ khi đo thấy cần & cô lập kỹ.
- ✅ Cân nhắc Source Generators thay reflection cho hiệu năng + IL2CPP an toàn.
- ✅ Giữ code hot-path tối ưu **tách biệt & tài liệu hóa** (vì nó khó đọc) — phần còn lại ưu tiên rõ ràng.

---

## 10. Liên kết
- [Memory Model](./memory-model.md) — stack/heap, boxing, struct vs class.
- [Performance](../../05-Technical-Deep-Dives/performance.md) — Profiler, hot path, đo lường.
- [Job System & Burst](../mid/job-system-burst.md) — song song hiệu năng cao.
- [Build & Pipeline](../../05-Technical-Deep-Dives/build-and-pipeline.md) — IL2CPP, AOT.

---

[⬅️ Script Execution & Player Loop](./execution-order-playerloop.md) | [Technical Debt & Architecture ➡️](./technical-debt-and-architecture.md)
