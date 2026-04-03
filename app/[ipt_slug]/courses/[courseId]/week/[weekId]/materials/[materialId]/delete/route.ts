import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { deleteMaterial } from '@/lib/materials'
import { redirect } from 'next/navigation'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string; materialId: string }> }
) {
  const { ipt_slug, courseId, weekId, materialId } = await params

  try {
    await requireRole(['admin', 'super_admin', 'tenaga_pengajar'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  try {
    await deleteMaterial(materialId)
  } catch {
    return NextResponse.json({ error: 'Gagal memadam bahan' }, { status: 500 })
  }

  redirect(`/${ipt_slug}/courses/${courseId}/week/${weekId}`)
}
