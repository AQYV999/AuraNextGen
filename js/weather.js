/* ============================================================
   AURA NEXT GEN: WEATHER RADAR & FORECAST (OPEN-METEO)
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: ADVANCED WEATHER RADAR & DASHBOARD
   Open-Meteo API (gratis, tanpa API key, akurat & lengkap)
   ============================================================ */

let _weatherDataCache = null;
let _weatherLastFetch = 0;
const WEATHER_INTERVAL = 15 * 60 * 1000; // update tiap 15 menit

function getSavedWeatherLocation() {
  try {
    const raw = localStorage.getItem('aura_weather_location');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
        return parsed;
      }
    }
  } catch (e) {}
  return { name: 'Pemalang, ID', lat: -6.8899, lon: 109.3797 };
}

function saveWeatherLocation(name, lat, lon) {
  try {
    localStorage.setItem('aura_weather_location', JSON.stringify({ name, lat, lon }));
  } catch (e) {}
}

// Kamus Kode Cuaca WMO
const KODE_CUACA_INFO = {
  0: { label: 'Cerah', icon: 'sun' },
  1: { label: 'Cerah Berawan', icon: 'cloud-sun' },
  2: { label: 'Sebagian Berawan', icon: 'cloud-sun' },
  3: { label: 'Mendung Berawan', icon: 'cloud' },
  45: { label: 'Berkabut Tebal', icon: 'fog' },
  48: { label: 'Kabut Berembun', icon: 'fog' },
  51: { label: 'Gerimis Ringan', icon: 'drizzle' },
  53: { label: 'Gerimis Sedang', icon: 'drizzle' },
  55: { label: 'Gerimis Lebat', icon: 'drizzle' },
  56: { label: 'Gerimis Beku', icon: 'snow' },
  57: { label: 'Gerimis Beku Lebat', icon: 'snow' },
  61: { label: 'Hujan Ringan', icon: 'rain' },
  63: { label: 'Hujan Sedang', icon: 'rain' },
  65: { label: 'Hujan Lebat', icon: 'heavy-rain' },
  66: { label: 'Hujan Es Dingin', icon: 'snow' },
  67: { label: 'Hujan Es Lebat', icon: 'snow' },
  71: { label: 'Salju Ringan', icon: 'snow' },
  73: { label: 'Salju Sedang', icon: 'snow' },
  75: { label: 'Salju Lebat', icon: 'snow' },
  77: { label: 'Kepingan Salju', icon: 'snow' },
  80: { label: 'Hujan Rintik Lokal', icon: 'rain' },
  81: { label: 'Hujan Deras Lokal', icon: 'rain' },
  82: { label: 'Hujan Sangat Deras', icon: 'heavy-rain' },
  85: { label: 'Hujan Salju Ringan', icon: 'snow' },
  86: { label: 'Hujan Salju Deras', icon: 'snow' },
  95: { label: 'Badai Petir', icon: 'thunder' },
  96: { label: 'Badai Petir + Es', icon: 'thunder' },
  99: { label: 'Badai Petir Hebat', icon: 'thunder' }
};

// Kompatibilitas mundur dengan nama lama
const KODE_CUACA = {
  0: 'Cerah', 1: 'Cerah Berawan', 2: 'Sebagian Berawan', 3: 'Mendung Berawan',
  45: 'Berkabut', 48: 'Berkabut', 51: 'Gerimis', 53: 'Gerimis', 55: 'Gerimis Lebat',
  61: 'Hujan', 63: 'Hujan', 65: 'Hujan Lebat', 80: 'Hujan Lokal', 81: 'Hujan Deras',
  95: 'Badai Petir', 96: 'Badai Petir', 99: 'Badai Petir'
};

function getDeskripsiCuaca(code) {
  return KODE_CUACA_INFO[code]?.label || 'Kondisi Normal';
}

