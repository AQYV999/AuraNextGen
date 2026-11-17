/* ============================================================
   AURA NEXT GEN: ACC (AURA CONTROL CENTER) CONTROLLER
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: ACC (AURA CONTROL CENTER) CONTROLLER
   - Servo Motor Smooth Slider (0° - 180°) & Presets
   - 4-Channel Relays / GPIO Switches with Live Feedback
   - Auto-Sweep Patrol Mode
   - Realtime Firebase Sync (/acc.json)
   - Chat & Voice Intent Handler
   ============================================================ */
let _accState = {
  servo: {
    angle: 90,
    sweep: false,
    updatedAt: Date.now()
  },
  relays: {
    r1: false,
    r2: false,
    r3: false,
    r4: false,
    updatedAt: Date.now()
  },
  names: {
    r1: 'Lampu Utama',
    r2: 'Kipas Angin',
    r3: 'Power Socket',
    r4: 'Aksesori Pompa'
  }
};

let _accDebounceTimer = null;
let _accSyncInterval = null;

function bukaAccModal() {
  const backdrop = document.getElementById('accModalBackdrop');
  const panel = document.getElementById('accModalPanel');
  if (!backdrop || !panel) return;

  sinkronAccDariFirebase();
  backdrop.classList.add('visible');
  panel.classList.add('visible');

  if (!_accSyncInterval) {
    _accSyncInterval = setInterval(sinkronAccDariFirebase, 2000);
  }
}

function tutupAccModal() {
  const backdrop = document.getElementById('accModalBackdrop');
  const panel = document.getElementById('accModalPanel');
  if (backdrop) backdrop.classList.remove('visible');
  if (panel) panel.classList.remove('visible');

  if (_accSyncInterval) {
    clearInterval(_accSyncInterval);
    _accSyncInterval = null;
  }
}

function updateAccUI() {
  const angle = typeof _accState.servo.angle === 'number' ? _accState.servo.angle : 90;
  const txtVal = document.getElementById('txtServoAngleVal');
  if (txtVal) txtVal.textContent = angle;

  const slider = document.getElementById('rngServoAngle');
  if (slider && parseInt(slider.value, 10) !== angle) {
    slider.value = angle;
  }

  const desc = document.getElementById('txtServoPosDesc');
  if (desc) {
    let ket = 'Tengah';
    if (angle <= 15) ket = 'Kiri Penuh (Min)';
    else if (angle < 75) ket = 'Serong Kiri';
    else if (angle <= 105) ket = 'Tengah (Center)';
    else if (angle < 165) ket = 'Serong Kanan';
    else ket = 'Kanan Penuh (Max)';
    desc.textContent = `${angle}° (${ket})`;
  }

  document.querySelectorAll('.acc-preset-btn').forEach(btn => {
    const a = parseInt(btn.getAttribute('data-angle'), 10);
    btn.classList.toggle('active', a === angle);
  });

  const btnSweep = document.getElementById('btnAccSweep');
  const lblSweep = document.getElementById('txtSweepBtnLabel');
  if (btnSweep && lblSweep) {
    const isSweep = !!_accState.servo.sweep;
    btnSweep.classList.toggle('active', isSweep);
    lblSweep.textContent = isSweep ? 'Auto-Sweep Patrol: ON (Aktif)' : 'Auto-Sweep Patrol: OFF';
  }

  ['r1', 'r2', 'r3', 'r4'].forEach((rKey, idx) => {
    const card = document.getElementById(`cardRelay${idx + 1}`);
    const lbl = document.getElementById(`lblStateRelay${idx + 1}`);
    const isNyala = !!_accState.relays[rKey];

    if (card) card.classList.toggle('active', isNyala);
    if (lbl) lbl.textContent = isNyala ? 'ON' : 'OFF';

    if (rKey === 'r2') {
      const fanSvg = document.getElementById('svgFanRelay2');
      if (fanSvg) fanSvg.classList.toggle('acc-fan-spin', isNyala);
    }
  });
}

