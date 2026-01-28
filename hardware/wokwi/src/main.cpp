/*
 * Smart Locker IoT - ESP32
 * Simulazione Wokwi (RFID simulato via Serial Monitor)
 *
 * Inserisci un UID badge nel Serial Monitor, es: 04:5A:2F:1B
 * Badge autorizzato di test: 04:5A:2F:1B
 */

#include <Arduino.h>

// Pin definitions
#define BUZZER_PIN  14
#define GREEN_LED   26
#define RED_LED     25
#define RELAY_PIN   27

// Prototipi funzioni
void handleBadgeScan(String uid);
void accessGranted();
void accessDenied();

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== Smart Locker IoT - ESP32 ===");

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("Sistema pronto!");
  Serial.println("Inserisci UID badge (es: 04:5A:2F:1B):");
}

void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input.length() == 0) return;

    Serial.println("\n--- Badge Rilevato ---");
    Serial.print("UID: ");
    Serial.println(input);

    handleBadgeScan(input);

    Serial.println("Pronto per prossimo badge...\n");
  }
}

void handleBadgeScan(String uid) {
  Serial.println("-> Verifico badge...");

  if (uid == "04:5A:2F:1B" || uid == "04:5A:2F:1B:3C:6D:80") {
    Serial.println("Utente riconosciuto: Mario Rossi");
    Serial.println("Armadietto assegnato: A01");
    accessGranted();
  } else {
    Serial.println("Badge non riconosciuto!");
    accessDenied();
  }
}

void accessGranted() {
  Serial.println("-> Sblocco armadietto...");

  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RELAY_PIN, HIGH);

  delay(3000);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("Armadietto sbloccato!");
}

void accessDenied() {
  Serial.println("Accesso negato!");

  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(RED_LED, HIGH);

  delay(2000);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RED_LED, LOW);
}
