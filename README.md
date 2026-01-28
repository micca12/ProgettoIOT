# Smart Locker IoT - Sistema di Gestione Armadietti Intelligenti

**Università:** [Nome Università]
**Corso:** Laboratorio di Sistemi Embedded e IoT
**Anno Accademico:** 2024/2025
**Progetto:** Sistema avanzato di gestione armadietti con IoT

---

## 📋 Descrizione Generale del Progetto

Sistema IoT completo per la gestione intelligente di armadietti in strutture pubbliche (palestre, università, centri sportivi, coworking spaces) con le seguenti caratteristiche principali:

### Obiettivi del Sistema
- **Assegnazione automatica** degli armadietti disponibili al check-in
- **Accesso multi-modalità** per massima flessibilità (Badge RFID, NFC smartphone, QR Code)
- **Tracking real-time** dello stato di occupazione
- **Sicurezza avanzata** con autenticazione, autorizzazione e audit completo
- **Dashboard amministratore** per gestione e monitoraggio centralizzato
- **Scalabilità** per gestire da 5 a 500+ armadietti
- **Simulazione hardware completa** con Wokwi per test senza hardware fisico

### Contesto e Motivazione

In molte strutture pubbliche (palestre, università, piscine), la gestione degli armadietti è ancora manuale con chiavi fisiche o lucchetti personali, creando problemi di:
- **Perdita chiavi** e costi di sostituzione
- **Armadietti dimenticati occupati** per giorni
- **Impossibilità di tracciare** utilizzo e statistiche
- **Mancanza di sicurezza** (lucchetti facilmente forzabili)
- **Gestione inefficiente** per gli amministratori

Questo progetto risolve tutti questi problemi con un sistema IoT moderno, sicuro e scalabile.

---

## 🎯 Stack Tecnologico Completo

### Frontend (React PWA)
```yaml
Framework: React 18.x
Build Tool: Vite 5.x
Linguaggio: JavaScript ES6+ (opzionale TypeScript)
UI Library:
  - Material-UI (MUI) per componenti base
  - TailwindCSS per styling personalizzato
Librerie Chiave:
  - axios: Chiamate HTTP al backend
  - react-router-dom: Routing SPA
  - Web NFC API: Lettura NFC nativa browser (Android)
  - html5-qrcode: Scanner QR Code con camera
  - @supabase/supabase-js: Client Supabase
  - react-query: Cache e state management server
  - zustand: State management globale client
  - framer-motion: Animazioni
  - date-fns: Gestione date
  - react-hot-toast: Notifiche toast
PWA:
  - Vite PWA Plugin: Generazione service worker
  - Workbox: Strategia cache offline
Testing:
  - Vitest: Unit tests
  - React Testing Library: Component tests
  - Playwright: E2E tests (opzionale)
Hosting:
  - Netlify (consigliato)
  - Vercel
  - Cloudflare Pages
```

### Backend / Database (Supabase)
```yaml
Piattaforma: Supabase (PostgreSQL 15+)
Architettura: Backend-as-a-Service (BaaS)

Componenti Supabase:
  Database:
    - PostgreSQL 15 con estensioni PostGIS, pgcrypto
    - Row Level Security (RLS) per sicurezza
    - Stored Functions per business logic
    - Triggers per automazioni
    - Indexes ottimizzati

  Autenticazione:
    - Supabase Auth (JWT-based)
    - Email/password login
    - Magic links (opzionale)
    - OAuth providers (Google, GitHub) (opzionale)

  Storage:
    - Supabase Storage per file/immagini
    - Bucket: avatar utenti, QR codes generati, log export

  Realtime:
    - WebSocket per aggiornamenti live
    - Broadcast per notifiche admin
    - Presence per tracking utenti online

  Edge Functions (opzionale):
    - Deno runtime
    - Per logica custom (report, webhook, cron jobs)

Alternative considerate (e perché scartate):
  - Node.js + Express: Più lavoro setup, no realtime integrato
  - Firebase: Più costoso, meno flessibilità SQL
  - AWS Amplify: Complessità configurazione, curva apprendimento alta
```

### Hardware (Simulato + Opzionale Reale)
```yaml
Simulazione:
  IDE: Visual Studio Code + Wokwi Extension
  Piattaforma: Wokwi Simulator (gratuito)
  Framework: PlatformIO (alternativa Arduino IDE)

Microcontrollore:
  Modello: ESP32 DevKit V1
  Specifiche:
    - CPU: Dual-core Xtensa 32-bit LX6 @ 240MHz
    - RAM: 520 KB SRAM
    - Flash: 4 MB
    - WiFi: 802.11 b/g/n (2.4 GHz)
    - Bluetooth: BLE 4.2
    - GPIO: 34 pin programmabili
    - Alimentazione: 5V via USB o 3.3V regolato

Componenti Elettronici:
  RFID Reader:
    - Modello: MFRC522
    - Frequenza: 13.56 MHz
    - Protocollo: SPI
    - Range: 4-7 cm
    - TAG supportati: MIFARE Classic, NTAG21x

  Relay Module:
    - Tipo: 2-channel relay module (5V)
    - Corrente: 10A @ 250VAC / 30VDC
    - Controllo: LOW/HIGH trigger
    - Isolamento: Optocoupler

  LED Indicators:
    - LED verde: Status OK
    - LED rosso: Errore
    - LED blu: Connessione WiFi (opzionale)

  Display (opzionale):
    - OLED 128x64 I2C
    - Per mostrare armadietto assegnato

Librerie ESP32:
  - MFRC522: Gestione RFID reader
  - WiFi.h: Connessione WiFi
  - HTTPClient: Chiamate REST API
  - ArduinoJson: Parsing JSON
  - PubSubClient: Client MQTT (opzionale)
  - WebSocketsClient: Client WebSocket (opzionale)

Comunicazione:
  Primaria: HTTP/REST → Supabase REST API
  Alternativa: MQTT → Broker Mosquitto (per scalabilità)
  Opzionale: WebSocket → Supabase Realtime per comandi push
```

### Materiale Fisico (per implementazione reale)
```yaml
TAG NFC Passivi:
  Modello: NTAG215 / NTAG216
  Specifiche:
    - Memoria: 504 bytes (NTAG215), 888 bytes (NTAG216)
    - Compatibilità: ISO/IEC 14443 Type A
    - Lettura: NFC-enabled smartphones
    - Durata: 100.000+ scansioni
    - Formato: Sticker adesivo Ø25mm
  Quantità: 7 (1 ingresso + 5 armadietti + 1 uscita)
  Costo: €0.15-0.25 cad. → Totale €1.40
  Fornitore: Amazon, AliExpress, RS Components

QR Codes:
  Generazione: qrcode.js library
  Formato: PNG 300x300px, alta correzione errori (Level H)
  Contenuto: JSON string con ID univoco
  Stampa: Laser printer su carta adesiva
  Costo: Gratis (1 foglio A4)

Badge RFID (opzionale):
  Tipo: MIFARE Classic 1K
  Formato: Card ISO 85.6 x 54 mm (carta credito)
  UID: 4 bytes univoco
  Costo: €0.50 cad.

ESP32 + Componenti (se hardware reale):
  - ESP32 DevKit: €6-8
  - MFRC522: €2-3
  - Relay 2-channel: €3-4
  - LED + resistenze: €1
  - Breadboard + cavi: €5
  - Alimentatore 5V 2A: €5
  Totale hardware reale: ~€25-30
```

