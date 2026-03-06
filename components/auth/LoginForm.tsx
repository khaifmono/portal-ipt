'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  iptSlug: string
}

function toAuthEmail(icNumber: string, iptSlug: string): string {
  return `${icNumber}@${iptSlug}.psscm`
}

export function LoginForm({ iptSlug }: LoginFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginInput) {
    const supabase = createClient()
    const email = toAuthEmail(values.ic_number, iptSlug)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    })

    if (error) {
      setError('root', { message: 'Nombor IC atau kata laluan tidak sah.' })
      return
    }

    router.push(`/${iptSlug}/dashboard`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="ic_number" className="block text-sm font-medium text-gray-700 mb-1">
          Nombor IC
        </label>
        <input
          id="ic_number"
          type="text"
          inputMode="numeric"
          placeholder="contoh: 990101145678"
          {...register('ic_number')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.ic_number && (
          <p className="mt-1 text-xs text-red-600">{errors.ic_number.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Kata Laluan
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Log masuk...' : 'Log Masuk'}
      </button>
    </form>
  )
}
