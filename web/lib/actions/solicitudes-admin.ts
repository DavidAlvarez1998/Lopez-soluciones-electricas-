'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

type EstadoSolicitud = 'nueva' | 'atendida' | 'descartada';

export async function listarSolicitudes() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('solicitudes_publicas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: 'Error al listar solicitudes.' };
  }

  return { success: true, data: data ?? [] };
}

export async function actualizarEstadoSolicitud(
  id: string,
  estado: EstadoSolicitud
): Promise<ActionResult> {
  const supabase = createClient();

  const { error } = await supabase
    .from('solicitudes_publicas')
    .update({
      estado,
      atendida_at: estado === 'atendida' ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    console.error('actualizarEstadoSolicitud error:', error);
    return { success: false, error: 'Error al actualizar el estado.' };
  }

  revalidatePath('/admin/solicitudes');
  return { success: true };
}

export async function convertirSolicitudACotizacion(
  id: string
): Promise<ActionResult<{ cotizacionId: string }>> {
  const supabase = createClient();

  // Get the solicitud
  const { data: solicitud, error: fetchError } = await supabase
    .from('solicitudes_publicas')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !solicitud) {
    return { success: false, error: 'No se encontró la solicitud.' };
  }

  // Get the consecutivo
  const { data: consec, error: consecError } = await supabase
    .rpc('next_consecutivo', { p_tipo: 'COT' })
    .single();

  if (consecError || !consec) {
    console.error('next_consecutivo error:', consecError);
    return { success: false, error: 'Error al generar el consecutivo.' };
  }

  // We need a cliente_id — for now create a placeholder or require selection
  // Since converting from solicitud doesn't have a cliente yet, redirect to nueva cotizacion with query params
  // Mark solicitud as atendida
  await supabase
    .from('solicitudes_publicas')
    .update({ estado: 'atendida', atendida_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/solicitudes');

  // Redirect to new cotizacion form pre-populated with solicitud data
  redirect(`/admin/cotizaciones/nuevo?solicitud_id=${id}`);
}
