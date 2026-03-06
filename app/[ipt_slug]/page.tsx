import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { notFound } from 'next/navigation'
import { IptLogo } from '@/components/ui/IptLogo'

export default async function IptHome({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <div className="flex items-center justify-center gap-4 mb-6">
        <IptLogo
          src="/logos/psscm.png"
          alt="PSSCM Logo"
          size={80}
          className="rounded-full object-cover shadow-xl"
        />
        {ipt.logo_url && (
          <>
            <div className="w-px h-16 bg-gray-300" />
            <IptLogo
              src={ipt.logo_url}
              alt={ipt.name}
              size={80}
              className="rounded-full object-cover shadow-xl"
            />
          </>
        )}
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-2">{ipt.name}</h1>
      <p className="text-gray-500 mb-8 text-lg">Portal Pembelajaran Persatuan Seni Silat Cekak Malaysia</p>

      <div className="flex gap-3">
        <Link
          href={`/${ipt_slug}/login`}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Log Masuk
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Semua Portal
        </Link>
      </div>
    </div>
  )
}
