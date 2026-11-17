/* ============================================================
   AURA NEXT GEN: AI ENGINE (GEMINI, OLLAMA, TTS & CHAT ORCHESTRATOR)
   ============================================================ */
/* ===== LOCAL AI LANGSUNG (browser -> Ollama) =====
   Kalau Ollama terjangkau dari browser, mode Local AI nggak lewat ESP32/Firebase.
   URL bisa diganti tanpa edit kode: localStorage.setItem('aura_ollama_url','http://192.168.x.x:11434') */
const OLLAMA_URL = (() => {
  try { return localStorage.getItem('aura_ollama_url') || 'http://localhost:11434'; }
  catch (e) { return 'http://localhost:11434'; }
})();
const OLLAMA_MODEL = 'gemma3:1b';
let ollamaLangsungAktif = false;
let cekOllamaTerakhir = 0;
let _browserTtsAktif = false;

async function cekOllamaDirect(paksa) {
  if (!paksa && Date.now() - cekOllamaTerakhir < 30000) return ollamaLangsungAktif;
  cekOllamaTerakhir = Date.now();
  try {
    const res = await fetch(OLLAMA_URL + '/api/tags', { signal: AbortSignal.timeout(2000), mode: 'cors' });
    if (!res.ok) { ollamaLangsungAktif = false; }
    else {
      const data = await res.json();
      ollamaLangsungAktif = Array.isArray(data.models) && data.models.length > 0;
    }
  } catch (e) {
    ollamaLangsungAktif = false;
  }
  const b = document.getElementById('badgeMode');
  if (b) b.title = ollamaLangsungAktif
    ? 'Ollama detected in browser — direct path active'
    : 'Ollama unreachable from browser — Local AI goes through ESP32';
  return ollamaLangsungAktif;
}

const KEPRIBADIAN_AURA_JS =
  "You are AURA, a friendly, relaxed, natural, and slightly warm personal room assistant. " +
  "Address the user with 'you' and talk like a caring roommate, not like a robot or customer service. " +
  "Answer briefly, naturally, to the point, about 120 words max. " +
  "No opening or closing pleasantries. Get straight to the point. " +
  "If you don't know, say so honestly and casually.";

// Opsional: sensor kamar dari Firebase /status.json (kalau ESP32 nyala)
async function ambilKonteksSensor() {
  try {
    const res = await fetch(FIREBASE_DB_URL + '/status.json', { signal: AbortSignal.timeout(2000) });
    const d = await res.json();
    if (!d || typeof d.suhu !== 'number') return null;
    return '[Room context: temp ' + d.suhu + '°C, humidity ' + d.lembab + '%, ' +
           'light ' + (d.cahaya || '?') + ', radar: ' + (d.radar || '?') + ', time ' + (d.jam || '?') + ']';
  } catch (e) { return null; }
}

async function tanyaOllamaLangsung(pertanyaan, riwayatArr) {
  const messages = [{ role: 'system', content: KEPRIBADIAN_AURA_JS }];
  const konteks = await ambilKonteksSensor();
  if (konteks) messages.push({ role: 'system', content: konteks });
  riwayatArr.slice(-6).forEach(r => {
    messages.push({ role: 'user', content: (r.tanya || '').slice(0, 400) });
    messages.push({ role: 'assistant', content: (r.jawab || '').slice(0, 500) });
  });
  messages.push({ role: 'user', content: pertanyaan });

  const res = await fetch(OLLAMA_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL, messages: messages, stream: false,
      options: { num_predict: 300, temperature: 0.7 }
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!res.ok) throw new Error('Ollama HTTP ' + res.status);
  const data = await res.json();
  const out = ((data.message && data.message.content) || '').trim();
  if (!out) throw new Error('Ollama jawaban kosong');
  return out;
}

function ucapkanDiBrowser(teks) {
  if (!ttsAktif || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); } catch (e) {}
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = 'en-US'; u.rate = 1.0; u.pitch = 1.0;
  _browserTtsAktif = true;
  mulaiBicara(teks);
  u.onend = u.onerror = () => { _browserTtsAktif = false; berhentiBicara(); };
  speechSynthesis.speak(u);
}

/* ============================================================
   AURA NEXT GEN: MULTI-API KEY & COMBO FALLBACK ENGINE
   ============================================================ */
const AURA_API_STORAGE_KEY = 'aura_api_keys';

function muatApiKeys() {
  try {
    const raw = localStorage.getItem(AURA_API_STORAGE_KEY);
    if (!raw) return {
      geminiKey: '',
      geminiModel: 'gemini-2.5-flash',
      openRouterKey: '',
      openRouterModel: 'google/gemini-2.0-flash-001',
      customKey: '',
      autoFallback: true
    };
    return Object.assign({
      geminiKey: '',
      geminiModel: 'gemini-2.5-flash',
      openRouterKey: '',
      openRouterModel: 'google/gemini-2.0-flash-001',
      customKey: '',
      autoFallback: true
    }, JSON.parse(raw));
  } catch (e) {
    return {
      geminiKey: '',
      geminiModel: 'gemini-2.5-flash',
      openRouterKey: '',
      openRouterModel: 'google/gemini-2.0-flash-001',
      customKey: '',
      autoFallback: true
    };
  }
}

function simpanApiKeys(data) {
  try {
    localStorage.setItem(AURA_API_STORAGE_KEY, JSON.stringify(data));
    perbaruiIndikatorApiKeys();
    return true;
  } catch (e) {
    console.error('Gagal simpan API keys:', e);
    return false;
  }
}

function adaApiKeyTersedia() {
  const k = muatApiKeys();
  return Boolean(k.geminiKey || k.openRouterKey || k.customKey);
}

function perbaruiIndikatorApiKeys() {
  const k = muatApiKeys();
  const txtStatus = document.getElementById('txtApiKeyStatus');
  const dotGemini = document.getElementById('dotGemini');
  const dotOpenRouter = document.getElementById('dotOpenRouter');
  const dotCustom = document.getElementById('dotCustom');

  if (dotGemini) dotGemini.classList.toggle('active', Boolean(k.geminiKey));
  if (dotOpenRouter) dotOpenRouter.classList.toggle('active', Boolean(k.openRouterKey));
  if (dotCustom) dotCustom.classList.toggle('active', Boolean(k.customKey));

  if (txtStatus) {
    if (k.geminiKey && k.openRouterKey) txtStatus.textContent = 'Combo Ready';
    else if (k.geminiKey) txtStatus.textContent = 'Gemini Set';
    else if (k.openRouterKey) txtStatus.textContent = 'Router Set';
    else if (k.customKey) txtStatus.textContent = 'Custom Set';
    else txtStatus.textContent = 'Configure';
  }
}

