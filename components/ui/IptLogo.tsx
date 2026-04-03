'use client'

import Image from 'next/image'
import { useState } from 'react'

interface IptLogoProps {
  src: string | null
  alt: string
  size?: number
  className?: string
}

export function IptLogo({ src, alt, size = 40, className = '' }: IptLogoProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <Image
        src="/logos/psscm.png"
        alt={alt}
        width={size}
        height={size}
        className={className}
        onError={() => setErrored(true)}
      />
    )
  }

  // Data URLs can't use Next.js Image optimization
  if (src.startsWith('data:')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={size} height={size} className={className} />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}
