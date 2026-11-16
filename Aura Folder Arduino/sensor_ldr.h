// sensor_ldr.h
#ifndef SENSOR_LDR_H
#define SENSOR_LDR_H

#include <BH1750.h>
#include <Wire.h>
#include "config.h"

BH1750 lightMeter(BH1750_ADDR);
bool statusBH1750 = false;

// --- Cache lux: hindari baca I2C tiap loop() ---
// BH1750 CONTINUOUS_HIGH_RES_MODE update internal tiap ~120 ms.
// Kalau loop() nembak bacaLux() tiap ~50 ms (via tampilkanKeOLED), I2C jadi padat
// dan bikin OLED/RTC ikut lambat. Cache 500 ms cukup untuk kategori cahaya.
float _luxCache = -1;
unsigned long _luxWaktu = 0;
const unsigned long INTERVAL_LUX_CACHE_MS = 500;

void inisialisasiLDR() {
  // Wire.begin() udah otomatis kepanggil OLED (u8g2) & RTC,
  // tapi manggil lagi gapapa, aman.
  Wire.begin();

  statusBH1750 = lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);

  if (statusBH1750) {
    Serial.println("BH1750 berhasil diinisialisasi.");
  } else {
    Serial.println("BH1750 gagal diinisialisasi -- cek wiring I2C.");
  }
}

// Baca sensor paling sering tiap 500 ms, sisanya balikin nilai cache.
float bacaLux() {
  if (!statusBH1750) return -1;

  unsigned long sekarang = millis();
  if (_luxWaktu != 0 && sekarang - _luxWaktu < INTERVAL_LUX_CACHE_MS) {
    return _luxCache;
  }

  _luxWaktu = sekarang;
  float lux = lightMeter.readLightLevel();
  _luxCache = (lux < 0) ? -1 : lux;
  return _luxCache;
}

// Kategori simpel, dipakai di mode_standalone.h & web_server_tablet.h
String kategoriCahaya() {
  float lux = bacaLux();
  if (lux < 0) return "N/A";
  if (lux < 10) return "Dark";
  if (lux < 200) return "Dim";
  return "Bright";
}

#endif