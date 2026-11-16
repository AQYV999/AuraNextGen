// acc_control.h
// AURA Control Center (ACC) - Firmware Controller untuk ESP32
// Mengendalikan Servo Motor (0° - 180°) dan 4-Channel Relay / GPIO Switches
// melalui sinkronisasi Firebase Realtime Database (/acc.json).

#ifndef ACC_CONTROL_H
#define ACC_CONTROL_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

// ============================================================
// KONFIGURASI PIN HARDWARE (Bisa disesuaikan dengan wiring Anda)
// ============================================================
#ifndef PIN_SERVO_ACC
#define PIN_SERVO_ACC  18   // Pin PWM Servo (misal: SG90 / MG995 / MG996R)
#endif

#ifndef PIN_RELAY_1
#define PIN_RELAY_1    25   // Relay 1: Lampu Utama
#endif

#ifndef PIN_RELAY_2
#define PIN_RELAY_2    27   // Relay 2: Kipas / Pendingin
#endif

#ifndef PIN_RELAY_3
#define PIN_RELAY_3    5    // Relay 3: Power Socket / Stop Kontak
#endif

#ifndef PIN_RELAY_4
#define PIN_RELAY_4    15   // Relay 4: Aksesori / Pompa
#endif

// Kebanyakan modul relay Arduino/ESP32 adalah ACTIVE-LOW (LOW = ON, HIGH = OFF).
// Jika relay Anda ACTIVE-HIGH (HIGH = ON), ubah jadi false.
#define RELAY_ACTIVE_LOW true

// PWM Servo Configuration (ESP32 LEDC PWM bawaan tanpa library eksternal)
#define SERVO_LEDC_CHANNEL 4
#define SERVO_LEDC_FREQ    50
#define SERVO_LEDC_RES     16    // 16-bit resolution (0 - 65535)

// Pulsa standar servo (50Hz = 20ms periode):
// 0.5ms (0 deg) -> (0.5/20) * 65535 ≈ 1638
// 2.5ms (180 deg) -> (2.5/20) * 65535 ≈ 8192
#define SERVO_MIN_DUTY 1638
#define SERVO_MAX_DUTY 8192

// ============================================================
// STATE INTERNAL ACC
// ============================================================
int targetSudutServo = 90;
int sudutServoSaatIni = 90;
bool modeSweepAktif = false;
int arahSweep = 1; // 1 = naik, -1 = turun
unsigned long waktuSweepTerakhir = 0;

bool statusRelay1 = false;
bool statusRelay2 = false;
bool statusRelay3 = false;
bool statusRelay4 = false;

unsigned long waktuCekAccTerakhir = 0;
const unsigned long INTERVAL_CEK_ACC_MS = 600; // Cek Firebase tiap 600ms

// Forward reference untuk Firebase DB URL
#ifndef FIREBASE_DB_URL
#define FIREBASE_DB_URL "https://aura-monitoring-859d9-default-rtdb.asia-southeast1.firebasedatabase.app"
#endif

// ============================================================
// HELPER: Gerakkan Servo Fisik
// ============================================================
inline void tulisSudutServo(int derajat) {
  derajat = constrain(derajat, 0, 180);
  sudutServoSaatIni = derajat;

  // Konversi derajat (0-180) ke duty cycle 16-bit
  uint32_t duty = map(derajat, 0, 180, SERVO_MIN_DUTY, SERVO_MAX_DUTY);
#if ESP_IDF_VERSION_MAJOR >= 5
  ledcWrite(PIN_SERVO_ACC, duty);
#else
  ledcWrite(SERVO_LEDC_CHANNEL, duty);
#endif
}

// ============================================================
// HELPER: Tulis State Relay Fisik
// ============================================================
inline void aturRelayPin(int pin, bool nyala) {
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(pin, nyala ? LOW : HIGH);
  } else {
    digitalWrite(pin, nyala ? HIGH : LOW);
  }
}

