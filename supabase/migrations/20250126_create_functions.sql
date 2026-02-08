-- funzione per identificare un codice (nfc, qr, badge)
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

-- checkin: assegna un armadietto libero
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

-- sblocca il locker assegnato
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

-- checkout: rilascia l'armadietto
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
