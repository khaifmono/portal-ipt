import { NextResponse } from 'next/server'
import { signOut } from '@/auth'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ipt_slug: string }> }
) {
  const { ipt_slug } = await params
  await signOut({ redirect: false })
  return NextResponse.redirect(
    new URL(`/${ipt_slug}/login`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  )
}