---

## 🏗️ Architettura Sistema Completa

### Architettura High-Level

```
┌─────────────────────────────────────────────────────────────────────┐
│                          UTENTI FINALI                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │  Studente/Utente │    │  Studente/Utente │    │ Amministratore│  │
│  │   (Smartphone)   │    │   (Smartphone)   │    │   (Desktop)   │  │
│  │                  │    │                  │    │               │  │
│  │  Android + NFC   │    │   iOS + QR       │    │  Dashboard    │  │
│  └────────┬─────────┘    └────────┬─────────┘    └───────┬───────┘  │
│           │                       │                      │           │
└───────────┼───────────────────────┼──────────────────────┼───────────┘
            │                       │                      │
            │         HTTPS/WSS     │                      │
            ▼                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (React PWA)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  React SPA (Single Page Application)                       │    │
│  │  ├─ Components: NFCScanner, QRScanner, Dashboard, Admin   │    │
│  │  ├─ Hooks: useNFC, useQRScanner, useSupabase              │    │
│  │  ├─ Services: lockersService, authService, adminService   │    │
│  │  ├─ State: Zustand (global) + React Query (server cache) │    │
│  │  └─ PWA: Service Worker + Cache API (offline support)     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Hosting: Netlify CDN (Global)                                      │
│  URL: https://smart-lockers-app.netlify.app                         │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ REST API (HTTPS)
                               │ + WebSocket (Realtime)
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                    BACKEND LAYER (Supabase)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Supabase REST API                                         │    │
│  │  ├─ Endpoint: /rest/v1/                                    │    │
│  │  ├─ Authentication: JWT Bearer token                       │    │
│  │  ├─ Rate Limiting: 100 req/sec (free tier)                │    │
│  │  └─ CORS: Configurato per frontend origin                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Supabase Auth                                             │    │
│  │  ├─ JWT Token (HS256)                                      │    │
│  │  ├─ Refresh Token (30 giorni)                             │    │
│  │  ├─ Password Hash: bcrypt (10 rounds)                     │    │
│  │  └─ Session Management                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Supabase Realtime (WebSocket)                             │    │
│  │  ├─ Protocol: WebSocket over HTTPS (WSS)                  │    │
│  │  ├─ Channels: postgres_changes, broadcast, presence       │    │
│  │  ├─ Latency: ~50-200ms                                     │    │
│  │  └─ Use Case: Live updates dashboard admin                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL 15 Database                                    │    │
│  │  ├─ Tables: users, lockers, special_tags, access_logs     │    │
│  │  ├─ Functions: identify_code, checkin_user, unlock_locker │    │
│  │  ├─ Triggers: updated_at auto-update                      │    │
│  │  ├─ RLS Policies: User isolation, admin full access       │    │
│  │  └─ Indexes: Optimized for queries                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Region: EU-West-1 (Ireland) - Per GDPR compliance                  │
│  Backup: Automatico giornaliero (Point-in-Time Recovery)            │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ HTTP/REST
                               │ (opzionale: MQTT o WebSocket)
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                    HARDWARE LAYER (IoT Devices)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │  ESP32 Ingresso  │    │  ESP32 Armadietto│    │ ESP32 Uscita │  │
│  │                  │    │                  │    │              │  │
│  │  + MFRC522 RFID  │    │  + Relay Module  │    │ + MFRC522    │  │
│  │  + LED Status    │    │  + LED Status    │    │ + LED Status │  │
│  │  + WiFi          │    │  + WiFi          │    │ + WiFi       │  │
│  └──────────────────┘    └──────────────────┘    └──────────────┘  │
│                                                                      │
│  Protocollo: HTTP/REST polling ogni 2-5 secondi                     │
│  Alternativa: MQTT pub/sub per efficienza (opzionale)               │
│  Simulazione: Wokwi (VS Code Extension)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Flusso Dati End-to-End

#### 1. Scenario: Check-in con Badge RFID

```
[1] UTENTE passa badge RFID al lettore ingresso
        ↓
[2] ESP32 Ingresso
    - MFRC522 legge UID badge: "04:5A:2F:1B:3C:6D:80"
    - getCardUID() converte byte[] → String esadecimale
        ↓
[3] ESP32 → Supabase REST API
    POST https://xxx.supabase.co/rest/v1/rpc/identify_code
    Headers:
      - apikey: [SUPABASE_ANON_KEY]
      - Content-Type: application/json
    Body:
      { "p_code": "04:5A:2F:1B:3C:6D:80" }

    Timeout: 5 secondi
    Retry: 3 tentativi con backoff esponenziale
        ↓
[4] Supabase REST API → PostgreSQL
    - Autenticazione: Valida anon key
    - Routing: Chiama function identify_code()
        ↓
[5] PostgreSQL Function: identify_code()
    BEGIN
      -- Query su special_tags
      SELECT tipo, id, posizione
      FROM special_tags
      WHERE badge_uid = '04:5A:2F:1B:3C:6D:80' AND attivo = true;

      -- Risultato: tipo='ingresso', id=1, posizione='Ingresso principale'

      RETURN json_build_object(
        'tipo', 'ingresso',
        'id', 1,
        'posizione', 'Ingresso principale'
      );
    END
        ↓
[6] Supabase → ESP32
    Response (200 OK):
    {
      "tipo": "ingresso",
      "id": 1,
      "posizione": "Ingresso principale"
    }
        ↓
[7] ESP32 Ingresso
    - Deserializza JSON con ArduinoJson
    - IF tipo == "ingresso":
        - Accende LED verde per 2 secondi (feedback visivo)
        - Serial.println("✓ Badge ingresso rilevato")
        - Opzionale: Display OLED mostra "Badge riconosciuto"
        ↓
[8] ESP32 → Supabase REST API (Check-in completo)
    POST https://xxx.supabase.co/rest/v1/rpc/checkin_user
    Body:
      {
        "p_user_id": null,  // Oppure ottenuto da database badge mapping
        "p_code": "04:5A:2F:1B:3C:6D:80",
        "p_metodo": "badge"
      }

    NOTA: Se p_user_id è null, la function deve fare lookup:
          SELECT id FROM users WHERE badge_uid = p_code
        ↓
