import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/admin/StatusBadge';
import { formatCOP } from '@/lib/formatters/currency';
import { formatDate } from '@/lib/formatters/date';

export const dynamic = 'force-dynamic';

type EstadoFilter = 'todas' | 'pendiente' | 'aprobada' | 'rechazada';

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const estadoFilter = (searchParams.estado ?? 'todas') as EstadoFilter;
  const supabase = createClient();

  let q = supabase
    .from('cotizaciones')
    .select(`
      id, consecutivo, concepto, total, estado, fecha_emision, created_at,
      clientes (nombre_razon_social)
    `, { count: 'exact' })
    .order('numero_seq', { ascending: false });

  if (estadoFilter !== 'todas') {
    q = q.eq('estado', estadoFilter);
  }

  const { data: cotizaciones, count, error } = await q;

  const ESTADOS: { value: EstadoFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aprobada', label: 'Aprobadas' },
    { value: 'rechazada', label: 'Rechazadas' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-off-white">Cotizaciones</h1>
        <Link
          href="/admin/cotizaciones/nuevo"
          className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + Nueva Cotización
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ESTADOS.map((est) => (
          <Link
            key={est.value}
            href={`/admin/cotizaciones${est.value !== 'todas' ? `?estado=${est.value}` : ''}`}
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
        <div className="text-accent text-sm">Error al cargar cotizaciones.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full">
              <thead className="bg-navy text-brand-gray text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Consecutivo</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Concepto</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!cotizaciones || cotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-brand-gray text-sm">
                      No hay cotizaciones {estadoFilter !== 'todas' ? `con estado "${estadoFilter}"` : ''}.
                    </td>
                  </tr>
                ) : (
                  cotizaciones.map((cot) => {
                    const cliente = cot.clientes as unknown as { nombre_razon_social: string } | null;
                    return (
                      <tr key={cot.id} className="bg-navy-2 hover:bg-white/5 transition">
                        <td className="px-4 py-3">
                          <span className="text-blue-glow font-mono text-sm font-semibold">
                            {cot.consecutivo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-off-white text-sm">
                          {cliente?.nombre_razon_social ?? '—'}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-brand-gray text-sm truncate max-w-xs">{cot.concepto}</p>
                        </td>
                        <td className="px-4 py-3 text-brand-gray text-sm hidden lg:table-cell whitespace-nowrap">
                          {formatDate(cot.fecha_emision)}
                        </td>
                        <td className="px-4 py-3 text-right text-off-white font-semibold text-sm">
                          {formatCOP(cot.total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={cot.estado} type="cotizacion" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/cotizaciones/${cot.id}`}
                            className="text-blue-glow hover:text-blue-bright text-sm transition"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-brand-gray text-xs mt-3">
            {count ?? 0} cotización{count !== 1 ? 'es' : ''} en total
          </p>
        </>
      )}
    </div>
  );
}
