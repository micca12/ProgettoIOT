# Smart Locker WiFi + Supabase Setup

## 📝 Configurazione Credenziali

Il firmware smart locker ora comunica in tempo reale con Supabase tramite HTTPClient + JSON.

### 1️⃣ Aggiorna le credenziali in `src/main.cpp`

**Linee 30-35:**
```cpp
// --- WiFi Credentials ---
const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";

// --- Supabase Configuration ---
const char* SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const char* SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

Sostituisci:
- `YOUR_SSID` → Nome della rete WiFi
- `YOUR_PASSWORD` → Password WiFi
- `YOUR_PROJECT` → ID progetto Supabase (da `https://app.supabase.co`)
- `YOUR_ANON_KEY` → API Key anonima da Supabase

### 2️⃣ Trova credenziali Supabase

1. Vai a https://app.supabase.co
2. Seleziona il tuo progetto
3. Settings → API → Project URL e anon (public) key
4. Copia entrambi

## 🔌 Come funziona

### Flusso di autorizzazione:

```
┌─────────────────────────────────────────────────────────────┐
│                    Smart Locker (ESP32)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 1. Leggi badge NFC/RFID da Serial Monitor
             │    es: "04:5A:2F:1B"
             │
             │ 2. Controlla connessione WiFi
             │    ├─ Se connesso → HTTP POST a Supabase
             │    └─ Se offline → Fallback locale
             │
             v
      ┌──────────────┐
      │ POST Request │
      │ to Supabase  │
      └──────┬───────┘
             │
             │ URL: /rest/v1/rpc/identify_code
             │ Payload: {"p_code": "04:5A:2F:1B"}
             │
             v
      ┌────────────────────────────────────────────┐
      │   Supabase - PostgreSQL Function:          │
      │   identify_code(p_code: text)              │
      │   → Returns: [{authorized: true|false}]    │
      └────────────┬───────────────────────────────┘
                   │
             3. Parse JSON response
             4. Se authorized=true → Sblocca
             5. Se authorized=false → Nega
```

### Fallback Offline

Se WiFi non connesso:
1. Controlla localmente i badge autorizzati
2. Badge locali: `04:5A:2F:1B`, `01:AB:CD:EF` e shortcut `1`, `2`
3. Se in elenco → Sblocca
4. Altrimenti → Nega

## 🧪 Test

### Con Serial Monitor:

```
1. Avvia il firmware in Wokwi
2. Leggi output nella console:
   ✓ Connesso al WiFi!
   IP: 192.168.1.100
   
3. Digita nel Serial Monitor:
   04:5A:2F:1B [ENTER]
   
4. Output atteso:
   -> Verifica autorizzazione via Supabase...
   -> POST: https://YOUR_PROJECT.supabase.co/rest/v1/rpc/identify_code
   -> Payload: {"p_code":"04:5A:2F:1B"}
   -> Response (HTTP 200): [{"authorized":true}]
   ✓ AUTORIZZATO!
   [SERVO] Apertura lucchetto
```

## 📊 Monitoraggio Live

Nel Serial Monitor vedrai:
- **Connessione WiFi**: Stato e IP
- **Richieste API**: URL, payload, risposta
- **Autorizzazione**: ✓ AUTORIZZATO! o ✗ NEGATO
- **Controllo Servo**: Apertura/Chiusura
- **Feedback**: Beep e LED status

## 🛠️ Risoluzione Problemi

### WiFi non connette
- [ ] SSID e PASSWORD corretti?
- [ ] Rete a 2.4GHz (ESP32 non supporta 5GHz)
- [ ] ESP32 vicino al router?

### API ritorna errore 401/403
- [ ] SUPABASE_URL corretto? (controlla https://)
- [ ] SUPABASE_ANON_KEY valida?
- [ ] Funzione `identify_code` esiste in Supabase?

### Autorizzazione sempre "NEGATO"
- [ ] Database contiene il badge nel field `code`?
- [ ] Formato badge match (es: con ":" o senza)
- [ ] Controlla RLS policies in Supabase

### JSON parse error
- [ ] Risposta Supabase valida?
- [ ] Memoria disponibile su ESP32? (ArduinoJson buffer size)
- [ ] Tipo di dato "authorized" è BOOLEAN?

## 📚 Reference

- [ArduinoJson v7 API](https://arduinojson.org)
- [HTTPClient docs](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/protocols/esp_http_client.html)
- [Supabase REST API](https://supabase.com/docs/reference/api/rest-api)
- [ESP32 WiFi API](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/network/wifi.html)

## ✅ Checklist Pre-Deploy

- [ ] WiFi SSID e password configurate
- [ ] Supabase URL e API key configurate
- [ ] Firmware compila senza errori (solo warnings su deprecated)
- [ ] Test con badge autorizzato → Sblocca ✓
- [ ] Test con badge non autorizzato → Nega ✓
- [ ] Test offline fallback → Sblocca se in lista locale ✓
- [ ] Servo apre/chiude correttamente
- [ ] LED e buzzer rispondono
