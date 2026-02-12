import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Hero ────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0f172a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left — copy */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Profesjonalne menu
            <br />
            <span className="text-emerald-400">w 60 sekund</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Wklej tekst lub zrób zdjęcie swojego cennika.
            AI stworzy piękne menu z&nbsp;kodem&nbsp;QR.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/create"
              className="inline-block px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white
                         font-bold text-lg rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
            >
              Stwórz menu za darmo →
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Bez rejestracji. Bez karty kredytowej.
          </p>
        </div>

        {/* Right — animated mockup */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg">
          <div className="relative">
            {/* Phone frame */}
            <div className="bg-slate-800 rounded-3xl p-3 shadow-2xl border border-slate-700">
              <div className="bg-white rounded-2xl overflow-hidden">
                {/* Fake menu content with staggered fade-in */}
                <div className="p-6 space-y-4">
                  <div className="text-center pb-4 border-b border-gray-100">
                    <div className="text-xl font-bold text-slate-800 animate-[fadeSlideIn_0.6s_ease-out_both]">
                      Pizzeria Roma
                    </div>
                    <div className="text-xs text-slate-400 mt-1 animate-[fadeSlideIn_0.6s_ease-out_0.2s_both]">
                      Najlepsza pizza w mieście
                    </div>
                  </div>
                  <div className="animate-[fadeSlideIn_0.6s_ease-out_0.4s_both]">
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                      Pizza
                    </div>
                    {[
                      ['Margherita', '28 zł'],
                      ['Pepperoni', '32 zł'],
                      ['Quattro Formaggi', '35 zł'],
                    ].map(([name, price], i) => (
                      <div
                        key={name}
                        className="flex justify-between py-1.5 border-b border-dotted border-gray-100 text-sm"
                        style={{ animation: `fadeSlideIn 0.5s ease-out ${0.6 + i * 0.15}s both` }}
                      >
                        <span className="text-slate-700">{name}</span>
                        <span className="font-semibold text-emerald-600">{price}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ animation: 'fadeSlideIn 0.5s ease-out 1.1s both' }}>
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                      Napoje
                    </div>
                    {[
                      ['Lemoniada', '12 zł'],
                      ['Espresso', '8 zł'],
                    ].map(([name, price], i) => (
                      <div
                        key={name}
                        className="flex justify-between py-1.5 border-b border-dotted border-gray-100 text-sm"
                        style={{ animation: `fadeSlideIn 0.5s ease-out ${1.25 + i * 0.15}s both` }}
                      >
                        <span className="text-slate-700">{name}</span>
                        <span className="font-semibold text-emerald-600">{price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div
              className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold
                         px-3 py-1.5 rounded-full shadow-lg"
              style={{ animation: 'fadeSlideIn 0.5s ease-out 1.5s both' }}
            >
              PDF gotowy!
            </div>
            <div
              className="absolute -bottom-2 -left-2 bg-white text-slate-800 text-xs font-bold
                         px-3 py-1.5 rounded-full shadow-lg border border-gray-200"
              style={{ animation: 'fadeSlideIn 0.5s ease-out 1.8s both' }}
            >
              📱 Kod QR
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}

// ─── How It Works ────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'Wpisz lub sfotografuj',
    desc: 'Wklej swoje usługi i ceny, lub zrób zdjęcie istniejącego cennika.',
  },
  {
    num: '02',
    icon: '✨',
    title: 'AI tworzy menu',
    desc: 'Sztuczna inteligencja organizuje i formatuje Twoje menu w kilka sekund.',
  },
  {
    num: '03',
    icon: '📥',
    title: 'Pobierz i udostępnij',
    desc: 'Pobierz PDF, wydrukuj lub udostępnij kod QR klientom.',
  },
]

function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4">
          Jak to działa?
        </h2>
        <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
          Trzy proste kroki do profesjonalnego menu
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((s) => (
            <div key={s.num} className="text-center group">
              <div
                className="w-16 h-16 mx-auto mb-5 bg-emerald-50 rounded-2xl
                           flex items-center justify-center text-3xl
                           group-hover:bg-emerald-100 transition-colors"
              >
                {s.icon}
              </div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                Krok {s.num}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Examples ────────────────────────────────────────────────

const EXAMPLES = [
  {
    name: 'Pizzeria Roma',
    type: 'Restauracja',
    template: 'elegant',
    bg: 'bg-neutral-900',
    text: 'text-white',
    accent: 'text-amber-400',
    items: [
      ['Margherita', '28 zł'],
      ['Pepperoni', '32 zł'],
      ['Carbonara', '26 zł'],
    ],
  },
  {
    name: 'Salon Fryzjerski Ewa',
    type: 'Cennik usług',
    template: 'clean',
    bg: 'bg-[#FAFAF8]',
    text: 'text-slate-800',
    accent: 'text-emerald-700',
    items: [
      ['Strzyżenie damskie', '80 zł'],
      ['Koloryzacja', '150 zł'],
      ['Balayage', '250 zł'],
    ],
  },
  {
    name: 'Barber King',
    type: 'Barber shop',
    template: 'neon',
    bg: 'bg-[#0a0015]',
    text: 'text-white',
    accent: 'text-purple-400',
    items: [
      ['Fade klasyczny', '45 zł'],
      ['Broda + strzyżenie', '70 zł'],
      ['Hot towel shave', '50 zł'],
    ],
  },
]

function Examples() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4">
          Przykładowe menu
        </h2>
        <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
          Stworzone w kilka sekund z różnymi szablonami
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.name}
              className={`${ex.bg} rounded-2xl p-6 shadow-lg border border-white/10
                         hover:scale-[1.02] transition-transform`}
            >
              <div className="text-center mb-5 pb-4 border-b border-white/10">
                <div className={`text-lg font-bold ${ex.text}`}>{ex.name}</div>
                <div className={`text-xs ${ex.accent} mt-1 uppercase tracking-wider`}>
                  {ex.type}
                </div>
              </div>
              {ex.items.map(([name, price]) => (
                <div
                  key={name}
                  className="flex justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className={`text-sm ${ex.text} opacity-90`}>{name}</span>
                  <span className={`text-sm font-semibold ${ex.accent}`}>{price}</span>
                </div>
              ))}
              <div className="mt-4 text-center">
                <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">
                  szablon: {ex.template}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Darmowy',
    price: '0 zł',
    period: '',
    features: ['1 menu', 'Znak wodny MenuAI', 'Podstawowe szablony', 'Pobieranie HTML'],
    cta: 'Zacznij za darmo',
    highlight: false,
  },
  {
    name: 'Pojedynczy',
    price: '49 zł',
    period: 'jednorazowo',
    features: [
      'Bez znaku wodnego',
      'Pobieranie PDF',
      'Kod QR',
      'Strona online menu',
      'Wszystkie szablony',
    ],
    cta: 'Kup teraz',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '29 zł',
    period: '/miesiąc',
    features: [
      'Bez limitu menu',
      'Wszystkie szablony',
      'Własne logo i kolory',
      'Analityka skanów QR',
      'Priorytetowe wsparcie',
    ],
    cta: 'Subskrybuj',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section id="cennik" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4">
          Prosty cennik
        </h2>
        <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
          Zacznij za darmo — zapłać tylko gdy potrzebujesz więcej
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-[#0f172a] text-white ring-2 ring-emerald-500 shadow-xl scale-[1.03]'
                  : 'bg-gray-50 text-slate-800 border border-gray-200'
              }`}
            >
              <div className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-70">
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm opacity-60">{plan.period}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">&#10003;</span>
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/create"
                className={`mt-8 block text-center py-3 rounded-xl font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Czy mogę edytować menu po stworzeniu?',
    a: 'Tak! Po wygenerowaniu menu przez AI możesz dowolnie edytować nazwy, opisy, ceny i kategorie w naszym wbudowanym edytorze. Możesz też dodawać i usuwać pozycje.',
  },
  {
    q: 'Jak działa kod QR?',
    a: 'Po stworzeniu menu generujemy unikalny link do Twojego menu online. Kod QR prowadzi do tej strony — wystarczy go wydrukować i postawić na stoliku lub przy wejściu.',
  },
  {
    q: 'Czy mogę zmienić szablon później?',
    a: 'Tak, w każdej chwili możesz wrócić do wyboru szablonu i zmienić styl swojego menu bez utraty danych.',
  },
  {
    q: 'Jak wygląda zdjęcie cennika, które mogę przesłać?',
    a: 'Może to być zdjęcie wydrukowanego cennika, tablicy z cenami, menu na ścianie — cokolwiek. AI odczyta tekst ze zdjęcia i utworzy z niego uporządkowane menu.',
  },
  {
    q: 'Czy to działa na telefonie?',
    a: 'Tak! Zarówno kreator menu, jak i wygenerowane menu są w pełni responsywne i działają świetnie na smartfonach i tabletach.',
  },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors pr-4">
          {item.q}
        </span>
        <span
          className={`text-2xl text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-48 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-slate-500 leading-relaxed">{item.a}</p>
      </div>
    </div>
  )
}

function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-4">
          Często zadawane pytania
        </h2>
        <p className="text-slate-500 text-center mb-12">
          Masz inne pytanie? Napisz do nas!
        </p>
        <div>
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ──────────────────────────────────────────────

function CtaBanner() {
  return (
    <section className="py-20 bg-[#0f172a] text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Gotowy na profesjonalne menu?
        </h2>
        <p className="text-slate-400 mb-8 text-lg">
          Dołącz do setek firm, które już korzystają z MenuAI.
        </p>
        <Link
          to="/create"
          className="inline-block px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white
                     font-bold text-lg rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
        >
          Stwórz menu za darmo →
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-slate-800 text-slate-500 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="font-bold text-white text-sm">
            Menu<span className="text-emerald-400">AI</span>
          </span>
          <span className="text-xs">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6 text-xs">
          <a href="#" className="hover:text-white transition-colors">Kontakt</a>
          <a href="#" className="hover:text-white transition-colors">Regulamin</a>
          <a href="#" className="hover:text-white transition-colors">Polityka prywatności</a>
        </div>
      </div>
    </footer>
  )
}

// ─── Navbar ──────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <nav className="bg-[#0f172a]/95 backdrop-blur-sm text-white sticky top-0 z-40 border-b border-slate-800/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <span className="text-lg font-bold tracking-tight">
            Menu<span className="text-emerald-400">AI</span>
          </span>
        </Link>
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8 text-sm">
          <a href="#jak-to-dziala" className="text-slate-300 hover:text-white transition-colors">
            Jak to działa
          </a>
          <a href="#cennik" className="text-slate-300 hover:text-white transition-colors">
            Cennik
          </a>
          <a href="#faq" className="text-slate-300 hover:text-white transition-colors">
            FAQ
          </a>
          <Link
            to="/create"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg
                       font-semibold transition-colors text-white"
          >
            Stwórz menu
          </Link>
        </div>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden text-slate-300 hover:text-white cursor-pointer text-2xl"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-800 px-6 py-4 flex flex-col gap-4 bg-[#0f172a]">
          <a
            href="#jak-to-dziala"
            onClick={() => setMobileOpen(false)}
            className="text-slate-300 hover:text-white transition-colors"
          >
            Jak to działa
          </a>
          <a
            href="#cennik"
            onClick={() => setMobileOpen(false)}
            className="text-slate-300 hover:text-white transition-colors"
          >
            Cennik
          </a>
          <a
            href="#faq"
            onClick={() => setMobileOpen(false)}
            className="text-slate-300 hover:text-white transition-colors"
          >
            FAQ
          </a>
          <Link
            to="/create"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg
                       font-semibold transition-colors text-white text-center"
          >
            Stwórz menu
          </Link>
        </div>
      )}
    </nav>
  )
}

// ─── Page ────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Examples />
      <Pricing />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  )
}
