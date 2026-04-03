import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { IptLogo } from '@/components/ui/IptLogo'
import { AdminManager } from './AdminManager'

export default async function IptAdminsPage({
  params,
}: {
  params: Promise<{ iptId: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') redirect('/admin/login')

  const { iptId } = await params

  const ipt = await prisma.ipt.findUnique({
    where: { id: iptId },
    include: {
      users: {
        where: { role: 'admin' },
        select: { id: true, nama: true, ic_number: true, role: true, kelas_latihan: true, created_at: true },
        orderBy: { nama: 'asc' },
      },
    },
  })

  if (!ipt) notFound()

  const admins = ipt.users.map((u) => ({
    ...u,
    created_at: u.created_at.toISOString(),
  }))

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
      </nav>

      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{ipt.name}</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">Pentadbir</span>
          </nav>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl px-6 py-5 mb-6 flex items-center gap-4">
            {ipt.logo_url ? (
              <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden ring-2 ring-white/30 bg-white/20">
                <IptLogo src={ipt.logo_url} alt={ipt.name} size={56} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 shrink-0 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                <span className="text-white text-xl font-bold">{ipt.name[0]}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">Urus Pentadbir — {ipt.name}</h1>
              <p className="text-blue-200 text-sm mt-0.5">Tambah, ubah, atau buang pentadbir IPT ini</p>
            </div>
          </div>

          <AdminManager iptId={ipt.id} iptSlug={ipt.slug} admins={admins} />
        </div>
      </div>
    </div>
  )
}