function getIconSvgCuaca(code, isDay = 1, size = 24) {
  const iconType = KODE_CUACA_INFO[code]?.icon || (isDay ? 'sun' : 'moon');
  if (iconType === 'sun') {
    if (!isDay) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  }
  if (iconType === 'cloud-sun') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`;
  }
  if (iconType === 'cloud') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
  }
  if (iconType === 'drizzle' || iconType === 'rain') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 13v8"/><path d="M8 13v8"/><path d="M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`;
  }
  if (iconType === 'heavy-rain') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="13" x2="6" y2="21"/><line x1="12" y1="13" x2="10" y2="21"/><line x1="16" y1="13" x2="14" y2="21"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`;
  }
  if (iconType === 'thunder') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>`;
  }
  if (iconType === 'fog') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 10h16"/><path d="M6 6h12"/></svg>`;
  }
  if (iconType === 'snow') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`;
}

function hitungArahMataAngin(deg) {
  if (typeof deg !== 'number') return 'Utara (N)';
  const comp = [
    { label: 'Utara (N)', min: 337.5, max: 360 },
    { label: 'Utara (N)', min: 0, max: 22.5 },
    { label: 'Timur Laut (NE)', min: 22.5, max: 67.5 },
    { label: 'Timur (E)', min: 67.5, max: 112.5 },
    { label: 'Tenggara (SE)', min: 112.5, max: 157.5 },
    { label: 'Selatan (S)', min: 157.5, max: 202.5 },
    { label: 'Barat Daya (SW)', min: 202.5, max: 247.5 },
    { label: 'Barat (W)', min: 247.5, max: 292.5 },
    { label: 'Barat Laut (NW)', min: 292.5, max: 337.5 }
  ];
  for (const c of comp) {
    if (deg >= c.min && deg < c.max) return c.label;
  }
  return 'Utara (N)';
}

function hitungStatusUV(uv) {
  const val = typeof uv === 'number' ? uv : 0;
  if (val < 3) return { text: 'Rendah (Aman)', badge: 'Aman', pct: Math.min(100, Math.round(val / 11 * 100)) };
  if (val < 6) return { text: 'Sedang', badge: 'Sedang', pct: Math.min(100, Math.round(val / 11 * 100)) };
  if (val < 8) return { text: 'Tinggi (Proteksi)', badge: 'Tinggi', pct: Math.min(100, Math.round(val / 11 * 100)) };
  if (val < 11) return { text: 'Sangat Tinggi', badge: 'Ekstrem', pct: Math.min(100, Math.round(val / 11 * 100)) };
  return { text: 'Bahaya Ekstrem', badge: 'Bahaya', pct: 100 };
}

function hitungStatusLembab(h) {
  const val = typeof h === 'number' ? h : 50;
  if (val < 35) return { text: 'Udara Kering', badge: 'Kering' };
  if (val <= 68) return { text: 'Ideal & Nyaman', badge: 'Optimal' };
  if (val <= 85) return { text: 'Cukup Lembap', badge: 'Lembap' };
  return { text: 'Sangat Lembap', badge: 'Tinggi' };
}

async function updateCuaca(force = false) {
  if (!force && Date.now() - _weatherLastFetch < WEATHER_INTERVAL && _weatherDataCache) {
    return;
  }
  _weatherLastFetch = Date.now();

  const loc = getSavedWeatherLocation();
  const badgeCity = document.getElementById('weatherCityBadge');
  if (badgeCity) badgeCity.textContent = loc.name;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}`
      + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m'
      + '&hourly=temperature_2m,weather_code,precipitation_probability'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max'
      + '&timezone=auto&forecast_days=7';

    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) return;

    const data = await res.json();
    _weatherDataCache = data;

    // 1) Update Top Bar (#txtCuaca)
    const t = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    if (typeof t === 'number') {
      const label = getDeskripsiCuaca(code);
      const teksBaru = `${Math.round(t)}°C · ${label}`;
      const el = document.getElementById('txtCuaca');
      if (el && el.textContent !== teksBaru) {
        el.textContent = teksBaru;
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 680);
      }
    }

    // 2) Render Full Weather Modal
    renderWeatherModal(data, loc);
  } catch (e) {
    console.warn('Weather fetch warning:', e);
  }
}