function simpanServoKeFirebase(angle, sweep) {
  _accState.servo.angle = Math.max(0, Math.min(180, angle));
  if (sweep !== undefined) _accState.servo.sweep = sweep;
  _accState.servo.updatedAt = Date.now();

  updateAccUI();

  const badge = document.getElementById('accSyncBadge');
  if (badge) {
    badge.textContent = 'Syncing...';
    badge.style.color = '#38bdf8';
  }

  if (_accDebounceTimer) clearTimeout(_accDebounceTimer);
  _accDebounceTimer = setTimeout(async () => {
    try {
      if (typeof FIREBASE_DB_URL !== 'undefined') {
        await fetch(FIREBASE_DB_URL + '/acc/servo.json', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            angle: _accState.servo.angle,
            sweep: !!_accState.servo.sweep,
            updatedAt: _accState.servo.updatedAt
          })
        });
      }
      if (badge) {
        badge.textContent = 'Tersinkron';
        badge.style.color = '#5DCAA5';
        setTimeout(() => { if (badge) badge.textContent = 'Firebase Live'; }, 1500);
      }
    } catch (err) {
      if (badge) {
        badge.textContent = 'Gagal Sync';
        badge.style.color = '#f87171';
      }
    }
  }, 120);
}

async function toggleRelayAcc(relayKey) {
  if (!_accState.relays) _accState.relays = {};
  _accState.relays[relayKey] = !_accState.relays[relayKey];
  _accState.relays.updatedAt = Date.now();

  updateAccUI();
  if (typeof getar === 'function') getar(30);

  try {
    if (typeof FIREBASE_DB_URL !== 'undefined') {
      await fetch(FIREBASE_DB_URL + `/acc/relays/${relayKey}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_accState.relays[relayKey])
      });
    }
  } catch (e) {}
}

async function setRelayAccSingle(relayKey, aktif) {
  if (!_accState.relays) _accState.relays = {};
  _accState.relays[relayKey] = !!aktif;
  _accState.relays.updatedAt = Date.now();

  updateAccUI();
  if (typeof getar === 'function') getar(30);

  try {
    if (typeof FIREBASE_DB_URL !== 'undefined') {
      await fetch(FIREBASE_DB_URL + `/acc/relays/${relayKey}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_accState.relays[relayKey])
      });
    }
  } catch (e) {}
}

async function setSemuaRelayAcc(aktif) {
  _accState.relays.r1 = !!aktif;
  _accState.relays.r2 = !!aktif;
  _accState.relays.r3 = !!aktif;
  _accState.relays.r4 = !!aktif;
  _accState.relays.updatedAt = Date.now();

  updateAccUI();
  if (typeof getar === 'function') getar([30, 40, 30]);

  try {
    if (typeof FIREBASE_DB_URL !== 'undefined') {
      await fetch(FIREBASE_DB_URL + '/acc/relays.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_accState.relays)
      });
    }
  } catch (e) {}
}

