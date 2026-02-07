-- ============================================
-- Funzione: locker_unlock
-- ============================================
-- Sblocco armadietto specifico via badge/NFC
-- Verifica che l'utente abbia l'armadietto corretto assegnato
--
-- Chiamata: SELECT locker_unlock('04:5A:2F:1B', 'A01', 'badge');
-- Ritorna: JSON con success, messaggio, info utente
-- ============================================

CREATE OR REPLACE FUNCTION public.locker_unlock(
  p_badge_uid TEXT,
  p_locker_numero TEXT,
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
BEGIN
  -- Validazione input
  IF p_badge_uid IS NULL OR char_length(p_badge_uid) < 2 THEN
    RETURN json_build_object('success', false, 'error', 'Badge UID non valido');
  END IF;

  IF p_locker_numero IS NULL OR char_length(p_locker_numero) < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Numero locker non valido');
  END IF;

  IF p_metodo NOT IN ('badge', 'nfc', 'qr') THEN
    p_metodo := 'badge';
  END IF;

  -- 1. Cerca utente dal badge_uid
  SELECT * INTO v_user
  FROM users
  WHERE badge_uid = p_badge_uid AND attivo = true;

  IF NOT FOUND THEN
    -- Log tentativo fallito - badge non riconosciuto
    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success, error_message)
    VALUES (NULL, 'unlock', p_metodo, p_badge_uid, p_locker_numero, false, 'Badge non riconosciuto');

    RETURN json_build_object(
      'success', false,
      'error', 'Badge non riconosciuto'
    );
  END IF;

  -- 2. Cerca il locker specifico
  SELECT * INTO v_locker
  FROM lockers
  WHERE numero = p_locker_numero;

  IF NOT FOUND THEN
    -- Locker non esiste
    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success, error_message)
    VALUES (v_user.id, 'unlock', p_metodo, p_badge_uid, p_locker_numero, false, 'Locker non trovato');

    RETURN json_build_object(
      'success', false,
      'error', 'Locker non trovato',
      'utente', v_user.nome || ' ' || v_user.cognome
    );
  END IF;

  -- 3. Verifica che questo locker sia assegnato a questo utente
  IF v_locker.user_id IS NULL OR v_locker.user_id != v_user.id THEN
    -- Locker non assegnato a questo utente
    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success, error_message)
    VALUES (v_user.id, 'unlock', p_metodo, p_badge_uid, p_locker_numero, false, 'Locker non assegnato a questo utente');

    RETURN json_build_object(
      'success', false,
      'error', 'Questo armadietto non è assegnato a te',
      'utente', v_user.nome || ' ' || v_user.cognome,
      'locker_richiesto', p_locker_numero
    );
  END IF;

  -- 4. Verifica stato locker (potrebbe essere in manutenzione)
  IF v_locker.stato = 'manutenzione' OR v_locker.stato = 'fuori_servizio' THEN
    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success, error_message)
    VALUES (v_user.id, 'unlock', p_metodo, p_badge_uid, p_locker_numero, false, 'Locker in manutenzione');

    RETURN json_build_object(
      'success', false,
      'error', 'Armadietto in manutenzione',
      'utente', v_user.nome || ' ' || v_user.cognome,
      'locker', p_locker_numero
    );
  END IF;

  -- 5. SUCCESS! Autorizza unlock
  -- Aggiorna timestamp ultimo accesso
  UPDATE lockers
  SET timestamp_ultimo_accesso = NOW()
  WHERE id = v_locker.id;

  -- Log accesso riuscito
  INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success)
  VALUES (v_user.id, 'unlock', p_metodo, p_badge_uid, p_locker_numero, true);

  RETURN json_build_object(
    'success', true,
    'azione', 'unlock',
    'utente', v_user.nome || ' ' || v_user.cognome,
    'locker', p_locker_numero,
    'messaggio', 'Accesso autorizzato. Armadietto sbloccato!'
  );

END;
$$;

-- Permessi: anon e authenticated possono chiamare questa funzione
GRANT EXECUTE ON FUNCTION public.locker_unlock(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.locker_unlock(TEXT, TEXT, TEXT) TO authenticated;

-- Commento
COMMENT ON FUNCTION public.locker_unlock IS 'Sblocca armadietto specifico se badge corrisponde all''utente assegnato';
