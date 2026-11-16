#ifndef TTS_ELEVENLABS_H
#define TTS_ELEVENLABS_H
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <driver/i2s.h>
#include "config.h"
#include "secrets.h"

// Voice ID default (Rachel, suara premade bawaan ElevenLabs).
// Ganti sesuai voice pilihan lo di elevenlabs.io/app/voice-library
// (klik voice yang disuka -> copy Voice ID).
#define ELEVENLABS_VOICE_ID "CwhRBWXzGAHq8TQ4Fs17"

// Model paling cepat & murah -- cocok buat asisten real-time
#define ELEVENLABS_MODEL "eleven_flash_v2_5"

unsigned long durasiTTS = 0;

// Gain digital tambahan, sama kayak yang dites manual sebelumnya --
// dikombinasiin sama gain pin hardware (GAIN ke GND = 12dB) biar
// hasil akhirnya kenceng tapi gak sampe pecah. Sesuaikan lagi kalau
// speaker/ampli lo beda karakter dari yang dites.
const float GAIN_DIGITAL_TTS = 3.0;

// >>> BARU: flag "lagi streaming suara".
// Dibaca firebase_client.h -- selama true, loop() berhenti nembak HTTPS ke
// Firebase supaya koneksi audio gak rebutan bandwidth/CPU.
// Pakai RAII supaya flag PASTI balik ke false di semua jalur keluar fungsi
// (gagal, error, atau sukses), jadi gak mungkin nyangkut.
volatile bool sedangPutarAudio = false;
struct PenjagaPutarAudio {
  PenjagaPutarAudio()  { sedangPutarAudio = true; }
  ~PenjagaPutarAudio() { sedangPutarAudio = false; }
};

