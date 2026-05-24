'use client';

import { useId } from 'react';

export interface CotizacionItem {
  id: string;
  descripcion: string;
  valor: number;
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

interface InvoiceTableCotizacionProps {
  items: CotizacionItem[];
  onChange: (items: CotizacionItem[]) => void;
}

export default function InvoiceTableCotizacion({ items, onChange }: InvoiceTableCotizacionProps) {
  const baseId = useId();

  const add = () =>
    onChange([...items, { id: crypto.randomUUID(), descripcion: '', valor: 0 }]);

  const remove = (id: string) =>
    onChange(items.filter((i) => i.id !== id));

  const update = (id: string, patch: Partial<CotizacionItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const total = items.reduce((acc, i) => acc + (i.valor || 0), 0);

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-navy text-off-white text-xs font-bold uppercase tracking-wide">
            <th className="py-3 px-4 text-left w-12">Items</th>
            <th className="py-3 px-4 text-left">Descripción del Servicio</th>
            <th className="py-3 px-4 text-right w-40">Valor</th>
            <th className="py-3 px-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-white/10 hover:bg-white/[0.02]">
              <td className="py-2 px-4 text-brand-gray text-sm text-center">{idx + 1}</td>
              <td className="py-2 px-4">
                <input
                  id={`${baseId}-desc-${item.id}`}
                  type="text"
                  value={item.descripcion}
                  onChange={(e) => update(item.id, { descripcion: e.target.value })}
                  placeholder="Descripción del servicio..."
                  className="w-full bg-transparent border-none outline-none text-off-white text-sm focus:text-white"
                />
              </td>
              <td className="py-2 px-4">
                <input
                  id={`${baseId}-val-${item.id}`}
                  type="number"
                  min={0}
                  step={1000}
                  value={item.valor || ''}
                  onChange={(e) => update(item.id, { valor: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-transparent border-none outline-none text-blue-glow font-semibold text-sm text-right focus:text-white"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-brand-gray hover:text-accent text-lg leading-none transition-colors w-6 h-6 flex items-center justify-center"
                  aria-label="Eliminar ítem"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-white/20">
            <td colSpan={2} />
            <td colSpan={2} className="py-4 px-4 text-right">
              <span className="text-brand-gray text-xs uppercase tracking-widest mr-4">Total</span>
              <span className="text-blue-glow font-bold text-lg">{formatCOP(total)}</span>
            </td>
          </tr>
        </tfoot>
      </table>

      <button
        type="button"
        onClick={add}
        className="mt-3 w-full py-2 text-brand-gray text-sm rounded transition-colors hover:text-off-white hover:border-blue-glow/40"
        style={{ background: 'none', border: '1px dashed rgba(143,163,192,0.4)' }}
      >
        + Agregar ítem
      </button>
    </div>
  );
}
