-- =========================================================================
-- 0001_init.sql — extensiones, enums, tablas, índices, triggers
-- =========================================================================

-- Extensions ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums --------------------------------------------------------------------
CREATE TYPE tipo_documento_cliente AS ENUM ('NIT', 'CC', 'CE', 'PASAPORTE');
CREATE TYPE estado_solicitud_publica AS ENUM ('nueva', 'atendida', 'descartada');
CREATE TYPE estado_cotizacion AS ENUM ('pendiente', 'aprobada', 'rechazada');
CREATE TYPE estado_cuenta_cobro AS ENUM ('pendiente', 'pagada', 'anulada');
CREATE TYPE entidad_adjunto AS ENUM ('cotizacion', 'cuenta_cobro', 'cliente');

-- clientes -----------------------------------------------------------------
CREATE TABLE clientes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_razon_social TEXT NOT NULL,
  tipo_documento      tipo_documento_cliente NOT NULL DEFAULT 'NIT',
  numero_documento    TEXT NOT NULL,
  direccion           TEXT,
  ciudad              TEXT DEFAULT 'Pereira',
  departamento        TEXT DEFAULT 'Risaralda',
  telefono            TEXT,
  correo              TEXT,
  notas               TEXT,
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clientes_documento_unq UNIQUE (tipo_documento, numero_documento),
  CONSTRAINT clientes_nombre_chk CHECK (length(trim(nombre_razon_social)) > 0)
);

-- Índice trigram para búsqueda por nombre (sin unaccent para evitar problemas de schema)
CREATE INDEX clientes_nombre_trgm_idx
  ON clientes USING GIN (lower(nombre_razon_social) gin_trgm_ops);

CREATE INDEX clientes_documento_idx ON clientes (numero_documento);
CREATE INDEX clientes_activo_idx ON clientes (activo) WHERE activo = TRUE;

-- solicitudes_publicas -----------------------------------------------------
CREATE TABLE solicitudes_publicas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_servicio DATE,
  nombre        TEXT NOT NULL,
  contacto      TEXT,
  telefono      TEXT NOT NULL,
  direccion     TEXT,
  descripcion   TEXT NOT NULL,
  estado        estado_solicitud_publica NOT NULL DEFAULT 'nueva',
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cotizacion_id UUID,
  ip_origen     INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendida_at   TIMESTAMPTZ,
  CONSTRAINT solicitudes_nombre_chk CHECK (length(trim(nombre)) > 0),
  CONSTRAINT solicitudes_descripcion_chk CHECK (length(trim(descripcion)) > 0)
);

CREATE INDEX solicitudes_estado_idx ON solicitudes_publicas (estado, created_at DESC);

-- cotizaciones -------------------------------------------------------------
CREATE TABLE cotizaciones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consecutivo      TEXT NOT NULL UNIQUE,
  numero_seq       BIGINT NOT NULL,
  cliente_id       UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  solicitud_id     UUID REFERENCES solicitudes_publicas(id) ON DELETE SET NULL,
  concepto         TEXT NOT NULL,
  observaciones    TEXT,
  subtotal         NUMERIC(14,2) NOT NULL DEFAULT 0,
  total            NUMERIC(14,2) NOT NULL DEFAULT 0,
  estado           estado_cotizacion NOT NULL DEFAULT 'pendiente',
  fecha_emision    DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_validez    DATE,
  fecha_aprobacion DATE,
  fecha_rechazo    DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cotizaciones_total_nonneg CHECK (total >= 0)
);

CREATE INDEX cotizaciones_cliente_idx ON cotizaciones (cliente_id, created_at DESC);
CREATE INDEX cotizaciones_estado_idx ON cotizaciones (estado, created_at DESC);
CREATE INDEX cotizaciones_consecutivo_idx ON cotizaciones (numero_seq DESC);

-- FK diferida solicitudes → cotizaciones
ALTER TABLE solicitudes_publicas
  ADD CONSTRAINT solicitudes_cotizacion_fk
  FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE SET NULL;

-- items_cotizacion ---------------------------------------------------------
CREATE TABLE items_cotizacion (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  orden         SMALLINT NOT NULL,
  descripcion   TEXT NOT NULL,
  cantidad      NUMERIC(12,2) NOT NULL DEFAULT 1,
  valor_unidad  NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_total   NUMERIC(14,2) NOT NULL
                GENERATED ALWAYS AS (ROUND(cantidad * valor_unidad, 2)) STORED,
  CONSTRAINT items_cot_cantidad_chk CHECK (cantidad > 0),
  CONSTRAINT items_cot_valor_chk CHECK (valor_unidad >= 0),
  CONSTRAINT items_cot_descripcion_chk CHECK (length(trim(descripcion)) > 0),
  UNIQUE (cotizacion_id, orden)
);

