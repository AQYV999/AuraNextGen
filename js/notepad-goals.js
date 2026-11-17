/* ============================================================
   AURA NEXT GEN: NOTEPAD & GOALS CONTROLLER
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: NOTEPAD & GOALS CONTROLLER
   ============================================================ */
const AURA_NOTEPAD_STORAGE_KEY = 'aura_notepad_data';

function muatDataNotepad() {
  try {
    const raw = localStorage.getItem(AURA_NOTEPAD_STORAGE_KEY);
    if (!raw) return { notes: '', goals: [] };
    const parsed = JSON.parse(raw);
    return {
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      goals: Array.isArray(parsed.goals) ? parsed.goals : []
    };
  } catch (e) {
    return { notes: '', goals: [] };
  }
}

function simpanDataNotepad(data) {
  try {
    localStorage.setItem(AURA_NOTEPAD_STORAGE_KEY, JSON.stringify(data));
    const txtSave = document.getElementById('txtNotepadSaveState');
    if (txtSave) {
      txtSave.textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      txtSave.style.color = '#5DCAA5';
    }
    perbaruiWidgetPreview();
  } catch (e) {
    console.error('Gagal simpan notepad data:', e);
  }
}

let notepadData = muatDataNotepad();
let notepadDebounceTimer = null;

function perbaruiWidgetPreview() {
  const previewTxt = document.getElementById('widgetNotesPreview');
  const barFill = document.getElementById('widgetGoalsBarFill');
  const metaTxt = document.getElementById('widgetGoalsMetaTxt');
  const metaPct = document.getElementById('widgetGoalsMetaPct');

  if (previewTxt) {
    const raw = (notepadData.notes || '').trim();
    previewTxt.textContent = raw ? raw : 'Belum ada catatan. Klik untuk mulai menulis...';
  }

  const goals = notepadData.goals || [];
  let selesai = 0;
  goals.forEach(g => { if (g.done) selesai++; });
  const pct = goals.length > 0 ? Math.round((selesai / goals.length) * 100) : 0;

  if (barFill) barFill.style.width = pct + '%';
  if (metaPct) metaPct.textContent = pct + '%';
  if (metaTxt) metaTxt.textContent = goals.length > 0 ? `${selesai}/${goals.length} target` : '0 target';
}

function perbaruiWidgetWeatherPreview(data, loc) {
  if (!data || !data.current) return;
  const cur = data.current;
  const daily = data.daily || {};

  const elTemp = document.getElementById('widgetWeatherTemp');
  if (elTemp && typeof cur.temperature_2m === 'number') {
    elTemp.textContent = `${Math.round(cur.temperature_2m)}°C`;
  }

  const elCity = document.getElementById('widgetWeatherCity');
  if (elCity && loc && loc.name) {
    elCity.textContent = loc.name.split(',')[0].trim();
  }

  const elCond = document.getElementById('widgetWeatherCond');
  if (elCond) {
    elCond.textContent = typeof getDeskripsiCuaca === 'function' ? getDeskripsiCuaca(cur.weather_code) : 'Normal';
  }

  const elSub = document.getElementById('widgetWeatherSub');
  if (elSub) {
    const pMax = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
    const uvVal = daily.uv_index_max ? daily.uv_index_max[0] : 0;
    elSub.textContent = `💧 ${pMax}% · ☀️ UV ${uvVal}`;
  }

  const elIcon = document.getElementById('widgetWeatherIcon');
  if (elIcon && typeof getIconSvgCuaca === 'function') {
    elIcon.innerHTML = getIconSvgCuaca(cur.weather_code, cur.is_day, 12);
  }
}

