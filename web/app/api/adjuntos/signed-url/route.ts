import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Verify authenticated session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  let path: string;
  try {
    const body = await request.json() as { path?: string };
    if (!body.path || typeof body.path !== 'string') {
      return NextResponse.json({ error: 'El campo "path" es requerido.' }, { status: 400 });
    }
    path = body.path;
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase.storage
    .from('adjuntos')
    .createSignedUrl(path, 3600); // TTL: 1 hora

  if (error || !data?.signedUrl) {
    console.error('signed-url route error:', error);
    return NextResponse.json({ error: 'No se pudo generar el enlace.' }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
