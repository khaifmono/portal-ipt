import { getIptBySlug } from '@/lib/ipt'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { NewCourseForm } from './NewCourseForm'

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const supabase = await createClient()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cipta Kursus</h1>
        <p className="text-sm text-gray-500 mb-8">{ipt.name}</p>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <NewCourseForm iptId={ipt.id} iptSlug={ipt_slug} userId={user.id} />
        </div>
      </div>
    </main>
  )
}
