-- ============================================
-- Smart Locker IoT - Nuova Funzione per Badge Utente
-- ============================================

-- Funzione: identify_user_by_badge
-- Cerca un utente per badge_uid e restituisce le info per lo smart locker
CREATE OR REPLACE FUNCTION identify_user_by_badge(p_badge_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_result JSON;
BEGIN
  IF p_badge_code IS NULL OR char_length(p_badge_code) < 5 THEN
    RAISE EXCEPTION 'Codice badge non valido';
  END IF;

  -- Cerca l'utente per badge_uid
  SELECT id, email, nome, cognome, badge_uid, tipo, attivo
  INTO v_user
  FROM users
  WHERE badge_uid = p_badge_code AND attivo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  -- Restituisci le info utente
  v_result := json_build_object(
    'authorized', true,
    'user_id', v_user.id,
    'email', v_user.email,
    'nome', v_user.nome,
    'cognome', v_user.cognome,
    'tipo', v_user.tipo,
    'categoria', 'user'
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION identify_user_by_badge(TEXT) TO anon, authenticated;
