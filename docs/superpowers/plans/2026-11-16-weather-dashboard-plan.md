# Implementation Plan: Advanced Weather Dashboard (#9)

## Proposed Changes
1. **CSS Styles (`index.html`)**:
   - Style untuk `#txtCuaca` sebagai clickable item di `.top-left glass` dengan hover glow dan indikator pointer.
   - Style untuk `.weather-backdrop` dan `.weather-modal-panel` (VisionOS dark glassmorphism, responsive, max-height dengan smooth scrollbar).
   - Style untuk Hero weather display, 4-card telemetry grid, 24h hourly forecast horizontal slider, dan 7-day forecast list.
   - Style untuk city switcher chips & GPS detection button.

2. **HTML Structure (`index.html`)**:
   - Tambahkan attribute `role="button"` dan class `clickable-weather` pada `#txtCuaca`.
   - Tambahkan `#weatherBackdrop` dan `#weatherModalPanel` di dalam body.

3. **JavaScript Logic (`index.html`)**:
   - Helper kode cuaca Open-Meteo lengkap (ikon SVG / deskripsi Bahasa Indonesia).
   - LocalStorage manajemen lokasi (`aura_weather_location` default ke Pemalang: lat -6.8899, lon 109.3797).
   - Fungsi `fetchWeatherAdvanced(force)` yang memanggil Open-Meteo dengan parameter komprehensif (current, hourly, daily).
   - Fungsi `renderWeatherDashboard(data)` untuk mengupdate UI Hero, Telemetri, Hourly 24h, dan Daily 7-hari.
   - Integrasi event listener: klik `#txtCuaca`, klik refresh, klik GPS auto-detect, klik ganti preset kota, klik close/backdrop.
   - Chat command parser di `kirimPertanyaan()` untuk keyword cuaca (misal "cuaca", "cuaca hari ini", "ramalan cuaca").

4. **Verification**:
   - Syntax validation menggunakan Node.js parsing script.
   - Test eksekusi fungsi di browser mockup / check tanpa error runtime.
   - Git commit.
