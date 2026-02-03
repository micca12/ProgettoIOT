-- Fix: infinite recursion in RLS policies
-- Le policy admin facevano una subquery su "users" dalla stessa tabella "users",
-- causando ricorsione infinita. Soluzione: funzione SECURITY DEFINER che
-- bypassa RLS internamente.

-- 1. Funzione helper SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND tipo = 'admin'
      AND attivo = true
  );
$$;

-- 2. Rimuovi le policy ricorsive
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "lockers_select_admin" ON lockers;
DROP POLICY IF EXISTS "logs_select_admin" ON access_logs;

-- 3. Ricrea SELECT policy senza ricorsione
CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "lockers_select_admin" ON lockers
  FOR SELECT USING (is_admin());

CREATE POLICY "logs_select_admin" ON access_logs
  FOR SELECT USING (is_admin());

-- 4. Policy INSERT/UPDATE per admin (CRUD dalla dashboard)
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (is_admin());

CREATE POLICY "lockers_insert_admin" ON lockers
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "lockers_update_admin" ON lockers
  FOR UPDATE USING (is_admin());
