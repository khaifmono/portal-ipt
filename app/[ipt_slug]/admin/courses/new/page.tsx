import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { NewCourseForm } from './NewCourseForm'

export default async function NewCoursePage({
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
    <div className="max-w-xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${ipt_slug}/dashboard`} className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href={`/${ipt_slug}/admin/courses`} className="hover:text-blue-600 transition-colors">Urus Kursus</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Kursus Baru</span>
      </nav>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5">
          <h1 className="text-lg font-bold text-white">Cipta Kursus Baru</h1>
          <p className="text-blue-200 text-sm mt-0.5">{ipt.name}</p>
        </div>
        <div className="p-6">
          <NewCourseForm iptId={ipt.id} iptSlug={ipt_slug} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
