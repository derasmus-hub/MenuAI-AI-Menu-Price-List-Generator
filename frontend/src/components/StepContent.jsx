import { useState, useRef } from 'react'
import { parseText, parsePhoto } from '../api/client'

const PLACEHOLDER = `np.
Pizza Margherita - 28 zł
Pizza Pepperoni - 32 zł
Spaghetti Bolognese - 26 zł
Tiramisu - 18 zł`

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function formatMenuDataAsText(data) {
  if (!data?.categories) return ''
  return data.categories
    .map((cat) => {
      const header = `--- ${cat.name} ---`
      const items = cat.items
        .map((item) => {
          const desc = item.description ? ` (${item.description})` : ''
          return `${item.name}${desc} - ${item.price}`
        })
        .join('\n')
      return `${header}\n${items}`
    })
    .join('\n\n')
}

export default function StepContent({
  menuType,
  businessName,
  setBusinessName,
  rawText,
  setRawText,
  onDone,
}) {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null) // thumbnail data URL
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  function validateFile(file) {
    if (!file) return null
    if (file.size > MAX_FILE_SIZE) {
      return 'Plik jest za duży. Maksymalny rozmiar to 10MB.'
    }
    // Check MIME type; allow through if browser reports empty (HEIC sometimes does)
    if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
      return 'Nieobsługiwany format. Dozwolone: JPG, PNG, WEBP, HEIC.'
    }
    return null
  }

  async function handleGenerate() {
    if (!rawText.trim()) return
    setError('')
    setLoading(true)
    setLoadingMessage('AI analizuje Twoje menu...')
    try {
      const data = await parseText(rawText, businessName, menuType)
      onDone(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFile(file) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    // Show thumbnail
    setError('')
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    setLoading(true)
    setLoadingMessage('AI odczytuje Twoje menu ze zdjęcia...')
    try {
      const data = await parsePhoto(file, businessName, menuType)
      // Populate the textarea so user can review/edit
      setRawText(formatMenuDataAsText(data))
      onDone(data)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function clearPhoto() {
    setPreview(null)
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-lg font-medium text-slate-700">{loadingMessage}</p>
        <p className="text-sm text-slate-400 mt-1">To może potrwać kilka sekund</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Opisz swoją ofertę</h2>
      <p className="text-slate-500 mb-8 text-center">
        Wpisz pozycje menu lub prześlij zdjęcie cennika
      </p>

      {/* Business name */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nazwa firmy
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="np. Restauracja Bella Italia"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     outline-none transition-colors text-slate-800"
        />
      </div>

      {/* Text input */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Wklej lub wpisz swoje usługi i ceny
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     outline-none transition-colors resize-y text-slate-800"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!rawText.trim()}
        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300
                   text-white font-semibold rounded-xl transition-colors cursor-pointer
                   disabled:cursor-not-allowed text-lg"
      >
        ✨ Generuj menu
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400 font-medium">LUB</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Drag and drop zone */}
      {preview ? (
        /* Thumbnail after file selected */
        <div className="border-2 border-emerald-500 rounded-2xl p-6 flex items-center gap-5 bg-emerald-50/50">
          <img
            src={preview}
            alt="Podgląd"
            className="w-24 h-24 object-cover rounded-xl border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 truncate">{fileName}</p>
            <p className="text-sm text-emerald-600 mt-1">Gotowe do wysłania</p>
          </div>
          <button
            onClick={clearPhoto}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
            title="Usuń"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }`}
        >
          <span className="text-4xl block mb-3">📷</span>
          <p className="font-medium text-slate-700">
            Przeciągnij zdjęcie cennika lub kliknij aby wybrać
          </p>
          <p className="text-sm text-slate-400 mt-1">
            JPG, PNG, WEBP, HEIC &middot; maks. 10MB
          </p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.heic,image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) handleFile(file)
        }}
      />

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
