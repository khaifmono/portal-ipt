'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useRef, useState } from 'react'

const formSchema = z.object({
  title: z.string().min(1, 'Tajuk bahan diperlukan'),
  description: z.string().optional(),
  type: z.enum(['file', 'link', 'youtube', 'google_drive']),
  url: z.string().url('URL tidak sah').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  iptSlug: string
  courseId: string
  weekId: string
}

const ACCEPTED_FILE_TYPES =
  '.pdf,.pptx,.ppt,.docx,.doc,.png,.jpg,.jpeg,.gif,.zip'

export default function NewMaterialForm({ iptSlug, courseId, weekId }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: 'file' },
  })

  const selectedType = watch('type')
  const isFileType = selectedType === 'file'

  async function onSubmit(values: FormValues) {
    setServerError(null)

    const apiUrl = `/${iptSlug}/courses/${courseId}/week/${weekId}/materials/api`

    if (isFileType) {
      const file = fileRef.current?.files?.[0]
      if (!file) {
        setServerError('Sila pilih fail untuk dimuat naik.')
        return
      }

      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('type', 'file')
      if (values.description) formData.append('description', values.description)
      formData.append('file', file)

      const res = await fetch(apiUrl, { method: 'POST', body: formData })

      if (res.ok) {
        router.push(`/${iptSlug}/courses/${courseId}/week/${weekId}`)
        router.refresh()
      } else {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Ralat berlaku semasa muat naik fail.')
      }
    } else {
      if (!values.url) {
        setServerError('Sila masukkan URL.')
        return
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          type: values.type,
          url: values.url,
        }),
      })

      if (res.ok) {
        router.push(`/${iptSlug}/courses/${courseId}/week/${weekId}`)
        router.refresh()
      } else {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? 'Ralat berlaku.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Tajuk Bahan <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="cth. Nota Kuliah Minggu 1"
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
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Penerangan ringkas tentang bahan ini..."
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Bahan <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          {...register('type')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="file">Fail</option>
          <option value="link">Pautan</option>
          <option value="youtube">YouTube</option>
          <option value="google_drive">Google Drive</option>
        </select>
      </div>

      {/* File input (shown when type = file) */}
      {isFileType && (
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Fail <span className="text-red-500">*</span>
          </label>
          <input
            id="file"
            type="file"
            ref={fileRef}
            accept={ACCEPTED_FILE_TYPES}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-400">
            Format yang diterima: PDF, PPTX, DOCX, imej (PNG, JPG, GIF), ZIP
          </p>
        </div>
      )}

      {/* URL input (shown when type != file) */}
      {!isFileType && (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            id="url"
            type="url"
            {...register('url')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              selectedType === 'youtube'
                ? 'https://www.youtube.com/watch?v=...'
                : selectedType === 'google_drive'
                ? 'https://drive.google.com/file/d/...'
                : 'https://example.com/resource'
            }
          />
          {errors.url && (
            <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Bahan'}
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
