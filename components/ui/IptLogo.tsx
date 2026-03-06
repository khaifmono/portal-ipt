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
  const imgSrc = (!src || errored) ? '/logos/psscm.png' : src

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}
