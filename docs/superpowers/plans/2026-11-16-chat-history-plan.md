# AURA Chat History & Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun panel Arsip Chat History (Pencarian, Filter, Ekspor File, Pratinjau Tanya-Jawab) di `index.html`.

**Architecture:**
1. UI: Modal dialog `#chatHistoryPanel` dengan search input, daftar kartu riwayat, tombol ekspor, dan tombol pemicu "Archive" di header chat log.
2. Search & Filter: Filter live array `riwayat` berdasarkan substring pertanyaan atau jawaban.
3. Export Utility: Membuat file blob teks/json dan men-trigger download di browser.
4. Action Items: Tombol copy respons dan reuse pertanyaan ke chat bar.

**Tech Stack:** HTML5, CSS Glassmorphism, Vanilla JS, Blob API.

**Spec:** `docs/superpowers/specs/2026-11-16-chat-history-design.md`

## Global Constraints
- Tidak merusak auto-scroll chat bubble utama saat pesan baru masuk.
- Pencarian tidak boleh lag (ringan dan instan).
- Responsif di perangkat mobile dan tablet.

## Review Focus
1. Search input menyaring kartu percakapan secara instan tanpa perlu tombol submit.
2. Fitur Export mengunduh file dengan format rapi dan nama file ber-timestamp.
3. Tombol "Tanya Ulang" menutup arsip dan memfokuskan teks ke `#inpTanya`.

---

### Task 1: Add Chat History Modal HTML Markup and Styles in `index.html`

**Files:**
- Modify: `index.html` (CSS styles, trigger button di `buatHeadLog()`, markup dialog `#chatHistoryPanel`)
- Test: Verifikasi syntax HTML/CSS

- [x] **Step 1: Add Chat History Modal Styles in `<style>` block**
Style untuk `.history-archive-panel`, `.history-card`, `.history-search-input`, dan tombol action ekspor.

- [x] **Step 2: Add "Archive" Button to Chat Log Head and Modal DOM Markup**
Tambahkan tombol di `buatHeadLog()` dan elemen modal dialog di DOM.

---

### Task 2: Implement Chat History Search, Card Renderer, and Export in JS

**Files:**
- Modify: `index.html` (JS logic)
- Test: Verifikasi syntax JS dengan Node.js

- [x] **Step 1: Implement `bukaChatHistory(buka)` & `renderChatHistoryList(filterQuery)`**
Renderer kartu percakapan dengan format waktu, teks user, teks AURA, dan badge mode.

- [x] **Step 2: Implement Search Filter Input Handler**
Live filtering kartu percakapan saat user mengetik di search bar.

- [x] **Step 3: Implement Export Chat Functionality**
Fungsi `eksporChatHistory(format)` untuk unduh `.txt` / `.json`.

- [x] **Step 4: Verify Syntax and Commit**
Jalankan verifikasi sintaks JS dan buat git commit.