[9] PostgreSQL Function: checkin_user()
    BEGIN TRANSACTION;

      -- 1. Verifica TAG ingresso (già fatto in identify_code)
      -- 2. Lookup user_id da badge_uid
      SELECT id INTO v_user_id FROM users WHERE badge_uid = p_code;
      IF NOT FOUND THEN RAISE EXCEPTION 'Badge non associato a utente'; END IF;

      -- 3. Verifica utente non ha già armadietto
      SELECT * FROM lockers WHERE user_id = v_user_id AND stato = 'occupato';
      IF FOUND THEN RAISE EXCEPTION 'Utente ha già armadietto assegnato'; END IF;

      -- 4. Trova armadietto libero con row-level lock
      SELECT * FROM lockers
      WHERE stato = 'libero'
      ORDER BY numero ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED;  -- Previene race conditions

      -- Risultato: id=1, numero='A01', ...

      -- 5. Assegna armadietto
      UPDATE lockers
      SET stato = 'occupato',
          user_id = v_user_id,
          timestamp_assegnazione = NOW()
      WHERE id = 1;

      -- 6. Log azione
      INSERT INTO access_logs (
        user_id, azione, metodo, code_scanned,
        locker_numero, success, ip_address
      ) VALUES (
        v_user_id, 'checkin', 'badge', p_code,
        'A01', true, inet_client_addr()
      );

      -- 7. Return risultato
      RETURN json_build_object(
        'success', true,
        'locker_assigned', 'A01',
        'locker_nfc_uid', '11:22:33:44:55:66:77',
        'locker_qr_code', 'LOCKER_A01_xyz789',
        'message', 'Armadietto A01 assegnato!'
      );

    COMMIT;
        ↓
[10] Supabase → ESP32
     Response (200 OK):
     {
       "success": true,
       "locker_assigned": "A01",
       "message": "Armadietto A01 assegnato!"
     }
        ↓
[11] ESP32 Ingresso
     - Display OLED mostra: "ARMADIETTO A01"
     - Accende LED verde per 5 secondi
     - Beep sonoro (opzionale)
     - Serial.println("Armadietto A01 assegnato a utente")
        ↓
[12] Notifica Realtime (opzionale)
     - Supabase Realtime broadcast a tutti i client admin connessi
     - Dashboard admin aggiorna griglia armadietti in tempo reale
       (A01 passa da verde → rosso "occupato")
```

**Tempo totale stimato:** 800ms - 1.5s
**Punti critici:**
- Latenza WiFi ESP32 (200-500ms)
- Query database (50-100ms)
- Possibile race condition su assegnazione → risolto con `FOR UPDATE SKIP LOCKED`

---

#### 2. Scenario: Apertura Armadietto con NFC Smartphone

```
[1] UTENTE apre React Web App su smartphone Android
        ↓
[2] React Component: Dashboard.jsx
    - useEffect() al mount:
        - Chiama lockersService.getCurrentLocker(user.id)
        - Verifica se ha armadietto assegnato
        ↓
[3] Supabase REST API
    GET /rest/v1/lockers?user_id=eq.{user.id}&stato=eq.occupato
    Headers:
      - Authorization: Bearer {JWT_TOKEN}
      - apikey: {SUPABASE_ANON_KEY}
        ↓
[4] PostgreSQL + RLS
    - RLS Policy verifica: auth.uid() = user_id (passa ✓)
    - Query: SELECT * FROM lockers WHERE user_id = ... AND stato = 'occupato'
    - Risultato: { numero: 'A01', nfc_tag_uid: '11:22:33:44:55:66:77', ... }
        ↓
[5] React State Update
    - useState → setCurrentLocker({ numero: 'A01', ... })
    - UI mostra card armadietto:
        "Il tuo armadietto: A01"
        [Pulsante: Apri Armadietto]
        ↓
[6] UTENTE clicca "Apri Armadietto" e avvicina telefono a TAG NFC su armadietto A01
        ↓
[7] React Component: NFCScanner.jsx
    - onClick() handler:
        const { scanNFC } = useNFC();
        const result = await scanNFC();

    - Hook useNFC.js:
        const scanNFC = async () => {
          if (!('NDEFReader' in window)) {
            throw new Error('NFC non supportato');
          }

          const ndef = new NDEFReader();
          await ndef.scan();  // Richiede permesso utente

          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout: avvicina TAG NFC'));
            }, 10000);

            ndef.onreading = (event) => {
              clearTimeout(timeout);

              // Converti UID da Uint8Array a stringa esadecimale
              const uid = Array.from(new Uint8Array(event.serialNumber))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(':')
                .toUpperCase();

              resolve({ uid, timestamp: new Date().toISOString() });
            };

            ndef.onreadingerror = () => {
              clearTimeout(timeout);
              reject(new Error('Errore lettura NFC'));
            };
          });
        };
        ↓
[8] Web NFC API (Browser)
    - Browser richiede permesso "nfc" all'utente
    - Dialog: "smart-lockers-app.netlify.app vuole accedere a NFC. Consenti?"
    - Utente clicca "Consenti"
    - Browser attiva antenna NFC del telefono
    - Attesa TAG NFC...
        ↓
[9] UTENTE avvicina telefono a TAG NFC
    - Distanza: < 4 cm
    - TAG NFC (passivo) viene alimentato dal campo elettromagnetico del telefono
    - TAG risponde con UID: 11:22:33:44:55:66:77
        ↓
[10] Web NFC API → React
     - Event 'onreading' scatta
     - event.serialNumber = Uint8Array[0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]
     - Conversione → "11:22:33:44:55:66:77"
     - Promise resolve({ uid: "11:22:33:44:55:66:77", timestamp: "2025-01-26T..." })
        ↓
[11] React Component
     - result = { uid: "11:22:33:44:55:66:77", ... }
     - Chiama lockersService.unlockLocker(result.uid, 'nfc')
        ↓
[12] lockersService.js
     async function unlockLocker(code, metodo) {
       try {
         // Loading state
         setIsUnlocking(true);

         // Chiamata Supabase
         const { data, error } = await supabase.rpc('unlock_locker', {
           p_user_id: auth.user.id,
           p_code: code,
           p_metodo: metodo
         });

         if (error) throw error;

         // Success
         toast.success(data.message);
         navigator.vibrate(200);  // Haptic feedback

         return data;
       } catch (err) {
         toast.error(err.message);
         throw err;
       } finally {
         setIsUnlocking(false);
       }
     }
        ↓
[13] Supabase REST API
     POST https://xxx.supabase.co/rest/v1/rpc/unlock_locker
     Headers:
       - Authorization: Bearer {JWT_TOKEN}  (contiene user_id)
       - apikey: {SUPABASE_ANON_KEY}
       - Content-Type: application/json
     Body:
       {
         "p_user_id": "550e8400-e29b-41d4-a716-446655440000",
         "p_code": "11:22:33:44:55:66:77",
         "p_metodo": "nfc"
       }
        ↓