CREATE INDEX items_cot_cotizacion_idx ON items_cotizacion (cotizacion_id, orden);

-- cuentas_cobro ------------------------------------------------------------
CREATE TABLE cuentas_cobro (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consecutivo   TEXT NOT NULL UNIQUE,
  numero_seq    BIGINT NOT NULL,
  cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
  concepto      TEXT NOT NULL,
  observaciones TEXT,
  subtotal      NUMERIC(14,2) NOT NULL DEFAULT 0,
  total         NUMERIC(14,2) NOT NULL DEFAULT 0,
  estado        estado_cuenta_cobro NOT NULL DEFAULT 'pendiente',
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_pago    DATE,
  metodo_pago   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cc_total_nonneg CHECK (total >= 0),
  CONSTRAINT cc_pago_consistente CHECK (
    (estado = 'pagada' AND fecha_pago IS NOT NULL) OR
    (estado <> 'pagada' AND fecha_pago IS NULL)
  )
);

CREATE INDEX cc_cliente_idx ON cuentas_cobro (cliente_id, created_at DESC);
CREATE INDEX cc_estado_idx ON cuentas_cobro (estado, created_at DESC);
CREATE INDEX cc_consecutivo_idx ON cuentas_cobro (numero_seq DESC);

-- items_cuenta_cobro -------------------------------------------------------
CREATE TABLE items_cuenta_cobro (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_cobro_id UUID NOT NULL REFERENCES cuentas_cobro(id) ON DELETE CASCADE,
  orden           SMALLINT NOT NULL,
  descripcion     TEXT NOT NULL,
  cantidad        NUMERIC(12,2) NOT NULL DEFAULT 1,
  valor_unidad    NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_total     NUMERIC(14,2) NOT NULL
                  GENERATED ALWAYS AS (ROUND(cantidad * valor_unidad, 2)) STORED,
  CONSTRAINT items_cc_cantidad_chk CHECK (cantidad > 0),
  CONSTRAINT items_cc_valor_chk CHECK (valor_unidad >= 0),
  CONSTRAINT items_cc_descripcion_chk CHECK (length(trim(descripcion)) > 0),
  UNIQUE (cuenta_cobro_id, orden)
);

CREATE INDEX items_cc_cuenta_idx ON items_cuenta_cobro (cuenta_cobro_id, orden);

-- adjuntos -----------------------------------------------------------------
CREATE TABLE adjuntos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidad_tipo   entidad_adjunto NOT NULL,
  entidad_id     UUID NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'adjuntos',
  storage_path   TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  mime           TEXT NOT NULL,
  tamano_bytes   BIGINT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT adjuntos_tamano_chk CHECK (tamano_bytes > 0 AND tamano_bytes < 10485760)
);

CREATE INDEX adjuntos_entidad_idx ON adjuntos (entidad_tipo, entidad_id);

-- =========================================================================
-- Triggers — updated_at
-- =========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_clientes_updated
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cotizaciones_updated
  BEFORE UPDATE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cc_updated
  BEFORE UPDATE ON cuentas_cobro
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- Triggers — recalcular totales
-- =========================================================================
CREATE OR REPLACE FUNCTION recalc_cotizacion_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_id  UUID;
  v_sub NUMERIC(14,2);
BEGIN
  v_id := COALESCE(NEW.cotizacion_id, OLD.cotizacion_id);
  SELECT COALESCE(SUM(valor_total), 0) INTO v_sub
    FROM items_cotizacion WHERE cotizacion_id = v_id;
  UPDATE cotizaciones
    SET subtotal = v_sub, total = v_sub, updated_at = NOW()
    WHERE id = v_id;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_items_cot_recalc
  AFTER INSERT OR UPDATE OR DELETE ON items_cotizacion
  FOR EACH ROW EXECUTE FUNCTION recalc_cotizacion_total();

CREATE OR REPLACE FUNCTION recalc_cuenta_cobro_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_id  UUID;
  v_sub NUMERIC(14,2);
BEGIN
  v_id := COALESCE(NEW.cuenta_cobro_id, OLD.cuenta_cobro_id);
  SELECT COALESCE(SUM(valor_total), 0) INTO v_sub
    FROM items_cuenta_cobro WHERE cuenta_cobro_id = v_id;
  UPDATE cuentas_cobro
    SET subtotal = v_sub, total = v_sub, updated_at = NOW()
    WHERE id = v_id;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_items_cc_recalc
  AFTER INSERT OR UPDATE OR DELETE ON items_cuenta_cobro
  FOR EACH ROW EXECUTE FUNCTION recalc_cuenta_cobro_total();
