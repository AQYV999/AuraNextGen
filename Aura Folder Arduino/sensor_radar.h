#ifndef SENSOR_RADAR_H
#define SENSOR_RADAR_H
#include <MyLD2410.h>
#include "config.h"

HardwareSerial radarSerial(2); // UART2 di ESP32
MyLD2410 radar(radarSerial);

void inisialisasiRadar() {
  radarSerial.begin(256000, SERIAL_8N1, RADAR_RX_PIN, RADAR_TX_PIN);

  if (!radar.begin()) {
    Serial.println("Radar HLK-LD2410C gagal terhubung, cek wiring TX/RX");
  } else {
    Serial.println("Radar HLK-LD2410C siap");
  }
}

// Kembalikan true kalau ada manusia terdeteksi (bergerak ATAU diam)
bool bacaKehadiranRadar() {
  radar.check(); // WAJIB dipanggil tiap loop supaya data selalu update
  return radar.presenceDetected();
}

// Fungsi tambahan: bedakan orang bergerak vs diam (fitur yang TIDAK dimiliki PIR)
String detailKehadiranRadar() {
  radar.check();
  if (radar.movingTargetDetected() && radar.stationaryTargetDetected()) {
    return "Orang bergerak dan diam terdeteksi";
  } else if (radar.movingTargetDetected()) {
    return "Orang bergerak terdeteksi, jarak " + String(radar.movingTargetDistance()) + " cm";
  } else if (radar.stationaryTargetDetected()) {
    return "Orang diam terdeteksi, jarak " + String(radar.stationaryTargetDistance()) + " cm";
  } else {
    return "Tidak ada orang";
  }
}
#endif