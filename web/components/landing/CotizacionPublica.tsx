'use client';

import { useState } from 'react';
import { insertarSolicitudPublica } from '@/lib/actions/solicitudes';

interface LineItem {
  id: string;
  descripcion: string;
  valor: string;
}

function newItem(): LineItem {
  return { id: crypto.randomUUID(), descripcion: '', valor: '' };
}

export default function CotizacionPublica() {
  const [items, setItems] = useState<LineItem[]>([newItem(), newItem(), newItem()]);
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    contacto: '',
    telefono: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const addItem = () => setItems((prev) => [...prev, newItem()]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: 'descripcion' | 'valor', value: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validItems = items.filter((i) => i.descripcion.trim());
    if (!formData.nombre_cliente.trim()) {
      setError('El nombre del cliente es requerido.');
      return;
    }
    if (validItems.length === 0) {
      setError('Agregá al menos un ítem con descripción.');
      return;
    }

    setLoading(true);
    try {
      const result = await insertarSolicitudPublica({
        nombre_cliente: formData.nombre_cliente,
        contacto: formData.contacto || undefined,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        items: validItems.map((i) => ({ descripcion: i.descripcion, valor: i.valor })),
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? 'Ocurrió un error. Por favor contacta por WhatsApp.');
      }
    } catch {
      setError('Error inesperado. Por favor contacta por WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const buildWhatsAppUrl = () => {
    const validItems = items.filter((i) => i.descripcion.trim());
    let text = `Hola, soy ${formData.nombre_cliente || '(cliente)'}. `;
    if (formData.telefono) text += `Tel: ${formData.telefono}. `;
    if (formData.direccion) text += `Dir: ${formData.direccion}. `;
    text += '\nServicios a cotizar:\n';
    validItems.forEach((item, idx) => {
      text += `${idx + 1}. ${item.descripcion}${item.valor ? ` - ${item.valor}` : ''}\n`;
    });
    return `https://wa.me/573004513435?text=${encodeURIComponent(text)}`;
  };

  if (success) {
    return (
      <section id="cotizacion" className="py-24 px-8" style={{ background: '#071a3e' }}>
        <div className="max-w-[1100px] mx-auto flex items-center justify-center">
          <div className="text-center py-16 px-8">
            <div className="text-5xl mb-6">✅</div>
            <h3 className="font-display font-bold uppercase text-2xl text-off-white mb-4">
              ¡Cotización Enviada!
            </h3>
            <p className="text-brand-gray mb-8">
              Nos pondremos en contacto contigo muy pronto. Atención inmediata 24/7.
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-[100px] font-semibold text-white transition-all duration-200"
              style={{ background: '#25d366' }}
            >
              También por WhatsApp →
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cotizacion" className="py-24 px-8" style={{ background: '#071a3e' }}>
      <div className="max-w-[1100px] mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start"
          style={{}}
        >
          {/* Left — info */}
          <div className="reveal">
            <div className="text-blue-glow text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              ⚡ Sin costo
            </div>
            <div
              className="font-display font-extrabold uppercase leading-tight text-off-white mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Solicita tu <em className="text-blue-glow not-italic">Cotización</em>
            </div>
            <p className="text-brand-gray font-light leading-relaxed max-w-md">
              Completa el formulario y te contactaremos con la propuesta personalizada para tu
              proyecto.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {[
                'Respuesta en menos de 24 horas',
                'Cotización sin compromiso',
                'Asesoría técnica incluida',
              ].map((b) => (
                <div key={b} className="flex items-center gap-3 text-brand-gray text-sm">
                  <span className="text-blue-glow">⚡</span>
                  {b}
                </div>
              ))}
            </div>

            <div
              className="mt-10 p-6 rounded-lg border border-blue/20"
              style={{ background: 'rgba(30,111,212,0.08)' }}
            >
              <p className="text-blue-glow text-xs font-semibold uppercase tracking-widest mb-2">
                Contacto directo
              </p>
              <p className="font-semibold text-off-white">📞 300 451 3435</p>
              <p className="text-brand-gray text-sm mt-1">
                solucioneselectricaslopez@outlook.com
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div
            className="reveal rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            }}
          >
            {/* Form header */}
            <div
              className="flex justify-between items-center px-8 py-7 border-b border-white/10"
              style={{ background: 'rgba(3,15,35,0.4)' }}
            >
              <div>
                <div
                  className="font-display font-black text-off-white"
                  style={{
                    fontSize: '1.8rem',
                    textShadow: '0 0 20px rgba(59,140,255,0.5)',
                  }}
                >
                  ⚡ LÓPEZ
                </div>
                <div className="text-blue-glow text-xs font-semibold tracking-[0.15em] uppercase">
                  SOLUCIONES ELÉCTRICAS
                </div>
              </div>
              <div className="font-display font-extrabold uppercase tracking-widest text-right text-off-white/80 text-lg">
                COTIZACIÓN
                <br />
                DE SERVICIOS
              </div>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="p-10">
              {/* Fecha */}
              <div className="mb-6">
                <label className="block text-brand-gray text-xs font-bold uppercase tracking-widest mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  defaultValue={today}
                  readOnly
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm outline-none"
                />
              </div>

              {/* Cliente */}
              <div className="mb-4">
                <label className="block text-brand-gray text-xs font-bold uppercase tracking-widest mb-2">
                  Cliente <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre_cliente}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, nombre_cliente: e.target.value }))
                  }
                  placeholder="Nombre del cliente o empresa"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm outline-none transition-all duration-300 focus:border-blue-glow focus:bg-white/[0.07] focus:shadow-glow"
                />
              </div>

              {/* Contacto + Teléfono */}
              <div className="flex flex-col sm:flex-row gap-6 mb-4">
                <div className="flex-1">
                  <label className="block text-brand-gray text-xs font-bold uppercase tracking-widest mb-2">
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, contacto: e.target.value }))
                    }
                    placeholder="Nombre de contacto"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm outline-none transition-all duration-300 focus:border-blue-glow focus:bg-white/[0.07]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-brand-gray text-xs font-bold uppercase tracking-widest mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, telefono: e.target.value }))
                    }
                    placeholder="300 000 0000"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm outline-none transition-all duration-300 focus:border-blue-glow focus:bg-white/[0.07]"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="mb-6">
                <label className="block text-brand-gray text-xs font-bold uppercase tracking-widest mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, direccion: e.target.value }))
                  }
                  placeholder="Dirección del proyecto"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-off-white text-sm outline-none transition-all duration-300 focus:border-blue-glow focus:bg-white/[0.07]"
                />
              </div>

              {/* Items table */}
              <div className="mt-5">
                <div
                  className="grid text-blue-glow text-xs font-extrabold uppercase tracking-widest px-5 py-3 rounded-t-lg border border-b-0 border-white/10"
                  style={{
                    gridTemplateColumns: '1fr 120px',
                    background: 'rgba(3,15,35,0.6)',
                  }}
                >
                  <span>Descripción del Servicio</span>
                  <span className="text-right">Valor</span>
                </div>
                <div className="border border-white/10 rounded-b-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid border-b border-white/10 last:border-b-0 group relative"
                      style={{ gridTemplateColumns: '1fr 120px' }}
                    >
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                        placeholder="Descripción del servicio..."
                        className="bg-transparent border-none px-5 py-3 text-off-white text-sm outline-none focus:bg-blue-glow/10 w-full"
                      />
                      <div className="flex items-center border-l border-white/10">
                        <input
                          type="text"
                          value={item.valor}
                          onChange={(e) => updateItem(item.id, 'valor', e.target.value)}
                          placeholder="$ 0"
                          className="bg-transparent border-none px-3 py-3 text-blue-glow font-semibold text-sm outline-none focus:bg-blue-glow/10 text-right w-full"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="hidden group-hover:flex items-center justify-center w-6 h-6 text-accent text-lg leading-none absolute right-1 top-1/2 -translate-y-1/2"
                            aria-label="Eliminar ítem"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="w-full mt-2 py-2 text-brand-gray text-xs cursor-pointer rounded transition-colors hover:text-off-white"
                  style={{ background: 'none', border: '1px dashed rgba(197,208,224,0.4)' }}
                >
                  + Agregar ítem
                </button>
              </div>

              {/* Footer note */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-off-white text-xs font-bold uppercase tracking-widest">
                  Seguridad, Calidad y Compromiso en cada Proyecto
                </p>
                <p className="text-brand-gray text-xs italic mt-1">
                  ¡Gracias por confiar en nosotros!
                </p>
                <span className="block text-right text-blue-glow text-2xl mt-2" style={{ filter: 'drop-shadow(0 0 10px #3b8cff)' }}>
                  ⚡
                </span>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-blue-bright hover:bg-blue-glow text-white font-semibold uppercase tracking-wide text-sm rounded transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : '📩 Enviar Solicitud'}
              </button>

              {/* WhatsApp fallback */}
              <div className="mt-4 text-center">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gray text-xs hover:text-off-white transition-colors underline"
                >
                  O enviar directamente por WhatsApp →
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
