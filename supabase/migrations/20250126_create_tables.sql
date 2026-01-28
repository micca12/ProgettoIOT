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
