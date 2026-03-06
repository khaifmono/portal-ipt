import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string }> }
) {
  const { ipt_slug } = await params
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('role, ipt_id')
    .eq('id', currentUser.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { ic_number, nama, kelas_latihan, role, password, iptId } = body

  if (!ic_number || !nama || !password || !iptId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  const email = `${ic_number}@${ipt_slug}.psscm`

  // Use service role via admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { ipt_id: iptId, role },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: insertError } = await supabase.from('users').insert({
    id: authData.user.id,
    ipt_id: iptId,
    ic_number,
    nama,
    role,
    kelas_latihan: kelas_latihan || null,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
