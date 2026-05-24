'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ClienteAutocomplete, { type Cliente } from '@/components/admin/ClienteAutocomplete';
import InvoiceTableCotizacion, { type CotizacionItem } from '@/components/admin/InvoiceTableCotizacion';
import StatusBadge from '@/components/admin/StatusBadge';
import FileUpload from '@/components/admin/FileUpload';
import FileList from '@/components/admin/FileList';
import { actualizarCotizacion, actualizarEstadoCotizacion, eliminarCotizacion } from '@/lib/actions/cotizaciones';
import { formatCOP } from '@/lib/formatters/currency';
import { formatDate } from '@/lib/formatters/date';

import ShareButtons from '@/components/admin/ShareButtons';

// @react-pdf/renderer must run only in the browser — dynamic imports with ssr:false
const DownloadPDFButton = dynamic(() => import('@/components/admin/DownloadPDFButton'), { ssr: false });
const CotizacionPDF = dynamic(
  () => import('@/lib/pdf/CotizacionPDF').then((m) => m.CotizacionPDF),
  { ssr: false }
);

interface CotizacionData {
  id: string;
  consecutivo: string;
  concepto: string;
  observaciones: string | null;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  total: number;
  fecha_emision: string;
  solicitud_id: string | null;
  clientes: {
    id: string;
    nombre_razon_social: string;
    numero_documento: string;
    tipo_documento: string;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
  } | null;
  items_cotizacion: {
    id: string;
    orden: number;
    descripcion: string;
    cantidad: number;
    valor_unidad: number;
    valor_total: number;
  }[];
  cuentas_cobro?: { id: string; consecutivo: string }[] | null;
}