[14] PostgreSQL Function: unlock_locker()
     BEGIN TRANSACTION;

       -- 1. Trova armadietto dal TAG NFC
       SELECT * INTO v_locker
       FROM lockers
       WHERE nfc_tag_uid = '11:22:33:44:55:66:77';

       -- Risultato: id=1, numero='A01', stato='occupato', user_id='550e...'

       -- 2. Verifica stato
       IF v_locker.stato = 'manutenzione' THEN
         RAISE EXCEPTION 'Armadietto in manutenzione';
       END IF;

       IF v_locker.stato = 'libero' THEN
         RAISE EXCEPTION 'Armadietto non assegnato';
       END IF;

       -- 3. SECURITY CHECK: Verifica proprietà
       IF v_locker.user_id != p_user_id THEN
         -- Log tentativo non autorizzato
         INSERT INTO access_logs (..., success=false, error_message='Non autorizzato');
         RAISE EXCEPTION 'Accesso negato! Armadietto non è tuo.';
       END IF;

       -- 4. Update timestamp ultimo accesso
       UPDATE lockers
       SET timestamp_ultimo_accesso = NOW()
       WHERE id = v_locker.id;

       -- 5. Log successo
       INSERT INTO access_logs (
         user_id, azione, metodo, code_scanned,
         locker_numero, success, ip_address
       ) VALUES (
         p_user_id, 'unlock', 'nfc', p_code,
         v_locker.numero, true, inet_client_addr()
       );

       -- 6. Notifica hardware (opzionale)
       PERFORM pg_notify('locker_unlock',
         json_build_object(
           'locker', v_locker.numero,
           'action', 'unlock',
           'timestamp', NOW()
         )::text
       );

       -- 7. Return
       RETURN json_build_object(
         'success', true,
         'locker', v_locker.numero,
         'message', 'Armadietto ' || v_locker.numero || ' sbloccato!'
       );

     COMMIT;
        ↓
[15] Supabase → React
     Response (200 OK):
     {
       "success": true,
       "locker": "A01",
       "message": "Armadietto A01 sbloccato!"
     }
        ↓
[16] React UI Update
     - toast.success("Armadietto A01 sbloccato!")  → Toast verde top-right
     - navigator.vibrate(200)  → Vibrazione 200ms
     - Animazione: Icona lucchetto aperto con framer-motion
     - Audio feedback: Beep (opzionale)
        ↓
[17] PostgreSQL Notify → ESP32 Armadietto A01 (opzionale)
     - pg_notify('locker_unlock', '{"locker":"A01","action":"unlock"}')
     - ESP32 sottoscritto al canale (via WebSocket o polling HTTP)
     - ESP32 riceve comando:
         digitalWrite(RELAY_A01, HIGH);  // Attiva relay
         delay(5000);  // Aperto per 5 secondi
         digitalWrite(RELAY_A01, LOW);   // Chiude relay
         digitalWrite(LED_STATUS, HIGH); // LED verde ON
         delay(2000);
         digitalWrite(LED_STATUS, LOW);  // LED verde OFF
        ↓
[18] UTENTE apre armadietto fisicamente
     - Serratura elettrica sbloccata per 5 secondi
     - LED verde acceso sull'armadietto (feedback visivo)
     - Utente apre porta, prende/mette oggetti, chiude porta
```

**Tempo totale:** ~500ms - 1.2s (senza delay hardware)
**Latenza breakdown:**
- NFC scan: 100-300ms
- HTTP request: 100-200ms
- Database query: 50-100ms
- HTTP response: 50-100ms
- UI update: 16-32ms (1-2 frame @ 60fps)

---

## 🗄️ Database: Schema Dettagliato

### Tabella: `users`

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dati Personali
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL CHECK (char_length(nome) >= 2),
  cognome TEXT NOT NULL CHECK (char_length(cognome) >= 2),
  telefono TEXT CHECK (telefono ~ '^\+?[0-9]{10,15}$'),  -- Regex validazione

  -- Dati Sistema
  badge_uid TEXT UNIQUE,  -- UID badge RFID fisico (opzionale, 8-20 char hex)
  tipo TEXT DEFAULT 'studente' CHECK (tipo IN ('studente', 'admin')),
  attivo BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,

  -- Vincoli aggiuntivi
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indici per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_badge_uid ON users(badge_uid) WHERE badge_uid IS NOT NULL;
CREATE INDEX idx_users_tipo ON users(tipo);
CREATE INDEX idx_users_attivo ON users(attivo) WHERE attivo = true;

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Commenti documentazione
COMMENT ON TABLE users IS 'Utenti del sistema (studenti e amministratori)';
COMMENT ON COLUMN users.badge_uid IS 'UID badge RFID fisico. Opzionale, usato solo se si abilita accesso tramite badge.';
COMMENT ON COLUMN users.tipo IS 'Ruolo utente. studente = accesso base, admin = accesso completo dashboard';
```

**Dati esempio:**
```sql
INSERT INTO users (email, nome, cognome, telefono, badge_uid, tipo) VALUES
('mario.rossi@university.it', 'Mario', 'Rossi', '+393401234567', '04:5A:2F:1B:3C:6D:80', 'studente'),
('lucia.verdi@university.it', 'Lucia', 'Verdi', '+393407654321', NULL, 'admin'),
('paolo.bianchi@university.it', 'Paolo', 'Bianchi', '+393409876543', '04:7F:3C:2D:5E:8A:92', 'studente');
```

---

### Tabella: `lockers`

```sql
CREATE TABLE lockers (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Identificazione Armadietto
  numero TEXT UNIQUE NOT NULL,  -- Es: "A01", "B15", "C-103"
  nfc_tag_uid TEXT UNIQUE,      -- UID TAG NFC fisico (formato: "AA:BB:CC:DD:EE:FF:00")
  qr_code TEXT UNIQUE NOT NULL, -- QR code univoco (es: "LOCKER_A01_xyz789abc")

  -- Stato
  stato TEXT DEFAULT 'libero' CHECK (stato IN ('libero', 'occupato', 'manutenzione', 'fuori_servizio')),

  -- Assegnazione Utente
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp_assegnazione TIMESTAMPTZ,
  timestamp_ultimo_accesso TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  posizione TEXT,  -- Es: "Piano Terra - Zona A", "Primo Piano - Ala Est"
  note TEXT,       -- Note admin (es: "Serratura da riparare")

  -- Vincoli
  CONSTRAINT valid_stato_user CHECK (
    -- Se occupato, DEVE avere user_id
    (stato = 'occupato' AND user_id IS NOT NULL) OR
    -- Se libero/manutenzione/fuori_servizio, NON deve avere user_id
    (stato IN ('libero', 'manutenzione', 'fuori_servizio') AND user_id IS NULL)
  ),
  CONSTRAINT valid_timestamp CHECK (
    -- Se user_id presente, DEVE avere timestamp_assegnazione
    (user_id IS NOT NULL AND timestamp_assegnazione IS NOT NULL) OR
    (user_id IS NULL AND timestamp_assegnazione IS NULL)
  )
);

-- Indici ottimizzati per query frequenti
CREATE INDEX idx_lockers_stato ON lockers(stato);
CREATE INDEX idx_lockers_user_id ON lockers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_lockers_nfc_tag_uid ON lockers(nfc_tag_uid) WHERE nfc_tag_uid IS NOT NULL;
CREATE INDEX idx_lockers_qr_code ON lockers(qr_code);
CREATE INDEX idx_lockers_numero ON lockers(numero);

-- Indice per query "trova armadietto libero"
CREATE INDEX idx_lockers_libero ON lockers(numero) WHERE stato = 'libero';

-- Trigger auto-update
CREATE TRIGGER lockers_updated_at
BEFORE UPDATE ON lockers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE lockers IS 'Armadietti fisici del sistema';
COMMENT ON COLUMN lockers.nfc_tag_uid IS 'UID del TAG NFC passivo attaccato sull''armadietto. Usato per apertura con smartphone.';
COMMENT ON COLUMN lockers.qr_code IS 'QR code univoco stampato/attaccato sull''armadietto. Usato per apertura con camera smartphone.';
```

