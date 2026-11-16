# AURA Control Center (ACC) - Implementation Plan

## Tasks:
- [ ] Task 1: Create `Aura Folder Arduino/acc_control.h` with ESP32 servo & 4-channel relay control logic and Firebase sync functions.
- [ ] Task 2: Add ACC styles in `index.html` (VisionOS glass modal, arc angle gauge, slider, relay grid, rotating fan animation, glowing LED toggles).
- [ ] Task 3: Add ACC Modal HTML (`#accModalBackdrop`, `#accModalPanel`) & trigger buttons in `.control-grid` and Quick Apps Launcher.
- [ ] Task 4: Add ACC JavaScript in `index.html`:
  - Firebase sync for servo and relays (`bukaAccModal()`, `setServoAngle()`, `toggleRelay()`, `toggleSweep()`, `simpanAccKeFirebase()`, `sinkronAccDariFirebase()`).
  - Chat intent parser for hardware control ("putar servo 90", "nyalakan lampu", "matikan kipas", dsb.).
- [ ] Task 5: Verify JavaScript syntax across all `<script>` blocks in `index.html` and commit.
