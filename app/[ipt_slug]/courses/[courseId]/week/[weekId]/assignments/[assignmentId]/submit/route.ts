import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getIptBySlug } from '@/lib/ipt'
import { createSubmission } from '@/lib/submissions'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      ipt_slug: string
      courseId: string
      weekId: string
      assignmentId: string
    }>
  }
) {
  const { ipt_slug, assignmentId } = await params

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
  }

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
  }

  let contentText: string | undefined
  let filePath: string | undefined

  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const textVal = formData.get('contentText')
    const fileVal = formData.get('file')

    if (textVal && typeof textVal === 'string' && textVal.trim()) {
      contentText = textVal.trim()
    }

    if (fileVal && fileVal instanceof Blob && fileVal.size > 0) {
      const fileName = fileVal instanceof File ? fileVal.name : 'upload'
      const storagePath = `assignment-submissions/${assignmentId}/${user.id}/${fileName}`

      const supabase = await createClient()
      const { error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(storagePath, fileVal, { upsert: true })

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      filePath = storagePath
    }
  } else {
    // JSON body fallback
    try {
      const body = await request.json()
      contentText = body.contentText
      filePath = body.filePath
    } catch {
      return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
    }
  }

  try {
    await createSubmission({
      assignmentId,
      userId: user.id,
      iptId: ipt.id,
      contentText,
      filePath,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const { courseId, weekId } = await params
  return NextResponse.redirect(
    new URL(`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}`, request.url),
    { status: 303 }
  )
}
