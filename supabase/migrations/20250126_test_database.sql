-- query di test, eseguire dopo le migration

-- controlla tag ingresso/uscita
SELECT identify_code('ENTRANCE_MAIN_2025');
SELECT identify_code('EXIT_MAIN_2025');
SELECT identify_code('LOCKER_A01_x7k9m2p4');

-- prendo l'id di mario per i test
SELECT id, email, badge_uid FROM users WHERE email = 'mario.rossi@university.it';

-- vedo se ci sono locker liberi
SELECT numero, stato FROM lockers WHERE stato = 'libero' ORDER BY numero;

-- checkin di mario
SELECT checkin_user(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  'ENTRANCE_MAIN_2025',
  'qr'
);

-- controllo che il locker sia stato assegnato
SELECT numero, stato, user_id FROM lockers WHERE stato = 'occupato';

-- unlock col tag nfc del locker
SELECT unlock_locker(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  '11:22:33:44:55:66:77',
  'nfc'
);

-- checkout
SELECT checkout_user(
  (SELECT id FROM users WHERE email = 'mario.rossi@university.it'),
  'EXIT_MAIN_2025',
  'qr'
);

-- alla fine dovrebbe essere tutto libero di nuovo
SELECT numero, stato FROM lockers ORDER BY numero;
