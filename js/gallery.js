/* ============================================================
   AURA NEXT GEN: CLOUD PHOTO STORAGE & GALLERY CONTROLLER
   ============================================================ */
/* ============================================================
   AURA NEXT GEN: CLOUD PHOTO STORAGE & GALLERY CONTROLLER
   - Image Compression to WebP/JPEG Base64 (Max 800px)
   - Firebase Realtime Database Sync (/galeri.json)
   - LocalStorage Cache Fallback
   - Fullscreen Lightbox Viewer & Download
   ============================================================ */
const AURA_GALLERY_KEY = 'aura_cloud_gallery_v1';
let _galleryPhotos = [];
let _currentLightboxIdx = -1;

function muatGaleriDariCache() {
  try {
    const raw = localStorage.getItem(AURA_GALLERY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function simpanGaleriKeCache(list) {
  try {
    localStorage.setItem(AURA_GALLERY_KEY, JSON.stringify(list));
  } catch (e) {
    try {
      const ringkas = list.map(item => ({ id: item.id, caption: item.caption, timestamp: item.timestamp, size: item.size }));
      localStorage.setItem(AURA_GALLERY_KEY, JSON.stringify(ringkas));
    } catch (err) {}
  }
}

async function sinkronGaleriDariFirebase() {
  try {
    if (typeof FIREBASE_DB_URL === 'undefined') return;
    const res = await fetch(FIREBASE_DB_URL + '/galeri.json', { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return;
    const data = await res.json();
    if (!data) {
      _galleryPhotos = [];
      simpanGaleriKeCache([]);
      renderGalleryGrid();
      return;
    }

    const list = Object.keys(data).map(k => {
      const item = data[k];
      return {
        fbKey: k,
        id: item.id || k,
        caption: item.caption || 'Foto AURA',
        data: item.data || '',
        timestamp: item.timestamp || Date.now(),
        size: item.size || '35 KB'
      };
    });

    list.sort((a, b) => b.timestamp - a.timestamp);
    _galleryPhotos = list;
    simpanGaleriKeCache(list);
    renderGalleryGrid();
  } catch (e) {
    _galleryPhotos = muatGaleriDariCache();
    renderGalleryGrid();
  }
}

function bukaGalleryModal() {
  const backdrop = document.getElementById('galleryModalBackdrop');
  const panel = document.getElementById('galleryModalPanel');
  if (!backdrop || !panel) return;

  _galleryPhotos = muatGaleriDariCache();
  renderGalleryGrid();
  sinkronGaleriDariFirebase();

  backdrop.classList.add('visible');
  panel.classList.add('visible');
}

function tutupGalleryModal() {
  const backdrop = document.getElementById('galleryModalBackdrop');
  const panel = document.getElementById('galleryModalPanel');
  if (backdrop) backdrop.classList.remove('visible');
  if (panel) panel.classList.remove('visible');
}

function renderGalleryGrid() {
  const grid = document.getElementById('galleryGrid');
  const badge = document.getElementById('galleryCountBadge');
  if (badge) badge.textContent = `${_galleryPhotos.length} Foto`;
  if (!grid) return;

  if (_galleryPhotos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 36px 16px; text-align: center; color: #94a3b8;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #64748b; margin-bottom: 8px;">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <div style="font-size: 13px; font-weight: 500; color: #cbd5e1;">Belum Ada Foto di Cloud</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Unggah foto lewat tombol di atas atau klik ikon kamera di kolom chat.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = _galleryPhotos.map((photo, idx) => {
    const d = new Date(photo.timestamp);
    const tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const safeCaption = (photo.caption || 'Foto').replace(/"/g, '&quot;');

    return `
      <div class="gallery-card" data-idx="${idx}">
        <div class="gallery-thumb-wrap" onclick="bukaLightbox(${idx})">
          <img class="gallery-thumb-img" src="${photo.data}" alt="${safeCaption}" loading="lazy">
          <div class="gallery-thumb-overlay">
            <button type="button" class="gallery-action-icon-btn" title="Lihat Layar Penuh" onclick="event.stopPropagation(); bukaLightbox(${idx});">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button type="button" class="gallery-action-icon-btn" title="Download Foto" onclick="event.stopPropagation(); unduhFoto(${idx});">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button type="button" class="gallery-action-icon-btn btn-del" title="Hapus dari Cloud" onclick="event.stopPropagation(); hapusFotoDariCloud(${idx});">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="gallery-card-info">
          <span class="gallery-card-title" title="${safeCaption}">${safeCaption}</span>
          <div class="gallery-card-meta">
            <span>${tgl} · ${jam}</span>
            <span style="color:#5DCAA5;">${photo.size || ''}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function kompresGambar(file, maxDim = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const byteLen = Math.round((dataUrl.length * 3) / 4);
        const sizeStr = byteLen > 1024 * 1024
          ? (byteLen / (1024 * 1024)).toFixed(1) + ' MB'
          : Math.round(byteLen / 1024) + ' KB';

        resolve({ data: dataUrl, size: sizeStr });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function prosesUploadFoto(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Silakan pilih file gambar yang valid.');
    return;
  }

  const captionInp = document.getElementById('inpGalleryCaption');
  const caption = (captionInp && captionInp.value.trim()) || file.name.replace(/\.[^.]+$/, '') || 'Foto AURA';

  const btnPilih = document.getElementById('btnPilihFoto');
  if (btnPilih) {
    btnPilih.textContent = 'Mengompres...';
    btnPilih.disabled = true;
  }

  try {
    const hasil = await kompresGambar(file);
    if (btnPilih) btnPilih.textContent = 'Mengunggah...';

    const itemFoto = {
      id: 'img_' + Date.now(),
      caption: caption,
      data: hasil.data,
      timestamp: Date.now(),
      size: hasil.size
    };

    if (typeof FIREBASE_DB_URL !== 'undefined') {
      const res = await fetch(FIREBASE_DB_URL + '/galeri.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemFoto)
      });
      const resData = await res.json();
      if (resData && resData.name) {
        itemFoto.fbKey = resData.name;
      }
    }

    _galleryPhotos.unshift(itemFoto);
    simpanGaleriKeCache(_galleryPhotos);
    renderGalleryGrid();

    if (captionInp) captionInp.value = '';
    if (typeof getar === 'function') getar(30);
  } catch (err) {
    alert('Gagal mengunggah foto ke cloud. Silakan coba lagi.');
  } finally {
    if (btnPilih) {
      btnPilih.textContent = 'Pilih Foto';
      btnPilih.disabled = false;
    }
  }
}

async function hapusFotoDariCloud(idx) {
  const foto = _galleryPhotos[idx];
  if (!foto) return;

  if (!confirm(`Hapus foto "${foto.caption}" dari Cloud Gallery?`)) return;

  _galleryPhotos.splice(idx, 1);
  simpanGaleriKeCache(_galleryPhotos);
  renderGalleryGrid();
  if (typeof getar === 'function') getar(20);

  try {
    const key = foto.fbKey || foto.id;
    if (typeof FIREBASE_DB_URL !== 'undefined' && key) {
      await fetch(FIREBASE_DB_URL + `/galeri/${key}.json`, { method: 'DELETE' });
    }
  } catch (e) {}
}

function unduhFoto(idx) {
  const foto = _galleryPhotos[idx];
  if (!foto || !foto.data) return;

  const a = document.createElement('a');
  a.href = foto.data;
  const safeName = (foto.caption || 'aura_foto').replace(/[^a-z0-9_-]/gi, '_');
  a.download = `${safeName}_${Date.now()}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function bukaLightbox(idx) {
  const foto = _galleryPhotos[idx];
  if (!foto) return;
  _currentLightboxIdx = idx;

  const lb = document.getElementById('galleryLightbox');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  const meta = document.getElementById('lightboxMeta');
  if (!lb || !img) return;

  img.src = foto.data;
  if (cap) cap.textContent = foto.caption || 'Foto AURA';
  if (meta) {
    const d = new Date(foto.timestamp);
    meta.textContent = `${d.toLocaleString('id-ID')} · ${foto.size || ''}`;
  }

  lb.classList.add('visible');
}

function tutupLightbox() {
  const lb = document.getElementById('galleryLightbox');
  if (lb) lb.classList.remove('visible');
  _currentLightboxIdx = -1;
}

function deteksiIntentGaleri(teks) {
  if (!teks) return null;
  const t = teks.trim().toLowerCase();

  if (/(?:buka\s+galeri|lihat\s+foto|galeri\s+cloud|koleksi\s+foto|album\s+foto)/i.test(t)) {
    return { tipe: 'buka_galeri' };
  }

  if (/(?:simpan\s+foto|unggah\s+foto|upload\s+foto|ambil\s+foto|tambah\s+foto|kirim\s+foto)/i.test(t)) {
    return { tipe: 'upload_foto' };
  }

  return null;
}

// Inisialisasi Event Listener Cloud Gallery
(() => {
  // Trigger di System Controls Drawer & Chat Bar
  const btnOpen = document.getElementById('btnOpenGalleryModal');
  if (btnOpen) btnOpen.addEventListener('click', bukaGalleryModal);

  const btnCam = document.getElementById('btnKameraChat');
  if (btnCam) btnCam.addEventListener('click', bukaGalleryModal);

  // Close buttons & backdrop
  const btnClose = document.getElementById('btnTutupGalleryModal');
  if (btnClose) btnClose.addEventListener('click', tutupGalleryModal);

  const backdrop = document.getElementById('galleryModalBackdrop');
  if (backdrop) backdrop.addEventListener('click', tutupGalleryModal);

  // Upload picker
  const btnPilih = document.getElementById('btnPilihFoto');
  const inpFile = document.getElementById('inpGalleryFile');
  if (btnPilih && inpFile) {
    btnPilih.addEventListener('click', () => inpFile.click());
    inpFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        prosesUploadFoto(e.target.files[0]);
      }
    });
  }

  // Dropzone drag and drop
  const dropzone = document.getElementById('galleryDropzone');
  if (dropzone && inpFile) {
    dropzone.addEventListener('click', () => inpFile.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        prosesUploadFoto(e.dataTransfer.files[0]);
      }
    });
  }

  // Toggle Upload Area
  const btnToggleUpload = document.getElementById('btnToggleUploadArea');
  if (btnToggleUpload && dropzone) {
    btnToggleUpload.addEventListener('click', () => {
      dropzone.style.display = dropzone.style.display === 'none' ? 'flex' : 'none';
    });
  }

  // Lightbox Events
  const btnLbClose = document.getElementById('btnLightboxClose');
  if (btnLbClose) btnLbClose.addEventListener('click', tutupLightbox);

  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) tutupLightbox();
    });
  }

  const btnLbDownload = document.getElementById('btnLightboxDownload');
  if (btnLbDownload) {
    btnLbDownload.addEventListener('click', () => {
      if (_currentLightboxIdx >= 0) unduhFoto(_currentLightboxIdx);
    });
  }

  // Esc key to close gallery / lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const lb = document.getElementById('galleryLightbox');
      if (lb && lb.classList.contains('visible')) {
        tutupLightbox();
        return;
      }
      const panel = document.getElementById('galleryModalPanel');
      if (panel && panel.classList.contains('visible')) {
        tutupGalleryModal();
      }
    }
  });

  // Initial load
  _galleryPhotos = muatGaleriDariCache();
  renderGalleryGrid();
})();
