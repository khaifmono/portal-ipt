import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

// Routes that require authentication per role
const PROTECTED_ROUTES: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/[^/]+\/admin/, roles: ['admin', 'super_admin'] },
  { pattern: /^\/[^/]+\/dashboard/, roles: ['admin', 'super_admin', 'tenaga_pengajar', 'ahli'] },
  { pattern: /^\/[^/]+\/courses/, roles: ['admin', 'super_admin', 'tenaga_pengajar', 'ahli'] },
]

export async function proxy(request: NextRequest) {
  const session = await auth()
  const path = request.nextUrl.pathname

  const protectedRoute = PROTECTED_ROUTES.find((r) => r.pattern.test(path))
  if (!protectedRoute) return NextResponse.next()

  if (!session?.user) {
    const iptSlug = path.split('/')[1]
    const loginUrl = new URL(`/${iptSlug}/login`, request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = session.user.role
  if (userRole && !protectedRoute.roles.includes(userRole)) {
    const iptSlug = path.split('/')[1]
    return NextResponse.redirect(new URL(`/${iptSlug}/dashboard`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
