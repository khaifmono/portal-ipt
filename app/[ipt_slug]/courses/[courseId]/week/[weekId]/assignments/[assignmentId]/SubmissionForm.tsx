'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  iptSlug: string
  courseId: string
  weekId: string
  assignmentId: string
  assignmentType: 'file_upload' | 'text'
  isUpdate?: boolean
  existingText?: string
}

export default function SubmissionForm({
  iptSlug,
  courseId,
  weekId,
  assignmentId,
  assignmentType,
  isUpdate = false,
  existingText,
}: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      if (assignmentType === 'text') {
        const text = textRef.current?.value?.trim()
        if (!text) {
          setError('Sila masukkan jawapan teks anda')
          setSubmitting(false)
          return
        }
        formData.append('contentText', text)
      } else {
        const file = fileRef.current?.files?.[0]
        if (!file) {
          setError('Sila pilih fail untuk dimuat naik')
          setSubmitting(false)
          return
        }
        formData.append('file', file)
      }

      const res = await fetch(
        `/${iptSlug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}/submit`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (res.redirected) {
        router.push(res.url)
        router.refresh()
        return
      }

      if (res.ok) {
        router.refresh()
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Ralat berlaku semasa menghantar tugasan')
      }
    } catch {
      setError('Ralat rangkaian. Sila cuba semula.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {assignmentType === 'text' ? (
        <div>
          <label htmlFor="contentText" className="block text-sm font-medium text-gray-700 mb-1">
            Jawapan Anda <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contentText"
            ref={textRef}
            rows={6}
            required
            defaultValue={existingText ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Taip jawapan anda di sini..."
          />
        </div>
      ) : (
        <div>
          <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-1">
            Fail Tugasan <span className="text-red-500">*</span>
          </label>
          <input
            id="fileUpload"
            type="file"
            ref={fileRef}
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            required
            className="w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-400">Fail yang diterima: PDF, DOCX, JPG, PNG</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting
          ? (isUpdate ? 'Mengemaskini...' : 'Menghantar...')
          : (isUpdate ? 'Kemas Kini Penyerahan' : 'Hantar Tugasan')}
      </button>
    </form>
  )
}
