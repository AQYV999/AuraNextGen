/* ============================================================
   AURA NEXT GEN: CHAT HISTORY ARCHIVE CONTROLLER
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: CHAT HISTORY ARCHIVE CONTROLLER
   ============================================================ */
function formatWaktuChat(ts) {
  if (!ts) return '--:--';
  const d = new Date(ts);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' +
         d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function bukaChatHistory(buka) {
  const panel = document.getElementById('chatHistoryPanel');
  const backdrop = document.getElementById('chatHistoryBackdrop');
  if (!panel || !backdrop) return;

  panel.classList.toggle('visible', buka);
  backdrop.classList.toggle('visible', buka);

  if (buka) {
    const inpSearch = document.getElementById('inpSearchHistory');
    if (inpSearch) inpSearch.value = '';
    renderChatHistoryList();
  }
}

function renderChatHistoryList(filterQuery = '') {
  const container = document.getElementById('containerHistoryCards');
  const txtTotal = document.getElementById('txtChatHistoryTotal');
  if (!container) return;

  const allHistory = (Array.isArray(riwayat) && riwayat.length) ? riwayat : bacaCacheLokal();
  const query = (filterQuery || '').toLowerCase().trim();

  const filtered = query
    ? allHistory.filter(item =>
        (item.tanya && item.tanya.toLowerCase().includes(query)) ||
        (item.jawab && item.jawab.toLowerCase().includes(query))
      )
    : allHistory;

  if (txtTotal) txtTotal.textContent = `${filtered.length} dari ${allHistory.length} percakapan tersimpan`;

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px 0; color:#64748b; font-size:12px;">${query ? 'Tidak ada percakapan yang cocok dengan kata kunci.' : 'Belum ada riwayat percakapan.'}</div>`;
    return;
  }

  const reversed = [...filtered].reverse();
  reversed.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'history-card-item';

    const meta = document.createElement('div');
    meta.className = 'history-card-meta';

    const timeSpan = document.createElement('span');
    timeSpan.textContent = formatWaktuChat(item.waktu);

    const modeSpan = document.createElement('span');
    modeSpan.style.fontSize = '10px';
    modeSpan.style.fontWeight = '600';
    modeSpan.style.color = item.mode === 'cloud' ? '#38bdf8' : '#a78bfa';
    modeSpan.textContent = (item.provider || item.mode || 'AI').toUpperCase();

    meta.appendChild(timeSpan);
    meta.appendChild(modeSpan);

    const q = document.createElement('div');
    q.className = 'history-card-q';
    q.textContent = 'Q: ' + (item.tanya || '');

    const a = document.createElement('div');
    a.className = 'history-card-a';
    a.innerHTML = renderMarkdown(item.jawab || '');

    const actions = document.createElement('div');
    actions.className = 'history-card-actions';

    const btnCopy = document.createElement('button');
    btnCopy.type = 'button';
    btnCopy.className = 'history-action-link';
    btnCopy.textContent = 'Copy';
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(item.jawab || '').then(() => {
        btnCopy.textContent = 'Copied!';
        setTimeout(() => { btnCopy.textContent = 'Copy'; }, 1200);
      });
    });

    const btnReask = document.createElement('button');
    btnReask.type = 'button';
    btnReask.className = 'history-action-link';
    btnReask.textContent = 'Tanya Ulang ↗';
    btnReask.addEventListener('click', () => {
      const inpTanya = document.getElementById('inpTanya');
      if (inpTanya) {
        inpTanya.value = item.tanya || '';
        inpTanya.style.height = 'auto';
        inpTanya.style.height = Math.min(180, inpTanya.scrollHeight) + 'px';
        bukaChatHistory(false);
        inpTanya.focus();
      }
    });

    actions.appendChild(btnCopy);
    actions.appendChild(btnReask);

    card.appendChild(meta);
    card.appendChild(q);
    card.appendChild(a);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function eksporChatHistory(format = 'txt') {
  const allHistory = (Array.isArray(riwayat) && riwayat.length) ? riwayat : bacaCacheLokal();
  if (!allHistory.length) {
    alert('Tidak ada percakapan untuk diekspor!');
    return;
  }

  let content = '';
  let mimeType = 'text/plain';
  let filename = `AURA_Chat_History_${new Date().toISOString().slice(0, 10)}`;

  if (format === 'json') {
    content = JSON.stringify(allHistory, null, 2);
    mimeType = 'application/json';
    filename += '.json';
  } else {
    filename += '.txt';
    content = `=== AURA NEXT GEN CHAT ARCHIVE ===\nTanggal Ekspor: ${new Date().toLocaleString()}\nJumlah Percakapan: ${allHistory.length}\n\n`;
    allHistory.forEach((item, idx) => {
      content += `--------------------------------------------------\n`;
      content += `[#${idx + 1}] Waktu: ${formatWaktuChat(item.waktu)} | Mode: ${item.provider || item.mode || 'AI'}\n`;
      content += `USER: ${item.tanya}\n`;
      content += `AURA: ${item.jawab}\n\n`;
    });
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listeners for Chat History Modal
const btnCloseChatHistory = document.getElementById('btnTutupChatHistory');
if (btnCloseChatHistory) btnCloseChatHistory.addEventListener('click', () => bukaChatHistory(false));
const bgChatHistory = document.getElementById('chatHistoryBackdrop');
if (bgChatHistory) bgChatHistory.addEventListener('click', () => bukaChatHistory(false));

const inpSearchHistory = document.getElementById('inpSearchHistory');
if (inpSearchHistory) {
  inpSearchHistory.addEventListener('input', () => {
    renderChatHistoryList(inpSearchHistory.value);
  });
}

const btnExportTxt = document.getElementById('btnExportChatTxt');
if (btnExportTxt) btnExportTxt.addEventListener('click', () => eksporChatHistory('txt'));
const btnExportJson = document.getElementById('btnExportChatJson');
if (btnExportJson) btnExportJson.addEventListener('click', () => eksporChatHistory('json'));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const p = document.getElementById('chatHistoryPanel');
    if (p && p.classList.contains('visible')) bukaChatHistory(false);
  }
});

