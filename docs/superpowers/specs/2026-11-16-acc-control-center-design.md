# AURA Control Center (ACC) - Design Spec

## 1. Overview
AURA Control Center (ACC) adalah pusat kendali perangkat keras IoT interaktif untuk sistem robotik & smart home AURA NEXT GEN. Memungkinkan pengguna mengendalikan servo motor (0°-180°) dan multi-relay/saklar GPIO melalui antarmuka web VisionOS glassmorphism yang terhubung realtime ke Firebase Realtime Database dan ESP32, serta mendukung kontrol suara/chat intent langsung.

## 2. Architecture & Data Flow
```
Web Dashboard (ACC Modal / Chat)
   │
   ├─► Realtime Slider / Toggle Buttons
   │     │
   │     ▼ (Debounced REST PUT)
   │   Firebase RTDB:
   │   /acc/servo.json   --> { angle: 0-180, sweep: false, updatedAt: 173... }
   │   /acc/relays.json  --> { r1: true, r2: false, r3: false, r4: false, updatedAt: 173... }
   │   /acc/names.json   --> { r1: "Lampu Utama", r2: "Kipas", r3: "Colokan", r4: "Aksesori" }
   │
   └─► Chat Intent Parser ("putar servo 90", "nyalakan lampu", "buka acc")
         │
         ▼
       Update Firebase + Voice TTS Feedback + ACC Modal UI Sync

ESP32 Firmware (acc_control.h / firebase_client.h)
   │
   ├─► Periodic Poll / Stream /acc.json (500ms - 1000ms)
   ├─► PWM Servo Control (GPIO 18 / ESP32Servo / ledcWrite)
   └─► GPIO Digital Output (GPIO 25, 27, 5, 15) untuk 4-Channel Relay
```

## 3. UI/UX Specifications
- **Trigger Points:**
  1. System Controls Drawer: tombol "ACC Control" di `.control-grid`.
  2. Quick Apps Launcher: kartu "Control Center (ACC)".
  3. Chat Command: "buka acc", "kontrol servo", "buka kontrol center".
- **Modal Structure (`#accModalPanel`):**
  - **Header:** Glass icon, status sync realtime (Online / Syncing), close button.
  - **Servo Section:**
    - Live Circular Angle Arc Visualizer.
    - Large glowing angle readout (e.g. `90°`).
    - Smooth slider 0° to 180° with custom gradient track.
    - Presets: `0° (Min)`, `45°`, `90° (Tengah)`, `135°`, `180° (Maks)`.
    - Auto-Sweep Patrol Button (bolak-balik otomatis).
  - **Relay 4-Channel Matrix:**
    - Card 1: Lampu Utama (Light bulb icon, ON/OFF toggle, status pill).
    - Card 2: Kipas Angin (Fan icon with rotating CSS spin when ON).
    - Card 3: Power Socket (Plug icon, ON/OFF toggle).
    - Card 4: Aksesori / Pompa (Zap icon, ON/OFF toggle).
    - Quick Master Action: "Semua ON" / "Semua OFF".
  - **Hardware & ESP32 Code Helper Drawer:**
    - View GPIO mapping & Arduino code snippet directly from UI.

## 4. Chat Intent Commands
- `servo 90`, `putar servo 45 derajat`, `servo tengah`, `servo mentok kanan/kiri`
- `nyalakan lampu`, `hidupkan kipas`, `matikan relay 1`, `matikan semua lampu/relay`
- `buka acc`, `kontrol center`, `acc panel`
