'use client';

import { useId } from 'react';

export interface CuentaCobroItem {
  id: string;
  descripcion: string;
  cantidad: number;
  valor_unidad: number;
  valor: number; // calculated: cantidad * valor_unidad
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

interface InvoiceTableCuentaCobroProps {
  items: CuentaCobroItem[];
  onChange: (items: CuentaCobroItem[]) => void;
}

export default function InvoiceTableCuentaCobro({ items, onChange }: InvoiceTableCuentaCobroProps) {
  const baseId = useId();

  const add = () =>
    onChange([
      ...items,
      { id: crypto.randomUUID(), descripcion: '', cantidad: 1, valor_unidad: 0, valor: 0 },
    ]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const update = (id: string, patch: Partial<Omit<CuentaCobroItem, 'valor'>>) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        next.valor = Math.round(next.cantidad * next.valor_unidad * 100) / 100;
        return next;
      })
    );
  };

  const subtotal = items.reduce((acc, i) => acc + (i.valor || 0), 0);
  const total = subtotal; // no IVA in MVP

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-navy text-off-white text-xs font-bold uppercase tracking-wide">
            <th className="py-3 px-4 text-left w-12">Items</th>
            <th className="py-3 px-4 text-left">Descripción</th>
            <th className="py-3 px-4 text-right w-28">Cantidad</th>
            <th className="py-3 px-4 text-right w-36">Valor Unidad</th>
            <th className="py-3 px-4 text-right w-36">Valor</th>
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
                  placeholder="Descripción..."
                  className="w-full bg-transparent border-none outline-none text-off-white text-sm"
                />
              </td>
              <td className="py-2 px-4">
                <input
                  id={`${baseId}-qty-${item.id}`}
                  type="number"
                  min={0.01}
                  step={0.5}
                  value={item.cantidad || ''}
                  onChange={(e) => update(item.id, { cantidad: Number(e.target.value) })}
                  className="w-full bg-transparent border-none outline-none text-off-white text-sm text-right"
                />
              </td>
              <td className="py-2 px-4">
                <input
                  id={`${baseId}-unit-${item.id}`}
                  type="number"
                  min={0}
                  step={1000}
                  value={item.valor_unidad || ''}
                  onChange={(e) => update(item.id, { valor_unidad: Number(e.target.value) })}
                  className="w-full bg-transparent border-none outline-none text-off-white text-sm text-right"
                />
              </td>
              <td className="py-2 px-4 text-right text-blue-glow font-semibold text-sm">
                {formatCOP(item.valor)}
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
          <tr className="border-t border-white/10">
            <td colSpan={4} className="py-2 px-4 text-right text-brand-gray text-xs uppercase tracking-widest">
              Subtotal
            </td>
            <td className="py-2 px-4 text-right text-off-white font-semibold">
              {formatCOP(subtotal)}
            </td>
            <td />
          </tr>
          <tr className="border-t-2 border-white/20">
            <td colSpan={4} className="py-3 px-4 text-right text-brand-gray text-xs uppercase tracking-widest">
              Total
            </td>
            <td className="py-3 px-4 text-right text-blue-glow font-bold text-lg">
              {formatCOP(total)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      <button
        type="button"
        onClick={add}
        className="mt-3 w-full py-2 text-brand-gray text-sm rounded transition-colors hover:text-off-white"
        style={{ background: 'none', border: '1px dashed rgba(143,163,192,0.4)' }}
      >
        + Agregar ítem
      </button>
    </div>
  );
}
