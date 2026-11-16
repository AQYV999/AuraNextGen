// firebase_client.h
// Kirim data status ke Firebase Realtime Database, dan layani
// pertanyaan/jawaban lewat Firebase, sebagai pengganti/pelengkap
// web_server_tablet.h (server lokal tetap bisa jalan bersamaan).

#ifndef FIREBASE_CLIENT_H
#define FIREBASE_CLIENT_H

#include <HTTPClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include "tts_elevenlabs.h"
#include "tts_local.h"  
#include "sensor_ldr.h"

#define FIREBASE_DB_URL "https://aura-monitoring-859d9-default-rtdb.asia-southeast1.firebasedatabase.app"

unsigned long waktuKirimTerakhir = 0;
const unsigned long INTERVAL_KIRIM_MS = 3000;

String pertanyaanIdTerakhirDiproses = "";

// --- State suara TTS: dibaca dari Firebase /suara.json ---
bool suaraAktif = true;
unsigned long waktuCekSuaraTerakhir = 0;
const unsigned long INTERVAL_CEK_SUARA_MS = 2000;

void cekStatusSuaraFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  unsigned long sekarang = millis();
  if (sekarang - waktuCekSuaraTerakhir < INTERVAL_CEK_SUARA_MS) return;
  waktuCekSuaraTerakhir = sekarang;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/suara.json";
  http.begin(url);
  int kode = http.GET();
  if (kode != 200) { http.end(); return; }

  String payload = http.getString();
  http.end();
  payload.trim();

  if (payload == "true")       suaraAktif = true;
  else if (payload == "false") suaraAktif = false;
}

// --- Engine TTS: dibaca dari Firebase /ttsLokal.json ---
// true -> Piper (lokal), false -> ElevenLabs (cloud). Variabel ttsPakaiLokal
// ada di tts_local.h dan dibaca oleh ucapkan().
unsigned long waktuCekTtsLokalTerakhir = 0;
const unsigned long INTERVAL_CEK_TTS_LOKAL_MS = 2000;

void cekStatusTtsLokalFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  unsigned long sekarang = millis();
  if (sekarang - waktuCekTtsLokalTerakhir < INTERVAL_CEK_TTS_LOKAL_MS) return;
  waktuCekTtsLokalTerakhir = sekarang;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/ttsLokal.json";
  http.begin(url);
  int kode = http.GET();
  if (kode != 200) { http.end(); return; }

  String payload = http.getString();
  http.end();
  payload.trim();

  // ===== DEBUG PRINT (TAMBAHIN) =====
  Serial.print("[TTS-Lokal cek] payload='");
  Serial.print(payload);
  Serial.print("' -> ttsPakaiLokal=");
  Serial.println(ttsPakaiLokal ? "true (Piper)" : "false (ElevenLabs)");
  // ==================================

  if (payload == "true")       ttsPakaiLokal = true;
  else if (payload == "false") ttsPakaiLokal = false;
}

// ============================================================
// HISTORI SENSOR — 1 sample tiap 5 menit ke /histori.json
// Ringan: POST ~80 byte, timeout 5 detik, tidak blocking lama.
// Butuh: Firebase Rules dengan .indexOn: ["ts"] di /histori.
// ============================================================
unsigned long waktuHistoriTerakhir = 0;
const unsigned long INTERVAL_HISTORI_MS = 5UL * 60UL * 1000UL;   // 5 menit

bool kirimHistoriKeFirebase(float suhu, float lembab) {
  if (WiFi.status() != WL_CONNECTED) return false;

  time_t ts = time(nullptr);
  if (ts < 1700000000) {
    Serial.println("[Histori] ts invalid (NTP belum sync), skip");
    return false;
  }

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/histori.json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  String json = "{";
  json += "\"ts\":"    + String((unsigned long)ts) + ",";
  json += "\"suhu\":"  + String(suhu, 1) + ",";
  json += "\"lembab\":" + String(lembab, 1);
  json += "}";

  int kode = http.POST(json);
  Serial.print("[Histori] HTTP: ");
  Serial.println(kode);
  http.end();

  return (kode == 200);
}

