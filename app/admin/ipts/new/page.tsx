import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NewIptForm } from './NewIptForm'

export default async function NewIptPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'super_admin') redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Tambah IPT Baru</span>
        </nav>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5">
            <h1 className="text-lg font-bold text-white">Tambah IPT Baru</h1>
            <p className="text-blue-200 text-sm mt-0.5">Cipta portal baru untuk Institut Pengajian Tinggi</p>
          </div>
          <div className="p-6">
            <NewIptForm />
          </div>
        </div>
      </div>
    </div>
  )
}
