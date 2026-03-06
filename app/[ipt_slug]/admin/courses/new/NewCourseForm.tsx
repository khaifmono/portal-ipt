'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const newCourseSchema = z.object({
  title: z.string().min(1, 'Tajuk kursus diperlukan'),
  description: z.string().optional(),
})

type NewCourseInput = z.infer<typeof newCourseSchema>

interface NewCourseFormProps {
  iptId: string
  iptSlug: string
  userId: string
}

export function NewCourseForm({ iptId, iptSlug, userId }: NewCourseFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewCourseInput>({
    resolver: zodResolver(newCourseSchema),
  })

  async function onSubmit(values: NewCourseInput) {
    const res = await fetch(`/${iptSlug}/admin/courses/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, iptId, userId }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa mencipta kursus.' })
      return
    }

    router.push(`/${iptSlug}/admin/courses`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk Kursus</label>
        <input
          type="text"
          {...register('title')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Penerangan (pilihan)</label>
        <textarea
          rows={3}
          {...register('description')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Mencipta...' : 'Cipta Kursus'}
      </button>
    </form>
  )
}
