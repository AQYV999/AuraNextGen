#include <WiFi.h>
#include "esp_system.h"
#include "secrets.h"
#include "config.h"

// --- Status modul tambahan: cuma notifikasi ON/OFF, bukan data penuh ---
// statusRTC: di-set otomatis di dalam inisialisasiRTC() (sensor_rtc.h).
// statusMic & statusOLED: default false karena mic_recorder.h masih
//   di-comment (belum dipasang). OLED sudah aktif dan di-set otomatis
//   di dalam inisialisasiOLED() (oled_display.h).
bool statusMic  = false;
bool statusOLED = false;
bool statusRTC  = false;

#include "sensor_dht.h"
#include "sensor_radar.h"
#include "sensor_rtc.h"
#include "sensor_ldr.h"
#include "oled_display.h"
#include "mic_recorder.h"
//#include "stt_whisper.h"
#include "speaker_audio.h"
#include "tts_elevenlabs.h"
#include "tts_local.h"
#include "mode_standalone.h"
#include "mode_local_ai.h"
#include "mode_cloud_ai.h"
#include "led_blink.h"
#include "serial_chat.h"
#include "acc_control.h"          // <-- AURA NEXT GEN: ACC (AURA Control Center - Servo & Relays)
#include "firebase_client.h"      // <-- PINDAH KE SINI, sebelum web_server
#include "web_server_tablet.h"

// >>> BARU: cache OLED. Cuma refresh layar kalau teks-nya berubah.
// Mengurangi traffic I2C (dulu 20x/detik -> sekarang cuma saat data berubah).
String oledTerakhir = "";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.print("Reset reason: ");
  Serial.println(esp_reset_reason());

  inisialisasiLED();
  inisialisasiDHT();
  inisialisasiRadar();
  inisialisasiRTC();
  inisialisasiLDR();
  inisialisasiOLED();
  inisialisasiMic();
  inisialisasiSpeaker();
  inisialisasiACC();

  WiFi.begin(SECRET_SSID, SECRET_PASS);
  Serial.print("Menghubungkan Wi-Fi");
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi terhubung.");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    // --- Cek DNS bawaan jaringan (dari router/hotspot) dulu ---
    // Kalau gagal resolve (misal hotspot yang gak forward DNS custom),
    // baru fallback ke DNS publik Google. Jadi gak perlu edit manual
    // tiap pindah jaringan (WiFi rumah, hotspot laptop, hotspot HP, dll).
    IPAddress tesResolve;
    bool dnsBawaanOk = WiFi.hostByName("google.com", tesResolve);

    if (dnsBawaanOk) {
      Serial.println("DNS bawaan jaringan berfungsi normal.");
    } else {
      Serial.println("DNS bawaan gagal resolve, fallback ke DNS publik (8.8.8.8).");
      WiFi.setDNS(IPAddress(8, 8, 8, 8), IPAddress(8, 8, 4, 4));
    }

    sinkronRTCdenganNTP(); // sinkron jam RTC ke waktu internet (WIB)

    inisialisasiWebServer();
  } else {
    Serial.println("Wi-Fi GAGAL terhubung dalam 10 detik. Lanjut tanpa Wi-Fi.");
  }

  Serial.println("=== Ketik pertanyaan di Serial Monitor lalu tekan Enter ===");
}

void loop() {
  tanganiRequestTablet();
  updateLED();
  cekChatSerial();
  updateACC();                                // sync & kendalikan servo + relay dari Firebase
  updateFirebase(pesanTerkini, modeTerkini);  // sync status + tanya-jawab ke Firebase

  // >>> BARU: refresh OLED cuma kalau teks berubah (bukan tiap 50ms).
  String oledBaru = buatTampilanOLED();
  if (oledBaru != oledTerakhir) {
    oledTerakhir = oledBaru;
    tampilkanKeOLED(oledBaru);
  }

  delay(50);
}