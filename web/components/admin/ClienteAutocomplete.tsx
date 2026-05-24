'use client';

import { useState, useEffect, useRef } from 'react';


export interface Cliente {
  id: string;
  nombre_razon_social: string;
  numero_documento: string;
  tipo_documento: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

interface ClienteAutocompleteProps {
  onSelect: (cliente: Cliente | null) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function ClienteAutocomplete({
  onSelect,
  initialValue = '',
  placeholder = 'Buscar cliente por nombre o NIT...',
}: ClienteAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || !supabaseKey) {
          setResults([]);
          setLoading(false);
          return;
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data } = await supabase.rpc('buscar_clientes', { q: query, lim: 10 });
        setResults(data ?? []);
        setOpen(true);
      } catch (err) {
        console.error('ClienteAutocomplete search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (cliente: Cliente) => {
    setQuery(cliente.nombre_razon_social);
    setOpen(false);
    onSelect(cliente);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onSelect(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) onSelect(null);
          }}
          placeholder={placeholder}
          className="w-full bg-white/[0.05] border border-white/20 rounded-lg px-4 py-2.5 text-off-white text-sm outline-none transition-all duration-200 focus:border-blue-glow focus:bg-white/[0.08] pr-8"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-glow border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-off-white text-base leading-none"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-navy-2 border border-white/20 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-brand-gray text-sm">No se encontraron clientes</li>
          ) : (
            <>
              {results.map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="px-4 py-3 hover:bg-blue/20 cursor-pointer border-b border-white/[0.06] last:border-b-0 transition-colors duration-150"
                >
                  <div className="text-off-white text-sm font-medium">{c.nombre_razon_social}</div>
                  <div className="text-brand-gray text-xs mt-0.5">
                    {c.tipo_documento}: {c.numero_documento}
                  </div>
                </li>
              ))}
              <li
                onClick={() => {
                  setOpen(false);
                  onSelect(null);
                }}
                className="px-4 py-3 hover:bg-blue/10 cursor-pointer text-blue-glow text-sm font-medium"
              >
                + Crear nuevo cliente
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
