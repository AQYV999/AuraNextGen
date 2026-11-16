// web_server_tablet.h
#ifndef WEB_SERVER_TABLET_H
#define WEB_SERVER_TABLET_H

#include <WebServer.h>
#include "sensor_dht.h"
#include "sensor_radar.h"
#include "sensor_ldr.h"
#include "sensor_rtc.h"
#include "mode_local_ai.h"
#include "mode_cloud_ai.h"
#include "mode_standalone.h"
#include "tts_elevenlabs.h"
#include "tts_local.h"     

WebServer server(80);

String pesanTerkini = "Kondisi normal";
String modeTerkini = "standalone";

// Forward declaration: suaraAktif didefinisikan di firebase_client.h,
// tapi file itu di-include setelah header ini di AURA.ino.
// Solusinya: deklarasikan extern di sini, definisi aktualnya tetap di
// firebase_client.h (jangan digandakan -> bakal error multiple definition).
extern bool suaraAktif;

void handleStatus() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  float suhu = 0, lembab = 0;
  bool sensorValid = bacaSuhuKelembaban(suhu, lembab);

  String json = "{";
  json += "\"pesan\":\"" + pesanTerkini + "\",";
  json += "\"mode\":\"" + modeTerkini + "\",";
  json += "\"suhu\":" + (sensorValid ? String(suhu, 1) : "null") + ",";
  json += "\"lembab\":" + (sensorValid ? String(lembab, 1) : "null") + ",";
  json += "\"cahaya\":\"" + kategoriCahaya() + "\",";
  json += "\"radar\":\"" + detailKehadiranRadar() + "\",";
  json += "\"jam\":\"" + bacaJamSekarang() + "\",";
  json += "\"mic\":" + String(statusMic ? "true" : "false") + ",";
  json += "\"oled\":" + String(statusOLED ? "true" : "false") + ",";
  json += "\"rtc\":" + String(statusRTC ? "true" : "false");
  json += "}";

  server.send(200, "application/json", json);
}

// Endpoint baru: terima pertanyaan dari web, jawab pakai mode pilihan user
void handleTanya() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  if (!server.hasArg("pertanyaan") || !server.hasArg("mode")) {
    server.send(400, "application/json", "{\"error\":\"pertanyaan atau mode kosong\"}");
    return;
  }

  String pertanyaan = server.arg("pertanyaan");
  String modeDipilih = server.arg("mode"); // "cloud" atau "local"

  String jawaban = "";
  bool berhasil = false;

  if (modeDipilih == "cloud") {
    berhasil = cobaCloudAI(pertanyaan, jawaban);
  } else if (modeDipilih == "local") {
    berhasil = cobaLocalAI(pertanyaan, jawaban);
  }

  if (!berhasil) {
    jawaban = jalankanStandalone(); // fallback kalau mode pilihan gagal
    modeDipilih = "standalone";
  }

  pesanTerkini = jawaban;
  modeTerkini = modeDipilih;

if (suaraAktif) ucapkan(jawaban);

  String json = "{";
  json += "\"jawaban\":\"" + jawaban + "\",";
  json += "\"mode\":\"" + modeDipilih + "\"";
  json += "}";

  server.send(200, "application/json", json);
}

void inisialisasiWebServer() {
  server.on("/status", handleStatus);
  server.on("/tanya", HTTP_POST, handleTanya);
  server.begin();
  Serial.println("Web server tablet siap di /status dan /tanya");
}

void tanganiRequestTablet() {
  server.handleClient();
}

#endif