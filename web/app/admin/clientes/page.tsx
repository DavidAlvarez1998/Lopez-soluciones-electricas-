import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q ?? '';
  const page = Math.max(1, Number(searchParams.page ?? '1'));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createClient();

  let q = supabase
    .from('clientes')
    .select('id, nombre_razon_social, numero_documento, tipo_documento, telefono, correo, activo', {
      count: 'exact',
    })
    .order('nombre_razon_social')
    .range(from, to);

  if (query) {
    q = q.ilike('nombre_razon_social', `%${query}%`);
  }

  const { data: clientes, count, error } = await q;

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-off-white">Clientes</h1>
        <Link
          href="/admin/clientes/nuevo"
          className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {/* Search */}
      <form method="get" className="mb-4">
        <div className="flex gap-2 max-w-md">
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre o razón social..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition text-sm"
          />
          <button
            type="submit"
            className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm"
          >
            Buscar
          </button>
          {query && (
            <Link
              href="/admin/clientes"
              className="px-4 py-2.5 text-brand-gray hover:text-off-white text-sm transition rounded-lg border border-white/10"
            >
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      {error ? (
        <div className="text-accent text-sm">Error al cargar clientes. Verificá la conexión a Supabase.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full">
            <thead className="bg-navy text-brand-gray text-xs uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">Nombre / Razón Social</th>
                <th className="px-4 py-3 text-left">NIT / Doc.</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Teléfono</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Email</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!clientes || clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-brand-gray text-sm">
                    {query ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes registrados aún.'}
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="bg-navy-2 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3 text-off-white text-sm font-medium">
                      {cliente.nombre_razon_social}
                    </td>
                    <td className="px-4 py-3 text-brand-gray text-sm">
                      <span className="text-xs text-brand-gray/70 mr-1">{cliente.tipo_documento}</span>
                      {cliente.numero_documento || '—'}
                    </td>
                    <td className="px-4 py-3 text-brand-gray text-sm hidden md:table-cell">
                      {cliente.telefono || '—'}
                    </td>
                    <td className="px-4 py-3 text-brand-gray text-sm hidden lg:table-cell">
                      {cliente.correo || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/clientes/${cliente.id}/editar`}
                          className="text-blue-glow hover:text-blue-bright text-sm transition"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-brand-gray text-sm">
            {count} cliente{count !== 1 ? 's' : ''} en total
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/clientes?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page - 1}`}
                className="px-3 py-1.5 text-sm text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition"
              >
                Anterior
              </Link>
            )}
            <span className="px-3 py-1.5 text-sm text-off-white">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/clientes?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page + 1}`}
                className="px-3 py-1.5 text-sm text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
