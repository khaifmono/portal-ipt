'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  title: z.string().min(1, 'Tajuk tugasan diperlukan'),
  description: z.string().optional(),
  type: z.enum(['file_upload', 'text']),
  due_date: z.string().optional(),
  max_score: z.number().int().min(1).max(1000).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  iptSlug: string
  courseId: string
  weekId: string
}

export default function NewAssignmentForm({ iptSlug, courseId, weekId }: Props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: 'text', max_score: 100 },
  })

  async function onSubmit(values: FormValues) {
    const body: Record<string, unknown> = {
      title: values.title,
      type: values.type,
      maxScore: values.max_score,
    }
    if (values.description) body.description = values.description
    if (values.due_date) body.dueDate = new Date(values.due_date).toISOString()

    const res = await fetch(
      `/${iptSlug}/courses/${courseId}/week/${weekId}/assignments/api`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (res.ok) {
      router.push(`/${iptSlug}/courses/${courseId}/week/${weekId}`)
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      alert(json.error ? JSON.stringify(json.error) : 'Ralat berlaku')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Tajuk Tugasan <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="cth. Tugasan Minggu 1"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Penerangan
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Arahan tugasan..."
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Penyerahan <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          {...register('type')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="text">Jawapan Teks</option>
          <option value="file_upload">Muat Naik Fail</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Due date */}
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
          Tarikh Akhir
        </label>
        <input
          id="due_date"
          type="datetime-local"
          {...register('due_date')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Max score */}
      <div>
        <label htmlFor="max_score" className="block text-sm font-medium text-gray-700 mb-1">
          Markah Penuh
        </label>
        <input
          id="max_score"
          type="number"
          min={1}
          max={1000}
          {...register('max_score', { valueAsNumber: true })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.max_score && (
          <p className="mt-1 text-xs text-red-600">{errors.max_score.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : 'Cipta Tugasan'}
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
