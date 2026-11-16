// oled_display.h
// OLED SSD1309 2.42" lewat I2C (+ pin RES terpisah).
//
// Library yang dipakai: U8g2 (by oliver — install lewat Arduino IDE:
// Sketch > Include Library > Manage Libraries > cari "u8g2" > Install)

#ifndef OLED_DISPLAY_H
#define OLED_DISPLAY_H

#include <U8g2lib.h>
#include <Wire.h>

// PENTING: jangan GPIO4 -- itu udah dipakai DHT_PIN di config.h.
// Kalau dipaksa sama-sama, tiap DHT22 dibaca, OLED bakal ke-reset
// (layar nyala tapi tulisan ilang tiba-tiba).
#define OLED_RES_PIN 27

// Konstruktor U8g2 buat SSD1309 128x64 lewat Hardware I2C.
// SDA/SCL otomatis pakai pin I2C default ESP32 (GPIO 21 / GPIO 22).
U8G2_SSD1309_128X64_NONAME0_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ OLED_RES_PIN);

void inisialisasiOLED() {
  bool ok = u8g2.begin();

  if (ok) {
    statusOLED = true;
    Serial.println("OLED SSD1309 berhasil diinisialisasi.");
  } else {
    statusOLED = false;
    Serial.println("OLED SSD1309 gagal diinisialisasi -- cek wiring I2C & RES.");
    return;
  }

  // Tes tampilan sederhana -- kalau ini muncul di layar, wiring & library beres
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB10_tr);
  u8g2.drawStr(10, 30, "AURA OLED");
  u8g2.setFont(u8g2_font_6x10_tr);
  u8g2.drawStr(10, 48, "Init OK");
  u8g2.sendBuffer();
}

// --- Judul "AURA" (kiri) + jam (kanan atas), titik dua jam berkedip tiap 1 detik ---
// Non-blocking pakai millis() (pola sama kayak LED_Bekerja() di led_blink.h).
unsigned long waktuKedipJam = 0;
bool titikDuaTampil = true;

void gambarJudulDanJam() {
  unsigned long sekarang = millis();
  if (sekarang - waktuKedipJam >= 1000) {
    waktuKedipJam = sekarang;
    titikDuaTampil = !titikDuaTampil;
  }

  // "AURA" di kiri
  u8g2.setFont(u8g2_font_ncenB10_tr);
  u8g2.drawStr(2, 13, "AURA");

  // Jam di kanan, rata kanan. Titik dua diganti spasi pas fase "mati"
  // kedipannya, jadi keliatan jam-nya kedip-kedip kayak jam digital.
  u8g2.setFont(u8g2_font_6x10_tr);
  String jam = bacaJamSekarang(); // format "HH:MM"
  if (!titikDuaTampil) jam.replace(":", " ");

  int lebarJam = u8g2.getStrWidth(jam.c_str());
  u8g2.drawStr(128 - lebarJam - 2, 12, jam.c_str());

  u8g2.drawHLine(0, 16, 128); // garis pemisah judul & data sensor
}

// --- Nampilin satu pesan teks ke OLED (dipanggil pas ada status/jawaban baru) ---
// Baris baru ("\n") di dalam pesan bikin ganti baris beneran. Kalau 1 baris
// logis kepanjangan, baru dipotong per ~21 karakter (muat di lebar 128px
// pakai font 6x10). Area data cuma muat 4 baris karena bagian atas
// kepake buat judul "AURA" + jam.
void tampilkanKeOLED(String pesan) {
  if (!statusOLED) return; // OLED gagal init, jangan coba akses u8g2

  const int LEBAR_KARAKTER = 21;
  const int TINGGI_BARIS = 10;
  const int MAKS_BARIS = 4;
  const int Y_MULAI = 27;

  u8g2.clearBuffer();

  gambarJudulDanJam();

  u8g2.setFont(u8g2_font_6x10_tr);

  int y = Y_MULAI;
  int barisKe = 0;
  int mulai = 0;
  int panjang = pesan.length();

  while (mulai < panjang && barisKe < MAKS_BARIS) {
    int akhirBaris = pesan.indexOf('\n', mulai);
    String isiBaris;
    if (akhirBaris == -1) {
      isiBaris = pesan.substring(mulai);
      mulai = panjang;
    } else {
      isiBaris = pesan.substring(mulai, akhirBaris);
      mulai = akhirBaris + 1;
    }

    // Kalau 1 baris logis (dipisah \n) kepanjangan, potong per LEBAR_KARAKTER
    int posisi = 0;
    do {
      int akhirPotong = posisi + LEBAR_KARAKTER;
      if (akhirPotong > (int)isiBaris.length()) akhirPotong = isiBaris.length();

      String potongan = isiBaris.substring(posisi, akhirPotong);
      u8g2.drawStr(0, y, potongan.c_str());

      y += TINGGI_BARIS;
      barisKe++;
      posisi = akhirPotong;
    } while (posisi < (int)isiBaris.length() && barisKe < MAKS_BARIS);
  }

  u8g2.sendBuffer();
}

// --- Susun teks 4 baris: Temperature, Humidity, Radar, Light ---
// Jam udah gak di sini lagi -- pindah ke pojok kanan atas (gambarJudulDanJam()).
String buatTampilanOLED() {
  float suhu = 0, lembab = 0;
  bool sensorValid = bacaSuhuKelembaban(suhu, lembab);
  bool adaOrang = bacaKehadiranRadar();

  String teks = "";
  teks += "TEMPERATURE: " + (sensorValid ? String(suhu, 1) + "C" : String("Error")) + "\n";
  teks += "HUMIDITY: "    + (sensorValid ? String(lembab, 1) + "%" : String("Error")) + "\n";
  teks += "RADAR: "       + String(adaOrang ? "Present" : "Absent") + "\n";
  teks += "LIGHT: " + kategoriCahaya();
  

  return teks;
}

#endif