import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { getSessionById, markAttendance } from '@/lib/attendance'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MarkAttendanceViaQrPage({
  params,
  searchParams,
}: {
  params: Promise<{ ipt_slug: string }>
  searchParams: Promise<{ token?: string; session?: string }>
}) {
  const { ipt_slug } = await params
  const { token, session: sessionId } = await searchParams

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const authSession = await auth()
  const user = authSession?.user

  // Not logged in — redirect to login with return URL
  if (!user) {
    const returnUrl = `/${ipt_slug}/attendance/mark?token=${token}&session=${sessionId}`
    redirect(`/${ipt_slug}/login?callbackUrl=${encodeURIComponent(returnUrl)}`)
  }

  // Validate parameters
  if (!token || !sessionId) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Pautan Tidak Sah</h1>
          <p className="text-gray-500 text-sm">
            Pautan kod QR ini tidak sah. Sila imbas semula kod QR daripada pengajar anda.
          </p>
          <Link
            href={`/${ipt_slug}/dashboard`}
            className="mt-6 inline-block text-sm text-blue-600 hover:underline"
          >
            Kembali ke Papan Pemuka
          </Link>
        </div>
      </main>
    )
  }

  // Validate session and token
  const attendanceSession = await getSessionById(sessionId)

  if (!attendanceSession || attendanceSession.qr_token !== token) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Kod QR Tidak Sah</h1>
          <p className="text-gray-500 text-sm">
            Kod QR ini sudah tamat tempoh atau tidak sah. Sila minta pengajar anda menjana kod QR baru.
          </p>
          <Link
            href={`/${ipt_slug}/dashboard`}
            className="mt-6 inline-block text-sm text-blue-600 hover:underline"
          >
            Kembali ke Papan Pemuka
          </Link>
        </div>
      </main>
    )
  }

  // Check IPT matches
  if (attendanceSession.ipt_id !== ipt.id) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-500 text-sm">
            Sesi ini bukan untuk IPT anda.
          </p>
          <Link
            href={`/${ipt_slug}/dashboard`}
            className="mt-6 inline-block text-sm text-blue-600 hover:underline"
          >
            Kembali ke Papan Pemuka
          </Link>
        </div>
      </main>
    )
  }

  // Mark attendance
  let success = true
  let errorMessage = ''

  try {
    await markAttendance({
      sessionId,
      userId: user.id,
      iptId: ipt.id,
      status: 'present',
    })
  } catch (err) {
    // If already marked, still show success
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('sudah wujud')) {
      success = true
    } else {
      success = false
      errorMessage = msg || 'Ralat tidak diketahui.'
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Kehadiran Direkodkan!</h1>
          <p className="text-gray-500 text-sm">
            Kehadiran anda telah direkodkan untuk sesi <strong>{attendanceSession.title}</strong>.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(attendanceSession.session_date).toLocaleDateString('ms-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <Link
            href={`/${ipt_slug}/dashboard`}
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Kembali ke Papan Pemuka
          </Link>
        </div>
      </main>
    )
  }

  // Error state
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ralat</h1>
        <p className="text-gray-500 text-sm">{errorMessage}</p>
        <Link
          href={`/${ipt_slug}/dashboard`}
          className="mt-6 inline-block text-sm text-blue-600 hover:underline"
        >
          Kembali ke Papan Pemuka
        </Link>
      </div>
    </main>
  )
}
