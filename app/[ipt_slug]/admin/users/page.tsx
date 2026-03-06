import { getIptBySlug } from '@/lib/ipt'
import { getUsersByIpt } from '@/lib/users'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function UsersPage({
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
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const users = await getUsersByIpt(ipt.id)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengurusan Pengguna</h1>
            <p className="text-sm text-gray-500">{ipt.name}</p>
          </div>
          <Link
            href={`/${ipt_slug}/admin/users/new`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Tambah Pengguna
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Nama</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Nombor IC</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Peranan</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Kelas Latihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Tiada pengguna lagi.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{u.ic_number}</td>
                    <td className="px-4 py-3 text-gray-600">{u.role}</td>
                    <td className="px-4 py-3 text-gray-600">{u.kelas_latihan ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
