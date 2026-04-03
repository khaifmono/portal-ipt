'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ToggleIptButton({ iptId, isActive }: { iptId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch('/admin/api/ipts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iptId, is_active: !isActive }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert(body.error ?? 'Ralat semasa mengemas kini status.')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-600 hover:bg-green-100'
      }`}
    >
      {loading ? 'Memproses...' : isActive ? 'Nyahaktif' : 'Aktifkan'}
    </button>
  )
}
