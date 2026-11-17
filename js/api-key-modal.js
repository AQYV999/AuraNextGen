/* ============================================================
   AURA NEXT GEN: API KEY MODAL CONTROLLER
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: API KEY MODAL CONTROLLER
   ============================================================ */
function bukaApiModal(buka) {
  const modal = document.getElementById('apiModalPanel');
  const backdrop = document.getElementById('apiModalBackdrop');
  if (!modal || !backdrop) return;
  modal.classList.toggle('visible', buka);
  backdrop.classList.toggle('visible', buka);

  if (buka) {
    const k = muatApiKeys();
    const inpG = document.getElementById('inpGeminiKey');
    const selGM = document.getElementById('selGeminiModel');
    const inpOR = document.getElementById('inpOpenRouterKey');
    const selORM = document.getElementById('selOpenRouterModel');
    const inpC = document.getElementById('inpCustomKey');
    const chkF = document.getElementById('chkAutoFallback');
    const resTxt = document.getElementById('txtApiTestResult');

    if (inpG) inpG.value = k.geminiKey || '';
    if (selGM) selGM.value = k.geminiModel || 'gemini-2.5-flash';
    if (inpOR) inpOR.value = k.openRouterKey || '';
    if (selORM) selORM.value = k.openRouterModel || 'google/gemini-2.0-flash-001';
    if (inpC) inpC.value = k.customKey || '';
    if (chkF) chkF.checked = (k.autoFallback !== false);
    if (resTxt) resTxt.textContent = '';
    perbaruiIndikatorApiKeys();
  }
}

const btnOpenApi = document.getElementById('btnOpenApiModal');
if (btnOpenApi) btnOpenApi.addEventListener('click', () => bukaApiModal(true));
const btnCloseApi = document.getElementById('btnTutupApiModal');
if (btnCloseApi) btnCloseApi.addEventListener('click', () => bukaApiModal(false));
const bgApi = document.getElementById('apiModalBackdrop');
if (bgApi) bgApi.addEventListener('click', () => bukaApiModal(false));

// Toggle eye visibility
document.querySelectorAll('.api-toggle-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const inp = document.getElementById(targetId);
    if (!inp) return;
    if (inp.type === 'password') {
      inp.type = 'text';
      btn.textContent = '🔒';
    } else {
      inp.type = 'password';
      btn.textContent = '👁';
    }
  });
});

// Save button
const btnSaveApi = document.getElementById('btnSimpanApiKey');
if (btnSaveApi) {
  btnSaveApi.addEventListener('click', () => {
    const data = {
      geminiKey: (document.getElementById('inpGeminiKey')?.value || '').trim(),
      geminiModel: document.getElementById('selGeminiModel')?.value || 'gemini-2.5-flash',
      openRouterKey: (document.getElementById('inpOpenRouterKey')?.value || '').trim(),
      openRouterModel: document.getElementById('selOpenRouterModel')?.value || 'google/gemini-2.0-flash-001',
      customKey: (document.getElementById('inpCustomKey')?.value || '').trim(),
      autoFallback: Boolean(document.getElementById('chkAutoFallback')?.checked)
    };
    simpanApiKeys(data);
    const resTxt = document.getElementById('txtApiTestResult');
    if (resTxt) {
      resTxt.style.color = '#10b981';
      resTxt.textContent = 'Keys saved successfully!';
    }
    setTimeout(() => bukaApiModal(false), 800);
  });
}

// Test Connection Button
const btnTestApi = document.getElementById('btnTestApiKey');
if (btnTestApi) {
  btnTestApi.addEventListener('click', async () => {
    const resTxt = document.getElementById('txtApiTestResult');
    if (!resTxt) return;
    resTxt.style.color = '#38bdf8';
    resTxt.textContent = 'Testing connection...';

    const gemKey = (document.getElementById('inpGeminiKey')?.value || '').trim();
    const gemModel = document.getElementById('selGeminiModel')?.value || 'gemini-2.5-flash';
    const orKey = (document.getElementById('inpOpenRouterKey')?.value || '').trim();
    const orModel = document.getElementById('selOpenRouterModel')?.value || 'google/gemini-2.0-flash-001';

    if (!gemKey && !orKey) {
      resTxt.style.color = '#ef4444';
      resTxt.textContent = 'Please paste at least one key!';
      return;
    }

    let successCount = 0;
    let errMsgs = [];

    if (gemKey) {
      try {
        await tanyaGeminiDirect('Halo, jawab "OK"', [], gemKey, gemModel);
        successCount++;
      } catch (e) {
        errMsgs.push('Gemini: ' + e.message);
      }
    }

    if (orKey) {
      try {
        await tanyaOpenRouterDirect('Halo, jawab "OK"', [], orKey, orModel);
        successCount++;
      } catch (e) {
        errMsgs.push('OpenRouter: ' + e.message);
      }
    }

    if (successCount > 0) {
      resTxt.style.color = '#10b981';
      resTxt.textContent = (successCount === 2 || (!gemKey || !orKey)) ? 'Connection OK!' : 'Partial OK';
    } else {
      resTxt.style.color = '#ef4444';
      resTxt.textContent = errMsgs.join('; ').slice(0, 50);
    }
  });
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const m = document.getElementById('apiModalPanel');
    if (m && m.classList.contains('visible')) bukaApiModal(false);
  }
});

// Update status button on initial page load
try { perbaruiIndikatorApiKeys(); } catch (e) {}
