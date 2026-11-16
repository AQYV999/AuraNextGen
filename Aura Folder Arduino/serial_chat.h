#ifndef SERIAL_CHAT_H
#define SERIAL_CHAT_H
#include "mode_cloud_ai.h"
#include "tts_elevenlabs.h"
#include "tts_local.h"     

String bufferSerial = "";

// --- State mesin obrolan: IDLE (nunggu input) / THINKING (nunggu jawaban Gemini) ---
enum StatusAura { AURA_IDLE, AURA_THINKING };
StatusAura statusAura = AURA_IDLE;

String pertanyaanAura = "";
String jawabanAura = "";
volatile bool prosesSelesai = false;
volatile bool prosesBerhasil = false;

unsigned long waktuDotTerakhir = 0;
int jumlahDot = 0;
TaskHandle_t taskHandleAura = NULL;

// Dijalankan di task terpisah (core 1) supaya http.POST() yang blocking
// gak nge-freeze loop() utama (radar, web server tablet, dll tetep jalan)
void taskCloudAI(void *parameter) {
  bool ok = cobaCloudAI(pertanyaanAura, jawabanAura);
  prosesBerhasil = ok;
  prosesSelesai = true;   // tanda ke loop() utama: sudah selesai
  taskHandleAura = NULL;
  vTaskDelete(NULL);
}

void mulaiAnimasiMikir() {
  jumlahDot = 0;
  waktuDotTerakhir = millis();
  Serial.print("AURA lagi mikir");
}

// Dipanggil tiap loop() selama statusAura == AURA_THINKING
void updateAnimasiMikir() {
  if (!prosesSelesai) {
    if (millis() - waktuDotTerakhir >= 400) {
      Serial.print(".");
      waktuDotTerakhir = millis();
      jumlahDot++;
      if (jumlahDot >= 6) {
        Serial.println();
        Serial.print("AURA lagi mikir");
        jumlahDot = 0;
      }
    }
    return;
  }

  // Sudah selesai -> tampilkan hasil
  Serial.println();
  if (prosesBerhasil) {
    Serial.print("AURA: ");
    Serial.println(jawabanAura);
    ucapkan(jawabanAura);
  } else {
    Serial.println("AURA: Maaf, gagal dapat jawaban dari Gemini.");
  }
  Serial.println("---");

  statusAura = AURA_IDLE;
}

// Non-blocking: baca karakter Serial tiap loop, proses saat user tekan Enter
void cekChatSerial() {
  // Kalau lagi nunggu jawaban Gemini, cuma urus animasi & cek hasil,
  // gak baca input baru dulu.
  if (statusAura == AURA_THINKING) {
    updateAnimasiMikir();
    return;
  }

  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\n' || c == '\r') {
      bufferSerial.trim();
      if (bufferSerial.length() > 0) {
        Serial.print("Kamu: ");
        Serial.println(bufferSerial);

        if (WiFi.status() != WL_CONNECTED) {
          Serial.println("AURA: WiFi tidak terhubung, tidak bisa hubungi Gemini.");
          Serial.println("---");
        } else {
          pertanyaanAura = bufferSerial;
          jawabanAura = "";
          prosesSelesai = false;
          prosesBerhasil = false;
          statusAura = AURA_THINKING;
          mulaiAnimasiMikir();

          xTaskCreatePinnedToCore(
            taskCloudAI,      // fungsi task
            "taskCloudAI",    // nama task
            12288,            // stack size (byte) - TLS/HTTPS butuh cukup besar
            NULL,             // parameter
            1,                // priority
            &taskHandleAura,  // handle
            1                 // core 1 (core 0 biasanya dipakai WiFi stack)
          );
        }
      }
      bufferSerial = "";
      // Kalau baru mulai THINKING, keluar dari while supaya animasi
      // langsung ke-handle di loop() berikutnya.
      if (statusAura == AURA_THINKING) return;
    } else {
      bufferSerial += c;
    }
  }
}
#endif  