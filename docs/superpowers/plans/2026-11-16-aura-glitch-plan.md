# AURA Wordmark Glitch Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan efek cyberpunk digital glitch berkala (RGB split, horizontal slice jitter, micro-flicker) pada tulisan tengah AURA di `index.html`.

**Architecture:** Modifikasi render loop di `auraOrbCanvas` pada `index.html`. Saat burst glitch aktif setiap 2.5-4s selama ~150ms, `textBuffer` digambar dengan chromatic aberration (cyan/magenta channel shift), horizontal strip slice displacement, dan micro-flicker. Saat idle, rendering kembali ke mode solid & pristine.

**Tech Stack:** HTML5 Canvas 2D Context, Vanilla JavaScript, Performance.now().

**Spec:** `docs/superpowers/specs/2026-11-16-aura-glitch-design.md`

## Global Constraints
- Harus mempertahankan 60 FPS tanpa memory leak atau re-alokasi buffer per frame.
- Tidak mengubah elemen di luar `auraOrbCanvas` render loop.
- Glitch hanya terjadi berkala (2.5 - 4.5 detik interval) dan berlangsung singkat (110 - 190 milidetik).

## Review Focus
1. `performance.now()` interval timing tidak memicu glitch secara terus menerus (harus berhenti saat `glitchEndTime` lewat).
2. Canvas clipping slice tidak merusak state context di luar blok (wajib menggunakan `ctx.save()` dan `ctx.restore()`).
3. Mode fallback tanpa `textBuffer` (jika canvas buffer gagal) tetap berjalan normal tanpa melempar error.
4. Glitch tetap sinkron saat AURA dalam status `isThinking` atau `isSpeaking`.
5. Mode performa hemat daya (`perf-lite`) tetap berjalan mulus.

---

### Task 1: Add Glitch State Variables & Render Loop Enhancement in `index.html`

**Files:**
- Modify: `index.html:8260-8275` (State variables)
- Modify: `index.html:8709-8725` (Render loop Step 5D)
- Test: Verification via local browser or script validation

**Interfaces:**
- Consumes: `now` (DOMHighResTimeStamp from `requestAnimationFrame`), `textBuffer`, `tCtx`, `bufW`, `bufH`, `startX`, `padX`, `cy`
- Produces: Visual glitch effect on `ctx`

- [x] **Step 1: Inspect the target code lines in `index.html`**
Verify line numbers and syntax around `textBuffer` declaration and Step 5D draw call.

- [x] **Step 2: Add timing state variables near `textBuffer` declaration**
Tambahkan `nextGlitchTime` dan `glitchEndTime` pada inisialisasi visual canvas orb.

- [x] **Step 3: Implement glitch burst logic (RGB split, horizontal slicing, and micro-flicker) in Step 5D**
Implementasikan pengecekan `now >= nextGlitchTime` dan render logic glitch di Step 5D dengan `ctx.save()` / `ctx.restore()`.

- [x] **Step 4: Verify syntax and JavaScript validity using Node.js**
Run: `node --check index.html` (or extract script to verify syntax)
Expected: No syntax errors.

- [x] **Step 5: Test rendering in browser and verify glitch appearance**
Buka `index.html` di browser dan pastikan tulisan AURA mengalami glitch berkala yang mulus setiap ~3 detik.

- [x] **Step 6: Commit changes**
```bash
git add index.html docs/superpowers/
git commit -m "feat(visual): add cyberpunk glitch animation to AURA wordmark"
```
