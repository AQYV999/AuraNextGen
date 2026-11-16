#ifndef SENSOR_RTC_H
#define SENSOR_RTC_H
#include <RTClib.h>
#include <WiFi.h>
#include "time.h"

RTC_DS3231 rtc;

// Zona waktu WIB (GMT+7), sesuai lokasi Batang, Jawa Tengah.
// Kalau nanti proyeknya dipindah luar WIB, tinggal ganti angka ini.
const long GMT_OFFSET_SEC = 7 * 3600;
const int DAYLIGHT_OFFSET_SEC = 0; // Indonesia gak pakai daylight saving

String bacaJamSekarang(); // forward declaration, definisi lengkap di bawah

void inisialisasiRTC() {
  if (!rtc.begin()) {
    Serial.println("RTC DS3231 tidak terdeteksi, cek wiring I2C");
    statusRTC = false;
    return;
  }

  statusRTC = true;

  if (rtc.lostPower()) {
    Serial.println("RTC kehilangan daya, mengatur waktu ke waktu kompilasi kode (sementara)");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // Nanti bakal langsung ditimpa waktu akurat oleh sinkronRTCdenganNTP()
    // begitu WiFi berhasil connect di setup().
  }
}

// Panggil ini SEKALI di setup(), SETELAH WiFi berhasil connect.
// Ambil waktu akurat dari server NTP, lalu tulis ke RTC.
// Kalau WiFi gak connect / NTP gagal diambil, RTC tetap jalan
// pakai waktu sebelumnya (baterai backup) -- gak ada kerugian, cuma gak sinkron.
//
// >>> FIX: Retry 3x. Kadang attempt pertama gagal karena DNS belum
//     siap atau NTP server lagi lambat merespons.
bool sinkronRTCdenganNTP() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[RTC-NTP] WiFi belum connect, lewati sinkronisasi.");
    return false;
  }

  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org", "time.nist.gov");

  struct tm waktuInfo;
  for (int coba = 1; coba <= 3; coba++) {
    Serial.print("[RTC-NTP] Coba ke-");
    Serial.println(coba);

    if (getLocalTime(&waktuInfo, 5000)) {
      rtc.adjust(DateTime(
        waktuInfo.tm_year + 1900,
        waktuInfo.tm_mon + 1,
        waktuInfo.tm_mday,
        waktuInfo.tm_hour,
        waktuInfo.tm_min,
        waktuInfo.tm_sec
      ));

      Serial.print("[RTC-NTP] Berhasil sinkron. Waktu sekarang: ");
      Serial.println(bacaJamSekarang());
      return true;
    }
  }

  Serial.println("[RTC-NTP] Gagal 3x. RTC jalan pakai waktu lama (baterai backup).");
  return false;
}

String bacaJamSekarang() {
  DateTime sekarang = rtc.now();
  char buffer[6];
  sprintf(buffer, "%02d:%02d", sekarang.hour(), sekarang.minute());
  return String(buffer);
}

bool apakahJamPagi() {
  DateTime sekarang = rtc.now();
  return (sekarang.hour() >= 5 && sekarang.hour() < 10);
}
#endif