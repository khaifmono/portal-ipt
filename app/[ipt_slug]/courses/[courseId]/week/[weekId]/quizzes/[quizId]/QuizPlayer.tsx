'use client'

import { useState, useCallback } from 'react'
import QuizTimer from './QuizTimer'

interface ClientQuestion {
  id: string
  quiz_id: string
  ipt_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: string[] | null
  marks: number
  order_index: number
}

interface QuizPlayerProps {
  quizId: string
  quizTitle: string
  attemptId: string
  questions: ClientQuestion[]
  timerSeconds: number | null
  iptSlug: string
  courseId: string
  weekId: string
}

export default function QuizPlayer({
  quizTitle,
  attemptId,
  questions,
  timerSeconds,
  iptSlug,
  courseId,
  weekId,
  quizId,
}: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number | null; status: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `/${iptSlug}/courses/${courseId}/week/${weekId}/quizzes/${quizId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, answers }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ralat tidak dijangka')
        return
      }
      setResult({ score: data.score, status: data.status })
    } catch {
      setError('Ralat rangkaian semasa menghantar')
    } finally {
      setSubmitting(false)
    }
  }, [iptSlug, courseId, weekId, quizId, attemptId, answers])

  const handleTimerExpire = useCallback(() => {
    if (!result && !submitting) {
      handleSubmit()
    }
  }, [result, submitting, handleSubmit])

  if (result) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">
          {result.score !== null ? (result.score > 0 ? '🎉' : '📋') : '📋'}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Kuiz Dihantar!</h2>
        {result.score !== null ? (
          <p className="text-gray-700">
            Markah anda:{' '}
            <span className="font-bold text-blue-600 text-xl">{result.score}</span>
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Markah anda sedang dinilai oleh pengajar. Sila semak semula nanti.
          </p>
        )}
        <a
          href={`/${iptSlug}/courses/${courseId}/week/${weekId}`}
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Kembali ke Minggu
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{quizTitle}</h2>
        {timerSeconds && timerSeconds > 0 && (
          <QuizTimer totalSeconds={timerSeconds} onExpire={handleTimerExpire} />
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {questions.map((q, index) => (
        <div key={q.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Soalan {index + 1} — {q.marks} markah
          </p>
          <p className="text-gray-900 font-medium mb-4">{q.question_text}</p>

          {q.question_type === 'multiple_choice' && q.options && (
            <div className="space-y-2">
              {q.options.filter(Boolean).map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.question_type === 'true_false' && (
            <div className="space-y-2">
              {['true', 'false'].map((val) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={val}
                    checked={answers[q.id] === val}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{val === 'true' ? 'Benar' : 'Salah'}</span>
                </label>
              ))}
            </div>
          )}

          {q.question_type === 'short_answer' && (
            <textarea
              rows={3}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tulis jawapan anda di sini..."
            />
          )}
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {submitting ? 'Menghantar...' : 'Hantar Kuiz'}
        </button>
      </div>
    </div>
  )
}