/* ===== Press feedback untuk touch device: :active sering tidak fire di tablet,
   jadi kelas .is-pressed di-toggle manual lewat Pointer Events. ===== */
(() => {
  const SELECTOR = '.toggle-btn, .clear-btn, .send-btn';
  let aktif = null;
  function lepas() {
    if (aktif) { aktif.classList.remove('is-pressed'); aktif = null; }
  }
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest(SELECTOR);
    if (!el) return;
    lepas();
    aktif = el;
    el.classList.add('is-pressed');
  }, { passive: true });
  // pointerup/cancel di document: tetap ke-lepas walau jari bergeser keluar tombol
  document.addEventListener('pointerup', lepas, { passive: true });
  document.addEventListener('pointercancel', lepas, { passive: true });
  window.addEventListener('blur', lepas);
})();

/* ===== LOCK SCREEN (WITH REMEMBER SESSION FEATURE) ===== */
(() => {
  const PASSWORD = 'aura1234';
  const REMEMBER_KEY = 'aura_session_remembered';
  const overlay   = document.getElementById('lockOverlay');
  const input     = document.getElementById('lockInput');
  const wrap      = document.getElementById('lockInputWrap');
  const error     = document.getElementById('lockError');
  const btnSubmit = document.getElementById('lockSubmit');
  const btnEye    = document.getElementById('lockToggleEye');
  const eyeIcon   = document.getElementById('eyeIcon');
  const remCheck  = document.getElementById('lockRemember');
  const btnLock   = document.getElementById('btnLock');

  const EYE_OPEN = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  const EYE_OFF  = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

  let eyeVisible = false;
  let sedangUnlock = false;

  // 1. Cek sesi tersimpan di perangkat ini
  try {
    const isSaved = localStorage.getItem(REMEMBER_KEY) === 'true';
    if (remCheck) remCheck.checked = isSaved;
    if (isSaved && overlay) {
      overlay.classList.add('unlocked');
      overlay.style.display = 'none';
      setTimeout(() => {
        const chatInput = document.getElementById('inpTanya');
        if (chatInput) chatInput.focus();
      }, 150);
    }
  } catch (e) {
    console.warn('localStorage access failed:', e);
  }

  // 2. Fungsi Kunci Kembali (Bisa dipanggil dari tombol dock atau console)
  window.kunciAura = function() {
    try {
      localStorage.removeItem(REMEMBER_KEY);
    } catch (e) {}
    if (overlay) {
      overlay.style.display = '';
      overlay.classList.remove('unlocked');
      overlay.classList.remove('success');
    }
    if (remCheck) remCheck.checked = false;
    sedangUnlock = false;
    if (btnSubmit) btnSubmit.classList.remove('loading', 'success');
    if (input) {
      input.value = '';
      input.focus();
    }
  };

  if (btnLock) {
    btnLock.addEventListener('click', () => {
      window.kunciAura();
    });
  }

  btnEye.addEventListener('click', () => {
    eyeVisible = !eyeVisible;
    input.type = eyeVisible ? 'text' : 'password';
    eyeIcon.innerHTML = eyeVisible ? EYE_OFF : EYE_OPEN;
    btnEye.classList.toggle('active', eyeVisible);
    input.focus();
  });

  function cobaBuka() {
    if (sedangUnlock) return;

    if (input.value === PASSWORD) {
      sedangUnlock = true;
      wrap.classList.remove('error');
      error.classList.remove('show');
      getar(8);

      // Simpan preferensi sesi jika dicentang
      try {
        if (remCheck && remCheck.checked) {
          localStorage.setItem(REMEMBER_KEY, 'true');
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch (e) {}

      // Step 1 — loading
      btnSubmit.classList.add('loading');

      setTimeout(() => {
        // Step 2 — success state + burst
        btnSubmit.classList.remove('loading');
        btnSubmit.classList.add('success');
        overlay.classList.add('success');
        getar([10, 30, 15]);

        // Step 3 — fade out
        setTimeout(() => {
          overlay.classList.add('unlocked');
          setTimeout(() => {
            const chatInput = document.getElementById('inpTanya');
            if (chatInput) chatInput.focus();
          }, 700);
        }, 520);
      }, 420);
    } else {
      wrap.classList.remove('error');
      void wrap.offsetWidth;
      wrap.classList.add('error');
      error.classList.add('show');
      input.value = '';
      input.focus();
      getar([40, 60, 40]);
    }
  }

  btnSubmit.addEventListener('click', cobaBuka);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); cobaBuka(); }
  });
  input.addEventListener('input', () => {
    if (error.classList.contains('show')) error.classList.remove('show');
    if (wrap.classList.contains('error')) wrap.classList.remove('error');
  });

  setTimeout(() => {
    if (!overlay.classList.contains('unlocked')) input.focus();
  }, 380);
})();
