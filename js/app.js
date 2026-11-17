/* ============================================================
   AURA NEXT GEN: APP CONTROLLER, LOCK SCREEN & ENVIRONMENT
   ============================================================ */
/* ============================================================
   DRAWER PANEL — hanya jalan di HP (<= 768px)
   ============================================================ */
(() => {
  const btnDrawer      = document.getElementById('btnDrawer');
  const backdropDrawer = document.getElementById('drawerBackdrop');
  const panelDrawer    = document.querySelector('.top-right');
  if (!btnDrawer || !backdropDrawer || !panelDrawer) return;

  function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }

  function bukaDrawer() {
    btnDrawer.classList.add('aktif');
    backdropDrawer.classList.add('aktif');
    panelDrawer.classList.add('drawer-aktif');
  }
  function tutupDrawer() {
    btnDrawer.classList.remove('aktif');
    backdropDrawer.classList.remove('aktif');
    panelDrawer.classList.remove('drawer-aktif');
  }
  function toggleDrawer() {
    if (panelDrawer.classList.contains('drawer-aktif')) tutupDrawer();
    else bukaDrawer();
  }

  btnDrawer.addEventListener('click', toggleDrawer);
  backdropDrawer.addEventListener('click', tutupDrawer);

  // Panel Tren tampil di bawah drawer (z-index lebih rendah), jadi tutup
  // drawer saat tombol Tren ditekan supaya grafiknya langsung kelihatan.
  const btnTren = document.getElementById('btnTren');
  if (btnTren) btnTren.addEventListener('click', () => { if (isMobile()) tutupDrawer(); });

  // Tutup drawer kalau user pindah ke layar desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) tutupDrawer();
  });

  // Esc untuk menutup (untuk yang pakai keyboard di tablet)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelDrawer.classList.contains('drawer-aktif')) {
      tutupDrawer();
    }
  });
})();

muatDanRenderRiwayat(); // ambil dari Firebase (fallback ke cache lokal)
pilihMode('cloud');
pilihTts(ttsAktif, false); // cuma tampilan; nilai asli diambil dari Firebase lewat cekStatus()
pilihTtsLokal(ttsLokalAktif, false); // cuma tampilan; nilai asli dari Firebase
ambilTtsLokalDariFirebase();
setInterval(ambilTtsLokalDariFirebase, 15000);   // <-- BARIS BARU
cekStatus();
cekOllamaDirect(true);                 // sekali pas dashboard dibuka

/* Polling berhenti saat tab hidden, lanjut + refresh saat tab kembali aktif */
let _pollIds = { status: null, ollama: null, weather: null };
function _mulaiPolling() {
  if (_pollIds.status) return;
  _pollIds.status  = setInterval(() => { if (!document.hidden) cekStatus(); }, 3000);
  _pollIds.ollama  = setInterval(() => { if (!document.hidden) cekOllamaDirect(true); }, 30000);
  _pollIds.weather = setInterval(() => { if (!document.hidden) updateCuaca(); }, WEATHER_INTERVAL);
}
function _stopPolling() {
  clearInterval(_pollIds.status);  _pollIds.status = null;
  clearInterval(_pollIds.ollama);  _pollIds.ollama = null;
  clearInterval(_pollIds.weather); _pollIds.weather = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) _stopPolling();
  else { _mulaiPolling(); cekStatus(); updateCuaca(); }
});
_mulaiPolling();
mulaiEkspresiOtomatis(); // wajah AURA mulai "hidup" dari saat dashboard dibuka

/* ============================================================
   MODE GRAFIS — Toggle + localStorage + auto-detect FPS
   ============================================================ */
const PERF_KEY = 'aura_perf2';   // key baru: pilihan lama (sering tersangkut 'full') di-reset sekali

