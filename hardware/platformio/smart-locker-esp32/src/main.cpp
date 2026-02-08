#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPI.h>
#include <ArduinoJson.h>

// pin
#define SS_PIN 5
#define RST_PIN 22
#define RELAY_PIN 27
#define LED_GREEN_PIN 25
#define LED_RED_PIN 26

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* SUPABASE_URL = "https://pwvbgiwzatwotdqmvilc.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmJnaXd6YXR3b3RkcW12aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDEzODQsImV4cCI6MjA4NTAxNzM4NH0.XPWYYNaWgELlf5kgDLU8vHQjFeNGpDAOnbmlSmqktXA";

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);

  SPI.begin();
  rfid.PCD_Init();

  connectWiFi();
  Serial.println("Sistema pronto");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  String badgeUID = getCardUID();

  Serial.print("Badge: ");
  Serial.println(badgeUID);

  handleBadgeScan(badgeUID);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(2000);
}

void connectWiFi() {
  Serial.print("Connessione WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("connesso");
  } else {
    Serial.println("fallito (offline)");
  }
}

String getCardUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) {
      uid += ":";
    }
  }
  uid.toUpperCase();
  return uid;
}

void handleBadgeScan(String uid) {
  digitalWrite(LED_GREEN_PIN, HIGH);

  // se non c'e wifi vado in offline
  if (WiFi.status() != WL_CONNECTED) {
    handleOfflineMode(uid);
    return;
  }

  String response = callSupabaseIdentify(uid);
  Serial.println(response);

  if (response.length() > 0) {
    Serial.println("Autorizzato");
    unlockLocker();
  } else {
    Serial.println("Accesso negato");
    blinkError();
  }

  digitalWrite(LED_GREEN_PIN, LOW);
}

void handleOfflineMode(String uid) {
  // badge di test hardcoded per quando non c'e internet
  if (uid == "04:5A:2F:1B:3C:6D:80") {
    Serial.println("Autorizzato (offline)");
    unlockLocker();
  } else {
    Serial.println("Accesso negato");
    blinkError();
  }

  digitalWrite(LED_GREEN_PIN, LOW);
}

String callSupabaseIdentify(String code) {
  if (WiFi.status() != WL_CONNECTED) {
    return "";
  }

  HTTPClient http;

  String url = String(SUPABASE_URL) + "/rest/v1/rpc/identify_code";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  JsonDocument doc;
  doc["p_code"] = code;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);

  String response = "";

  if (httpCode > 0) {
    response = http.getString();
  } else {
    Serial.print("Errore HTTP ");
    Serial.println(httpCode);
  }

  http.end();

  return response;
}

void unlockLocker() {
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(LED_GREEN_PIN, HIGH);

  delay(3000);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
}

void blinkError() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_RED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_RED_PIN, LOW);
    delay(200);
  }
}
