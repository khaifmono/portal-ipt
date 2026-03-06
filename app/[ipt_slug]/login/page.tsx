import { getIptBySlug } from '@/lib/ipt'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { IptLogo } from '@/components/ui/IptLogo'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (user) redirect(`/${ipt_slug}/dashboard`)

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-8 py-7 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <IptLogo
                src="/logos/psscm.png"
                alt="PSSCM"
                size={48}
                className="rounded-full object-cover ring-2 ring-white/30"
              />
              {ipt.logo_url && (
                <>
                  <div className="w-px h-10 bg-white/30" />
                  <IptLogo
                    src={ipt.logo_url}
                    alt={ipt.name}
                    size={48}
                    className="rounded-full object-cover ring-2 ring-white/30"
                  />
                </>
              )}
            </div>
            <h1 className="text-xl font-bold text-white">Log Masuk</h1>
            <p className="text-blue-200 text-sm mt-1">{ipt.name}</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <LoginForm iptSlug={ipt_slug} />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Portal IPT · Persatuan Seni Silat Cekak Malaysia
        </p>
      </div>
    </div>
  )
}