async function sinkronAccDariFirebase() {
  try {
    if (typeof FIREBASE_DB_URL === 'undefined') return;
    const res = await fetch(FIREBASE_DB_URL + '/acc.json', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    if (data.servo) {
      if (typeof data.servo.angle === 'number') _accState.servo.angle = data.servo.angle;
      if (typeof data.servo.sweep === 'boolean') _accState.servo.sweep = data.servo.sweep;
    }
    if (data.relays) {
      if (typeof data.relays.r1 === 'boolean') _accState.relays.r1 = data.relays.r1;
      if (typeof data.relays.r2 === 'boolean') _accState.relays.r2 = data.relays.r2;
      if (typeof data.relays.r3 === 'boolean') _accState.relays.r3 = data.relays.r3;
      if (typeof data.relays.r4 === 'boolean') _accState.relays.r4 = data.relays.r4;
    }
    updateAccUI();
  } catch (e) {}
}

function deteksiIntentACC(teks) {
  if (!teks) return null;
  const t = teks.trim().toLowerCase();

  // Buka Modal ACC
  if (/^(?:buka\s+(?:acc|kontrol|control|pusat\s+kendali)|kontrol\s+center|control\s+center|panel\s+hardware)/i.test(t)) {
    return { tipe: 'buka_modal' };
  }

  // Servo Commands
  const mServo = t.match(/(?:servo|putar\s+servo|posisi\s+servo)\s+(?:ke\s+)?(\d{1,3})/i) ||
                 t.match(/(\d{1,3})\s*(?:derajat|deg|°)\s*servo/i);
  if (mServo) {
    const deg = Math.min(180, Math.max(0, parseInt(mServo[1], 10)));
    return { tipe: 'servo_angle', angle: deg };
  }
  if (/servo\s+(?:tengah|center|tengah-tengah)/i.test(t)) {
    return { tipe: 'servo_angle', angle: 90 };
  }
  if (/servo\s+(?:mentok\s+kiri|kiri|min|minimal)/i.test(t)) {
    return { tipe: 'servo_angle', angle: 0 };
  }
  if (/servo\s+(?:mentok\s+kanan|kanan|maks|maksimal|max)/i.test(t)) {
    return { tipe: 'servo_angle', angle: 180 };
  }
  if (/(?:sweep\s+servo|patroli\s+servo|servo\s+bolak\s*balik)/i.test(t)) {
    return { tipe: 'servo_sweep', sweep: true };
  }

  // Relay Commands
  const isNyala = /(?:nyalakan|hidupkan|aktifkan|turn\s*on)\b/i.test(t);
  const isMati  = /(?:matikan|padamkan|nonaktifkan|turn\s*off)\b/i.test(t);

  if (isNyala || isMati) {
    const targetState = isNyala;
    if (/semua(?:\s+relay|\s+lampu)?/i.test(t)) {
      return { tipe: 'relay_all', state: targetState };
    }
    if (/lampu/i.test(t) || /relay\s*1/i.test(t)) {
      return { tipe: 'relay_single', key: 'r1', name: 'Lampu Utama', state: targetState };
    }
    if (/kipas/i.test(t) || /fan/i.test(t) || /relay\s*2/i.test(t)) {
      return { tipe: 'relay_single', key: 'r2', name: 'Kipas Angin', state: targetState };
    }
    if (/stop\s*kontak|socket|colokan|steker/i.test(t) || /relay\s*3/i.test(t)) {
      return { tipe: 'relay_single', key: 'r3', name: 'Power Socket', state: targetState };
    }
    if (/pompa|aksesori/i.test(t) || /relay\s*4/i.test(t)) {
      return { tipe: 'relay_single', key: 'r4', name: 'Aksesori Pompa', state: targetState };
    }
  }

  return null;
}

// Inisialisasi Event Listener ACC Modal
(() => {
  // Trigger di System Controls Drawer
  const btnOpen = document.getElementById('btnOpenAccModal');
  if (btnOpen) btnOpen.addEventListener('click', bukaAccModal);

  // Close buttons & backdrop
  const btnClose = document.getElementById('btnTutupAccModal');
  if (btnClose) btnClose.addEventListener('click', tutupAccModal);

  const backdrop = document.getElementById('accModalBackdrop');
  if (backdrop) backdrop.addEventListener('click', tutupAccModal);

  // Slider Servo
  const slider = document.getElementById('rngServoAngle');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      simpanServoKeFirebase(val, false);
    });
  }

  // Presets Servo
  document.querySelectorAll('.acc-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = parseInt(btn.getAttribute('data-angle'), 10);
      simpanServoKeFirebase(a, false);
    });
  });

  // Auto-Sweep Toggle
  const btnSweep = document.getElementById('btnAccSweep');
  if (btnSweep) {
    btnSweep.addEventListener('click', () => {
      const nextSweep = !_accState.servo.sweep;
      simpanServoKeFirebase(_accState.servo.angle, nextSweep);
    });
  }

  // Relay Cards Toggle
  ['r1', 'r2', 'r3', 'r4'].forEach((rKey, idx) => {
    const card = document.getElementById(`cardRelay${idx + 1}`);
    if (card) {
      card.addEventListener('click', () => toggleRelayAcc(rKey));
    }
  });

  // Master Relays All ON / All OFF
  const btnAllOn = document.getElementById('btnRelayAllOn');
  if (btnAllOn) btnAllOn.addEventListener('click', () => setSemuaRelayAcc(true));

  const btnAllOff = document.getElementById('btnRelayAllOff');
  if (btnAllOff) btnAllOff.addEventListener('click', () => setSemuaRelayAcc(false));

  // Esc key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('accModalPanel');
      if (panel && panel.classList.contains('visible')) {
        tutupAccModal();
      }
    }
  });

  // Initial Sync
  sinkronAccDariFirebase();
})();
