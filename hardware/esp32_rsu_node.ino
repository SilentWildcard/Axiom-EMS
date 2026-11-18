/*
 * ERS — Emergency Response Synchronization System
 * Roadside Unit (RSU) Firmware for ESP32 / Arduino
 * 
 * Hardware Modules:
 * - ESP32 NodeMCU (Wi-Fi / 4G LTE SIM7600)
 * - MAX98357A I2S Audio Amplifier (PA Speaker for Public Announcements)
 * - WS2812B RGB Neopixel Status Ring / Traffic Signal Indicator
 * - SSD1306 OLED / P10 LED Matrix (Driver Display)
 * - Ultrasonic / mmWave Radar (Queue Length Estimation)
 * - MAX4466 Microphone Sensor (Ambient Siren & Noise Detection)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuration & Secrets
const char* WIFI_SSID = "DELHI_TRAFFIC_POLICE_IOT_NET";
const char* WIFI_PASSWORD = "CHANGE_IN_PRODUCTION";
const char* ERS_SERVER_URL = "http://192.168.1.100:8000/api/iot/hardware/telemetry";
const char* DEVICE_ID = "CP-RSU-01";
const char* DEVICE_TOKEN = "ers_rsu_token_delhi_sec_8f93a1";

// Pinout mapping
#define STATUS_LED_PIN 2
#define BUZZER_PIN 4
#define AUDIO_LRC 25
#define AUDIO_BCLK 26
#define AUDIO_DOUT 22

unsigned long lastTelemetryMillis = 0;
const unsigned long TELEMETRY_INTERVAL = 2000; // 2 seconds

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("[ERS RSU] Initializing ESP32 Roadside Hardware Unit...");
  Serial.printf("[ERS RSU] Device ID: %s\n", DEVICE_ID);
  
  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[ERS RSU] Connected to Secure Traffic Mesh Network.");
    Serial.print("[ERS RSU] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[ERS RSU] Wi-Fi Connection Timeout. Operating in Offline Safe Mode.");
  }
}

void loop() {
  if (millis() - lastTelemetryMillis >= TELEMETRY_INTERVAL) {
    lastTelemetryMillis = millis();
    sendTelemetryAndPollCommand();
  }
}

void sendTelemetryAndPollCommand() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  http.begin(ERS_SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Read simulated/connected sensors
  int rssi = WiFi.RSSI();
  float simulatedNoiseDb = 65.0 + (random(0, 200) / 10.0);
  float simulatedQueueM = 30.0 + (random(0, 300) / 10.0);

  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = String(millis());
  doc["token"] = DEVICE_TOKEN;
  doc["rssi_dbm"] = rssi;
  doc["ambient_noise_db"] = simulatedNoiseDb;
  doc["traffic_queue_length_m"] = simulatedQueueM;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    StaticJsonDocument<512> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (!error) {
      const char* state = responseDoc["device_state"];
      bool speakerActive = responseDoc["speaker_active"];
      const char* displayCmd = responseDoc["display_command"];
      const char* audioCmd = responseDoc["audio_command"];

      handleStateAction(state, speakerActive, displayCmd, audioCmd);
    }
  } else {
    Serial.printf("[ERS RSU] Telemetry upload failed, HTTP error: %d\n", httpCode);
  }

  http.end();
}

void handleStateAction(const char* state, bool speakerActive, const char* displayCmd, const char* audioCmd) {
  Serial.printf("[RSU STATE] %s | Speaker: %s | Display: %s\n", state, speakerActive ? "ON" : "OFF", displayCmd);

  if (strcmp(state, "ALERT_SENT") == 0 || strcmp(state, "AMBULANCE_APPROACHING") == 0) {
    // Pulse Alert Indicator & Siren Beep
    digitalWrite(STATUS_LED_PIN, HIGH);
    tone(BUZZER_PIN, 1000, 150);
  } else if (strcmp(state, "ARRIVED_AT_CHECKPOINT") == 0) {
    // High alert solid on
    digitalWrite(STATUS_LED_PIN, HIGH);
    tone(BUZZER_PIN, 1500, 300);
  } else {
    // Normal IDLE mode
    digitalWrite(STATUS_LED_PIN, LOW);
    noTone(BUZZER_PIN);
  }
}