**Dati esempio:**
```sql
INSERT INTO lockers (numero, nfc_tag_uid, qr_code, stato, posizione) VALUES
('A01', '11:22:33:44:55:66:77', 'LOCKER_A01_x7k9m2p4', 'libero', 'Piano Terra - Zona A'),
('A02', '22:33:44:55:66:77:88', 'LOCKER_A02_b3n8q1w5', 'libero', 'Piano Terra - Zona A'),
('A03', '33:44:55:66:77:88:99', 'LOCKER_A03_c6r4t9y2', 'occupato', 'Piano Terra - Zona A'),
('A04', '44:55:66:77:88:99:AA', 'LOCKER_A04_d1s7u3v8', 'libero', 'Piano Terra - Zona A'),
('A05', '55:66:77:88:99:AA:BB', 'LOCKER_A05_e9w2x5z1', 'manutenzione', 'Piano Terra - Zona A');

-- Assegna A03 a Mario Rossi
UPDATE lockers
SET user_id = (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
    timestamp_assegnazione = NOW()
WHERE numero = 'A03';
```

---

### Tabella: `special_tags`

```sql
CREATE TABLE special_tags (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Tipo TAG
  tipo TEXT NOT NULL CHECK (tipo IN ('ingresso', 'uscita')),

  -- Identificatori (supporta tutti i metodi)
  badge_uid TEXT UNIQUE,  -- Per badge RFID
  nfc_uid TEXT UNIQUE,    -- Per TAG NFC smartphone
  qr_code TEXT UNIQUE NOT NULL,  -- Per QR code

  -- Metadata
  posizione TEXT NOT NULL,  -- Es: "Ingresso principale palestra"
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Vincolo: almeno un identificatore deve essere presente
  CONSTRAINT at_least_one_id CHECK (
    badge_uid IS NOT NULL OR nfc_uid IS NOT NULL
  )
);

-- Indici
CREATE INDEX idx_special_tags_tipo ON special_tags(tipo);
CREATE INDEX idx_special_tags_badge_uid ON special_tags(badge_uid) WHERE badge_uid IS NOT NULL;
CREATE INDEX idx_special_tags_nfc_uid ON special_tags(nfc_uid) WHERE nfc_uid IS NOT NULL;
CREATE INDEX idx_special_tags_qr_code ON special_tags(qr_code);

-- Vincolo: MAX 1 ingresso e 1 uscita attivi contemporaneamente
CREATE UNIQUE INDEX idx_special_tags_unique_tipo
ON special_tags(tipo) WHERE attivo = true;

COMMENT ON TABLE special_tags IS 'TAG speciali per ingresso e uscita';
COMMENT ON COLUMN special_tags.badge_uid IS 'UID badge RFID che identifica questo TAG (opzionale)';
COMMENT ON COLUMN special_tags.nfc_uid IS 'UID TAG NFC che identifica questo TAG (opzionale)';
COMMENT ON COLUMN special_tags.qr_code IS 'QR code che identifica questo TAG (obbligatorio come fallback)';
```

**Dati esempio:**
```sql
INSERT INTO special_tags (tipo, badge_uid, nfc_uid, qr_code, posizione) VALUES
('ingresso', 'AA:BB:CC:DD:EE:FF:00', 'AA:BB:CC:DD:EE:FF:01', 'ENTRANCE_MAIN_2025', 'Ingresso principale palestra'),
('uscita', 'FF:EE:DD:CC:BB:AA:00', 'FF:EE:DD:CC:BB:AA:01', 'EXIT_MAIN_2025', 'Uscita principale palestra');
```

---

### Tabella: `access_logs`

```sql
CREATE TABLE access_logs (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Riferimenti
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  locker_numero TEXT,  -- Denormalizzato per performance (evita JOIN)

  -- Azione
  azione TEXT NOT NULL CHECK (azione IN ('checkin', 'unlock', 'checkout')),
  metodo TEXT NOT NULL CHECK (metodo IN ('badge', 'nfc', 'qr')),
  code_scanned TEXT,  -- UID o QR scansionato

  -- Risultato
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- Audit Trail
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Metadata
  duration_ms INTEGER,  -- Tempo operazione (ms), per monitoring

  -- Vincolo: se success=false, error_message deve essere presente
  CONSTRAINT error_when_failed CHECK (
    (success = true) OR (success = false AND error_message IS NOT NULL)
  )
);

-- Indici per query analytics
CREATE INDEX idx_logs_user_id ON access_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_logs_timestamp_desc ON access_logs(timestamp DESC);
CREATE INDEX idx_logs_azione ON access_logs(azione);
CREATE INDEX idx_logs_success ON access_logs(success);
CREATE INDEX idx_logs_locker_numero ON access_logs(locker_numero) WHERE locker_numero IS NOT NULL;

-- Indice composito per dashboard admin
CREATE INDEX idx_logs_user_timestamp ON access_logs(user_id, timestamp DESC);

-- Indice per query "tentativi falliti recenti"
CREATE INDEX idx_logs_failed_recent ON access_logs(timestamp DESC)
WHERE success = false;

-- Partitioning per performance su grandi volumi (opzionale)
-- CREATE TABLE access_logs_2025_01 PARTITION OF access_logs
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

COMMENT ON TABLE access_logs IS 'Log completo di tutte le azioni del sistema. Usato per audit, analytics, sicurezza.';
COMMENT ON COLUMN access_logs.locker_numero IS 'Denormalizzato per evitare JOIN. NULL per check-out senza armadietto assegnato (edge case).';
COMMENT ON COLUMN access_logs.duration_ms IS 'Durata operazione in millisecondi. Usato per monitoring performance.';
```

**Dati esempio:**
```sql
INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success, ip_address) VALUES
(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  'checkin',
  'badge',
  '04:5A:2F:1B:3C:6D:80',
  'A03',
  true,
  '192.168.1.100'
),
(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  'unlock',
  'nfc',
  '33:44:55:66:77:88:99',
  'A03',
  true,
  '192.168.1.101'
),
(
  (SELECT id FROM users WHERE email = 'paolo.bianchi@university.it'),
  'unlock',
  'nfc',
  '33:44:55:66:77:88:99',  -- Prova ad aprire armadietto di Mario
  'A03',
  false,
  '192.168.1.102'
) ON CONFLICT DO NOTHING;

-- Aggiorna error_message per tentativo fallito
UPDATE access_logs
SET error_message = 'Tentativo accesso non autorizzato: armadietto assegnato a altro utente'
WHERE success = false AND error_message IS NULL;
```

---

## 🔐 Sicurezza: Row Level Security (RLS) - Dettagliato

### Policy: Tabella `users`

