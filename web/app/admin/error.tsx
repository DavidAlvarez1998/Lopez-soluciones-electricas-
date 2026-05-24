'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-bold text-off-white font-barlow-condensed uppercase">
        Algo salió mal
      </h2>
      <p className="text-brand-gray text-sm max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="mt-2 bg-blue-bright hover:bg-blue-glow text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        Reintentar
      </button>
    </div>
  )
}
