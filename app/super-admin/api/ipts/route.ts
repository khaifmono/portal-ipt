import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    await requireRole(['super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { name, slug, logo_url } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Nama dan slug diperlukan.' }, { status: 400 })
  }

  // Validate slug format
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug hanya boleh mengandungi huruf kecil, nombor dan tanda sempang.' },
      { status: 400 }
    )
  }

  // Check slug uniqueness
  const existing = await prisma.ipt.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(
      { error: 'Slug ini telah digunakan. Sila pilih slug lain.' },
      { status: 409 }
    )
  }

  try {
    const ipt = await prisma.ipt.create({
      data: {
        name,
        slug,
        logo_url: logo_url || null,
        is_active: true,
      },
    })
    return NextResponse.json(ipt, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(['super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { iptId, is_active } = body

  if (!iptId || typeof is_active !== 'boolean') {
    return NextResponse.json(
      { error: 'iptId dan is_active diperlukan.' },
      { status: 400 }
    )
  }

  try {
    const ipt = await prisma.ipt.update({
      where: { id: iptId },
      data: { is_active },
    })
    return NextResponse.json(ipt)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
