'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const replySchema = z.object({
  content: z.string().min(1, 'Kandungan balasan diperlukan'),
})

type ReplyInput = z.infer<typeof replySchema>

interface ReplyFormProps {
  iptSlug: string
  courseId: string
  threadId: string
}

export function ReplyForm({ iptSlug, courseId, threadId }: ReplyFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReplyInput>({
    resolver: zodResolver(replySchema),
  })

  async function onSubmit(values: ReplyInput) {
    const res = await fetch(
      `/${iptSlug}/courses/${courseId}/forum/${threadId}/reply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: values.content }),
      }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa menghantar balasan.' })
      return
    }

    reset()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <textarea
          placeholder="Tulis balasan anda di sini..."
          rows={4}
          {...register('content')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Menghantar...' : 'Hantar Balasan'}
        </button>
      </div>
    </form>
  )
}
