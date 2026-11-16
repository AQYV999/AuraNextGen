#ifndef MODE_CLOUD_AI_H
#define MODE_CLOUD_AI_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "secrets.h"
#include "sensor_dht.h"
#include "sensor_radar.h"
#include "sensor_rtc.h"

// Duration of the last Gemini request (ms). Filled by cobaCloudAI() wrapper below.
static unsigned long durasiCloudAI = 0;

// --- AURA personality: personal room assistant ---
// This is what makes Gemini not answer generically, but feel like AURA.
static const char* KEPRIBADIAN_AURA =
  "You are AURA, a personal room assistant who is friendly, relaxed, natural, and a bit warm. "
  "Address the user as 'you' and talk like an attentive roommate, "
  "not like a robot or customer service. "

  "Your job is to help the user in everyday conversation, answer questions, "
  "provide information, help with room-related stuff, and be a light chat companion. "

  "IMPORTANT: Do not mention the room condition, temperature, humidity, presence of people, "
  "or time automatically in every reply. "
  "The room sensor context should only be used or mentioned if the user's question "
  "is actually related to the room condition, room, comfort, temperature, humidity, "
  "presence of people, time, or the user clearly asks for information about the room condition. "

  "Example: if the user asks 'what is coriander', just answer about coriander. "
  "Don't talk about room temperature, humidity, radar, or room condition. "
  "If the user asks 'how's the room?', 'how's my room?', "
  "'is it hot?', 'is it stuffy?', 'is anyone there?', or 'what's the room condition right now?', "
  "then use the room sensor context to answer. "

  "Don't look for excuses to sneak sensor info into your reply. "
  "If the sensor info isn't relevant to the question, ignore it entirely. "

  "Answer briefly, naturally, and to the point, around 120 words max. "
  "If the question is silly or casual, reply in a friendly tone and feel free to joke a bit. "
  "If the question is serious, reply calmly and clearly. "
  "Don't use filler openings or closings like 'Sure, I will...' or 'Hope this helps'. "
  "Go straight to the point. If you don't know, say so honestly and casually.";

// --- Build room context from sensors, so AURA is "aware" of its surroundings ---
// Called on every request. Safe if the sensor errors (marked as "?").
inline String susunKonteksKamar() {
  float suhu = 0, lembab = 0;
  bool sensorValid = bacaSuhuKelembaban(suhu, lembab);
  bool adaOrang = bacaKehadiranRadar();

  String konteks = "\n\n[Current room context: ";
  konteks += "temperature ";
  konteks += sensorValid ? String(suhu, 1) + "C" : "unreadable";
  konteks += ", humidity ";
  konteks += sensorValid ? String(lembab, 1) + "%" : "unreadable";
  konteks += ", radar: ";
  konteks += adaOrang ? "person present" : "empty";
  konteks += ", time ";
  konteks += bacaJamSekarang();
  konteks += "]";

  return konteks;
}