function _perangkatLemah() {
  const mm = (q) => window.matchMedia && matchMedia(q).matches;
  // Tablet Android yang dipasangi keyboard/mouse atau mode "Desktop site" bisa
  // melapor pointer:fine -> lolos dari cek lama. maxTouchPoints tetap terdeteksi.
  const layarTouchKecil = (navigator.maxTouchPoints || 0) > 0 &&
                          Math.max(screen.width, screen.height) <= 1400;
  return mm('(pointer: coarse)') || mm('(hover: none)') || layarTouchKecil ||
         (navigator.hardwareConcurrency || 8) <= 4 ||
         (navigator.deviceMemory || 8) <= 4;
}
let perfLite = false;

function _bacaPerf() {
  try {
    const v = localStorage.getItem(PERF_KEY);
    return (v === 'lite' || v === 'full') ? v : null;
  } catch (e) { return null; }
}
function _simpanPerf(v) {
  try { localStorage.setItem(PERF_KEY, v); } catch (e) {}
}

function terapkanPerf(lite, simpan) {
  perfLite = !!lite;
  document.documentElement.classList.toggle('perf-lite', perfLite);

  const lbl = document.getElementById('perfLbl');
  const btn = document.getElementById('btnPerf');
  if (lbl) lbl.textContent = perfLite ? 'Graphics: OFF' : 'Graphics: ON';
  if (btn) btn.classList.toggle('is-off', perfLite);

  if (simpan) _simpanPerf(perfLite ? 'lite' : 'full');

  // Chart yang sedang tampil: rebuild supaya animasinya ikut setting baru
  if (typeof chartHistori !== 'undefined' && chartHistori) {
    try {
      if (typeof refreshHistori === 'function' &&
          document.getElementById('trendPanel')?.classList.contains('visible')) {
        refreshHistori();
      }
    } catch (e) {}
  }
}

const _btnPerf = document.getElementById('btnPerf');
if (_btnPerf) {
  _btnPerf.addEventListener('click', () => terapkanPerf(!perfLite, true));
}

(function initPerf() {
  const tersimpan = _bacaPerf();
  if (tersimpan) { terapkanPerf(tersimpan === 'lite', false); return; }

  // Tablet / HP / perangkat lemah: langsung mode ringan (tanpa menunggu ukur FPS).
  // Bisa dinyalakan manual lewat tombol Graphics, dan pilihan itu diingat.
  if (_perangkatLemah()) { terapkanPerf(true, false); return; }

  // Belum ada pilihan -> ukur FPS ~2.5 detik (lewati 1 detik pertama karena
  // page load masih berat), kalau < 45 auto-lite (tanpa disimpan).
  // Batal kalau tab sempat disembunyikan (frame berhenti = bukan karena device lemot).
  const WARMUP = 1000;
  const t00 = performance.now();
  let frames = 0, start = 0, prev = 0;
  function ukur(now) {
    if (now - t00 < WARMUP) { prev = now; requestAnimationFrame(ukur); return; }
    if (prev && now - prev > 250) return;   // ada jeda besar -> batalkan pengukuran
    prev = now;
    if (!start) start = now;
    frames++;
    const elapsed = now - start;
    if (elapsed < 2500) { requestAnimationFrame(ukur); return; }
    const fps = (frames - 1) / (elapsed / 1000);
    if (fps < 45) terapkanPerf(true, false);
  }
  requestAnimationFrame(ukur);
})();

/* ============================================================
   PANDUAN LOCAL AI — tombol pojok kiri bawah + panel modal
   ============================================================ */
