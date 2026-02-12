import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { API, getMenuStatus } from '../api/client'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    // Poll for payment confirmation (webhook might be slightly delayed)
    let attempts = 0
    const maxAttempts = 10

    function checkStatus() {
      getMenuStatus(slug)
        .then((data) => {
          setStatus(data)
          if (!data.is_paid && attempts < maxAttempts) {
            attempts++
            setTimeout(checkStatus, 2000)
          } else {
            setLoading(false)
          }
        })
        .catch(() => {
          setLoading(false)
        })
    }

    checkStatus()
  }, [slug])

  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Brak danych menu.</p>
          <Link to="/create" className="text-emerald-600 underline hover:text-emerald-700">
            Stworz nowe menu
          </Link>
        </div>
      </div>
    )
  }

  const menuUrl = `${API}/menu/${slug}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#0f172a] text-white px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-tight">
              Menu<span className="text-emerald-400">AI</span>
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {loading ? (
            <>
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Potwierdzanie platnosci...</h2>
              <p className="text-slate-500 text-sm">To moze potrwac kilka sekund.</p>
            </>
          ) : status?.is_paid ? (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Dziekujemy za zakup!</h2>
              <p className="text-slate-500 mb-6">
                Twoje menu <strong>{status.business_name}</strong> jest teraz bez znaku wodnego.
              </p>
              <div className="space-y-3">
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-6 py-3 bg-emerald-500 hover:bg-emerald-600
                             text-white font-semibold rounded-xl transition-colors"
                >
                  Zobacz swoje menu
                </a>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(menuUrl)
                  }}
                  className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200
                             text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  🔗 Kopiuj link
                </button>
                <Link
                  to="/create"
                  className="block px-6 py-3 border-2 border-gray-300 hover:border-gray-400
                             text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Stworz kolejne menu
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Oczekiwanie na potwierdzenie</h2>
              <p className="text-slate-500 mb-6">
                Platnosc jest w trakcie przetwarzania. Twoje menu zostanie zaktualizowane automatycznie.
              </p>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600
                           text-white font-semibold rounded-xl transition-colors"
              >
                Zobacz swoje menu
              </a>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-500 text-center text-xs py-4">
        MenuAI &copy; {new Date().getFullYear()} &mdash; Wygenerowano z pomoca AI
      </footer>
    </div>
  )
}
