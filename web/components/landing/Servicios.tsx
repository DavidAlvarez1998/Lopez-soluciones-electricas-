'use client';

import { Settings, Zap, Plug, Search, TrendingUp, ClipboardCheck } from 'lucide-react';
import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Servicio {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  tags: string[];
}

const SERVICIOS: Servicio[] = [
  {
    icon: Settings,
    titulo: 'Mantenimiento Eléctrico',
    descripcion:
      'Preventivo y correctivo para instalaciones eléctricas residenciales, comerciales e industriales.',
    tags: ['Preventivo', 'Correctivo'],
  },
  {
    icon: Zap,
    titulo: 'Atención de Emergencias',
    descripcion:
      'Respuesta rápida 24/7 para fallas e imprevistos eléctricos. Estamos cuando más nos necesitas.',
    tags: ['24/7', 'Urgente'],
  },
  {
    icon: Plug,
    titulo: 'Instalaciones Eléctricas',
    descripcion:
      'Diseño e instalación de sistemas eléctricos residenciales, comerciales e industriales.',
    tags: ['Baja tensión', 'Media tensión'],
  },
  {
    icon: Search,
    titulo: 'Diagnóstico y Reparación',
    descripcion:
      'Identificamos y solucionamos fallas eléctricas de manera efectiva con equipos especializados.',
    tags: ['Termografía', 'MEGGER'],
  },
  {
    icon: TrendingUp,
    titulo: 'Mejoras y Adecuaciones',
    descripcion:
      'Modernizamos y optimizamos tus instalaciones eléctricas para mayor eficiencia energética.',
    tags: ['Eficiencia', 'Modernización'],
  },
  {
    icon: ClipboardCheck,
    titulo: 'Informes RETIE / RETILAP',
    descripcion:
      'Elaboración de informes técnicos normativos para cumplimiento legal y certificaciones.',
    tags: ['RETIE', 'RETILAP'],
  },
];

function ServiceCard({ servicio }: { servicio: Servicio }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = servicio.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    card.style.setProperty('--x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--y', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="service-card glass flex flex-col gap-4 p-10 rounded-xl border border-white/[0.08] cursor-pointer relative overflow-hidden transition-all duration-[400ms]"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-2"
        style={{
          background: 'linear-gradient(135deg, #1e6fd4, #3b8cff)',
          boxShadow: '0 8px 16px rgba(30,111,212,0.3)',
        }}
      >
        <Icon size={24} />
      </div>

      {/* Title */}
      <h3 className="font-display font-bold uppercase tracking-wide text-off-white" style={{ fontSize: '1.15rem' }}>
        {servicio.titulo}
      </h3>

      {/* Description */}
      <p className="text-brand-gray text-sm leading-relaxed">{servicio.descripcion}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {servicio.tags.map((tag) => (
          <span
            key={tag}
            className="text-blue-glow text-xs px-2.5 py-0.5 rounded-2xl border border-blue-glow/20 tracking-wide"
            style={{ background: 'rgba(30,111,212,0.12)', fontSize: '0.72rem' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Servicios() {
  return (
    <section id="servicios" className="py-24 px-8" style={{ background: '#071a3e' }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <div className="text-blue-glow text-xs font-semibold tracking-[0.15em] uppercase mb-2">
            ⚡ Lo que hacemos
          </div>
          <div
            className="font-display font-extrabold uppercase leading-tight text-off-white"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Nuestros <em className="text-blue-glow not-italic">Servicios</em>
          </div>
          <p className="text-brand-gray font-light leading-relaxed mx-auto mt-4 max-w-lg">
            Soluciones eléctricas integrales con tecnología de punta, personal certificado y
            respuesta ágil.
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid reveal"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5px',
            border: '1.5px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {SERVICIOS.map((s) => (
            <ServiceCard key={s.titulo} servicio={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
