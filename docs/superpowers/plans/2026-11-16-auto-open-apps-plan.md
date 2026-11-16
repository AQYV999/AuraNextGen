# Implementation Plan: Auto Buka Aplikasi & Deep Linking (#5)

## Proposed Changes
1. **CSS Styles (`index.html`)**:
   - Style untuk `.app-launcher-card` (VisionOS glassmorphism di dalam chat message):
     - Background gradient halus sesuai tema aplikasi (misal Netflix dark-red, Spotify dark-green, YouTube dark-crimson, Maps dark-cyan).
     - Tombol aksi `.app-launch-btn` dengan glowing hover state.
   - Style untuk quick app chips tray di dekat input chat atau tombol quick launcher.

2. **JavaScript Engine (`index.html`)**:
   - Fungsi `deteksiIntentAplikasi(teks)`:
     - Regex parsing untuk berbagai variasi kalimat Indonesia.
     - Mengembalikan `{ appName, targetUrl, query, iconType, themeColor, voiceMsg }`.
   - Fungsi `buatAppCardHtml(appInfo)`:
     - Render template HTML kartu aplikasi interaktif.
   - Integrasi dalam `kirimPertanyaan()`:
     - Dijalankan sebelum fallback ke LLM / Ollama / ESP32.
     - Panggil `window.open(appInfo.targetUrl, '_blank')`.
     - Tampilkan kartu di pesan AURA dan simpan ke riwayat chat dengan badge `App Launch`.
     - Panggil `ucapkanDiBrowser(appInfo.voiceMsg)`.
   - Tombol Apps Quick Launcher di chat toolbar / input tray.

3. **Verification**:
   - Uji parsing regex untuk berbagai kalimat (Netflix, YouTube, Spotify, Maps, Google, WhatsApp).
   - Validasi syntax JavaScript menggunakan Node.js VM.
   - Git commit.
