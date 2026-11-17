/* ============================================================
   AURA NEXT GEN: NOTIFICATION & REMINDER SCHEDULER
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: NOTIFICATION & REMINDER SCHEDULER
   ============================================================ */
const AURA_REMINDERS_KEY = 'aura_reminders';

function muatReminders() {
  try {
    const raw = localStorage.getItem(AURA_REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function simpanReminders(list) {
  try {
    localStorage.setItem(AURA_REMINDERS_KEY, JSON.stringify(list));
    renderRemindersList();
  } catch (e) {
    console.error('Gagal simpan reminders:', e);
  }
}

function mintaIzinNotifikasi() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

function tambahReminder(pesan, durasiMenit) {
  mintaIzinNotifikasi();
  const menit = Math.max(1, parseInt(durasiMenit, 10) || 5);
  const targetTime = Date.now() + (menit * 60 * 1000);
  const timeStr = new Date(targetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const reminders = muatReminders();
  reminders.push({
    id: 'rem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    text: pesan || 'Pengingat dari AURA',
    time: targetTime,
    timeStr: timeStr,
    created: Date.now()
  });

  simpanReminders(reminders);
  return { timeStr, menit };
}

function hapusReminder(id) {
  const reminders = muatReminders().filter(r => r.id !== id);
  simpanReminders(reminders);
}

function renderRemindersList() {
  const container = document.getElementById('listReminders');
  if (!container) return;
  const reminders = muatReminders();
  container.innerHTML = '';

  if (reminders.length === 0) {
    container.innerHTML = '<div style="font-size:11.5px; color:#64748b; text-align:center; padding:16px 0;">Tidak ada pengingat aktif.</div>';
    return;
  }

  reminders.sort((a, b) => a.time - b.time);
  reminders.forEach(r => {
    const sisaMs = r.time - Date.now();
    const sisaMenit = Math.max(0, Math.ceil(sisaMs / 60000));

    const item = document.createElement('div');
    item.className = 'reminder-item';

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';

    const tag = document.createElement('span');
    tag.className = 'reminder-time-tag';
    tag.textContent = r.timeStr + ` (${sisaMenit}m)`;

    const text = document.createElement('span');
    text.style.fontSize = '12px';
    text.style.color = '#e2e8f0';
    text.textContent = r.text;

    left.appendChild(tag);
    left.appendChild(text);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'goal-del-btn';
    delBtn.innerHTML = '✕';
    delBtn.title = 'Batalkan pengingat';
    delBtn.addEventListener('click', () => hapusReminder(r.id));

    item.appendChild(left);
    item.appendChild(delBtn);
    container.appendChild(item);
  });
}

function picuAlertReminder(reminder) {
  // 1. Audio TTS voice
  const voiceMsg = 'Pengingat untukmu: ' + reminder.text;
  ucapkanDiBrowser(voiceMsg);

  // 2. Browser Desktop Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('AURA Reminder ⏰', {
        body: reminder.text,
        icon: 'assets/icons/rtc.png'
      });
    } catch (e) {}
  }

  // 3. Floating Banner Toast
  const banner = document.getElementById('reminderAlertBanner');
  const txtMsg = document.getElementById('txtAlertBannerMsg');
  if (banner && txtMsg) {
    txtMsg.textContent = reminder.text;
    banner.classList.add('visible');
    getar([50, 100, 50, 100]);
    setTimeout(() => {
      banner.classList.remove('visible');
    }, 15000);
  }
}

// Dismiss button for banner
const btnDismiss = document.getElementById('btnDismissReminder');
if (btnDismiss) {
  btnDismiss.addEventListener('click', () => {
    const banner = document.getElementById('reminderAlertBanner');
    if (banner) banner.classList.remove('visible');
  });
}

// Background scheduler ticker (cek tiap 1 detik)
setInterval(() => {
  const reminders = muatReminders();
  if (!reminders.length) return;

  const now = Date.now();
  const masihAktif = [];

  reminders.forEach(r => {
    if (now >= r.time) {
      picuAlertReminder(r);
    } else {
      masihAktif.push(r);
    }
  });

  if (masihAktif.length !== reminders.length) {
    simpanReminders(masihAktif);
  }
}, 1000);

// Preset Chips and Manual Add
let selectedReminderMin = 5;
document.querySelectorAll('.reminder-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.reminder-chip').forEach(c => c.style.borderColor = 'rgba(255,255,255,0.1)');
    chip.style.borderColor = '#5DCAA5';
    selectedReminderMin = parseInt(chip.getAttribute('data-min'), 10) || 5;
    const inpCustom = document.getElementById('inpCustomMin');
    if (inpCustom) inpCustom.value = '';
  });
});

const btnSetReminder = document.getElementById('btnSetReminder');
if (btnSetReminder) {
  btnSetReminder.addEventListener('click', () => {
    const inpText = document.getElementById('inpReminderText');
    const inpCustom = document.getElementById('inpCustomMin');
    const text = (inpText?.value || '').trim();
    if (!text) {
      alert('Tulis pesan pengingat terlebih dahulu!');
      return;
    }
    let durasi = selectedReminderMin;
    if (inpCustom && inpCustom.value) {
      durasi = parseInt(inpCustom.value, 10) || durasi;
    }
    const res = tambahReminder(text, durasi);
    if (inpText) inpText.value = '';
    renderRemindersList();
    alert(`Pengingat disetel untuk jam ${res.timeStr} (${res.menit} menit lagi)!`);
  });
}

try { renderRemindersList(); } catch (e) {}