export default function CotizacionDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [cot, setCot] = useState<CotizacionData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [concepto, setConcepto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<CotizacionItem[]>([]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adjuntosRefresh, setAdjuntosRefresh] = useState(0);

  const loadCotizacion = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
        setFetching(false);
        return;
      }
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('cotizaciones')
        .select(`
          id, consecutivo, concepto, observaciones, estado, total, fecha_emision, solicitud_id,
          clientes (id, nombre_razon_social, numero_documento, tipo_documento, telefono, correo, direccion),
          items_cotizacion (id, orden, descripcion, cantidad, valor_unidad, valor_total),
          cuentas_cobro (id, consecutivo)
        `)
        .eq('id', id)
        .order('orden', { referencedTable: 'items_cotizacion' })
        .single();

      setCot(data as unknown as CotizacionData);
    } catch {
      setError('No se pudo cargar la cotización.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCotizacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startEdit = () => {
    if (!cot) return;
    setCliente(cot.clientes as Cliente | null);
    setConcepto(cot.concepto);
    setObservaciones(cot.observaciones ?? '');
    setItems(
      cot.items_cotizacion.map((it) => ({
        id: it.id,
        descripcion: it.descripcion,
        valor: it.valor_unidad,
      }))
    );
    setEditing(true);
  };

  const handleSave = async () => {
    if (!cliente) { setError('Seleccioná un cliente.'); return; }
    const validItems = items.filter((i) => i.descripcion.trim());
    if (validItems.length === 0) { setError('Agregá al menos un ítem.'); return; }

    setSaving(true);
    setError('');

    const result = await actualizarCotizacion(id, {
      cliente_id: cliente.id,
      concepto: concepto.trim(),
      observaciones: observaciones.trim(),
      items: validItems.map((i) => ({ descripcion: i.descripcion, valor: i.valor })),
    });

    if (!result.success) {
      setError(result.error ?? 'Error al guardar.');
      setSaving(false);
      return;
    }

    setEditing(false);
    setSaving(false);
    await loadCotizacion();
  };

  const handleEstado = async (estado: 'pendiente' | 'aprobada' | 'rechazada') => {
    setSaving(true);
    const result = await actualizarEstadoCotizacion(id, estado);
    if (!result.success) setError(result.error ?? 'Error al cambiar estado.');
    setSaving(false);
    await loadCotizacion();
  };

  const handleDelete = async () => {
    setSaving(true);
    await eliminarCotizacion(id);
  };

  const handleGenerarCuentaCobro = () => {
    router.push(`/admin/cuentas-cobro/nuevo?cotizacion_id=${id}`);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cot) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-gray">Cotización no encontrada.</p>
        <Link href="/admin/cotizaciones" className="text-blue-glow text-sm mt-4 inline-block">
          Volver
        </Link>
      </div>
    );
  }

  const cuentaCobro = cot.cuentas_cobro?.[0];
  const total = editing
    ? items.reduce((acc, i) => acc + (i.valor || 0), 0)
    : cot.total;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/cotizaciones" className="text-brand-gray hover:text-off-white text-sm transition">
          ← Volver
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-off-white font-mono">
              {cot.consecutivo}
            </h1>
            <StatusBadge status={cot.estado} type="cotizacion" />
          </div>
          <p className="text-brand-gray text-sm mt-0.5">
            Emitida el {formatDate(cot.fecha_emision)}
          </p>
        </div>

        {/* Quick actions */}
        {!editing && cot.estado === 'pendiente' && (
          <button
            onClick={startEdit}
            className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
          >
            Editar
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-accent text-sm bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        {/* Cliente */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Cliente</h2>
          {editing ? (
            <ClienteAutocomplete
              onSelect={setCliente}
              initialValue={cot.clientes?.nombre_razon_social}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="text-xs text-brand-gray uppercase tracking-widest">Nombre</label>
                <p className="text-off-white font-medium">{cot.clientes?.nombre_razon_social ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs text-brand-gray uppercase tracking-widest">Documento</label>
                <p className="text-off-white text-sm">
                  {cot.clientes?.tipo_documento}: {cot.clientes?.numero_documento}
                </p>
              </div>
              {cot.clientes?.telefono && (
                <div>
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Teléfono</label>
                  <p className="text-off-white text-sm">{cot.clientes.telefono}</p>
                </div>
              )}
              {cot.clientes?.correo && (
                <div>
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Email</label>
                  <p className="text-off-white text-sm">{cot.clientes.correo}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Concepto */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Concepto</h2>
          {editing ? (
            <div className="space-y-4">
              <textarea
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                placeholder="Observaciones..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-off-white text-sm whitespace-pre-wrap">{cot.concepto}</p>
              {cot.observaciones && (
                <p className="text-brand-gray text-sm border-t border-white/5 pt-3 whitespace-pre-wrap">
                  {cot.observaciones}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-off-white font-semibold">Ítems</h2>
            <span className="text-blue-glow font-bold">{formatCOP(total)}</span>
          </div>
          {editing ? (
            <InvoiceTableCotizacion items={items} onChange={setItems} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full">
                <thead className="bg-navy text-brand-gray text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">Items</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cot.items_cotizacion.map((it) => (
                    <tr key={it.id} className="bg-navy-2">
                      <td className="px-4 py-3 text-brand-gray text-sm text-center">{it.orden}</td>
                      <td className="px-4 py-3 text-off-white text-sm">{it.descripcion}</td>
                      <td className="px-4 py-3 text-right text-blue-glow font-semibold text-sm">
                        {formatCOP(it.valor_unidad)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-white/20">
                    <td colSpan={2} className="px-4 py-3 text-right text-brand-gray text-xs uppercase tracking-widest">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-blue-glow font-bold text-lg">
                      {formatCOP(cot.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Edit actions */}
        {editing && (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => { setEditing(false); setError(''); }}
              className="px-6 py-2.5 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Estado + Actions */}
        {!editing && (
          <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
            <h2 className="text-off-white font-semibold mb-4">Estado y Acciones</h2>
            <div className="flex gap-3 flex-wrap">
              {cot.estado === 'pendiente' && (
                <>
                  <button
                    onClick={() => handleEstado('aprobada')}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleEstado('rechazada')}
                    disabled={saving}
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 font-medium px-4 py-2 rounded-lg transition text-sm disabled:opacity-50 border border-red-500/30"
                  >
                    Rechazar
                  </button>
                </>
              )}
              {cot.estado === 'aprobada' && (
                <>
                  {!cuentaCobro ? (
                    <button
                      onClick={handleGenerarCuentaCobro}
                      className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                    >
                      Generar Cuenta de Cobro
                    </button>
                  ) : (
                    <Link
                      href={`/admin/cuentas-cobro/${cuentaCobro.id}`}
                      className="bg-white/5 border border-white/10 text-blue-glow hover:text-blue-bright font-medium px-4 py-2 rounded-lg transition text-sm"
                    >
                      Ver Cuenta de Cobro: {cuentaCobro.consecutivo}
                    </Link>
                  )}
                  <button
                    onClick={() => handleEstado('rechazada')}
                    disabled={saving}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
                    Rechazar
                  </button>
                </>
              )}
              {cot.estado === 'rechazada' && (
                <button
                  onClick={() => handleEstado('pendiente')}
                  disabled={saving}
                  className="bg-white/5 border border-white/10 text-off-white font-medium px-4 py-2 rounded-lg transition text-sm"
                >
                  Reactivar
                </button>
              )}

              {/* PDF Download */}
              <DownloadPDFButton
                document={<CotizacionPDF cotizacion={cot} />}
                fileName={`${cot.consecutivo}.pdf`}
              />
            </div>

            {/* Share buttons */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <ShareButtons type="cotizacion" data={cot} />
            </div>

            {cot.estado === 'pendiente' && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 text-sm transition"
                >
                  Eliminar cotización
                </button>
              </div>
            )}
          </div>
        )}

        {/* Adjuntos */}
        {!editing && (
          <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
            <h2 className="text-off-white font-semibold mb-4">Documentos adjuntos</h2>
            <div className="space-y-4">
              <FileList entidad="cotizacion" entidadId={id} refreshTrigger={adjuntosRefresh} />
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-brand-gray mb-3 uppercase tracking-widest">Subir nuevo documento</p>
                <FileUpload
                  entidad="cotizacion"
                  entidadId={id}
                  onUpload={() => setAdjuntosRefresh((n) => n + 1)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-2 border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-off-white font-bold text-lg mb-2">Eliminar cotización</h3>
            <p className="text-brand-gray text-sm mb-6">
              ¿Eliminar <strong className="text-off-white">{cot.consecutivo}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
              >
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
