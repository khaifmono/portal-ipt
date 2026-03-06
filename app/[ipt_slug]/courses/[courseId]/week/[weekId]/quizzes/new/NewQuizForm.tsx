'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const questionSchema = z.object({
  question_text: z.string().min(1, 'Teks soalan diperlukan'),
  question_type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
  marks: z.coerce.number().int().min(1, 'Markah mesti sekurang-kurangnya 1').default(1),
})

const formSchema = z.object({
  title: z.string().min(1, 'Tajuk kuiz diperlukan'),
  description: z.string().optional(),
  timer_minutes: z.coerce
    .number()
    .int('Timer mesti integer')
    .positive('Timer mesti positif')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  randomize_questions: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, 'Sekurang-kurangnya satu soalan diperlukan'),
})

type FormValues = z.infer<typeof formSchema>

interface NewQuizFormProps {
  iptSlug: string
  courseId: string
  weekId: string
}

export default function NewQuizForm({ iptSlug, courseId, weekId }: NewQuizFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      randomize_questions: false,
      questions: [
        {
          question_text: '',
          question_type: 'multiple_choice',
          options: ['', ''],
          correct_answer: '',
          marks: 1,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const watchedQuestions = watch('questions')

  const goToStep2 = async () => {
    const valid = await trigger(['title'])
    if (valid) setStep(2)
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch(
        `/${iptSlug}/courses/${courseId}/week/${weekId}/quizzes/api`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title,
            description: values.description || undefined,
            timerMinutes: values.timer_minutes || undefined,
            randomizeQuestions: values.randomize_questions,
            questions: values.questions.map((q) => ({
              question_text: q.question_text,
              question_type: q.question_type,
              options:
                q.question_type === 'multiple_choice'
                  ? (q.options ?? []).filter(Boolean)
                  : undefined,
              correct_answer: q.correct_answer || undefined,
              marks: q.marks,
            })),
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        setServerError(data.error ?? 'Ralat tidak dijangka')
        return
      }

      router.push(`/${iptSlug}/courses/${courseId}/week/${weekId}`)
      router.refresh()
    } catch {
      setServerError('Ralat rangkaian')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 1: Quiz Metadata                                               */}
      {/* ------------------------------------------------------------------ */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Langkah 1: Maklumat Kuiz</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tajuk Kuiz <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cth. Kuiz Minggu 1"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penerangan</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Penerangan kuiz (pilihan)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa (minit)
            </label>
            <input
              {...register('timer_minutes')}
              type="number"
              min={1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cth. 30 (kosongkan jika tiada had masa)"
            />
            {errors.timer_minutes && (
              <p className="mt-1 text-xs text-red-600">{errors.timer_minutes.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              {...register('randomize_questions')}
              type="checkbox"
              id="randomize_questions"
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="randomize_questions" className="text-sm text-gray-700">
              Rawak susunan soalan
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={goToStep2}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Seterusnya →
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 2: Add Questions                                               */}
      {/* ------------------------------------------------------------------ */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Langkah 2: Tambah Soalan</h2>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Kembali
            </button>
          </div>

          {errors.questions?.root && (
            <p className="text-xs text-red-600">{errors.questions.root.message}</p>
          )}

          {fields.map((field, index) => {
            const qType = watchedQuestions?.[index]?.question_type
            return (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Soalan {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Padam
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Teks Soalan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register(`questions.${index}.question_text`)}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tulis soalan di sini..."
                  />
                  {errors.questions?.[index]?.question_text && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.questions[index]?.question_text?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jenis Soalan
                    </label>
                    <select
                      {...register(`questions.${index}.question_type`)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="multiple_choice">Pilihan Berganda</option>
                      <option value="true_false">Benar / Salah</option>
                      <option value="short_answer">Jawapan Ringkas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Markah
                    </label>
                    <input
                      {...register(`questions.${index}.marks`)}
                      type="number"
                      min={1}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Options — shown for multiple_choice only */}
                {qType === 'multiple_choice' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Pilihan Jawapan (sekurang-kurangnya 2)
                    </label>
                    {[0, 1, 2, 3].map((optIdx) => (
                      <input
                        key={optIdx}
                        {...register(`questions.${index}.options.${optIdx}`)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder={`Pilihan ${optIdx + 1}${optIdx < 2 ? ' *' : ' (pilihan)'}`}
                      />
                    ))}
                  </div>
                )}

                {/* Correct Answer — not shown for short_answer */}
                {qType !== 'short_answer' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jawapan Betul
                    </label>
                    {qType === 'true_false' ? (
                      <select
                        {...register(`questions.${index}.correct_answer`)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih --</option>
                        <option value="true">Benar</option>
                        <option value="false">Salah</option>
                      </select>
                    ) : (
                      <input
                        {...register(`questions.${index}.correct_answer`)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan jawapan betul"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() =>
              append({
                question_text: '',
                question_type: 'multiple_choice',
                options: ['', ''],
                correct_answer: '',
                marks: 1,
              })
            }
            className="w-full rounded-md border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Tambah Soalan
          </button>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Kuiz'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
