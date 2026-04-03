'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

const schema = z.object({
  ic_number: z.string().min(1, 'Nombor IC diperlukan').regex(/^\d{12}$/, 'Nombor IC mesti 12 digit'),
  password: z.string().min(6, 'Kata laluan mesti sekurang-kurangnya 6 aksara'),
  ipt_slug: z.string().min(1, 'IPT slug diperlukan'),
})

type FormInput = z.infer<typeof schema>

export function AdminLoginForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormInput) {
    const result = await signIn('credentials', {
      ic_number: values.ic_number,
      password: values.password,
      ipt_slug: values.ipt_slug,
      redirect: false,
    })

    if (result?.error) {
      setError('root', { message: 'Nombor IC, kata laluan, atau IPT tidak sah.' })
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="ipt_slug" className="block text-sm font-medium text-blue-200 mb-1">
          IPT Slug
        </label>
        <input
          id="ipt_slug"
          type="text"
          placeholder="cth: upm"
          {...register('ipt_slug')}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15"
        />
        {errors.ipt_slug && <p className="mt-1 text-xs text-red-400">{errors.ipt_slug.message}</p>}
      </div>

      <div>
        <label htmlFor="ic_number" className="block text-sm font-medium text-blue-200 mb-1">
          Nombor IC
        </label>
        <input
          id="ic_number"
          type="text"
          inputMode="numeric"
          placeholder="cth: 990101145678"
          {...register('ic_number')}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15"
        />
        {errors.ic_number && <p className="mt-1 text-xs text-red-400">{errors.ic_number.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-1">
          Kata Laluan
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15"
        />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
      </div>

      {errors.root && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
      >
        {isSubmitting ? 'Log masuk...' : 'Log Masuk'}
      </button>
    </form>
  )
}
