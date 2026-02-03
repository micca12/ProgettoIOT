-- Trigger: crea automaticamente un profilo in public.users
-- quando un nuovo utente si registra tramite Supabase Auth.
-- Il tipo di default e' 'studente'. Per gli admin, modificare manualmente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, cognome, tipo, attivo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'nome', ''), 'Da compilare'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'cognome', ''), 'Da compilare'),
    COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'studente'),
    true
  );
  RETURN NEW;
END;
$$;

-- Trigger su auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
