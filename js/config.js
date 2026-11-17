/* ============================================================
   AURA NEXT GEN: CONFIG & GLOBAL UTILITIES
   ============================================================ */
const FIREBASE_DB_URL = 'https://aura-monitoring-859d9-default-rtdb.asia-southeast1.firebasedatabase.app';

/* ===== TRANSLATE NILAI DARI ESP32 (ID → EN) =====
   ESP32 mengirim teks Indonesia untuk radar & cahaya. Diterjemahkan SEBELUM masuk DOM.
   Aman kalau teks sudah Inggris (jadi no-op). */
function translateSensorValue(teks) {
  if (teks == null) return teks;
  let s = String(teks);

  const petaCahaya = { 'terang': 'Bright', 'redup': 'Dim', 'gelap': 'Dark' };
  const kunci = s.trim().toLowerCase();
  if (petaCahaya[kunci]) return petaCahaya[kunci];

  s = s
    // negatif DULU supaya tidak ketimpa pola positif
    .replace(/tidak\s+ada\s+target/gi,       'No target')
    .replace(/tidak\s+ada\s+orang(\s+terdeteksi)?/gi, 'No person')
    .replace(/tidak\s+ada\s+gerakan/gi,      'No motion')
    .replace(/kosong/gi,                      'Empty')
    // kombinasi bergerak + diam (HARUS di atas pola tunggal)
    .replace(/orang\s+bergerak\s+dan\s+diam\s+terdeteksi/gi, 'Person moving & still, detected')
    // positif
    .replace(/orang\s+diam\s+terdeteksi/gi,    'Person still, detected')
    .replace(/orang\s+bergerak\s+terdeteksi/gi,'Person moving, detected')
    .replace(/orang\s+terdeteksi/gi,          'Person detected')
    .replace(/manusia\s+terdeteksi/gi,        'Human detected')
    .replace(/gerakan\s+terdeteksi/gi,        'Motion detected')
    .replace(/target\s+terdeteksi/gi,         'Target detected')
    // "jarak 451 cm" → "451 cm distance"
    .replace(/jarak\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, '$1 cm distance')
    .replace(/jarak/gi,                       'distance')
    // fallback per kata: tangkap varian yang belum ada polanya
    // (negatif harus di atas "terdeteksi"; hasilnya sengaja "No target" supaya animasi radar tidak salah baca)
    .replace(/tidak\s+terdeteksi/gi,          'No target')
    .replace(/(belum|tidak)\s+ada\s+data/gi, 'No data')
    .replace(/tidak\s+terhubung/gi,           'not connected')
    .replace(/\borang\b/gi,                   'Person')
    .replace(/\bbergerak\b/gi,                'moving')
    .replace(/\bdiam\b/gi,                    'still')
    .replace(/\bdan\b/gi,                     '&')
    .replace(/\bterdeteksi\b/gi,              'detected');

  return s;
}


const faceSvg = document.getElementById('faceSvg');

/* ===== HAPTIC: getar singkat di HP (no-op kalau tidak didukung) ===== */
function getar(pola) {
  if (!navigator.vibrate) return;
  try { navigator.vibrate(pola); } catch (e) { /* beberapa browser blokir, abaikan */ }
}
