/*
 * Smart Locker IoT - ESP32 (Singolo Armadietto)
 * Simulazione Wokwi - Lettore NFC/RFID integrato
 *
 * Funzionalità:
 * - Legge tessera/telefono NFC
 * - Contatta il database per verificare prenotazione
 * - Se autorizzato, sblocca l'armadietto
 * - Pulsante emergenza per sblocco manuale
 *
 * Prova con:
 *   04:5A:2F:1B -> Mario Rossi
 *   01:AB:CD:EF -> Paolo Bianchi
 */

#include <Arduino.h>
#include <Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Pin definitions ---
#define BUZZER_PIN      14
#define STATUS_LED_GREEN 26
#define STATUS_LED_RED   25
#define SERVO_PIN       27

// --- WiFi Credentials ---
const char* SSID = "Wokwi-GUEST";
const char* PASSWORD = "";

// --- Supabase Configuration ---
const char* SUPABASE_URL = "https://pwvbgiwzatwotdqmvilc.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmJnaXd6YXR3b3RkcW12aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDEzODQsImV4cCI6MjA4NTAxNzM4NH0.XPWYYNaWgELlf5kgDLU8vHQjFeNGpDAOnbmlSmqktXA";

#define LOCKER_ID       "A01"
#define UNLOCK_TIME     3000  // Milliseconde - tempo apertura

// === Servo motor ===
Servo lockServo;
#define SERVO_CLOSED    0     // Gradi - lucchetto chiuso
#define SERVO_OPEN      90    // Gradi - lucchetto aperto

// === Badge autorizzati per questo armadietto (fallback offline - NON USATO) ===
// Test badge dal database:
// - Mario Rossi: 04:5A:2F:1B:3C:6D:80
// - Paolo Bianchi: 04:7F:3C:2D:5E:8A:92
// Ora il sistema richiede SEMPRE il contatto con Supabase

// === Variabili globali ===
String inputBuffer = "";
bool lockerOpen = false;
unsigned long unlockTime = 0;

// === Prototipi ===
void connectToWiFi();
bool callLockerUnlock(String badgeCode, String& response);
void servoOpen();
void servoClose();
void requestAuthorization(String badgeCode);
void feedbackSuccess();
void feedbackDenied();

// ===========================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED_GREEN, OUTPUT);
  pinMode(STATUS_LED_RED, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(STATUS_LED_GREEN, LOW);
  digitalWrite(STATUS_LED_RED, LOW);
  
  // Inizializza servo
  lockServo.attach(SERVO_PIN);
  lockServo.write(SERVO_CLOSED);

  Serial.println("\n========================================");
  Serial.println("  Smart Locker IoT - Armadietto");
  Serial.print("  ID: ");
  Serial.println(LOCKER_ID);
  Serial.println("========================================");
  
  // Connessione WiFi
  connectToWiFi();
  
  Serial.println("\nAvvicina il tuo NFC/Tessera RFID...\n");
}

// ===========================================================
void loop() {
  // Auto-chiusura
  if (lockerOpen && (millis() - unlockTime > UNLOCK_TIME)) {
    Serial.println("-> Richiusura automatica");
    servoClose();
    lockerOpen = false;
    digitalWrite(STATUS_LED_GREEN, LOW);
  }

  // Leggi NFC/RFID
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      inputBuffer.trim();
      if (inputBuffer.length() == 0) {
        inputBuffer = "";
        continue;
      }

      String userId = inputBuffer;
      inputBuffer = "";

      Serial.println("\n--- NFC/RFID Rilevato ---");
      Serial.print("User ID: ");
      Serial.println(userId);
      
      requestAuthorization(userId);
      
    } else {
      inputBuffer += c;
    }
  }
}

// ===========================================================
// Connette al WiFi
void connectToWiFi() {
  Serial.println("\n-> Connessione WiFi...");
  Serial.print("   SSID: ");
  Serial.println(SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  
  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 20) {
    delay(500);
    Serial.print(".");
    timeout++;
  }
  
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✓ Connesso al WiFi!");
    Serial.print("  IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("✗✗✗ ERRORE: Connessione WiFi fallita!");
  }
}

