import { getIptBySlug } from '@/lib/ipt'
import { getUsersByIpt } from '@/lib/users'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  admin: { label: 'Admin', color: 'bg-orange-100 text-orange-700' },
  tenaga_pengajar: { label: 'Tenaga Pengajar', color: 'bg-blue-100 text-blue-700' },
  ahli: { label: 'Ahli', color: 'bg-green-100 text-green-700' },
}

export default async function UsersPage({
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

  if (!['admin', 'super_admin'].includes(user.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const users = await getUsersByIpt(ipt.id)

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ipt.name} · {users.length} pengguna</p>
        </div>
        <Link
          href={`/${ipt_slug}/admin/users/new`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Tambah Pengguna
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombor IC</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Peranan</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kelas Latihan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                  Tiada pengguna lagi. Klik &quot;+ Tambah Pengguna&quot; untuk bermula.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const roleInfo = ROLE_LABELS[u.role] ?? { label: u.role, color: 'bg-gray-100 text-gray-700' }
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{u.nama[0].toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900">{u.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{u.ic_number}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{u.kelas_latihan ?? '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
