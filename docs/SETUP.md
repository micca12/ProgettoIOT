# Guida Setup Completa - Smart Locker IoT

Guida passo-passo per iniziare il progetto da zero.

---

## 📋 Indice

1. [Prerequisiti](#1-prerequisiti)
2. [Setup Ambiente di Sviluppo](#2-setup-ambiente-di-sviluppo)
3. [Setup Supabase (Database)](#3-setup-supabase-database)
4. [Setup Frontend Utenti](#4-setup-frontend-utenti)
5. [Setup Frontend Admin](#5-setup-frontend-admin)
6. [Setup Hardware (Wokwi + PlatformIO)](#6-setup-hardware-wokwi--platformio)
7. [Test Integrazione](#7-test-integrazione)
8. [Next Steps](#8-next-steps)

---

## 2. Setup Ambiente di Sviluppo

### 2.1 Clona/Crea Repository Git

Apri terminale (Git Bash su Windows) nella cartella del progetto:

```bash
cd C:\Users\micca\Desktop\Progetti\ProgettoIOT

# Inizializza Git (se non già fatto)
git init

# Configura Git (prima volta)
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua-email@example.com"

# Aggiungi .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Supabase
.supabase/

# PlatformIO
.pio/
.vscode/.browse.c_cpp.db*
.vscode/c_cpp_properties.json
.vscode/launch.json
EOF

# Commit iniziale
git add .
git commit -m "Initial commit: project structure"
```

---

### 2.2 Verifica Struttura Cartelle

La struttura dovrebbe essere:

```
ProgettoIOT/
├── README.md
├── .gitignore
├── docs/
│   └── SETUP.md (questo file)
├── frontend-user/        # App React per utenti
├── frontend-admin/       # Dashboard React per admin
├── hardware/
│   ├── wokwi/           # Simulazione Wokwi
│   └── platformio/      # Codice PlatformIO
├── supabase/
│   ├── migrations/      # SQL migrations
│   └── functions/       # Edge Functions (opzionale)
└── scripts/             # Script utility
```

---

## 3. Setup Supabase (Database)

### 3.1 Crea Progetto Supabase

1. Vai su https://app.supabase.com
2. Click **"New Project"**
3. Compila:
   - **Name:** `smart-lockers-iot`
   - **Database Password:** Genera password forte (SALVALA!)
   - **Region:** Europe (Frankfurt o Ireland per GDPR)
   - **Pricing Plan:** Free
4. Click **"Create new project"**
5. Attendi 2-3 minuti per provisioning

---

### 3.2 Ottieni Credenziali Progetto

Una volta creato il progetto:

1. Vai in **Settings** (icona ingranaggio in basso a sinistra)
2. Click **API**
3. Copia e salva:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (NON committare!)

**Salva queste credenziali in un file temporaneo (NON committare su Git!):**

```bash
# Crea file .env.local (già in .gitignore)
cat > .env.local << 'EOF'
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_PASSWORD=la-tua-password-forte
EOF
```

---

### 3.3 Crea Schema Database

#### Step 1: Crea File Migration

Crea file `supabase/migrations/20250126_create_tables.sql`:

```sql
-- ============================================
-- Smart Locker IoT - Database Schema
-- ============================================

-- Estensioni
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabella: users
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL CHECK (char_length(nome) >= 2),
  cognome TEXT NOT NULL CHECK (char_length(cognome) >= 2),
  telefono TEXT CHECK (telefono ~ '^\+?[0-9]{10,15}$'),
  badge_uid TEXT UNIQUE,
  tipo TEXT DEFAULT 'studente' CHECK (tipo IN ('studente', 'admin')),
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_badge_uid ON users(badge_uid) WHERE badge_uid IS NOT NULL;
CREATE INDEX idx_users_tipo ON users(tipo);
CREATE INDEX idx_users_attivo ON users(attivo) WHERE attivo = true;

COMMENT ON TABLE users IS 'Utenti del sistema (studenti e amministratori)';

-- ============================================
-- Tabella: lockers
-- ============================================

CREATE TABLE lockers (
  id SERIAL PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  nfc_tag_uid TEXT UNIQUE,
  qr_code TEXT UNIQUE NOT NULL,
  stato TEXT DEFAULT 'libero' CHECK (stato IN ('libero', 'occupato', 'manutenzione', 'fuori_servizio')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp_assegnazione TIMESTAMPTZ,
  timestamp_ultimo_accesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  posizione TEXT,
  note TEXT,
  CONSTRAINT valid_stato_user CHECK (
    (stato = 'occupato' AND user_id IS NOT NULL) OR
    (stato IN ('libero', 'manutenzione', 'fuori_servizio') AND user_id IS NULL)
  ),
  CONSTRAINT valid_timestamp CHECK (
    (user_id IS NOT NULL AND timestamp_assegnazione IS NOT NULL) OR
    (user_id IS NULL AND timestamp_assegnazione IS NULL)
  )
);

CREATE INDEX idx_lockers_stato ON lockers(stato);
CREATE INDEX idx_lockers_user_id ON lockers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_lockers_nfc_tag_uid ON lockers(nfc_tag_uid) WHERE nfc_tag_uid IS NOT NULL;
CREATE INDEX idx_lockers_qr_code ON lockers(qr_code);
CREATE INDEX idx_lockers_numero ON lockers(numero);
CREATE INDEX idx_lockers_libero ON lockers(numero) WHERE stato = 'libero';

COMMENT ON TABLE lockers IS 'Armadietti fisici del sistema';

-- ============================================
-- Tabella: special_tags
-- ============================================

CREATE TABLE special_tags (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingresso', 'uscita')),
  badge_uid TEXT UNIQUE,
  nfc_uid TEXT UNIQUE,
  qr_code TEXT UNIQUE NOT NULL,
  posizione TEXT NOT NULL,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT at_least_one_id CHECK (
    badge_uid IS NOT NULL OR nfc_uid IS NOT NULL
  )
);

CREATE INDEX idx_special_tags_tipo ON special_tags(tipo);
CREATE INDEX idx_special_tags_badge_uid ON special_tags(badge_uid) WHERE badge_uid IS NOT NULL;
CREATE INDEX idx_special_tags_nfc_uid ON special_tags(nfc_uid) WHERE nfc_uid IS NOT NULL;
CREATE INDEX idx_special_tags_qr_code ON special_tags(qr_code);
CREATE UNIQUE INDEX idx_special_tags_unique_tipo ON special_tags(tipo) WHERE attivo = true;

COMMENT ON TABLE special_tags IS 'TAG speciali per ingresso e uscita';

-- ============================================
-- Tabella: access_logs
-- ============================================

CREATE TABLE access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  locker_numero TEXT,
  azione TEXT NOT NULL CHECK (azione IN ('checkin', 'unlock', 'checkout')),
  metodo TEXT NOT NULL CHECK (metodo IN ('badge', 'nfc', 'qr')),
  code_scanned TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_ms INTEGER,
  CONSTRAINT error_when_failed CHECK (
    (success = true) OR (success = false AND error_message IS NOT NULL)
  )
);

CREATE INDEX idx_logs_user_id ON access_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_logs_timestamp_desc ON access_logs(timestamp DESC);
CREATE INDEX idx_logs_azione ON access_logs(azione);
CREATE INDEX idx_logs_success ON access_logs(success);
CREATE INDEX idx_logs_locker_numero ON access_logs(locker_numero) WHERE locker_numero IS NOT NULL;
CREATE INDEX idx_logs_user_timestamp ON access_logs(user_id, timestamp DESC);
CREATE INDEX idx_logs_failed_recent ON access_logs(timestamp DESC) WHERE success = false;

COMMENT ON TABLE access_logs IS 'Log completo di tutte le azioni del sistema';

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================

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

-- ============================================
-- Dati di Test
-- ============================================

-- Utenti test
INSERT INTO users (email, nome, cognome, telefono, badge_uid, tipo) VALUES
('mario.rossi@university.it', 'Mario', 'Rossi', '+393401234567', '04:5A:2F:1B:3C:6D:80', 'studente'),
('lucia.verdi@university.it', 'Lucia', 'Verdi', '+393407654321', NULL, 'admin'),
('paolo.bianchi@university.it', 'Paolo', 'Bianchi', '+393409876543', '04:7F:3C:2D:5E:8A:92', 'studente');

-- Armadietti test (5)
INSERT INTO lockers (numero, nfc_tag_uid, qr_code, stato, posizione) VALUES
('A01', '11:22:33:44:55:66:77', 'LOCKER_A01_x7k9m2p4', 'libero', 'Piano Terra - Zona A'),
('A02', '22:33:44:55:66:77:88', 'LOCKER_A02_b3n8q1w5', 'libero', 'Piano Terra - Zona A'),
('A03', '33:44:55:66:77:88:99', 'LOCKER_A03_c6r4t9y2', 'libero', 'Piano Terra - Zona A'),
('A04', '44:55:66:77:88:99:AA', 'LOCKER_A04_d1s7u3v8', 'libero', 'Piano Terra - Zona A'),
('A05', '55:66:77:88:99:AA:BB', 'LOCKER_A05_e9w2x5z1', 'libero', 'Piano Terra - Zona A');

-- TAG speciali (ingresso/uscita)
INSERT INTO special_tags (tipo, badge_uid, nfc_uid, qr_code, posizione) VALUES
('ingresso', 'AA:BB:CC:DD:EE:FF:00', 'AA:BB:CC:DD:EE:FF:01', 'ENTRANCE_MAIN_2025', 'Ingresso principale palestra'),
('uscita', 'FF:EE:DD:CC:BB:AA:00', 'FF:EE:DD:CC:BB:AA:01', 'EXIT_MAIN_2025', 'Uscita principale palestra');
```

---

#### Step 2: Esegui Migration su Supabase

**Opzione A: Via SQL Editor (Consigliato per principianti)**

1. Vai su Supabase Dashboard
2. Click **SQL Editor** (icona SQL a sinistra)
3. Click **"New Query"**
4. Copia TUTTO il contenuto del file `20250126_create_tables.sql`
5. Incolla nell'editor
6. Click **"Run"** (o F5)
7. Verifica output: "Success. No rows returned"

**Verifica creazione tabelle:**

1. Vai in **Table Editor** (icona tabella a sinistra)
2. Dovresti vedere: `users`, `lockers`, `special_tags`, `access_logs`

---

### 3.4 Crea Funzioni PostgreSQL

Crea file `supabase/migrations/20250126_create_functions.sql`:

```sql
-- ============================================
-- Smart Locker IoT - PostgreSQL Functions
-- ============================================

-- Funzione: identify_code
CREATE OR REPLACE FUNCTION identify_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_code IS NULL OR char_length(p_code) < 5 THEN
    RAISE EXCEPTION 'Codice non valido';
  END IF;

  -- Cerca in special_tags
  SELECT json_build_object('tipo', tipo, 'id', id, 'posizione', posizione, 'categoria', 'special_tag')
  INTO v_result
  FROM special_tags
  WHERE (nfc_uid = p_code OR qr_code = p_code OR badge_uid = p_code) AND attivo = true
  LIMIT 1;

  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  -- Cerca in lockers
  SELECT json_build_object('tipo', 'locker', 'id', id, 'numero', numero, 'stato', stato, 'categoria', 'locker')
  INTO v_result
  FROM lockers
  WHERE nfc_tag_uid = p_code OR qr_code = p_code
  LIMIT 1;

  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  RAISE EXCEPTION 'TAG/QR code non riconosciuto';
END;
$$;

GRANT EXECUTE ON FUNCTION identify_code(TEXT) TO authenticated;

-- Funzione: checkin_user (versione semplificata per test)
CREATE OR REPLACE FUNCTION checkin_user(
  p_user_id UUID,
  p_code TEXT,
  p_metodo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_locker RECORD;
BEGIN
  -- Validazione
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'user_id NULL'; END IF;
  IF p_metodo NOT IN ('badge', 'nfc', 'qr') THEN RAISE EXCEPTION 'Metodo non valido'; END IF;

  -- Trova armadietto libero
  SELECT * INTO v_locker FROM lockers WHERE stato = 'libero' ORDER BY numero LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RAISE EXCEPTION 'Nessun armadietto disponibile'; END IF;

  -- Assegna
  UPDATE lockers SET stato = 'occupato', user_id = p_user_id, timestamp_assegnazione = NOW() WHERE id = v_locker.id;

  -- Log
  INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success)
  VALUES (p_user_id, 'checkin', p_metodo, p_code, v_locker.numero, true);

  RETURN json_build_object('success', true, 'locker_assigned', v_locker.numero, 'locker_nfc_uid', v_locker.nfc_tag_uid, 'locker_qr_code', v_locker.qr_code);
END;
$$;

GRANT EXECUTE ON FUNCTION checkin_user(UUID, TEXT, TEXT) TO authenticated;

-- Funzione: unlock_locker (versione semplificata)
CREATE OR REPLACE FUNCTION unlock_locker(
  p_user_id UUID,
  p_code TEXT,
  p_metodo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_locker RECORD;
BEGIN
  SELECT * INTO v_locker FROM lockers WHERE nfc_tag_uid = p_code OR qr_code = p_code;
  IF NOT FOUND THEN RAISE EXCEPTION 'Armadietto non trovato'; END IF;
  IF v_locker.user_id != p_user_id THEN RAISE EXCEPTION 'Non autorizzato'; END IF;

  UPDATE lockers SET timestamp_ultimo_accesso = NOW() WHERE id = v_locker.id;

  INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success)
  VALUES (p_user_id, 'unlock', p_metodo, p_code, v_locker.numero, true);

  RETURN json_build_object('success', true, 'locker', v_locker.numero);
END;
$$;

GRANT EXECUTE ON FUNCTION unlock_locker(UUID, TEXT, TEXT) TO authenticated;

-- Funzione: checkout_user (versione semplificata)
CREATE OR REPLACE FUNCTION checkout_user(
  p_user_id UUID,
  p_code TEXT,
  p_metodo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_locker RECORD;
BEGIN
  SELECT * INTO v_locker FROM lockers WHERE user_id = p_user_id AND stato = 'occupato';
  IF NOT FOUND THEN RAISE EXCEPTION 'Nessun armadietto assegnato'; END IF;

  UPDATE lockers SET stato = 'libero', user_id = NULL, timestamp_assegnazione = NULL WHERE id = v_locker.id;

  INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success)
  VALUES (p_user_id, 'checkout', p_metodo, p_code, v_locker.numero, true);

  RETURN json_build_object('success', true, 'locker_released', v_locker.numero);
END;
$$;

GRANT EXECUTE ON FUNCTION checkout_user(UUID, TEXT, TEXT) TO authenticated;
```

**Esegui anche questo file nel SQL Editor di Supabase.**

---

### 3.5 Configura Row Level Security (RLS)

Crea file `supabase/migrations/20250126_create_policies.sql`:

```sql
-- ============================================
-- Smart Locker IoT - RLS Policies
-- ============================================

-- Abilita RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_tags ENABLE ROW LEVEL SECURITY;

-- Policy: users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_admin" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true)
);

-- Policy: lockers
CREATE POLICY "lockers_select_own" ON lockers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "lockers_select_admin" ON lockers FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true)
);

-- Policy: access_logs
CREATE POLICY "logs_select_own" ON access_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "logs_select_admin" ON access_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true)
);

-- Policy: special_tags
CREATE POLICY "special_tags_select_all" ON special_tags FOR SELECT TO authenticated USING (attivo = true);
```

**Esegui anche questo file nel SQL Editor.**

---

### 3.6 Test Database

Testa le funzioni create:

```sql
-- Test 1: identify_code
SELECT identify_code('ENTRANCE_MAIN_2025');
-- Dovrebbe ritornare: {"tipo": "ingresso", ...}

-- Test 2: Ottieni ID utente Mario
SELECT id FROM users WHERE email = 'mario.rossi@university.it';
-- Copia l'UUID

-- Test 3: checkin_user (sostituisci UUID con quello copiato)
SELECT checkin_user(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'ENTRANCE_MAIN_2025',
  'qr'
);
-- Dovrebbe assegnare armadietto A01

-- Test 4: Verifica assegnazione
SELECT * FROM lockers WHERE stato = 'occupato';
-- Dovrebbe mostrare A01 occupato

-- Test 5: Verifica log
SELECT * FROM access_logs;
-- Dovrebbe mostrare log del checkin
```

---

## 4. Setup Frontend Utenti

### 4.1 Inizializza Progetto React + TypeScript

```bash
cd C:\Users\micca\Desktop\Progetti\ProgettoIOT\frontend-user

# Crea progetto Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Installa dipendenze base
npm install

# Installa librerie progetto
npm install @supabase/supabase-js axios react-router-dom zustand @tanstack/react-query

# Installa UI e utility
npm install @mui/material @emotion/react @emotion/styled
npm install html5-qrcode
npm install date-fns
npm install react-hot-toast

# Installa dev dependencies e types
npm install -D @vitejs/plugin-react
npm install -D @types/node
```

---

### 4.2 Configura Variabili Ambiente

Crea file `frontend-user/.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANTE:** Sostituisci con le tue credenziali Supabase!

---

### 4.3 Configura TypeScript Types per Database

Crea file `frontend-user/src/types/database.types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nome: string
          cognome: string
          telefono: string | null
          badge_uid: string | null
          tipo: 'studente' | 'admin'
          attivo: boolean
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          nome: string
          cognome: string
          telefono?: string | null
          badge_uid?: string | null
          tipo?: 'studente' | 'admin'
          attivo?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          cognome?: string
          telefono?: string | null
          badge_uid?: string | null
          tipo?: 'studente' | 'admin'
          attivo?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      lockers: {
        Row: {
          id: number
          numero: string
          nfc_tag_uid: string | null
          qr_code: string
          stato: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id: string | null
          timestamp_assegnazione: string | null
          timestamp_ultimo_accesso: string | null
          created_at: string
          posizione: string | null
          note: string | null
        }
        Insert: {
          id?: number
          numero: string
          nfc_tag_uid?: string | null
          qr_code: string
          stato?: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id?: string | null
          timestamp_assegnazione?: string | null
          timestamp_ultimo_accesso?: string | null
          created_at?: string
          posizione?: string | null
          note?: string | null
        }
        Update: {
          id?: number
          numero?: string
          nfc_tag_uid?: string | null
          qr_code?: string
          stato?: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id?: string | null
          timestamp_assegnazione?: string | null
          timestamp_ultimo_accesso?: string | null
          created_at?: string
          posizione?: string | null
          note?: string | null
        }
      }
      access_logs: {
        Row: {
          id: number
          user_id: string | null
          locker_numero: string | null
          azione: 'checkin' | 'unlock' | 'checkout'
          metodo: 'badge' | 'nfc' | 'qr'
          code_scanned: string | null
          success: boolean
          error_message: string | null
          ip_address: string | null
          user_agent: string | null
          timestamp: string
          duration_ms: number | null
        }
      }
      special_tags: {
        Row: {
          id: number
          tipo: 'ingresso' | 'uscita'
          badge_uid: string | null
          nfc_uid: string | null
          qr_code: string
          posizione: string
          attivo: boolean
          created_at: string
        }
      }
    }
    Functions: {
      identify_code: {
        Args: { p_code: string }
        Returns: Json
      }
      checkin_user: {
        Args: { p_user_id: string; p_code: string; p_metodo: string }
        Returns: Json
      }
      unlock_locker: {
        Args: { p_user_id: string; p_code: string; p_metodo: string }
        Returns: Json
      }
      checkout_user: {
        Args: { p_user_id: string; p_code: string; p_metodo: string }
        Returns: Json
      }
    }
  }
}
```

---

### 4.4 Configura Supabase Client

Crea file `frontend-user/src/lib/supabaseClient.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables!");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

---

### 4.5 Crea Struttura Cartelle

```bash
cd frontend-user/src
mkdir -p components hooks services pages utils types lib
```

Struttura completa:

```
frontend-user/
├── public/
├── src/
│   ├── components/     # Componenti riutilizzabili (.tsx)
│   ├── hooks/         # Custom hooks (useNFC, useQRScanner) (.ts)
│   ├── services/      # API services (lockersService, authService) (.ts)
│   ├── pages/         # Pagine route (Login, Dashboard, ScanPage) (.tsx)
│   ├── utils/         # Utility functions (.ts)
│   ├── types/         # TypeScript types
│   │   └── database.types.ts
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

### 4.6 Test Iniziale

```bash
# Avvia dev server
npm run dev

# Apri browser: http://localhost:5173
```

Dovresti vedere la pagina di benvenuto Vite+React+TypeScript.

---

## 5. Setup Frontend Admin

### 5.1 Inizializza Progetto Admin + TypeScript

```bash
cd C:\Users\micca\Desktop\Progetti\ProgettoIOT\frontend-admin

# Crea progetto Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Installa dipendenze
npm install
npm install @supabase/supabase-js axios react-router-dom zustand @tanstack/react-query
npm install @mui/material @emotion/react @emotion/styled @mui/x-data-grid
npm install recharts date-fns react-hot-toast

# Dev dependencies e types
npm install -D @vitejs/plugin-react
npm install -D @types/node
```

---

### 5.2 Configura Variabili Ambiente

Crea file `frontend-admin/.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5.3 Crea TypeScript Types

Copia il file types dal frontend utenti:

```bash
# Da frontend-admin/src
mkdir -p types lib
cp ../frontend-user/src/types/database.types.ts types/
```

---

### 5.4 Crea Supabase Client Admin

Crea file `frontend-admin/src/lib/supabaseClient.ts` (stesso contenuto del frontend utenti):

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables!");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

---

### 5.5 Test Iniziale

```bash
npm run dev
# Apri: http://localhost:5174 (nota porta diversa)
```

---

## 6. Setup Hardware (Wokwi + PlatformIO)

### 6.1 Setup Wokwi Extension

**Wokwi è già installato come estensione VS Code (vedi prerequisiti).**

#### Crea Progetto Wokwi

1. Apri VS Code
2. Apri cartella `hardware/wokwi`
3. Premi **F1** → cerca **"Wokwi: New Project"**
4. Seleziona **"ESP32"**
5. Si creeranno automaticamente:
   - `diagram.json` (schema circuito)
   - `wokwi.toml` (config)
   - `sketch.ino` (codice Arduino)

---

#### Configura Circuito Wokwi

Sostituisci contenuto `diagram.json`:

```json
{
  "version": 1,
  "author": "Smart Lockers IoT",
  "editor": "wokwi",
  "parts": [
    {
      "type": "wokwi-esp32-devkit-v1",
      "id": "esp32",
      "top": 0,
      "left": 0,
      "attrs": {}
    },
    {
      "type": "wokwi-mfrc522",
      "id": "rfid1",
      "top": 50,
      "left": 250,
      "attrs": { "uid": "04:5A:2F:1B:3C:6D:80" }
    },
    {
      "type": "wokwi-relay-module",
      "id": "relay1",
      "top": 200,
      "left": 250,
      "attrs": { "label": "Serratura A01" }
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 350,
      "left": 250,
      "attrs": { "color": "green" }
    }
  ],
  "connections": [
    ["rfid1:SDA", "esp32:D5", "green", []],
    ["rfid1:SCK", "esp32:D18", "yellow", []],
    ["rfid1:MOSI", "esp32:D23", "orange", []],
    ["rfid1:MISO", "esp32:D19", "blue", []],
    ["rfid1:RST", "esp32:D22", "white", []],
    ["rfid1:GND", "esp32:GND.1", "black", []],
    ["rfid1:3.3V", "esp32:3V3", "red", []],
    ["relay1:IN", "esp32:D27", "purple", []],
    ["relay1:VCC", "esp32:5V", "red", []],
    ["relay1:GND", "esp32:GND.2", "black", []],
    ["led1:A", "esp32:D25", "green", []],
    ["led1:C", "esp32:GND.3", "black", []]
  ]
}
```

---

#### Test Wokwi

1. Apri `diagram.json` in VS Code
2. Premi **F1** → **"Wokwi: Start Simulation"**
3. Dovrebbe aprirsi simulatore con ESP32 + componenti

---

### 6.2 Setup PlatformIO

#### Installa PlatformIO Extension

**Già installata (vedi prerequisiti)**. Verifica:

- In VS Code, dovresti vedere icona "alieno" (PlatformIO) nella barra laterale sinistra

---

#### Crea Progetto PlatformIO

1. Click icona PlatformIO (alieno)
2. Click **"New Project"**
3. Compila:
   - **Name:** `smart-locker-esp32`
   - **Board:** Seleziona **"Espressif ESP32 Dev Module"**
   - **Framework:** **Arduino**
   - **Location:** Seleziona cartella `hardware/platformio`
4. Click **"Finish"**
5. Attendi download packages (prima volta: 5-10 minuti)

---

#### Configura platformio.ini

Apri `hardware/platformio/platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200

lib_deps =
    miguelbalboa/MFRC522@^1.4.10
    bblanchon/ArduinoJson@^6.21.3
```

---

#### Scrivi Codice Base ESP32

Crea `hardware/platformio/src/main.cpp`:

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPI.h>
#include <ArduinoJson.h>

// Pin definitions
#define SS_PIN 5
#define RST_PIN 22
#define RELAY_PIN 27
#define LED_PIN 25

// WiFi (MODIFICA CON LE TUE CREDENZIALI)
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Supabase (MODIFICA CON LE TUE CREDENZIALI)
const char* supabaseUrl = "https://xxxxx.supabase.co";
const char* supabaseKey = "your-anon-key";

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");

  // RFID
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RFID Reader Ready");
}

void loop() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = getCardUID();
    Serial.print("Badge: ");
    Serial.println(uid);

    // Blink LED
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    delay(2000);
  }
  delay(100);
}

String getCardUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) uid += ":";
  }
  uid.toUpperCase();
  return uid;
}
```

---

#### Compila e Testa

```bash
# Via CLI (opzionale)
cd hardware/platformio
pio run

