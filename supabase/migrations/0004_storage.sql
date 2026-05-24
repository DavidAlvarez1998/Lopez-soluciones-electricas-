-- =========================================================================
-- 0004_storage.sql — bucket 'adjuntos', acceso privado
-- =========================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('adjuntos', 'adjuntos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Solo authenticated puede subir y leer
CREATE POLICY "auth lee adjuntos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'adjuntos');

CREATE POLICY "auth sube adjuntos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'adjuntos');

CREATE POLICY "auth actualiza adjuntos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'adjuntos');

CREATE POLICY "auth borra adjuntos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'adjuntos');
