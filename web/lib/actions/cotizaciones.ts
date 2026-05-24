'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ItemCotizacion {
  descripcion: string;
  valor: number;
}

const ItemSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  valor: z.number().min(0, 'El valor debe ser mayor o igual a 0'),
});

const CotizacionSchema = z.object({
  cliente_id: z.string().uuid('Seleccioná un cliente válido'),
  concepto: z.string().min(1, 'El concepto es requerido').max(500),
  observaciones: z.string().max(1000).optional().default(''),
  solicitud_id: z.string().uuid().optional().nullable(),
  items: z.array(ItemSchema).min(1, 'Debe incluir al menos un ítem'),
});

export type CotizacionFormData = {
  cliente_id: string;
  concepto: string;
  observaciones?: string;
  solicitud_id?: string | null;
  items: ItemCotizacion[];
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function crearCotizacion(
  data: CotizacionFormData
): Promise<ActionResult<{ id: string; consecutivo: string }>> {
  const parsed = CotizacionSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  const supabase = createClient();

  // Get consecutivo atomically
  const { data: consec, error: consecError } = await supabase
    .rpc('next_consecutivo', { p_tipo: 'COT' })
    .single();

  if (consecError || !consec) {
    console.error('next_consecutivo error:', consecError);
    return { success: false, error: 'Error al generar el consecutivo. Verificá que las migraciones estén aplicadas.' };
  }

  const { consecutivo, numero_seq } = consec as { consecutivo: string; numero_seq: number };

  // Insert cotizacion
  const { data: cotizacion, error: cotError } = await supabase
    .from('cotizaciones')
    .insert({
      consecutivo,
      numero_seq,
      cliente_id: parsed.data.cliente_id,
      concepto: parsed.data.concepto,
      observaciones: parsed.data.observaciones || null,
      solicitud_id: parsed.data.solicitud_id ?? null,
      estado: 'pendiente',
      subtotal: 0,
      total: 0,
    })
    .select('id, consecutivo')
    .single();

  if (cotError || !cotizacion) {
    console.error('crearCotizacion insert error:', cotError);
    return { success: false, error: 'Error al crear la cotización.' };
  }

  // Insert items
  const itemsPayload = parsed.data.items.map((item, idx) => ({
    cotizacion_id: cotizacion.id,
    orden: idx + 1,
    descripcion: item.descripcion,
    cantidad: 1,
    valor_unidad: item.valor,
  }));

  const { error: itemsError } = await supabase
    .from('items_cotizacion')
    .insert(itemsPayload);

  if (itemsError) {
    console.error('crearCotizacion items error:', itemsError);
    // Rollback cotizacion
    await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    return { success: false, error: 'Error al guardar los ítems.' };
  }

  // If came from solicitud, mark it as atendida
  if (parsed.data.solicitud_id) {
    await supabase
      .from('solicitudes_publicas')
      .update({
        estado: 'atendida',
        atendida_at: new Date().toISOString(),
        cotizacion_id: cotizacion.id,
      })
      .eq('id', parsed.data.solicitud_id);
  }

  revalidatePath('/admin/cotizaciones');
  revalidatePath('/admin/solicitudes');
  return { success: true, data: { id: cotizacion.id, consecutivo: cotizacion.consecutivo } };
}

export async function actualizarCotizacion(
  id: string,
  data: CotizacionFormData
): Promise<ActionResult> {
  const parsed = CotizacionSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  const supabase = createClient();

  // Update cotizacion header
  const { error: cotError } = await supabase
    .from('cotizaciones')
    .update({
      cliente_id: parsed.data.cliente_id,
      concepto: parsed.data.concepto,
      observaciones: parsed.data.observaciones || null,
    })
    .eq('id', id);

  if (cotError) {
    console.error('actualizarCotizacion error:', cotError);
    return { success: false, error: 'Error al actualizar la cotización.' };
  }

  // Replace items: delete then re-insert
  await supabase.from('items_cotizacion').delete().eq('cotizacion_id', id);

  const itemsPayload = parsed.data.items.map((item, idx) => ({
    cotizacion_id: id,
    orden: idx + 1,
    descripcion: item.descripcion,
    cantidad: 1,
    valor_unidad: item.valor,
  }));

  const { error: itemsError } = await supabase
    .from('items_cotizacion')
    .insert(itemsPayload);

  if (itemsError) {
    console.error('actualizarCotizacion items error:', itemsError);
    return { success: false, error: 'Error al actualizar los ítems.' };
  }

  revalidatePath('/admin/cotizaciones');
  revalidatePath(`/admin/cotizaciones/${id}`);
  return { success: true };
}

export async function actualizarEstadoCotizacion(
  id: string,
  estado: 'pendiente' | 'aprobada' | 'rechazada'
): Promise<ActionResult> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = { estado };
  if (estado === 'aprobada') {
    updateData.fecha_aprobacion = new Date().toISOString().split('T')[0];
  } else if (estado === 'rechazada') {
    updateData.fecha_rechazo = new Date().toISOString().split('T')[0];
  }

  const { error } = await supabase
    .from('cotizaciones')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('actualizarEstadoCotizacion error:', error);
    return { success: false, error: 'Error al actualizar el estado.' };
  }

  revalidatePath('/admin/cotizaciones');
  revalidatePath(`/admin/cotizaciones/${id}`);
  return { success: true };
}

export async function eliminarCotizacion(id: string): Promise<ActionResult> {
  const supabase = createClient();

  // Only allow deletion of pendiente cotizaciones
  const { data: cot } = await supabase
    .from('cotizaciones')
    .select('estado')
    .eq('id', id)
    .single();

  if (cot && cot.estado !== 'pendiente') {
    return { success: false, error: 'Solo se pueden eliminar cotizaciones en estado pendiente.' };
  }

  const { error } = await supabase.from('cotizaciones').delete().eq('id', id);

  if (error) {
    console.error('eliminarCotizacion error:', error);
    return { success: false, error: 'Error al eliminar la cotización.' };
  }

  revalidatePath('/admin/cotizaciones');
  redirect('/admin/cotizaciones');
}

export async function obtenerCotizacion(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      clientes (id, nombre_razon_social, numero_documento, tipo_documento, telefono, correo, direccion),
      items_cotizacion (id, orden, descripcion, cantidad, valor_unidad, valor_total)
    `)
    .eq('id', id)
    .order('orden', { referencedTable: 'items_cotizacion' })
    .single();

  if (error) {
    return { success: false, error: 'Error al cargar la cotización.' };
  }

  return { success: true, data };
}

export async function vincularCuentaCobro(
  cotizacionId: string,
  cuentaCobroId: string
): Promise<ActionResult> {
  const supabase = createClient();

  const { error } = await supabase
    .from('cuentas_cobro')
    .update({ cotizacion_id: cotizacionId })
    .eq('id', cuentaCobroId);

  if (error) {
    return { success: false, error: 'Error al vincular la cuenta de cobro.' };
  }

  revalidatePath(`/admin/cotizaciones/${cotizacionId}`);
  return { success: true };
}
