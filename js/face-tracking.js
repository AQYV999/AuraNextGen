/* ============================================================
   AURA NEXT GEN: FACE TRACKING & MICRO-EXPRESSIONS
   ============================================================ */
/* ===== FACE TRACKING: wajah menoleh ke arah kursor / sentuhan =====
   Menggeser seluruh grup mata (.eye-shift) — tidak mengganggu animasi
   kedip / lirik / mikir yang jalan di dalamnya. Arah dibatasi 2.8px
   supaya wajah tidak terlihat "keluar dari socket". */
const eyeShift = document.querySelector('.eye-shift');
let _rafArah = null, _lastX = 0, _lastY = 0;

function _trackMata(x, y) {
  if (!eyeShift) return;
  const rect = faceSvg.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  let dx = x - cx, dy = y - cy;
  const dist = Math.hypot(dx, dy) || 1;
  // Normalisasi: makin jauh kursor, makin besar offset — max 2.8px
  const mag = Math.min(dist / Math.max(rect.width, rect.height) * 1.8, 1) * 2.8;
  dx = dx / dist * mag;
  dy = dy / dist * mag;
  eyeShift.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
}

const _liteWajah = () => document.documentElement.classList.contains('perf-lite');
let _tTrackTerakhir = 0;

function arahkanMata(x, y) {
  _lastX = x; _lastY = y;
  // Lite (tablet/HP): maks ~10x/detik. Tiap geseran = repaint SVG wajah layar-penuh.
  if (_liteWajah()) {
    const n = performance.now();
    if (n - _tTrackTerakhir < 100) return;
    _tTrackTerakhir = n;
  }
  if (_rafArah) return;                 // throttle via rAF
  _rafArah = requestAnimationFrame(() => {
    _rafArah = null;
    _trackMata(_lastX, _lastY);
  });
}

function lepasArahMata() {
  if (_rafArah) { cancelAnimationFrame(_rafArah); _rafArah = null; }
  if (eyeShift) eyeShift.style.transform = 'translate(0px, 0px)';
}

// Desktop: tracking halus sepanjang waktu
if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => arahkanMata(e.clientX, e.clientY), { passive: true });
  document.documentElement.addEventListener('mouseleave', lepasArahMata);
}

// HP/tablet: menoleh ke arah jari, lalu balik ke tengah setelah jari dilepas
document.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (t) arahkanMata(t.clientX, t.clientY);
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  // Lite: jangan melacak jari saat scroll/geser (menggambar ulang wajah tiap frame
  // bersaing dengan scroll chat). Cukup menoleh saat jari pertama menyentuh.
  if (_liteWajah()) return;
  const t = e.touches[0];
  if (t) arahkanMata(t.clientX, t.clientY);
}, { passive: true });
document.addEventListener('touchend', () => {
  setTimeout(lepasArahMata, 450);
}, { passive: true });

// Haptic kecil untuk semua tombol utama saat ditekan (hanya di touch device)
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch') return;
  if (e.target.closest('.toggle-btn, .clear-btn, .min-btn, .drawer-btn, .lock-submit')) {
    getar(6);
  }
}, { passive: true });
let ekspresiTerkunci = false;

// state = ekspresi utama (senang/netral/sedih/mikir/kaget/ngantuk/cinta/offline) — TIDAK berubah.
// variant = variasi kecil di atas state itu (kedip, lirik, senyum kecil, dst). Opsional.
function terapkanEkspresi(state, variant) {
  faceSvg.setAttribute('data-state', state);
  faceSvg.setAttribute('data-variant', variant || 'none');
}

let modeSaatIni = 'standalone';