# Oppure via VS Code:
# 1. Click icona PlatformIO (alieno)
# 2. Click "Build" (sotto PROJECT TASKS)
```

Se compila senza errori → **Setup completato!** ✅

---

## 7. Test Integrazione

### 7.1 Test Supabase Connection

Crea file `frontend-user/src/testSupabase.ts`:

```typescript
import { supabase } from "./lib/supabaseClient";

async function testConnection() {
  console.log("Testing Supabase connection...");

  // Test 1: Fetch lockers
  const { data, error } = await supabase
    .from("lockers")
    .select("*");

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("✅ Connected! Lockers:", data);
  }

  // Test 2: Fetch users (solo admin possono vedere tutti)
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, email, nome, cognome, tipo");

  if (usersError) {
    console.error("Users Error:", usersError.message);
  } else {
    console.log("✅ Users:", users);
  }
}

testConnection();
```

Esegui con ts-node (installa prima):

```bash
cd frontend-user
npm install -D ts-node
npx ts-node src/testSupabase.ts
```

Dovresti vedere lista armadietti.

---

## 8. Next Steps

✅ **Completato setup base!**

Prossimi passi:

1. **Implementare componenti frontend utenti:**
   - Login/Signup
   - Dashboard
   - NFC Scanner
   - QR Scanner

2. **Implementare dashboard admin:**
   - Griglia armadietti
   - Gestione utenti
   - Log accessi
   - Statistiche

3. **Completare codice ESP32:**
   - Chiamate HTTP a Supabase
   - Gestione errori e retry
   - Controllo relay per sblocco

4. **Testing e debug**

5. **Deploy production**

---

## 🆘 Troubleshooting

### Problema: npm install fallisce

**Soluzione:**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### Problema: Supabase connection error

**Verifica:**

1. URL e key corretti in `.env`
2. RLS policies configurate
3. Tabelle create correttamente

---

### Problema: Wokwi non parte

**Soluzione:**

1. Riavvia VS Code
2. Verifica estensione installata: Extensions → cerca "Wokwi"
3. Apri `diagram.json` e premi F1 → "Wokwi: Start Simulation"

---

### Problema: PlatformIO build error

**Soluzione:**

```bash
cd hardware/platformio
pio lib install
pio run --target clean
pio run
```

---

## 📞 Supporto

Se hai problemi, controlla:

- [Supabase Docs](https://supabase.com/docs)
- [Wokwi Docs](https://docs.wokwi.com)
- [PlatformIO Docs](https://docs.platformio.org)

---

**Buon lavoro! 🚀**
