'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const schema = z.object({
  name: z.string().min(1, 'Nama IPT diperlukan'),
  slug: z.string().min(1, 'Slug diperlukan').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh mengandungi huruf kecil, nombor dan tanda sempang'),
})

type FormInput = z.infer<typeof schema>

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function NewIptForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '' },
  })

  const nameValue = watch('name')
  useEffect(() => {
    if (nameValue) setValue('slug', slugify(nameValue), { shouldValidate: false })
  }, [nameValue, setValue])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: FormInput) {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('slug', values.slug)
    if (logoFile) formData.append('logo', logoFile)

    const res = await fetch('/admin/api/ipts', { method: 'POST', body: formData })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa mencipta IPT.' })
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo IPT</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {logoPreview ? 'Tukar logo' : 'Muat naik logo'}
            </button>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG. Maks 2MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama IPT</label>
        <input
          type="text"
          {...register('name')}
          placeholder="cth. PSSCM Universiti Putra Malaysia"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400 font-mono">portalipt.khaif.dev/</span>
          <input
            type="text"
            {...register('slug')}
            placeholder="cth. upm"
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
        {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Mencipta...' : 'Cipta IPT'}
        </button>
      </div>
    </form>
  )
}
