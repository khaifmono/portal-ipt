import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminSettingsPage() {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'super_admin') redirect('/admin/login')

  const smtpFields = [
    { label: 'SMTP Host', value: process.env.SMTP_HOST || 'Belum dikonfigurasi', key: 'host' },
    { label: 'SMTP Port', value: process.env.SMTP_PORT || '587', key: 'port' },
    { label: 'SMTP Username', value: process.env.SMTP_USER || 'Belum dikonfigurasi', key: 'user' },
    { label: 'SMTP Password', value: process.env.SMTP_PASS ? '********' : 'Belum dikonfigurasi', key: 'pass', masked: true },
    { label: 'From Email', value: process.env.SMTP_FROM_EMAIL || 'noreply@silatcekak.org.my', key: 'from_email' },
    { label: 'From Name', value: process.env.SMTP_FROM_NAME || 'Portal IPT PSSCM', key: 'from_name' },
  ]

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
          <Link href="/admin/dashboard" className="text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium">
            Dashboard
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
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Tetapan</span>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tetapan Sistem</h1>
              <p className="text-sm text-gray-500 mt-0.5">Konfigurasi e-mel dan tetapan sistem lain</p>
            </div>
          </div>

          {/* Email Configuration Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Konfigurasi E-mel (SMTP)</h2>
                  <p className="text-xs text-gray-500">Tetapan pelayan e-mel untuk notifikasi sistem</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Akan Datang
              </span>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-4">
                {smtpFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 cursor-not-allowed">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Maklumat</p>
                    <p className="text-sm text-blue-700 mt-0.5">
                      Konfigurasi e-mel akan didayakan dalam kemas kini akan datang.
                      Tetapan ini akan membolehkan sistem menghantar notifikasi automatik
                      kepada pengguna seperti penilaian tugasan, pengumuman baharu, dan peringatan kelas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Planned notification types */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Jenis Notifikasi</h2>
              <p className="text-xs text-gray-500">Notifikasi e-mel yang akan dihantar apabila SMTP dikonfigurasi</p>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-3">
                {[
                  { title: 'Tugasan Dinilai', desc: 'E-mel kepada pelajar apabila tugasan mereka telah dinilai', icon: 'grade' },
                  { title: 'Pengumuman Baharu', desc: 'E-mel kepada semua pelajar dalam kursus apabila ada pengumuman baharu', icon: 'announce' },
                  { title: 'Peringatan Kelas', desc: 'E-mel peringatan 24 jam sebelum kelas bermula', icon: 'remind' },
                  { title: 'Pendaftaran Kursus', desc: 'E-mel pengesahan apabila pelajar didaftarkan dalam kursus', icon: 'enroll' },
                ].map((item) => (
                  <div key={item.icon} className="flex items-start gap-3 rounded-lg border border-gray-100 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="ml-auto shrink-0 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      Tidak aktif
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
