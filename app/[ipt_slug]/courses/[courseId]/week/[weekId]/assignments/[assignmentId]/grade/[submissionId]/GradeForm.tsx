'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  iptSlug: string
  courseId: string
  weekId: string
  assignmentId: string
  submissionId: string
  maxScore: number
  currentGrade: number | null
  currentFeedback: string | null
}

export default function GradeForm({
  iptSlug,
  courseId,
  weekId,
  assignmentId,
  submissionId,
  maxScore,
  currentGrade,
  currentFeedback,
}: Props) {
  const router = useRouter()
  const [grade, setGrade] = useState<string>(currentGrade !== null ? String(currentGrade) : '')
  const [feedback, setFeedback] = useState<string>(currentFeedback ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const gradeNum = Number(grade)
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      setError('Markah mesti antara 0 dan 100')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(
        `/${iptSlug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}/grade/api`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, grade: gradeNum, feedback }),
        }
      )

      if (res.ok) {
        router.push(
          `/${iptSlug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}`
        )
        router.refresh()
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Ralat berlaku semasa menilai')
      }
    } catch {
      setError('Ralat rangkaian. Sila cuba semula.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
          Markah (0 – {maxScore}) <span className="text-red-500">*</span>
        </label>
        <input
          id="grade"
          type="number"
          min={0}
          max={maxScore}
          required
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="cth. 85"
        />
        <p className="mt-1 text-xs text-gray-400">
          Markah yang disimpan dalam sistem adalah berdasarkan skala 0–100.
        </p>
      </div>

      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
          Maklum Balas
        </label>
        <textarea
          id="feedback"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Maklum balas kepada pelajar..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Markah'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