// 1. Google Gemini Direct Call
async function tanyaGeminiDirect(teks, riwayatArr, apiKey, model = 'gemini-2.5-flash') {
  if (!apiKey) throw new Error('Gemini API Key belum diisi');
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(apiKey);

  const contents = [];
  const sensor = await ambilKonteksSensor();
  let sysPrompt = KEPRIBADIAN_AURA_JS;
  if (sensor) sysPrompt += ' ' + sensor;

  if (Array.isArray(riwayatArr)) {
    riwayatArr.slice(-5).forEach(r => {
      if (r.tanya) contents.push({ role: 'user', parts: [{ text: r.tanya.slice(0, 400) }] });
      if (r.jawab) contents.push({ role: 'model', parts: [{ text: r.jawab.slice(0, 500) }] });
    });
  }
  contents.push({ role: 'user', parts: [{ text: teks }] });

  const payload = {
    contents: contents,
    systemInstruction: { parts: [{ text: sysPrompt }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 350
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error('Gemini HTTP ' + res.status + ': ' + (errText.slice(0, 120) || res.statusText));
  }

  const data = await res.json();
  const candidate = data.candidates && data.candidates[0];
  const out = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;
  if (!out) throw new Error('Gemini mengembalikan teks kosong');
  return out.trim();
}

// 2. OpenRouter Direct Call
async function tanyaOpenRouterDirect(teks, riwayatArr, apiKey, model = 'google/gemini-2.0-flash-001') {
  if (!apiKey) throw new Error('OpenRouter API Key belum diisi');
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const sensor = await ambilKonteksSensor();
  let sysPrompt = KEPRIBADIAN_AURA_JS;
  if (sensor) sysPrompt += ' ' + sensor;

  const messages = [{ role: 'system', content: sysPrompt }];
  if (Array.isArray(riwayatArr)) {
    riwayatArr.slice(-5).forEach(r => {
      if (r.tanya) messages.push({ role: 'user', content: r.tanya.slice(0, 400) });
      if (r.jawab) messages.push({ role: 'assistant', content: r.jawab.slice(0, 500) });
    });
  }
  messages.push({ role: 'user', content: teks });

  const payload = {
    model: model || 'google/gemini-2.0-flash-001',
    messages: messages,
    max_tokens: 350,
    temperature: 0.7
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey.trim(),
      'HTTP-Referer': window.location.origin || 'http://localhost',
      'X-Title': 'AURA NEXT GEN'
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error('OpenRouter HTTP ' + res.status + ': ' + (errText.slice(0, 120) || res.statusText));
  }

  const data = await res.json();
  const choice = data.choices && data.choices[0];
  const out = choice && choice.message && choice.message.content;
  if (!out) throw new Error('OpenRouter mengembalikan teks kosong');
  return out.trim();
}

// 3. Auto-Fallback Combo Router
async function tanyaCloudDirect(teks, riwayatArr) {
  const k = muatApiKeys();
  const errors = [];

  // Urutan 1: Gemini
  if (k.geminiKey) {
    try {
      console.log('[AI Router] Memanggil Gemini (' + (k.geminiModel || 'Flash') + ')...');
      const ans = await tanyaGeminiDirect(teks, riwayatArr, k.geminiKey, k.geminiModel);
      return { answer: ans, provider: 'Gemini' };
    } catch (e) {
      console.warn('[AI Router] Gemini gagal:', e.message);
      errors.push('Gemini (' + e.message + ')');
      if (!k.autoFallback) throw e;
    }
  }

  // Urutan 2: OpenRouter Fallback
  if (k.openRouterKey) {
    try {
      console.log('[AI Router] Fallback memanggil OpenRouter (' + (k.openRouterModel || 'AI') + ')...');
      const ans = await tanyaOpenRouterDirect(teks, riwayatArr, k.openRouterKey, k.openRouterModel);
      const provName = (k.openRouterModel || '').split('/')[1] || 'OpenRouter';
      return { answer: ans, provider: 'Router:' + provName };
    } catch (e) {
      console.warn('[AI Router] OpenRouter gagal:', e.message);
      errors.push('OpenRouter (' + e.message + ')');
      if (!k.autoFallback) throw e;
    }
  }

  // Urutan 3: Custom / OpenAI Direct
  if (k.customKey) {
    try {
      console.log('[AI Router] Fallback memanggil Custom Key...');
      const ans = await tanyaOpenRouterDirect(teks, riwayatArr, k.customKey, 'gpt-4o-mini');
      return { answer: ans, provider: 'Custom AI' };
    } catch (e) {
      console.warn('[AI Router] Custom API gagal:', e.message);
      errors.push('Custom (' + e.message + ')');
    }
  }

  throw new Error('Semua provider Cloud Direct gagal: ' + errors.join('; '));
}
/* ===== END MULTI-API KEY & FALLBACK ENGINE ===== */
/* ===== END LOCAL AI LANGSUNG ===== */
let ekspresiOtomatisAktif = true;
let timerEkspresi = null;
let timerVarian = null;
let timerSementara = null;
let ekspresiTerakhir = '';   // state dasar terakhir (dipakai sistem lama / kompatibilitas)
let idPerilakuTerakhir = ''; // id perilaku idle terakhir (state+variant), untuk hindari repeat

// Base "warna" state per mode koneksi — dipakai sebagai titik kembali (resting state).
function ekspresiDariMode(mode) {
  if (mode === 'cloud') return 'senang';
  if (mode === 'local') return 'netral';
  return 'sedih';
}

// Kumpulan PERILAKU IDLE per mode, dengan bobot (probabilitas) masing-masing.
// Ini yang membuat 1 state punya banyak variasi visual (lihat bagian 11 permintaan):
// netral/senang/dst bisa tampil sebagai diri sendiri, atau + kedip, + lirik, + senyum kecil, dst.
// "sementara: true" artinya perilaku ini adalah "peek" singkat (mis. mikir/kaget sekilas)
// yang otomatis kembali ke base state mode setelah beberapa saat.
function daftarEkspresi(mode) {
  if (mode === 'cloud') {
    return [
      { state: 'senang', variant: 'none',         bobot: 26 },
      { state: 'senang', variant: 'kedip',         bobot: 14 },
      { state: 'senang', variant: 'kedip-ganda',   bobot: 6 },
      { state: 'senang', variant: 'glance-left',   bobot: 8 },
      { state: 'senang', variant: 'glance-right',  bobot: 8 },
      { state: 'senang', variant: 'glance-up',     bobot: 4 },
      { state: 'senang', variant: 'smile-kecil',   bobot: 9 },
      { state: 'senang', variant: 'smile-lebar',   bobot: 5 },
      { state: 'senang', variant: 'wink',          bobot: 4 },
      { state: 'senang', variant: 'wide',          bobot: 3 },
      { state: 'cinta',  variant: 'none',          bobot: 4, sementara: true },
      { state: 'mikir',  variant: 'none',          bobot: 4, sementara: true },
      { state: 'kaget',  variant: 'none',          bobot: 2, sementara: true },
    ];
  }
  if (mode === 'local') {
    return [
      { state: 'netral', variant: 'none',          bobot: 28 },
      { state: 'netral', variant: 'kedip',          bobot: 15 },
      { state: 'netral', variant: 'kedip-ganda',    bobot: 5 },
      { state: 'netral', variant: 'glance-left',    bobot: 8 },
      { state: 'netral', variant: 'glance-right',   bobot: 8 },
      { state: 'netral', variant: 'glance-up',      bobot: 4 },
      { state: 'netral', variant: 'glance-down',    bobot: 4 },
      { state: 'netral', variant: 'smile',          bobot: 8 },
      { state: 'netral', variant: 'squint',         bobot: 4 },
      { state: 'mikir',  variant: 'none',           bobot: 6, sementara: true },
      { state: 'ngantuk', variant: 'none',          bobot: 5, sementara: true },
    ];
  }
  // standalone / offline: karakter tetap sesuai logic lama (sedih/netral/ngantuk),
  // hanya ditambah variasi kecil biar tidak terasa seperti GIF diam.
  return [
    { state: 'sedih',   variant: 'none',          bobot: 28 },
    { state: 'sedih',   variant: 'kedip',          bobot: 12 },
    { state: 'sedih',   variant: 'glance-down',    bobot: 6 },
    { state: 'netral',  variant: 'none',           bobot: 16 },
    { state: 'netral',  variant: 'kedip-lambat',    bobot: 8 },
    { state: 'ngantuk', variant: 'none',           bobot: 18 },
    { state: 'ngantuk', variant: 'kedip-lambat',    bobot: 12 },
  ];
}

// Pilih satu perilaku secara acak berbobot, dan hindari perilaku yang sama
// persis dua kali berturut-turut (bagian 12 permintaan).
function pilihBerbobot(pool) {
  let kandidat = pool;
  if (pool.length > 1) {
    const tanpaTerakhir = pool.filter(p => (p.state + '-' + p.variant) !== idPerilakuTerakhir);
    if (tanpaTerakhir.length) kandidat = tanpaTerakhir;
  }
  const total = kandidat.reduce((a, p) => a + p.bobot, 0);
  let r = Math.random() * total;
  for (const p of kandidat) {
    r -= p.bobot;
    if (r <= 0) return p;
  }
  return kandidat[kandidat.length - 1];
}

// Satu "detak" perilaku idle: pilih perilaku, terapkan, lalu jadwalkan detak berikutnya
// dengan jeda acak (tidak konstan) supaya terasa hidup, bukan loop kaku.
function ekspresiAcak() {
  if (!ekspresiOtomatisAktif || ekspresiTerkunci) return;

  const pool = daftarEkspresi(modeSaatIni);
  const pilih = pilihBerbobot(pool);
  idPerilakuTerakhir = pilih.state + '-' + pilih.variant;

  clearTimeout(timerSementara);
  clearTimeout(timerVarian);

  if (pilih.sementara) {
    // Peek singkat (mis. mikir/kaget/ngantuk sekilas), lalu kembali ke base mode.
    ekspresiTerakhir = pilih.state;
    terapkanEkspresi(pilih.state, 'none');
    const durasiPeek = 900 + Math.random() * 1100;
    timerSementara = setTimeout(() => {
      if (ekspresiTerkunci) return;
      const base = ekspresiDariMode(modeSaatIni);
      ekspresiTerakhir = base;
      terapkanEkspresi(base, 'none');
    }, durasiPeek);
  } else {
    ekspresiTerakhir = pilih.state;
    terapkanEkspresi(pilih.state, pilih.variant);
    // Micro-expression (kedip/lirik/senyum/dst) singkat lalu kembali polos, state tetap sama.
    if (pilih.variant && pilih.variant !== 'none') {
      const durasiVarian = 650 + Math.random() * 900;
      timerVarian = setTimeout(() => {
        if (ekspresiTerkunci) return;
        faceSvg.setAttribute('data-variant', 'none');
      }, durasiVarian);
    }
  }

  // Jeda acak antar perilaku: umumnya 2.5–6.5 detik, sesekali jeda panjang 8–12 detik
  // supaya wajah kadang "diam tenang" dulu sebelum berubah lagi (bagian 3 permintaan).
  let jeda = 2500 + Math.random() * 4000;
  if (Math.random() < 0.14) jeda = 8000 + Math.random() * 4000;

  clearTimeout(timerEkspresi);
  timerEkspresi = setTimeout(ekspresiAcak, jeda);
}

function mulaiEkspresiOtomatis() {
  clearTimeout(timerEkspresi);
  timerEkspresi = setTimeout(ekspresiAcak, 2200 + Math.random() * 1200);
}

function resetEkspresiMode(mode) {
  const modeBerubah = mode !== modeSaatIni;
  modeSaatIni = mode;
  if (ekspresiTerkunci) return;
  // Hanya paksa balik ke ekspresi dasar saat mode koneksi BENAR-BENAR berubah
  // (mis. Cloud -> Local). Kalau mode masih sama, biarkan sistem idle/random
  // yang sedang berjalan tetap jalan — supaya wajah tidak "reset" tiap polling status.
  if (modeBerubah) {
    ekspresiTerakhir = ekspresiDariMode(mode);
    terapkanEkspresi(ekspresiTerakhir, 'none');
  }
}
function badgeInfo(mode) {
  if (mode === 'cloud') return { cls: 'cloud', label: 'Cloud AI' };
  if (mode === 'local') return { cls: 'local', label: 'Local AI' };
  return { cls: 'standalone', label: 'Standalone' };
}

/* ============================================================
   JACKPOT / SLOT-ROLL — TAMBAHAN, tidak menggantikan apapun
   ============================================================ */
let _measCanvas = null, _measCtx = null;
const _fontCache = new Map();

function _ukurTeks(teks, fontStr) {
  if (!_measCtx) {
    _measCanvas = document.createElement('canvas');
    _measCtx = _measCanvas.getContext('2d');
  }
  const key = fontStr + '|' + teks;
  const cache = _fontCache.get(key);
  if (cache !== undefined) return cache;
  _measCtx.font = fontStr;
  const w = _measCtx.measureText(teks).width;
  _fontCache.set(key, w);
  return w;
}

/* ===== TUNING KECEPATAN ROLL ===== */
const ROLL_DURASI       = 700;    // durasi tiap karakter mendarat (ms)
const ROLL_STAGGER_BASE = 55;     // jeda antar karakter untuk string pendek (ms)
const ROLL_STAGGER_MAX_TOTAL = 1400; // cap: total stagger tidak lebih dari ini (ms)
const ROLL_SPIN         = 11;      // jumlah karakter acak sebelum mendarat

// Stagger menyesuaikan panjang string (string panjang tidak kelamaan)
function hitungStagger(len) {
  if (len <= 1) return 0;
  return Math.min(ROLL_STAGGER_BASE, ROLL_STAGGER_MAX_TOTAL / (len - 1));
}

function rollText(el, teksBaru, opts = {}) {
  if (!el) return;
  if (el.dataset.rollTarget === teksBaru) return;
  el.dataset.rollTarget = teksBaru;

  const chars = Array.from(teksBaru);
  const durasi  = opts.durasi  ?? ROLL_DURASI;
  const stagger = opts.stagger ?? hitungStagger(chars.length);
  const spin    = opts.spin    ?? ROLL_SPIN;

  const cs = getComputedStyle(el);
  const fontStr = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

  el.classList.add('roller-host');
  el.innerHTML = '';

  let kata = null;   // wadah satu kata; spasi asli dipakai sebagai titik wrap
  chars.forEach((ch, i) => {
    if (ch === ' ') {
      el.appendChild(document.createTextNode(' '));
      kata = null;
      return;
    }
    if (!kata) {
      kata = document.createElement('span');
      kata.className = 'roller-word';
      el.appendChild(kata);
    }

    const wrap = document.createElement('span');
    wrap.className = 'roller';
    const w = Math.ceil(_ukurTeks(ch, fontStr)) || 6;
    wrap.style.width = w + 'px';

    const strip = document.createElement('span');
    strip.className = 'roller-strip';

    let pool = '';
    if (/[0-9]/.test(ch))         pool = '0123456789';
    else if (/[a-zA-Z]/.test(ch)) pool = 'abcdefghijklmnopqrstuvwxyz';

    const n = pool ? spin : 0;
    const arr = [];
    for (let k = 0; k < n; k++) {
      arr.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    arr.push(ch);

    strip.innerHTML = arr.map(c => {
      if (c === '&') return '<span>&amp;</span>';
      if (c === '<') return '<span>&lt;</span>';
      if (c === '>') return '<span>&gt;</span>';
      return '<span>' + c + '</span>';
    }).join('');

    wrap.appendChild(strip);
    kata.appendChild(wrap);

    requestAnimationFrame(() => {
      strip.style.transitionDuration = durasi + 'ms';
      strip.style.transitionDelay    = (i * stagger) + 'ms';
      strip.style.transform = `translateY(${-(arr.length - 1) * 1.2}em)`;
    });
  });
}

/* Set nilai + kilatan animasi kalau nilainya berubah (pengisian pertama tidak berkedip) */
function setNilaiDenganFlash(id, teksBaru) {
  const el = document.getElementById(id);
  if (!el) return;

  // Bandingkan via data-attribute, karena textContent berubah setelah roller
  const lama = el.dataset.nilai ?? el.textContent;
  if (lama === teksBaru) return;

  const pertama = !el.dataset.nilai && el.textContent.startsWith('--');
  el.dataset.nilai = teksBaru;

  // Roll jackpot — KECUALI radar (string panjang, tidak perlu roll)
  if (id === 'valRadar') {
    // Radar: langsung ganti teks, bersihkan sisa span roller kalau ada
    el.classList.remove('roller-host');
    el.textContent = teksBaru;
  } else {
    rollText(el, teksBaru);
  }

  // (LAMA, TETAP UTUH) Flash glow
  if (pertama) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 640);
}

/* Update pill status: dot, breathing glow, pop saat transisi */
function setStatusPill(online) {
  const dot = document.getElementById('dotStatus');
  const pill = document.querySelector('.top-left');
  if (!dot || !pill) return;

  const sebelumnyaOnline  = dot.classList.contains('online');
  const sebelumnyaOffline = dot.classList.contains('offline');
  const transisi = (online && sebelumnyaOffline) || (!online && sebelumnyaOnline);

  dot.className = 'dot ' + (online ? 'online' : 'offline');

  pill.classList.toggle('online',  online);
  pill.classList.toggle('offline', !online);

  // Pop hanya pada transisi nyata, bukan tiap polling
  if (transisi) {
    dot.classList.remove('pop');
    void dot.offsetWidth;         // paksa reflow agar animasi restart
    dot.classList.add('pop');
    setTimeout(() => dot.classList.remove('pop'), 720);
  }
}

/* Update jam + tick animation saat teks berubah */
function setJamDenganTick(teksBaru) {
  const el = document.getElementById('txtJam');
  if (!el) return;

  const lama = el.dataset.nilai ?? el.textContent;
  if (lama === teksBaru) return;
  el.dataset.nilai = teksBaru;

  // (TAMBAHAN) Roll jam
  rollText(el, teksBaru, { durasi: 900, stagger: 75, spin: 8 });

  // (LAMA, TETAP UTUH) Tick animation
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
  setTimeout(() => el.classList.remove('tick'), 640);
}

async function cekStatus() {
  try {
    const res = await fetch(FIREBASE_DB_URL + '/status.json', { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (!data) throw new Error('kosong');

    setStatusPill(true);
    document.getElementById('txtStatus').textContent = 'Connected';
    document.getElementById('txtError').style.display = 'none';
    setJamDenganTick(data.jam || '--:--');

    const suhu = data.suhu;
    setNilaiDenganFlash('valSuhu',
      (typeof suhu === 'number' ? (Math.round(suhu * 10) / 10) : '--') + '°C');
    const lembab = data.lembab;
    setNilaiDenganFlash('valLembab',
      (typeof lembab === 'number' ? Math.round(lembab) : '--') + '%');
    setNilaiDenganFlash('valCahaya', translateSensorValue(data.cahaya) || '--');
    setNilaiDenganFlash('valRadar',  translateSensorValue(data.radar)  || '--');

    // Update bar indikator kartu sensor
    // Suhu: bar di-map dari range 15°C (kosong) s/d 40°C (penuh)
    const pctSuhu = (typeof suhu === 'number')
      ? (suhu - 15) / (40 - 15) * 100
      : 0;
    setBarFill('barSuhu', pctSuhu);

    // Lembab: langsung 0–100%
    setBarFill('barLembab', typeof lembab === 'number' ? lembab : 0);

    // Cahaya: kategori → level kasar
    const cahayaStr = String(translateSensorValue(data.cahaya) || '').toLowerCase();
    const pctCahaya = cahayaStr.includes('bright') ? 100
                    : cahayaStr.includes('dim')    ? 55
                    : cahayaStr.includes('dark')   ? 18
                    : 0;
    setBarFill('barCahaya', pctCahaya);

    // Status modul (mic, OLED, RTC): cuma notifikasi ON/OFF
    setStatusOnOff('valMic', data.mic);
    setStatusOnOff('valOled', data.oled);
    setStatusOnOff('valRtc', data.rtc);

    // Sinkron posisi toggle TTS dari Firebase — biar konsisten antar-device.
    // Kalau /status sudah memuat field "suara" pakai itu, kalau belum baca /suara.json.
    if (typeof data.suara === 'boolean') sinkronTtsDariFirebase(data.suara);
    else ambilSuaraDariFirebase();

    const mode = data.mode || 'standalone';
    resetEkspresiMode(mode);
    const info = badgeInfo(mode);
    const badge = document.getElementById('badgeMode');
    badge.className = 'badge ' + info.cls;
    badge.textContent = info.label;
  } catch (e) {
    berhentiBicara();   // putus koneksi → indikator bicara juga berhenti
    setStatusPill(false);
    document.getElementById('txtStatus').textContent = 'Disconnected';
    document.getElementById('txtError').style.display = 'block';
    if (!ekspresiTerkunci) terapkanEkspresi('offline', 'none');
  }
}

function setStatusOnOff(id, aktif) {
  const el = document.getElementById(id);
  const teks = aktif ? 'ON' : 'OFF';
  const cls = aktif ? 'on' : 'off';
  const berubah = el.textContent !== teks;
  const pertama = el.textContent.startsWith('--');
  if (!berubah && el.classList.contains(cls)) return;
  el.textContent = teks;
  el.className = cls;
  if (!berubah || pertama) return;
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 660);
}

/* Isi bar kartu sensor: --bar-empty menentukan berapa banyak yang dipotong dari kanan */
function setBarFill(barId, persen) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  const empty = Math.max(0, Math.min(100, 100 - persen));
  bar.style.setProperty('--bar-empty', empty + '%');
}

let modeDipilih = 'cloud';
const btnCloud = document.getElementById('btnModeCloud');
const btnLocal = document.getElementById('btnModeLocal');
function pilihMode(mode) {
  modeDipilih = mode;
  btnCloud.className = 'toggle-btn' + (mode === 'cloud' ? ' active cloud-active' : '');
  btnLocal.className = 'toggle-btn' + (mode === 'local' ? ' active local-active' : '');
}
btnCloud.addEventListener('click', () => pilihMode('cloud'));
btnLocal.addEventListener('click', () => pilihMode('local'));

// Toggle suara (TTS). Pilihan disimpan di localStorage (offline-safe) DAN
// disinkron ke Firebase /suara.json biar ESP tahu. Toggle di device lain
// juga ikut sinkron lewat cekStatus() -> data.suara / /suara.json.
let ttsAktif = true;
let ttsSentuhTerakhir = 0; // waktu klik terakhir, biar polling gak menimpa klik yang baru
try {
  const simpan = localStorage.getItem('aura_tts');
  if (simpan !== null) ttsAktif = (simpan === '1');
} catch (e) { /* localStorage diblok -> pakai default ON */ }

const btnTtsOn = document.getElementById('btnTtsOn');
const btnTtsOff = document.getElementById('btnTtsOff');

function terapkanTampilanTts(aktif) {
  btnTtsOn.className  = 'toggle-btn' + (aktif ? ' active tts-on-active' : '');
  btnTtsOff.className = 'toggle-btn' + (!aktif ? ' active tts-off-active' : '');
}

function pilihTts(aktif, kirimKeFirebase = true) {
  ttsAktif = aktif;
  terapkanTampilanTts(aktif);
  try { localStorage.setItem('aura_tts', aktif ? '1' : '0'); } catch (e) {}

  if (!kirimKeFirebase) return;
  ttsSentuhTerakhir = Date.now();

  // PUT ke /suara.json — body JSON murni boolean (bukan {"suara":true}),
  // karena ESP baca payload mentah via http.getString().
  fetch(FIREBASE_DB_URL + '/suara.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: aktif ? 'true' : 'false',
    signal: AbortSignal.timeout(5000)
  }).catch(() => { /* offline -> disinkron lagi lewat cekStatus() */ });
}

// Sinkron dari Firebase ke tampilan toggle (tanpa PUT balik -> gak ada loop).
// Dilewati 6 detik setelah klik lokal supaya nilai lama gak menimpa klik baru.
function sinkronTtsDariFirebase(nilai) {
  if (typeof nilai !== 'boolean') return;
  if (Date.now() - ttsSentuhTerakhir < 6000) return;
  if (nilai !== ttsAktif) pilihTts(nilai, false);
}

async function ambilSuaraDariFirebase() {
  try {
    const res = await fetch(FIREBASE_DB_URL + '/suara.json', { signal: AbortSignal.timeout(5000) });
    sinkronTtsDariFirebase(await res.json());
  } catch (e) { /* abaikan, coba lagi di polling berikutnya */ }
}

btnTtsOn.addEventListener('click', () => pilihTts(true));
btnTtsOff.addEventListener('click', () => pilihTts(false));

// ===== TTS ENGINE: Local (Piper) <-> Cloud (ElevenLabs) =====
// Pola sama dengan toggle Voice: localStorage + PUT boolean ke Firebase.
// true = Local (Piper), false = Cloud (ElevenLabs).
let ttsLokalAktif = true;
let ttsLokalSentuhTerakhir = 0;
try {
  const simpanLokal = localStorage.getItem('aura_tts_lokal');
  if (simpanLokal !== null) ttsLokalAktif = (simpanLokal === '1');
} catch (e) { /* localStorage diblok -> default Local */ }

const btnTtsLokal = document.getElementById('btnTtsLokal');
const btnTtsCloud = document.getElementById('btnTtsCloud');

function terapkanTampilanTtsLokal(aktif) {
  btnTtsLokal.className = 'toggle-btn' + (aktif  ? ' active local-active' : '');
  btnTtsCloud.className = 'toggle-btn' + (!aktif ? ' active cloud-active' : '');
}

function pilihTtsLokal(aktif, kirimKeFirebase = true) {
  ttsLokalAktif = aktif;
  terapkanTampilanTtsLokal(aktif);
  try { localStorage.setItem('aura_tts_lokal', aktif ? '1' : '0'); } catch (e) {}

  if (!kirimKeFirebase) return;
  ttsLokalSentuhTerakhir = Date.now();

  // Body JSON murni boolean (bukan {"ttsLokal":true}), karena ESP baca
  // payload mentah via http.getString().
  fetch(FIREBASE_DB_URL + '/ttsLokal.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: aktif ? 'true' : 'false',
    signal: AbortSignal.timeout(5000)
  }).catch(() => { /* offline -> disinkron lagi lewat cekStatus() */ });
}

