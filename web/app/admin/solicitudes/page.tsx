import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/admin/StatusBadge';
import { actualizarEstadoSolicitud } from '@/lib/actions/solicitudes-admin';
import { formatDate } from '@/lib/formatters/date';

export const dynamic = 'force-dynamic';

type EstadoFilter = 'todas' | 'nueva' | 'atendida' | 'descartada';

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const estadoFilter = (searchParams.estado ?? 'todas') as EstadoFilter;
  const supabase = createClient();

  let q = supabase
    .from('solicitudes_publicas')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (estadoFilter !== 'todas') {
    q = q.eq('estado', estadoFilter);
  }

  const { data: solicitudes, count, error } = await q;

  // Count nuevas for badge
  const { count: nuevasCount } = await supabase
    .from('solicitudes_publicas')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'nueva');

  const ESTADOS: { value: EstadoFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'nueva', label: 'Nuevas' },
    { value: 'atendida', label: 'Atendidas' },
    { value: 'descartada', label: 'Descartadas' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-off-white">Solicitudes</h1>
          {(nuevasCount ?? 0) > 0 && (
            <span className="bg-blue-glow text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {nuevasCount} nueva{nuevasCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ESTADOS.map((est) => (
          <Link
            key={est.value}
            href={`/admin/solicitudes${est.value !== 'todas' ? `?estado=${est.value}` : ''}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              estadoFilter === est.value
                ? 'bg-blue/20 text-off-white border border-blue/30'
                : 'text-brand-gray hover:bg-white/5 hover:text-off-white border border-white/10'
            }`}
          >
            {est.label}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="text-accent text-sm">Error al cargar solicitudes.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full">
              <thead className="bg-navy text-brand-gray text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Cliente / Contacto</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Teléfono</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Descripción</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!solicitudes || solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-brand-gray text-sm">
                      No hay solicitudes {estadoFilter !== 'todas' ? `con estado "${estadoFilter}"` : ''}.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((sol) => (
                    <tr key={sol.id} className="bg-navy-2 hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-brand-gray text-sm whitespace-nowrap">
                        {formatDate(sol.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-off-white text-sm font-medium">{sol.nombre}</div>
                        {sol.contacto && (
                          <div className="text-brand-gray text-xs">{sol.contacto}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-gray text-sm hidden md:table-cell">
                        {sol.telefono || '—'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-brand-gray text-sm line-clamp-2 max-w-xs">
                          {sol.descripcion}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={sol.estado} type="solicitud" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3 flex-wrap">
                          <Link
                            href={`/admin/solicitudes/${sol.id}`}
                            className="text-blue-glow hover:text-blue-bright text-xs transition whitespace-nowrap"
                          >
                            Ver detalle
                          </Link>
                          {sol.estado === 'nueva' && (
                            <>
                              <Link
                                href={`/admin/cotizaciones/nuevo?solicitud_id=${sol.id}`}
                                className="text-green-400 hover:text-green-300 text-xs transition whitespace-nowrap"
                              >
                                Convertir
                              </Link>
                              <form>
                                <input type="hidden" name="id" value={sol.id} />
                                <button
                                  formAction={async () => {
                                    'use server';
                                    await actualizarEstadoSolicitud(sol.id, 'descartada');
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs transition whitespace-nowrap"
                                >
                                  Descartar
                                </button>
                              </form>
                            </>
                          )}
                          {sol.estado === 'descartada' && (
                            <form>
                              <button
                                formAction={async () => {
                                  'use server';
                                  await actualizarEstadoSolicitud(sol.id, 'nueva');
                                }}
                                className="text-brand-gray hover:text-off-white text-xs transition whitespace-nowrap"
                              >
                                Reactivar
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-brand-gray text-xs mt-3">
            {count ?? 0} solicitud{count !== 1 ? 'es' : ''} total
            {estadoFilter !== 'todas' ? ` (filtrado por: ${estadoFilter})` : ''}
          </p>
        </>
      )}
    </div>
  );
}
