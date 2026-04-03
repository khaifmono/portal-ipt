'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MarkAllReadButton({ iptSlug }: { iptSlug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await fetch(`/${iptSlug}/notifications/api`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Memproses...' : 'Tandakan Semua Dibaca'}
    </button>
  )
}
