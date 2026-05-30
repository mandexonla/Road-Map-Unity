# 🌐 Multiplayer & Networking (Multiplayer/Backend Engineer)

[⬅️ Technical Index](./README.md)

> 🟡 Trung cấp (Mid) · 🔴 Nâng cao (Senior) — hướng chuyên sâu cho **Multiplayer Engineer**

Multiplayer khó nhất trong các hướng (độ trễ, đồng bộ, bảo mật, server). Cũng là kỹ năng khan hiếm & giá trị cao.

> ⚠️ **Chỉ học khi đã vững gameplay offline.** Đừng nhảy vào multiplayer khi chưa làm xong game đơn.

---

## 🟡 1. Khái niệm mạng cốt lõi

- **Latency (ping), bandwidth, packet loss, jitter** — thực tế mạng không hoàn hảo.
- **TCP vs UDP:** game thường dùng UDP (nhanh, chấp nhận mất gói) + reliability layer.
- **Client-Server vs Peer-to-Peer (P2P):**
  - Client-Server: server là "sự thật" (authoritative) — chống cheat tốt hơn.
  - P2P: rẻ hơn nhưng khó chống cheat, khó đồng bộ.
- **Authority:** ai quyết định trạng thái thật? (server authority là chuẩn cho game cạnh tranh).

---

## 🟡 2. Đồng bộ trạng thái (state sync)

- **Tick rate / network update rate:** gửi state bao nhiêu lần/giây.
- **Snapshot interpolation:** client nội suy giữa các snapshot → mượt dù gửi thưa.
- **Serialization:** đóng gói state nhỏ gọn (bandwidth quý).
- **Delta compression:** chỉ gửi cái thay đổi.
- **Relevancy / Interest management:** chỉ gửi cái client cần thấy (không gửi cả thế giới).

---

## 🟡 3. Xử lý độ trễ (làm game "cảm giác tức thì")

| Kỹ thuật | Giải vấn đề |
|----------|-------------|
| **Client-side prediction** | Client đoán kết quả ngay, không chờ server → cảm giác mượt |
| **Server reconciliation** | Sửa lại khi server không đồng ý với dự đoán |
| **Interpolation** | Hiển thị mượt các entity khác |
| **Lag compensation** | Server "tua ngược" để bắn trúng đúng (FPS) |
| **Input buffering / lockstep** | Cho RTS (gửi input, mô phỏng đồng bộ) |

> 🔑 Đây là phần khó & tinh túy nhất của netcode. Đọc **Gaffer on Games** (gafferongames.com) — kinh điển.

---

## 🟡 4. Giải pháp networking trong Unity

| Giải pháp | Ghi chú |
|-----------|---------|
| **Netcode for GameObjects (NGO)** | Chính thống của Unity, dễ tiếp cận, hợp đa số game |
| **Mirror** | Open-source, trưởng thành, cộng đồng lớn, miễn phí |
| **Photon (PUN/Fusion/Quantum)** | Dịch vụ thương mại; Fusion & Quantum mạnh cho game cạnh tranh |
| **Netcode for Entities (DOTS)** | Hiệu năng cực cao, nhiều entity |
| **FishNet** | Open-source hiện đại, nhiều tính năng |

**Dịch vụ hạ tầng (Unity Gaming Services):**
- **Relay** (NAT punch-through), **Lobby** (phòng chờ), **Matchmaker**, **Game Server Hosting**.

---

## 🟡 5. Backend cho game

- **Authentication:** đăng nhập, tài khoản.
- **Matchmaking & Lobby:** ghép trận, phòng chờ.
- **Dedicated server:** server game chạy authoritative (host trên cloud).
- **Persistence:** lưu data người chơi (database).
- **Live services:** leaderboard, IAP validation, cloud save, analytics.
- Hiểu cơ bản về backend (REST API, WebSocket, database) — hoặc phối hợp với backend engineer.

---

## 🔴 6. Nâng cao (Senior)

- **Anti-cheat:** server authority, validation, phát hiện bất thường, encryption.
- **Deterministic lockstep:** RTS với hàng nghìn unit (cùng input → cùng state mọi máy).
- **Rollback netcode:** fighting game (GGPO-style) — đỉnh cao netcode.
- **Scalability:** server chịu tải lớn, load balancing, region.
- **Dedicated server architecture:** containerized, auto-scaling, matchmaking phân tán.
- **Network security:** chống DDoS, packet manipulation, replay attack.
- **Bandwidth optimization** ở quy mô (battle royale 100 người, MMO).

---

## 🎯 Lộ trình rèn luyện

```
Mid:     Khái niệm mạng · client-server/authority · NGO hoặc Mirror
         · đồng bộ state · interpolation · client prediction cơ bản · lobby/relay
Senior:  Lag compensation · rollback · lockstep · anti-cheat · dedicated server scale
         · backend architecture · security · bandwidth optimization
```

**Dự án gợi ý:** game multiplayer nhỏ (co-op hoặc PvP) với lobby + đồng bộ + server authority. Tiến tới: realtime PvP có prediction.

---

## 📚 Tài nguyên
- **Gaffer on Games** (gafferongames.com) — ⭐ lý thuyết netcode kinh điển.
- **Valve's "Source Multiplayer Networking"** (lag compensation).
- Unity Netcode for GameObjects docs + Unity Gaming Services docs.
- Mirror docs + cộng đồng.
- "Networked Physics" talks (GDC).
- GGPO / rollback netcode articles.

---

## 🔗 Liên quan
- Cần gameplay vững ([gameplay-systems.md](./gameplay-systems.md)) làm nền.
- Tách simulation/presentation (architecture) cực quan trọng cho netcode.

---

[⬅️ Graphics & Rendering](./graphics-and-rendering.md) | [Technical Index ➡️](./README.md)
