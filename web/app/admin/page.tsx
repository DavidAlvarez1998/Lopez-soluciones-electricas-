import { createClient } from '@/lib/supabase/server';

interface Metric {
  label: string;
  value: string;
  icon: string;
  color: string;
}

async function fetchMetrics(): Promise<Metric[]> {
  const defaults: Metric[] = [
    { label: 'Solicitudes nuevas', value: '—', icon: '📋', color: 'text-blue-glow' },
    { label: 'Cotizaciones pendientes', value: '—', icon: '📄', color: 'text-yellow-400' },
    { label: 'Cuentas de cobro pendientes', value: '—', icon: '💰', color: 'text-accent' },
    { label: 'Total clientes', value: '—', icon: '👥', color: 'text-green-400' },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || !supabaseKey) {
    return defaults;
  }

  try {
    const supabase = createClient();

    const [solicitudesRes, cotizacionesRes, cuentasRes, clientesRes] = await Promise.all([
      supabase.from('solicitudes_publicas').select('id', { count: 'exact', head: true }).eq('estado', 'nueva'),
      supabase.from('cotizaciones').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('cuentas_cobro').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
    ]);

    return [
      {
        label: 'Solicitudes nuevas',
        value: solicitudesRes.error ? '—' : String(solicitudesRes.count ?? 0),
        icon: '📋',
        color: 'text-blue-glow',
      },
      {
        label: 'Cotizaciones pendientes',
        value: cotizacionesRes.error ? '—' : String(cotizacionesRes.count ?? 0),
        icon: '📄',
        color: 'text-yellow-400',
      },
      {
        label: 'Cuentas de cobro pendientes',
        value: cuentasRes.error ? '—' : String(cuentasRes.count ?? 0),
        icon: '💰',
        color: 'text-accent',
      },
      {
        label: 'Total clientes',
        value: clientesRes.error ? '—' : String(clientesRes.count ?? 0),
        icon: '👥',
        color: 'text-green-400',
      },
    ];
  } catch {
    return defaults;
  }
}

export default async function DashboardPage() {
  const metrics = await fetchMetrics();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-off-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-brand-gray text-sm font-medium">{metric.label}</p>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <p className={`text-3xl font-bold font-display ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <p className="text-brand-gray text-sm mt-8">
        {process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'
          ? 'Configurá las variables de entorno de Supabase para ver métricas reales.'
          : 'Métricas en tiempo real desde Supabase.'}
      </p>
    </div>
  );
}
