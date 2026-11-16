#ifndef CONFIG_H
#define CONFIG_H

// --- Sensor Suhu/Kelembaban ---
#define DHT_PIN 4
#define DHT_TYPE DHT22

// --- OLED (I2C) ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// --- Mikrofon INMP441 (I2S input) ---
#define MIC_SD  32
#define MIC_SCK 14
#define MIC_WS  19

// --- Speaker MAX98357A (I2S output) ---
#define SPK_DIN  23
#define SPK_BCLK 26
#define SPK_LRC  33

// --- Radar HLK-LD2410C (UART) ---
#define RADAR_RX_PIN 16
#define RADAR_TX_PIN 17

// --- BH1750 (I2C Light Sensor) ---
#define BH1750_ADDR 0x23   // ganti ke 0x5C kalau ADDR ditarik ke VCC

// --- Tombol rekam suara (STT) ---
#define TOMBOL_REKAM_PIN 13

// --- LED Indikator ---
#define LED_PIN 2

#endif