'use server';

import { z } from 'zod';

const SolicitudSchema = z.object({
  nombre_cliente: z.string().min(1, 'El nombre del cliente es requerido').max(200),
  contacto: z.string().max(200).optional(),
  telefono: z.string().max(30).optional(),
  direccion: z.string().max(300).optional(),
  items: z
    .array(
      z.object({
        descripcion: z.string().min(1),
      })
    )
    .min(1, 'Debe incluir al menos un ítem'),
});

export type SolicitudPublicaData = z.infer<typeof SolicitudSchema>;

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function insertarSolicitudPublica(
  data: SolicitudPublicaData
): Promise<ActionResult> {
  // Validate
  const parsed = SolicitudSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return { success: false, error: msg };
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || !supabaseKey) {
    // Supabase not configured — return success but note WhatsApp fallback
    return { success: true };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build a description from items
    const descripcion = parsed.data.items
      .map((item) => item.descripcion)
      .join('\n');

    const { error } = await supabase.from('solicitudes_publicas').insert({
      nombre: parsed.data.nombre_cliente,
      contacto: parsed.data.contacto ?? null,
      telefono: parsed.data.telefono ?? '',
      direccion: parsed.data.direccion ?? null,
      descripcion,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: 'Error al guardar la solicitud. Por favor contacta por WhatsApp.' };
    }

    return { success: true };
  } catch (err) {
    console.error('insertarSolicitudPublica error:', err);
    return { success: false, error: 'Error inesperado. Por favor contacta por WhatsApp.' };
  }
}
