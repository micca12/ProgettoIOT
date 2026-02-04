/*
 * Smart Locker IoT - ESP32
 * Simulazione Wokwi con connessione WiFi a Supabase
 *
 * Il badge si simula digitando l'UID nel Serial Monitor.
 * L'ESP32 chiama la funzione badge_access() su Supabase che:
 *   - Identifica l'utente dal badge_uid
 *   - Se non ha locker -> checkin (assegna locker)
 *   - Se ha locker -> checkout (rilascia locker)
 *
 * WiFi: Wokwi-GUEST (access point virtuale Wokwi, no password)
 *
 * Badge di test (devono corrispondere a users.badge_uid su Supabase):
 *   04:5A:2F:1B  -> utente di test
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Pin definitions ---
#define BUZZER_PIN  14
#define GREEN_LED   26
#define RED_LED     25
#define RELAY_PIN   27

// --- WiFi Wokwi ---
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// --- Supabase ---
const char* SUPABASE_URL = "https://pwvbgiwzatwotdqmvilc.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dmJnaXd6YXR3b3RkcW12aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDEzODQsImV4cCI6MjA4NTAxNzM4NH0.XPWYYNaWgELlf5kgDLU8vHQjFeNGpDAOnbmlSmqktXA";

// --- Buffer seriale ---
String inputBuffer = "";

// --- Prototipi ---
void connectWiFi();
void handleBadge(String uid);
String callBadgeAccess(String badge_uid);
void feedbackCheckin(const char* locker);
void feedbackCheckout(const char* locker);
void feedbackErrore(const char* msg);

// ===========================================================
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

  Serial.println("\n=== Smart Locker IoT - Controllo Accessi ===");
  Serial.println("Connessione a Supabase via WiFi...\n");

  connectWiFi();

  Serial.println("\nSistema pronto!");
  Serial.println("Inserisci UID badge (es: 04:5A:2F:1B):");
}

// ===========================================================
void loop() {
  // Riconnetti WiFi se perso
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnesso, riconnessione...");
    connectWiFi();
  }

  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      inputBuffer.trim();
      if (inputBuffer.length() == 0) {
        inputBuffer = "";
        continue;
      }

      String uid = inputBuffer;
      inputBuffer = "";

      handleBadge(uid);

      Serial.println("\nInserisci UID badge:");
    } else {
      inputBuffer += c;
    }
  }
}

// ===========================================================
void connectWiFi() {
  Serial.print("Connessione a WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);  // canale 6 per Wokwi (piu' veloce)

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" FALLITO!");
    Serial.println("Impossibile connettersi. Riprova...");
  }
}

// ===========================================================
void handleBadge(String uid) {
  Serial.println("\n--- Badge Rilevato ---");
  Serial.print("UID: ");
  Serial.println(uid);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ERRORE: WiFi non connesso!");
    feedbackErrore("WiFi non connesso");
    return;
  }

  Serial.println("Invio richiesta a Supabase...");
  String response = callBadgeAccess(uid);

  if (response.length() == 0) {
    feedbackErrore("Nessuna risposta dal server");
    return;
  }

  // Parse JSON response
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, response);

  if (err) {
    Serial.print("Errore parsing JSON: ");
    Serial.println(err.c_str());
    feedbackErrore("Errore risposta server");
    return;
  }

  bool success = doc["success"] | false;

  if (!success) {
    const char* errMsg = doc["error"] | "Errore sconosciuto";
    Serial.print("NEGATO: ");
    Serial.println(errMsg);
    feedbackErrore(errMsg);
    return;
  }

  // Successo
  const char* azione = doc["azione"] | "unknown";
  const char* utente = doc["utente"] | "?";
  const char* messaggio = doc["messaggio"] | "";

  Serial.print("Utente: ");
  Serial.println(utente);
  Serial.print("Azione: ");
  Serial.println(azione);
  Serial.println(messaggio);

  if (strcmp(azione, "checkin") == 0) {
    const char* locker = doc["locker_assegnato"] | "?";
    Serial.print("Armadietto assegnato: ");
    Serial.println(locker);
    feedbackCheckin(locker);
  } else if (strcmp(azione, "checkout") == 0) {
    const char* locker = doc["locker_rilasciato"] | "?";
    Serial.print("Armadietto rilasciato: ");
    Serial.println(locker);
    feedbackCheckout(locker);
  }
}

// ===========================================================
String callBadgeAccess(String badge_uid) {
  HTTPClient http;

  String url = String(SUPABASE_URL) + "/rest/v1/rpc/badge_access";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  // Payload
  JsonDocument doc;
  doc["p_badge_uid"] = badge_uid;
  doc["p_metodo"] = "badge";

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  String response = "";

  if (httpCode > 0) {
    response = http.getString();
    Serial.print("HTTP ");
    Serial.print(httpCode);
    Serial.print(": ");
    Serial.println(response);
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpCode);
  }

  http.end();
  return response;
}

// --- Feedback hardware ---

void feedbackCheckin(const char* locker) {
  // Beep + LED verde + relay (simula apertura)
  Serial.print(">>> INGRESSO - Locker ");
  Serial.print(locker);
  Serial.println(" <<<");

  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RELAY_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(1500);
  digitalWrite(BUZZER_PIN, LOW);
  delay(1500);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
}

void feedbackCheckout(const char* locker) {
  // Doppio beep + LED verde
  Serial.print(">>> USCITA - Locker ");
  Serial.print(locker);
  Serial.println(" rilasciato <<<");

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
  Serial.print(">>> ERRORE: ");
  Serial.print(msg);
  Serial.println(" <<<");

  digitalWrite(RED_LED, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(2000);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RED_LED, LOW);
}
