-- sblocco armadietto dal dispositivo smart locker

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

  IF v_locker.user_id IS NULL OR v_locker.user_id != v_user.id THEN
    INSERT INTO access_logs (user_id, azione, metodo, code_scanned, locker_numero, success, error_message)
    VALUES (v_user.id, 'unlock', p_metodo, p_badge_uid, p_locker_numero, false, 'Locker non assegnato a questo utente');

    RETURN json_build_object(
      'success', false,
      'error', 'Questo armadietto non è assegnato a te',
      'utente', v_user.nome || ' ' || v_user.cognome,
      'locker_richiesto', p_locker_numero
    );
  END IF;

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

  UPDATE lockers
  SET timestamp_ultimo_accesso = NOW()
  WHERE id = v_locker.id;

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

-- anche qui serve anon per l'esp32
GRANT EXECUTE ON FUNCTION public.locker_unlock(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.locker_unlock(TEXT, TEXT, TEXT) TO authenticated;