// --- Kirim data status terkini ke Firebase (PUT ke /status.json) ---
bool kirimStatusKeFirebase(const String &pesan, const String &mode,
                            bool sensorValid, float suhu, float lembab,
                            const String &cahaya, const String &radar,
                            const String &jam) {
  if (WiFi.status() != WL_CONNECTED) return false;

  // >>> FIX 400: escape field pesan (jawaban AI sering punya newline + kutip)
  String pesanAman = pesan;
  pesanAman.replace("\\", "\\\\");
  pesanAman.replace("\"", "'");
  pesanAman.replace("\r", " ");
  pesanAman.replace("\n", "\\n");
  pesanAman.replace("\t", " ");

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/status.json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"pesan\":\"" + pesanAman + "\",";
  json += "\"mode\":\"" + mode + "\",";
  json += "\"suhu\":" + (sensorValid ? String(suhu, 1) : "null") + ",";
  json += "\"lembab\":" + (sensorValid ? String(lembab, 1) : "null") + ",";
  json += "\"cahaya\":\"" + cahaya + "\",";
  json += "\"radar\":\"" + radar + "\",";
  json += "\"jam\":\"" + jam + "\",";
  json += "\"mic\":" + String(statusMic ? "true" : "false") + ",";
  json += "\"oled\":" + String(statusOLED ? "true" : "false") + ",";
  json += "\"rtc\":" + String(statusRTC ? "true" : "false") + ",";
  json += "\"suara\":" + String(suaraAktif ? "true" : "false") + ",";
  json += "\"ttsLokal\":" + String(ttsPakaiLokal ? "true" : "false");
  json += "}";

  int kode = http.PUT(json);
  Serial.print("Firebase PUT status: ");
  Serial.println(kode);
  http.end();

  return (kode == 200);
}

// >>> MODIFIKASI: tambah parameter riwayatJson (raw JSON value)
bool ambilPertanyaanDariFirebase(String &id, String &teks, String &mode, String &riwayatJson) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/pertanyaan.json";
  http.begin(url);
  int kode = http.GET();

  if (kode != 200) { http.end(); return false; }

  String payload = http.getString();
  http.end();

  if (payload == "null" || payload.length() < 5) return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.print("[Pertanyaan] JSON parse gagal: ");
    Serial.println(err.c_str());
    return false;
  }

  // Ketiga field wajib ada dan bertipe string (sama seperti syarat lama).
  if (!doc["id"].is<const char*>() ||
      !doc["teks"].is<const char*>() ||
      !doc["mode"].is<const char*>()) return false;

  id   = doc["id"].as<String>();
  teks = doc["teks"].as<String>();   // sudah ter-unescape: \" \n \\ \uXXXX
  mode = doc["mode"].as<String>();

  // riwayat: tetap dikembalikan sebagai raw JSON string (array/object).
  // Nilai null / string / angka / tidak ada -> dibiarkan kosong.
  riwayatJson = "";
  JsonVariantConst riw = doc["riwayat"];
  if (riw.is<JsonArrayConst>() || riw.is<JsonObjectConst>()) {
    serializeJson(riw, riwayatJson);
  }

  return id.length() > 0;
}

bool kirimJawabanKeFirebase(const String &pertanyaanId, const String &teksJawaban, const String &mode) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/jawaban.json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String teksAman = teksJawaban;
  teksAman.replace("\\", "\\\\");
  teksAman.replace("\"", "'");
  teksAman.replace("\r", "");
  teksAman.replace("\n", "\\n");

  String json = "{";
  json += "\"pertanyaanId\":\"" + pertanyaanId + "\",";
  json += "\"teks\":\"" + teksAman + "\",";
  json += "\"mode\":\"" + mode + "\"";
  json += "}";

  int kode = http.PUT(json);
  http.end();

  return (kode == 200);
}

// ============================================================
// WORKER PERTANYAAN (background task)
// ============================================================
// Tujuan: JANGAN block loop() utama saat CloudAI + TTS jalan
// (bisa 20-30 detik total). Loop utama harus tetap:
//   - baca pertanyaan baru dari Firebase (biar gak ketimpa)
//   - kirim status sensor berkala
//   - layani web server tablet
//   - update LED & OLED

