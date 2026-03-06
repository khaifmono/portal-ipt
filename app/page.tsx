import Link from 'next/link'
import { getAllIpts } from '@/lib/ipt'

export default async function Home() {
  const ipts = await getAllIpts()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal IPT PSSCM</h1>
        <p className="text-gray-600 mb-8">Persatuan Seni Silat Cekak Malaysia</p>

        {ipts.length === 0 ? (
          <p className="text-gray-500">Tiada portal IPT aktif pada masa ini.</p>
        ) : (
          <ul className="space-y-3">
            {ipts.map((ipt) => (
              <li key={ipt.id}>
                <Link
                  href={`/${ipt.slug}`}
                  className="block rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">{ipt.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
