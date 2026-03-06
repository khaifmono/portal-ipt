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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Tajuk Sesi" error={errors.title?.message}>
        <input
          type="text"
          placeholder="cth. Sesi Kehadiran Minggu 1"
          {...register('title')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Tarikh Sesi" error={errors.session_date?.message}>
        <input
          type="date"
          {...register('session_date')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Mencipta...' : 'Cipta Sesi'}
      </button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
