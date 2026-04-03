'use client'

import { useState } from 'react'
import MaterialViewer from './MaterialViewer'
import type { MaterialType } from '@/lib/types'

interface MaterialAccordionProps {
  id: string
  title: string
  description?: string | null
  type: MaterialType
  filePath?: string | null
  url?: string | null
  icon: string
  typeBadge: string
  typeLabel: string
  href: string
  isFile: boolean
  isStaff: boolean
  deleteAction: string
}

export default function MaterialAccordion({
  id,
  title,
  description,
  type,
  filePath,
  url,
  icon,
  typeBadge,
  typeLabel,
  href,
  isFile,
  isStaff,
  deleteAction,
}: MaterialAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Determine if this material has viewable content
  const hasViewer =
    type === 'youtube' ||
    type === 'google_drive' ||
    type === 'link' ||
    (type === 'file' && filePath)

  return (
    <div className="rounded-lg border border-gray-100 hover:border-emerald-200 transition-all overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3.5 group hover:bg-emerald-50/50 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-base">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={href}
            target={isFile ? '_self' : '_blank'}
            rel={isFile ? undefined : 'noopener noreferrer'}
            className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors"
          >
            {title}
          </a>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{description}</p>
          )}
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadge}`}>
          {typeLabel}
        </span>
        {hasViewer && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors shrink-0"
            title={isOpen ? 'Tutup paparan' : 'Papar kandungan'}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isOpen ? 'Tutup' : 'Papar'}
          </button>
        )}
        {isStaff && (
          <form action={deleteAction} method="POST">
            <button
              type="submit"
              className="text-gray-300 hover:text-red-500 transition-colors"
              title="Padam"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </form>
        )}
      </div>

      {/* Collapsible content area using CSS grid for smooth height transition */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {isOpen && (
              <MaterialViewer
                type={type}
                title={title}
                filePath={filePath}
                url={url}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
