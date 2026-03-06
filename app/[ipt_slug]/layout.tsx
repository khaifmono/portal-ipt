import { notFound } from 'next/navigation'
import { getIptBySlug } from '@/lib/ipt'
import AppNavbar from '@/components/layout/AppNavbar'

export default async function IptLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)

  if (!ipt) notFound()

  return (
    <>
      <AppNavbar iptSlug={ipt_slug} iptName={ipt.name} iptLogoUrl={ipt.logo_url} />
      <div className="pt-16 min-h-screen bg-[#f0f2f5]">
        {children}
      </div>
    </>
  )
}
