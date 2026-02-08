#include <Arduino.h>
#include <Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define BUZZER_PIN      14
#define STATUS_LED_GREEN 26
#define STATUS_LED_RED   25
#define SERVO_PIN       27

const char* SSID = "Wokwi-GUEST";
const char* PASSWORD = "";

const char* SUPABASE_URL = "https://pwvbgiwzatwotdqmvilc.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmJnaXd6YXR3b3RkcW12aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDEzODQsImV4cCI6MjA4NTAxNzM4NH0.XPWYYNaWgELlf5kgDLU8vHQjFeNGpDAOnbmlSmqktXA";

#define LOCKER_ID       "A01"
#define UNLOCK_TIME     3000

Servo lockServo;
#define SERVO_CLOSED    0
#define SERVO_OPEN      90

String inputBuffer = "";
bool lockerOpen = false;
unsigned long unlockTime = 0;

// prototipi funzioni
void connectToWiFi();
bool callLockerUnlock(String badgeCode, String& response);
void servoOpen();
void servoClose();
void requestAuthorization(String badgeCode);
void feedbackSuccess();
void feedbackDenied();

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED_GREEN, OUTPUT);
  pinMode(STATUS_LED_RED, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(STATUS_LED_GREEN, LOW);
  digitalWrite(STATUS_LED_RED, LOW);

  lockServo.attach(SERVO_PIN);
  lockServo.write(SERVO_CLOSED);

  connectToWiFi();
  Serial.print("Locker ");
  Serial.print(LOCKER_ID);
  Serial.println(" pronto");
}

void loop() {
  // chiudo il servo dopo il timeout
  if (lockerOpen && (millis() - unlockTime > UNLOCK_TIME)) {
    servoClose();
    lockerOpen = false;
    digitalWrite(STATUS_LED_GREEN, LOW);
  }

  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      inputBuffer.trim();
      if (inputBuffer.length() == 0) continue;

      String userId = inputBuffer;
      inputBuffer = "";

      Serial.print("Badge: ");
      Serial.println(userId);

      requestAuthorization(userId);

    } else {
      inputBuffer += c;
    }
  }
}

void connectToWiFi() {
  Serial.print("Connessione WiFi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);

  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 20) {
    delay(500);
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("connesso");
  } else {
    Serial.println("fallito");
  }
}

bool callLockerUnlock(String badgeCode, String& response) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Errore: WiFi non connesso");
    return false;
  }

  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/rpc/locker_unlock";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  JsonDocument doc;
  doc["p_badge_uid"] = badgeCode;
  doc["p_locker_numero"] = LOCKER_ID;
  doc["p_metodo"] = "nfc";

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);

  bool success = false;
  if (httpCode > 0) {
    response = http.getString();

    JsonDocument respDoc;
    if (!deserializeJson(respDoc, response)) {
      JsonObject resp = respDoc.as<JsonObject>();
      success = resp["success"] | false;
    }
  } else {
    Serial.print("Errore HTTP ");
    Serial.println(httpCode);
  }

  http.end();
  return success;
}

void requestAuthorization(String badgeCode) {
  String response = "";
  bool authorized = callLockerUnlock(badgeCode, response);

  if (authorized) {
    Serial.println("Autorizzato");
    Serial.println(response);
    feedbackSuccess();
    servoOpen();
    lockerOpen = true;
    unlockTime = millis();
    digitalWrite(STATUS_LED_GREEN, HIGH);
  } else {
    Serial.println("Accesso negato");
    Serial.println(response);
    feedbackDenied();
  }
}

void servoOpen() {
  lockServo.write(SERVO_OPEN);
}

void servoClose() {
  lockServo.write(SERVO_CLOSED);
}

void feedbackSuccess() {
  digitalWrite(STATUS_LED_GREEN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(800);
  digitalWrite(BUZZER_PIN, LOW);
}

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