// ===========================================================
// Verifica autorizzazione via API Supabase - locker_unlock
// Verifica che l'utente abbia QUESTO specifico armadietto assegnato
bool callLockerUnlock(String badgeCode, String& response) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗✗✗ ERRORE CRITICO: WiFi non connesso!");
    Serial.println("    Impossibile contattare il database.");
    return false;
  }
  
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/rpc/locker_unlock";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
  
  // Prepara payload JSON con badge E locker ID
  JsonDocument doc;
  doc["p_badge_uid"] = badgeCode;
  doc["p_locker_numero"] = LOCKER_ID;
  doc["p_metodo"] = "nfc";
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  Serial.print("-> POST: ");
  Serial.println(url);
  Serial.print("   Payload: ");
  Serial.println(requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode > 0) {
    response = http.getString();
    Serial.print("   Response (HTTP ");
    Serial.print(httpResponseCode);
    Serial.print("): ");
    Serial.println(response);
    
    // Parsa risposta JSON
    JsonDocument responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      // Controlla se è un errore Supabase (oggetto con "message")
      if (responseDoc.is<JsonObject>() && responseDoc["message"].is<String>()) {
        Serial.print("   ✗✗✗ ERRORE SUPABASE: ");
        Serial.println(responseDoc["message"].as<String>());
        return false;
      }
      
      // Può essere un array o un oggetto singolo
      JsonObject user;
      
      if (responseDoc.is<JsonArray>() && responseDoc.size() > 0) {
        // È un array: prendi il primo elemento
        user = responseDoc[0];
      } else if (responseDoc.is<JsonObject>()) {
        // È un oggetto singolo: usalo direttamente
        user = responseDoc.as<JsonObject>();
      } else {
        Serial.println("   ✗✗✗ ERRORE: Formato risposta non valido!");
        return false;
      }
      
      // La nuova funzione locker_unlock ritorna {success: bool, ...}
      if (user["success"].is<bool>()) {
        bool success = user["success"];
        if (success) {
          Serial.print("   ✓ Utente: ");
          Serial.println(user["utente"].as<String>());
          Serial.print("   ✓ Locker: ");
          Serial.println(user["locker"].as<String>());
          Serial.print("   ");
          Serial.println(user["messaggio"].as<String>());
        } else {
          Serial.print("   ✗ Errore: ");
          Serial.println(user["error"].as<String>());
        }
        return success;
      } else {
        Serial.println("   ✗✗✗ ERRORE: Campo 'success' non trovato!");
      }
    } else {
      Serial.print("   ✗✗✗ ERRORE: Parse JSON fallito - ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.print("   ✗✗✗ ERRORE HTTP: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  return false;
}

// ===========================================================
// Contatta il database per verificare l'autorizzazione
void requestAuthorization(String badgeCode) {
  Serial.println("-> Verifica autorizzazione via Supabase...");
  Serial.print("   Badge: ");
  Serial.println(badgeCode);
  Serial.print("   Locker: ");
  Serial.println(LOCKER_ID);
  
  String response = "";
  bool authorized = callLockerUnlock(badgeCode, response);
  
  Serial.println();
  if (authorized) {
    Serial.println("✓ AUTORIZZATO - Armadietto corretto!");
    feedbackSuccess();
    servoOpen();
    lockerOpen = true;
    unlockTime = millis();
    digitalWrite(STATUS_LED_GREEN, HIGH);
    Serial.print("Apertura per ");
    Serial.print(UNLOCK_TIME / 1000);
    Serial.println(" secondi");
  } else {
    Serial.println("✗ NEGATO - Verifica fallita");
    feedbackDenied();
  }
  
  Serial.println("\nAvvicina il tuo NFC/Tessera RFID...");
}

// Apre il servo (sblocca)
void servoOpen() {
  lockServo.write(SERVO_OPEN);
  Serial.println("[SERVO] Apertura lucchetto");
}

// Chiude il servo (blocca)
void servoClose() {
  lockServo.write(SERVO_CLOSED);
  Serial.println("[SERVO] Chiusura lucchetto");
}

// Feedback - Accesso autorizzato (LED verde + beep lungo)
void feedbackSuccess() {
  digitalWrite(STATUS_LED_GREEN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(800);
  digitalWrite(BUZZER_PIN, LOW);
  // LED rimane acceso durante apertura
}

// Feedback - Accesso negato (LED rosso blink 3 volte)
void feedbackDenied() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(STATUS_LED_RED, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(150);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(STATUS_LED_RED, LOW);
    delay(150);
  }
}
