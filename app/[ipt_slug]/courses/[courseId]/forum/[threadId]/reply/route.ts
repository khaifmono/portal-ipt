import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getIptBySlug } from '@/lib/ipt'
import { getThreadById, createReply } from '@/lib/forum'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; threadId: string }> }
) {
  const { ipt_slug, threadId } = await params

  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
  }

  // Check thread exists and is not locked
  const thread = await getThreadById(threadId)
  if (!thread || thread.ipt_id !== ipt.id) {
    return NextResponse.json({ error: 'Topik tidak dijumpai' }, { status: 404 })
  }

  if (thread.is_locked) {
    return NextResponse.json({ error: 'Topik ini telah dikunci. Balasan tidak dibenarkan.' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const content = body.content as string | undefined

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Kandungan balasan diperlukan' }, { status: 422 })
  }

  const reply = await createReply({
    threadId,
    iptId: ipt.id,
    content: content.trim(),
    createdBy: user.id,
  })

  return NextResponse.json(reply, { status: 201 })
}