String _qId      = "";
String _qTeks    = "";
String _qMode    = "";
String _qRiwayat = "";
volatile bool _qWorkerSibuk = false;

// Hasil ditulis ke global ini, loop() utama yang "comot" dan update
// pesanTerkini/modeTerkini (karena reference gak bisa dilempar ke task).
volatile bool  _qHasilSiap    = false;
String         _qHasilJawaban = "";
String         _qHasilMode    = "";

void taskProsesPertanyaan(void *parameter) {
  String jawaban = "";
  bool berhasil = false;

  if (_qMode == "cloud") {
    berhasil = cobaCloudAI(_qTeks, jawaban, _qRiwayat);
  } else if (_qMode == "local") {
    berhasil = cobaLocalAI(_qTeks, jawaban);
  }

  if (!berhasil) {
    jawaban = jalankanStandalone();
    _qMode = "standalone";
  }

  // 1) Kirim jawaban ke Firebase DULU — biar dashboard cepat dapat
  //    (dashboard gak perlu nunggu TTS selesai ngomong)
  kirimJawabanKeFirebase(_qId, jawaban, _qMode);

  // 2) Baru TTS. Blocking, tapi karena di task, loop() tetap idup.
if (suaraAktif) ucapkan(jawaban);

  // 3) Tandai hasil siap untuk loop() utama
  _qHasilJawaban = jawaban;
  _qHasilMode    = _qMode;
  _qHasilSiap    = true;

  _qWorkerSibuk = false;
  vTaskDelete(NULL);
}

void updateFirebase(String &pesanTerkiniRef, String &modeTerkiniRef) {
  cekStatusSuaraFirebase();
  cekStatusTtsLokalFirebase();

  // --- Comot hasil dari worker kalau udah selesai ---
  if (_qHasilSiap) {
    pesanTerkiniRef = _qHasilJawaban;
    modeTerkiniRef  = _qHasilMode;
    _qHasilSiap     = false;
  }

  unsigned long sekarang = millis();

  // --- Kirim status sensor berkala (tetap jalan walau worker sibuk) ---
  if (sekarang - waktuKirimTerakhir >= INTERVAL_KIRIM_MS) {
    waktuKirimTerakhir = sekarang;

    float suhu = 0, lembab = 0;
    bool sensorValid = bacaSuhuKelembaban(suhu, lembab);

    kirimStatusKeFirebase(pesanTerkiniRef, modeTerkiniRef, sensorValid, suhu, lembab,
                           kategoriCahaya(), detailKehadiranRadar(), bacaJamSekarang());

    // >>> TAMBAHAN: histori sensor (1 sample tiap 5 menit)
    if (sensorValid && (sekarang - waktuHistoriTerakhir >= INTERVAL_HISTORI_MS)) {
      waktuHistoriTerakhir = sekarang;
      kirimHistoriKeFirebase(suhu, lembab);
    }
  }

  // --- Cek pertanyaan baru: HANYA spawn kalau worker lagi gak sibuk ---
  //     Kalau worker sibuk, kita sengaja gak baca /pertanyaan.json,
  //     supaya pertanyaan yang masuk gak "dimakan" sebelum sempat diproses.
  //     Dashboard juga jangan PUT pertanyaan baru selama masih nunggu jawaban.
  if (_qWorkerSibuk) return;

  String id, teks, modePertanyaan, riwayatJson;
  if (ambilPertanyaanDariFirebase(id, teks, modePertanyaan, riwayatJson)) {
    if (id != pertanyaanIdTerakhirDiproses) {
      pertanyaanIdTerakhirDiproses = id;

      _qId      = id;
      _qTeks    = teks;
      _qMode    = modePertanyaan;
      _qRiwayat = riwayatJson;
      _qWorkerSibuk = true;

      xTaskCreatePinnedToCore(
        taskProsesPertanyaan,
        "taskProsesPertanyaan",
        12288,   // stack size — HTTPS/TLS butuh cukup besar
        NULL,
        1,       // priority
        NULL,
        1        // core 1
      );
    }
  }
}

#endif