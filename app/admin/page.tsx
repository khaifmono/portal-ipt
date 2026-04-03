import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role === 'super_admin') {
    redirect('/admin/dashboard')
  }
  redirect('/admin/login')
}
