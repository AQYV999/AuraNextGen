# Design Document: Auto Buka Aplikasi & Deep Linking (#5)

## 1. Overview
Fitur ke-7 dari roadmap AURA NEXT GEN: **Auto Buka Aplikasi & Deep Linking**.
Memungkinkan AURA mengenali perintah suara atau teks berbahasa Indonesia untuk membuka aplikasi web populer (Netflix, YouTube, Spotify, Google Maps, Google Search, GitHub, ChatGPT, WhatsApp Web, Wikipedia, dll.) beserta pencarian query otomatis (deep link search).

## 2. Fitur Utama
1. **Natural Language Intent Parser**:
   - Mendeteksi perintah seperti:
     - *"carikan film [judul/genre] di netflix"* -> Netflix Search
     - *"putar lagu [judul] di spotify / youtube"* -> Spotify / YouTube Search
     - *"cari [topik] di google"* -> Google Search
     - *"cari rute ke [lokasi] / peta [lokasi]"* -> Google Maps
     - *"buka github cari [repo]"* -> GitHub Search
     - *"buka whatsapp / chatgpt / instagram / canva / gmail / tiktok / x"* -> Direct URL Launch
     - *"buka [nama domain.com/url]"* -> Direct custom URL
2. **Interactive Glass App Card di Chat**:
   - Menampilkan kartu VisionOS glassmorphism interaktif di dalam gelembung chat AURA:
     - Ikon/Logo SVG aplikasi (Netflix merah, Spotify hijau, YouTube merah, Maps biru, dll.).
     - Judul aplikasi & query pencarian yang diekstrak.
     - Tombol aksi *"Buka Sekarang ↗"*.
   - AURA mencoba membuka tab baru secara langsung (`window.open(url, '_blank')`). Jika diblokir oleh pop-up blocker browser, tombol interaktif pada kartu menjamin pengguna dapat membuka tautan dengan 1 ketukan.
3. **Respon Suara AURA (TTS)**:
   - AURA mengucapkan konfirmasi suara, misal: *"Siap! Membuka Netflix untuk mencari film horor untukmu."*
4. **App Launcher Quick Tray**:
   - Tombol *"Apps"* cepat di area input chat / drawer untuk membuka preset aplikasi favorit hanya dengan satu klik tanpa harus mengetik.

## 3. Kompatibilitas
- Bekerja di Desktop maupun Mobile.
- Tautan eksternal menggunakan `rel="noopener noreferrer"`.
