'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearCliente } from '@/lib/actions/clientes';

const TIPO_DOC_OPTIONS = [
  { value: 'NIT', label: 'NIT' },
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export default function NuevoClientePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await crearCliente(formData);

    if (!result.success) {
      setError(result.error ?? 'Error desconocido');
      setLoading(false);
      return;
    }

    router.push('/admin/clientes');
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/clientes"
          className="text-brand-gray hover:text-off-white text-sm transition"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-display font-bold text-off-white">Nuevo Cliente</h1>
      </div>

      <div className="max-w-2xl">
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          {error && (
            <div className="mb-4 text-accent text-sm bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre / Razón Social */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Nombre / Razón Social <span className="text-accent">*</span>
              </label>
              <input
                name="nombre_razon_social"
                type="text"
                required
                placeholder="Ej: Empresas XYZ S.A.S."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
              />
            </div>

            {/* Tipo + Número Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                  Tipo Doc.
                </label>
                <select
                  name="tipo_documento"
                  defaultValue="NIT"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
                >
                  {TIPO_DOC_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-navy">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                  Número Documento
                </label>
                <input
                  name="numero_documento"
                  type="text"
                  placeholder="Ej: 900123456-1"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Dirección
              </label>
              <input
                name="direccion"
                type="text"
                placeholder="Ej: Calle 10 #25-30, Pereira"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
              />
            </div>

            {/* Teléfono + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  type="tel"
                  placeholder="Ej: 300 123 4567"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                  Email
                </label>
                <input
                  name="correo"
                  type="email"
                  placeholder="Ej: contacto@empresa.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Notas internas
              </label>
              <textarea
                name="notas"
                rows={3}
                placeholder="Observaciones internas sobre el cliente..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cliente'}
              </button>
              <Link
                href="/admin/clientes"
                className="px-6 py-2.5 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
