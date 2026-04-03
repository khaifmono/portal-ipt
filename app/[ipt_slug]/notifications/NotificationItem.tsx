'use client'

import { useRouter } from 'next/navigation'
import type { NotificationData } from '@/lib/notifications'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru sahaja'
  if (mins < 60) return `${mins} minit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  return `${months} bulan lalu`
}

export function NotificationItem({
  notification: n,
  iptSlug,
}: {
  notification: NotificationData
  iptSlug: string
}) {
  const router = useRouter()

  async function handleClick() {
    // Mark as read
    if (!n.is_read) {
      fetch(`/${iptSlug}/notifications/api`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: n.id }),
      }).catch(() => {})
    }

    // Navigate if link exists
    if (n.link) {
      router.push(n.link)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
        !n.is_read ? 'bg-blue-50/40' : ''
      }`}
    >
      {/* Unread indicator */}
      <div className="pt-1.5 shrink-0">
        {!n.is_read ? (
          <span className="block w-2.5 h-2.5 rounded-full bg-blue-500" />
        ) : (
          <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
          {n.title}
        </p>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>

      {n.link && (
        <svg className="w-4 h-4 text-gray-300 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </button>
  )
}
