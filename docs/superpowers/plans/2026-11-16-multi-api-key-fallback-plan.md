# Multi-API Key & Combo Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun antarmuka modal pengelola Multi-API Key (Gemini & OpenRouter) dan mesin pemanggil AI browser-direct dengan otomatisasi fallback combo pada `index.html`.

**Architecture:** 
1. UI: Tambahkan tombol trigger "API Keys" di panel kontrol sistem dan modal dialog glassmorphism elegan di `index.html`.
2. Storage: Simpan preferensi dan kunci ke `localStorage.getItem('aura_api_keys')`.
3. AI Engine: Implementasikan `tanyaGeminiDirect()`, `tanyaOpenRouterDirect()`, dan router `tanyaCloudDirect()` yang mengelola urutan prioritas dan auto-fallback saat terjadi error 429 / network failure.
4. Integrasi Chat: Pasang router ini di dalam fungsi `kirimPertanyaan()` sebelum fallback ke ESP32 Firebase.

**Tech Stack:** HTML5, CSS Glassmorphism, Vanilla JS (Fetch API, Promises), LocalStorage.

**Spec:** `docs/superpowers/specs/2026-11-16-multi-api-key-fallback-design.md`

## Global Constraints
- Tidak merusak fungsi mode `local` (Ollama) maupun mode `cloud` lama via ESP32.
- Semua kunci API disimpan eksklusif di `localStorage` browser.
- Dialog modal harus responsif di desktop maupun layar HP/tablet.

## Review Focus
1. Input API Key harus tersembunyi (type password atau toggle eye) agar tidak terlihat orang lain di layar.
2. Penanganan error 429 / HTTP status bukan 200 harus melempar error yang ditangkap oleh fallback handler, bukan berhenti.
3. Prompt personality AURA (`KEPRIBADIAN_AURA`) dimasukkan ke system instruction agar gaya bicara AURA tetap konsisten.
4. Chat context (riwayat percakapan sebelumnya) diteruskan ke API payload.
5. Modal bisa ditutup dengan tombol Close, klik di luar modal (backdrop), atau tombol ESC.

---

### Task 1: Add API Key Modal UI and Styles in `index.html`

**Files:**
- Modify: `index.html` (CSS modal, markup HTML modal, tombol buka modal di control panel)
- Test: Verifikasi syntax HTML/CSS dan rendering

- [x] **Step 1: Add Glassmorphism Modal Styles in `<style>` block**
CSS untuk `.api-modal-backdrop`, `.api-modal-card`, input fields, tombol tes, status badge, dan animasi buka/tutup.

- [x] **Step 2: Add Trigger Button in System Controls and Modal DOM Markup in `index.html`**
Tambahkan tombol "AI Key" di `.panel-section--controls` dan markup modal dialog di dekat penutup `<body>`.

- [x] **Step 3: Test modal open/close interaction in JS**
Implementasikan event listener untuk buka/tutup modal dan simpan input.

---

### Task 2: Implement Multi-API Key Storage, Direct Calling & Auto-Fallback Logic

**Files:**
- Modify: `index.html` (JS Engine di bagian chat / local-ai)
- Test: Verifikasi syntax JS dengan node check

- [x] **Step 1: Implement Key Manager helper functions**
`getApiKeys()`, `saveApiKeys()`, `cekStatusApiKeys()`.

- [x] **Step 2: Implement `tanyaGeminiDirect(prompt, history, apiKey, model)`**
Fetch ke Google Gemini REST API v1beta dengan format contents dan safety settings.

- [x] **Step 3: Implement `tanyaOpenRouterDirect(prompt, history, apiKey, model)`**
Fetch ke OpenRouter REST API `/v1/chat/completions` dengan OpenAI-compatible schema.

- [x] **Step 4: Implement `tanyaCloudDirect(prompt, history)` with Combo Fallback**
Coba provider prioritas 1 (Gemini). Jika gagal/rate-limit, otomatis coba provider prioritas 2 (OpenRouter). Jika semua gagal, lempar ke fallback ESP32.

- [x] **Step 5: Wire `tanyaCloudDirect` into `kirimPertanyaan()`**
Integrasikan ke alur pesan user sebelum kirim ke Firebase.

- [x] **Step 6: Verify Syntax and Commit**
Verifikasi seluruh skrip dengan Node.js dan buat git commit.
