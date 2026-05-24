'use server';

import { createClient } from '@/lib/supabase/server';

export interface Adjunto {
  id: string;
  entidad_tipo: 'cotizacion' | 'cuenta_cobro' | 'cliente';
  entidad_id: string;
  storage_path: string;
  nombre_archivo: string;
  mime: string;
  tamano_bytes: number;
  created_at: string;
}

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function listarAdjuntos(
  entidad: 'cotizacion' | 'cuenta_cobro' | 'cliente',
  entidadId: string
): Promise<ActionResult<Adjunto[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('adjuntos')
    .select('id, entidad_tipo, entidad_id, storage_path, nombre_archivo, mime, tamano_bytes, created_at')
    .eq('entidad_tipo', entidad)
    .eq('entidad_id', entidadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listarAdjuntos error:', error);
    return { success: false, error: 'Error al cargar los adjuntos.' };
  }

  return { success: true, data: (data ?? []) as Adjunto[] };
}

export async function eliminarAdjunto(id: string): Promise<ActionResult> {
  const supabase = createClient();

  // Get the storage path before deleting the record
  const { data: adjunto, error: fetchError } = await supabase
    .from('adjuntos')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (fetchError || !adjunto) {
    return { success: false, error: 'Adjunto no encontrado.' };
  }

  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('adjuntos')
    .remove([adjunto.storage_path]);

  if (storageError) {
    console.error('eliminarAdjunto storage error:', storageError);
    // Continue to delete DB record even if storage fails (file might already be gone)
  }

  // Delete from table
  const { error: dbError } = await supabase
    .from('adjuntos')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('eliminarAdjunto db error:', dbError);
    return { success: false, error: 'Error al eliminar el adjunto.' };
  }

  return { success: true };
}

export async function generarSignedUrl(storagePath: string): Promise<ActionResult<{ url: string }>> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from('adjuntos')
    .createSignedUrl(storagePath, 3600); // 1 hour TTL

  if (error || !data?.signedUrl) {
    console.error('generarSignedUrl error:', error);
    return { success: false, error: 'No se pudo generar el enlace de descarga.' };
  }

  return { success: true, data: { url: data.signedUrl } };
}
