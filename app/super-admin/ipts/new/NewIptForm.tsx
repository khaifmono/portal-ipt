'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const newIptSchema = z.object({
  name: z.string().min(1, 'Nama IPT diperlukan'),
  slug: z
    .string()
    .min(1, 'Slug diperlukan')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug hanya boleh mengandungi huruf kecil, nombor dan tanda sempang'
    ),
  logo_url: z.string().url('URL logo tidak sah').optional().or(z.literal('')),
})

type NewIptInput = z.infer<typeof newIptSchema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function NewIptForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewIptInput>({
    resolver: zodResolver(newIptSchema),
    defaultValues: {
      name: '',
      slug: '',
      logo_url: '',
    },
  })

  // Auto-generate slug from name
  const nameValue = watch('name')
  useEffect(() => {
    if (nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: false })
    }
  }, [nameValue, setValue])

  async function onSubmit(values: NewIptInput) {
    const res = await fetch('/super-admin/api/ipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        slug: values.slug,
        logo_url: values.logo_url || null,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', {
        message: body.error ?? 'Ralat semasa mencipta IPT.',
      })
      return
    }

    router.push('/super-admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama IPT
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="cth. Universiti Putra Malaysia"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug (URL)
        </label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400">/</span>
          <input
            type="text"
            {...register('slug')}
            placeholder="cth. upm"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
        {errors.slug && (
          <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Ini akan menjadi URL portal: portalipt.silatcekak.org.my/
          {watch('slug') || 'slug'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Logo (pilihan)
        </label>
        <input
          type="url"
          {...register('logo_url')}
          placeholder="cth. /logos/upm.png"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        {errors.logo_url && (
          <p className="mt-1 text-xs text-red-600">
            {errors.logo_url.message}
          </p>
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
          onClick={() => router.push('/super-admin')}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Mencipta...' : 'Cipta IPT'}
        </button>
      </div>
    </form>
  )
}
