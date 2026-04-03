import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      ipt_slug: string
      courseId: string
      weekId: string
    }>
  }
) {
  const { weekId } = await params

  try {
    await requireRole(['admin', 'super_admin', 'tenaga_pengajar'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  let body: { materialIds?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const { materialIds } = body

  if (!Array.isArray(materialIds) || materialIds.length === 0) {
    return NextResponse.json(
      { error: 'materialIds mesti senarai ID yang sah' },
      { status: 422 }
    )
  }

  // Validate all IDs are strings
  if (!materialIds.every((id) => typeof id === 'string' && id.length > 0)) {
    return NextResponse.json(
      { error: 'Setiap materialId mesti rentetan yang sah' },
      { status: 422 }
    )
  }

  // Verify all materials belong to this week
  const materials = await prisma.courseMaterial.findMany({
    where: { week_id: weekId, id: { in: materialIds } },
    select: { id: true },
  })

  if (materials.length !== materialIds.length) {
    return NextResponse.json(
      { error: 'Satu atau lebih ID bahan tidak sah untuk minggu ini' },
      { status: 422 }
    )
  }

  // Update order_index for each material in a transaction
  await prisma.$transaction(
    materialIds.map((id, index) =>
      prisma.courseMaterial.update({
        where: { id },
        data: { order_index: index },
      })
    )
  )

  return NextResponse.json({ success: true }, { status: 200 })
}
