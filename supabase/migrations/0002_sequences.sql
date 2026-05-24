-- =========================================================================
-- 0002_sequences.sql — consecutivos atómicos sin colisiones
-- =========================================================================
-- Estrategia: una sequence por (tipo, año). Se crean on-demand.
-- Formato: COT-{YYYY}-{NNN}  |  COB-{YYYY}-{NNN}

CREATE TABLE consecutivos_anuales (
  tipo          TEXT NOT NULL,    -- 'COT' | 'COB'
  anio          INT NOT NULL,
  sequence_name TEXT NOT NULL,
  PRIMARY KEY (tipo, anio)
);

CREATE OR REPLACE FUNCTION next_consecutivo(p_tipo TEXT)
RETURNS TABLE(consecutivo TEXT, numero_seq BIGINT)
LANGUAGE plpgsql AS $$
DECLARE
  v_anio     INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  v_seq_name TEXT;
  v_next     BIGINT;
BEGIN
  IF p_tipo NOT IN ('COT', 'COB') THEN
    RAISE EXCEPTION 'Tipo de consecutivo inválido: %', p_tipo;
  END IF;

  SELECT ca.sequence_name INTO v_seq_name
    FROM consecutivos_anuales ca
    WHERE ca.tipo = p_tipo AND ca.anio = v_anio;

  IF v_seq_name IS NULL THEN
    v_seq_name := FORMAT('seq_%s_%s', LOWER(p_tipo), v_anio);
    EXECUTE FORMAT('CREATE SEQUENCE IF NOT EXISTS %I START 1 INCREMENT 1', v_seq_name);
    INSERT INTO consecutivos_anuales(tipo, anio, sequence_name)
      VALUES (p_tipo, v_anio, v_seq_name)
      ON CONFLICT (tipo, anio) DO NOTHING;
  END IF;

  EXECUTE FORMAT('SELECT nextval(%L)', v_seq_name) INTO v_next;

  consecutivo := FORMAT('%s-%s-%s', p_tipo, v_anio, LPAD(v_next::TEXT, 3, '0'));
  numero_seq  := v_next;
  RETURN NEXT;
END $$;

-- Función de búsqueda de clientes con pg_trgm --------------------------------
CREATE OR REPLACE FUNCTION buscar_clientes(q TEXT, lim INT DEFAULT 10)
RETURNS SETOF clientes
LANGUAGE SQL STABLE AS $$
  SELECT * FROM clientes
  WHERE activo
    AND (
      lower(unaccent(nombre_razon_social)) LIKE '%' || lower(unaccent(q)) || '%'
      OR numero_documento LIKE q || '%'
    )
  ORDER BY similarity(lower(unaccent(nombre_razon_social)), lower(unaccent(q))) DESC
  LIMIT lim;
$$;

GRANT EXECUTE ON FUNCTION buscar_clientes(TEXT, INT) TO authenticated;
