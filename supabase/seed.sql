-- =========================================================================
-- seed.sql — datos de prueba (ejecutar después de migrations)
-- =========================================================================

-- Clientes ficticios
INSERT INTO clientes (nombre_razon_social, tipo_documento, numero_documento, telefono, correo, direccion, ciudad) VALUES
  ('Acueducto de Pereira', 'NIT', '800123456-1', '3104567890', 'contacto@acueducto.gov.co', 'Calle 17 # 8-43', 'Pereira'),
  ('Constructora Risaralda SAS', 'NIT', '900765432-2', '3156789012', 'info@constructorarisaralda.com', 'Av. 30 de Agosto # 35-12', 'Pereira'),
  ('Juan Carlos Ríos', 'CC', '1093456789', '3167891234', 'jcrios@gmail.com', 'Cra. 8 # 25-67', 'Dosquebradas')
ON CONFLICT (tipo_documento, numero_documento) DO NOTHING;

-- Solicitud pública de prueba
INSERT INTO solicitudes_publicas (nombre, telefono, descripcion, estado) VALUES
  ('Pedro Gómez', '3001234567', 'Necesito instalar un tablero eléctrico en mi casa de dos pisos. El actual no tiene suficiente capacidad.', 'nueva')
ON CONFLICT DO NOTHING;
