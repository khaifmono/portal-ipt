import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { notFound } from 'next/navigation'

export default async function IptHome({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)

  if (!ipt) notFound()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{ipt.name}</h1>
        <p className="text-gray-600 mb-8">Portal Pembelajaran PSSCM</p>

        <div className="flex gap-4">
          <Link
            href={`/${ipt_slug}/login`}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Log Masuk
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Semua Portal
          </Link>
        </div>
      </div>
    </main>
  )
}
