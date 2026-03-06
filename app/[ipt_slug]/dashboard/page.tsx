import { getIptBySlug } from '@/lib/ipt'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">{ipt.name}</p>
          </div>
          <form action={`/${ipt_slug}/auth/signout`} method="post">
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log Keluar
            </button>
          </form>
        </div>

        <p className="text-gray-700 mb-6">
          Selamat datang, <strong>{profile?.nama ?? user.email}</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/${ipt_slug}/courses`}
            className="rounded-lg border border-gray-200 bg-white px-6 py-5 hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <div className="font-medium text-gray-900">Kursus</div>
            <div className="text-sm text-gray-500 mt-1">Lihat semua kursus</div>
          </Link>

          {(role === 'admin' || role === 'super_admin') && (
            <>
              <Link
                href={`/${ipt_slug}/admin/users`}
                className="rounded-lg border border-gray-200 bg-white px-6 py-5 hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <div className="font-medium text-gray-900">Pengurusan Pengguna</div>
                <div className="text-sm text-gray-500 mt-1">Urus ahli dan tenaga pengajar</div>
              </Link>
              <Link
                href={`/${ipt_slug}/admin/courses`}
                className="rounded-lg border border-gray-200 bg-white px-6 py-5 hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <div className="font-medium text-gray-900">Urus Kursus</div>
                <div className="text-sm text-gray-500 mt-1">Cipta dan edit kursus</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
