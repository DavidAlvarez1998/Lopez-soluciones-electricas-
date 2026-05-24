-- =========================================================================
-- 0003_rls.sql — Row Level Security policies
-- =========================================================================
-- Modelo: anon SOLO puede INSERT en solicitudes_publicas.
--         authenticated tiene acceso total (Carlos es único admin en MVP).

ALTER TABLE clientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_publicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_cotizacion     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_cobro        ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_cuenta_cobro   ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE consecutivos_anuales ENABLE ROW LEVEL SECURITY;

-- solicitudes_publicas: INSERT abierto al anon, resto solo authenticated ------
CREATE POLICY "anon puede crear solicitudes"
  ON solicitudes_publicas FOR INSERT TO anon
  WITH CHECK (TRUE);

CREATE POLICY "auth lee todas las solicitudes"
  ON solicitudes_publicas FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "auth actualiza solicitudes"
  ON solicitudes_publicas FOR UPDATE TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth borra solicitudes"
  ON solicitudes_publicas FOR DELETE TO authenticated
  USING (TRUE);

-- Resto de tablas: solo authenticated, acceso total --------------------------
CREATE POLICY "auth todo clientes"
  ON clientes FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth todo cotizaciones"
  ON cotizaciones FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth todo items_cot"
  ON items_cotizacion FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth todo cc"
  ON cuentas_cobro FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth todo items_cc"
  ON items_cuenta_cobro FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth todo adjuntos"
  ON adjuntos FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "auth todo consecutivos"
  ON consecutivos_anuales FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Grants de funciones --------------------------------------------------------
REVOKE ALL ON FUNCTION next_consecutivo(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION next_consecutivo(TEXT) TO authenticated;

-- NOTA: anon NO tiene grant para next_consecutivo — solicitudes_publicas
-- NO crea consecutivo formal.
