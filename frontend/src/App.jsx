import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SuccessPage from './pages/SuccessPage'
import MenuWizard from './components/MenuWizard'

function CreatePage() {
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
          <p className="text-sm text-slate-400 hidden sm:block">
            Profesjonalne menu w kilka sekund
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <MenuWizard />
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-500 text-center text-xs py-4">
        MenuAI &copy; {new Date().getFullYear()} &mdash; Wygenerowano z pomocą AI
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
