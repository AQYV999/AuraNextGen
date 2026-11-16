#ifndef MODE_STANDALONE_H
#define MODE_STANDALONE_H
#include "sensor_dht.h"
#include "sensor_radar.h"
#include "sensor_rtc.h"

// ============================================================
// MODE STANDALONE — NOT AI
// ============================================================
// This is just a bunch of if-else rules that respond based on
// sensor conditions. No language model, no API calls.
// Its only job: be the fallback when Cloud AI & Local AI
// both fail / can't be reached.
//
// Check order = priority order:
//   1. Broken sensor        -> most important, tell it first
//   2. Extreme temperature  -> danger, more important than greeting
//   3. Extreme humidity     -> unhealthy room condition
//   4. Time greeting + person -> light friendliness
//   5. Default condition    -> last
// ============================================================

String jalankanStandalone() {
  float suhu = 0, lembab = 0;
  bool sensorValid = bacaSuhuKelembaban(suhu, lembab);
  bool adaOrang = bacaKehadiranRadar();

  // --- 1. Broken sensor: be honest, don't make things up ---
  if (!sensorValid) {
    return "Temperature/humidity sensor error. Check DHT22 wiring.";
  }

  // --- 2. Extreme temperature ---
  if (suhu >= 32) {
    return "Room temperature is " + String(suhu, 1) + "C, too hot. Open the window or turn on a fan.";
  }
  if (suhu <= 18) {
    return "Room temperature is " + String(suhu, 1) + "C, too cold. Wear a jacket or grab a blanket.";
  }

  // --- 3. Extreme humidity ---
  if (lembab >= 85) {
    return "Humidity at " + String(lembab, 0) + "%, too damp. Open up some ventilation.";
  }
  if (lembab <= 30) {
    return "Humidity at " + String(lembab, 0) + "%, too dry. Drink some water.";
  }

  // --- 4. Time-based greeting + presence ---
  if (adaOrang && apakahJamPagi()) {
    return "Good morning. Room is " + String(suhu, 1) + "C, humidity "
           + String(lembab, 0) + "%. Have a great day.";
  }
  if (adaOrang) {
    return "You're in the room. Temp " + String(suhu, 1) + "C, humidity "
           + String(lembab, 0) + "%, time " + bacaJamSekarang() + ".";
  }

  // --- 5. Default: empty room, safe condition ---
  return "Room is empty. Temp " + String(suhu, 1) + "C, humidity "
         + String(lembab, 0) + "%, time " + bacaJamSekarang() + ".";
}
#endif