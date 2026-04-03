import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { getIptBySlug } from '@/lib/ipt'
import { createMaterial } from '@/lib/materials'
import { saveFile } from '@/lib/storage'
import type { MaterialType } from '@/lib/types'

const VALID_TYPES: MaterialType[] = ['file', 'link', 'youtube', 'google_drive']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string }> }
) {
  const { ipt_slug, courseId, weekId } = await params

  let user
  try {
    user = await requireRole(['admin', 'super_admin', 'tenaga_pengajar'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
  }

  const contentType = request.headers.get('content-type') || ''

  // Handle file upload (multipart/form-data)
  if (contentType.includes('multipart/form-data')) {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Data borang tidak sah' }, { status: 400 })
    }

    const title = formData.get('title') as string | null
    const description = (formData.get('description') as string | null) || undefined
    const type = formData.get('type') as string | null
    const file = formData.get('file') as File | null

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Tajuk diperlukan' }, { status: 422 })
    }

    if (type !== 'file') {
      return NextResponse.json({ error: 'Jenis bahan tidak sah untuk muat naik fail' }, { status: 422 })
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Fail diperlukan' }, { status: 422 })
    }

    // Save file to storage
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const relativePath = `course-materials/${courseId}/${weekId}/${filename}`
    await saveFile(relativePath, file)

    const material = await createMaterial({
      weekId,
      courseId,
      iptId: ipt.id,
      title: title.trim(),
      description: description?.trim(),
      type: 'file',
      filePath: relativePath,
      createdBy: user.id,
    })

    return NextResponse.json(material, { status: 201 })
  }

  // Handle link/youtube/google_drive (JSON body)
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const title = body.title as string | undefined
  const description = body.description as string | undefined
  const type = body.type as string | undefined
  const url = body.url as string | undefined

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Tajuk diperlukan' }, { status: 422 })
  }

  if (!type || !VALID_TYPES.includes(type as MaterialType) || type === 'file') {
    return NextResponse.json({ error: 'Jenis bahan tidak sah' }, { status: 422 })
  }

  if (!url || !url.trim()) {
    return NextResponse.json({ error: 'URL diperlukan' }, { status: 422 })
  }

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'URL tidak sah' }, { status: 422 })
  }

  const material = await createMaterial({
    weekId,
    courseId,
    iptId: ipt.id,
    title: title.trim(),
    description: description?.trim(),
    type: type as MaterialType,
    url: url.trim(),
    createdBy: user.id,
  })

  return NextResponse.json(material, { status: 201 })
}
