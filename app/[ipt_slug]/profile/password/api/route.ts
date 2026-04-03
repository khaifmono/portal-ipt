import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Sila log masuk semula.' }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Kata laluan semasa dan kata laluan baru diperlukan.' },
      { status: 400 }
    )
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'Kata laluan baru mesti sekurang-kurangnya 6 aksara.' },
      { status: 400 }
    )
  }

  // Fetch current password hash
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password_hash: true },
  })

  if (!dbUser) {
    return NextResponse.json(
      { error: 'Pengguna tidak dijumpai.' },
      { status: 404 }
    )
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, dbUser.password_hash)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Kata laluan semasa tidak betul.' },
      { status: 400 }
    )
  }

  // Hash and update
  const newHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash: newHash },
  })

  return NextResponse.json({ success: true })
}
