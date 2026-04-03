'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GenerateQrButton({
  iptSlug,
  courseId,
  sessionId,
  hasExisting,
}: {
  iptSlug: string
  courseId: string
  sessionId: string
  hasExisting: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch(
        `/${iptSlug}/courses/${courseId}/attendance/${sessionId}/qr/generate`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ralat menjana kod QR.')
        return
      }
      router.refresh()
    } catch {
      alert('Ralat rangkaian.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Menjana...
        </>
      ) : hasExisting ? (
        'Jana Semula Kod QR'
      ) : (
        'Jana Kod QR'
      )}
    </button>
  )
}
