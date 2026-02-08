# Smart Locker IoT

Sistema IoT per la gestione di armadietti intelligenti. Gli utenti possono fare check-in e check-out tramite badge RFID, e ogni armadietto viene assegnato automaticamente. Include una dashboard admin per il monitoraggio.

## Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS (shadcn/ui)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Hardware**: ESP32 + MFRC522 (RFID)
- **Simulazione**: Wokwi

## Struttura progetto

```
ProgettoIOT/
├── frontend-admin/          # Dashboard amministratore
├── frontend-user/           # App utente (check-in/out)
├── hardware/
│   ├── platformio/          # Codice per ESP32 fisico
│   ├── wokwi/               # Simulazione ingresso/uscita
│   └── wokwi-smart-locker/  # Simulazione armadietto singolo
├── supabase/
│   └── migrations/          # Schema DB e funzioni SQL
└── docs/
    └── SETUP.md
```

## Come avviare

### Frontend Admin

```bash
cd frontend-admin
npm install
npm run dev
```

Si apre su `http://localhost:5173`. Serve il file `.env` con le credenziali Supabase:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tua-chiave
```

### Frontend User

```bash
cd frontend-user
npm install
npm run dev
```

Stessa configurazione `.env` del frontend admin.

### Hardware (PlatformIO)

```bash
cd hardware/platformio/smart-locker-esp32
pio run
```

Impostare SSID, password WiFi e credenziali Supabase in `src/main.cpp`.

### Hardware (Wokwi)

Aprire la cartella `hardware/wokwi` o `hardware/wokwi-smart-locker` in VS Code con l'estensione Wokwi installata. Aprire `diagram.json` e avviare la simulazione con F1 > "Wokwi: Start Simulation".

## Database

Le migrations si trovano in `supabase/migrations/`. Vanno eseguite in ordine sul SQL Editor di Supabase:

1. `20250126_create_tables.sql` - Crea tabelle e dati di test
2. `20250131_badge_access_function.sql` - Funzione check-in/check-out via badge
3. `20250205_locker_unlock_function.sql` - Funzione sblocco armadietto

Dopo aver creato il progetto su [supabase.com](https://supabase.com), copiare URL e anon key nei file `.env` dei frontend e nel codice ESP32.

## Funzionamento

1. L'utente passa il badge RFID al lettore (ESP32 + MFRC522)
2. L'ESP32 chiama la funzione `badge_access` su Supabase
3. Se non ha armadietto: check-in, gli viene assegnato il primo libero
4. Se ha gia' un armadietto: check-out, l'armadietto viene liberato
5. L'admin puo' monitorare tutto dalla dashboard

## Autori

- [micca12](https://github.com/micca12)
- [TommasoTurci](https://github.com/TommasoTurci)
