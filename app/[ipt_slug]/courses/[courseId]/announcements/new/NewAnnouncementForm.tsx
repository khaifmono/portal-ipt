'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const newAnnouncementSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  content: z.string().min(1, 'Kandungan diperlukan'),
  isPinned: z.boolean(),
})

type NewAnnouncementInput = z.infer<typeof newAnnouncementSchema>

interface NewAnnouncementFormProps {
  iptSlug: string
  courseId: string
}

export function NewAnnouncementForm({ iptSlug, courseId }: NewAnnouncementFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewAnnouncementInput>({
    resolver: zodResolver(newAnnouncementSchema),
    defaultValues: { isPinned: false },
  })

  async function onSubmit(values: NewAnnouncementInput) {
    const res = await fetch(`/${iptSlug}/courses/${courseId}/announcements/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: values.title,
        content: values.content,
        isPinned: values.isPinned,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa mencipta pengumuman.' })
      return
    }

    router.push(`/${iptSlug}/courses/${courseId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Tajuk" error={errors.title?.message}>
        <input
          type="text"
          placeholder="cth. Perubahan Jadual Latihan"
          {...register('title')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Kandungan" error={errors.content?.message}>
        <textarea
          placeholder="Tulis kandungan pengumuman di sini..."
          rows={5}
          {...register('content')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          {...register('isPinned')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
          Sematkan (Pin to top)
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
        {isSubmitting ? 'Mencipta...' : 'Cipta Pengumuman'}
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
