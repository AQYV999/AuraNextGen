#ifndef MODE_LOCAL_AI_H
#define MODE_LOCAL_AI_H
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "sensor_dht.h"
#include "sensor_radar.h"
#include "sensor_rtc.h"
//192.168.137.20
const char* serverAI = "http://10.116.42.131:11434/api/generate";

// Same personality as cloud, so AURA stays consistent across both modes.
// (Ollama doesn't have systemInstruction, so it's merged into the prompt)
const char* KEPRIBADIAN_AURA_LOKAL =
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

String susunKonteksKamarLokal() {
  float suhu = 0, lembab = 0;
  bool sensorValid = bacaSuhuKelembaban(suhu, lembab);
  bool adaOrang = bacaKehadiranRadar();

  String k = "\n\n[Room context: temperature ";
  k += sensorValid ? String(suhu, 1) + "C" : "unreadable";
  k += ", humidity ";
  k += sensorValid ? String(lembab, 1) + "%" : "unreadable";
  k += ", radar: ";
  k += adaOrang ? "person present" : "empty";
  k += ", time ";
  k += bacaJamSekarang();
  k += "]";
  return k;
}

bool cobaLocalAI(String pertanyaan, String &jawaban) {
  // Escape special characters so the JSON doesn't break
  String pertanyaanAman = pertanyaan;
  pertanyaanAman.replace("\\", "\\\\");
  pertanyaanAman.replace("\"", "\\\"");
  pertanyaanAman.replace("\n", "\\n");

  // Combine: personality + question + sensor context
  String promptLengkap = String(KEPRIBADIAN_AURA_LOKAL) + "\n\n"
                       + "Question: " + pertanyaanAman
                       + susunKonteksKamarLokal();

  HTTPClient http;
  http.begin(serverAI);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000);

  JsonDocument doc;
  doc["model"] = "llama3.1:latest"; //qwen3:8b
  doc["prompt"] = promptLengkap;
  doc["stream"] = false;

  String data;
  serializeJson(doc, data);

  int code = http.POST(data);
  if (code <= 0) { http.end(); return false; }

  JsonDocument respDoc;
  if (deserializeJson(respDoc, http.getString())) { http.end(); return false; }
  jawaban = respDoc["response"].as<String>();
  http.end();
  return jawaban.length() > 0;
}
#endif