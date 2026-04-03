import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getIptBySlug } from '@/lib/ipt'
import { createThread } from '@/lib/forum'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string }> }
) {
  const { ipt_slug, courseId } = await params

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

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const title = body.title as string | undefined
  const content = body.content as string | undefined

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Tajuk diperlukan' }, { status: 422 })
  }

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Kandungan diperlukan' }, { status: 422 })
  }

  const thread = await createThread({
    courseId,
    iptId: ipt.id,
    title: title.trim(),
    content: content.trim(),
    createdBy: user.id,
  })

  return NextResponse.json(thread, { status: 201 })
}
