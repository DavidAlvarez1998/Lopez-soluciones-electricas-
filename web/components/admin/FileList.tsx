'use client';

import { useState, useEffect, useCallback } from 'react';
import { listarAdjuntos, eliminarAdjunto, generarSignedUrl, type Adjunto } from '@/lib/actions/adjuntos';

interface FileListProps {
  entidad: 'cotizacion' | 'cuenta_cobro' | 'cliente';
  entidadId: string;
  refreshTrigger?: number;
}

function mimeIcon(mime: string): string {
  if (mime === 'application/pdf') return '📄';
  if (mime.startsWith('image/')) return '🖼️';
  return '📎';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileList({ entidad, entidadId, refreshTrigger = 0 }: FileListProps) {
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await listarAdjuntos(entidad, entidadId);
    if (result.success && result.data) {
      setAdjuntos(result.data);
    } else {
      setError(result.error ?? 'Error al cargar adjuntos.');
    }
    setLoading(false);
  }, [entidad, entidadId]);

  useEffect(() => {
    load();
  }, [load, refreshTrigger]);

  const handleDownload = async (adjunto: Adjunto) => {
    setDownloadingId(adjunto.id);
    const result = await generarSignedUrl(adjunto.storage_path);
    if (result.success && result.data) {
      window.open(result.data.url, '_blank');
    }
    setDownloadingId(null);
  };

  const handleDelete = async (adjunto: Adjunto) => {
    if (!confirm(`¿Eliminar "${adjunto.nombre_archivo}"?`)) return;
    setDeletingId(adjunto.id);
    const result = await eliminarAdjunto(adjunto.id);
    if (result.success) {
      setAdjuntos((prev) => prev.filter((a) => a.id !== adjunto.id));
    } else {
      setError(result.error ?? 'Error al eliminar.');
    }
    setDeletingId(null);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-14 bg-white/[0.03] border border-white/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-accent text-sm bg-accent/10 border border-accent/30 rounded-lg px-4 py-2">
        {error}
      </div>
    );
  }

  if (adjuntos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <span className="text-3xl mb-2">📭</span>
        <p className="text-brand-gray text-sm">Sin adjuntos</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {adjuntos.map((adj) => (
        <li
          key={adj.id}
          className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg">{mimeIcon(adj.mime)}</span>
            <div className="min-w-0">
              <p className="text-off-white text-sm truncate">{adj.nombre_archivo}</p>
              <p className="text-brand-gray text-xs">{formatSize(adj.tamano_bytes)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleDownload(adj)}
              disabled={downloadingId === adj.id}
              className="text-blue-glow hover:text-blue-bright text-xs transition-colors disabled:opacity-50"
            >
              {downloadingId === adj.id ? 'Abriendo...' : 'Descargar'}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(adj)}
              disabled={deletingId === adj.id}
              className="text-brand-gray hover:text-accent text-xs transition-colors disabled:opacity-50"
            >
              {deletingId === adj.id ? '...' : 'Eliminar'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
