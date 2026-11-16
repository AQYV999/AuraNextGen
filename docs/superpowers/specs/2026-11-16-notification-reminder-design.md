# Short Design Doc: AURA Notification & Reminder System (Langkah 4)

## Intent and The Why
Memberikan kemampuan kepada AURA untuk bertindak sebagai asisten pengingat waktu nyata (alarm & scheduler). Pengguna dapat menyetel pengingat baik melalui antarmuka visual maupun lewat percakapan bahasa alami di chat. Ketika waktu tiba, AURA akan memunculkan notifikasi sistem browser, bersuara melalui TTS (*"Pengingat untukmu: [pesan]"*), dan menampilkan banner peringatan di dashboard.

## Goals
1. **Pemicu Dual-Channel**:
   - **Manual UI**: Modal/dialog untuk mengatur pesan dan durasi (preset cepat 5m, 15m, 30m, 1 jam, atau jam spesifik HH:mm).
   - **Natural Language Chat Intent**: Deteksi regex/intent pintar pada chat (misal: `"ingatkan saya [pesan] [durasi/jam]"`), sehingga AURA langsung mencatat pengingat dan menjawab konfirmasi.
2. **Multi-Sensory Alert (Saat Waktu Tiba)**:
   - **Audio Voice Alert**: Memanggil engine TTS AURA untuk mengucapkan pesan pengingat secara otomatis.
   - **Browser Desktop Notification**: Menggunakan HTML5 `Notification` API (aktif walau tab di-minimize).
   - **Floating Banner Toast**: Notifikasi visual elegan di tengah atas layar dengan tombol Dismiss.
3. **Penyimpanan & Polling**:
   - Disimpan di `localStorage` (`aura_reminders`) dengan struktur `{ id, text, time, timeStr, created }`.
   - Polling loop ringan (setiap 1000ms) untuk memeriksa pengingat yang jatuh tempo.
4. **Manajemen Pengingat**:
   - Daftar pengingat aktif yang dapat dibatalkan atau dihapus.

## Non-Goals
- Tidak memerlukan cron service server luar; berjalan mandiri di browser secara client-side.

## Approaches
1. **Pendekatan 1: Client-Side Scheduler + Web Notification & TTS (Picked)**
   - Menggunakan timestamp millisecond di `localStorage`.
   - Minta izin `Notification.requestPermission()` saat pertama kali menyetel pengingat.
   - Audio feedback menggunakan `ucapkanDiBrowser()` yang sudah ada.
