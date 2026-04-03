import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ iptId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const { iptId } = await params
  const body = await request.json()
  const { nama, ic_number, password, ipt_slug } = body

  if (!nama || !ic_number || !password) {
    return NextResponse.json({ error: 'Nama, No IC, dan kata laluan diperlukan.' }, { status: 400 })
  }

  if (!/^\d{12}$/.test(ic_number)) {
    return NextResponse.json({ error: 'Nombor IC mesti 12 digit.' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Kata laluan mesti sekurang-kurangnya 6 aksara.' }, { status: 400 })
  }

  // Check if IC already exists in this IPT
  const existing = await prisma.user.findUnique({
    where: { ipt_id_ic_number: { ipt_id: iptId, ic_number } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Nombor IC ini sudah didaftarkan dalam IPT ini.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      ipt_id: iptId,
      ic_number,
      nama,
      role: 'admin',
      password_hash: passwordHash,
    },
  })

  return NextResponse.json({ id: user.id, nama: user.nama, ic_number: user.ic_number }, { status: 201 })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ iptId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  await params
  const body = await request.json()
  const { userId, action } = body

  if (!userId || !action) {
    return NextResponse.json({ error: 'userId dan action diperlukan.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'Pengguna tidak dijumpai.' }, { status: 404 })
  }

  if (action === 'reset_password') {
    // Reset password to IC number
    const hash = await bcrypt.hash(user.ic_number, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hash },
    })
    return NextResponse.json({ message: 'Kata laluan telah diset semula kepada nombor IC.' })
  }

  if (action === 'demote') {
    // Demote admin to ahli
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ahli' },
    })
    return NextResponse.json({ message: 'Pentadbir telah dibuang.' })
  }

  return NextResponse.json({ error: 'Tindakan tidak sah.' }, { status: 400 })
}
