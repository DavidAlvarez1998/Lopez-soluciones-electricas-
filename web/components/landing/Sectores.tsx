const SECTORES = [
  {
    num: '01',
    titulo: 'Sector Residencial',
    descripcion:
      'Conjuntos, propiedades horizontales, urbanizadores y constructoras. Instalaciones de baja tensión y alumbrado.',
  },
  {
    num: '02',
    titulo: 'Sector Industrial',
    descripcion:
      'Plantas de producción, zonas industriales y zonas francas. Subestaciones, transformadores y equipos críticos.',
  },
  {
    num: '03',
    titulo: 'Sector Comercial',
    descripcion:
      'Centros comerciales, hoteles, edificios de oficinas y clínicas. Media y baja tensión con mantenimiento preventivo.',
  },
  {
    num: '04',
    titulo: 'Sector Institucional y Público',
    descripcion: 'Alcaldías, colegios, hospitales. Alumbrado público y redes urbanas.',
  },
];

const DIFERENCIADORES = [
  'Certificación RETIE y personal calificado',
  'Equipos profesionales y diagnóstico preciso',
  'Alianzas estratégicas en el Eje Cafetero',
  'Compromiso con la sostenibilidad',
  'Tiempo de respuesta ágil y personalizado',
  'Atención de emergencias 24 horas al día',
];

export default function Sectores() {
  return (
    <section id="sectores" className="py-24 px-8 bg-navy">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — sector list */}
          <div className="reveal">
            <div className="text-blue-glow text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              ⚡ A quién servimos
            </div>
            <div
              className="font-display font-extrabold uppercase leading-tight text-off-white mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Sectores que <em className="text-blue-glow not-italic">Atendemos</em>
            </div>
            <p className="text-brand-gray font-light leading-relaxed max-w-lg">
              Operamos en todo el Eje Cafetero con soluciones adaptadas a cada tipo de cliente.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {SECTORES.map((s) => (
                <div
                  key={s.num}
                  className="flex gap-5 items-start p-5 border border-white/[0.06] rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-glow/30 hover:bg-blue/[0.06]"
                >
                  <div
                    className="font-display font-black leading-none min-w-[36px]"
                    style={{ fontSize: '2rem', color: 'rgba(30,111,212,0.3)' }}
                  >
                    {s.num}
                  </div>
                  <div>
                    <h4 className="font-display font-bold uppercase tracking-wide text-off-white text-lg mb-1">
                      {s.titulo}
                    </h4>
                    <p className="text-brand-gray text-sm leading-relaxed">{s.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — ¿Por qué elegirnos? */}
          <div
            className="reveal relative rounded-xl p-10 text-center border"
            style={{
              background: 'rgba(30,111,212,0.06)',
              borderColor: 'rgba(30,111,212,0.15)',
            }}
          >
            {/* Giant bolt */}
            <div
              className="text-blue-bright select-none"
              style={{
                fontSize: '8rem',
                lineHeight: 1,
                opacity: 0.15,
                animation: 'pulse 3s ease-in-out infinite',
              }}
            >
              ⚡
            </div>

            <p
              className="font-display font-bold uppercase tracking-wide text-blue-glow mb-6"
              style={{ fontSize: '1.4rem' }}
            >
              ¿Por qué elegirnos?
            </p>

            <ul className="list-none m-0 p-0">
              {DIFERENCIADORES.map((item) => (
                <li
                  key={item}
                  className="py-2.5 border-b border-white/[0.06] text-sm text-brand-gray flex items-center gap-2.5 last:border-b-0"
                >
                  <span className="text-blue-glow text-xs">⚡</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
