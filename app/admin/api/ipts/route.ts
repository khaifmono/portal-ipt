import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  return `data:${file.type};base64,${base64}`
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const logoFile = formData.get('logo') as File | null

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nama dan slug diperlukan.' }, { status: 400 })
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'Slug hanya boleh mengandungi huruf kecil, nombor dan tanda sempang.' }, { status: 400 })
    }

    const existing = await prisma.ipt.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug ini telah digunakan.' }, { status: 409 })
    }

    let logoUrl: string | null = null
    if (logoFile && logoFile.size > 0) {
      logoUrl = await fileToDataUrl(logoFile)
    }

    const ipt = await prisma.ipt.create({
      data: { name, slug, logo_url: logoUrl, is_active: true },
    })
    return NextResponse.json(ipt, { status: 201 })
  }

  const body = await request.json()
  const { name, slug, logo_url } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Nama dan slug diperlukan.' }, { status: 400 })
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Slug hanya boleh mengandungi huruf kecil, nombor dan tanda sempang.' }, { status: 400 })
  }

  const existing = await prisma.ipt.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug ini telah digunakan.' }, { status: 409 })
  }

  const ipt = await prisma.ipt.create({
    data: { name, slug, logo_url: logo_url || null, is_active: true },
  })
  return NextResponse.json(ipt, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { iptId, is_active } = body

  if (!iptId || typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'iptId dan is_active diperlukan.' }, { status: 400 })
  }

  const ipt = await prisma.ipt.update({
    where: { id: iptId },
    data: { is_active },
  })
  return NextResponse.json(ipt)
}
