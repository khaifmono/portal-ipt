import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { NavLink } from './NavLink'

interface AppNavbarProps {
  iptSlug: string
  iptName: string
  iptLogoUrl?: string | null
}

export default async function AppNavbar({ iptSlug, iptName, iptLogoUrl }: AppNavbarProps) {
  const session = await auth()
  const user = session?.user

  const role = user?.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const initial = (user?.nama ?? 'P')[0].toUpperCase()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-2">
      {/* Logo + IPT name */}
      <Link href={`/${iptSlug}`} className="flex items-center gap-3 shrink-0 mr-4">
        <Image
          src="/logos/psscm.png"
          alt="PSSCM Logo"
          width={38}
          height={38}
          className="rounded-full object-cover"
        />
        <div className="hidden sm:block">
          <p className="text-[10px] text-gray-400 leading-none font-medium tracking-wider uppercase">Portal IPT · PSSCM</p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{iptName}</p>
        </div>
      </Link>

      {/* Divider */}
      {iptLogoUrl && (
        <>
          <div className="w-px h-8 bg-gray-200 mr-2 hidden sm:block" />
          <Image
            src={iptLogoUrl}
            alt={iptName}
            width={34}
            height={34}
            className="rounded-full object-cover hidden sm:block mr-2"
          />
        </>
      )}

      {/* Nav links */}
      {user && (
        <div className="flex items-center gap-0.5">
          <NavLink href={`/${iptSlug}/dashboard`}>Dashboard</NavLink>
          <NavLink href={`/${iptSlug}/courses`}>Kursus Saya</NavLink>
          <NavLink href={`/${iptSlug}/calendar`}>Kalendar</NavLink>
          {isAdmin && (
            <>
              <NavLink href={`/${iptSlug}/admin/users`}>Pengguna</NavLink>
              <NavLink href={`/${iptSlug}/admin/courses`}>Kursus</NavLink>
              <NavLink href={`/${iptSlug}/admin/schedule`}>Jadual</NavLink>
            </>
          )}
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <Link href={`/${iptSlug}/profile`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">{initial}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user.nama ?? 'Pengguna'}
              </span>
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <form action={`/${iptSlug}/auth/signout`} method="post">
              <button type="submit" className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium">
                Log Keluar
              </button>
            </form>
          </>
        ) : (
          <Link
            href={`/${iptSlug}/login`}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Log Masuk
          </Link>
        )}
      </div>
    </nav>
  )
}
