import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getThreadById, getRepliesByThread, deleteReply } from '@/lib/forum'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ReplyForm } from './ReplyForm'

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; threadId: string }>
}) {
  const { ipt_slug, courseId, threadId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const thread = await getThreadById(threadId)
  if (!thread || thread.ipt_id !== ipt.id) notFound()

  const replies = await getRepliesByThread(threadId)

  const isStaff = ['super_admin', 'admin', 'tenaga_pengajar'].includes(user.role)

  async function handleDeleteReply(formData: FormData) {
    'use server'
    const replyId = formData.get('replyId') as string
    await deleteReply(replyId)
    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/${ipt_slug}/courses/${courseId}/forum/${threadId}`)
  }

  function roleBadge(role: string) {
    if (role === 'admin' || role === 'super_admin') {
      return (
        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
          Pentadbir
        </span>
      )
    }
    if (role === 'tenaga_pengajar') {
      return (
        <span className="text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
          Pengajar
        </span>
      )
    }
    return null
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
        <Link href={`/${ipt_slug}/courses/${courseId}/forum`} className="hover:text-blue-600 transition-colors">
          Forum
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{thread.title}</span>
      </nav>

      {/* Thread card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
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
          </div>
          <h1 className="text-lg font-bold text-gray-900">{thread.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{thread.creator_name}</span>
            {roleBadge(thread.creator_role)}
            <span>
              {new Date(thread.created_at).toLocaleDateString('ms-MY', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{thread.content}</p>
        </div>
      </div>

      {/* Replies */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-700">
            Balasan ({replies.length})
          </h2>
        </div>
        {replies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Tiada balasan lagi.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {replies.map((reply) => (
              <div key={reply.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{reply.creator_name}</span>
                    {roleBadge(reply.creator_role)}
                    <span>
                      {new Date(reply.created_at).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {isStaff && (
                    <form action={handleDeleteReply}>
                      <input type="hidden" name="replyId" value={reply.id} />
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Padam balasan"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply form or locked notice */}
      {thread.is_locked ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-center">
          <p className="text-sm text-red-700 font-medium">
            Topik ini telah dikunci. Balasan tidak dibenarkan.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Tulis Balasan</h2>
          </div>
          <div className="p-6">
            <ReplyForm iptSlug={ipt_slug} courseId={courseId} threadId={threadId} />
          </div>
        </div>
      )}
    </div>
  )
}
