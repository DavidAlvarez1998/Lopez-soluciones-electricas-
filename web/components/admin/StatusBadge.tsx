type BadgeType = 'cotizacion' | 'cuenta_cobro' | 'solicitud';

const COLOR_MAP: Record<BadgeType, Record<string, string>> = {
  cotizacion: {
    pendiente: 'bg-brand-gray/20 text-brand-gray border-brand-gray/30',
    aprobada: 'bg-green-500/20 text-green-400 border-green-500/30',
    rechazada: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  cuenta_cobro: {
    pendiente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    pagada: 'bg-green-500/20 text-green-400 border-green-500/30',
    anulada: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  solicitud: {
    nueva: 'bg-blue-glow/20 text-blue-glow border-blue-glow/30',
    atendida: 'bg-brand-gray/20 text-brand-gray border-brand-gray/30',
    descartada: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

const LABEL_MAP: Record<BadgeType, Record<string, string>> = {
  cotizacion: {
    pendiente: 'Pendiente',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
  },
  cuenta_cobro: {
    pendiente: 'Pendiente',
    pagada: 'Pagada',
    anulada: 'Anulada',
  },
  solicitud: {
    nueva: 'Nueva',
    atendida: 'Atendida',
    descartada: 'Descartada',
  },
};

interface StatusBadgeProps {
  status: string;
  type: BadgeType;
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const colorClass =
    COLOR_MAP[type][status] ?? 'bg-brand-gray/20 text-brand-gray border-brand-gray/30';
  const label = LABEL_MAP[type][status] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${colorClass}`}
    >
      {label}
    </span>
  );
}
