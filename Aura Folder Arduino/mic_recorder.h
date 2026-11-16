#ifndef MIC_RECORDER_H
#define MIC_RECORDER_H
#include <driver/i2s.h>
#include "config.h"

#define SAMPLE_RATE 16000
#define DURASI_REKAM_DETIK 4
#define UKURAN_BUFFER (SAMPLE_RATE * DURASI_REKAM_DETIK * 2)

void inisialisasiMic() {
  i2s_config_t konfigI2S = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = 256
  };

  i2s_pin_config_t konfigPin = {
    .mck_io_num   = I2S_PIN_NO_CHANGE,   // <-- TAMBAH INI
    .bck_io_num = MIC_SCK,
    .ws_io_num = MIC_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = MIC_SD
  };

  i2s_driver_install(I2S_NUM_0, &konfigI2S, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &konfigPin);
}

size_t rekamAudio(uint8_t* buffer) {
  size_t totalDibaca = 0;
  size_t dibacaSaatIni = 0;

  while (totalDibaca < UKURAN_BUFFER) {
    i2s_read(I2S_NUM_0, buffer + totalDibaca, UKURAN_BUFFER - totalDibaca, &dibacaSaatIni, portMAX_DELAY);
    totalDibaca += dibacaSaatIni;
  }
  return totalDibaca;
}
#endif