# 🌌 AURA NEXT GEN — Smart AI Assistant & IoT Ecosystem

> **PERINGATAN HAK CIPTA & LISENSI EKSKLUSIF:**  
> Seluruh kode sumber, aset, dan arsitektur dalam repositori ini berstatus **PROPRIETARY & CONFIDENTIAL (Semua Hak Dilindungi Undang-Undang)** milik **Tim Pengembang AURA NEXT GEN (AQYV999 & Team)**. Dilarang keras menyalin, mendistribusikan, memodifikasi, mengkloning, atau menggunakan untuk tujuan publik/komersial tanpa izin tertulis resmi dari pemilik hak cipta. Baca selengkapnya di file [LICENSE](LICENSE).

---

## 📌 Ringkasan Sistem
**AURA NEXT GEN** adalah platform asisten pintar terpadu masa depan yang menggabungkan kecerdasan buatan (Voice & Text AI Assistant), integrasi IoT mikrokontroler (ESP32 Servo & 4-Channel Relay), sinkronisasi Firebase Realtime Database, dan dashboard pemantauan berbasis cloud.

- **🌐 Live Production Web:** [aurahome611.web.app](https://aurahome611.web.app/)
- **⚡ Target Branch:** `main`
- **🚀 Hosting:** Firebase Hosting
- **💾 Realtime Database:** Firebase RTDB

---

## 🛠️ Fitur Utama Sistem
1. **Multi-API Key & Fallback Engine**: Rotasi cerdas Gemini 2.5 Flash / Flash Lite + Fallback otomatis ke Ollama lokal saat kuota habis / offline.
2. **AURA Control Center (ACC)**: Kontrol perangkat keras ESP32 via Firebase RTDB (Servo 0°–180°, auto-sweep, & 4-Channel Relay toggle).
3. **Audio Synthesizer & Alarm**: Notifikasi reminder bersuara, alarm audio synth internal tanpa aset eksternal.
4. **Cloud Photo Gallery**: Tangkap foto kamera, kompresi client-side canvas, sinkronisasi realtime ke Firebase RTDB dengan Lightbox Viewer.
5. **Dashboard Cuaca & UV Index**: Integrasi Open-Meteo API, visualisasi cuaca 24 jam & prakiraan 7 hari, UV gauge.
6. **Live Chat History**: Pencarian pesan seketika, filter cerdas, dan ekspor arsip obrolan `.txt`.
7. **Notepad & Target Progres**: Manajemen catatan cepat terintegrasi AI, checklist harian dengan visualisasi progress bar.
8. **App Launcher & Deep Linking**: Akses cepat aplikasi eksternal dan navigasi sistem interaktif.
9. **Glitch Canvas FX**: Visualisasi status ambient dengan efek RGB split canvas dinamis.

---

## 📂 Struktur Modular Proyek
```
AuraNextGen/
├── css/
│   ├── base.css            # Variabel tema cyberpunk/modern & reset CSS
│   ├── layout.css          # Struktur grid, status bar, drawer & responsivitas
│   └── modals.css          # Desain dialog modal pop-up
├── js/
│   ├── config.js           # Konfigurasi endpoint Firebase RTDB & API default
│   ├── state.js            # State reactive AURA
│   ├── utils.js            # Utilitas DOM, sanitasi XSS, toast notifikasi
│   ├── audio-synth.js      # Synthesizer audio Web Audio API
│   ├── ai-engine.js        # Logika rotasi Gemini AI & Ollama Fallback
│   ├── weather.js          # Layanan cuaca Open-Meteo & visualisasi
│   ├── notes-goals.js      # Pengelolaan catatan & daily goals
│   ├── chat-history.js     # Manajemen riwayat obrolan & ekspor
│   ├── reminders.js        # Scheduler pengingat & pemicu alarm
│   ├── app-launcher.js     # Deep linking launcher & modal cepat
│   ├── gallery.js          # Kamera, kompresi foto, Firebase gallery
│   ├── acc-control.js      # IoT controller (Servo & 4 Relay ESP32)
│   ├── glitch-fx.js        # Efek visual glitch canvas
│   └── main.js             # Entrypoint bootstrap & event binding
├── Aura Folder Arduino/
│   ├── Aura Folder Arduino.ino  # Firmware ESP32 utama
│   └── acc_control.h            # Handler RTDB servo & relay ESP32
├── index.html              # Shell HTML utama
├── firebase.json           # Konfigurasi Firebase Hosting
├── LICENSE                 # Perjanjian Lisensi Eksklusif Hak Cipta Tim
└── README.md               # Dokumentasi sistem
```

---

## 🔒 Lisensi & Hak Kekayaan Intelektual
Hak Cipta © 2026 **Tim Pengembang AURA NEXT GEN & AQYV999**.  
**SELURUH HAK DILINDUNGI UNDANG-UNDANG.**

Perangkat lunak ini adalah karya kepemilikan tertutup (proprietary software) untuk kebutuhan internal tim pengembang. Penggunaan, penyebaran, atau modifikasi tanpa izin tertulis resmi merupakan pelanggaran hukum hak cipta.