function renderWeatherModal(data, loc) {
  if (!data || !data.current) return;
  const cur = data.current;
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  // Badge city
  const badgeCity = document.getElementById('weatherCityBadge');
  if (badgeCity) badgeCity.textContent = loc.name;

  // Last update time
  const elUpdated = document.getElementById('weatherLastUpdated');
  if (elUpdated) {
    const now = new Date();
    elUpdated.textContent = `Update: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · Auto 15m`;
  }

  // Hero Card
  const elHeroTemp = document.getElementById('weatherHeroTemp');
  if (elHeroTemp) elHeroTemp.textContent = `${Math.round(cur.temperature_2m)}°C`;

  const elHeroCond = document.getElementById('weatherHeroCond');
  if (elHeroCond) elHeroCond.textContent = getDeskripsiCuaca(cur.weather_code);

  const elHeroIcon = document.getElementById('weatherHeroIcon');
  if (elHeroIcon) elHeroIcon.innerHTML = getIconSvgCuaca(cur.weather_code, cur.is_day, 36);

  const elHeroFeels = document.getElementById('weatherHeroFeels');
  if (elHeroFeels) elHeroFeels.textContent = `${Math.round(cur.apparent_temperature)}°C`;

  const max0 = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : '--';
  const min0 = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : '--';
  const elHeroRange = document.getElementById('weatherHeroRange');
  if (elHeroRange) elHeroRange.textContent = `${min0}° / ${max0}°`;

  const precip0 = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
  const elHeroPrecip = document.getElementById('weatherHeroPrecip');
  if (elHeroPrecip) elHeroPrecip.textContent = `${precip0}%`;

  const elHeroPressure = document.getElementById('weatherHeroPressure');
  if (elHeroPressure) elHeroPressure.textContent = `${Math.round(cur.surface_pressure || 1012)} hPa`;

  // Telemetry 4-cards
  const humInfo = hitungStatusLembab(cur.relative_humidity_2m);
  const elValHumidity = document.getElementById('weatherValHumidity');
  if (elValHumidity) elValHumidity.textContent = `${Math.round(cur.relative_humidity_2m)}%`;
  const elBadgeHumidity = document.getElementById('weatherBadgeHumidity');
  if (elBadgeHumidity) elBadgeHumidity.textContent = humInfo.badge;
  const elBarHumidity = document.getElementById('weatherBarHumidity');
  if (elBarHumidity) elBarHumidity.style.width = `${Math.min(100, Math.round(cur.relative_humidity_2m))}%`;
  const elSubHumidity = document.getElementById('weatherSubHumidity');
  if (elSubHumidity) elSubHumidity.textContent = humInfo.text;

  const windDirStr = hitungArahMataAngin(cur.wind_direction_10m);
  const elValWind = document.getElementById('weatherValWind');
  if (elValWind) elValWind.textContent = `${Math.round(cur.wind_speed_10m)} km/h`;
  const elBadgeWind = document.getElementById('weatherBadgeWind');
  if (elBadgeWind) elBadgeWind.textContent = cur.wind_speed_10m > 25 ? 'Kencang' : 'Normal';
  const elSubWind = document.getElementById('weatherSubWind');
  if (elSubWind) elSubWind.textContent = `Arah: ${windDirStr}`;

  const uvVal = daily.uv_index_max ? daily.uv_index_max[0] : 0;
  const uvInfo = hitungStatusUV(uvVal);
  const elValUV = document.getElementById('weatherValUV');
  if (elValUV) elValUV.textContent = `${uvVal}`;
  const elBadgeUV = document.getElementById('weatherBadgeUV');
  if (elBadgeUV) elBadgeUV.textContent = uvInfo.badge;
  const elBarUV = document.getElementById('weatherBarUV');
  if (elBarUV) elBarUV.style.width = `${uvInfo.pct}%`;
  const elSubUV = document.getElementById('weatherSubUV');
  if (elSubUV) elSubUV.textContent = uvInfo.text;

  const rainSum = cur.precipitation || 0;
  const elValRainSum = document.getElementById('weatherValRainSum');
  if (elValRainSum) elValRainSum.textContent = `${rainSum.toFixed(1)} mm`;
  const elBadgeRain = document.getElementById('weatherBadgeRain');
  if (elBadgeRain) elBadgeRain.textContent = rainSum > 0 ? 'Ada Hujan' : 'Kering';

  // 24h Hourly Forecast
  const hourlySlider = document.getElementById('weatherHourlySlider');
  if (hourlySlider && hourly.time && hourly.time.length) {
    const curHourIso = (cur.time || '').slice(0, 13);
    let startIdx = hourly.time.findIndex(t => t.startsWith(curHourIso));
    if (startIdx < 0) startIdx = 0;

    let hourlyHtml = '';
    for (let i = startIdx; i < Math.min(startIdx + 24, hourly.time.length); i++) {
      const isNow = i === startIdx;
      const tIso = hourly.time[i];
      const hourLabel = isNow ? 'Sekarang' : (tIso.split('T')[1] || '').slice(0, 5);
      const tempVal = Math.round(hourly.temperature_2m[i]);
      const wCode = hourly.weather_code[i];
      const pProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
      const hIsDay = parseInt((tIso.split('T')[1] || '12').slice(0, 2), 10) >= 6 && parseInt((tIso.split('T')[1] || '12').slice(0, 2), 10) < 18 ? 1 : 0;

      hourlyHtml += `
        <div class="weather-hour-col ${isNow ? 'now' : ''}">
          <span class="weather-hour-time">${hourLabel}</span>
          <div style="display:flex; justify-content:center; height:24px;">${getIconSvgCuaca(wCode, hIsDay, 20)}</div>
          <span class="weather-hour-temp">${tempVal}°</span>
          <span class="weather-hour-precip">💧 ${pProb}%</span>
        </div>`;
    }
    hourlySlider.innerHTML = hourlyHtml;
  }

  // 7-Day Forecast List
  const dailyList = document.getElementById('weatherDailyList');
  if (dailyList && daily.time && daily.time.length) {
    let dailyHtml = '';
    const namaHariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 0; i < daily.time.length; i++) {
      const dStr = daily.time[i];
      let dayName = i === 0 ? 'Hari ini' : (i === 1 ? 'Besok' : '');
      if (!dayName) {
        const dObj = new Date(dStr + 'T00:00:00');
        dayName = namaHariList[dObj.getDay()] || dStr;
      }

      const wCode = daily.weather_code[i];
      const minT = Math.round(daily.temperature_2m_min[i]);
      const maxT = Math.round(daily.temperature_2m_max[i]);
      const pMax = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
      const labelW = getDeskripsiCuaca(wCode);

      dailyHtml += `
        <div class="weather-day-row">
          <div class="weather-day-name">${dayName}</div>
          <div class="weather-day-cond-wrap">
            ${getIconSvgCuaca(wCode, 1, 16)}
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${labelW}</span>
          </div>
          <div class="weather-day-temp-range">
            <span style="color:#94a3b8;">${minT}°</span>
            <div class="weather-day-bar-wrap">
              <div class="weather-day-bar-fill" style="left:10%; right:10%;"></div>
            </div>
            <span style="color:#f8fafc; font-weight:600;">${maxT}°</span>
          </div>
          <div class="weather-day-precip-col">💧 ${pMax}%</div>
        </div>`;
    }
    dailyList.innerHTML = dailyHtml;
  }

  // AI Assistant Advice
  const adviceEl = document.getElementById('weatherAiAdviceTxt');
  if (adviceEl) {
    let advice = `Kondisi di ${loc.name} saat ini ${getDeskripsiCuaca(cur.weather_code)} (${Math.round(cur.temperature_2m)}°C). `;
    if (precip0 >= 50) {
      advice += `Peluang hujan tinggi (${precip0}%). Sebaiknya siapkan payung atau jas hujan jika bepergian. `;
    } else {
      advice += `Cuaca cenderung bersahabat dengan peluang hujan ${precip0}%. `;
    }
    if (uvVal >= 6) {
      advice += `Indeks UV tergolong tinggi (${uvVal}), gunakan pelindung sinar matahari. `;
    }
    advice += `Kelembaban udara saat ini ${Math.round(cur.relative_humidity_2m)}% (${humInfo.text}).`;
    adviceEl.textContent = advice;
  }

  // AURA NEXT GEN: Update Dual Preview Widget Card (Cuaca)
  if (typeof perbaruiWidgetWeatherPreview === 'function') {
    perbaruiWidgetWeatherPreview(data, loc);
  }
}

