'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const newSessionSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  session_date: z.string().min(1, 'Tarikh diperlukan'),
})

type NewSessionInput = z.infer<typeof newSessionSchema>

interface NewSessionFormProps {
  courseId: string
  iptId: string
  iptSlug: string
  createdBy: string
}

export function NewSessionForm({ courseId, iptId, iptSlug, createdBy }: NewSessionFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewSessionInput>({
    resolver: zodResolver(newSessionSchema),
  })

  async function onSubmit(values: NewSessionInput) {
    const res = await fetch(`/${iptSlug}/courses/${courseId}/attendance/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        iptId,
        sessionDate: values.session_date,
        title: values.title,
        createdBy,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa mencipta sesi.' })
      return
    }

    router.push(`/${iptSlug}/courses/${courseId}/attendance`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Tajuk Sesi
        </label>
        <input
          id="title"
          type="text"
          placeholder="cth. Sesi Kehadiran Minggu 1"
          {...register('title')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="session_date" className="block text-sm font-medium text-gray-700 mb-1">
          Tarikh Sesi
        </label>
        <input
          id="session_date"
          type="date"
          {...register('session_date')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.session_date && (
          <p className="mt-1 text-xs text-red-600">{errors.session_date.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {errors.root.message}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Mencipta...' : 'Tambah Sesi'}
        </button>
      </div>
    </form>
  )
}
