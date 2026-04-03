'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DuplicateCourseButton({
  iptSlug,
  courseId,
  courseTitle,
}: {
  iptSlug: string
  courseId: string
  courseTitle: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDuplicate() {
    const title = window.prompt(
      'Masukkan tajuk kursus baharu:',
      `Salinan: ${courseTitle}`
    )
    if (title === null) return // cancelled

    setLoading(true)
    try {
      const res = await fetch(`/${iptSlug}/admin/courses/${courseId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal menyalin kursus.')
        return
      }

      router.refresh()
    } catch {
      alert('Ralat rangkaian. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
      </svg>
      {loading ? 'Menyalin...' : 'Salin'}
    </button>
  )
}
