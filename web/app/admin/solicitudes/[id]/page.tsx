import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/admin/StatusBadge';
import { actualizarEstadoSolicitud } from '@/lib/actions/solicitudes-admin';
import { formatDate } from '@/lib/formatters/date';

export const dynamic = 'force-dynamic';

export default async function SolicitudDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: sol, error } = await supabase
    .from('solicitudes_publicas')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !sol) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/solicitudes"
          className="text-brand-gray hover:text-off-white text-sm transition"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-display font-bold text-off-white">Detalle de Solicitud</h1>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Main card */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-off-white font-semibold text-lg">{sol.nombre}</h2>
              <p className="text-brand-gray text-sm mt-0.5">{formatDate(sol.created_at)}</p>
            </div>
            <StatusBadge status={sol.estado} type="solicitud" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray block mb-1">
                Teléfono
              </label>
              <p className="text-off-white text-sm">{sol.telefono || '—'}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray block mb-1">
                Contacto / Email
              </label>
              <p className="text-off-white text-sm">{sol.contacto || '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray block mb-1">
                Dirección
              </label>
              <p className="text-off-white text-sm">{sol.direccion || '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray block mb-1">
                Descripción del trabajo
              </label>
              <p className="text-off-white text-sm whitespace-pre-wrap">{sol.descripcion}</p>
            </div>
            {sol.fecha_servicio && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray block mb-1">
                  Fecha solicitada
                </label>
                <p className="text-off-white text-sm">{formatDate(sol.fecha_servicio)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h3 className="text-off-white font-semibold mb-4">Acciones</h3>
          <div className="flex gap-3 flex-wrap">
            {sol.estado === 'nueva' && (
              <>
                <Link
                  href={`/admin/cotizaciones/nuevo?solicitud_id=${sol.id}`}
                  className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                >
                  Crear Cotización
                </Link>
                <form>
                  <button
                    formAction={async () => {
                      'use server';
                      await actualizarEstadoSolicitud(sol.id, 'atendida');
                    }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-off-white font-medium px-4 py-2 rounded-lg transition text-sm"
                  >
                    Marcar revisada
                  </button>
                </form>
                <form>
                  <button
                    formAction={async () => {
                      'use server';
                      await actualizarEstadoSolicitud(sol.id, 'descartada');
                    }}
                    className="text-red-400 hover:text-red-300 text-sm transition px-4 py-2 rounded-lg"
                  >
                    Descartar
                  </button>
                </form>
              </>
            )}
            {sol.estado === 'atendida' && (
              <p className="text-brand-gray text-sm">
                Esta solicitud ya fue atendida.{' '}
                {sol.cotizacion_id && (
                  <Link href={`/admin/cotizaciones/${sol.cotizacion_id}`} className="text-blue-glow">
                    Ver cotización vinculada
                  </Link>
                )}
              </p>
            )}
            {sol.estado === 'descartada' && (
              <form>
                <button
                  formAction={async () => {
                    'use server';
                    await actualizarEstadoSolicitud(sol.id, 'nueva');
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-off-white font-medium px-4 py-2 rounded-lg transition text-sm"
                >
                  Reactivar solicitud
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
