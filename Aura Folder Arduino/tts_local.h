#ifndef TTS_LOCAL_H
#define TTS_LOCAL_H

#include <HTTPClient.h>
#include <WiFi.h>
#include <driver/i2s.h>
#include "config.h"
#include "tts_elevenlabs.h"   // buat fallback ke cloud

// ============================================================
// TTS LOKAL PAKAI PIPER
// ============================================================
// Server Piper jalan di laptop (python server.py) port 5002.
// ESP32 kirim teks -> laptop balas PCM 22050 Hz -> ESP32 putar ke I2S.
//
// GANTI IP DI BAWAH INI ke IP laptop lo yang sekarang.
// Samakan dengan serverAI di mode_local_ai.h!
// ============================================================
const char* serverTTS = "http://10.116.42.131:5002/tts";

const uint32_t PIPER_SAMPLE_RATE = 22050;   // output Piper
const uint32_t EL_VOICE_RATE     = 16000;   // output ElevenLabs

// >>> GAIN buat Piper: biar volume-nya seimbang sama ElevenLabs.
// Piper gak punya gain sama sekali -- tanpa ini, suara lokal kedengeran
// lebih pelan dari cloud. Range aman 2.5 - 5.0; di atas 5.0 mulai klip.
const float GAIN_TTS_LOKAL = 2.0;

// Switch global: true = Piper lokal, false = ElevenLabs cloud
bool ttsPakaiLokal = true;

// Kalau Piper gagal (server mati/firewall/HTTP error), otomatis
// jatuh ke ElevenLabs. Set false kalau mau ketat (nggak fallback).
bool ttsFallbackKeCloud = true;

unsigned long durasiTTSLokal = 0;

// ============================================================
// Fungsi utama: kirim teks ke Piper, stream audio ke I2S
// ============================================================
bool ucapkanLokal(const String &teks) {
  unsigned long mulai = millis();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[TTS-Lokal] WiFi gak connect");
    return false;
  }

  // Matiin WiFi modem-sleep -- sama kayak ElevenLabs, biar data dari
  // laptop gak datang nyicil dengan jeda (penyebab audio patah-patah).
  WiFi.setSleep(false);

  // ---- Bersihin teks: buang karakter non-ASCII, emoji, markdown ----
  String teksAman = "";
  for (int i = 0; i < (int)teks.length(); i++) {
    char c = teks[i];
    if (c >= 32 && c < 127) teksAman += c;
    else if (c == '\n' || c == '\t' || c == '\r') teksAman += ' ';
    // karakter non-ASCII (emoji, aksen) dibuang
  }
  teksAman.replace("*", "");
  teksAman.replace("#", "");
  teksAman.replace("`", "");
  teksAman.replace("_", " ");
  while (teksAman.indexOf("  ") >= 0) teksAman.replace("  ", " ");
  teksAman.trim();

  if (teksAman.length() == 0) {
    Serial.println("[TTS-Lokal] Teks kosong setelah dibersihin");
    return false;
  }

  // ---- Set I2S clock ke 22050 Hz (sample rate Piper) ----
  // Ini WAJIB, karena I2S default di speaker_audio.h = 16000 Hz.
  // Kalau gak di-set, audio Piper bakal kedengeran lambat + berat.
  i2s_set_clk(I2S_NUM_1, PIPER_SAMPLE_RATE,
              I2S_BITS_PER_SAMPLE_16BIT, I2S_CHANNEL_MONO);

  Serial.print("[TTS-Lokal] Kirim: ");
  Serial.println(teksAman);

  HTTPClient http;
  http.begin(serverTTS);
  http.addHeader("Content-Type", "text/plain; charset=utf-8");
  http.setConnectTimeout(3000);    // connect ke laptop harus cepat
  http.setTimeout(30000);          // total stream boleh lama (kalimat panjang)

  int kode = http.POST(teksAman);
  if (kode != 200) {
    Serial.print("[TTS-Lokal] HTTP error: ");
    Serial.println(kode);
    http.end();
    durasiTTSLokal = millis() - mulai;
    return false;
  }

  // ---- Streaming audio dari server ke I2S ----
  WiFiClient *stream = http.getStreamPtr();
  const size_t CHUNK = 1024;

  // Buffer +2 byte: ruang buat 1 byte sisa dari chunk sebelumnya (PCM 16-bit = 2 byte/sample)
  alignas(4) uint8_t buffer[CHUNK + 2];
  size_t sisa = 0;
  size_t totalDiputar = 0;
  size_t ditulis;

  unsigned long batas = millis() + 30000;   // timeout total
  while (http.connected() && millis() < batas) {
    size_t ada = stream->available();
    if (ada) {
      size_t baca = stream->readBytes(buffer + sisa, min(ada, CHUNK));
      size_t tot = sisa + baca;

      // Cuma proses pasangan byte utuh (PCM 16-bit)
      size_t genap = tot & ~((size_t)1);
      if (genap > 0) {
        // >>> GAIN: amplifikasi sample sebelum kirim ke I2S.
        // Sama pola-nya kayak yang di ucapkanElevenLabs().
        int16_t* sample = (int16_t*) buffer;
        size_t jumlahSample = genap / 2;
        for (size_t i = 0; i < jumlahSample; i++) {
          int32_t nilai = (int32_t)(sample[i] * GAIN_TTS_LOKAL);
          if (nilai > 32767) nilai = 32767;
          if (nilai < -32768) nilai = -32768;
          sample[i] = (int16_t) nilai;
        }
        // <<< END GAIN

        i2s_write(I2S_NUM_1, buffer, genap, &ditulis, portMAX_DELAY);
        totalDiputar += genap;
      }

      // Simpan 1 byte ganjil untuk chunk berikutnya
      if (tot > genap) {
        buffer[0] = buffer[genap];
        sisa = 1;
      } else {
        sisa = 0;
      }
      batas = millis() + 30000;   // reset timeout selama data ngalir
    } else if (!http.connected()) {
      break;
    } else {
      delay(2);
    }
  }

  http.end();
  durasiTTSLokal = millis() - mulai;

  Serial.print("[TTS-Lokal] Selesai. ");
  Serial.print(totalDiputar);
  Serial.print(" byte diputar dalam ");
  Serial.print(durasiTTSLokal);
  Serial.println(" ms");

  return totalDiputar > 0;
}

// ============================================================
// Wrapper: pilih Piper atau ElevenLabs
// ============================================================
// - ttsPakaiLokal = true  -> coba Piper dulu; kalau gagal & fallback
//                            aktif, lanjut ke ElevenLabs
// - ttsPakaiLokal = false -> langsung ElevenLabs
//
// ucapkanElevenLabs() sudah set i2s_set_clk(16000) di awal fungsinya,
// jadi sample rate otomatis balik kalau Piper tadi set 22050.
void ucapkan(const String &teks) {
  // GUARD: skip kalau masih ada audio muter (cegah serial_chat & firebase
  // manggil barengan -> suara tumpuk).
  if (sedangPutarAudio) {
    Serial.println("[TTS] skip — masih muter audio");
    return;
  }

  PenjagaPutarAudio penjaga;   // RAII: auto-reset flag pas keluar

  if (!ttsPakaiLokal) {
    ucapkanElevenLabs(teks);
    return;
  }

  bool ok = ucapkanLokal(teks);
  if (!ok && ttsFallbackKeCloud) {
    Serial.println("[TTS] Piper gagal, fallback ke ElevenLabs...");
    ucapkanElevenLabs(teks);
  }
}

#endif