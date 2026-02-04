-- Funzione unica per accesso via badge dall'ESP32.
-- L'ESP32 usa la anon key (no sessione utente), quindi serve
-- una funzione SECURITY DEFINER che fa tutto internamente:
--   1. Cerca utente dal badge_uid
--   2. Se l'utente ha un locker occupato -> checkout (uscita)
--   3. Se l'utente non ha locker -> checkin (ingresso, assegna locker)
--   4. Logga tutto in access_logs
--
-- Chiamata: SELECT badge_access('04:5A:2F:1B', 'badge');

CREATE OR REPLACE FUNCTION public.badge_access(
  p_badge_uid TEXT,
  p_metodo TEXT DEFAULT 'badge'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_locker RECORD;
  v_free_locker RECORD;
BEGIN
  -- Validazione
  IF p_badge_uid IS NULL OR char_length(p_badge_uid) < 2 THEN
    RETURN json_build_object('success', false, 'error', 'Badge UID non valido');
  END IF;

  IF p_metodo NOT IN ('badge', 'nfc', 'qr') THEN
    p_metodo := 'badge';
  END IF;

  -- 1. Cerca utente dal badge_uid
  SELECT * INTO v_user
  FROM users
  WHERE badge_uid = p_badge_uid AND attivo = true;

  IF NOT FOUND THEN
    -- Log tentativo fallito
    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, success, error_message)
    VALUES (NULL, 'checkin', p_metodo, p_badge_uid, false, 'Badge non riconosciuto');

    RETURN json_build_object(
      'success', false,
      'error', 'Badge non riconosciuto'
    );
  END IF;

  -- 2. Controlla se l'utente ha gia' un locker occupato
  SELECT * INTO v_locker
  FROM lockers
  WHERE user_id = v_user.id AND stato = 'occupato';

  IF FOUND THEN
    -- ========== CHECKOUT (uscita) ==========
    UPDATE lockers
    SET stato = 'libero',
        user_id = NULL,
        timestamp_assegnazione = NULL
    WHERE id = v_locker.id;

    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success)
    VALUES (v_user.id, 'checkout', p_metodo, p_badge_uid, v_locker.numero, true);

    RETURN json_build_object(
      'success', true,
      'azione', 'checkout',
      'utente', v_user.nome || ' ' || v_user.cognome,
      'locker_rilasciato', v_locker.numero,
      'messaggio', 'Uscita registrata. Arrivederci!'
    );
  ELSE
    -- ========== CHECKIN (ingresso) ==========
    -- Cerca primo locker libero
    SELECT * INTO v_free_locker
    FROM lockers
    WHERE stato = 'libero'
    ORDER BY numero
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
      INSERT INTO access_logs (user_id, azione, metodo, code_scanned, success, error_message)
      VALUES (v_user.id, 'checkin', p_metodo, p_badge_uid, false, 'Nessun armadietto disponibile');

      RETURN json_build_object(
        'success', false,
        'error', 'Nessun armadietto disponibile',
        'utente', v_user.nome || ' ' || v_user.cognome
      );
    END IF;

    UPDATE lockers
    SET stato = 'occupato',
        user_id = v_user.id,
        timestamp_assegnazione = NOW(),
        timestamp_ultimo_accesso = NOW()
    WHERE id = v_free_locker.id;

    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success)
    VALUES (v_user.id, 'checkin', p_metodo, p_badge_uid, v_free_locker.numero, true);

    RETURN json_build_object(
      'success', true,
      'azione', 'checkin',
      'utente', v_user.nome || ' ' || v_user.cognome,
      'locker_assegnato', v_free_locker.numero,
      'messaggio', 'Ingresso registrato. Benvenuto!'
    );
  END IF;
END;
$$;

-- Permetti all'anon key di chiamare questa funzione (usata dall'ESP32)
GRANT EXECUTE ON FUNCTION public.badge_access(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.badge_access(TEXT, TEXT) TO authenticated;
