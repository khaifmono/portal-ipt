'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AttendanceMarkerProps {
  sessionId: string
  userId: string
  iptId: string
  iptSlug: string
  courseId: string
  currentStatus: 'present' | 'absent' | null
}

export function AttendanceMarker({
  sessionId,
  userId,
  iptId,
  iptSlug,
  courseId,
  currentStatus,
}: AttendanceMarkerProps) {
  const [status, setStatus] = useState<'present' | 'absent' | null>(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function mark(newStatus: 'present' | 'absent') {
    if (loading) return
    setLoading(true)
    const res = await fetch(
      `/${iptSlug}/courses/${courseId}/attendance/${sessionId}/mark`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, iptId, status: newStatus }),
      }
    )
    setLoading(false)
    if (res.ok) {
      setStatus(newStatus)
      router.refresh()
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => mark('present')}
        disabled={loading}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          status === 'present'
            ? 'bg-green-600 text-white'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        Hadir
      </button>
      <button
        onClick={() => mark('absent')}
        disabled={loading}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          status === 'absent'
            ? 'bg-red-600 text-white'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
      >
        Tidak Hadir
      </button>
    </div>
  )
}
