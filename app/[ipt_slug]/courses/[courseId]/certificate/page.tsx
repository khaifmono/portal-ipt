import { auth } from '@/auth'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById, getCourseProgress } from '@/lib/courses'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PrintButton } from './PrintButton'

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const progress = await getCourseProgress(courseId, user.id)

  const completionDate = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Not yet completed
  if (progress < 100) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Anda belum melengkapkan kursus ini</h1>
          <p className="text-gray-500 mb-4">
            Kemajuan semasa anda adalah <span className="font-bold text-gray-900">{progress}%</span>.
            Sila lengkapkan semua tugasan dan kuiz untuk mendapatkan sijil.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 max-w-xs mx-auto">
            <div
              className="bg-amber-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Link
            href={`/${ipt_slug}/courses/${courseId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Kursus
          </Link>
        </div>
      </div>
    )
  }

  // Completed — show certificate
  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, .no-print { display: none !important; }
          .certificate-wrapper { padding: 0 !important; margin: 0 !important; }
          .certificate-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        }
      `}</style>

      <div className="certificate-wrapper max-w-4xl mx-auto px-4 py-8">
        {/* Back link & print button — hidden on print */}
        <div className="no-print flex items-center justify-between mb-6">
          <Link
            href={`/${ipt_slug}/courses/${courseId}`}
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Kursus
          </Link>
          <PrintButton />
        </div>

        {/* Certificate */}
        <div className="certificate-card bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Decorative border */}
          <div className="p-2">
            <div className="border-4 border-double border-amber-600 rounded-lg p-8 sm:p-12 relative">
              {/* Corner decorations */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/logos/psscm.png"
                  alt="PSSCM"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              </div>

              {/* Organization name */}
              <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-500 font-medium mb-1">
                Persatuan Seni Silat Cekak Malaysia
              </p>
              <p className="text-center text-xs tracking-[0.2em] uppercase text-gray-400 mb-6">
                Portal IPT
              </p>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-16 bg-amber-300" />
                <div className="w-2 h-2 rotate-45 bg-amber-400" />
                <div className="h-px w-16 bg-amber-300" />
              </div>

              {/* Title */}
              <h1 className="text-center text-3xl sm:text-4xl font-bold text-amber-800 tracking-wider mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                SIJIL PENYERTAAN
              </h1>
              <p className="text-center text-xs text-gray-400 italic mb-8">
                Certificate of Participation
              </p>

              {/* Body text */}
              <p className="text-center text-sm text-gray-600 mb-3">
                Dengan ini disahkan bahawa
              </p>

              {/* Student name */}
              <p className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                {user.nama}
              </p>

              {/* Divider under name */}
              <div className="flex justify-center mb-4">
                <div className="h-px w-48 bg-gray-300" />
              </div>

              <p className="text-center text-sm text-gray-600 mb-2">
                telah berjaya melengkapkan kursus
              </p>

              {/* Course title */}
              <p className="text-center text-lg sm:text-xl font-bold text-blue-900 mb-2">
                {course.title}
              </p>

              {/* IPT name */}
              <p className="text-center text-sm text-gray-600 mb-6">
                di bawah <span className="font-semibold">{ipt.name}</span>
              </p>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-16 bg-amber-300" />
                <div className="w-2 h-2 rotate-45 bg-amber-400" />
                <div className="h-px w-16 bg-amber-300" />
              </div>

              {/* Date */}
              <p className="text-center text-sm text-gray-500">
                Tarikh: <span className="font-medium text-gray-700">{completionDate}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
