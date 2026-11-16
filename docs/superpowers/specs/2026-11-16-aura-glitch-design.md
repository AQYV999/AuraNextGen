# Short Design Doc: AURA Wordmark Glitch Animation (Langkah 1)

## Intent and The Why
Menambahkan efek visual animasi *cyberpunk digital glitch* pada teks "AURA" di tengah canvas (`auraOrbCanvas`) agar tampil lebih futuristik, berkarakter, dan dinamis, sesuai konsep AURA Next Gen.

## Goals
- Menampilkan efek glitch berkala pada kata "AURA" setiap 2.5 hingga 4 detik secara acak.
- Glitch berlangsung singkat (~120ms - 180ms per burst) sehingga tidak merusak keterbacaan teks.
- Efek mencakup:
  1. Horizontal slice displacement (potongan baris tergeser acak ke kiri/kanan).
  2. Chromatic aberration / RGB-split (bayangan tipis Cyan & Magenta).
  3. Micro-flicker brightness jitter.
- Performa mulus 60 FPS tanpa alokasi memori berlebih.

## Non-Goals
- Tidak mengubah layout HTML DOM atau teks luar.
- Tidak mengganggu avatar mata atau canvas efek lain (`auraMatrixCanvas`, `auraNeuralCanvas`).

## Approaches
1. **Approach 1: Canvas Slice & Chromatic Aberration via `textBuffer` (Picked)**
   - Mengambil buffer `textBuffer` yang sudah ada di Step 5D `auraOrbCanvas`.
   - Menggambar slice horizontal acak dan offset channel RGB langsung pada canvas context.
2. **Approach 2: CSS DOM Overlay**
   - Ditolak karena terpisah dari siklus render canvas dan tidak menyatu dengan specular sweep liquid mercury.

## Architecture & Logic
- State variabel glitch di scope renderer:
  - `nextGlitchTime`: timestamp kapan burst berikutnya terjadi.
  - `glitchEndTime`: timestamp kapan burst saat ini selesai.
  - `isGlitching`: boolean apakah frame saat ini sedang dalam burst glitch.
- Saat `isGlitching`:
  - Gambar 2-3 slice acak dari `textBuffer` dengan offset horizontal `dx` (-6px sampai +6px).
  - Gambar bayangan chromatic tint (Cyan `#00f3ff` dan Magenta `#ff0055`) dengan `globalCompositeOperation = 'screen'` atau offset posisi kecil.
- Saat idle:
  - Gambar `textBuffer` normal seperti sebelumnya.
