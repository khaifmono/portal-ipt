import Link from 'next/link'
import Image from 'next/image'
import { getAllIpts } from '@/lib/ipt'
import { Badge } from '@/components/ui/badge'
import { IptLogo } from '@/components/ui/IptLogo'

export default async function Home() {
  const ipts = await getAllIpts()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b border-white/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
          <Image
            src="/logos/psscm.png"
            alt="PSSCM Logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Portal IPT</p>
            <p className="text-xs text-slate-500 leading-none">Persatuan Seni Silat Cekak Malaysia</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/logos/psscm.png"
              alt="PSSCM Logo"
              width={100}
              height={100}
              className="rounded-full object-cover shadow-xl ring-4 ring-white"
            />
          </div>
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-medium tracking-wide">
            Persatuan Seni Silat Cekak Malaysia
          </Badge>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Portal IPT{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              PSSCM
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Pilih portal IPT anda untuk mengakses sistem pengurusan pembelajaran.
          </p>
        </div>

        {/* IPT Grid */}
        {ipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Image
              src="/logos/psscm.png"
              alt="PSSCM"
              width={64}
              height={64}
              className="rounded-full object-cover opacity-40 mb-4"
            />
            <p className="text-slate-700 font-medium">Tiada portal IPT aktif pada masa ini.</p>
            <p className="text-slate-400 text-sm mt-1">
              Pastikan migrasi pangkalan data telah dijalankan dan IPT telah didaftarkan.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {ipts.map((ipt) => (
                <Link
                  key={ipt.id}
                  href={`/${ipt.slug}`}
                  className="group relative flex flex-col items-center justify-center aspect-square rounded-2xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden p-6"
                >
                  {/* Decorative gradient blob */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Logo */}
                  <div className="relative mb-4">
                    <IptLogo
                      src={ipt.logo_url}
                      alt={ipt.name}
                      size={64}
                      className="rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200"
                    />
                  </div>

                  {/* Name */}
                  <p className="relative text-sm font-semibold text-slate-800 text-center leading-snug group-hover:text-indigo-700 transition-colors duration-200">
                    {ipt.name}
                  </p>
                  <p className="relative text-xs text-slate-400 mt-1 font-mono">{ipt.slug}</p>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            <p className="text-center text-slate-400 text-sm mt-10">
              {ipts.length} portal IPT aktif
            </p>
          </>
        )}
      </div>
    </main>
  )
}
