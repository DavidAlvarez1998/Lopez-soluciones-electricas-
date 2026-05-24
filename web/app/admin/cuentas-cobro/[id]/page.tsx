'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ClienteAutocomplete, { type Cliente } from '@/components/admin/ClienteAutocomplete';
import InvoiceTableCuentaCobro, { type CuentaCobroItem } from '@/components/admin/InvoiceTableCuentaCobro';
import StatusBadge from '@/components/admin/StatusBadge';
import FileUpload from '@/components/admin/FileUpload';
import FileList from '@/components/admin/FileList';
import { actualizarCuentaCobro, marcarPagada, marcarPendiente, eliminarCuentaCobro } from '@/lib/actions/cuentas-cobro';
import { formatCOP } from '@/lib/formatters/currency';
import { formatDate } from '@/lib/formatters/date';
import { EMPRESA } from '@/lib/constants/empresa';

import ShareButtons from '@/components/admin/ShareButtons';

// @react-pdf/renderer must run only in the browser — dynamic imports with ssr:false
const DownloadPDFButton = dynamic(() => import('@/components/admin/DownloadPDFButton'), { ssr: false });
const CuentaCobroPDF = dynamic(
  () => import('@/lib/pdf/CuentaCobroPDF').then((m) => m.CuentaCobroPDF),
  { ssr: false }
);

interface CuentaCobroData {
  id: string;
  consecutivo: string;
  concepto: string;
  observaciones: string | null;
  estado: 'pendiente' | 'pagada' | 'anulada';
  total: number;
  subtotal: number;
  fecha_emision: string;
  fecha_pago: string | null;
  cotizacion_id: string | null;
  clientes: {
    id: string;
    nombre_razon_social: string;
    numero_documento: string;
    tipo_documento: string;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
  } | null;
  items_cuenta_cobro: {
    id: string;
    orden: number;
    descripcion: string;
    cantidad: number;
    valor_unidad: number;
    valor_total: number;
  }[];
  cotizaciones?: { id: string; consecutivo: string } | null;
}

