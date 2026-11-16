# Cloud Photo Storage & Galeri Cloud - Implementation Plan

## Tasks:
- [ ] Task 1: Add Cloud Gallery & Lightbox CSS styles in `index.html` (VisionOS gallery grid, dropzone, lightbox overlay, responsive thumbnails).
- [ ] Task 2: Add Camera Button to Chat Bar (`#btnKameraChat`) and Gallery Trigger in System Controls Drawer & Quick Apps Launcher.
- [ ] Task 3: Add Cloud Gallery Modal & Lightbox HTML (`#galleryModalBackdrop`, `#galleryModalPanel`, `#galleryLightbox`).
- [ ] Task 4: Add JavaScript Controller for Cloud Photo Storage:
  - Image compression & base64 encoding (Canvas resize to max 800px width/height).
  - Firebase RTDB sync (`POST /galeri.json`, `DELETE /galeri/${id}.json`, `GET /galeri.json`).
  - IndexedDB / localStorage cache backup.
  - Lightbox viewer logic (zoom, next/prev, download, delete).
  - Chat intent parser ("simpan foto", "unggah foto", "buka galeri").
- [ ] Task 5: Verify JavaScript syntax across all `<script>` blocks in `index.html` and commit.
