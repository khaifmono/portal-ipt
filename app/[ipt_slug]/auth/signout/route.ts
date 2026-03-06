import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ipt_slug: string }> }
) {
  const { ipt_slug } = await params
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL(`/${ipt_slug}/login`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
