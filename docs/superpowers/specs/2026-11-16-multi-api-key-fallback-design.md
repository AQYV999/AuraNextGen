# Short Design Doc: Multi-API Key & Combo Fallback System (Langkah 2)

## Intent and The Why
Memberikan kemampuan kepada pengguna untuk memasukkan dan mengelola beberapa API Key LLM (Gemini, OpenRouter, Claude/OpenAI) langsung dari Web Dashboard AURA. Sistem ini menyediakan pemanggilan AI langsung dari browser yang super cepat dengan fitur **Auto-Fallback Combo**: jika satu API mengalami error atau rate limit (429), permintaan otomatis dialihkan ke provider cadangan tanpa menghentikan percakapan.

## Goals
1. **Modal Glassmorphism API Key Manager**:
   - Terintegrasi di panel kontrol kanan atas atau header.
   - Input untuk Gemini API Key, OpenRouter API Key, dan model pilihan.
   - Tombol toggle status fallback, tes koneksi, dan simpan ke `localStorage` (`aura_api_keys`).
2. **Direct Browser AI Engine dengan Combo Fallback**:
   - Prioritas 1: **Google Gemini API** (sangat cepat & responsif).
   - Prioritas 2: **OpenRouter API** (DeepSeek V3, Llama 3.3, Claude, Gemini Flash).
   - Prioritas 3 (Final Fallback): Jaringan ESP32 via Firebase RTDB.
3. **Penyimpanan Aman**:
   - Disimpan di `localStorage` perangkat browser pengguna (tidak bocor ke public repository atau database luar).
4. **Respon Cepat & Indikator Provider**:
   - Di chat bubble, tampilkan lencana kecil provider yang menjawab (misal `Cloud (Gemini)` atau `Cloud (OpenRouter)`).

## Non-Goals
- Tidak menghilangkan alur lama ESP32 Firebase (tetap menjadi fallback terakhir jika tidak ada API key atau jika semua kuota habis).

## Approaches
1. **Pendekatan 1: Direct Client-Side Fetch dengan Auto Fallback (Picked)**
   - Browser langsung memanggil REST API endpoint Gemini (`generativelanguage.googleapis.com`) dan OpenRouter (`openrouter.ai/api/v1/chat/completions`).
   - Mendukung CORS secara native di browser.
   - Latensi sangat rendah (~300-800ms) dibanding round-trip Firebase ke ESP32 (~3-5 detik).
2. **Pendekatan 2: Simpan API Key di Firebase RTDB**
   - Ditolak karena API Key pribadi berisiko terbaca publik jika database rules Firebase belum diproteksi.
