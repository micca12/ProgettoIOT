/*
 * Smart Locker IoT - ESP32 RFID System
 * PlatformIO Version
 */
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPI.h>
#include <ArduinoJson.h>

// ========================================
// CONFIGURAZIONE PIN
// ========================================
#define SS_PIN 5
#define RST_PIN 22
#define RELAY_PIN 27
#define LED_GREEN_PIN 25
#define LED_RED_PIN 26

// ========================================
// CONFIGURAZIONE WIFI
// ========================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ========================================
// CONFIGURAZIONE SUPABASE
// ========================================
const char* SUPABASE_URL = "https://pwvbgiwzatwotdqmvilc.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmJnaXd6YXR3b3RkcW12aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDEzODQsImV4cCI6MjA4NTAxNzM4NH0.XPWYYNaWgELlf5kgDLU8vHQjFeNGpDAOnbmlSmqktXA";

// ========================================
// OGGETTI GLOBALI
// ========================================
MFRC522 rfid(SS_PIN, RST_PIN);

// ========================================
// SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n=================================");
  Serial.println("   Smart Locker IoT - ESP32");
  Serial.println("=================================\n");

  // Configura pin
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);

  // Inizializza SPI
  SPI.begin();

  // Inizializza RFID
  rfid.PCD_Init();
  Serial.println("✓ RFID Reader inizializzato");

  // Connetti a WiFi
  connectWiFi();

  Serial.println("\n✓ Sistema pronto!");
  Serial.println("Avvicina un badge RFID...\n");
}

// ========================================
// LOOP PRINCIPALE
// ========================================
void loop() {
  // Controlla se c'è un nuovo badge
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Leggi il badge
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Ottieni UID del badge
  String badgeUID = getCardUID();

  Serial.println("\n--- Badge Rilevato ---");
  Serial.print("UID: ");
  Serial.println(badgeUID);

  // Processa il badge
  handleBadgeScan(badgeUID);

  // Halt PICC
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(2000);
}

// ========================================
// FUNZIONI WIFI
// ========================================
void connectWiFi() {
  Serial.print("Connessione WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connesso!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi NON connesso!");
    Serial.println("⚠ Modalità offline - simulazione locale");
  }
}

// ========================================
// FUNZIONI RFID
// ========================================
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
  // Accendi LED durante elaborazione
  digitalWrite(LED_GREEN_PIN, HIGH);

  // Se WiFi non connesso, usa modalità offline
  if (WiFi.status() != WL_CONNECTED) {
    handleOfflineMode(uid);
    return;
  }

  // Chiama Supabase per identificare il badge
  Serial.println("→ Invio richiesta a Supabase...");

  String response = callSupabaseIdentify(uid);

  if (response.length() > 0) {
    // Badge riconosciuto
    Serial.println("✓ Badge riconosciuto!");
    unlockLocker();
  } else {
    // Badge non riconosciuto
    Serial.println("✗ Badge NON riconosciuto!");
    blinkError();
  }

  digitalWrite(LED_GREEN_PIN, LOW);
}

void handleOfflineMode(String uid) {
  Serial.println("→ Modalità offline");

  // Controlla badge noti (hardcoded per test)
  if (uid == "04:5A:2F:1B:3C:6D:80") {
    Serial.println("✓ Badge riconosciuto (offline): Mario Rossi");
    unlockLocker();
  } else {
    Serial.println("✗ Badge sconosciuto");
    blinkError();
  }

  digitalWrite(LED_GREEN_PIN, LOW);
}

// ========================================
// CHIAMATE API SUPABASE
// ========================================
String callSupabaseIdentify(String code) {
  if (WiFi.status() != WL_CONNECTED) {
    return "";
  }

  HTTPClient http;

  // Endpoint Supabase RPC
  String url = String(SUPABASE_URL) + "/rest/v1/rpc/identify_code";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  // Payload JSON
  StaticJsonDocument<200> doc;
  doc["p_code"] = code;

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.print("Request: ");
  Serial.println(requestBody);

  // Invia richiesta POST
  int httpResponseCode = http.POST(requestBody);

  String response = "";

  if (httpResponseCode > 0) {
    Serial.print("Response code: ");
    Serial.println(httpResponseCode);

    response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("Error: ");
    Serial.println(httpResponseCode);
  }

  http.end();

  return response;
}

// ========================================
// CONTROLLO HARDWARE
// ========================================
void unlockLocker() {
  Serial.println("→ Sblocco armadietto...");

  // Attiva relay per 3 secondi
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(LED_GREEN_PIN, HIGH);

  delay(3000);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);

  Serial.println("✓ Armadietto sbloccato!");
}

void blinkError() {
  // Blink LED rosso 3 volte
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_RED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_RED_PIN, LOW);
    delay(200);
  }
}
