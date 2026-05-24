'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClienteAutocomplete, { type Cliente } from '@/components/admin/ClienteAutocomplete';
import InvoiceTableCotizacion, { type CotizacionItem } from '@/components/admin/InvoiceTableCotizacion';
import { crearCotizacion } from '@/lib/actions/cotizaciones';
import { formatCOP } from '@/lib/formatters/currency';

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('solicitud_id');

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [concepto, setConcepto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<CotizacionItem[]>([
    { id: crypto.randomUUID(), descripcion: '', valor: 0 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-load solicitud data if coming from conversion
  useEffect(() => {
    if (!solicitudId) return;

    const loadSolicitud = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') return;

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from('solicitudes_publicas')
          .select('nombre, descripcion, telefono')
          .eq('id', solicitudId)
          .single();

        if (data) {
          setConcepto(data.descripcion ?? '');
          setItems([{ id: crypto.randomUUID(), descripcion: data.descripcion ?? '', valor: 0 }]);
        }
      } catch {
        // silently fail — user can fill manually
      }
    };

    loadSolicitud();
  }, [solicitudId]);

  const total = items.reduce((acc, i) => acc + (i.valor || 0), 0);

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
    const validItems = items.filter((i) => i.descripcion.trim());
    if (validItems.length === 0) {
      setError('Agregá al menos un ítem con descripción.');
      return;
    }

    setLoading(true);

    const result = await crearCotizacion({
      cliente_id: cliente.id,
      concepto: concepto.trim(),
      observaciones: observaciones.trim(),
      solicitud_id: solicitudId ?? null,
      items: validItems.map((i) => ({ descripcion: i.descripcion, valor: i.valor })),
    });

    if (!result.success) {
      setError(result.error ?? 'Error al guardar la cotización.');
      setLoading(false);
      return;
    }

    router.push(`/admin/cotizaciones/${result.data?.id}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cotizaciones"
          className="text-brand-gray hover:text-off-white text-sm transition"
        >
          ← Volver
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-off-white">Nueva Cotización</h1>
          <p className="text-brand-gray text-xs mt-0.5">Consecutivo: se asigna al guardar</p>
        </div>
      </div>

      {solicitudId && (
        <div className="mb-4 bg-blue/10 border border-blue/30 rounded-lg px-4 py-3 text-blue-glow text-sm">
          Creando cotización desde solicitud pública. Los datos se pre-cargaron automáticamente.
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
          <h2 className="text-off-white font-semibold mb-4">Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Buscar cliente <span className="text-accent">*</span>
              </label>
              <ClienteAutocomplete onSelect={setCliente} />
            </div>

            {cliente && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="text-xs text-brand-gray uppercase tracking-widest">Documento</label>
                  <p className="text-off-white text-sm">{cliente.tipo_documento}: {cliente.numero_documento}</p>
                </div>
                {cliente.telefono && (
                  <div>
                    <label className="text-xs text-brand-gray uppercase tracking-widest">Teléfono</label>
                    <p className="text-off-white text-sm">{cliente.telefono}</p>
                  </div>
                )}
                {cliente.correo && (
                  <div>
                    <label className="text-xs text-brand-gray uppercase tracking-widest">Email</label>
                    <p className="text-off-white text-sm">{cliente.correo}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Concepto */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <h2 className="text-off-white font-semibold mb-4">Detalles</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Concepto del trabajo <span className="text-accent">*</span>
              </label>
              <textarea
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                rows={3}
                placeholder="Descripción general del trabajo cotizado..."
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
                placeholder="Observaciones adicionales..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-off-white font-semibold">Ítems</h2>
            <span className="text-brand-gray text-xs">
              Total: <span className="text-blue-glow font-bold text-sm">{formatCOP(total)}</span>
            </span>
          </div>
          <InvoiceTableCotizacion items={items} onChange={setItems} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Cotización'}
          </button>
          <Link
            href="/admin/cotizaciones"
            className="px-6 py-2.5 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
