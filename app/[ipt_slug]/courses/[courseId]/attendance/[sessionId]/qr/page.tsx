import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getSessionById } from '@/lib/attendance'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { GenerateQrButton } from './GenerateQrButton'

export default async function QrPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; sessionId: string }>
}) {
  const { ipt_slug, courseId, sessionId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(user.role)) {
    redirect(`/${ipt_slug}/courses/${courseId}/attendance`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const attendanceSession = await getSessionById(sessionId)
  if (!attendanceSession || attendanceSession.course_id !== courseId) notFound()

  const qrToken = attendanceSession.qr_token

  // Build full URL for the QR code
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const baseUrl = `${protocol}://${host}`

  const markPath = `/${ipt_slug}/attendance/mark?token=${qrToken}&session=${sessionId}`
  const fullMarkUrl = qrToken ? `${baseUrl}${markPath}` : null

  const formattedDate = new Date(attendanceSession.session_date).toLocaleDateString('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/attendance/${sessionId}`}
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          &larr; Kembali ke Sesi
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Kod QR Kehadiran</h1>
          <p className="text-gray-500 text-sm mb-1">{attendanceSession.title}</p>
          <p className="text-gray-400 text-xs mb-6">{formattedDate}</p>

          {qrToken && fullMarkUrl ? (
            <>
              {/* QR Code image from external API */}
              <div className="flex justify-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullMarkUrl)}`}
                  alt="Kod QR Kehadiran"
                  width={300}
                  height={300}
                  className="rounded-lg border border-gray-200"
                />
              </div>

              {/* URL for manual entry */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">URL untuk imbasan manual:</p>
                <p className="text-sm text-blue-600 font-mono break-all">{fullMarkUrl}</p>
              </div>

              {/* Regenerate button */}
              <GenerateQrButton
                iptSlug={ipt_slug}
                courseId={courseId}
                sessionId={sessionId}
                hasExisting={true}
              />

              <p className="text-xs text-gray-400 mt-4">
                Paparkan kod QR ini pada skrin untuk pelajar mengimbas dengan kamera telefon mereka.
              </p>
            </>
          ) : (
            <>
              <div className="py-12">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  Tiada kod QR dijana untuk sesi ini lagi.
                </p>
              </div>

              <GenerateQrButton
                iptSlug={ipt_slug}
                courseId={courseId}
                sessionId={sessionId}
                hasExisting={false}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
