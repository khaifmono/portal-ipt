import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { AdminLoginForm } from './AdminLoginForm'

export default async function AdminLoginPage() {
  const session = await auth()
  if (session?.user?.role === 'super_admin') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logos/psscm.png"
            alt="PSSCM Logo"
            width={80}
            height={80}
            className="rounded-full object-cover mx-auto shadow-xl ring-4 ring-white/10"
          />
          <h1 className="text-2xl font-bold text-white mt-4">Portal IPT Admin</h1>
          <p className="text-blue-300 text-sm mt-1">Pentadbir Sistem PSSCM</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
