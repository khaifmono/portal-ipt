import { getIptBySlug } from '@/lib/ipt'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (user) redirect(`/${ipt_slug}/dashboard`)

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Log Masuk</h1>
          <p className="text-sm text-gray-500 mb-6">{ipt.name}</p>
          <LoginForm iptSlug={ipt_slug} />
        </div>
      </div>
    </main>
  )
}
