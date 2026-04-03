import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ToggleIptButton } from './ToggleIptButton'
import { IptBoard } from './IptBoard'

export default async function AdminDashboardPage() {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'super_admin') redirect('/admin/login')

  const ipts = await prisma.ipt.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { users: true, courses: true, enrollments: true },
      },
      users: {
        where: { role: { in: ['admin', 'super_admin'] } },
        select: { id: true, nama: true, role: true, ic_number: true },
        orderBy: { role: 'asc' },
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
            <p className="text-[10px] text-red-500 leading-none font-semibold tracking-wider uppercase">Pentadbir Sistem</p>
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
              <p className="text-sm text-gray-500 mt-0.5">Pengurusan semua IPT dalam sistem Portal PSSCM</p>
            </div>
            <Link
              href="/admin/ipts/new"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah IPT
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="building" label="Jumlah IPT" value={ipts.length} sub={`${activeIpts} aktif`} color="blue" />
            <StatCard icon="users" label="Jumlah Pengguna" value={totalUsers} sub="Semua IPT" color="green" />
            <StatCard icon="book" label="Jumlah Kursus" value={totalCourses} sub="Semua IPT" color="indigo" />
            <StatCard icon="check" label="IPT Aktif" value={activeIpts} sub={`${ipts.length - activeIpts} tidak aktif`} color="emerald" />
          </div>

          {/* IPT Board with Search */}
          <IptBoard ipts={ipts.map(ipt => ({
            id: ipt.id,
            name: ipt.name,
            slug: ipt.slug,
            logo_url: ipt.logo_url,
            is_active: ipt.is_active,
            created_at: ipt.created_at.toISOString(),
            _count: ipt._count,
            admins: ipt.users,
          }))} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: number; sub: string; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  }
  const c = colors[color] || colors.blue

  const icons: Record<string, React.ReactNode> = {
    building: <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    users: <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    book: <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    check: <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>{icons[icon]}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{sub}</p>
    </div>
  )
}
