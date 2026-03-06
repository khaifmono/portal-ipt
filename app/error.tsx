'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ralat Pelayan</h1>
        <p className="text-gray-600 mb-6 text-sm">
          {error.message || 'Berlaku ralat semasa memuatkan halaman ini.'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Cuba Semula
        </button>
      </div>
    </main>
  )
}
