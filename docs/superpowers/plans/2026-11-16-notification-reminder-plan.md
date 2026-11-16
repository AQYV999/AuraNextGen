# AURA Notification Reminder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun sistem Notification Reminder (Scheduler, Web Notification, Suara TTS AURA, Chat Intent Parser, dan Dialog Reminder) di `index.html`.

**Architecture:**
1. UI: Modal Reminder Dialog & Banner Toast Alert di DOM + Tombol "Reminder" atau tab di Notepad / System Controls.
2. Scheduler Engine: `muatReminders()`, `tambahReminder()`, `hapusReminder()`, dan loop ticker `cekReminders()`.
3. Multi-Sensory Alert: HTML5 Notification API + `ucapkanDiBrowser()` + Visual Banner.
4. Chat Intent Parser: Intersep input chat user yang mengandung kata kunci `"ingatkan"`, parse waktu (menit/jam), dan jadwalkan otomatis.

**Tech Stack:** HTML5 Web Notifications API, Web Speech API / TTS, CSS Glassmorphism, Vanilla JS, LocalStorage.

**Spec:** `docs/superpowers/specs/2026-11-16-notification-reminder-design.md`

## Global Constraints
- Tidak memblokir thread UI (pemeriksaan waktu menggunakan delta timestamp `Date.now()`).
- Minta izin notifikasi dengan ramah tanpa popup mengganggu saat pertama dibuka.
- Jika browser menolak notifikasi desktop, tetap jalankan alert visual & audio TTS di dashboard.

## Review Focus
1. Parser durasi bahasa alami mengenali format umum (misal: "5 menit", "1 jam", "jam 14:30").
2. Alarm yang sudah berbunyi otomatis ditandai atau dihapus agar tidak berbunyi berulang-ulang.
3. Tombol dismiss pada banner menghentikan suara / menutup banner dengan mulus.

---

### Task 1: Add Reminder Modal UI, Banner Toast & Styles in `index.html`

**Files:**
- Modify: `index.html` (CSS modal, markup dialog reminder, floating banner alert)
- Test: Verifikasi syntax HTML/CSS

- [x] **Step 1: Add Reminder Dialog & Banner Alert CSS in `<style>` block**
Style untuk `.reminder-panel`, `.reminder-banner-toast`, preset time chips, dan daftar active alarms.

- [x] **Step 2: Add Reminder Trigger Button & Modal DOM Markup**
Tambahkan tombol pemicu dan struktur HTML dialog reminder di `index.html`.

- [x] **Step 3: Add Floating Banner Toast Markup**
Tambahkan elemen toast alert yang muncul saat alarm aktif.

---

### Task 2: Implement Reminder Engine, Scheduler Loop, and Chat Intent Parser in JS

**Files:**
- Modify: `index.html` (JS logic)
- Test: Verifikasi syntax JS dengan Node.js

- [x] **Step 1: Implement Reminder Storage & Scheduler Ticker**
`muatReminders()`, `simpanReminders()`, `tambahReminder()`, loop `setInterval` cek alarm tiap detik.

- [x] **Step 2: Implement Trigger Action (Browser Notification + TTS + Banner Alert)**
Panggil `Notification`, `ucapkanDiBrowser()`, dan tampilkan banner toast saat `targetTime <= Date.now()`.

- [x] **Step 3: Implement Natural Language Chat Intent Parser**
Intersep kata "ingatkan" di `kirimPertanyaan()` untuk auto-schedule via percakapan.

- [x] **Step 4: Verify Syntax and Commit**
Jalankan verifikasi sintaks JS dan buat git commit.
