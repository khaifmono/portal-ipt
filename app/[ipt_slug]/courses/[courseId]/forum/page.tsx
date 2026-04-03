import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getThreadsByCourse, toggleThreadLock } from '@/lib/forum'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ForumPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const threads = await getThreadsByCourse(courseId)

  const isStaff = ['super_admin', 'admin', 'tenaga_pengajar'].includes(user.role)

  async function handleToggleLock(formData: FormData) {
    'use server'
    const threadId = formData.get('threadId') as string
    const currentLocked = formData.get('currentLocked') === 'true'
    await toggleThreadLock(threadId, !currentLocked)
    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/${ipt_slug}/courses/${courseId}/forum`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${ipt_slug}/courses`} className="hover:text-blue-600 transition-colors">
          Kursus Saya
        </Link>
        <span>/</span>
        <Link href={`/${ipt_slug}/courses/${courseId}`} className="hover:text-blue-600 transition-colors">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Forum</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-6">
          <h1 className="text-xl font-bold text-white">Forum Perbincangan</h1>
          <p className="text-blue-200 text-sm mt-1">{course.title}</p>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-500">{threads.length} topik</span>
          <Link
            href={`/${ipt_slug}/courses/${courseId}/forum/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Topik Baru
          </Link>
        </div>
      </div>

      {/* Thread list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {threads.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-500">Tiada topik perbincangan lagi.</p>
            <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama memulakan perbincangan!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((thread) => (
              <div key={thread.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                        </svg>
                        Disematkan
                      </span>
                    )}
                    {thread.is_locked && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Dikunci
                      </span>
                    )}
                    <Link
                      href={`/${ipt_slug}/courses/${courseId}/forum/${thread.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-700 transition-colors"
                    >
                      {thread.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-600">{thread.creator_name}</span>
                    <span>
                      {new Date(thread.created_at).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Reply count */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{thread.reply_count}</span>
                  </div>

                  {/* Staff: lock/unlock button */}
                  {isStaff && (
                    <form action={handleToggleLock}>
                      <input type="hidden" name="threadId" value={thread.id} />
                      <input type="hidden" name="currentLocked" value={String(thread.is_locked)} />
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={thread.is_locked ? 'Buka kunci topik' : 'Kunci topik'}
                      >
                        {thread.is_locked ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
