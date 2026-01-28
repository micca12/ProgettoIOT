-- ============================================
-- Smart Locker IoT - RLS Policies
-- ============================================

-- Abilita RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_tags ENABLE ROW LEVEL SECURITY;

-- Policy: users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_admin" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true)
);

-- Policy: lockers
CREATE POLICY "lockers_select_own" ON lockers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "lockers_select_admin" ON lockers FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true)
);

-- Policy: access_logs
CREATE POLICY "logs_select_own" ON access_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "logs_select_admin" ON access_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND tipo = 'admin' AND attivo = true)
);

-- Policy: special_tags
CREATE POLICY "special_tags_select_all" ON special_tags FOR SELECT TO authenticated USING (attivo = true);
