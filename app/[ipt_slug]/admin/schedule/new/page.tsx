import { getIptBySlug } from '@/lib/ipt'
import { getCoursesByIpt } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { NewScheduleForm } from './NewScheduleForm'

export default async function NewSchedulePage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const courses = await getCoursesByIpt(ipt.id)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href={`/${ipt_slug}/admin/schedule`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke Jadual
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Cipta Jadual Kelas</h1>
          <NewScheduleForm
            iptId={ipt.id}
            iptSlug={ipt_slug}
            createdBy={user.id}
            courses={courses}
          />
        </div>
      </div>
    </main>
  )
}