function bukaWeatherModal() {
  const backdrop = document.getElementById('weatherModalBackdrop');
  const panel = document.getElementById('weatherModalPanel');
  if (!backdrop || !panel) return;

  // Highlight active city chip
  const loc = getSavedWeatherLocation();
  const chips = document.querySelectorAll('.weather-chip');
  chips.forEach(chip => {
    if (chip.getAttribute('data-name') === loc.name) chip.classList.add('active');
    else chip.classList.remove('active');
  });

  backdrop.classList.add('visible');
  panel.classList.add('visible');
  updateCuaca(false);
}

function tutupWeatherModal() {
  const backdrop = document.getElementById('weatherModalBackdrop');
  const panel = document.getElementById('weatherModalPanel');
  if (backdrop) backdrop.classList.remove('visible');
  if (panel) panel.classList.remove('visible');
  const cityTray = document.getElementById('weatherCityTray');
  if (cityTray) cityTray.style.display = 'none';
}

function bicaraRingkasanCuaca() {
  if (!_weatherDataCache || !_weatherDataCache.current) {
    if (typeof ucapkanDiBrowser === 'function') {
      ucapkanDiBrowser('Data cuaca sedang dimuat, mohon tunggu sebentar.');
    }
    return;
  }
  const cur = _weatherDataCache.current;
  const loc = getSavedWeatherLocation();
  const cond = getDeskripsiCuaca(cur.weather_code);
  const temp = Math.round(cur.temperature_2m);
  const feels = Math.round(cur.apparent_temperature);
  const daily = _weatherDataCache.daily || {};
  const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;

  let kalimat = `Laporan cuaca untuk ${loc.name}. Saat ini ${cond}, suhu ${temp} derajat celcius, terasa seperti ${feels} derajat. Peluang hujan hari ini ${precip} persen.`;
  if (typeof ucapkanDiBrowser === 'function') {
    ucapkanDiBrowser(kalimat);
  }
}