inline bool cobaCloudAIInternal(String pertanyaan, String &jawaban, String riwayatJson) {
  uint32_t freeHeap = ESP.getFreeHeap();
  Serial.print("[CloudAI] Free Heap sebelum request: ");
  Serial.println(freeHeap);

  if (freeHeap < 45000) {
    Serial.println("[CloudAI] STOP: heap < 45000, batalkan request.");
    return false;
  }

  IPAddress resolvedIP;
  bool dnsOk = WiFi.hostByName("generativelanguage.googleapis.com", resolvedIP);
  Serial.print("[CloudAI] DNS resolve: ");
  Serial.println(dnsOk ? resolvedIP.toString() : "FAILED");

  if (!dnsOk) {
    Serial.println("[CloudAI] STOP: DNS gagal resolve.");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(20000);

  HTTPClient http;
  http.setConnectTimeout(15000);
  http.setTimeout(20000);

  // Model: gemini-3.5-flash-lite (thinking OFF by default, no thinkingConfig allowed)
  String url = String("https://generativelanguage.googleapis.com")
             + "/v1beta/models/gemini-3.5-flash-lite:generateContent?key="
             + String(GEMINI_API_KEY);

  bool beginOk = http.begin(client, url);
  if (!beginOk) {
    Serial.println("[CloudAI] http.begin() gagal");
    return false;
  }
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;

  // >>> MULTI-TURN: build contents array from history + new question.
  JsonArray contents = doc["contents"].to<JsonArray>();

  if (riwayatJson.length() > 0) {
    JsonDocument riwayatDoc;
    if (!deserializeJson(riwayatDoc, riwayatJson)) {
      for (JsonObject item : riwayatDoc.as<JsonArray>()) {
        String tanya = item["tanya"].as<String>();
        String jawab = item["jawab"].as<String>();
        if (tanya.length() == 0 || jawab.length() == 0) continue;

        JsonObject uTurn = contents.add<JsonObject>();
        uTurn["role"] = "user";
        uTurn["parts"].to<JsonArray>().add<JsonObject>()["text"] = tanya;

        JsonObject mTurn = contents.add<JsonObject>();
        mTurn["role"] = "model";
        mTurn["parts"].to<JsonArray>().add<JsonObject>()["text"] = jawab;
      }
    }
  }

  // Latest message (user) + room sensor context
  JsonObject uNow = contents.add<JsonObject>();
  uNow["role"] = "user";
  uNow["parts"].to<JsonArray>().add<JsonObject>()["text"] =
      pertanyaan + susunKonteksKamar();

  // System instruction: AURA personality
  JsonObject sysObj = doc["systemInstruction"].to<JsonObject>();
  JsonArray sysParts = sysObj["parts"].to<JsonArray>();
  JsonObject sysPart = sysParts.add<JsonObject>();
  sysPart["text"] = KEPRIBADIAN_AURA;

  // >>> generationConfig:
  //  - maxOutputTokens cukup besar (2000).
  //  - thinkingConfig DIHAPUS TOTAL karena gemini-3.5-flash-lite
  //    tidak mendukungnya dan menyebabkan HTTP 400 INVALID_ARGUMENT.
  JsonObject genCfg = doc["generationConfig"].to<JsonObject>();
  genCfg["maxOutputTokens"] = 2000;

  String data;
  serializeJson(doc, data);

  Serial.print("[CloudAI] POST panjang body: ");
  Serial.print(data.length());
  Serial.println(" byte");

  int code = http.POST(data);

  if (code <= 0) {
    Serial.print("[CloudAI] HTTP error: ");
    Serial.println(HTTPClient::errorToString(code));
    http.end();
    client.stop();
    return false;
  }

  String responseBody = http.getString();

  if (code != 200) {
    Serial.print("[CloudAI] HTTP ");
    Serial.print(code);
    Serial.print(" body: ");
    Serial.println(responseBody);
    http.end();
    client.stop();
    return false;
  }

  Serial.print("[CloudAI] HTTP 200. Body awal: ");
  Serial.println(responseBody.substring(0, 400));

  JsonDocument responseDoc;
  DeserializationError err = deserializeJson(responseDoc, responseBody);
  if (err) {
    Serial.print("[CloudAI] JSON parse gagal: ");
    Serial.println(err.c_str());
    http.end();
    client.stop();
    return false;
  }

  Serial.print("[CloudAI] promptFeedback: ");
  serializeJson(responseDoc["promptFeedback"], Serial);
  Serial.println();

  if (responseDoc["candidates"].size() == 0) {
    Serial.println("[CloudAI] candidates KOSONG -> kemungkinan SAFETY block.");
    http.end();
    client.stop();
    return false;
  }

  Serial.print("[CloudAI] finishReason: ");
  Serial.println(responseDoc["candidates"][0]["finishReason"].as<String>());

  if (responseDoc["candidates"][0]["content"]["parts"].size() == 0) {
    Serial.println("[CloudAI] parts KOSONG -> kemungkinan MAX_TOKENS / empty output.");
    http.end();
    client.stop();
    return false;
  }

  jawaban = responseDoc["candidates"][0]["content"]["parts"][0]["text"].as<String>();

  Serial.print("[CloudAI] jawaban: ");
  Serial.println(jawaban);

  http.end();
  client.stop();
  return jawaban.length() > 0;
}

// Wrapper: measure total time from call to completion.
inline bool cobaCloudAI(String pertanyaan, String &jawaban, String riwayatJson = "") {
  unsigned long mulai = millis();
  bool hasil = cobaCloudAIInternal(pertanyaan, jawaban, riwayatJson);
  durasiCloudAI = millis() - mulai;
  Serial.print("[CloudAI] Selesai dalam ");
  Serial.print(durasiCloudAI);
  Serial.print(" ms, hasil: ");
  Serial.println(hasil ? "OK" : "GAGAL");
  return hasil;
}

#endif