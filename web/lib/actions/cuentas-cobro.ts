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

export interface ItemCuentaCobro {
  descripcion: string;
  cantidad: number;
  valor_unidad: number;
}

const ItemSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  valor_unidad: z.number().min(0, 'El valor debe ser mayor o igual a 0'),
});

const CuentaCobroSchema = z.object({
  cliente_id: z.string().uuid('Seleccioná un cliente válido'),
  concepto: z.string().min(1, 'El concepto es requerido').max(500),
  observaciones: z.string().max(1000).optional().default(''),
  cotizacion_id: z.string().uuid().optional().nullable(),
  items: z.array(ItemSchema).min(1, 'Debe incluir al menos un ítem'),
});

export type CuentaCobroFormData = {
  cliente_id: string;
  concepto: string;
  observaciones?: string;
  cotizacion_id?: string | null;
  items: ItemCuentaCobro[];
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function crearCuentaCobro(
  data: CuentaCobroFormData
): Promise<ActionResult<{ id: string; consecutivo: string }>> {
  const parsed = CuentaCobroSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  const supabase = createClient();

  // Get consecutivo atomically
  const { data: consec, error: consecError } = await supabase
    .rpc('next_consecutivo', { p_tipo: 'COB' })
    .single();

  if (consecError || !consec) {
    console.error('next_consecutivo COB error:', consecError);
    return { success: false, error: 'Error al generar el consecutivo. Verificá que las migraciones estén aplicadas.' };
  }

  const { consecutivo, numero_seq } = consec as { consecutivo: string; numero_seq: number };

  // Insert cuenta_cobro header
  const { data: cc, error: ccError } = await supabase
    .from('cuentas_cobro')
    .insert({
      consecutivo,
      numero_seq,
      cliente_id: parsed.data.cliente_id,
      cotizacion_id: parsed.data.cotizacion_id ?? null,
      concepto: parsed.data.concepto,
      observaciones: parsed.data.observaciones || null,
      estado: 'pendiente',
      subtotal: 0,
      total: 0,
    })
    .select('id, consecutivo')
    .single();

  if (ccError || !cc) {
    console.error('crearCuentaCobro insert error:', ccError);
    return { success: false, error: 'Error al crear la cuenta de cobro.' };
  }

  // Insert items
  const itemsPayload = parsed.data.items.map((item, idx) => ({
    cuenta_cobro_id: cc.id,
    orden: idx + 1,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    valor_unidad: item.valor_unidad,
  }));

  const { error: itemsError } = await supabase
    .from('items_cuenta_cobro')
    .insert(itemsPayload);

  if (itemsError) {
    console.error('crearCuentaCobro items error:', itemsError);
    await supabase.from('cuentas_cobro').delete().eq('id', cc.id);
    return { success: false, error: 'Error al guardar los ítems.' };
  }

  revalidatePath('/admin/cuentas-cobro');
  revalidatePath('/admin');
  return { success: true, data: { id: cc.id, consecutivo: cc.consecutivo } };
}

export async function actualizarCuentaCobro(
  id: string,
  data: CuentaCobroFormData
): Promise<ActionResult> {
  const parsed = CuentaCobroSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  const supabase = createClient();

  const { error: ccError } = await supabase
    .from('cuentas_cobro')
    .update({
      cliente_id: parsed.data.cliente_id,
      concepto: parsed.data.concepto,
      observaciones: parsed.data.observaciones || null,
    })
    .eq('id', id);

  if (ccError) {
    console.error('actualizarCuentaCobro error:', ccError);
    return { success: false, error: 'Error al actualizar la cuenta de cobro.' };
  }

  // Replace items
  await supabase.from('items_cuenta_cobro').delete().eq('cuenta_cobro_id', id);

  const itemsPayload = parsed.data.items.map((item, idx) => ({
    cuenta_cobro_id: id,
    orden: idx + 1,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    valor_unidad: item.valor_unidad,
  }));

  const { error: itemsError } = await supabase
    .from('items_cuenta_cobro')
    .insert(itemsPayload);

  if (itemsError) {
    console.error('actualizarCuentaCobro items error:', itemsError);
    return { success: false, error: 'Error al actualizar los ítems.' };
  }

  revalidatePath('/admin/cuentas-cobro');
  revalidatePath(`/admin/cuentas-cobro/${id}`);
  return { success: true };
}

export async function marcarPagada(
  id: string,
  fechaPago?: string
): Promise<ActionResult> {
  const supabase = createClient();
  const fecha = fechaPago ?? new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('cuentas_cobro')
    .update({ estado: 'pagada', fecha_pago: fecha })
    .eq('id', id);

  if (error) {
    console.error('marcarPagada error:', error);
    return { success: false, error: 'Error al marcar como pagada.' };
  }

  revalidatePath('/admin/cuentas-cobro');
  revalidatePath(`/admin/cuentas-cobro/${id}`);
  revalidatePath('/admin');
  return { success: true };
}

export async function marcarPendiente(id: string): Promise<ActionResult> {
  const supabase = createClient();

  const { error } = await supabase
    .from('cuentas_cobro')
    .update({ estado: 'pendiente', fecha_pago: null })
    .eq('id', id);

  if (error) {
    console.error('marcarPendiente error:', error);
    return { success: false, error: 'Error al revertir a pendiente.' };
  }

  revalidatePath('/admin/cuentas-cobro');
  revalidatePath(`/admin/cuentas-cobro/${id}`);
  revalidatePath('/admin');
  return { success: true };
}

export async function obtenerCuentaCobro(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cuentas_cobro')
    .select(`
      *,
      clientes (id, nombre_razon_social, numero_documento, tipo_documento, telefono, correo, direccion),
      items_cuenta_cobro (id, orden, descripcion, cantidad, valor_unidad, valor_total),
      cotizaciones (id, consecutivo)
    `)
    .eq('id', id)
    .order('orden', { referencedTable: 'items_cuenta_cobro' })
    .single();

  if (error) {
    return { success: false, error: 'Error al cargar la cuenta de cobro.' };
  }

  return { success: true, data };
}

export async function crearDesdeCotizacion(
  cotizacionId: string
): Promise<ActionResult<{ id: string; consecutivo: string }>> {
  const supabase = createClient();

  // Fetch cotizacion with items and cliente
  const { data: cot, error: cotError } = await supabase
    .from('cotizaciones')
    .select(`
      id, concepto, observaciones, cliente_id,
      items_cotizacion (orden, descripcion, cantidad, valor_unidad)
    `)
    .eq('id', cotizacionId)
    .single();

  if (cotError || !cot) {
    return { success: false, error: 'No se encontró la cotización.' };
  }

  const items = (cot.items_cotizacion as ItemCuentaCobro[] ?? []).map((it) => ({
    descripcion: (it as { descripcion: string }).descripcion,
    cantidad: 1,
    valor_unidad: (it as { valor_unidad: number }).valor_unidad,
  }));

  return crearCuentaCobro({
    cliente_id: cot.cliente_id,
    concepto: cot.concepto,
    observaciones: cot.observaciones ?? '',
    cotizacion_id: cotizacionId,
    items: items.length > 0 ? items : [{ descripcion: cot.concepto, cantidad: 1, valor_unidad: 0 }],
  });
}

export async function eliminarCuentaCobro(id: string): Promise<ActionResult> {
  const supabase = createClient();

  const { data: cc } = await supabase
    .from('cuentas_cobro')
    .select('estado')
    .eq('id', id)
    .single();

  if (cc && cc.estado === 'pagada') {
    return { success: false, error: 'No se puede eliminar una cuenta de cobro pagada.' };
  }

  const { error } = await supabase.from('cuentas_cobro').delete().eq('id', id);

  if (error) {
    console.error('eliminarCuentaCobro error:', error);
    return { success: false, error: 'Error al eliminar la cuenta de cobro.' };
  }

  revalidatePath('/admin/cuentas-cobro');
  redirect('/admin/cuentas-cobro');
}
