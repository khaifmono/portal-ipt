import { notFound } from 'next/navigation'
import { getIptBySlug } from '@/lib/ipt'

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

  return <>{children}</>
}
