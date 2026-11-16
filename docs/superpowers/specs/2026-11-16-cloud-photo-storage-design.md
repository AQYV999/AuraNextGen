# Cloud Photo Storage & Galeri Cloud - Design Spec

## 1. Overview
Fitur **Simpan Foto ke Cloud (Cloud Photo Storage & Gallery)** memungkinkan pengguna AURA NEXT GEN untuk mengunggah, menyimpan, melihat, dan mengelola foto ke cloud (Firebase RTDB `/galeri.json` dengan kompresi web/base64 & IndexedDB/localStorage backup). Dilengkapi antarmuka galeri foto VisionOS yang responsif, lightbox viewer layar penuh, tombol ambil foto langsung (kamera/file), serta integrasi tombol kamera pada chat bar dan chat intent suara.

## 2. Architecture & Data Flow
```
User Actions:
  - Tombol Kamera di Chat Bar (#btnKameraChat)
  - Quick Apps / Drawer Menu ("Cloud Gallery")
  - Voice / Chat Intent ("simpan foto", "buka galeri", "unggah gambar")
       │
       ▼
  File Picker / Camera Capture (HTML5 File API / Image Compression Canvas)
       │
       ▼
  Image Optimizer (Max 800px width/height, WebP/JPEG ~80% quality, compact base64)
       │
       ├─► Simpan ke Firebase RTDB:
       │   POST /galeri.json -> {
       │     id: "img_...",
       │     title: "Foto Catatan / ESP32",
       │     data: "data:image/jpeg;base64,...",
       │     timestamp: 1731776000000,
       │     size: "45 KB"
       │   }
       │
       └─► IndexedDB / Cache Lokal untuk offline speed & fallback
```

## 3. UI/UX Components
1. **Chat Bar Camera Trigger (`#btnKameraChat`):**
   - Ikon kamera elegan di sebelah textarea `inpTanya`.
   - Mengklik akan membuka modal upload / galeri atau langsung memicu upload foto baru.
2. **Cloud Gallery Modal (`#galleryModalPanel`):**
   - Header: Judul "AURA Cloud Gallery", jumlah foto tersimpan, tombol "Upload Foto", tombol Close.
   - Upload Dropzone Area: Drag & drop foto atau klik untuk pilih file dari perangkat / kamera HP. Input caption/judul singkat.
   - Photo Grid (2-4 kolom responsif):
     - Thumbnail foto dengan hover glow.
     - Metadata: Judul, tanggal/jam upload, ukuran file.
     - Aksi per foto: Klik untuk Fullscreen Lightbox, Unduh (Download), Hapus (Delete dari Firebase).
3. **Fullscreen Lightbox Viewer (`#galleryLightbox`):**
   - Tampilan foto resolusi penuh dengan latar belakang ultra-dark frosted glass.
   - Tombol Tutup, Navigasi Previous / Next, Tombol Download.
4. **Chat & Voice Intent Handler:**
   - "buka galeri", "lihat foto", "galeri cloud" -> buka galeri.
   - "simpan foto", "unggah foto", "ambil foto" -> buka dialog upload foto.
