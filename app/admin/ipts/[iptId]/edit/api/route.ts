import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  return `data:${file.type};base64,${base64}`
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ iptId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const { iptId } = await params
  const ipt = await prisma.ipt.findUnique({ where: { id: iptId } })
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai.' }, { status: 404 })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const logoFile = formData.get('logo') as File | null

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nama IPT diperlukan.' }, { status: 400 })
  }

  let logoUrl = ipt.logo_url
  if (logoFile && logoFile.size > 0) {
    logoUrl = await fileToDataUrl(logoFile)
  }

  const updated = await prisma.ipt.update({
    where: { id: iptId },
    data: { name: name.trim(), logo_url: logoUrl },
  })

  return NextResponse.json(updated)
}