(() => {
  const btn      = document.getElementById('btnGuide');
  const panel    = document.getElementById('guidePanel');
  const backdrop = document.getElementById('guideBackdrop');
  const closeBtn = document.getElementById('guideClose');
  const okBtn    = document.getElementById('guideOk');
  if (!btn || !panel || !backdrop) return;

  // Tab switching
  const tabs = panel.querySelectorAll('.guide-tab');
  const bodies = panel.querySelectorAll('.guide-body');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('aktif', t === tab));
      bodies.forEach(b => b.classList.toggle('aktif', b.dataset.tabContent === target));
    });
  });

  function bukaGuide() { btn.classList.add('aktif'); panel.classList.add('visible'); backdrop.classList.add('visible'); }
  function tutupGuide() { btn.classList.remove('aktif'); panel.classList.remove('visible'); backdrop.classList.remove('visible'); }
  function toggleGuide() { panel.classList.contains('visible') ? tutupGuide() : bukaGuide(); }

  btn.addEventListener('click', toggleGuide);
  backdrop.addEventListener('click', tutupGuide);
  closeBtn.addEventListener('click', tutupGuide);
  okBtn.addEventListener('click', tutupGuide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('visible')) tutupGuide();
  });

  panel.querySelectorAll('.guide-copy').forEach((copyBtn) => {
    copyBtn.addEventListener('click', async () => {
      const teks = copyBtn.getAttribute('data-copy') || '';
      if (!teks) return;
      try {
        await navigator.clipboard.writeText(teks);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = teks; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
      copyBtn.classList.add('copied');
      const oldHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.innerHTML = oldHTML; }, 1400);
    });
  });
})();

/* ============================================================
   AURA FX LAYER — neural cells, radar sweep, particle flow, heartbeat
   Mengikuti data-state, data-bicara, .dot.online, teks #valRadar.
   ============================================================ */
