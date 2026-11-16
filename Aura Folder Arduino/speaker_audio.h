#ifndef SPEAKER_AUDIO_H
#define SPEAKER_AUDIO_H
#include <driver/i2s.h>
#include "config.h"

void inisialisasiSpeaker() {
  i2s_config_t konfigI2S = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    // Buffer DMA diperbesar biar kuat nahan jeda/telat data dari WiFi.
    // 10 x 512 sample ~ 0,32 detik audio (dulu 8 x 256 ~ 0,13 detik).
    // Jangan digedein sembarangan: makin besar makin makan heap, dan
    // cobaCloudAI() nolak jalan kalau free heap < 45000.
    .dma_buf_count = 10,
    .dma_buf_len = 512,
    .use_apll = false,
    // Kalau data telat, keluarin SENYAP -- bukan ngulang potongan terakhir
    // (itu yang bikin suara "sa sa", "la la gi gig").
    .tx_desc_auto_clear = true
  };

  i2s_pin_config_t konfigPin = {
    .bck_io_num = SPK_BCLK,
    .ws_io_num = SPK_LRC,
    .data_out_num = SPK_DIN,
    .data_in_num = I2S_PIN_NO_CHANGE
  };

  i2s_driver_install(I2S_NUM_1, &konfigI2S, 0, NULL);
  i2s_set_pin(I2S_NUM_1, &konfigPin);

  Serial.print("[Speaker] siap. Free heap setelah alokasi DMA: ");
  Serial.println(ESP.getFreeHeap());
}
#endif