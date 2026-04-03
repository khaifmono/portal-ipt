import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { markAsRead, markAllAsRead } from '@/lib/notifications'

/** PATCH — mark a single notification as read */
export async function PATCH(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 })
  }

  let body: { notificationId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  if (!body.notificationId) {
    return NextResponse.json({ error: 'notificationId diperlukan' }, { status: 422 })
  }

  try {
    await markAsRead(body.notificationId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Notifikasi tidak dijumpai' }, { status: 404 })
  }
}

/** POST — mark all notifications as read for the current user */
export async function POST() {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 })
  }

  await markAllAsRead(user.id)
  return NextResponse.json({ ok: true })
}
