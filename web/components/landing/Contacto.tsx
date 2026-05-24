const CONTACT_CARDS = [
  {
    icon: '📞',
    titulo: 'Teléfono',
    principal: '300 451 3435',
    detalle: 'Carlos López – Gerente General',
    href: 'tel:+573004513435',
  },
  {
    icon: '📧',
    titulo: 'Correo Electrónico',
    principal: 'solucioneselectricaslopez',
    detalle: '@outlook.com',
    href: 'mailto:solucioneselectricaslopez@outlook.com',
  },
  {
    icon: '📍',
    titulo: 'Ubicación',
    principal: 'Pereira, Risaralda',
    detalle: 'Eje Cafetero y regiones aledañas',
    href: null,
  },
  {
    icon: '🕐',
    titulo: 'Horario',
    principal: 'Emergencias 24/7',
    detalle: 'Atención inmediata siempre',
    href: null,
  },
];

const WA_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const IG_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

export default function Contacto() {
  return (
    <section id="contacto" className="py-24 px-8 bg-navy">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <div className="text-blue-glow text-xs font-semibold tracking-[0.15em] uppercase mb-2">
            ⚡ Estamos aquí
          </div>
          <div
            className="font-display font-extrabold uppercase leading-tight text-off-white mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Contáctanos <em className="text-blue-glow not-italic">Hoy</em>
          </div>
          <p className="text-brand-gray font-light leading-relaxed mx-auto max-w-lg">
            Atención inmediata, respuesta rápida y soluciones confiables para tu hogar o empresa.
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid gap-6 mt-12 reveal"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {CONTACT_CARDS.map((card) => {
            const inner = (
              <>
                <span className="text-3xl mb-3 block">{card.icon}</span>
                <h4 className="font-display font-bold uppercase tracking-widest text-brand-gray text-xs mb-1">
                  {card.titulo}
                </h4>
                <p className="text-off-white font-medium text-base">{card.principal}</p>
                <small className="text-brand-gray text-xs block mt-1">{card.detalle}</small>
              </>
            );

            const sharedClass =
              'p-7 border border-white/[0.07] rounded-lg bg-white/[0.03] transition-all duration-200 hover:bg-blue/[0.08] hover:border-blue-glow/25 hover:-translate-y-1';

            return card.href ? (
              <a key={card.titulo} href={card.href} className={`${sharedClass} block no-underline text-inherit`}>
                {inner}
              </a>
            ) : (
              <div key={card.titulo} className={sharedClass}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* Social buttons */}
        <div className="flex gap-4 justify-center mt-12 flex-wrap reveal">
          <a
            href="https://wa.me/573004513435"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-white font-bold px-9 py-4 rounded-[50px] text-base tracking-wide no-underline transition-all duration-200 hover:-translate-y-1"
            style={{
              background: '#25d366',
              boxShadow: '0 8px 30px rgba(37,211,102,0.25)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(37,211,102,0.35)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(37,211,102,0.25)';
            }}
          >
            {WA_SVG}
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/soluciones_electricas_lopez"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-white font-bold px-9 py-4 rounded-[50px] text-base tracking-wide no-underline transition-all duration-200 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              boxShadow: '0 8px 30px rgba(220,39,67,0.25)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(220,39,67,0.35)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(220,39,67,0.25)';
            }}
          >
            {IG_SVG}
            Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
