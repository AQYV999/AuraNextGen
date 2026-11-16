#ifndef TTS_GOOGLE_H
#define TTS_GOOGLE_H
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "secrets.h"

bool ubahTeksJadiSuara(String teks, uint8_t** hasilAudio, size_t &ukuranAudio) {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String url = String("https://texttospeech.googleapis.com/v1/text:synthesize?key=")
             + GOOGLE_TTS_API_KEY;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000);

  String jsonPayload = String("{")
    + "\"input\":{\"text\":\"" + teks + "\"},"
    + "\"voice\":{\"languageCode\":\"id-ID\",\"ssmlGender\":\"FEMALE\"},"
    + "\"audioConfig\":{\"audioEncoding\":\"LINEAR16\",\"sampleRateHertz\":16000}"
    + "}";

  int code = http.POST(jsonPayload);
  if (code <= 0) { http.end(); return false; }

  DynamicJsonDocument doc(200000);
  if (deserializeJson(doc, http.getString())) { http.end(); return false; }

  String audioBase64 = doc["audioContent"].as<String>();
  ukuranAudio = decodeBase64KeAudio(audioBase64, hasilAudio); // fungsi bantu, perlu library Base64 tambahan

  http.end();
  return ukuranAudio > 0;
}
#endif