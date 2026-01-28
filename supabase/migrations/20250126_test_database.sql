-- ============================================
-- Smart Locker IoT - Database Tests
-- ============================================
-- Esegui questi test dopo aver creato tabelle, funzioni e policies
-- per verificare che tutto funzioni correttamente
-- ============================================

-- Test 1: identify_code - Verifica TAG ingresso
SELECT identify_code('ENTRANCE_MAIN_2025');
-- Risultato atteso: {"tipo": "ingresso", "id": 1, "posizione": "Ingresso principale palestra", "categoria": "special_tag"}

-- Test 2: identify_code - Verifica TAG uscita
SELECT identify_code('EXIT_MAIN_2025');
-- Risultato atteso: {"tipo": "uscita", "id": 2, "posizione": "Uscita principale palestra", "categoria": "special_tag"}

-- Test 3: identify_code - Verifica QR locker
SELECT identify_code('LOCKER_A01_x7k9m2p4');
-- Risultato atteso: {"tipo": "locker", "id": 1, "numero": "A01", "stato": "libero", "categoria": "locker"}

-- Test 4: Ottieni ID utente Mario Rossi
SELECT id, email, nome, cognome, badge_uid
FROM users
WHERE email = 'mario.rossi@university.it';
-- Copia l'UUID dell'utente per i prossimi test

-- Test 5: Verifica armadietti disponibili
SELECT numero, stato, nfc_tag_uid, qr_code, posizione
FROM lockers
WHERE stato = 'libero'
ORDER BY numero;
-- Risultato atteso: 5 armadietti liberi (A01-A05)

-- Test 6: checkin_user - Assegna armadietto a Mario
-- IMPORTANTE: Sostituisci l'UUID con quello ottenuto dal Test 4
SELECT checkin_user(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  'ENTRANCE_MAIN_2025',
  'qr'
);
-- Risultato atteso: {"success": true, "locker_assigned": "A01", ...}

-- Test 7: Verifica assegnazione locker
SELECT numero, stato, user_id, timestamp_assegnazione
FROM lockers
WHERE stato = 'occupato';
-- Risultato atteso: A01 occupato da Mario

-- Test 8: Verifica log checkin
SELECT user_id, locker_numero, azione, metodo, success, timestamp
FROM access_logs
ORDER BY timestamp DESC
LIMIT 1;
-- Risultato atteso: log del checkin di Mario

-- Test 9: unlock_locker - Sblocca armadietto A01 con NFC
SELECT unlock_locker(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  '11:22:33:44:55:66:77',
  'nfc'
);
-- Risultato atteso: {"success": true, "locker": "A01"}

-- Test 10: Verifica timestamp ultimo accesso
SELECT numero, timestamp_assegnazione, timestamp_ultimo_accesso
FROM lockers
WHERE numero = 'A01';
-- Risultato atteso: timestamp_ultimo_accesso aggiornato

-- Test 11: checkout_user - Rilascia armadietto
SELECT checkout_user(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  'EXIT_MAIN_2025',
  'qr'
);
-- Risultato atteso: {"success": true, "locker_released": "A01"}

-- Test 12: Verifica rilascio armadietto
SELECT numero, stato, user_id
FROM lockers
WHERE numero = 'A01';
-- Risultato atteso: A01 di nuovo libero, user_id = NULL

-- Test 13: Verifica log completo sessione
SELECT azione, locker_numero, metodo, success, timestamp
FROM access_logs
WHERE user_id = (SELECT id FROM users WHERE email = 'mario.rossi@university.it')
ORDER BY timestamp ASC;
-- Risultato atteso: 3 log (checkin, unlock, checkout)

-- Test 14: Conteggio armadietti per stato
SELECT stato, COUNT(*) as totale
FROM lockers
GROUP BY stato;
-- Risultato atteso: 5 liberi

-- Test 15: Test errore - Checkin con UUID non valido
SELECT checkin_user(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ENTRANCE_MAIN_2025',
  'qr'
);
-- Risultato atteso: Errore o nessun armadietto assegnato

-- ============================================
-- Test Completato!
-- ============================================
-- Se tutti i test sopra funzionano correttamente,
-- il database è configurato correttamente e pronto per l'uso.
