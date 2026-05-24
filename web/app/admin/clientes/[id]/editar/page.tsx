'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { actualizarCliente, eliminarCliente } from '@/lib/actions/clientes';

const TIPO_DOC_OPTIONS = [
  { value: 'NIT', label: 'NIT' },
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

interface Cliente {
  id: string;
  nombre_razon_social: string;
  numero_documento: string;
  tipo_documento: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  notas: string | null;
}

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
          setFetching(false);
          return;
        }
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single();
        setCliente(data);
      } catch {
        setError('No se pudo cargar el cliente.');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await actualizarCliente(id, formData);

    if (!result.success) {
      setError(result.error ?? 'Error desconocido');
      setLoading(false);
      return;
    }

    router.push('/admin/clientes');
  };

  const handleDelete = async () => {
    setLoading(true);
    await eliminarCliente(id);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-gray">Cliente no encontrado.</p>
        <Link href="/admin/clientes" className="text-blue-glow text-sm mt-4 inline-block">
          Volver a Clientes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/clientes"
          className="text-brand-gray hover:text-off-white text-sm transition"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-display font-bold text-off-white">Editar Cliente</h1>
      </div>

      <div className="max-w-2xl">
        <div className="bg-navy-2 border border-white/10 rounded-xl p-6">
          {error && (
            <div className="mb-4 text-accent text-sm bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Nombre / Razón Social <span className="text-accent">*</span>
              </label>
              <input
                name="nombre_razon_social"
                type="text"
                required
                defaultValue={cliente.nombre_razon_social}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                  Tipo Doc.
                </label>
                <select
                  name="tipo_documento"
                  defaultValue={cliente.tipo_documento}
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
                  defaultValue={cliente.numero_documento}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Dirección
              </label>
              <input
                name="direccion"
                type="text"
                defaultValue={cliente.direccion ?? ''}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  type="tel"
                  defaultValue={cliente.telefono ?? ''}
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
                  defaultValue={cliente.correo ?? ''}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5 block">
                Notas internas
              </label>
              <textarea
                name="notas"
                rows={3}
                defaultValue={cliente.notas ?? ''}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder:text-brand-gray focus:border-blue-glow focus:ring-1 focus:ring-blue-glow outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-bright hover:bg-blue-glow text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <Link
                  href="/admin/clientes"
                  className="px-6 py-2.5 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm font-medium"
                >
                  Cancelar
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 text-sm transition"
              >
                Eliminar cliente
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-2 border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-off-white font-bold text-lg mb-2">Eliminar cliente</h3>
            <p className="text-brand-gray text-sm mb-6">
              ¿Estás seguro que querés eliminar a <strong className="text-off-white">{cliente.nombre_razon_social}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-brand-gray hover:text-off-white border border-white/10 rounded-lg transition text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