```sql
-- Abilita RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Utenti vedono solo i propri dati
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Utenti possono aggiornare solo i propri dati (escluso tipo e attivo)
CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND tipo = (SELECT tipo FROM users WHERE id = auth.uid())  -- Non può cambiare il proprio ruolo
  AND attivo = (SELECT attivo FROM users WHERE id = auth.uid())  -- Non può auto-disattivarsi
);

-- Policy 3: Admin vede tutti gli utenti
CREATE POLICY "users_select_admin"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true
  )
);

-- Policy 4: Admin può modificare tutto
CREATE POLICY "users_all_admin"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true
  )
);
```

### Policy: Tabella `lockers`

```sql
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Utenti vedono solo il proprio armadietto assegnato
CREATE POLICY "lockers_select_own"
ON lockers FOR SELECT
USING (user_id = auth.uid());

-- Policy 2: Utenti possono aggiornare solo timestamp_ultimo_accesso del proprio armadietto
-- (utilizzato dalla funzione unlock_locker con SECURITY DEFINER)
CREATE POLICY "lockers_update_own_timestamp"
ON lockers FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND stato = OLD.stato  -- Non può cambiare stato
  AND user_id = OLD.user_id  -- Non può riassegnarsi altro armadietto
);

-- Policy 3: Admin vede tutti gli armadietti
CREATE POLICY "lockers_select_admin"
ON lockers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true
  )
);

-- Policy 4: Admin può fare qualsiasi operazione
CREATE POLICY "lockers_all_admin"
ON lockers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true
  )
);
```

### Policy: Tabella `access_logs`

```sql
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Utenti vedono solo i propri log
CREATE POLICY "logs_select_own"
ON access_logs FOR SELECT
USING (user_id = auth.uid());

-- Policy 2: Nessun utente può modificare o cancellare log (immutabilità)
-- Solo INSERT è permesso (tramite functions SECURITY DEFINER)

-- Policy 3: Admin vede tutti i log
CREATE POLICY "logs_select_admin"
ON access_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true
  )
);

-- Policy 4: Admin può solo SELECT, non modificare (audit trail immutabile)
-- Solo function con SECURITY DEFINER può INSERT
```

### Policy: Tabella `special_tags`

```sql
ALTER TABLE special_tags ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tutti possono leggere TAG speciali (necessario per identify_code)
CREATE POLICY "special_tags_select_all"
ON special_tags FOR SELECT
TO authenticated  -- Solo utenti autenticati
USING (attivo = true);

-- Policy 2: Solo admin può modificare
CREATE POLICY "special_tags_all_admin"
ON special_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true
  )
);
```

---

## 🔌 Funzioni PostgreSQL - Implementazione Completa

### Funzione 1: `identify_code` (Identifica TAG/QR scansionato)

```sql
CREATE OR REPLACE FUNCTION identify_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Esegue con privilegi owner function (bypassa RLS)
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_start_time TIMESTAMPTZ;
  v_duration_ms INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Validazione input
  IF p_code IS NULL OR char_length(p_code) < 5 THEN
    RAISE EXCEPTION 'Codice non valido: troppo corto o nullo';
  END IF;

  -- 1. Cerca in special_tags (ingresso/uscita)
  SELECT json_build_object(
    'tipo', tipo,
    'id', id,
    'posizione', posizione,
    'categoria', 'special_tag'
  )
  INTO v_result
  FROM special_tags
  WHERE (
    nfc_uid = p_code
    OR qr_code = p_code
    OR badge_uid = p_code
  )
  AND attivo = true
  LIMIT 1;

  IF v_result IS NOT NULL THEN
    v_duration_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;

    RAISE NOTICE 'identify_code: Special tag found in % ms', v_duration_ms;

    RETURN v_result;
  END IF;

  -- 2. Cerca in lockers (armadietti)
  SELECT json_build_object(
    'tipo', 'locker',
    'id', id,
    'numero', numero,
    'stato', stato,
    'categoria', 'locker'
  )
  INTO v_result
  FROM lockers
  WHERE (
    nfc_tag_uid = p_code
    OR qr_code = p_code
  )
  LIMIT 1;

  IF v_result IS NOT NULL THEN
    v_duration_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;

    RAISE NOTICE 'identify_code: Locker found in % ms', v_duration_ms;

    RETURN v_result;
  END IF;

  -- 3. Codice non riconosciuto
  v_duration_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;

  RAISE NOTICE 'identify_code: Code not found (% ms): %', v_duration_ms, p_code;

  RAISE EXCEPTION 'TAG/QR code "%" non riconosciuto nel sistema', p_code;

END;
$$;

-- Permessi
GRANT EXECUTE ON FUNCTION identify_code(TEXT) TO authenticated;

-- Commento documentazione
COMMENT ON FUNCTION identify_code(TEXT) IS
'Identifica cosa è stato scansionato (TAG ingresso/uscita o armadietto).
Parametri:
  - p_code: UID TAG NFC, QR code, o UID badge RFID
Ritorna JSON con tipo e dati.
Esempio: {"tipo": "ingresso", "id": 1, "posizione": "Ingresso principale"}';
```

### Funzione 2: `checkin_user` (Assegna armadietto al check-in)

```sql
CREATE OR REPLACE FUNCTION checkin_user(
  p_user_id UUID,
  p_code TEXT,
  p_metodo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_special_tag RECORD;
  v_locker RECORD;
  v_existing RECORD;
  v_start_time TIMESTAMPTZ;
  v_duration_ms INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Validazione input
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id non può essere NULL';
  END IF;

  IF p_code IS NULL OR char_length(p_code) < 5 THEN
    RAISE EXCEPTION 'Codice non valido';
  END IF;

  IF p_metodo NOT IN ('badge', 'nfc', 'qr') THEN
    RAISE EXCEPTION 'Metodo non valido: deve essere badge, nfc o qr';
  END IF;

  -- 1. Verifica che utente esista ed sia attivo
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND attivo = true) THEN
    RAISE EXCEPTION 'Utente non trovato o disattivato';
  END IF;

  -- 2. Verifica che il codice sia davvero un TAG ingresso
  SELECT * INTO v_special_tag
  FROM special_tags
  WHERE tipo = 'ingresso'
    AND (nfc_uid = p_code OR qr_code = p_code OR badge_uid = p_code)
    AND attivo = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Codice non valido per check-in. Usa il TAG/QR dell''ingresso.';
  END IF;

  -- 3. Verifica che l'utente non abbia già un armadietto assegnato
  SELECT * INTO v_existing
  FROM lockers
  WHERE user_id = p_user_id AND stato = 'occupato';

  IF FOUND THEN
    -- Log tentativo duplicato
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'checkin', p_metodo, p_code,
      v_existing.numero, false,
      'Utente ha già armadietto ' || v_existing.numero || ' assegnato'
    );

    RAISE EXCEPTION 'Hai già un armadietto assegnato: %. Fai check-out prima.', v_existing.numero;
  END IF;

  -- 4. Trova primo armadietto libero con row-level lock
  --    SKIP LOCKED previene deadlock se più utenti fanno check-in simultaneamente
  SELECT * INTO v_locker
  FROM lockers
  WHERE stato = 'libero'
  ORDER BY numero ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    -- Log fallimento
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'checkin', p_metodo, p_code,
      NULL, false, 'Nessun armadietto disponibile'
    );

    RAISE EXCEPTION 'Nessun armadietto disponibile al momento. Riprova più tardi.';
  END IF;

  -- 5. Assegna armadietto all'utente
  UPDATE lockers
  SET stato = 'occupato',
      user_id = p_user_id,
      timestamp_assegnazione = NOW()
  WHERE id = v_locker.id;

  -- 6. Log azione con successo
  v_duration_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;

  INSERT INTO access_logs (
    user_id, azione, metodo, code_scanned,
    locker_numero, success, duration_ms
  ) VALUES (
    p_user_id, 'checkin', p_metodo, p_code,
    v_locker.numero, true, v_duration_ms
  );

  -- 7. Ritorna informazioni armadietto assegnato
  RETURN json_build_object(
    'success', true,
    'locker_assigned', v_locker.numero,
    'locker_nfc_uid', v_locker.nfc_tag_uid,
    'locker_qr_code', v_locker.qr_code,
    'message', 'Armadietto ' || v_locker.numero || ' assegnato con successo!',
    'timestamp', NOW(),
    'duration_ms', v_duration_ms
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log errore
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'checkin', p_metodo, p_code,
      NULL, false, SQLERRM
    );

    -- Re-raise exception
    RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION checkin_user(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION checkin_user(UUID, TEXT, TEXT) IS
'Esegue check-in utente e assegna armadietto libero.
Parametri:
  - p_user_id: UUID utente
  - p_code: UID TAG ingresso scansionato
  - p_metodo: "badge", "nfc", o "qr"
Ritorna JSON con armadietto assegnato.
Thread-safe con row-level locking.';
```

