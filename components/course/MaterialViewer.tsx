'use client'

import type { MaterialType } from '@/lib/types'

interface MaterialViewerProps {
  type: MaterialType
  title: string
  filePath?: string | null
  url?: string | null
}

function extractYouTubeId(url: string): string | null {
  // Handle youtube.com/embed/{id}
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]

  // Handle youtube.com/watch?v={id}
  const watchMatch = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]

  // Handle youtu.be/{id}
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]

  return null
}

function extractGoogleDriveId(url: string): string | null {
  // Handle /file/d/{id}/... or /open?id={id}
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]

  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return openMatch[1]

  return null
}

function getFileExtension(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext ?? ''
}

export default function MaterialViewer({ type, title, filePath, url }: MaterialViewerProps) {
  // YouTube embed
  if (type === 'youtube' && url) {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      return (
        <div className="mt-3">
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )
    }
    // Fallback if ID can't be extracted
    return (
      <div className="mt-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Tonton di YouTube
        </a>
      </div>
    )
  }

  // Google Drive embed
  if (type === 'google_drive' && url) {
    const fileId = extractGoogleDriveId(url)
    if (fileId) {
      return (
        <div className="mt-3">
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src={`https://drive.google.com/file/d/${fileId}/preview`}
              title={title}
              className="w-full h-full"
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )
    }
    // Fallback if ID can't be extracted
    return (
      <div className="mt-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 hover:bg-yellow-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Buka di Google Drive
        </a>
      </div>
    )
  }

  // External link
  if (type === 'link' && url) {
    return (
      <div className="mt-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors group/link"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 group-hover/link:text-blue-700 transition-colors truncate">{title}</p>
            <p className="text-xs text-gray-400 truncate">{url}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    )
  }

  // File types
  if (type === 'file' && filePath) {
    const ext = getFileExtension(filePath)
    const fileUrl = `/api/files/${filePath}`

    // PDF viewer
    if (ext === 'pdf') {
      return (
        <div className="mt-3 space-y-2">
          <iframe
            src={fileUrl}
            title={title}
            className="w-full h-[600px] rounded-lg border border-gray-200"
          />
          <a
            href={fileUrl}
            download
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Muat turun PDF
          </a>
        </div>
      )
    }

    // Image viewer
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl}
            alt={title}
            className="max-w-full rounded-lg border border-gray-200"
          />
        </div>
      )
    }

    // Other files — download button
    const fileName = filePath.split('/').pop() ?? filePath
    return (
      <div className="mt-3">
        <a
          href={fileUrl}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {fileName}
        </a>
      </div>
    )
  }

  // Fallback — nothing to show
  return null
}
