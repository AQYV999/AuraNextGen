#ifndef STT_WHISPER_H
#define STT_WHISPER_H
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "secrets.h"
#include "mic_recorder.h"

void tulisHeaderWAV(uint8_t* header, uint32_t ukuranData) {
  uint32_t ukuranFile = ukuranData + 36;
  uint32_t sampleRate = SAMPLE_RATE;
  uint32_t byteRate = SAMPLE_RATE * 2;

  memcpy(header, "RIFF", 4);
  memcpy(header + 4, &ukuranFile, 4);
  memcpy(header + 8, "WAVEfmt ", 8);
  uint32_t subChunk1Size = 16; memcpy(header + 16, &subChunk1Size, 4);
  uint16_t audioFormat = 1; memcpy(header + 20, &audioFormat, 2);
  uint16_t numChannels = 1; memcpy(header + 22, &numChannels, 2);
  memcpy(header + 24, &sampleRate, 4);
  memcpy(header + 28, &byteRate, 4);
  uint16_t blockAlign = 2; memcpy(header + 32, &blockAlign, 2);
  uint16_t bitsPerSample = 16; memcpy(header + 34, &bitsPerSample, 2);
  memcpy(header + 36, "data", 4);
  memcpy(header + 40, &ukuranData, 4);
}

bool ubahSuaraJadiTeks(String &hasilTeks) {
  static uint8_t bufferAudio[44 + UKURAN_BUFFER];

  tulisHeaderWAV(bufferAudio, UKURAN_BUFFER);
  rekamAudio(bufferAudio + 44);

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;