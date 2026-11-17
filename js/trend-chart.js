/* ============================================================
   AURA NEXT GEN: 24H TREND CHART (CHART.JS)
   ============================================================ */
// ============ TREN HISTORI (Chart.js) ============
// Filter berdasarkan TIMESTAMP (bukan jumlah entri), jadi interval kirim ESP32 (5/10 menit) tidak masalah.
const INTERVAL_SAMPLE_MENIT = 5; // perkiraan saja, bukan patokan limit
let chartHistori = null;
let timerTren = null;

async function fetchHistori(menit) {
  // Ambil SEMUA histori tanpa query param: tidak butuh .indexOn, tidak ada masalah urutan/limit.
  // Cocok selama datanya masih ratusan/ribuan entri.
  const url = FIREBASE_DB_URL + '/histori.json';
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data || typeof data !== 'object') return [];

  const cutoffMs = Date.now() - menit * 60 * 1000;
  const semua = Object.values(data);

  // DEBUG: lihat di DevTools > Console (hapus kalau sudah beres)
  console.log('[Histori] total entri:', semua.length,
              '| range:', menit, 'menit',
              '| cutoff:', new Date(cutoffMs).toLocaleString('en-US'),
              '| contoh:', semua[0]);

  const hasil = semua
    .filter(r => r && typeof r.ts === 'number')
    .map(r => Object.assign({}, r, { tMs: r.ts > 1e12 ? r.ts : r.ts * 1000 }))
    .filter(r => r.tMs >= cutoffMs)
    .sort((a, b) => a.tMs - b.tMs);
  console.log('[Histori] lolos filter waktu:', hasil.length);
  return hasil;
}

