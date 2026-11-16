#ifndef SENSOR_DHT_H
#define SENSOR_DHT_H
#include <DHT.h>
#include "config.h"

DHT dht(DHT_PIN, DHT_TYPE);

void inisialisasiDHT() { dht.begin(); }

bool bacaSuhuKelembaban(float &suhu, float &lembab) {
  suhu = dht.readTemperature();
  lembab = dht.readHumidity();
  return !(isnan(suhu) || isnan(lembab));
}
#endif