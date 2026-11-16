# Short Design Doc: AURA Notepad & Goals System (Langkah 3)

## Intent and The Why
Menyediakan fitur **Notepad & Goals** terintegrasi langsung di dalam Web Dashboard AURA, agar pengguna dapat mencatat ide, target harian/jangka panjang, to-do list, dan ringkasan penting tanpa harus berpindah ke aplikasi lain.

## Goals
1. **Glassmorphism Drawer / Modal Panel**:
   - Panel elegan yang dapat dibuka/tutup dengan tombol cepat di UI.
   - Responsif untuk desktop, tablet, dan smartphone.
2. **Dua Mode Tab**:
   - **Tab 1: Catatan & Ringkasan (Notes)**: Area teks markdown/catatan bebas dengan auto-save realtime dan counter kata/karakter.
   - **Tab 2: Goals & Target**: Daftar target/to-do interaktif dengan checkbox, indikator progres (%) pencapaian, dan tombol tambah/hapus item.
3. **Penyimpanan Realtime**:
   - Tersimpan otomatis di `localStorage` (`aura_notepad_data`), sehingga data tidak hilang saat refresh atau browser ditutup.
4. **Integrasi Asisten**:
   - Tombol "Kirim ke Chat" atau "Ringkas dengan AI" untuk memasukkan catatan ke chat input AURA.

## Non-Goals
- Tidak memerlukan database backend yang rumit; menggunakan client-side reactive storage yang ringan dan instan.

## Approaches
1. **Pendekatan 1: Slide-Over Floating Glass Drawer (Picked)**
   - Panel meluncur halus dari sisi kiri atau sebagai floating glass modal.
   - Menggunakan CSS glassmorphism VisionOS dengan tab switcher (Notes vs Goals).
   - Data reaktif berbasis state JS + autosave debounce (300ms) ke `localStorage`.