/* ===== TOOLTIP CUSTOM (external handler) ===== */
function tooltipExternalHandler(context) {
  const { chart, tooltip } = context;
  const el = document.getElementById('trendTooltip');
  if (!el) return;

  // Sembunyikan saat tidak ada item
  if (tooltip.opacity === 0) {
    el.classList.remove('show');
    return;
  }

  // Bangun isi tooltip
  if (tooltip.dataPoints && tooltip.dataPoints.length) {
    const dp = tooltip.dataPoints[0];
    const rawTs = chart.data.__ts?.[dp.dataIndex];
    const tanggal = rawTs
      ? new Date(rawTs).toLocaleString('en-US', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
      : tooltip.title?.[0] || '';

    const baris = tooltip.dataPoints.map((p) => {
      const ds = chart.data.datasets[p.datasetIndex];
      const raw = ds.data[p.dataIndex];
      const angka = typeof raw === 'number' ? raw.toFixed(1) : '—';
      const satuan = ds.yAxisID === 'y1' ? '%' : '°C';
      const kelas = ds.yAxisID === 'y1' ? 'tt-row--lembab' : 'tt-row--suhu';
      const label = ds.yAxisID === 'y1' ? 'Humidity' : 'Temperature';
      return `<div class="tt-row ${kelas}">
                <span class="tt-dot"></span>
                <span class="tt-label">${label}</span>
                <span class="tt-value">${angka}${satuan}</span>
              </div>`;
    }).join('');

    el.innerHTML = `
      <div class="tt-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 2"/>
        </svg>
        <span>${tanggal}</span>
      </div>
      ${baris}
    `;
  }

  // --- Hitung posisi (flip kalau mepet tepi kanan) ---
  const elW = el.offsetWidth;
  const elH = el.offsetHeight;
  const canvasW = chart.canvas.clientWidth;
  const canvasH = chart.canvas.clientHeight;

  let x = tooltip.caretX + 14;
  let y = tooltip.caretY - elH / 2;
  if (x + elW > canvasW - 4) x = tooltip.caretX - elW - 14;
  if (x < 4) x = 4;
  if (y < 4) y = 4;
  if (y + elH > canvasH - 4) y = canvasH - elH - 4;

  // --- Terapkan posisi ---
  // Kalau tooltip lagi HIDDEN → set posisi tanpa transisi (biar tidak "terbang"
  // dari posisi lama), lalu baru tampilkan.
  // Kalau sudah tampil → biarkan transisi 120ms yang mulusin gerakan.
  const sudahTampil = el.classList.contains('show');

  if (!sudahTampil) {
    el.style.transition = 'none';
    el.style.setProperty('--tt-x', x + 'px');
    el.style.setProperty('--tt-y', y + 'px');
    void el.offsetWidth;                  // paksa reflow
    el.style.transition = '';             // balikin ke transisi dari CSS
    el.classList.add('show');
  } else {
    el.style.setProperty('--tt-x', x + 'px');
    el.style.setProperty('--tt-y', y + 'px');
  }
}

function renderHistori(rows) {
  document.getElementById('trenKosong').style.display = rows.length ? 'none' : 'flex';
  if (typeof Chart === 'undefined') return;
  const labels = rows.map(r => new Date(r.tMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const suhu = rows.map(r => r.suhu);
  const lembab = rows.map(r => r.lembab);
  if (chartHistori) chartHistori.destroy();
  chartHistori = new Chart(document.getElementById('chartHistori'), {
    type: 'line',
    data: { labels, __ts: rows.map(r => r.tMs), datasets: [
      { label: 'Temperature (°C)', data: suhu, borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.12)',
        yAxisID: 'y', tension: 0.3, pointRadius: 0, borderWidth: 2, fill: true },
      { label: 'Humidity (%)', data: lembab, borderColor: '#4dabf7', backgroundColor: 'rgba(77,171,247,0.12)',
        yAxisID: 'y1', tension: 0.3, pointRadius: 0, borderWidth: 2, fill: true },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: document.documentElement.classList.contains('perf-lite')
        ? { duration: 300, easing: 'linear' }
        : {
            duration: 1300,
            easing: 'easeOutQuart',
            delay: (ctx) => {
              // Stagger kiri→kanan, total dibatasi ~900ms berapa pun jumlah titiknya
              if (ctx.type === 'data' && ctx.mode === 'default') {
                return Math.round(ctx.dataIndex / Math.max(rows.length - 1, 1) * 900);
              }
              return 0;
            }
          },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x:  { ticks: { maxTicksLimit: 8, color: '#888780' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y:  { position: 'left',  title: { display: true, text: '°C', color: '#ff6b6b' }, ticks: { color: '#ff6b6b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y1: { position: 'right', title: { display: true, text: '%', color: '#4dabf7' }, ticks: { color: '#4dabf7' }, grid: { drawOnChartArea: false } },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#b4b2a9',
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 14,
            font: { size: 11.5, weight: '600' }
          }
        },
        tooltip: {
          enabled: false,                    // matikan tooltip bawaan
          external: tooltipExternalHandler,  // pakai handler custom kita
          mode: 'index',
          intersect: false,
          position: 'nearest',
        },
      },
    },
  });
}

const RANGE_MENIT = 1440; // 24 jam, tetap

async function refreshHistori() {
  try {
    const rows = await fetchHistori(RANGE_MENIT);
    // panel sudah ditutup selagi fetch berjalan -> jangan bangun chart lagi
    if (!document.getElementById('trendPanel').classList.contains('visible')) return;
    renderHistori(rows);
  } catch (e) { /* jaringan putus: biarkan grafik terakhir */ }
}

function bukaTren(buka) {
  document.getElementById('trendPanel').classList.toggle('visible', buka);
  document.getElementById('trendBackdrop').classList.toggle('visible', buka);
  document.getElementById('btnTren').classList.toggle('active', buka);
  document.getElementById('btnTren').classList.toggle('cloud-active', buka);
  clearInterval(timerTren);
  if (buka) { refreshHistori(); timerTren = setInterval(refreshHistori, 60000); }
  else {
    // destroy chart saat panel ditutup (bebaskan memory + canvas render loop)
    if (chartHistori) { chartHistori.destroy(); chartHistori = null; }
  }
}
document.getElementById('btnTren').addEventListener('click', () =>
  bukaTren(!document.getElementById('trendPanel').classList.contains('visible')));
document.getElementById('btnTutupTren').addEventListener('click', () => bukaTren(false));
document.getElementById('trendBackdrop').addEventListener('click', () => bukaTren(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('trendPanel').classList.contains('visible')) bukaTren(false);
});