### Funzione 3: `unlock_locker` (Sblocca armadietto)

```sql
CREATE OR REPLACE FUNCTION unlock_locker(
  p_user_id UUID,
  p_code TEXT,
  p_metodo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locker RECORD;
  v_user RECORD;
  v_start_time TIMESTAMPTZ;
  v_duration_ms INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Validazione input
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id non può essere NULL';
  END IF;

  IF p_code IS NULL THEN
    RAISE EXCEPTION 'code non può essere NULL';
  END IF;

  IF p_metodo NOT IN ('badge', 'nfc', 'qr') THEN
    RAISE EXCEPTION 'Metodo non valido';
  END IF;

  -- 1. Verifica utente attivo
  SELECT * INTO v_user FROM users WHERE id = p_user_id AND attivo = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utente non trovato o disattivato';
  END IF;

  -- 2. Trova armadietto dal codice scansionato
  SELECT * INTO v_locker
  FROM lockers
  WHERE nfc_tag_uid = p_code OR qr_code = p_code;

  IF NOT FOUND THEN
    -- Log tentativo con codice invalido
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'unlock', p_metodo, p_code,
      NULL, false, 'Codice non corrisponde a nessun armadietto'
    );

    RAISE EXCEPTION 'Armadietto non trovato. Verifica il TAG/QR scansionato.';
  END IF;

  -- 3. Verifica stato armadietto
  IF v_locker.stato = 'manutenzione' THEN
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'unlock', p_metodo, p_code,
      v_locker.numero, false, 'Armadietto in manutenzione'
    );

    RAISE EXCEPTION 'Armadietto % in manutenzione. Contatta la reception.', v_locker.numero;
  END IF;

  IF v_locker.stato = 'fuori_servizio' THEN
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'unlock', p_metodo, p_code,
      v_locker.numero, false, 'Armadietto fuori servizio'
    );

    RAISE EXCEPTION 'Armadietto % fuori servizio.', v_locker.numero;
  END IF;

  IF v_locker.stato = 'libero' THEN
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'unlock', p_metodo, p_code,
      v_locker.numero, false, 'Armadietto non assegnato (libero)'
    );

    RAISE EXCEPTION 'Armadietto % non è assegnato a nessuno.', v_locker.numero;
  END IF;

  -- 4. SECURITY CHECK CRITICO: Verifica proprietà armadietto
  IF v_locker.user_id != p_user_id THEN
    -- Log tentativo accesso non autorizzato (IMPORTANTE per sicurezza!)
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'unlock', p_metodo, p_code,
      v_locker.numero, false,
      'Tentativo accesso non autorizzato: armadietto assegnato a user_id ' || v_locker.user_id
    );

    -- Se più di 3 tentativi falliti in 5 minuti, potrebbe essere attacco → notifica admin
    DECLARE
      v_failed_attempts INTEGER;
    BEGIN
      SELECT COUNT(*) INTO v_failed_attempts
      FROM access_logs
      WHERE user_id = p_user_id
        AND success = false
        AND azione = 'unlock'
        AND timestamp > NOW() - INTERVAL '5 minutes';

      IF v_failed_attempts >= 3 THEN
        -- Notifica admin via pg_notify (opzionale)
        PERFORM pg_notify('security_alert',
          json_build_object(
            'type', 'multiple_failed_unlock_attempts',
            'user_id', p_user_id,
            'user_email', v_user.email,
            'attempts', v_failed_attempts,
            'locker_numero', v_locker.numero
          )::text
        );
      END IF;
    END;

    RAISE EXCEPTION 'Accesso negato! Armadietto % non è assegnato a te.', v_locker.numero;
  END IF;

  -- 5. Tutto OK → Aggiorna timestamp ultimo accesso
  UPDATE lockers
  SET timestamp_ultimo_accesso = NOW()
  WHERE id = v_locker.id;

  -- 6. Log accesso riuscito
  v_duration_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;

  INSERT INTO access_logs (
    user_id, azione, metodo, code_scanned,
    locker_numero, success, duration_ms
  ) VALUES (
    p_user_id, 'unlock', p_metodo, p_code,
    v_locker.numero, true, v_duration_ms
  );

  -- 7. Notifica hardware tramite pg_notify (opzionale)
  --    ESP32 può sottoscrivere a questo canale per ricevere comandi sblocco
  PERFORM pg_notify('locker_unlock',
    json_build_object(
      'locker', v_locker.numero,
      'action', 'unlock',
      'timestamp', NOW(),
      'duration_seconds', 5  -- Aperto per 5 secondi
    )::text
  );

  -- 8. Ritorna conferma
  RETURN json_build_object(
    'success', true,
    'locker', v_locker.numero,
    'message', 'Armadietto ' || v_locker.numero || ' sbloccato!',
    'timestamp', NOW(),
    'duration_ms', v_duration_ms
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Assicura che ogni errore sia loggato
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'unlock', p_metodo, p_code,
      v_locker.numero, false, SQLERRM
    ) ON CONFLICT DO NOTHING;  -- Evita duplicati se già loggato sopra

    RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION unlock_locker(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION unlock_locker(UUID, TEXT, TEXT) IS
'Sblocca armadietto dopo verifica autorizzazioni.
Implementa controlli sicurezza rigorosi e logging completo.
Notifica hardware via pg_notify.
Parametri:
  - p_user_id: UUID utente
  - p_code: UID TAG armadietto scansionato
  - p_metodo: "badge", "nfc", o "qr"';
```

### Funzione 4: `checkout_user` (Libera armadietto al check-out)

