'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const newUserSchema = z.object({
  ic_number: z
    .string()
    .min(1, 'Nombor IC diperlukan')
    .regex(/^\d{12}$/, 'Nombor IC mesti 12 digit tanpa sempang'),
  nama: z.string().min(1, 'Nama diperlukan'),
  kelas_latihan: z.string().optional(),
  role: z.enum(['ahli', 'tenaga_pengajar', 'admin']),
  password: z.string().min(6, 'Kata laluan mesti sekurang-kurangnya 6 aksara'),
})

type NewUserInput = z.infer<typeof newUserSchema>

interface NewUserFormProps {
  iptId: string
  iptSlug: string
}

export function NewUserForm({ iptId, iptSlug }: NewUserFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewUserInput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { role: 'ahli' },
  })

  async function onSubmit(values: NewUserInput) {
    const res = await fetch(`/${iptSlug}/admin/users/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, iptId, iptSlug }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', { message: body.error ?? 'Ralat semasa mencipta pengguna.' })
      return
    }

    router.push(`/${iptSlug}/admin/users`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Nombor IC" error={errors.ic_number?.message}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="990101145678"
          {...register('ic_number')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Nama Penuh" error={errors.nama?.message}>
        <input
          type="text"
          {...register('nama')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Kelas Latihan" error={errors.kelas_latihan?.message}>
        <input
          type="text"
          {...register('kelas_latihan')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Peranan" error={errors.role?.message}>
        <select
          {...register('role')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ahli">Ahli</option>
          <option value="tenaga_pengajar">Tenaga Pengajar</option>
          <option value="admin">Admin</option>
        </select>
      </Field>

      <Field label="Kata Laluan Sementara" error={errors.password?.message}>
        <input
          type="password"
          {...register('password')}
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
        {isSubmitting ? 'Mencipta...' : 'Cipta Pengguna'}
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
