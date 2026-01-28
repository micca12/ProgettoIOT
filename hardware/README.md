# Hardware - Configurazione ESP32

## 📁 Struttura

```
hardware/
├── wokwi/                    # Simulazione Wokwi
│   ├── diagram.json          # Schema circuito
│   ├── wokwi.toml           # Configurazione
│   └── sketch.ino           # Codice Arduino
└── platformio/              # Codice PlatformIO per ESP32 reale
    └── smart-locker-esp32/
        ├── platformio.ini   # Configurazione progetto
        └── src/
            └── main.cpp     # Codice principale
```

---

## 🎮 Opzione 1: Wokwi Simulator (Consigliato per iniziare)

### Vantaggi:
- ✅ Gratuito
- ✅ Nessun hardware fisico necessario
- ✅ Simulazione completa ESP32 + RFID
- ✅ Integrato in VS Code

### Setup:

1. **Installa estensione VS Code**:
   - Apri VS Code
   - `Ctrl+Shift+X` → Cerca "Wokwi Simulator"
   - Click "Install"

2. **Apri progetto Wokwi**:
   - Apri file `hardware/wokwi/diagram.json`
   - Premi `F1` → "Wokwi: Start Simulation"

3. **Usa simulatore**:
   - Click sul badge RFID nel simulatore
   - Vedrai il badge UID nella console seriale
   - LED verde si accende quando badge riconosciuto

### Componenti simulati:
- ESP32 DevKit V1
- MFRC522 RFID Reader (UID: `04:5A:2F:1B:3C:6D:80`)
- Relay Module (controllo serratura)
- LED verde (feedback visivo)

---

## ⚙️ Opzione 2: PlatformIO (Per ESP32 reale)

### Quando usarlo:
- Quando hai l'hardware fisico
- Per caricare codice su ESP32 reale
- Per debug avanzato

### Setup:

1. **Installa estensione PlatformIO**:
   - Apri VS Code
   - `Ctrl+Shift+X` → Cerca "PlatformIO IDE"
   - Click "Install"
   - Riavvia VS Code

2. **Apri progetto**:
   - Click icona PlatformIO (alieno) nella barra laterale
   - "Open" → Seleziona `hardware/platformio/smart-locker-esp32`

3. **Configura WiFi**:
   - Apri `src/main.cpp`
   - Modifica righe 25-26:
     ```cpp
     const char* WIFI_SSID = "TuoWiFi";
     const char* WIFI_PASSWORD = "TuaPassword";
     ```

4. **Compila progetto**:
   - Click icona PlatformIO
   - Sotto "PROJECT TASKS" → "Build"
   - Oppure: `Ctrl+Alt+B`

5. **Carica su ESP32** (quando hai l'hardware):
   - Collega ESP32 via USB
   - Click "Upload"
   - Oppure: `Ctrl+Alt+U`

6. **Monitor seriale**:
   - Click "Monitor"
   - Oppure: `Ctrl+Alt+S`

---

## 🔌 Schema Collegamenti Hardware

### Pin ESP32:

| Componente | Pin ESP32 | Colore Cavo |
|-----------|-----------|-------------|
| **RFID MFRC522** | | |
| SDA | GPIO 5 | Verde |
| SCK | GPIO 18 | Giallo |
| MOSI | GPIO 23 | Arancione |
| MISO | GPIO 19 | Blu |
| RST | GPIO 22 | Bianco |
| GND | GND | Nero |
| 3.3V | 3.3V | Rosso |
| **Relay Module** | | |
| IN | GPIO 27 | Viola |
| VCC | 5V | Rosso |
| GND | GND | Nero |
| **LED Verde** | | |
| Anodo (+) | GPIO 25 | Verde |
| Catodo (-) | GND | Nero |
| **LED Rosso** | | |
| Anodo (+) | GPIO 26 | Rosso |
| Catodo (-) | GND | Nero |

---

## 🧪 Test

### Badge RFID Test:
- **Mario Rossi**: `04:5A:2F:1B:3C:6D:80` (riconosciuto)
- Altri UID: non riconosciuti

### Comportamento atteso:

1. **Badge riconosciuto**:
   - LED verde acceso
   - Relay attivato per 3 secondi
   - Console: "✓ Badge riconosciuto!"

2. **Badge non riconosciuto**:
   - LED rosso lampeggia 3 volte
   - Console: "✗ Badge NON riconosciuto!"

---

## 📝 Modalità Funzionamento

### Modalità Online (WiFi connesso):
1. Legge badge RFID
2. Chiama API Supabase `identify_code`
3. Se riconosciuto → sblocca armadietto
4. Log azione su database

### Modalità Offline (WiFi non connesso):
1. Legge badge RFID
2. Controlla badge hardcoded (UID: `04:5A:2F:1B:3C:6D:80`)
3. Se match → sblocca armadietto
4. Solo log locale

---

## 🛠️ Troubleshooting

### Wokwi non parte:
- Riavvia VS Code
- Verifica estensione installata
- Apri `diagram.json` e premi F1 → "Wokwi: Start Simulation"

### PlatformIO build error:
```bash
cd hardware/platformio/smart-locker-esp32
pio lib install
pio run --target clean
pio run
```

### ESP32 non rilevato:
- Installa driver CP2102 / CH340
- Verifica cavo USB (deve essere dati, non solo carica)
- Controlla porta COM in Device Manager (Windows)

---

## 📚 Librerie Utilizzate

- **MFRC522** v1.4.10 - Lettura RFID
- **ArduinoJson** v6.21.3 - Parsing JSON Supabase
- **WiFi** - Connessione WiFi ESP32
- **HTTPClient** - Chiamate API

---

## ✅ Next Steps

1. Testa simulazione Wokwi
2. Quando hai hardware fisico → usa PlatformIO
3. Integra con frontend (QR code, NFC smartphone)