// Sinkron dari Firebase ke tampilan (tanpa PUT balik -> tidak ada loop).
// Dilewati 6 detik setelah klik lokal supaya nilai lama tidak menimpa klik baru.
function sinkronTtsLokalDariFirebase(nilai) {
  if (typeof nilai !== 'boolean') return;
  if (Date.now() - ttsLokalSentuhTerakhir < 60000) return;
  if (nilai !== ttsLokalAktif) pilihTtsLokal(nilai, false);
}

async function ambilTtsLokalDariFirebase() {
  try {
    const res = await fetch(FIREBASE_DB_URL + '/ttsLokal.json', { signal: AbortSignal.timeout(5000) });
    sinkronTtsLokalDariFirebase(await res.json());
  } catch (e) { /* abaikan, coba lagi di polling berikutnya */ }
}

btnTtsLokal.addEventListener('click', () => pilihTtsLokal(true));
btnTtsCloud.addEventListener('click', () => pilihTtsLokal(false));

function buatId() { return 'q' + Date.now() + '_' + Math.floor(Math.random() * 1000); }

// Render sederhana: markdown (bold, heading, list, ---) -> HTML,
// biar jawaban AI tampil rapi kayak chat, bukan satu blok teks panjang.
function renderMarkdown(teks) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const baris = teks.split('\n');
  let html = '';
  let listBuka = null; // 'ul' | 'ol' | null
  let paragrafBuka = false;

  function tutupList() { if (listBuka) { html += '</' + listBuka + '>'; listBuka = null; } }
  function tutupParagraf() { if (paragrafBuka) { html += '</p>'; paragrafBuka = false; } }

  for (let baris1 of baris) {
    const t = baris1.trim();

    if (t === '') { tutupParagraf(); tutupList(); continue; }
    if (/^---+$/.test(t)) { tutupParagraf(); tutupList(); html += '<hr>'; continue; }

    const heading = t.match(/^#{1,4}\s+(.*)$/);
    if (heading) { tutupParagraf(); tutupList(); html += '<h4>' + inline(heading[1]) + '</h4>'; continue; }

    const bullet = t.match(/^[\*\-]\s+(.*)$/);
    const numbered = t.match(/^\d+[\.\)]\s+(.*)$/);

    if (bullet) {
      tutupParagraf();
      if (listBuka !== 'ul') { tutupList(); html += '<ul>'; listBuka = 'ul'; }
      html += '<li>' + inline(bullet[1]) + '</li>';
      continue;
    }
    if (numbered) {
      tutupParagraf();
      if (listBuka !== 'ol') { tutupList(); html += '<ol>'; listBuka = 'ol'; }
      html += '<li>' + inline(numbered[1]) + '</li>';
      continue;
    }

    tutupList();
    if (!paragrafBuka) { html += '<p>'; paragrafBuka = true; } else { html += '<br>'; }
    html += inline(t);
  }
  tutupParagraf();
  tutupList();
  return html || esc(teks);
}

