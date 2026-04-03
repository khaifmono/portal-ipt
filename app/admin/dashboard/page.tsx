import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ToggleIptButton } from './ToggleIptButton'

export default async function AdminDashboardPage() {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'super_admin') redirect('/admin/login')

  const ipts = await prisma.ipt.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { users: true, courses: true },
      },
    },
  })

  const totalUsers = ipts.reduce((sum, ipt) => sum + ipt._count.users, 0)
  const totalCourses = ipts.reduce((sum, ipt) => sum + ipt._count.courses, 0)
  const activeIpts = ipts.filter((i) => i.is_active).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-3">
        <Link href="/admin/dashboard" className="flex items-center gap-3 shrink-0">
          <Image src="/logos/psscm.png" alt="PSSCM" width={38} height={38} className="rounded-full object-cover" />
          <div className="hidden sm:block">
            <p className="text-[10px] text-red-500 leading-none font-semibold tracking-wider uppercase">Admin Panel</p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">Portal IPT PSSCM</p>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/" className="text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium">
            Ke Portal
          </Link>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{(user.nama ?? 'S')[0].toUpperCase()}</span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{user.nama}</span>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Pentadbir</h1>
              <p className="text-sm text-gray-500 mt-0.5">Pengurusan semua IPT dalam Portal PSSCM</p>
            </div>
            <Link
              href="/admin/ipts/new"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah IPT
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{ipts.length}</p>
                  <p className="text-xs text-gray-500">Jumlah IPT</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{activeIpts} aktif · {ipts.length - activeIpts} tidak aktif</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-gray-500">Jumlah Pengguna</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                  <p className="text-xs text-gray-500">Jumlah Kursus</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{activeIpts}</p>
                  <p className="text-xs text-gray-500">IPT Aktif</p>
                </div>
              </div>
            </div>
          </div>

          {/* IPT Board */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Senarai IPT</h2>
          {ipts.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <p className="text-gray-500 font-medium">Tiada IPT lagi</p>
              <p className="text-gray-400 text-sm mt-1">Klik &quot;Tambah IPT&quot; untuk bermula</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ipts.map((ipt) => (
                <div key={ipt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center gap-3">
                    {ipt.logo_url ? (
                      <Image src={ipt.logo_url} alt={ipt.name} width={48} height={48} className="rounded-full object-cover ring-2 ring-white/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                        <span className="text-white text-lg font-bold">{ipt.name[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{ipt.name}</h3>
                      <p className="text-blue-200 text-xs font-mono">/{ipt.slug}</p>
                    </div>
                    {ipt.is_active ? (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-green-400/20 px-2 py-0.5 text-xs font-semibold text-green-100">Aktif</span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-red-400/20 px-2 py-0.5 text-xs font-semibold text-red-200">Tidak Aktif</span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{ipt._count.users}</p>
                        <p className="text-xs text-gray-500">Pengguna</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{ipt._count.courses}</p>
                        <p className="text-xs text-gray-500">Kursus</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mt-1">Dicipta</p>
                        <p className="text-xs font-medium text-gray-700">
                          {new Date(ipt.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/${ipt.slug}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Buka Portal →
                    </Link>
                    <ToggleIptButton iptId={ipt.id} isActive={ipt.is_active} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
