-- =========================================================================
-- 0005_seed_admin.sql — nota informativa sobre el usuario admin
-- =========================================================================
-- El usuario admin NO se crea por SQL.
-- El hashing y sincronización con auth.users lo hace Supabase.
--
-- Pasos manuales:
--   1. Dashboard Supabase → Authentication → Users → "Add user"
--   2. Email: lopezosoriocarlosandres@gmail.com
--   3. Password: elegir uno temporal seguro (16 chars mínimo)
--   4. Carlos cambia el password en el primer login.

SELECT 'Admin user must be created via Supabase Dashboard → Authentication → Users' AS instruccion;
