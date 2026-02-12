import { useRef, useEffect, useState } from 'react'

export default function MenuPreview({ html }) {
  const iframeRef = useRef(null)
  const [height, setHeight] = useState(500)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !html) return

    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(html)
    doc.close()

    // Auto-resize iframe to content height
    const resize = () => {
      try {
        const h = doc.documentElement.scrollHeight
        if (h > 100) setHeight(h)
      } catch {
        // cross-origin guard
      }
    }

    iframe.addEventListener('load', resize)
    // Fallback resize after render
    const timer = setTimeout(resize, 500)

    return () => {
      iframe.removeEventListener('load', resize)
      clearTimeout(timer)
    }
  }, [html])

  if (!html) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        Podgląd menu pojawi się tutaj
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Podgląd menu"
      className="w-full border-0"
      style={{ height: `${height}px` }}
      sandbox="allow-same-origin"
    />
  )
}
