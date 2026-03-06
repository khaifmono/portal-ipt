'use client'

import { useState, useEffect, useCallback } from 'react'

interface QuizTimerProps {
  totalSeconds: number
  onExpire: () => void
}

export default function QuizTimer({ totalSeconds, onExpire }: QuizTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const [expired, setExpired] = useState(false)

  const handleExpire = useCallback(() => {
    if (!expired) {
      setExpired(true)
      onExpire()
    }
  }, [expired, onExpire])

  useEffect(() => {
    if (remaining <= 0) {
      handleExpire()
      return
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remaining, handleExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isLow = remaining <= 60

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
        isLow
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}
    >
      <span>Masa:</span>
      <span className="font-mono">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
