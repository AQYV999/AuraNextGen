# Modularization Refactoring - Design Spec

## 1. Goal
Memecah file monolitik `index.html` (~14.700 baris) menjadi modul-modul CSS dan JavaScript yang terpisah dan terorganisir rapi di bawah folder `css/` dan `js/`, tanpa mengubah fungsionalitas, logika, maupun tampilan sama sekali (100% preserving behavior & zero visual regression).

## 2. Directory Structure
```
AuraNextGen/
├── index.html                   (~300 baris HTML bersih & rapi)
├── css/
│   ├── base.css                 (Reset, font, dark theme, aurora, lock screen, custom cursor)
│   ├── layout.css               (Status bar, 3 kolom widget preview, bottom dock, drawer, chat UI)
│   └── modals.css               (Styles untuk semua 8 modal: Notepad, Weather, ACC, Gallery, Apps, History, Guide, API Key)
├── js/
│   ├── config.js                (FIREBASE_DB_URL, PASSWORD='aura1234', API key manager, helper utils: getar, esc, translate)
│   ├── face-tracking.js         (Eye tracking, ekspresi wajah AI: kedip, lirik, mikir, senyum)
│   ├── ai-chat.js               (Gemini Cloud AI, Local Ollama, TTS ElevenLabs/Piper/Browser, chat bubble, send orchestrator)
│   ├── acc-hardware.js          (AURA Control Center: Servo slider & sweep, 4 Relays, Firebase /acc.json sync, ACC intent)
│   ├── weather.js               (Open-Meteo weather radar, 24h & 7d forecast, live preview updates)
│   ├── notepad-goals.js         (Catatan & target harian progress bar, Ask AI button, live preview updates)
│   ├── reminders.js             (Scheduler alarm, synthesizer beep audio, floating banner alert)
│   ├── chat-history.js          (Arsip percakapan, search, copy, export .txt, live preview updates)
│   ├── apps-launcher.js         (Deep linking Netflix, YouTube, Spotify, Maps, dsb. + Quick Apps Launcher)
│   ├── gallery.js               (Kompresi foto canvas max 800px, Firebase /galeri.json sync, lightbox viewer, camera button)
│   ├── canvas-aura.js           (Canvas particle orb, celestial rings, text glitch typography engine)
│   └── app.js                   (Main initialization, lock screen logic, drawer toggle, keyboard shortcuts)
```

## 3. Preservation & Verification Strategy
- Menggunakan script loader klasik `<script src="js/...">` agar tidak terkena batasan CORS `file:///` saat dibuka lokal.
- Semua variabel dan fungsi global tetap berada di scope `window` sehingga interop antar-modul berjalan 100% persis seperti di file tunggal sebelumnya.
- Verifikasi sintaks via Node.js `vm.Script` pada setiap file JS hasil pemecahan sebelum commit.