// ============================================================
// INISIALISASI HARDWARE ACC
// ============================================================
void inisialisasiACC() {
  // 1. Setup Pin Relay sebagai OUTPUT
  pinMode(PIN_RELAY_1, OUTPUT);
  pinMode(PIN_RELAY_2, OUTPUT);
  pinMode(PIN_RELAY_3, OUTPUT);
  pinMode(PIN_RELAY_4, OUTPUT);

  // Matikan semua relay di awal
  aturRelayPin(PIN_RELAY_1, false);
  aturRelayPin(PIN_RELAY_2, false);
  aturRelayPin(PIN_RELAY_3, false);
  aturRelayPin(PIN_RELAY_4, false);

  // 2. Setup Servo PWM menggunakan ESP32 LEDC
#if ESP_IDF_VERSION_MAJOR >= 5
  ledcAttach(PIN_SERVO_ACC, SERVO_LEDC_FREQ, SERVO_LEDC_RES);
#else
  ledcSetup(SERVO_LEDC_CHANNEL, SERVO_LEDC_FREQ, SERVO_LEDC_RES);
  ledcAttachPin(PIN_SERVO_ACC, SERVO_LEDC_CHANNEL);
#endif

  // Posisikan servo di tengah (90 derajat)
  tulisSudutServo(90);

  Serial.println("[ACC] Hardware AURA Control Center siap (Servo & 4 Relay diinisialisasi).");
}

// ============================================================
// SINKRONISASI DARI FIREBASE /acc.json
// ============================================================
void cekStatusAccFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  unsigned long sekarang = millis();
  if (sekarang - waktuCekAccTerakhir < INTERVAL_CEK_ACC_MS) return;
  waktuCekAccTerakhir = sekarang;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/acc.json";
  http.begin(url);
  http.setTimeout(1500);

  int kode = http.GET();
  if (kode != 200) {
    http.end();
    return;
  }

  String payload = http.getString();
  http.end();

  if (payload.length() < 5 || payload == "null") return;

  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) return;

  // 1. Baca State Servo
  if (doc.containsKey("servo")) {
    JsonObject servo = doc["servo"];
    if (servo.containsKey("angle")) {
      int sudutBaru = servo["angle"].as<int>();
      if (sudutBaru != targetSudutServo && !modeSweepAktif) {
        targetSudutServo = sudutBaru;
        tulisSudutServo(targetSudutServo);
        Serial.printf("[ACC] Servo diputar ke: %d derajat\n", targetSudutServo);
      }
    }
    if (servo.containsKey("sweep")) {
      modeSweepAktif = servo["sweep"].as<bool>();
    }
  }

  // 2. Baca State Relays
  if (doc.containsKey("relays")) {
    JsonObject relays = doc["relays"];
    if (relays.containsKey("r1")) {
      bool r1 = relays["r1"].as<bool>();
      if (r1 != statusRelay1) {
        statusRelay1 = r1;
        aturRelayPin(PIN_RELAY_1, statusRelay1);
        Serial.printf("[ACC] Relay 1 (Lampu): %s\n", statusRelay1 ? "ON" : "OFF");
      }
    }
    if (relays.containsKey("r2")) {
      bool r2 = relays["r2"].as<bool>();
      if (r2 != statusRelay2) {
        statusRelay2 = r2;
        aturRelayPin(PIN_RELAY_2, statusRelay2);
        Serial.printf("[ACC] Relay 2 (Kipas): %s\n", statusRelay2 ? "ON" : "OFF");
      }
    }
    if (relays.containsKey("r3")) {
      bool r3 = relays["r3"].as<bool>();
      if (r3 != statusRelay3) {
        statusRelay3 = r3;
        aturRelayPin(PIN_RELAY_3, statusRelay3);
        Serial.printf("[ACC] Relay 3 (Socket): %s\n", statusRelay3 ? "ON" : "OFF");
      }
    }
    if (relays.containsKey("r4")) {
      bool r4 = relays["r4"].as<bool>();
      if (r4 != statusRelay4) {
        statusRelay4 = r4;
        aturRelayPin(PIN_RELAY_4, statusRelay4);
        Serial.printf("[ACC] Relay 4 (Aksesori): %s\n", statusRelay4 ? "ON" : "OFF");
      }
    }
  }
}

// ============================================================
// LOOP UPDATE ACC (Panggil di loop() Arduino)
// ============================================================
void updateACC() {
  // 1. Cek perintah dari web/Firebase
  cekStatusAccFirebase();

  // 2. Tangani Sweep otomatis jika diaktifkan
  if (modeSweepAktif) {
    unsigned long sekarang = millis();
    if (sekarang - waktuSweepTerakhir > 30) { // update tiap 30ms untuk gerakan mulus
      waktuSweepTerakhir = sekarang;
      sudutServoSaatIni += arahSweep * 2;
      if (sudutServoSaatIni >= 180) {
        sudutServoSaatIni = 180;
        arahSweep = -1;
      } else if (sudutServoSaatIni <= 0) {
        sudutServoSaatIni = 0;
        arahSweep = 1;
      }
      tulisSudutServo(sudutServoSaatIni);
    }
  }
}

#endif // ACC_CONTROL_H