export default function CuentaCobroDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [cc, setCc] = useState<CuentaCobroData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [concepto, setConcepto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<CuentaCobroItem[]>([]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPagoDate, setShowPagoDate] = useState(false);
  const [fechaPago, setFechaPago] = useState('');
  const [adjuntosRefresh, setAdjuntosRefresh] = useState(0);

  const loadCC = async () => {
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
        .from('cuentas_cobro')
        .select(`
          id, consecutivo, concepto, observaciones, estado, total, subtotal,
          fecha_emision, fecha_pago, cotizacion_id,
          clientes (id, nombre_razon_social, numero_documento, tipo_documento, telefono, correo, direccion),
          items_cuenta_cobro (id, orden, descripcion, cantidad, valor_unidad, valor_total),
          cotizaciones (id, consecutivo)
        `)
        .eq('id', id)
        .order('orden', { referencedTable: 'items_cuenta_cobro' })
        .single();

      setCc(data as unknown as CuentaCobroData);
    } catch {
      setError('No se pudo cargar la cuenta de cobro.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCC();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startEdit = () => {
    if (!cc) return;
    setCliente(cc.clientes as Cliente | null);
    setConcepto(cc.concepto);
    setObservaciones(cc.observaciones ?? '');
    setItems(
      cc.items_cuenta_cobro.map((it) => ({
        id: it.id,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        valor_unidad: it.valor_unidad,
        valor: it.valor_total,
      }))
    );
    setEditing(true);
  };

  const handleSave = async () => {
    if (!cliente) { setError('Seleccioná un cliente.'); return; }
    const validItems = items.filter((i) => i.descripcion.trim() && i.cantidad > 0);
    if (validItems.length === 0) { setError('Agregá al menos un ítem.'); return; }

    setSaving(true);
    setError('');

    const result = await actualizarCuentaCobro(id, {
      cliente_id: cliente.id,
      concepto: concepto.trim(),
      observaciones: observaciones.trim(),
      items: validItems.map((i) => ({
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        valor_unidad: i.valor_unidad,
      })),
    });

    if (!result.success) {
      setError(result.error ?? 'Error al guardar.');
      setSaving(false);
      return;
    }

    setEditing(false);
    setSaving(false);
    await loadCC();
  };

  const handleMarcarPagada = async () => {
    setSaving(true);
    const result = await marcarPagada(id, fechaPago || undefined);
    if (!result.success) setError(result.error ?? 'Error al marcar como pagada.');
    setSaving(false);
    setShowPagoDate(false);
    await loadCC();
  };

  const handleRevertir = async () => {
    setSaving(true);
    const result = await marcarPendiente(id);
    if (!result.success) setError(result.error ?? 'Error al revertir.');
    setSaving(false);
    await loadCC();
  };

  const handleDelete = async () => {
    setSaving(true);
    await eliminarCuentaCobro(id);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cc) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-gray">Cuenta de cobro no encontrada.</p>
        <Link href="/admin/cuentas-cobro" className="text-blue-glow text-sm mt-4 inline-block">
          Volver
        </Link>
      </div>
    );
  }

  const displayTotal = editing
    ? items.reduce((acc, i) => acc + (i.valor || 0), 0)
    : cc.total;

  const cotRef = cc.cotizaciones as { id: string; consecutivo: string } | null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/cuentas-cobro" className="text-brand-gray hover:text-off-white text-sm transition">
          ← Volver
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-off-white font-mono">
              {cc.consecutivo}
            </h1>
            <StatusBadge status={cc.estado} type="cuenta_cobro" />
          </div>
          <p className="text-brand-gray text-sm mt-0.5">
            Emitida el {formatDate(cc.fecha_emision)}
            {cc.fecha_pago && (
              <> · Pagada el <span className="text-green-400">{formatDate(cc.fecha_pago)}</span></>
            )}
          </p>
        </div>
        {!editing && cc.estado === 'pendiente' && (
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
        {/* Contratante */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Datos del Contratante</h2>
          {editing ? (
            <ClienteAutocomplete
              onSelect={setCliente}
              initialValue={cc.clientes?.nombre_razon_social}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="text-xs text-brand-gray uppercase tracking-widest">Nombre / Razón Social</label>
                <p className="text-off-white font-medium">{cc.clientes?.nombre_razon_social ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs text-brand-gray uppercase tracking-widest">Documento</label>
                <p className="text-off-white text-sm">
                  {cc.clientes?.tipo_documento}: {cc.clientes?.numero_documento}
                </p>
              </div>
              {cc.clientes?.telefono && (
                <div>
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Teléfono</label>
                  <p className="text-off-white text-sm">{cc.clientes.telefono}</p>
                </div>
              )}
              {cc.clientes?.direccion && (
                <div className="sm:col-span-3">
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Dirección</label>
                  <p className="text-off-white text-sm">{cc.clientes.direccion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Concepto */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Concepto y Observaciones</h2>
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
              <p className="text-off-white text-sm whitespace-pre-wrap">{cc.concepto}</p>
              {cc.observaciones && (
                <p className="text-brand-gray text-sm border-t border-white/5 pt-3 whitespace-pre-wrap">
                  {cc.observaciones}
                </p>
              )}
              {cotRef && (
                <div className="border-t border-white/5 pt-3">
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Cotización vinculada</label>
                  <Link
                    href={`/admin/cotizaciones/${cotRef.id}`}
                    className="text-blue-glow hover:text-blue-bright text-sm block mt-0.5 font-mono"
                  >
                    {cotRef.consecutivo}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-off-white font-semibold">Ítems del Servicio</h2>
            <span className="text-blue-glow font-bold">{formatCOP(displayTotal)}</span>
          </div>
          {editing ? (
            <InvoiceTableCuentaCobro items={items} onChange={setItems} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full min-w-[580px]">
                <thead className="bg-navy text-brand-gray text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">Items</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-right w-24">Cantidad</th>
                    <th className="px-4 py-3 text-right w-36">Valor Unidad</th>
                    <th className="px-4 py-3 text-right w-36">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cc.items_cuenta_cobro.map((it) => (
                    <tr key={it.id} className="bg-navy-2">
                      <td className="px-4 py-3 text-brand-gray text-sm text-center">{it.orden}</td>
                      <td className="px-4 py-3 text-off-white text-sm">{it.descripcion}</td>
                      <td className="px-4 py-3 text-right text-brand-gray text-sm">{it.cantidad}</td>
                      <td className="px-4 py-3 text-right text-brand-gray text-sm">{formatCOP(it.valor_unidad)}</td>
                      <td className="px-4 py-3 text-right text-blue-glow font-semibold text-sm">
                        {formatCOP(it.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td colSpan={4} className="px-4 py-2 text-right text-brand-gray text-xs uppercase tracking-widest">Subtotal</td>
                    <td className="px-4 py-2 text-right text-off-white font-semibold">{formatCOP(cc.subtotal)}</td>
                  </tr>
                  <tr className="border-t-2 border-white/20">
                    <td colSpan={4} className="px-4 py-3 text-right text-brand-gray text-xs uppercase tracking-widest">Total</td>
                    <td className="px-4 py-3 text-right text-blue-glow font-bold text-lg">{formatCOP(cc.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Datos bancarios (read-only) */}
        {!editing && (
          <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
            <h2 className="text-off-white font-semibold mb-3">Forma de Pago</h2>
            <div className="space-y-1.5">
              {EMPRESA.bancos.map((b) => (
                <div key={b.banco} className="flex gap-2 text-sm">
                  <span className="text-brand-gray min-w-[130px]">{b.banco}</span>
                  <span className="text-off-white">
                    {b.tipo} N° {b.cuenta}
                  </span>
                </div>
              ))}
              <p className="text-brand-gray text-sm pt-2">
                A nombre de: <span className="text-off-white">{EMPRESA.titular}</span> — C.C. {EMPRESA.cc}
              </p>
            </div>
          </div>
        )}

        {/* Edit save/cancel */}
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

        {/* Estado + acciones */}
        {!editing && (
          <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
            <h2 className="text-off-white font-semibold mb-4">Estado y Acciones</h2>

            {cc.estado === 'pendiente' && (
              <>
                {showPagoDate ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <label className="text-xs text-brand-gray uppercase tracking-widest mb-1 block">
                        Fecha de pago
                      </label>
                      <input
                        type="date"
                        value={fechaPago}
                        onChange={(e) => setFechaPago(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-off-white focus:border-blue-glow outline-none transition text-sm"
                      />
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <button
                        onClick={handleMarcarPagada}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : 'Confirmar Pago'}
                      </button>
                      <button
                        onClick={() => setShowPagoDate(false)}
                        className="px-4 py-2 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        setFechaPago(new Date().toISOString().split('T')[0]);
                        setShowPagoDate(true);
                      }}
                      className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                    >
                      Marcar como Pagada
                    </button>
                    <DownloadPDFButton
                      document={<CuentaCobroPDF cuentaCobro={cc} />}
                      fileName={`${cc.consecutivo}.pdf`}
                    />
                  </div>
                )}
              </>
            )}

            {cc.estado === 'pagada' && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm">
                  Pagada el {formatDate(cc.fecha_pago!)}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleRevertir}
                    disabled={saving}
                    className="bg-white/5 border border-white/10 text-off-white font-medium px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
                  >
                    {saving ? 'Revirtiendo...' : 'Revertir a Pendiente'}
                  </button>
                  <DownloadPDFButton
                    document={<CuentaCobroPDF cuentaCobro={cc} />}
                    fileName={`${cc.consecutivo}.pdf`}
                  />
                </div>
              </div>
            )}

            {/* Share buttons — always visible when not editing */}
            {!showPagoDate && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <ShareButtons type="cuenta_cobro" data={cc} />
              </div>
            )}

            {cc.estado === 'pendiente' && !showPagoDate && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 text-sm transition"
                >
                  Eliminar cuenta de cobro
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
              <FileList entidad="cuenta_cobro" entidadId={id} refreshTrigger={adjuntosRefresh} />
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-brand-gray mb-3 uppercase tracking-widest">Subir nuevo documento</p>
                <FileUpload
                  entidad="cuenta_cobro"
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
            <h3 className="text-off-white font-bold text-lg mb-2">Eliminar cuenta de cobro</h3>
            <p className="text-brand-gray text-sm mb-6">
              ¿Eliminar <strong className="text-off-white">{cc.consecutivo}</strong>? Esta acción no se puede deshacer.
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
