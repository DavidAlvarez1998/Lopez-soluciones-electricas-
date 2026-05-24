'use client';

import { useState, useRef, useCallback } from 'react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface UploadedFile {
  id: string;
  nombre_archivo: string;
  mime: string;
  tamano_bytes: number;
  storage_path: string;
}

interface FileUploadProps {
  entidad: 'cotizacion' | 'cuenta_cobro';
  entidadId: string;
  onUpload: () => void;
}

export default function FileUpload({ entidad, entidadId, onUpload }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError('');

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Solo se aceptan PDF, JPG y PNG.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError('El archivo no puede superar 10 MB.');
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || !supabaseKey) {
        setError('Supabase no está configurado. Los archivos no se pueden subir aún.');
        return;
      }

      setUploading(true);
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const uuid = crypto.randomUUID();
        const path = `${entidad}/${entidadId}/${uuid}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('adjuntos')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        // Commit to adjuntos table
        const { data: adjunto, error: insertError } = await supabase
          .from('adjuntos')
          .insert({
            entidad_tipo: entidad,
            entidad_id: entidadId,
            storage_path: path,
            nombre_archivo: file.name,
            mime: file.type,
            tamano_bytes: file.size,
          })
          .select('id, nombre_archivo, mime, tamano_bytes, storage_path')
          .single();

        if (insertError) throw insertError;

        setFiles((prev) => [...prev, adjunto as UploadedFile]);
        onUpload();
      } catch (err) {
        console.error('FileUpload error:', err);
        setError('Error al subir el archivo. Intenta de nuevo.');
      } finally {
        setUploading(false);
      }
    },
    [entidad, entidadId, onUpload]
  );

  const handleDelete = async (file: UploadedFile) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.storage.from('adjuntos').remove([file.storage_path]);
      await supabase.from('adjuntos').delete().eq('id', file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      onUpload();
    } catch (err) {
      console.error('FileUpload delete error:', err);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data } = await supabase.storage
        .from('adjuntos')
        .createSignedUrl(file.storage_path, 300);

      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('FileUpload download error:', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-blue-glow bg-blue-glow/10'
            : 'border-white/20 hover:border-blue-glow/50 hover:bg-white/[0.02]'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        {uploading ? (
          <div className="text-brand-gray text-sm">Subiendo...</div>
        ) : (
          <>
            <div className="text-3xl mb-2">📎</div>
            <p className="text-brand-gray text-sm">
              Arrastrá un archivo aquí o{' '}
              <span className="text-blue-glow underline cursor-pointer">hacé click para seleccionar</span>
            </p>
            <p className="text-brand-gray text-xs mt-1">PDF, JPG, PNG · máx. 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="text-accent text-sm bg-accent/10 border border-accent/30 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{file.mime === 'application/pdf' ? '📄' : '🖼️'}</span>
                <div className="min-w-0">
                  <p className="text-off-white text-sm truncate">{file.nombre_archivo}</p>
                  <p className="text-brand-gray text-xs">{formatSize(file.tamano_bytes)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  className="text-blue-glow hover:text-blue-bright text-xs transition-colors"
                >
                  Descargar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(file)}
                  className="text-brand-gray hover:text-accent text-xs transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
