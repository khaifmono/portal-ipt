import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getIptBySlug } from '@/lib/ipt'
import { getNotifications } from '@/lib/notifications'
import { MarkAllReadButton } from './MarkAllReadButton'
import { NotificationItem } from './NotificationItem'

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const session = await auth()
  if (!session?.user) redirect(`/${ipt_slug}/login`)

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) redirect('/')

  const notifications = await getNotifications(session.user.id, 50)
  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
        {hasUnread && <MarkAllReadButton iptSlug={ipt_slug} />}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-gray-500 text-sm">Tiada notifikasi</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} iptSlug={ipt_slug} />
          ))}
        </div>
      )}
    </div>
  )
}
