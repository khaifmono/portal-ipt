import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  admin: { label: 'Admin', color: 'bg-orange-100 text-orange-700' },
  tenaga_pengajar: { label: 'Tenaga Pengajar', color: 'bg-blue-100 text-blue-700' },
  ahli: { label: 'Ahli', color: 'bg-green-100 text-green-700' },
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const sessionUser = session?.user
  if (!sessionUser) redirect(`/${ipt_slug}/login`)

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  })
  if (!user) redirect(`/${ipt_slug}/login`)

  const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">{ipt.name}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">
              {user.nama[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.nama}</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Info fields */}
        <div className="divide-y divide-gray-100">
          <InfoRow label="Nama" value={user.nama} />
          <InfoRow
            label="Nombor IC"
            value={user.ic_number}
            mono
          />
          <InfoRow label="Peranan" value={roleInfo.label} />
          <InfoRow
            label="Kelas Latihan"
            value={user.kelas_latihan ?? '—'}
          />
          <InfoRow
            label="Tarikh Daftar"
            value={new Date(user.created_at).toLocaleDateString('ms-MY', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
          <Link
            href={`/${ipt_slug}/profile/password`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Tukar Kata Laluan
          </Link>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center px-6 py-4">
      <dt className="w-40 text-sm font-medium text-gray-500 shrink-0">{label}</dt>
      <dd className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