// --- Minta audio dari ElevenLabs & langsung stream ke speaker (I2S) ---
// output_format=pcm_16000 -> ElevenLabs balikin PCM mentah 16-bit/16kHz,
// pas sama konfigurasi I2S di speaker_audio.h. Gak ada base64, gak ada
// decode -- baca dari koneksi HTTP per 1KB, langsung tulis ke I2S.
bool ucapkanElevenLabs(const String &teks) {
  unsigned long mulai = millis();
  if (WiFi.status() != WL_CONNECTED) return false;

  PenjagaPutarAudio penjaga;   // >>> BARU

  // Matiin WiFi modem-sleep: mode hemat daya bikin data datang nyicil-nyicil
  // dengan jeda, dan itu penyebab utama suara putus-putus pas streaming.
  WiFi.setSleep(false);

  // Set I2S clock kembali ke 16000 Hz buat ElevenLabs
  i2s_set_clk(I2S_NUM_1, 16000, I2S_BITS_PER_SAMPLE_16BIT, I2S_CHANNEL_MONO);

  Serial.print("[TTS] mulai, heap bebas: ");
  Serial.println(ESP.getFreeHeap());   // >>> BARU (diagnosa)

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(20000);

  HTTPClient http;
  http.setConnectTimeout(15000);
  http.setTimeout(20000);

  String url = String("https://api.elevenlabs.io/v1/text-to-speech/")
             + ELEVENLABS_VOICE_ID + "?output_format=pcm_16000";

  if (!http.begin(client, url)) return false;
  http.addHeader("xi-api-key", ELEVENLABS_API_KEY);
  http.addHeader("Content-Type", "application/json");

  // >>> BARU (diagnosa): minta HTTPClient nyimpen header ini biar bisa dicetak
  const char* kunciHeader[] = {"Transfer-Encoding"};
  http.collectHeaders(kunciHeader, 1);

  // Bersihin teks sebelum dimasukin ke JSON. Karakter kontrol (baris baru,
  // tab) di dalam string JSON = "Invalid control character" (HTTP 422),
  // jadi semuanya diganti spasi. Simbol markdown dibuang biar gak dibacain.
  String teksAman = teks;
  teksAman.replace("\\", " ");
  teksAman.replace("\"", "'");
  teksAman.replace("\r", " ");
  teksAman.replace("\n", " ");
  teksAman.replace("\t", " ");
  teksAman.replace("*", "");
  teksAman.replace("#", "");
  teksAman.replace("_", " ");
  teksAman.replace("`", "");
  while (teksAman.indexOf("  ") >= 0) teksAman.replace("  ", " ");
  teksAman.trim();
  if (teksAman.length() == 0) { http.end(); return false; }

  String body = String("{\"text\":\"") + teksAman
              + "\",\"model_id\":\"" + ELEVENLABS_MODEL + "\"}";

  int kode = http.POST(body);

  // >>> FIX: retry 1x kalau koneksi ditolak (kode -1)
  // Kadang TLS handshake gagal di attempt pertama karena WiFi drop sesaat
  // atau heap fragmentation. Retry sekali sering nyelametin.
  if (kode == -1) {
    Serial.println("[TTS] ElevenLabs gagal (-1), retry sekali...");
    http.end();
    delay(500);

    if (!http.begin(client, url)) return false;
    http.addHeader("xi-api-key", ELEVENLABS_API_KEY);
    http.addHeader("Content-Type", "application/json");
    http.collectHeaders(kunciHeader, 1);
    kode = http.POST(body);
  }

  if (kode != 200) {
    Serial.print("[TTS] ElevenLabs gagal, kode: ");
    Serial.println(kode);
    if (kode > 0) Serial.println(http.getString()); // isi pesan error dari ElevenLabs
    http.end();
    durasiTTS = millis() - mulai;
    return false;
  }

  Serial.print("[TTS] Transfer-Encoding: ");
  Serial.println(http.header("Transfer-Encoding"));   // >>> BARU (diagnosa)

  WiFiClient *stream = http.getStreamPtr();
  const size_t UKURAN_CHUNK = 1024;
  // Buffer +2 byte: ruang buat 1 byte sisa dari chunk sebelumnya.
  // alignas(4) biar cast ke int16_t* aman di ESP32 (akses tak-sejajar bisa crash).
  alignas(4) uint8_t buffer[UKURAN_CHUNK + 2];
  size_t sisa = 0;            // 0 atau 1 byte gantung dari chunk sebelumnya
  size_t totalDiputar = 0;
  size_t ditulis;

  // >>> BARU (diagnosa): ukur seberapa sering/lama data dari jaringan seret
  unsigned long tKosong = 0;           // awal periode "gak ada data masuk"
  unsigned long gapTerpanjang = 0;
  int jumlahGapBesar = 0;              // gap > 300 ms ~ lebih lama dari buffer DMA (320 ms)
  unsigned long tDataTerakhir = millis();

  unsigned long batasWaktu = millis() + 20000; // jaga2 kalau koneksi macet total
  while (http.connected() && millis() < batasWaktu) {
    size_t adaData = stream->available();
    if (adaData) {
      if (tKosong != 0) {                                  // >>> BARU
        unsigned long gap = millis() - tKosong;
        if (gap > gapTerpanjang) gapTerpanjang = gap;
        if (gap > 300) jumlahGapBesar++;
        tKosong = 0;
      }

      size_t dibaca = stream->readBytes(buffer + sisa, min(adaData, UKURAN_CHUNK));
      tDataTerakhir = millis();                            // >>> BARU
      size_t total = sisa + dibaca;

      // Cuma proses pasangan byte utuh (1 sample = 2 byte). Kalau totalnya
      // ganjil, 1 byte terakhir ditahan dulu dan jadi byte pertama chunk
      // berikutnya, jadi batas sample gak pernah geser.
      size_t genap = total & ~((size_t)1);
      size_t jumlahSample = genap / 2;
      int16_t* sample = (int16_t*) buffer;
      for (size_t i = 0; i < jumlahSample; i++) {
        int32_t nilai = (int32_t)(sample[i] * GAIN_DIGITAL_TTS);
        if (nilai > 32767) nilai = 32767;
        if (nilai < -32768) nilai = -32768;
        sample[i] = (int16_t) nilai;
      }

      if (genap > 0) {
        i2s_write(I2S_NUM_1, buffer, genap, &ditulis, portMAX_DELAY);
        totalDiputar += genap;
      }

      if (total > genap) {
        buffer[0] = buffer[genap];
        sisa = 1;
      } else {
        sisa = 0;
      }
      batasWaktu = millis() + 20000; // reset timeout selama data masih ngalir
    } else if (!http.connected()) {
      break; // koneksi ditutup server = audio selesai
    } else {
      if (totalDiputar > 0 && tKosong == 0) tKosong = millis();   // >>> BARU

      // >>> FIX: server ElevenLabs kadang nahan koneksi (keep-alive) setelah
      // audio selesai dikirim. Loop-nya jadi nunggu 20 detik sia-sia.
      // Kalau udah dapet data & nganggur >3 detik, anggap selesai.
      if (tKosong != 0 && (millis() - tKosong) > 3000) {
        Serial.println("[TTS] server slow-close, force break");
        break;
      }

      delay(2);
    }
  }

  http.end();
  durasiTTS = millis() - mulai;

  // >>> BARU (diagnosa): ringkasan, ini yang dikirim ke gw kalau masih patah
  Serial.printf("[TTS] selesai: %u byte (%.1f dtk audio), total %lu ms, "
                "idle di akhir %lu ms, gap terpanjang %lu ms, gap>300ms: %d kali\n",
                (unsigned)totalDiputar, totalDiputar / 32000.0f, durasiTTS,
                millis() - tDataTerakhir, gapTerpanjang, jumlahGapBesar);

  return totalDiputar > 0;
}
#endif