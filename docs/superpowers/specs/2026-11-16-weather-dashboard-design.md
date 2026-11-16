# Design Document: Advanced Weather Dashboard (#9)

## 1. Overview
Fitur ke-6 dari roadmap AURA NEXT GEN: **Dashboard Monitor Cuaca Canggih**.
Mentransformasikan widget cuaca sederhana (`--°C`) pada top bar menjadi stasiun pemantauan cuaca futuristik (VisionOS dark glassmorphism) dengan data telemetri komprehensif, prakiraan per jam (24h), prakiraan mingguan (7 hari), deteksi GPS / ganti kota, dan integrasi suara/chat AURA.

## 2. Fitur Utama
1. **Interactive Trigger**:
   - Element `#txtCuaca` di `.top-left glass` dibuat interaktif (`cursor: pointer`, hover glow, tooltip info).
   - Klik pada `#txtCuaca` membuka modal `#weatherModalPanel`.
   - Voice / Chat command (misal: "cuaca hari ini", "cek cuaca") otomatis membuka panel dan memberikan ringkasan suara AURA.
2. **VisionOS Glass Dashboard Modal**:
   - Backdrop blur & dark overlay (`#weatherBackdrop`).
   - Header: Nama kota, tombol deteksi GPS (`GPS Auto`), tombol ganti kota popover/chips, waktu update, tombol refresh, tombol close.
   - Hero Display: Temperatur besar (`29°C`), kondisi cuaca (Bahasa Indonesia & ikon SVG dinamis), "Terasa seperti", range Min-Max hari ini.
   - Telemetry Grid (4 kartu kaca):
     - 💧 Kelembaban (%) & status (Lembap/Normal/Kering).
     - 💨 Kecepatan Angin (km/h) & arah mata angin.
     - ☀️ Indeks UV & status proteksi matahari.
     - 🧭 Tekanan Udara (hPa) & peluang hujan (%).
   - Prakiraan Per Jam (24 Jam ke Depan):
     - Slider kartu horizontal jam, ikon cuaca, suhu, dan persentase hujan.
   - Prakiraan 7 Hari (Weekly Forecast):
     - Daftar baris 7 hari dengan hari, ikon, kondisi, visual bar rentang suhu (min-max), dan curah hujan.
   - Pilihan Lokasi & Storage:
     - Preset kota (Pemalang, Jakarta, Bandung, Surabaya, Semarang, Yogyakarta, Bali, Medan, Makassar).
     - Input custom atau tombol GPS Browser (`navigator.geolocation`).
     - Disimpan di `localStorage('aura_weather_location')`.
3. **Data Source (Open-Meteo API)**:
   - Gratis tanpa API key:
     `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`

## 3. Kompatibilitas
- Sepenuhnya responsif untuk Desktop dan Mobile (layar HP).
- Graceful error handling jika offline atau API limit/timeout.