(() => {
  const canvas = document.getElementById('auraFx');
  return; // Disabled: replaced by clean AURA Typography Core
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // PERF: DPR FULL maks 1.5 (piksel canvas turun ~44% di layar retina)
  let DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const dotEl = document.getElementById('dotStatus');
  const radarEl = document.getElementById('valRadar');

  let W = 0, H = 0, cx = 0, cy = 0, scale = 1;

  const F = {
    level: 0.35, flow: 0, speak: 0, target: 0, targetPresent: false,
    targetAngle: Math.random() * Math.PI * 2,
    heartPhase: 0, heartPeriod: 3.4, reaction: 0,
    lastRadarText: '', rgb: { r: 93, g: 202, b: 165 },
    lastStateAttr: null, radarTick: 0,
  };

  const NODES = [];
  let NODE_COUNT = 26;
  const PARTICLES = [];
  let MAX_PARTICLES = 36;
  let _liteState = false;
  const _lockEl = document.getElementById('lockOverlay');

  function _syncPerfCanvas() {
    const lite = document.documentElement.classList.contains('perf-lite');
    if (lite === _liteState) return;
    _liteState = lite;
    DPR            = lite ? 0.75 : Math.min(window.devicePixelRatio || 1, 1.5);   // lite: 56% piksel (efek glow, tak butuh tajam)
    NODE_COUNT     = lite ? 10 : 26;
    MAX_PARTICLES  = lite ? 8 : 36;
    if (PARTICLES.length > MAX_PARTICLES) PARTICLES.length = MAX_PARTICLES;
    resize();  // set ulang ukuran canvas, transform ctx, & rebuild NODES
  }

  function parseRGB(str) {
    if (!str) return null;
    str = str.trim();
    if (str.startsWith('rgb')) {
      const m = str.match(/(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/);
      if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    }
    if (str.startsWith('#')) {
      const h = str.slice(1);
      if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
      if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
    }
    return null;
  }

  function rebuildNodes() {
    NODES.length = 0;
    const rMin = scale * 27, rMax = scale * 48;
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = (i / NODE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      NODES.push({
        angle: a, radius: rMin + Math.random() * (rMax - rMin),
        vAng: (Math.random() - 0.5) * 0.09,
        vRad: (Math.random() - 0.5) * 6,
        phase: Math.random() * Math.PI * 2,
        pulseSpd: 0.4 + Math.random() * 0.9,
        size: 0.8 + Math.random() * 0.9,
        active: Math.random() < 0.28, x: 0, y: 0,
      });
    }
  }

  // Pre-load web fonts into canvas memory
    if (document.fonts) {
    document.fonts.load('800 156px "Bodoni Moda"').catch(() => {});
    document.fonts.load('800 64px "Cinzel"').catch(() => {});
    document.fonts.load('800 64px "Playfair Display"').catch(() => {});
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width  = Math.max(1, Math.floor(W * DPR));
    canvas.height = Math.max(1, Math.floor(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // SVG pakai viewBox 100x100 + meet → skala mengikuti sisi terpendek
    scale = Math.min(W, H) / 100;
    cx = W / 2;
    cy = H / 2 - 2 * scale; // pusat wajah di y=48 dari 100
    rebuildNodes();
    PARTICLES.length = 0;
  }

  function refreshColor() {
    const st = faceSvg.getAttribute('data-state') || '';
    if (st === F.lastStateAttr) return;
    F.lastStateAttr = st;
    const rgb = parseRGB(getComputedStyle(faceSvg).color);
    if (rgb) F.rgb = rgb;
  }

  function readState(dt) {
    const st = faceSvg.getAttribute('data-state') || 'netral';
    const speaking = faceSvg.getAttribute('data-bicara') === 'on';
    const online = dotEl ? dotEl.classList.contains('online') : false;

    let target;
    if (!online || st === 'offline') target = 0.18;
    else if (st === 'mikir') target = 1.0;
    else if (speaking) target = 0.75;
    else if (st === 'senang' || st === 'cinta' || st === 'kaget') target = 0.7;
    else target = 0.48;
    F.level += (target - F.level) * Math.min(1, dt * 3);

    const flowTarget = (st === 'mikir' && online) ? 1 : 0;
    F.flow += (flowTarget - F.flow) * Math.min(1, dt * 2.5);
    F.speak += ((speaking ? 1 : 0) - F.speak) * Math.min(1, dt * 6);

    let period = 3.4;
    if (!online || st === 'offline') period = 0;
    else if (st === 'mikir') period = 1.25;
    else if (speaking) period = 0.9;
    else if (st === 'senang' || st === 'cinta') period = 2.4;
    else if (st === 'ngantuk') period = 5.2;
    F.heartPeriod = period;
    if (period > 0) F.heartPhase = (F.heartPhase + dt / period) % 1;

    // Radar: cek teks tiap ~0.4s, bukan tiap frame
    F.radarTick += dt;
    if (radarEl && F.radarTick > 0.4) {
      F.radarTick = 0;
      const txt = (radarEl.textContent || '').toLowerCase();
      if (txt !== F.lastRadarText) {
        F.lastRadarText = txt;
        const has = /person|human|motion|moving|still|target|detected/.test(txt)
                    && !/no target|no person|no motion|empty|^--/.test(txt);
        if (has && !F.targetPresent) {
          F.targetAngle = Math.random() * Math.PI * 2;
          F.reaction = 1.0;
        }
        F.targetPresent = has;
      }
    }
    F.target += ((F.targetPresent ? 1 : 0) - F.target) * Math.min(1, dt * 3);
    F.reaction *= Math.pow(0.25, dt);
  }

  let _hbCache = { key: '', grd: null };
  function drawHeartbeat() {
    const { r, g, b } = F.rgb;
    if (F.heartPeriod <= 0) return;
    const pulse = 0.5 + 0.5 * Math.sin(F.heartPhase * Math.PI * 2);
    const alpha = (0.045 + 0.075 * pulse) * F.level * (1 + F.reaction * 1.6);
    if (alpha <= 0.002) return;
    const rad = scale * 32;
    const key = r + ',' + g + ',' + b + '|' + rad.toFixed(1) + '|' + cx.toFixed(1) + '|' + cy.toFixed(1);
    if (_hbCache.key !== key) {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grd.addColorStop(0,    `rgba(${r},${g},${b},1)`);
      grd.addColorStop(0.55, `rgba(${r},${g},${b},0.32)`);
      grd.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      _hbCache = { key, grd };
    }
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = _hbCache.grd;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawRadar(t) {
    const online = dotEl ? dotEl.classList.contains('online') : false;
    if (!online) return;
    const { r, g, b } = F.rgb;
    const baseA = 0.05 + F.target * 0.13;

    const rings = [30, 38, 46];
    ctx.lineWidth = 1;
    for (let i = 0; i < rings.length; i++) {
      ctx.strokeStyle = `rgba(${r},${g},${b},${baseA * (1 - i * 0.16)})`;
      ctx.beginPath(); ctx.arc(cx, cy, scale * rings[i], 0, Math.PI * 2); ctx.stroke();
    }

    if (F.target > 0.05) {
      const pulse = 0.55 + 0.45 * Math.sin(t * 4.5);
      const tr = scale * (20 + 7 * Math.sin(t * 0.55));
      const tx = cx + Math.cos(F.targetAngle) * tr;
      const ty = cy + Math.sin(F.targetAngle) * tr;
      const a = F.target * pulse;
      ctx.beginPath(); ctx.arc(tx, ty, 5 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.14})`; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 2 + pulse * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.95})`; ctx.fill();
    }

    if (F.reaction > 0.02) {
      ctx.beginPath();
      ctx.arc(cx, cy, (1 - F.reaction) * scale * 55, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${F.reaction * 0.42})`;
      ctx.lineWidth = 1.6; ctx.stroke();
    }
  }

  function drawNeural(t, dt, level) {
    const { r, g, b } = F.rgb;
    const online = dotEl ? dotEl.classList.contains('online') : false;
    const gAlpha = level * (online ? 1 : 0.5);
    const speed = 0.55 + level * 1.35;
    const rMin = scale * 27, rMax = scale * 48;

    for (const n of NODES) {
      n.angle += n.vAng * dt * speed;
      n.radius += n.vRad * dt * speed;
      if (n.radius < rMin) { n.radius = rMin; n.vRad = Math.abs(n.vRad); }
      if (n.radius > rMax) { n.radius = rMax; n.vRad = -Math.abs(n.vRad); }
      n.phase += n.pulseSpd * dt * (0.7 + level * 1.6);
      n.x = cx + Math.cos(n.angle) * n.radius;
      n.y = cy + Math.sin(n.angle) * n.radius;
    }

    const connDist = scale * 17, connDist2 = connDist * connDist;
    ctx.lineWidth = 0.65;
    // PERF: warna di-set sekali, alpha per garis via globalAlpha (tanpa string rgba baru)
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    for (let i = 0; i < NODES.length; i++) {
      const a = NODES[i];
      for (let j = i + 1; j < NODES.length; j++) {
        const c = NODES[j];
        const dx = a.x - c.x, dy = a.y - c.y, d2 = dx*dx + dy*dy;
        if (d2 > connDist2) continue;
        const k = 1 - Math.sqrt(d2) / connDist;
        ctx.globalAlpha = k * 0.24 * gAlpha;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    for (const n of NODES) {
      const pulse = 0.5 + 0.5 * Math.sin(n.phase);
      const a = (n.active ? 0.6 : 0.28) * gAlpha * (0.55 + 0.6 * pulse);
      const rad = n.size * (0.85 + 0.55 * pulse);
      if (n.active && pulse > 0.65) {
        ctx.globalAlpha = Math.min(1, a * 0.16);
        ctx.beginPath(); ctx.arc(n.x, n.y, rad * 3.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = Math.min(1, a);
      ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function spawnParticle() {
    if (PARTICLES.length >= MAX_PARTICLES) return;
    PARTICLES.push({
      angle: Math.random() * Math.PI * 2,
      radius: scale * (43 + Math.random() * 8),
      speed: (28 + Math.random() * 45) * scale / 6,
      size: 0.8 + Math.random() * 1.0,
    });
  }

  function drawFlow(dt) {
    const { r, g, b } = F.rgb;
    const innerR = scale * 18;
    for (let i = PARTICLES.length - 1; i >= 0; i--) {
      const p = PARTICLES[i];
      p.radius -= p.speed * dt * (0.8 + F.flow * 0.5);
      if (p.radius < innerR) { PARTICLES.splice(i, 1); continue; }
      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius;
      const trailR = p.radius + scale * 1.8;
      const xt = cx + Math.cos(p.angle) * trailR;
      const yt = cy + Math.sin(p.angle) * trailR;
      const edge = Math.min(1, (p.radius - innerR) / (scale * 8));
      const a = 0.55 * F.flow * edge;
      ctx.beginPath(); ctx.moveTo(xt, yt); ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.35})`; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`; ctx.fill();
    }
  }

  let lastT = performance.now();
  let rafId = null;

  function frame(now) {
    _syncPerfCanvas();  // cek class tiap frame -> toggle langsung berlaku

    // PERF: selagi lock screen tampil, canvas tertutup total -> jangan gambar.
    if (_lockEl && !_lockEl.classList.contains('unlocked')) {
      lastT = now;
      rafId = document.hidden ? null : requestAnimationFrame(frame);
      return;
    }

    // Lite: cap ~30 FPS. Ambang 28ms (bukan 33.4) supaya layar 60Hz tidak
    // jatuh ke 20 FPS: frame ke-2 datang di ~33.3ms dan harus lolos.
    if (_liteState && (now - lastT) < 28) {
      rafId = document.hidden ? null : requestAnimationFrame(frame);
      return;
    }

    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const t = now / 1000;

    refreshColor();
    readState(dt);

    ctx.clearRect(0, 0, W, H);
    drawHeartbeat();
    drawRadar(t);
    drawNeural(t, dt, F.level);
    if (F.flow > 0.02) {
      if (Math.random() < F.flow * 0.7) spawnParticle();
      drawFlow(dt);
    } else if (PARTICLES.length) {
      drawFlow(dt);
    }
    rafId = document.hidden ? null : requestAnimationFrame(frame);
  }

  function start() {
    if (reduceMotion) {
      refreshColor(); readState(0.016);
      ctx.clearRect(0, 0, W, H);
      drawHeartbeat(); drawRadar(0); drawNeural(0, 0.016, F.level);
      return;
    }
    if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(frame); }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (rafId) cancelAnimationFrame(rafId); rafId = null; }
    else start();
  });

  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => { resizeRaf = null; resize(); });
  });

  resize();
  start();
})();

/* ============================================================
   AMBIENT ENVIRONMENT — background bereaksi halus ke sensor
   ============================================================ */
(() => {
  const bg = document.querySelector('.bg-cosmos');
  const tint = document.getElementById('bgAmbientTint');
  if (!bg) return;

  const dotEl = document.getElementById('dotStatus');
  const suhuEl = document.getElementById('valSuhu');
  const cahayaEl = document.getElementById('valCahaya');

  function update() {
    const online = dotEl ? dotEl.classList.contains('online') : false;
    const suhu = parseFloat((suhuEl?.textContent || '').replace(/[^\d.\-]/g, ''));
    const cahayaTxt = (cahayaEl?.textContent || '').toLowerCase();

    let base = 1.0;
    if (cahayaTxt.includes('dark'))      base = 0.78;
    else if (cahayaTxt.includes('dim'))  base = 0.90;

    if (Number.isFinite(suhu)) {
      const s = Math.max(0, Math.min(1, (suhu - 15) / 25));
      base *= 0.9 + s * 0.14;
    }
    if (!online) base *= 0.55;
    bg.style.opacity = Math.max(0.35, Math.min(1.0, base)).toFixed(3);

    if (!tint) return;
    if (!online) { tint.style.opacity = '0'; return; }
    if (Number.isFinite(suhu)) {
      if (suhu >= 22) {
        const w = Math.min(1, (suhu - 22) / 13);
        tint.style.background = 'radial-gradient(circle at 50% 42%, rgba(255,160,90,0.16), transparent 65%)';
        tint.style.opacity = (w * 0.9).toFixed(3);
      } else if (suhu <= 20) {
        const c = Math.min(1, (20 - suhu) / 13);
        tint.style.background = 'radial-gradient(circle at 50% 42%, rgba(120,170,255,0.14), transparent 65%)';
        tint.style.opacity = (c * 0.85).toFixed(3);
      } else {
        tint.style.opacity = '0';
      }
    }
  }

  update();
  setInterval(() => { if (!document.hidden) update(); }, 2000);
})();

/* ============================================================
   CUSTOM CURSOR — 1:1 Instant Hardware Tracking (Zero Lag / No Lerp)
   ============================================================ */
(() => {
  // Cuma aktif di device mouse (desktop/laptop)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SVG = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="c-edge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0" stop-color="#0f0a2e"/>
        <stop offset="0.45" stop-color="#2d1b69"/>
        <stop offset="1" stop-color="#4c1d95"/>
      </linearGradient>
      <linearGradient id="c-face" x1="5%" y1="5%" x2="95%" y2="95%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.12" stop-color="#e0e7ff"/>
        <stop offset="0.3" stop-color="#93c5fd"/>
        <stop offset="0.48" stop-color="#3b82f6"/>
        <stop offset="0.65" stop-color="#6366f1"/>
        <stop offset="0.82" stop-color="#a855f7"/>
        <stop offset="1" stop-color="#ec4899"/>
      </linearGradient>
      <radialGradient id="c-refl" cx="22%" cy="18%" r="60%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.98"/>
        <stop offset="0.35" stop-color="#ffffff" stop-opacity="0.5"/>
        <stop offset="0.7" stop-color="#ffffff" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="c-rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.4" stop-color="#c7d2fe"/>
        <stop offset="0.7" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#a5b4fc"/>
      </linearGradient>
      <radialGradient id="c-deep" cx="50%" cy="80%" r="55%">
        <stop offset="0" stop-color="#ec4899" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#ec4899" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-edge)" transform="translate(3.2,3.2)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-edge)" transform="translate(2.6,2.6)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-edge)" transform="translate(2.1,2.1)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-edge)" transform="translate(1.5,1.5)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-edge)" transform="translate(1,1)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-edge)" transform="translate(0.5,0.5)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="url(#c-face)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 20 L19.5 20 Z" fill="url(#c-deep)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 20 L2 2 Z" fill="url(#c-refl)"/>
    <path d="M2 2 L2 27 L7.5 21.5 L10.5 30 L13.5 28.5 L10.5 20 L19.5 20 Z" fill="none" stroke="url(#c-rim)" stroke-width="0.95" stroke-linejoin="round"/>
    <ellipse cx="4.8" cy="6.5" rx="1.7" ry="0.75" fill="#ffffff" opacity="0.98" transform="rotate(-42 4.8 6.5)"/>
    <circle cx="5.2" cy="5" r="0.55" fill="#ffffff"/>
    <circle cx="15.5" cy="19" r="0.65" fill="#ffffff" opacity="0.78"/>
    <ellipse cx="8.5" cy="22" rx="0.75" ry="0.35" fill="#ffffff" opacity="0.6"/>
  </svg>`;

  const el = document.createElement('div');
  el.id = 'aura-cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = SVG;
  document.body.appendChild(el);

  // 1:1 Instant Tracking: langsung mengikuti posisi mouse hardware tanpa lerp / damping
  window.addEventListener('pointermove', (e) => {
    el.style.transform = 'translate3d(' + e.clientX + 'px, ' + e.clientY + 'px, 0)';
  }, { passive: true });

  window.addEventListener('pointerdown', () => {
    el.classList.add('is-down');
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    el.classList.remove('is-down');
  }, { passive: true });

  // Sembunyikan custom cursor saat hover di field teks biar caret native kelihatan
  const TEXT = 'input, textarea, select, [contenteditable="true"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(TEXT)) el.classList.add('is-hidden');
    else el.classList.remove('is-hidden');
  }, { passive: true });

  // Sembunyiin pas keluar window
  document.documentElement.addEventListener('mouseleave', () => { el.classList.add('is-away'); });
  document.documentElement.addEventListener('mouseenter', () => { el.classList.remove('is-away'); });
})();
