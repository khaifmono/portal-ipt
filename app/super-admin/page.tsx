import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ToggleIptButton } from './ToggleIptButton'

export default async function SuperAdminPage() {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'super_admin') redirect('/')

  // Fetch all IPTs with counts
  const ipts = await prisma.ipt.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          users: true,
          courses: true,
        },
      },
    },
  })

  const totalUsers = ipts.reduce((sum, ipt) => sum + ipt._count.users, 0)
  const totalCourses = ipts.reduce((sum, ipt) => sum + ipt._count.courses, 0)
  const activeIpts = ipts.filter((ipt) => ipt.is_active).length
  const inactiveIpts = ipts.length - activeIpts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logos/psscm.png"
            alt="PSSCM Logo"
            width={38}
            height={38}
            className="rounded-full object-cover"
          />
          <div className="hidden sm:block">
            <p className="text-[10px] text-gray-400 leading-none font-medium tracking-wider uppercase">
              Pentadbir Sistem
            </p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">
              Portal IPT PSSCM
            </p>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">
                {(user.nama ?? 'S')[0].toUpperCase()}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user.nama ?? 'Super Admin'}
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          {/* Page title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pentadbir Sistem
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Pengurusan semua IPT dalam Portal PSSCM
              </p>
            </div>
            <Link
              href="/super-admin/ipts/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Tambah IPT Baru
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Jumlah IPT"
              value={ipts.length}
              sub={`${activeIpts} aktif · ${inactiveIpts} tidak aktif`}
              color="blue"
            />
            <StatCard
              label="Jumlah Pengguna"
              value={totalUsers}
              sub="Semua IPT"
              color="green"
            />
            <StatCard
              label="Jumlah Kursus"
              value={totalCourses}
              sub="Semua IPT"
              color="indigo"
            />
            <StatCard
              label="Storan Digunakan"
              value="—"
              sub="Akan datang"
              color="gray"
            />
          </div>

          {/* IPT Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Senarai IPT
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Nama IPT
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Slug
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Pengguna
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Kursus
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tarikh Cipta
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ipts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      Tiada IPT lagi. Klik &quot;+ Tambah IPT Baru&quot; untuk
                      bermula.
                    </td>
                  </tr>
                ) : (
                  ipts.map((ipt) => (
                    <tr
                      key={ipt.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {ipt.logo_url ? (
                            <Image
                              src={ipt.logo_url}
                              alt={ipt.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-bold">
                                {ipt.name[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {ipt.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                        /{ipt.slug}
                      </td>
                      <td className="px-5 py-3.5">
                        {ipt.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                            Tidak Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {ipt._count.users}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {ipt._count.courses}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {new Date(ipt.created_at).toLocaleDateString('ms-MY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <ToggleIptButton
                          iptId={ipt.id}
                          isActive={ipt.is_active}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: number | string
  sub: string
  color: 'blue' | 'green' | 'indigo' | 'gray'
}) {
  const colorMap = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    indigo: 'from-indigo-600 to-indigo-700',
    gray: 'from-gray-500 to-gray-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-2xl font-bold mt-1 bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
