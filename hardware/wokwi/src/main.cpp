#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define BUZZER_PIN  14
#define GREEN_LED   26
#define RED_LED     25
#define RELAY_PIN   27

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

const char* SUPABASE_URL = "https://pwvbgiwzatwotdqmvilc.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmJnaXd6YXR3b3RkcW12aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDEzODQsImV4cCI6MjA4NTAxNzM4NH0.XPWYYNaWgELlf5kgDLU8vHQjFeNGpDAOnbmlSmqktXA";

String inputBuffer = "";

// prototipi
void connectWiFi();
void handleBadge(String uid);
String callBadgeAccess(String badge_uid);
void feedbackCheckin(const char* utente, const char* locker);
void feedbackCheckout(const char* utente, const char* locker);
void feedbackErrore(const char* msg);

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(RELAY_PIN, LOW);

  connectWiFi();
  Serial.println("Sistema pronto");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // leggo dal seriale il badge (simulazione)
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      inputBuffer.trim();
      if (inputBuffer.length() == 0) continue;

      String uid = inputBuffer;
      inputBuffer = "";

      handleBadge(uid);
    } else {
      inputBuffer += c;
    }
  }
}

void connectWiFi() {
  Serial.print("Connessione WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("connesso");
  } else {
    Serial.println("fallito");
  }
}

void handleBadge(String uid) {
  Serial.print("Badge: ");
  Serial.println(uid);

  String response = callBadgeAccess(uid);

  if (response.length() == 0) {
    feedbackErrore("nessuna risposta");
    return;
  }

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, response);

  if (err) {
    feedbackErrore("errore JSON");
    return;
  }

  bool success = doc["success"] | false;

  if (!success) {
    const char* errMsg = doc["error"] | "negato";
    feedbackErrore(errMsg);
    return;
  }

  // azione puo essere checkin o checkout
  const char* azione = doc["azione"] | "unknown";
  const char* utente = doc["utente"] | "?";

  if (strcmp(azione, "checkin") == 0) {
    const char* locker = doc["locker_assegnato"] | "?";
    feedbackCheckin(utente, locker);
  } else if (strcmp(azione, "checkout") == 0) {
    const char* locker = doc["locker_rilasciato"] | "?";
    feedbackCheckout(utente, locker);
  }
}

String callBadgeAccess(String badge_uid) {
  HTTPClient http;

  String url = String(SUPABASE_URL) + "/rest/v1/rpc/badge_access";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  JsonDocument doc;
  doc["p_badge_uid"] = badge_uid;
  doc["p_metodo"] = "badge";

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  String response = "";

  if (httpCode > 0) {
    response = http.getString();
  } else {
    Serial.print("HTTP ");
    Serial.println(httpCode);
  }

  http.end();
  return response;
}

void feedbackCheckin(const char* utente, const char* locker) {
  Serial.print("Ingresso: ");
  Serial.print(utente);
  Serial.print(" - Locker ");
  Serial.println(locker);

  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(1500);
  digitalWrite(BUZZER_PIN, LOW);
  delay(1500);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
}

void feedbackCheckout(const char* utente, const char* locker) {
  Serial.print("Uscita: ");
  Serial.print(utente);
  Serial.print(" - Locker ");
  Serial.println(locker);

  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(300);
  digitalWrite(BUZZER_PIN, LOW);
  delay(200);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(300);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
}

void feedbackErrore(const char* msg) {
  Serial.print("Errore: ");
  Serial.println(msg);

  digitalWrite(RED_LED, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(2000);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RED_LED, LOW);
}
