'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ClienteSchema = z.object({
  nombre_razon_social: z
    .string()
    .min(1, 'El nombre/razón social es requerido')
    .max(200),
  numero_documento: z.string().max(30).optional().default(''),
  tipo_documento: z
    .enum(['NIT', 'CC', 'CE', 'PASAPORTE'])
    .optional()
    .default('NIT'),
  direccion: z.string().max(300).optional().default(''),
  telefono: z.string().max(30).optional().default(''),
  correo: z.string().email('Email inválido').max(200).optional().or(z.literal('')).default(''),
  notas: z.string().max(1000).optional().default(''),
});

export type ClienteFormData = z.infer<typeof ClienteSchema>;

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function crearCliente(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    nombre_razon_social: formData.get('nombre_razon_social') as string,
    numero_documento: (formData.get('numero_documento') as string) ?? '',
    tipo_documento: (formData.get('tipo_documento') as string) ?? 'NIT',
    direccion: (formData.get('direccion') as string) ?? '',
    telefono: (formData.get('telefono') as string) ?? '',
    correo: (formData.get('correo') as string) ?? '',
    notas: (formData.get('notas') as string) ?? '',
  };

  const parsed = ClienteSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nombre_razon_social: parsed.data.nombre_razon_social,
      numero_documento: parsed.data.numero_documento || '',
      tipo_documento: parsed.data.tipo_documento,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      correo: parsed.data.correo || null,
      notas: parsed.data.notas || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('crearCliente error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un cliente con ese documento.' };
    }
    return { success: false, error: 'Error al crear el cliente.' };
  }

  revalidatePath('/admin/clientes');
  return { success: true, data: { id: data.id } };
}

export async function actualizarCliente(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    nombre_razon_social: formData.get('nombre_razon_social') as string,
    numero_documento: (formData.get('numero_documento') as string) ?? '',
    tipo_documento: (formData.get('tipo_documento') as string) ?? 'NIT',
    direccion: (formData.get('direccion') as string) ?? '',
    telefono: (formData.get('telefono') as string) ?? '',
    correo: (formData.get('correo') as string) ?? '',
    notas: (formData.get('notas') as string) ?? '',
  };

  const parsed = ClienteSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('clientes')
    .update({
      nombre_razon_social: parsed.data.nombre_razon_social,
      numero_documento: parsed.data.numero_documento || '',
      tipo_documento: parsed.data.tipo_documento,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      correo: parsed.data.correo || null,
      notas: parsed.data.notas || null,
    })
    .eq('id', id);

  if (error) {
    console.error('actualizarCliente error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un cliente con ese documento.' };
    }
    return { success: false, error: 'Error al actualizar el cliente.' };
  }

  revalidatePath('/admin/clientes');
  revalidatePath(`/admin/clientes/${id}/editar`);
  return { success: true };
}

export async function eliminarCliente(id: string): Promise<ActionResult> {
  const supabase = createClient();

  // Check for linked documents
  const [{ count: cotCount }, { count: ccCount }] = await Promise.all([
    supabase
      .from('cotizaciones')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', id),
    supabase
      .from('cuentas_cobro')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', id),
  ]);

  if ((cotCount ?? 0) > 0 || (ccCount ?? 0) > 0) {
    return {
      success: false,
      error:
        'No se puede eliminar el cliente porque tiene cotizaciones o cuentas de cobro vinculadas.',
    };
  }

  const { error } = await supabase.from('clientes').delete().eq('id', id);

  if (error) {
    console.error('eliminarCliente error:', error);
    return { success: false, error: 'Error al eliminar el cliente.' };
  }

  revalidatePath('/admin/clientes');
  redirect('/admin/clientes');
}

export async function buscarClientes(
  query: string
): Promise<ActionResult<{ id: string; nombre_razon_social: string; numero_documento: string }[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre_razon_social, numero_documento')
    .ilike('nombre_razon_social', `%${query}%`)
    .eq('activo', true)
    .order('nombre_razon_social')
    .limit(25);

  if (error) {
    return { success: false, error: 'Error al buscar clientes.' };
  }

  return { success: true, data: data ?? [] };
}
