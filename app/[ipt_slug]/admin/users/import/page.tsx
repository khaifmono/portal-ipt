import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CsvImportForm } from './CsvImportForm'

export default async function ImportUsersPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  if (!['admin', 'super_admin'].includes(user.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href={`/${ipt_slug}/admin/users`}
          className="hover:text-blue-600 transition-colors"
        >
          Pengguna
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Import CSV</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Pengguna dari CSV</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Muat naik fail CSV untuk mendaftarkan pengguna secara pukal ke {ipt.name}.
        </p>
      </div>

      <CsvImportForm iptSlug={ipt_slug} iptId={ipt.id} />
    </div>
  )
}
