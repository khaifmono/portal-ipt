import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChangePasswordForm } from './ChangePasswordForm'

export default async function ChangePasswordPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href={`/${ipt_slug}/profile`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Profil
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Tukar Kata Laluan</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan kata laluan semasa dan kata laluan baru anda.
        </p>

        <ChangePasswordForm iptSlug={ipt_slug} />
      </div>
    </div>
  )
}
