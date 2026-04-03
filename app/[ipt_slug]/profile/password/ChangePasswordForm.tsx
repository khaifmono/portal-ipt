'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Kata laluan semasa diperlukan'),
    newPassword: z
      .string()
      .min(6, 'Kata laluan baru mesti sekurang-kurangnya 6 aksara'),
    confirmPassword: z.string().min(1, 'Sila sahkan kata laluan baru'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Kata laluan baru tidak sepadan',
    path: ['confirmPassword'],
  })

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

interface ChangePasswordFormProps {
  iptSlug: string
}

export function ChangePasswordForm({ iptSlug }: ChangePasswordFormProps) {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(values: ChangePasswordInput) {
    setSuccess(false)

    const res = await fetch(`/${iptSlug}/profile/password/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError('root', {
        message: body.error ?? 'Ralat semasa menukar kata laluan.',
      })
      return
    }

    setSuccess(true)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Kata laluan berjaya ditukar.
        </div>
      )}

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          {errors.root.message}
        </p>
      )}

      <Field label="Kata Laluan Semasa" error={errors.currentPassword?.message}>
        <input
          type="password"
          {...register('currentPassword')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Kata Laluan Baru" error={errors.newPassword?.message}>
        <input
          type="password"
          {...register('newPassword')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Sahkan Kata Laluan Baru" error={errors.confirmPassword?.message}>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Menukar...' : 'Tukar Kata Laluan'}
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
