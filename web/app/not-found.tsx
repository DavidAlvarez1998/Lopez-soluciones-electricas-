import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="text-8xl font-black font-barlow-condensed text-blue-glow">404</div>
      <h1 className="text-2xl font-bold text-off-white font-barlow-condensed uppercase">
        Página no encontrada
      </h1>
      <p className="text-brand-gray max-w-sm">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/"
        className="bg-blue-bright hover:bg-blue-glow text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
