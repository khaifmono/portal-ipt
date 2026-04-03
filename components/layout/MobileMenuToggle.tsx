'use client'

import { useState } from 'react'

export function MobileMenuToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button - visible only on mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation menu"
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown panel */}
      {open && (
        <div
          className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-lg z-40 px-4 py-3"
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col gap-1">
            {children}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/20 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