```sql
CREATE OR REPLACE FUNCTION checkout_user(
  p_user_id UUID,
  p_code TEXT,
  p_metodo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_special_tag RECORD;
  v_locker RECORD;
  v_start_time TIMESTAMPTZ;
  v_duration_ms INTEGER;
  v_usage_duration_minutes INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Validazione
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id non può essere NULL';
  END IF;

  IF p_code IS NULL THEN
    RAISE EXCEPTION 'code non può essere NULL';
  END IF;

  IF p_metodo NOT IN ('badge', 'nfc', 'qr') THEN
    RAISE EXCEPTION 'Metodo non valido';
  END IF;

  -- 1. Verifica che sia TAG uscita
  SELECT * INTO v_special_tag
  FROM special_tags
  WHERE tipo = 'uscita'
    AND (nfc_uid = p_code OR qr_code = p_code OR badge_uid = p_code)
    AND attivo = true;

  IF NOT FOUND THEN
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'checkout', p_metodo, p_code,
      NULL, false, 'Codice non è TAG uscita'
    );

    RAISE EXCEPTION 'Codice non valido per check-out. Usa il TAG/QR dell''uscita.';
  END IF;

  -- 2. Trova armadietto assegnato all'utente
  SELECT * INTO v_locker
  FROM lockers
  WHERE user_id = p_user_id AND stato = 'occupato';

  IF NOT FOUND THEN
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'checkout', p_metodo, p_code,
      NULL, false, 'Nessun armadietto assegnato'
    );

    RAISE EXCEPTION 'Non hai nessun armadietto assegnato. Check-in non effettuato?';
  END IF;

  -- 3. Calcola durata utilizzo
  v_usage_duration_minutes := EXTRACT(EPOCH FROM (NOW() - v_locker.timestamp_assegnazione))::INTEGER / 60;

  -- 4. Libera armadietto
  UPDATE lockers
  SET stato = 'libero',
      user_id = NULL,
      timestamp_assegnazione = NULL
  WHERE id = v_locker.id;

  -- 5. Log azione
  v_duration_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;

  INSERT INTO access_logs (
    user_id, azione, metodo, code_scanned,
    locker_numero, success, duration_ms
  ) VALUES (
    p_user_id, 'checkout', p_metodo, p_code,
    v_locker.numero, true, v_duration_ms
  );

  -- 6. Notifica realtime (opzionale)
  PERFORM pg_notify('locker_checkout',
    json_build_object(
      'locker', v_locker.numero,
      'user_id', p_user_id,
      'usage_duration_minutes', v_usage_duration_minutes
    )::text
  );

  -- 7. Ritorna conferma
  RETURN json_build_object(
    'success', true,
    'locker_released', v_locker.numero,
    'usage_duration_minutes', v_usage_duration_minutes,
    'message', 'Arrivederci! Armadietto ' || v_locker.numero || ' rilasciato.',
    'timestamp', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO access_logs (
      user_id, azione, metodo, code_scanned,
      locker_numero, success, error_message
    ) VALUES (
      p_user_id, 'checkout', p_metodo, p_code,
      NULL, false, SQLERRM
    ) ON CONFLICT DO NOTHING;

    RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION checkout_user(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION checkout_user(UUID, TEXT, TEXT) IS
'Libera armadietto al check-out.
Calcola durata utilizzo per analytics.
Parametri:
  - p_user_id: UUID utente
  - p_code: UID TAG uscita
  - p_metodo: "badge", "nfc", o "qr"';
```

---

## 📊 Analytics e Monitoring

### View: Statistiche Utilizzo Armadietti

```sql
CREATE OR REPLACE VIEW stats_lockers_usage AS
SELECT
  l.numero AS locker_numero,
  l.posizione,
  COUNT(DISTINCT al.user_id) AS utenti_totali,
  COUNT(*) FILTER (WHERE al.azione = 'checkin') AS total_checkins,
  COUNT(*) FILTER (WHERE al.azione = 'unlock') AS total_unlocks,
  AVG(
    EXTRACT(EPOCH FROM (
      LEAD(al.timestamp) OVER (PARTITION BY l.numero ORDER BY al.timestamp) - al.timestamp
    ))::INTEGER / 60
  ) FILTER (WHERE al.azione = 'checkin') AS avg_usage_duration_minutes,
  MAX(al.timestamp) AS last_used
FROM lockers l
LEFT JOIN access_logs al ON al.locker_numero = l.numero AND al.success = true
GROUP BY l.id, l.numero, l.posizione
ORDER BY total_checkins DESC;

COMMENT ON VIEW stats_lockers_usage IS 'Statistiche utilizzo per ogni armadietto';
```

### View: Dashboard Admin Real-time

```sql
CREATE OR REPLACE VIEW dashboard_admin_realtime AS
SELECT
  -- Statistiche generali
  (SELECT COUNT(*) FROM lockers) AS totale_armadietti,
  (SELECT COUNT(*) FROM lockers WHERE stato = 'libero') AS armadietti_liberi,
  (SELECT COUNT(*) FROM lockers WHERE stato = 'occupato') AS armadietti_occupati,
  (SELECT COUNT(*) FROM lockers WHERE stato = 'manutenzione') AS armadietti_manutenzione,

  -- Percentuale occupazione
  ROUND(
    (SELECT COUNT(*)::NUMERIC FROM lockers WHERE stato = 'occupato') /
    NULLIF((SELECT COUNT(*)::NUMERIC FROM lockers WHERE stato IN ('libero', 'occupato')), 0) * 100,
    2
  ) AS percentuale_occupazione,

  -- Statistiche oggi
  (SELECT COUNT(*) FROM access_logs WHERE DATE(timestamp) = CURRENT_DATE AND azione = 'checkin' AND success = true) AS checkins_oggi,
  (SELECT COUNT(*) FROM access_logs WHERE DATE(timestamp) = CURRENT_DATE AND azione = 'unlock' AND success = true) AS unlocks_oggi,
  (SELECT COUNT(*) FROM access_logs WHERE DATE(timestamp) = CURRENT_DATE AND azione = 'checkout' AND success = true) AS checkouts_oggi,

  -- Tentativi falliti (sicurezza)
  (SELECT COUNT(*) FROM access_logs WHERE DATE(timestamp) = CURRENT_DATE AND success = false) AS tentativi_falliti_oggi,

  -- Armadietti occupati troppo a lungo (> 4 ore)
  (SELECT COUNT(*) FROM lockers WHERE stato = 'occupato' AND timestamp_assegnazione < NOW() - INTERVAL '4 hours') AS armadietti_timeout,

  -- Timestamp aggiornamento
  NOW() AS ultimo_aggiornamento;

COMMENT ON VIEW dashboard_admin_realtime IS 'Metriche real-time per dashboard amministratore';
```

---

Continuo con le altre sezioni dettagliate. Vuoi che prosegua con:
1. Frontend React (componenti, hooks, services)
2. Hardware ESP32 (codice completo con gestione errori)
3. Testing strategy
4. Deployment step-by-step
5. Troubleshooting e FAQ

Quale preferisci? 🎯
