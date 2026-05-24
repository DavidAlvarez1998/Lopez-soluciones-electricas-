export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-5xl animate-pulse text-blue-glow">⚡</div>
      <p className="text-brand-gray text-sm uppercase tracking-widest">Cargando...</p>
    </div>
  )
}
