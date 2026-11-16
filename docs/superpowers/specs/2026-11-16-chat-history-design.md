# Short Design Doc: AURA Chat History & Archive System (Langkah 5)

## Intent and The Why
Menyediakan fitur **History of Chat (#3)** lengkap dengan antarmuka pencarian percakapan, pratinjau tanya-jawab masa lalu, filter tanggal, dan ekspor riwayat chat ke format teks/JSON agar percakapan penting dengan AURA dapat diarsipkan dan ditemukan kembali dengan mudah.

## Goals
1. **Modal / Panel Arsip Chat**:
   - Panel dialog glassmorphism elegan yang menampilkan seluruh percakapan yang pernah terjadi.
   - Filter pencarian instan (mencari teks pertanyaan atau jawaban secara realtime).
2. **Detail Percakapan**:
   - Menampilkan kartu percakapan rapi dengan penanda waktu detail, label model/provider AI (Gemini, OpenRouter, Local), teks pertanyaan, dan jawaban AURA.
   - Tombol "Copy" untuk menyalin isi jawaban, dan tombol "Tanya Ulang" untuk memasukkan kembali pertanyaan ke chat input.
3. **Ekspor & Manajemen Riwayat**:
   - Tombol **Export Chat**: Mengunduh seluruh riwayat percakapan menjadi file teks markdown atau `.json`.
   - Tombol **Hapus Riwayat**: Mengosongkan arsip dengan konfirmasi.
4. **Penyimpanan**:
   - Terintegrasi dengan `localStorage` (`aura_riwayat_v1`) dan Firebase RTDB (`/riwayat.json`).

## Non-Goals
- Tidak mengubah alur chat real-time yang sedang berjalan di `chatLog` utama.
