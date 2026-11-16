#ifndef LED_BLINK_H
#define LED_BLINK_H

#include "config.h"

// ======================================================
// MODE LED
// ======================================================

enum ModeLED {
  LED_STANDBY,
  LED_BEKERJA,
  LED_ERROR
};

ModeLED modeLED = LED_STANDBY;


// ======================================================
// VARIABEL LED
// ======================================================

unsigned long waktuLED = 0;
bool statusLED = false;

// Untuk mode bekerja
// stepBlink: 0..7 = fase blink cepat (ON/OFF berselang-seling, 4x ON + 4x OFF)
//            8    = fase jeda 200 ms sebelum mengulang dari awal
const int BEKERJA_TOTAL_BLINK = 4;      // jumlah kedip ON-OFF per siklus
const int BEKERJA_TOTAL_STEP  = BEKERJA_TOTAL_BLINK * 2; // 8 step (ON,OFF x4)
int stepBlink = 0;

// Untuk mode error
int jumlahBlinkError = 0;
bool prosesError = false;

// ======================================================
// KONFIGURASI PWM (LEDC) - ESP32 Arduino core 3.x
//
// PENTING: LED_PIN JANGAN pernah dipakai digitalWrite()/
// analogWrite() lagi di tempat lain. Semua kontrol ON/OFF/
// PWM pada LED_PIN wajib lewat ledcWrite(LED_PIN, ...) di
// file ini, supaya channel LEDC-nya tidak "nyangkut".
// ======================================================

const int LED_PWM_FREQ = 5000;   // Hz
const int LED_PWM_RES  = 8;      // bit (0-255)


// ======================================================
// INISIALISASI
// ======================================================

void inisialisasiLED() {

  // ledcAttach (core 3.x) otomatis pasang pin ini ke channel LEDC
  // internal dan langsung siap dipakai ledcWrite(). Jangan panggil
  // pinMode(LED_PIN, OUTPUT) di sini -- itu justru bisa bikin
  // driver LEDC-nya konflik dengan mode GPIO biasa.
  ledcAttach(LED_PIN, LED_PWM_FREQ, LED_PWM_RES);
  ledcWrite(LED_PIN, 0);   // pastikan mati di awal

  waktuLED = millis();
}


// ======================================================
// GANTI MODE LED
// ======================================================

void setModeLED(ModeLED mode) {

  modeLED = mode;

  // Reset semua proses
  waktuLED = millis();
  statusLED = false;
  stepBlink = 0;

  jumlahBlinkError = 0;
  prosesError = false;

  // digitalWrite tidak lagi dipakai -- semua lewat ledcWrite
  ledcWrite(LED_PIN, 0);

  // Kalau standby, mulai dari redup
  if (mode == LED_STANDBY) {
    statusLED = false;
  }

  // Kalau error, mulai proses blink
  if (mode == LED_ERROR) {
    prosesError = true;
  }
}


// ======================================================
// MODE 1
// STANDBY
// Terang -> redup -> terang
// ======================================================

void LED_Standby() {

  static int brightness = 0;
  static int arah = 1;

  unsigned long sekarang = millis();

  // Perubahan brightness setiap 10 ms
  if (sekarang - waktuLED >= 10) {

    waktuLED = sekarang;

    brightness += arah;

    // Batas terang
    if (brightness >= 255) {
      brightness = 255;
      arah = -1;
    }

    // Batas redup
    if (brightness <= 20) {
      brightness = 20;
      arah = 1;
    }

    ledcWrite(LED_PIN, brightness);
  }
}


// ======================================================
// MODE 2
// SEDANG BEKERJA / MIKIR
//
// ON 70 ms
// OFF 70 ms
// ON 70 ms
// OFF 70 ms
// ON 70 ms
// OFF 70 ms
// ON 70 ms
// OFF 70 ms
// JEDA 200 ms
// ULANGI
// ======================================================

void LED_Bekerja() {

  unsigned long sekarang = millis();

  // ====================================================
  // FASE BLINK CEPAT (step 0..BEKERJA_TOTAL_STEP-1)
  // step genap = ON 70ms, step ganjil = OFF 70ms
  // ====================================================

  if (stepBlink < BEKERJA_TOTAL_STEP) {

    if (sekarang - waktuLED >= 70) {

      waktuLED = sekarang;

      statusLED = (stepBlink % 2 == 0);  // genap -> ON, ganjil -> OFF
      ledcWrite(LED_PIN, statusLED ? 255 : 0);

      stepBlink++;

      // Selesai 4x (ON+OFF) -> masuk fase jeda
      if (stepBlink >= BEKERJA_TOTAL_STEP) {
        ledcWrite(LED_PIN, 0);
        statusLED = false;
        waktuLED = sekarang;
      }
    }
  }

  // ====================================================
  // FASE JEDA 200 ms, lalu ulangi dari awal
  // ====================================================

  else {

    if (sekarang - waktuLED >= 200) {

      waktuLED = sekarang;
      stepBlink = 0;   // ulangi siklus blink
      statusLED = false;
      ledcWrite(LED_PIN, 0);
    }
  }
}


// ======================================================
// MODE 3
// ERROR
//
// ON 150 ms
// OFF 150 ms
// ON 150 ms
// OFF
//
// Kemudian berhenti.
// ======================================================

void LED_Error() {

  if (!prosesError) return;

  unsigned long sekarang = millis();

  if (sekarang - waktuLED >= 150) {

    waktuLED = sekarang;

    statusLED = !statusLED;

    ledcWrite(LED_PIN, statusLED ? 255 : 0);

    // Setiap OFF dihitung sebagai 1 blink
    if (!statusLED) {

      jumlahBlinkError++;

      if (jumlahBlinkError >= 2) {

        prosesError = false;

        ledcWrite(LED_PIN, 0);
      }
    }
  }
}


// ======================================================
// UPDATE LED
// PANGGIL DI loop()
// ======================================================

void updateLED() {

  switch (modeLED) {

    case LED_STANDBY:
      LED_Standby();
      break;

    case LED_BEKERJA:
      LED_Bekerja();
      break;

    case LED_ERROR:
      LED_Error();
      break;
  }
}

#endif