function perbaruiWidgetHistoryPreview() {
  const elCount = document.getElementById('widgetHistoryCount');
  const elPrev = document.getElementById('widgetHistoryPreview');
  const elTime = document.getElementById('widgetHistoryTime');

  const count = Array.isArray(riwayat) ? riwayat.length : 0;
  if (elCount) {
    elCount.textContent = count > 0 ? `${count} pesan` : '0 pesan';
  }

  if (elPrev) {
    if (count > 0) {
      const last = riwayat[riwayat.length - 1];
      const q = (last.tanya || '').trim();
      elPrev.textContent = q ? `Q: "${q}"` : 'Ada percakapan';
    } else {
      elPrev.textContent = 'Belum ada riwayat...';
    }
  }

  if (elTime) {
    if (count > 0) {
      const last = riwayat[riwayat.length - 1];
      if (last.waktu) {
        const d = new Date(last.waktu);
        elTime.textContent = `Jam ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } else {
        elTime.textContent = 'Klik buka arsip';
      }
    } else {
      elTime.textContent = 'Klik buka arsip';
    }
  }
}

function hitungStatistikCatatan(teks) {
  const chars = teks.length;
  const words = teks.trim() ? teks.trim().split(/\s+/).length : 0;
  const el = document.getElementById('txtNotepadCount');
  if (el) el.textContent = `${words} kata · ${chars} karakter`;
}

function renderGoalsList() {
  const container = document.getElementById('listGoals');
  const bar = document.getElementById('barGoalsProgress');
  const txtPercent = document.getElementById('txtGoalsProgressPercent');
  const txtCount = document.getElementById('txtGoalsCount');
  if (!container) return;

  const goals = notepadData.goals || [];
  container.innerHTML = '';

  if (goals.length === 0) {
    container.innerHTML = '<div style="font-size:11.5px; color:#64748b; text-align:center; padding:18px 0;">Belum ada target. Tambahkan target pertamamu di atas!</div>';
    if (bar) bar.style.width = '0%';
    if (txtPercent) txtPercent.textContent = '0%';
    if (txtCount) txtCount.textContent = '0 target';
    return;
  }

  let selesai = 0;
  goals.forEach((g) => {
    if (g.done) selesai++;
    const item = document.createElement('div');
    item.className = 'goal-item' + (g.done ? ' done' : '');

    const left = document.createElement('div');
    left.className = 'goal-item-left';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'goal-checkbox';
    chk.checked = Boolean(g.done);
    chk.addEventListener('change', () => {
      g.done = chk.checked;
      simpanDataNotepad(notepadData);
      renderGoalsList();
    });

    const span = document.createElement('span');
    span.className = 'goal-text';
    span.textContent = g.text;

    left.appendChild(chk);
    left.appendChild(span);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'goal-del-btn';
    delBtn.title = 'Hapus target';
    delBtn.innerHTML = '✕';
    delBtn.addEventListener('click', () => {
      notepadData.goals = notepadData.goals.filter(item => item.id !== g.id);
      simpanDataNotepad(notepadData);
      renderGoalsList();
    });

    item.appendChild(left);
    item.appendChild(delBtn);
    container.appendChild(item);
  });

  const percent = Math.round((selesai / goals.length) * 100);
  if (bar) bar.style.width = percent + '%';
  if (txtPercent) txtPercent.textContent = percent + '%';
  if (txtCount) txtCount.textContent = `${selesai} dari ${goals.length} target selesai`;
}

function bukaNotepad(buka) {
  const panel = document.getElementById('notepadPanel');
  const backdrop = document.getElementById('notepadBackdrop');
  if (!panel || !backdrop) return;

  panel.classList.toggle('visible', buka);
  backdrop.classList.toggle('visible', buka);

  if (buka) {
    notepadData = muatDataNotepad();
    const txtArea = document.getElementById('txtCatatan');
    if (txtArea) {
      txtArea.value = notepadData.notes || '';
      hitungStatistikCatatan(txtArea.value);
    }
    renderGoalsList();
  }
}

// Inisialisasi Event Listener Notepad
const btnOpenNotepad = document.getElementById('btnBukaNotepad');
if (btnOpenNotepad) btnOpenNotepad.addEventListener('click', () => bukaNotepad(true));
const btnCloseNotepad = document.getElementById('btnTutupNotepad');
if (btnCloseNotepad) btnCloseNotepad.addEventListener('click', () => bukaNotepad(false));
const bgNotepad = document.getElementById('notepadBackdrop');
if (bgNotepad) bgNotepad.addEventListener('click', () => bukaNotepad(false));

// Tab Switcher Notes vs Goals vs Reminders
const tabBtnNotes = document.getElementById('tabBtnNotes');
const tabBtnGoals = document.getElementById('tabBtnGoals');
const tabBtnReminders = document.getElementById('tabBtnReminders');
const contentTabNotes = document.getElementById('contentTabNotes');
const contentTabGoals = document.getElementById('contentTabGoals');
const contentTabReminders = document.getElementById('contentTabReminders');

function aktifkanNotepadTab(tabName) {
  if (tabBtnNotes) tabBtnNotes.classList.toggle('active', tabName === 'notes');
  if (tabBtnGoals) tabBtnGoals.classList.toggle('active', tabName === 'goals');
  if (tabBtnReminders) tabBtnReminders.classList.toggle('active', tabName === 'reminders');

  if (contentTabNotes) contentTabNotes.classList.toggle('active', tabName === 'notes');
  if (contentTabGoals) contentTabGoals.classList.toggle('active', tabName === 'goals');
  if (contentTabReminders) contentTabReminders.classList.toggle('active', tabName === 'reminders');

  if (tabName === 'reminders') renderRemindersList();
}

if (tabBtnNotes) tabBtnNotes.addEventListener('click', () => aktifkanNotepadTab('notes'));
if (tabBtnGoals) tabBtnGoals.addEventListener('click', () => aktifkanNotepadTab('goals'));
if (tabBtnReminders) tabBtnReminders.addEventListener('click', () => aktifkanNotepadTab('reminders'));

// Autosave Textarea Catatan
const txtCatatan = document.getElementById('txtCatatan');
if (txtCatatan) {
  txtCatatan.addEventListener('input', () => {
    hitungStatistikCatatan(txtCatatan.value);
    const txtSave = document.getElementById('txtNotepadSaveState');
    if (txtSave) {
      txtSave.textContent = 'Typing...';
      txtSave.style.color = '#94a3b8';
    }
    clearTimeout(notepadDebounceTimer);
    notepadDebounceTimer = setTimeout(() => {
      notepadData.notes = txtCatatan.value;
      simpanDataNotepad(notepadData);
    }, 400);
  });
}

// Clear Catatan
const btnClearNotes = document.getElementById('btnBersihkanCatatan');
if (btnClearNotes) {
  btnClearNotes.addEventListener('click', () => {
    if (confirm('Bersihkan isi catatan?')) {
      if (txtCatatan) txtCatatan.value = '';
      notepadData.notes = '';
      hitungStatistikCatatan('');
      simpanDataNotepad(notepadData);
    }
  });
}

// Tambah Goal
function tambahGoalBaru() {
  const inp = document.getElementById('inpNewGoal');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;

  if (!Array.isArray(notepadData.goals)) notepadData.goals = [];
  notepadData.goals.unshift({
    id: 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    text: val,
    done: false
  });
  simpanDataNotepad(notepadData);
  inp.value = '';
  renderGoalsList();
}

const btnAddGoal = document.getElementById('btnAddGoal');
if (btnAddGoal) btnAddGoal.addEventListener('click', tambahGoalBaru);
const inpNewGoal = document.getElementById('inpNewGoal');
if (inpNewGoal) {
  inpNewGoal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tambahGoalBaru();
    }
  });
}

// Salin ke Chat (Ask AI)
const btnSalinKeChat = document.getElementById('btnSalinKeChat');
if (btnSalinKeChat) {
  btnSalinKeChat.addEventListener('click', () => {
    const txtArea = document.getElementById('txtCatatan');
    const inpTanya = document.getElementById('inpTanya');
    if (!txtArea || !inpTanya) return;
    const isi = txtArea.value.trim();
    if (!isi) {
      alert('Catatan masih kosong!');
      return;
    }
    inpTanya.value = 'Berikut catatanku, tolong berikan analisis/ringkasan atau bantuan terkait ini:\n\n' + isi;
    inpTanya.style.height = 'auto';
    inpTanya.style.height = Math.min(180, inpTanya.scrollHeight) + 'px';
    bukaNotepad(false);
    inpTanya.focus();
  });
}

// Escape key to close Notepad
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const p = document.getElementById('notepadPanel');
    if (p && p.classList.contains('visible')) bukaNotepad(false);
  }
});

// Click widget card to open Notepad & Goals
const widgetCard = document.getElementById('notepadWidgetCard');
if (widgetCard) widgetCard.addEventListener('click', () => bukaNotepad(true));

// Click dual sub-widget cards (Cuaca & Riwayat)
const widgetWeather = document.getElementById('weatherWidgetCard');
if (widgetWeather) {
  widgetWeather.addEventListener('click', () => {
    if (typeof bukaWeatherModal === 'function') bukaWeatherModal();
  });
}

const widgetHistory = document.getElementById('historyWidgetCard');
if (widgetHistory) {
  widgetHistory.addEventListener('click', () => {
    if (typeof bukaChatHistory === 'function') bukaChatHistory(true);
  });
}

// Initial preview update
try { perbaruiWidgetPreview(); } catch (e) {}
try { perbaruiWidgetHistoryPreview(); } catch (e) {}
