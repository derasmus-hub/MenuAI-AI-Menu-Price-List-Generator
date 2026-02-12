import { useState, useEffect, useCallback } from 'react'
import { getPreview, downloadPdf, publishMenu, getQrCode, createCheckout } from '../api/client'
import MenuPreview from './MenuPreview'

const TEMPLATES = [
  { id: 'clean', label: 'Clean', color: 'bg-white border-gray-200', icon: '⬜' },
  { id: 'elegant', label: 'Elegant', color: 'bg-neutral-900 border-neutral-700', icon: '🖤' },
  { id: 'neon', label: 'Neon', color: 'bg-purple-950 border-purple-500', icon: '💜' },
  { id: 'rustic', label: 'Rustic', color: 'bg-amber-50 border-amber-400', icon: '🪵' },
  { id: 'pastel', label: 'Pastel', color: 'bg-pink-50 border-pink-300', icon: '🩷' },
]

export default function StepStyle({ menuData, template, setTemplate, onEditData }) {
  const [previewHtml, setPreviewHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState(null)
  const [publishedSlug, setPublishedSlug] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [qrBlobUrl, setQrBlobUrl] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Load preview when menuData or template changes
  useEffect(() => {
    if (!menuData) return
    setLoading(true)
    getPreview(menuData, template)
      .then(setPreviewHtml)
      .catch(() => setPreviewHtml('<p style="color:red;padding:2rem;">Błąd ładowania podglądu</p>'))
      .finally(() => setLoading(false))
  }, [menuData, template])

  // Reset published state when template changes
  useEffect(() => {
    setPublishedUrl(null)
    setPublishedSlug(null)
    setIsPaid(false)
    setQrBlobUrl(null)
  }, [template])

  const showToast = useCallback((message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function ensurePublished() {
    if (publishedUrl && publishedSlug) {
      return { url: publishedUrl, slug: publishedSlug }
    }
    const result = await publishMenu(menuData, template)
    setPublishedUrl(result.url)
    setPublishedSlug(result.slug)
    return result
  }

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      await downloadPdf(menuData, template)
      showToast('Pobieranie rozpoczęte!')
    } catch {
      showToast('Błąd pobierania. Spróbuj ponownie.')
    } finally {
      setDownloading(false)
    }
  }

  async function handlePremiumDownload() {
    setCheckingOut(true)
    try {
      const { slug } = await ensurePublished()

      // Try to create checkout
      const result = await createCheckout(slug)

      if (result.already_paid) {
        setIsPaid(true)
        // Already paid — download directly
        await downloadPdf(menuData, template)
        showToast('Pobieranie rozpoczęte!')
      } else if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url
      }
    } catch (err) {
      if (err.message.includes('503') || err.message.includes('skonfigurowane')) {
        showToast('Płatności nie są jeszcze skonfigurowane. Użyj darmowego pobierania.')
      } else {
        showToast('Błąd płatności. Spróbuj ponownie.')
      }
    } finally {
      setCheckingOut(false)
    }
  }

  async function handlePublishAndQr() {
    setPublishing(true)
    try {
      const { url } = await ensurePublished()
      const qrBlob = await getQrCode(url)
      setQrBlobUrl(qrBlob)
      setShowQrModal(true)
    } catch {
      showToast('Błąd generowania kodu QR.')
    } finally {
      setPublishing(false)
    }
  }

  async function handleCopyLink() {
    try {
      const { url } = await ensurePublished()
      await navigator.clipboard.writeText(url)
      showToast('Menu opublikowane! Link skopiowany.')
    } catch {
      showToast('Nie udało się skopiować linku.')
    }
  }

  function closeQrModal() {
    setShowQrModal(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        Wybierz styl i pobierz
      </h2>
      <p className="text-slate-500 mb-8 text-center">
        Kliknij szablon, aby zobaczyć podgląd
      </p>

      {/* Template selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer
              ${
                template === t.id
                  ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
          >
            <div
              className={`w-16 h-20 rounded-lg border ${t.color} flex items-center justify-center text-2xl`}
            >
              {t.icon}
            </div>
            <span className="text-sm font-medium text-slate-700">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MenuPreview html={previewHtml} />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50
                     text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {downloading ? 'Pobieranie...' : '📥 Pobierz PDF (ze znakiem wodnym)'}
        </button>
        <button
          onClick={handlePremiumDownload}
          disabled={checkingOut}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300
                     text-white font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {checkingOut ? 'Przekierowanie...' : isPaid ? '📥 Pobierz PDF (premium)' : '💎 PDF bez znaku wodnego — 49 zł'}
        </button>
        <button
          onClick={handlePublishAndQr}
          disabled={publishing}
          className="px-6 py-3 bg-[#0f172a] hover:bg-slate-800 disabled:bg-slate-600
                     text-white font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {publishing ? 'Publikowanie...' : '📱 Kod QR'}
        </button>
        <button
          onClick={handleCopyLink}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200
                     text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
        >
          🔗 Kopiuj link
        </button>
        <button
          onClick={onEditData}
          className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400
                     text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
        >
          ✏️ Edytuj dane
        </button>
      </div>

      {/* Published URL indicator */}
      {publishedUrl && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">
            Twoje menu:{' '}
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 underline hover:text-emerald-700"
            >
              {publishedUrl}
            </a>
          </p>
        </div>
      )}

      {/* QR modal */}
      {showQrModal && qrBlobUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeQrModal}
        >
          <div
            className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">Kod QR Twojego menu</h3>
            <p className="text-sm text-slate-500 mb-4">Zeskanuj lub pobierz</p>
            <img src={qrBlobUrl} alt="QR Code" className="mx-auto w-48 h-48 mb-4" />
            {publishedUrl && (
              <p className="text-xs text-slate-400 mb-4 break-all">{publishedUrl}</p>
            )}
            <div className="flex gap-3 justify-center">
              <a
                href={qrBlobUrl}
                download="menu-qr.png"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white
                           text-sm font-semibold rounded-lg transition-colors"
              >
                Pobierz QR
              </a>
              <button
                onClick={async () => {
                  if (publishedUrl) {
                    await navigator.clipboard.writeText(publishedUrl)
                    showToast('Link skopiowany!')
                  }
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700
                           text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kopiuj link
              </button>
              <button
                onClick={closeQrModal}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                        bg-[#0f172a] text-white px-6 py-3 rounded-xl shadow-lg
                        text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}
    </div>
  )
}
