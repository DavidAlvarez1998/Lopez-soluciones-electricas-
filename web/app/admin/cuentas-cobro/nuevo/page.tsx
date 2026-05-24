'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClienteAutocomplete, { type Cliente } from '@/components/admin/ClienteAutocomplete';
import InvoiceTableCuentaCobro, { type CuentaCobroItem } from '@/components/admin/InvoiceTableCuentaCobro';
import { crearCuentaCobro } from '@/lib/actions/cuentas-cobro';
import { formatCOP } from '@/lib/formatters/currency';

export default function NuevaCuentaCobroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cotizacionId = searchParams.get('cotizacion_id');

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [concepto, setConcepto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cotizacionRef, setCotizacionRef] = useState<string | null>(null);
  const [items, setItems] = useState<CuentaCobroItem[]>([
    { id: crypto.randomUUID(), descripcion: '', cantidad: 1, valor_unidad: 0, valor: 0 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-load cotizacion data if coming from "Generar Cuenta de Cobro"
  useEffect(() => {
    if (!cotizacionId) return;

    const loadCotizacion = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') return;

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from('cotizaciones')
          .select(`
            id, consecutivo, concepto, observaciones, cliente_id,
            clientes (id, nombre_razon_social, numero_documento, tipo_documento, telefono, correo, direccion),
            items_cotizacion (orden, descripcion, cantidad, valor_unidad)
          `)
          .eq('id', cotizacionId)
          .order('orden', { referencedTable: 'items_cotizacion' })
          .single();

        if (data) {
          setCotizacionRef(data.consecutivo);
          setConcepto(data.concepto ?? '');
          setObservaciones(data.observaciones ?? '');

          if (data.clientes) {
            setCliente(data.clientes as unknown as Cliente);
          }

          if (data.items_cotizacion && data.items_cotizacion.length > 0) {
            setItems(
              data.items_cotizacion.map((it: { descripcion: string; cantidad: number; valor_unidad: number }) => ({
                id: crypto.randomUUID(),
                descripcion: it.descripcion,
                cantidad: it.cantidad ?? 1,
                valor_unidad: it.valor_unidad ?? 0,
                valor: (it.cantidad ?? 1) * (it.valor_unidad ?? 0),
              }))
            );
          }
        }
      } catch {
        // silently fail
      }
    };

    loadCotizacion();
  }, [cotizacionId]);

  const subtotal = items.reduce((acc, i) => acc + (i.valor || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cliente) {
      setError('Seleccioná un cliente.');
      return;
    }
    if (!concepto.trim()) {
      setError('El concepto es requerido.');
      return;
    }
    const validItems = items.filter((i) => i.descripcion.trim() && i.cantidad > 0);
    if (validItems.length === 0) {
      setError('Agregá al menos un ítem con descripción y cantidad.');
      return;
    }

    setLoading(true);

    const result = await crearCuentaCobro({
      cliente_id: cliente.id,
      concepto: concepto.trim(),
      observaciones: observaciones.trim(),
      cotizacion_id: cotizacionId ?? null,
      items: validItems.map((i) => ({
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        valor_unidad: i.valor_unidad,
      })),
    });

    if (!result.success) {
      setError(result.error ?? 'Error al guardar la cuenta de cobro.');
      setLoading(false);
      return;
    }

    router.push(`/admin/cuentas-cobro/${result.data?.id}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cuentas-cobro"
          className="text-brand-gray hover:text-off-white text-sm transition"
        >
          ← Volver
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-off-white">Nueva Cuenta de Cobro</h1>
          <p className="text-brand-gray text-xs mt-0.5">Consecutivo: se asigna al guardar</p>
        </div>
      </div>

      {cotizacionId && cotizacionRef && (
        <div className="mb-4 bg-blue/10 border border-blue/30 rounded-lg px-4 py-3 text-blue-glow text-sm">
          Generando desde cotización <strong>{cotizacionRef}</strong>. Los datos se pre-cargaron automáticamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {error && (
          <div className="text-accent text-sm bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Cliente */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Contratante</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Buscar cliente <span className="text-accent">*</span>
              </label>
              <ClienteAutocomplete
                onSelect={setCliente}
                initialValue={cliente?.nombre_razon_social}
              />
            </div>

            {cliente && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                <div className="col-span-2">
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Documento</label>
                  <p className="text-off-white text-sm">{cliente.tipo_documento}: {cliente.numero_documento}</p>
                </div>
                {cliente.telefono && (
                  <div>
                    <label className="text-xs text-brand-gray uppercase tracking-widest">Teléfono</label>
                    <p className="text-off-white text-sm">{cliente.telefono}</p>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="col-span-2 sm:col-span-4">
                    <label className="text-xs text-brand-gray uppercase tracking-widest">Dirección</label>
                    <p className="text-off-white text-sm">{cliente.direccion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Concepto + Observaciones */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Detalles</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Concepto <span className="text-accent">*</span>
              </label>
              <textarea
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                rows={3}
                placeholder="Descripción del servicio prestado..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                placeholder="Observaciones, forma de pago preferida..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
            </div>
            {cotizacionRef && (
              <div>
                <label className="text-xs text-brand-gray uppercase tracking-widest">Cotización de referencia</label>
                <p className="text-blue-glow font-mono text-sm">{cotizacionRef}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-off-white font-semibold">Ítems del Servicio</h2>
            <span className="text-brand-gray text-xs">
              Total: <span className="text-blue-glow font-bold text-sm">{formatCOP(subtotal)}</span>
            </span>
          </div>
          <InvoiceTableCuentaCobro items={items} onChange={setItems} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Cuenta de Cobro'}
          </button>
          <Link
            href="/admin/cuentas-cobro"
            className="px-6 py-2.5 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
