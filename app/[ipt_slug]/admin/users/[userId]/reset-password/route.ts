import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string; userId: string }> }
) {
  const { userId } = await params

  try {
    await requireRole(['admin', 'super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  // Find the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, ic_number: true },
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Pengguna tidak dijumpai.' },
      { status: 404 }
    )
  }

  // Reset password to the user's IC number
  const defaultPassword = targetUser.ic_number
  const newHash = await bcrypt.hash(defaultPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: newHash },
  })

  return NextResponse.json({
    success: true,
    message: `Kata laluan telah ditetapkan semula kepada nombor IC pengguna.`,
  })
}
