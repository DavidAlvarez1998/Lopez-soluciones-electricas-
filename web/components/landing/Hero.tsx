'use client';

import { useEffect, useRef } from 'react';

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!contentRef.current) return;
      const scrollY = window.scrollY;
      contentRef.current.style.transform = `translateY(${scrollY * 0.25}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="inicio"
      className="min-h-screen flex items-center justify-center text-center relative overflow-hidden pt-24 pb-16 bg-navy"
      style={{ padding: '6rem 2rem 4rem' }}
    >
      {/* Aurora background */}
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ opacity: 0.6, filter: 'blur(60px)' }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw',
            height: '50vw',
            background: '#00d2ff',
            filter: 'blur(80px)',
            animation: 'auroraFloat 20s infinite alternate',
            top: '-10%',
            left: '-10%',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw',
            height: '50vw',
            background: '#3a7bd5',
            filter: 'blur(80px)',
            animation: 'auroraFloat 25s infinite alternate',
            right: '-10%',
            top: '-10%',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw',
            height: '50vw',
            background: '#1354a8',
            filter: 'blur(80px)',
            animation: 'auroraFloat 18s infinite alternate',
            left: '-10%',
            bottom: '-10%',
          }}
        />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30,111,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,111,212,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        }}
      />

      {/* Decorative bolt */}
      <div
        className="absolute top-[10%] right-[8%] font-display font-black text-blue-glow pointer-events-none select-none z-[2]"
        style={{ fontSize: '18rem', opacity: 0.04, lineHeight: 1 }}
      >
        ⚡
      </div>

      {/* Content with parallax */}
      <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto">
        {/* Badge */}
        <div
          className="inline-block border border-blue-glow/30 text-blue-glow px-5 py-1.5 rounded-2xl text-xs tracking-[0.1em] uppercase font-semibold mb-8"
          style={{
            background: 'rgba(30,111,212,0.18)',
            animation: 'fadeUp 0.6s ease both',
          }}
        >
          ⚡ Pereira, Risaralda · Eje Cafetero
        </div>

        {/* H1 */}
        <h1
          className="font-display font-black uppercase leading-[0.9] tracking-tight text-off-white"
          style={{
            fontSize: 'clamp(3.5rem, 8vw, 7rem)',
            animation: 'fadeUp 0.7s 0.1s ease both',
          }}
        >
          LÓPEZ
          <br />
          <em className="text-blue-glow not-italic">SOLUCIONES</em>
          <br />
          ELÉCTRICAS
        </h1>

        {/* Subtitle */}
        <p
          className="text-brand-gray font-light leading-relaxed mx-auto mt-6 mb-0"
          style={{
            fontSize: '1.15rem',
            maxWidth: '560px',
            lineHeight: 1.7,
            animation: 'fadeUp 0.7s 0.2s ease both',
          }}
        >
          Comprometidos con el cambio energético. Energía segura, soluciones a tu medida para el
          sector residencial, industrial, comercial e institucional.
        </p>

        {/* Buttons */}
        <div
          className="flex gap-4 justify-center flex-wrap mt-8"
          style={{ animation: 'fadeUp 0.7s 0.3s ease both' }}
        >
          <a
            href="#cotizacion"
            className="inline-flex items-center gap-3 text-white font-bold px-10 py-4 rounded-[100px] text-base tracking-wide transition-all duration-300 no-underline"
            style={{
              background: 'linear-gradient(135deg, #1e6fd4, #3b8cff)',
              boxShadow: '0 10px 20px rgba(30,111,212,0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.05)';
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 15px 30px rgba(30,111,212,0.4), 0 0 20px rgba(59,140,255,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 10px 20px rgba(30,111,212,0.3)';
            }}
          >
            📋 Solicitar Cotización
          </a>
          <a
            href="#servicios"
            className="inline-flex items-center gap-3 text-off-white font-semibold px-10 py-4 rounded-[100px] text-base tracking-wide transition-all duration-300 no-underline border border-white/20"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(5px)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#3b8cff';
              (e.currentTarget as HTMLElement).style.background = 'rgba(59,140,255,0.1)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            Ver Servicios →
          </a>
        </div>

        {/* Stats */}
        <div
          className="flex gap-12 justify-center flex-wrap mt-16"
          style={{ animation: 'fadeUp 0.7s 0.4s ease both' }}
        >
          <div className="text-center">
            <div
              className="font-display font-black text-off-white leading-none"
              style={{ fontSize: '2.8rem' }}
            >
              24<span className="text-blue-glow">/7</span>
            </div>
            <p className="text-brand-gray text-xs uppercase tracking-[0.08em] mt-1">
              Atención de emergencias
            </p>
          </div>
          <div className="text-center">
            <div
              className="font-display font-black text-off-white leading-none"
              style={{ fontSize: '2.8rem' }}
            >
              <span className="text-blue-glow">+</span>5
            </div>
            <p className="text-brand-gray text-xs uppercase tracking-[0.08em] mt-1">
              Sectores atendidos
            </p>
          </div>
          <div className="text-center">
            <div
              className="font-display font-black text-off-white leading-none"
              style={{ fontSize: '2.8rem' }}
            >
              100<span className="text-blue-glow">%</span>
            </div>
            <p className="text-brand-gray text-xs uppercase tracking-[0.08em] mt-1">
              Certificación RETIE
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
