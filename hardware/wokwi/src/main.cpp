/*
 * Smart Locker IoT - ESP32
 * Simulazione Wokwi (RFID simulato via Serial Monitor)
 *
 * Lettore badge all'ingresso/uscita dell'edificio.
 * - Prima passata badge = INGRESSO: assegna armadietto libero
 * - Seconda passata badge = USCITA: rilascia armadietto
 *
 * Badge di test:
 *   04:5A:2F:1B       -> Mario Rossi (studente)
 *   04:5A:2F:1B:3C:6D:80 -> Mario Rossi (alternativo)
 *   01:AB:CD:EF       -> Paolo Bianchi (studente)
 */

#include <Arduino.h>

// --- Pin definitions ---
#define BUZZER_PIN  14
#define GREEN_LED   26
#define RED_LED     25
#define RELAY_PIN   27

// --- Configurazione ---
#define MAX_USERS   10
#define MAX_LOCKERS 5

// --- Strutture dati ---
struct User {
  String badge_uid;
  String badge_uid_alt;  // UID alternativo (7 byte)
  String nome;
  bool   attivo;
};

struct Locker {
  String numero;
  bool   occupato;
  int    user_index;  // -1 = libero
};

struct Sessione {
  bool   dentro;          // utente dentro l'edificio?
  String locker_numero;   // armadietto assegnato
};

// --- Dati simulati (come da DB) ---
User users[] = {
  { "04:5A:2F:1B", "1", "Mario Rossi",   true },  // "1" = shortcut test
  { "01:AB:CD:EF", "2", "Paolo Bianchi", true },   // "2" = shortcut test
};
const int NUM_USERS = sizeof(users) / sizeof(users[0]);

Locker lockers[] = {
  { "A01", false, -1 },
  { "A02", false, -1 },
  { "A03", false, -1 },
  { "A04", false, -1 },
  { "A05", false, -1 },
};
const int NUM_LOCKERS = sizeof(lockers) / sizeof(lockers[0]);

Sessione sessioni[MAX_USERS];  // stato per ogni utente
String inputBuffer = "";       // buffer input seriale

// --- Prototipi ---
int  findUser(String uid);
int  assignLocker(int user_idx);
void releaseLocker(int user_idx);
void feedbackIngresso();
void feedbackUscita();
void feedbackErrore();
void printStatoLockers();

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

  // Inizializza sessioni
  for (int i = 0; i < MAX_USERS; i++) {
    sessioni[i].dentro = false;
    sessioni[i].locker_numero = "";
  }

  Serial.println("\n=== Smart Locker IoT - Controllo Accessi ===");
  Serial.println("Lettore badge ingresso/uscita edificio");
  Serial.println("Sistema pronto!\n");
  printStatoLockers();
  Serial.println("\nInserisci UID badge (es: 04:5A:2F:1B):");
}

// ===========================================================
void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      inputBuffer.trim();
      if (inputBuffer.length() == 0) {
        inputBuffer = "";
        continue;
      }
      String input = inputBuffer;
      inputBuffer = "";

      Serial.println("\n--- Badge Rilevato ---");
      Serial.print("UID: ");
      Serial.println(input);

    // Cerca utente
    int user_idx = findUser(input);
    if (user_idx < 0) {
      Serial.println("Badge non riconosciuto!");
      feedbackErrore();
      Serial.println("\nInserisci UID badge:");
      return;
    }

    Serial.print("Utente: ");
    Serial.println(users[user_idx].nome);

    if (!sessioni[user_idx].dentro) {
      // ========== INGRESSO (check-in) ==========
      Serial.println("-> Registrazione INGRESSO...");

      int locker_idx = assignLocker(user_idx);
      if (locker_idx < 0) {
        Serial.println("ERRORE: Nessun armadietto disponibile!");
        feedbackErrore();
      } else {
        sessioni[user_idx].dentro = true;
        sessioni[user_idx].locker_numero = lockers[locker_idx].numero;

        Serial.print("Armadietto assegnato: ");
        Serial.println(lockers[locker_idx].numero);
        Serial.println("INGRESSO registrato!");
        feedbackIngresso();
      }
    } else {
      // ========== USCITA (check-out) ==========
      Serial.println("-> Registrazione USCITA...");
      Serial.print("Armadietto rilasciato: ");
      Serial.println(sessioni[user_idx].locker_numero);

      releaseLocker(user_idx);
      sessioni[user_idx].dentro = false;
      sessioni[user_idx].locker_numero = "";

      Serial.println("USCITA registrata. Arrivederci!");
      feedbackUscita();
    }

    Serial.println();
    printStatoLockers();
    Serial.println("\nInserisci UID badge:");
    } else {
      inputBuffer += c;
    }
  }
}

// ===========================================================
// Trova utente dal badge UID, ritorna indice o -1
int findUser(String uid) {
  for (int i = 0; i < NUM_USERS; i++) {
    if (!users[i].attivo) continue;
    if (uid == users[i].badge_uid || uid == users[i].badge_uid_alt) {
      return i;
    }
  }
  return -1;
}

// Assegna primo armadietto libero, ritorna indice o -1
int assignLocker(int user_idx) {
  for (int i = 0; i < NUM_LOCKERS; i++) {
    if (!lockers[i].occupato) {
      lockers[i].occupato = true;
      lockers[i].user_index = user_idx;
      return i;
    }
  }
  return -1;
}

// Rilascia armadietto dell'utente
void releaseLocker(int user_idx) {
  for (int i = 0; i < NUM_LOCKERS; i++) {
    if (lockers[i].user_index == user_idx) {
      lockers[i].occupato = false;
      lockers[i].user_index = -1;
      return;
    }
  }
}

// --- Feedback hardware ---

void feedbackIngresso() {
  // Beep breve + LED verde
  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(GREEN_LED, HIGH);
  delay(1500);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);
}

void feedbackUscita() {
  // Doppio beep + LED verde
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

void feedbackErrore() {
  // Beep lungo + LED rosso
  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(RED_LED, HIGH);
  delay(2000);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RED_LED, LOW);
}

// Stampa stato armadietti
void printStatoLockers() {
  Serial.println("--- Stato Armadietti ---");
  for (int i = 0; i < NUM_LOCKERS; i++) {
    Serial.print("  ");
    Serial.print(lockers[i].numero);
    Serial.print(": ");
    if (lockers[i].occupato) {
      Serial.print("OCCUPATO (");
      Serial.print(users[lockers[i].user_index].nome);
      Serial.println(")");
    } else {
      Serial.println("LIBERO");
    }
  }
}