async function tungguJawaban(id, timeoutMs) {
  const mulai = Date.now();
  while (Date.now() - mulai < timeoutMs) {
    const res = await fetch(FIREBASE_DB_URL + '/jawaban.json', { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (data && data.pertanyaanId === id) return data;
    await new Promise(r => setTimeout(r, 1000));
  }
  return null;
}

const inpTanya = document.getElementById('inpTanya');
inpTanya.addEventListener('input', () => {
  inpTanya.style.height = 'auto';
  inpTanya.style.height = Math.min(inpTanya.scrollHeight, 120) + 'px';
});

// ============ RIWAYAT CHAT (Firebase + cache lokal) ============
// Sumber utama: Firebase /riwayat.json  -> sinkron antar-device.
// Cache lokal: localStorage  -> dipakai kalau Firebase tidak bisa dihubungi (offline).
const RIWAYAT_KEY = 'aura_riwayat_v1';
const MAKS_TAMPIL = 30;  // percakapan terakhir yang ditampilkan
const MAKS_KIRIM  = 6;   // konteks yang dikirim ke Gemini

let riwayat = [];         // { tanya, jawab, mode, waktu }
let memuatRiwayat = false;

function cacheLokal(list) {
  try { localStorage.setItem(RIWAYAT_KEY, JSON.stringify(list.slice(-MAKS_TAMPIL))); }
  catch {}
}
function bacaCacheLokal() {
  try { return JSON.parse(localStorage.getItem(RIWAYAT_KEY)) || []; }
  catch { return []; }
}

// Ambil riwayat dari Firebase. Return null kalau gagal konek.
async function muatRiwayatDariFirebase() {
  try {
    const res = await fetch(FIREBASE_DB_URL + '/riwayat.json',
      { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return [];
    return Object.values(data)
      .filter(r => r && typeof r.tanya === 'string' && typeof r.waktu === 'number')
      .sort((a, b) => a.waktu - b.waktu)
      .slice(-MAKS_TAMPIL);
  } catch (e) {
    return null;   // bedakan "kosong" vs "gagal"
  }
}

// POST = auto key di Firebase, jadi 1 percakapan = 1 entry baru.
async function simpanPercakapanKeFirebase(item) {
  try {
    await fetch(FIREBASE_DB_URL + '/riwayat.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
      signal: AbortSignal.timeout(8000)
    });
  } catch (e) { /* offline — tetap ada di cache lokal */ }
}

async function hapusRiwayatDiFirebase() {
  try {
    await fetch(FIREBASE_DB_URL + '/riwayat.json',
      { method: 'DELETE', signal: AbortSignal.timeout(8000) });
  } catch (e) { /* abaikan */ }
}

// Dipanggil sekali saat dashboard dibuka.
async function muatDanRenderRiwayat() {
  if (memuatRiwayat) return;
  memuatRiwayat = true;

  const dariFirebase = await muatRiwayatDariFirebase();
  if (dariFirebase === null) {
    riwayat = bacaCacheLokal();          // offline → pakai cache
  } else {
    riwayat = dariFirebase;
    cacheLokal(riwayat);                 // simpan sebagai cache
  }
  renderChatLog();
  memuatRiwayat = false;
}

function buatPesan(siapa, teks, mode) {
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-' + siapa;

  const label = document.createElement('div');
  label.className = 'msg-label';

  if (siapa === 'user') {
    label.textContent = 'You';
  } else {
    label.textContent = 'AURA';
    if (mode) {
      const badge = document.createElement('span');
      badge.className = 'msg-mode-badge msg-mode-badge--' + mode;
      badge.textContent = mode === 'cloud' ? 'Cloud AI'
                        : mode === 'local' ? 'Local AI'
                        : 'Standalone';
      label.appendChild(badge);
    }
  }

  const body = document.createElement('div');
  body.className = 'msg-body';
  if (siapa === 'aura') body.innerHTML = renderMarkdown(teks);
  else                  body.textContent = teks;

  wrap.append(label, body);
  return wrap;
}

/* Update label AURA di bubble yang sudah ada — tambahkan badge mode.
   Dipakai saat placeholder loading berubah jadi jawaban asli. */
function pasangBadgeMode(msgEl, mode, subText) {
  const label = msgEl.querySelector('.msg-label');
  if (!label) return;
  label.innerHTML = 'AURA';
  if (!mode) return;
  const badge = document.createElement('span');
  badge.className = 'msg-mode-badge msg-mode-badge--' + mode;
  badge.textContent = subText ? ('Cloud (' + subText + ')')
                    : mode === 'cloud' ? 'Cloud AI'
                    : mode === 'local' ? 'Local AI'
                    : 'Standalone';
  label.appendChild(badge);
}

/* Efek mengetik: render teks mentah char-by-char, lalu swap ke markdown HTML
   saat selesai. Durasi adaptif — jawaban panjang tidak kelamaan.
   Return Promise supaya bisa di-await di alur kirimPertanyaan(). */
function efekMengetik(el, teks, opsi = {}) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    // Reduced motion atau teks kosong → langsung tampil penuh
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !teks) {
      el.innerHTML = renderMarkdown(teks || '');
      return resolve();
    }

    const total = teks.length;
    const durasiTarget = opsi.durasi ?? Math.max(1500, Math.min(5500, total * 22));
    const mulai = performance.now();
    const log = el.closest('.chat-log');

    el.classList.add('typing');
    el.textContent = '';

    const _ringan = document.documentElement.classList.contains('perf-lite');
    let _tUpdate = 0;
    function tick(now) {
      // Kalau elemen sudah dilepas (mis. user clear riwayat), berhenti.
      if (!el.isConnected) return resolve();

      // PERF (mode ringan): layout chat log tidak perlu dihitung ulang tiap frame.
      if (_ringan && (now - _tUpdate) < 60 && (now - mulai) < durasiTarget) {
        requestAnimationFrame(tick);
        return;
      }
      _tUpdate = now;

      const t = Math.min((now - mulai) / durasiTarget, 1);
      const n = Math.floor(total * t);
      el.textContent = teks.slice(0, n);
      if (log && !log.classList.contains('minimized')) log.scrollTop = log.scrollHeight;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // Selesai — swap ke HTML markdown asli
        el.textContent = teks;
        el.classList.remove('typing');
        el.innerHTML = renderMarkdown(teks);
        if (log && !log.classList.contains('minimized')) log.scrollTop = log.scrollHeight;
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

function buatHeadLog() {
  const head = document.createElement('div');
  head.className = 'chat-log-head';
  head.innerHTML = '<span>Chat</span>'
    + '<div class="head-actions">'
    +   '<button class="clear-btn" id="btnBukaQuickApps" title="Buka App Launcher">Apps</button>'
    +   '<button class="clear-btn" id="btnBukaArsipRiwayat" title="Buka Arsip Percakapan">Archive</button>'
    +   '<button class="min-btn" id="btnMinimize" aria-label="Minimize history">'
    +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
    +   '</button>'
    +   '<button class="clear-btn" id="btnBersihRiwayat">Clear</button>'
    + '</div>';
  return head;
}

function renderChatLog() {
  const log = document.getElementById('chatLog');
  log.innerHTML = '';
  if (typeof perbaruiWidgetHistoryPreview === 'function') perbaruiWidgetHistoryPreview();
  if (riwayat.length === 0) { log.classList.remove('visible'); return; }
  log.classList.add('visible');
  log.appendChild(buatHeadLog());
  riwayat.forEach(item => {
    log.appendChild(buatPesan('user', item.tanya));
    log.appendChild(buatPesan('aura', item.jawab, item.mode));
  });
  if (log.classList.contains('minimized')) paksaScrollAtas(log);
  else                                     log.scrollTop = log.scrollHeight;
}

document.getElementById('chatLog').addEventListener('click', async (e) => {
  // Tombol buka App Launcher
  if (e.target.closest('#btnBukaQuickApps')) {
    if (typeof bukaQuickAppsModal === 'function') bukaQuickAppsModal();
    return;
  }
  // Tombol buka arsip riwayat percakapan
  if (e.target.closest('#btnBukaArsipRiwayat')) {
    bukaChatHistory(true);
    return;
  }
  // Tombol minimize
  if (e.target.closest('#btnMinimize')) {
    toggleMinimize();
    return;
  }
  // Tombol hapus riwayat — langsung hapus tanpa konfirmasi
  if (e.target.closest('#btnBersihRiwayat')) {
    const btn = e.target.closest('#btnBersihRiwayat');

    // Feedback visual singkat biar user tahu aksinya kebaca
    if (btn) {
      btn.disabled = true;
      btn.textContent = '...';
    }

    riwayat = [];
    try { localStorage.removeItem(RIWAYAT_KEY); } catch {}
    renderChatLog();
    hapusRiwayatDiFirebase();   // fire & forget

    return;
  }
});

let sedangMenunggu = false;

/* ===== MINIMIZE CHAT LOG ===== */
const CHAT_MIN_KEY = 'aura_chat_minimized';

/* Scroll instan ke atas (abaikan scroll-behavior:smooth) supaya header langsung kelihatan. */
function paksaScrollAtas(el) {
  if (!el) return;
  const prev = el.style.scrollBehavior;
  el.style.scrollBehavior = 'auto';
  el.scrollTop = 0;
  el.style.scrollBehavior = prev;
}

function toggleMinimize(force) {
  const log = document.getElementById('chatLog');
  if (!log) return;

  const akanMinimize = (typeof force === 'boolean')
    ? force
    : !log.classList.contains('minimized');

  log.classList.toggle('minimized', akanMinimize);

  if (akanMinimize) {
    // Saat minimized, paksa scroll ke atas supaya header (tombol minimize & Hapus) tetap kelihatan.
    paksaScrollAtas(log);

    log.classList.remove('minimizing');
    void log.offsetWidth;               // paksa reflow biar animasi restart
    log.classList.add('minimizing');
    setTimeout(() => {
      log.classList.remove('minimizing');
      if (log.classList.contains('minimized')) paksaScrollAtas(log);
    }, 820);
  }

  try { localStorage.setItem(CHAT_MIN_KEY, akanMinimize ? '1' : '0'); } catch {}
}

// Restore status minimize dari kunjungan sebelumnya
try {
  if (localStorage.getItem(CHAT_MIN_KEY) === '1') {
    document.getElementById('chatLog').classList.add('minimized');
  }
} catch {}

/* ===== INDIKATOR BICARA =====
   Durasi diperkirakan dari panjang teks jawaban (bukan sinkron dengan audio ESP32).
   ~14 karakter/detik, min 3s, max 30s. */
let timerBicara = null;

function mulaiBicara(teksJawaban) {
  if (!ttsAktif || !teksJawaban) return;

  const durasiMs = Math.max(3000, Math.min(30000, teksJawaban.length * 70));

  clearTimeout(timerBicara);
  faceSvg.setAttribute('data-bicara', 'on');
  const badge = document.getElementById('speakingBadge');
  if (badge) badge.classList.add('show');

  timerBicara = setTimeout(berhentiBicara, durasiMs);
}

function berhentiBicara() {
  if (_browserTtsAktif) return;   // TTS browser masih jalan; onend yang akan mematikan indikator
  clearTimeout(timerBicara);
  timerBicara = null;
  faceSvg.removeAttribute('data-bicara');
  const badge = document.getElementById('speakingBadge');
  if (badge) badge.classList.remove('show');
}

async function kirimPertanyaan() {
  if (sedangMenunggu) return;          // kunci ganda: cegah Q2 menimpa Q1 di slot Firebase
  const teks = inpTanya.value.trim();
  if (!teks) return;

  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
  _browserTtsAktif = false;
  berhentiBicara();   // kalau sebelumnya sedang "bicara", hentikan dulu
  sedangMenunggu = true;
  const btnKirim = document.getElementById('btnKirim');
  btnKirim.classList.add('loading');
  getar(12);

  inpTanya.value = '';
  inpTanya.style.height = 'auto';
  inpTanya.disabled = true;

  const log = document.getElementById('chatLog');
  log.classList.add('visible');
  toggleMinimize(false);   // kalau sedang minimized, buka lagi otomatis

  // 1) Pertanyaan user langsung muncul (biar responsif)
  if (!log.querySelector('.chat-log-head')) log.appendChild(buatHeadLog());
  log.appendChild(buatPesan('user', teks));

  // 2) Placeholder loading
  const auraMsg = buatPesan('aura', 'AURA thinking (' + (modeDipilih === 'cloud' ? 'Cloud AI' : 'Local AI') + ')...');
  auraMsg.classList.add('loading');
  log.appendChild(auraMsg);
  log.scrollTop = log.scrollHeight;

  // 3) Riwayat terakhir buat konteks (dipotong biar payload gak bengkak)
  const konteksRiwayat = riwayat.slice(-MAKS_KIRIM).map(r => ({
    tanya: (r.tanya || '').slice(0, 400),
    jawab: (r.jawab || '').slice(0, 500)
  }));

  const id = buatId();
  ekspresiTerkunci = true;
  terapkanEkspresi('mikir', 'none');

  try {
    // AURA NEXT GEN: Weather Query Intent Intercept
    const polaCuaca = /(?:bagaimana\s+)?cuaca(?:\s+hari\s+ini|\s+sekarang|\s+besok)?|ramalan\s+cuaca|prakiraan\s+cuaca|hujan\s+nggak|apakah\s+(?:akan\s+)?hujan/i;
    if (polaCuaca.test(teks.toLowerCase())) {
      if (typeof bukaWeatherModal === 'function') bukaWeatherModal();
      const loc = typeof getSavedWeatherLocation === 'function' ? getSavedWeatherLocation() : { name: 'Pemalang' };
      let balas = '';
      if (_weatherDataCache && _weatherDataCache.current) {
        const cur = _weatherDataCache.current;
        const cond = typeof getDeskripsiCuaca === 'function' ? getDeskripsiCuaca(cur.weather_code) : 'Normal';
        const temp = Math.round(cur.temperature_2m);
        const feels = Math.round(cur.apparent_temperature);
        const daily = _weatherDataCache.daily || {};
        const pMax = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
        balas = `Laporan cuaca untuk **${loc.name}**: Saat ini **${cond}** dengan suhu **${temp}°C** (terasa seperti ${feels}°C). Peluang hujan hari ini sekitar **${pMax}%**. Aku sudah membuka dashboard radar cuaca lengkap di layarmu! 🌤️`;
      } else {
        balas = `Aku sedang mengambil data cuaca terbaru untuk **${loc.name}** dari stasiun radar. Dashboard cuaca sudah dibuka di layarmu! 🌤️`;
      }

      auraMsg.classList.remove('loading');
      pasangBadgeMode(auraMsg, 'local', 'Weather');

      const itemDirect = { tanya: teks, jawab: balas, mode: 'local', waktu: Date.now() };
      riwayat.push(itemDirect);
      simpanRiwayatKeStorage();
      tambahRiwayatKeServer(itemDirect);

      auraMsg.innerHTML = formatMarkdown(balas);
      log.scrollTop = log.scrollHeight;
      if (typeof bicaraRingkasanCuaca === 'function') bicaraRingkasanCuaca();

      ekspresiTerkunci = false;
      kembaliKeDefault(2800);
      sedangMenunggu = false;
      btnKirim.classList.remove('loading');
      inpTanya.disabled = false;
      inpTanya.focus();
      return;
    }

    // AURA NEXT GEN: ACC (AURA Control Center) Hardware Intent Intercept
    const accIntent = typeof deteksiIntentACC === 'function' ? deteksiIntentACC(teks) : null;
    if (accIntent) {
      let balas = '';
      if (accIntent.tipe === 'buka_modal') {
        if (typeof bukaAccModal === 'function') bukaAccModal();
        balas = 'Membuka panel AURA Control Center (ACC) untuk kendali servo dan relay hardware.';
      } else if (accIntent.tipe === 'servo_angle') {
        if (typeof simpanServoKeFirebase === 'function') simpanServoKeFirebase(accIntent.angle);
        balas = `Servo motor berhasil diarahkan ke sudut ${accIntent.angle}°.`;
      } else if (accIntent.tipe === 'servo_sweep') {
        if (typeof simpanServoKeFirebase === 'function') simpanServoKeFirebase(_accState.servo.angle, true);
        balas = 'Mode Auto-Sweep Patrol servo diaktifkan (bolak-balik otomatis).';
      } else if (accIntent.tipe === 'relay_single') {
        if (typeof setRelayAccSingle === 'function') {
          setRelayAccSingle(accIntent.key, accIntent.state);
        }
        balas = `${accIntent.name} berhasil ${accIntent.state ? 'dinyalakan (ON)' : 'dimatikan (OFF)'}.`;
      } else if (accIntent.tipe === 'relay_all') {
        if (typeof setSemuaRelayAcc === 'function') setSemuaRelayAcc(accIntent.state);
        balas = `Semua relay dan perangkat berhasil ${accIntent.state ? 'dinyalakan (ALL ON)' : 'dimatikan (ALL OFF)'}.`;
      }

      auraMsg.classList.remove('loading');
      pasangBadgeMode(auraMsg, 'local', 'Hardware ACC');

      const itemDirect = { tanya: teks, jawab: balas, mode: 'local', waktu: Date.now() };
      riwayat.push(itemDirect);
      simpanRiwayatKeStorage();
      tambahRiwayatKeServer(itemDirect);

      auraMsg.innerHTML = `<div class="msg-body"><p>${balas}</p></div>`;
      log.scrollTop = log.scrollHeight;

      if (typeof ucapkanDiBrowser === 'function') {
        ucapkanDiBrowser(balas);
      }

      ekspresiTerkunci = false;
      kembaliKeDefault(2600);
      sedangMenunggu = false;
      btnKirim.classList.remove('loading');
      inpTanya.disabled = false;
      inpTanya.focus();
      return;
    }

    // AURA NEXT GEN: Cloud Photo Storage & Gallery Intent
    const galleryIntent = typeof deteksiIntentGaleri === 'function' ? deteksiIntentGaleri(teks) : null;
    if (galleryIntent) {
      let balas = '';
      if (galleryIntent.tipe === 'buka_galeri') {
        if (typeof bukaGalleryModal === 'function') bukaGalleryModal();
        balas = 'Membuka AURA Cloud Gallery untuk melihat koleksi foto tersimpan.';
      } else if (galleryIntent.tipe === 'upload_foto') {
        if (typeof bukaGalleryModal === 'function') {
          bukaGalleryModal();
          setTimeout(() => {
            const inp = document.getElementById('inpGalleryFile');
            if (inp) inp.click();
          }, 300);
        }
        balas = 'Membuka pemilih foto untuk mengunggah gambar ke cloud.';
      }

      auraMsg.classList.remove('loading');
      pasangBadgeMode(auraMsg, 'local', 'Cloud Gallery');

      const itemDirect = { tanya: teks, jawab: balas, mode: 'local', waktu: Date.now() };
      riwayat.push(itemDirect);
      simpanRiwayatKeStorage();
      tambahRiwayatKeServer(itemDirect);

      auraMsg.innerHTML = `<div class="msg-body"><p>${balas}</p></div>`;
      log.scrollTop = log.scrollHeight;

      if (typeof ucapkanDiBrowser === 'function') {
        ucapkanDiBrowser(balas);
      }

      ekspresiTerkunci = false;
      kembaliKeDefault(2600);
      sedangMenunggu = false;
      btnKirim.classList.remove('loading');
      inpTanya.disabled = false;
      inpTanya.focus();
      return;
    }

    // AURA NEXT GEN: Auto Buka Aplikasi & Deep Linking Intent
    const appIntent = typeof deteksiIntentAplikasi === 'function' ? deteksiIntentAplikasi(teks) : null;
    if (appIntent) {
      try { window.open(appIntent.targetUrl, '_blank'); } catch (e) {}

      const cardHtml = buatAppCardHtml(appIntent);
      const balas = `Siap! ${appIntent.voiceMsg}`;

      auraMsg.classList.remove('loading');
      pasangBadgeMode(auraMsg, 'local', 'App Launch');

      const itemDirect = { tanya: teks, jawab: `${balas}\n\n[Buka ${appIntent.appName}](${appIntent.targetUrl})`, mode: 'local', waktu: Date.now() };
      riwayat.push(itemDirect);
      simpanRiwayatKeStorage();
      tambahRiwayatKeServer(itemDirect);

      auraMsg.innerHTML = `<div class="msg-body"><p>${balas}</p>${cardHtml}</div>`;
      log.scrollTop = log.scrollHeight;

      if (typeof ucapkanDiBrowser === 'function') {
        ucapkanDiBrowser(appIntent.voiceMsg);
      }

      ekspresiTerkunci = false;
      kembaliKeDefault(2600);
      sedangMenunggu = false;
      btnKirim.classList.remove('loading');
      inpTanya.disabled = false;
      inpTanya.focus();
      return;
    }

    // AURA NEXT GEN: Natural Language Reminder Intent Intercept
    const polaIngatkan = /ingatkan(?:\s+saya|\s+aku)?\s+(.+?)\s+(\d+)\s*(menit|jam|detik)?/i;
    const matchIngat = teks.match(polaIngatkan);
    if (matchIngat) {
      const pesanIngat = matchIngat[1].trim();
      const angka = parseInt(matchIngat[2], 10);
      const satuan = (matchIngat[3] || 'menit').toLowerCase();
      let durasiMenit = angka;
      if (satuan.startsWith('jam')) durasiMenit = angka * 60;
      else if (satuan.startsWith('detik')) durasiMenit = Math.max(1, Math.round(angka / 60));

      const resReminder = tambahReminder(pesanIngat, durasiMenit);
      const balas = `Siap! Aku sudah mencatat pengingat untuk: **${pesanIngat}** (${resReminder.menit} menit lagi, sekitar jam ${resReminder.timeStr}). Nanti aku ingatkan kamu! ⏰`;

      auraMsg.classList.remove('loading');
      pasangBadgeMode(auraMsg, 'local', 'Reminder');

      const itemDirect = { tanya: teks, jawab: balas, mode: 'local', waktu: Date.now() };
      riwayat.push(itemDirect);
      cacheLokal(riwayat);
      simpanPercakapanKeFirebase(itemDirect);

      resetEkspresiMode('local');
      ucapkanDiBrowser(balas);
      getar([12, 40, 12]);
      await efekMengetik(auraMsg.querySelector('.msg-body'), balas);
      return;
    }

    // JALUR LANGSUNG: mode Local + Ollama terjangkau dari browser -> skip ESP32.
    // `return` di sini tetap lewat blok finally (buka kunci UI). Gagal -> lanjut ke jalur ESP32.
    if (modeDipilih === 'local' && await cekOllamaDirect()) {
      try {
        const jawabanDirect = await tanyaOllamaLangsung(teks, riwayat);
        auraMsg.classList.remove('loading');
        pasangBadgeMode(auraMsg, 'local');

        const itemDirect = { tanya: teks, jawab: jawabanDirect, mode: 'local', waktu: Date.now() };
        riwayat.push(itemDirect);
        cacheLokal(riwayat);
        simpanPercakapanKeFirebase(itemDirect);   // arsip antar-device (gagal diam-diam kalau offline)

        resetEkspresiMode('local');
        ucapkanDiBrowser(jawabanDirect);
        getar([12, 40, 12]);
        await efekMengetik(auraMsg.querySelector('.msg-body'), jawabanDirect);
        return;
      } catch (e) {
        console.warn('[Ollama Direct] gagal, fallback ke ESP32:', e);
        ollamaLangsungAktif = false;
        cekOllamaTerakhir = Date.now();
      }
    }

    // JALUR CLOUD DIRECT: mode Cloud + ada API key (Gemini / OpenRouter) tersimpan di browser
    if (modeDipilih === 'cloud' && adaApiKeyTersedia()) {
      try {
        const hasil = await tanyaCloudDirect(teks, riwayat);
        auraMsg.classList.remove('loading');
        pasangBadgeMode(auraMsg, 'cloud', hasil.provider);

        const itemCloud = { tanya: teks, jawab: hasil.answer, mode: 'cloud', provider: hasil.provider, waktu: Date.now() };
        riwayat.push(itemCloud);
        cacheLokal(riwayat);
        simpanPercakapanKeFirebase(itemCloud);

        resetEkspresiMode('cloud');
        ucapkanDiBrowser(hasil.answer);
        getar([12, 40, 12]);
        await efekMengetik(auraMsg.querySelector('.msg-body'), hasil.answer);
        return;
      } catch (e) {
        console.warn('[Cloud Direct Combo Gagal, Fallback ke ESP32]:', e.message);
      }
    }

    await fetch(FIREBASE_DB_URL + '/pertanyaan.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id, teks: teks, mode: modeDipilih,
        riwayat: konteksRiwayat
      }),
      signal: AbortSignal.timeout(8000)
    });

    const jawaban = await tungguJawaban(id, 45000);
    if (jawaban) {
      const teksAsli = (jawaban.teks || '(tidak ada jawaban)').replace(/\\n/g, '\n');
      const modeAkhir = jawaban.mode || modeDipilih;

      auraMsg.classList.remove('loading');
      pasangBadgeMode(auraMsg, modeAkhir);

      // Side-effects dulu — biar tidak nunggu animasi selesai
      const itemRiwayat = {
        tanya: teks,
        jawab: teksAsli,
        mode: modeAkhir,
        waktu: Date.now()
      };
      riwayat.push(itemRiwayat);
      cacheLokal(riwayat);                            // cache lokal instan
      simpanPercakapanKeFirebase(itemRiwayat);        // fire & forget

      resetEkspresiMode(modeAkhir);
      mulaiBicara(teksAsli);   // indikator bicara, hanya jalan kalau TTS aktif
      getar([12, 40, 12]);     // pola "sukses" — getar-pause-getar

      // Terakhir, animasikan jawabannya
      await efekMengetik(auraMsg.querySelector('.msg-body'), teksAsli);
    } else {
      auraMsg.classList.remove('loading');
      auraMsg.classList.add('err');
      auraMsg.querySelector('.msg-body').textContent = 'No reply from AURA. Check the ESP32.';
      terapkanEkspresi('sedih', 'none');
      ekspresiTerakhir = 'sedih';
      getar([40, 80, 40]);   // pola "error" — lebih tegas
    }
  } catch (e) {
    auraMsg.classList.remove('loading');
    auraMsg.classList.add('err');
    auraMsg.querySelector('.msg-body').textContent = 'Failed to reach Firebase or ESP32 not connected.';
    terapkanEkspresi('offline', 'none');
    ekspresiTerakhir = 'offline';
    getar([40, 80, 40]);
  } finally {
    ekspresiTerkunci = false;
    if (!log.classList.contains('minimized')) log.scrollTop = log.scrollHeight;
    // Lanjutkan lagi sistem idle/random expression setelah selesai menjawab.
    mulaiEkspresiOtomatis();

    // Buka kunci
    sedangMenunggu = false;
    btnKirim.classList.remove('loading');
    inpTanya.disabled = false;
    inpTanya.focus();
  }
}

faceSvg.addEventListener('click', () => {
  if (ekspresiTerkunci) return;
  clearTimeout(timerEkspresi);
  ekspresiAcak();
});

document.getElementById('btnKirim').addEventListener('click', kirimPertanyaan);
inpTanya.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPertanyaan(); }
});
