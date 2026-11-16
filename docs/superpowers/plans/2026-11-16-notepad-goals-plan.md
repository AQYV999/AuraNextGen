# AURA Notepad & Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun panel Notepad & Goals (Catatan, Checklist Target, Progress Bar, Autosave) di Web Dashboard `index.html`.

**Architecture:** 
1. UI: Tombol pemicu "Notepad" di top bar / glass control dan slide-over panel glassmorphism di DOM.
2. Tab switcher: Tab "Catatan Ringkas" dan Tab "Goals & To-Do".
3. State & Storage: Objek state `{ notes: string, goals: [{ id, text, done }] }` yang tersinkronisasi otomatis ke `localStorage.getItem('aura_notepad_data')`.
4. Logic: CRUD checklist goal, kalkulasi progres bar dinamis, integrasi ke chat input.

**Tech Stack:** HTML5, CSS Glassmorphism, Vanilla JS, LocalStorage API.

**Spec:** `docs/superpowers/specs/2026-11-16-notepad-goals-design.md`

## Global Constraints
- Tidak mengganggu layout chat input di bawah maupun canvas avatar di tengah.
- Responsif di HP/tablet (tidak overflow keluar viewport).
- Autosave tidak membebani performa browser (debounce).

## Review Focus
1. Checklist to-do item bisa di-toggle dan mencoret teks saat selesai.
2. Progress bar menghitung persentase target yang selesai secara akurat (0% jika tidak ada item).
3. Isi catatan tersimpan otomatis saat user mengetik.
4. Panel bisa ditutup dengan tombol Close, ESC, atau klik backdrop.

---

### Task 1: Add Notepad & Goals CSS and HTML Markup in `index.html`

**Files:**
- Modify: `index.html` (CSS styles, trigger button di top bar, modal drawer markup)
- Test: Verifikasi syntax HTML/CSS

- [x] **Step 1: Add Glassmorphism Notepad Panel Styles in `<style>` block**
Style untuk `.notepad-panel`, `.notepad-backdrop`, tab switcher, input checklist, progress bar, dan textarea catatan.

- [x] **Step 2: Add Trigger Button in Top-Left / Top-Right Glass Header**
Tambahkan tombol ikon buku/catatan "Notepad" di bar navigasi.

- [x] **Step 3: Add Notepad & Goals Markup in DOM**
Tambahkan struktur HTML untuk panel catatan dan checklist goals.

---

### Task 2: Implement Notepad State, Autosave, and Goals Interaction in JS

**Files:**
- Modify: `index.html` (JS controller)
- Test: Verifikasi syntax JS dengan Node.js

- [x] **Step 1: Implement State Manager & LocalStorage Persistence**
`muatDataNotepad()`, `simpanDataNotepad()`.

- [x] **Step 2: Implement UI Renderers for Notes and Goals**
Render checklist target dengan tombol centang, hapus item, dan update progress bar (misal: "3/5 selesai (60%)").

- [x] **Step 3: Implement Event Handlers & Auto-save debounce**
Event listener untuk textarea input, tombol tambah goal, hapus goal, toggle selesai, dan kirim catatan ke AURA chat.

- [x] **Step 4: Verify Syntax and Commit**
Jalankan verifikasi sintaks JS dan buat git commit.
