'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import type { Course } from '@/lib/types'

const newScheduleSchema = z
  .object({
    title: z.string().min(1, 'Tajuk diperlukan'),
    courseId: z.string().min(1, 'Kursus diperlukan'),
    start_time: z.string().min(1, 'Masa mula diperlukan'),
    end_time: z.string().min(1, 'Masa tamat diperlukan'),
    location: z.string().optional(),
    recurring: z.boolean(),
  })
  .refine((data) => new Date(data.start_time) < new Date(data.end_time), {
    message: 'Masa mula mesti sebelum masa tamat',
    path: ['end_time'],
  })

type NewScheduleInput = z.infer<typeof newScheduleSchema>

interface NewScheduleFormProps {
  iptId: string
  iptSlug: string
  createdBy: string
  courses: Course[]
}

export function NewScheduleForm({ iptId, iptSlug, createdBy, courses }: NewScheduleFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewScheduleInput>({
    resolver: zodResolver(newScheduleSchema),
    defaultValues: { recurring: false },
  })

  async function onSubmit(values: NewScheduleInput) {
    const res = await fetch(`/${iptSlug}/admin/schedule/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: values.courseId,
        iptId,
        title: values.title,
        startTime: values.start_time,
        endTime: values.end_time,
        location: values.location || null,
        recurring: values.recurring,
        createdBy,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa mencipta jadual.' })
      return
    }

    router.push(`/${iptSlug}/admin/schedule`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Tajuk" error={errors.title?.message}>
        <input
          type="text"
          placeholder="cth. Latihan Silat Mingguan"
          {...register('title')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Kursus" error={errors.courseId?.message}>
        <select
          {...register('courseId')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Kursus --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Masa Mula" error={errors.start_time?.message}>
        <input
          type="datetime-local"
          {...register('start_time')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Masa Tamat" error={errors.end_time?.message}>
        <input
          type="datetime-local"
          {...register('end_time')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Lokasi (pilihan)" error={errors.location?.message}>
        <input
          type="text"
          placeholder="cth. Dewan Utama"
          {...register('location')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recurring"
          {...register('recurring')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
          Berulang (Recurring)
        </label>
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Mencipta...' : 'Cipta Jadual'}
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