// Inisialisasi Event Listener Weather Dashboard
(() => {
  const elCuacaPill = document.getElementById('txtCuaca');
  if (elCuacaPill) {
    elCuacaPill.addEventListener('click', bukaWeatherModal);
  }

  const btnCuacaRadar = document.getElementById('btnCuacaRadar');
  if (btnCuacaRadar) {
    btnCuacaRadar.addEventListener('click', () => {
      const panelDrawer = document.querySelector('.top-right');
      if (panelDrawer && panelDrawer.classList.contains('drawer-aktif')) {
        const btnDrawer = document.getElementById('btnDrawer');
        const backdropDrawer = document.getElementById('drawerBackdrop');
        if (btnDrawer) btnDrawer.classList.remove('aktif');
        if (backdropDrawer) backdropDrawer.classList.remove('aktif');
        panelDrawer.classList.remove('drawer-aktif');
      }
      bukaWeatherModal();
    });
  }

  const btnClose = document.getElementById('btnTutupWeatherModal');
  if (btnClose) btnClose.addEventListener('click', tutupWeatherModal);

  const backdrop = document.getElementById('weatherModalBackdrop');
  if (backdrop) backdrop.addEventListener('click', tutupWeatherModal);

  const btnRefresh = document.getElementById('btnWeatherRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      btnRefresh.style.transform = 'rotate(360deg)';
      updateCuaca(true);
      setTimeout(() => { btnRefresh.style.transform = 'none'; }, 600);
    });
  }

  const btnToggleCity = document.getElementById('btnToggleCityPicker');
  const cityTray = document.getElementById('weatherCityTray');
  if (btnToggleCity && cityTray) {
    btnToggleCity.addEventListener('click', () => {
      cityTray.style.display = cityTray.style.display === 'none' ? 'block' : 'none';
    });
  }

  // City chips
  const chips = document.querySelectorAll('.weather-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const name = chip.getAttribute('data-name');
      const lat = parseFloat(chip.getAttribute('data-lat'));
      const lon = parseFloat(chip.getAttribute('data-lon'));
      saveWeatherLocation(name, lat, lon);
      cityTray.style.display = 'none';
      updateCuaca(true);
    });
  });

  // GPS Auto Button
  const btnGPS = document.getElementById('btnWeatherGPS');
  if (btnGPS) {
    btnGPS.addEventListener('click', () => {
      if (!('geolocation' in navigator)) {
        alert('Browser ini tidak mendukung GPS Geolocation.');
        return;
      }
      btnGPS.textContent = '📍 Mendeteksi...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btnGPS.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="7"/></svg><span>GPS Auto</span>';
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          saveWeatherLocation('Lokasi GPS Anda', lat, lon);
          updateCuaca(true);
        },
        (err) => {
          btnGPS.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="7"/></svg><span>GPS Auto</span>';
          alert('Gagal mendapatkan lokasi GPS: ' + (err.message || 'Izin ditolak'));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  const btnSpeak = document.getElementById('btnWeatherSpeak');
  if (btnSpeak) {
    btnSpeak.addEventListener('click', bicaraRingkasanCuaca);
  }

  // Esc key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('weatherModalPanel');
      if (panel && panel.classList.contains('visible')) {
        tutupWeatherModal();
      }
    }
  });
})();

// Panggil sekali saat buka
updateCuaca();
// (interval cuaca dipindah ke _mulaiPolling di bawah, supaya ikut pause saat tab hidden)
