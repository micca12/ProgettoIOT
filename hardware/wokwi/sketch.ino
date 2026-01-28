/*
 * Smart Locker IoT - ESP32
 * Simulazione Wokwi (RFID simulato via Serial Monitor)
 *
 * Inserisci un UID badge nel Serial Monitor, es: 04:5A:2F:1B
 * Badge autorizzato di test: 04:5A:2F:1B
 */

#define GREEN_LED 26
#define RED_LED   25

void setup() {
  Serial.begin(115200);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);

  Serial.println("=== Smart Locker IoT - ESP32 ===");
  Serial.println("Inserisci UID badge (es: 04:5A:2F:1B):");
}

void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input.length() == 0) return;

    Serial.print("Badge UID: ");
    Serial.println(input);

    if (input == "04:5A:2F:1B") {
      Serial.println("Accesso OK - Mario Rossi - Locker A01");
      digitalWrite(GREEN_LED, HIGH);
      delay(3000);
      digitalWrite(GREEN_LED, LOW);
    } else {
      Serial.println("Accesso NEGATO");
      digitalWrite(RED_LED, HIGH);
      delay(2000);
      digitalWrite(RED_LED, LOW);
    }

    Serial.println("Pronto...");
  }
}
