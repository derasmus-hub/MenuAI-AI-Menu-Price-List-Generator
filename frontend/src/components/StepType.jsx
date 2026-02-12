const TYPES = [
  {
    id: 'restaurant',
    icon: '🍕',
    label: 'Menu Restauracji',
    desc: 'Klasyczne menu z kategoriami dań',
  },
  {
    id: 'services',
    icon: '✂️',
    label: 'Cennik Usług',
    desc: 'Cennik dla salonu, warsztatu itp.',
  },
  {
    id: 'drinks',
    icon: '🍸',
    label: 'Karta Drinków',
    desc: 'Menu z koktajlami i napojami',
  },
]

export default function StepType({ onSelect }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Co tworzysz?</h2>
      <p className="text-slate-500 mb-8">Wybierz typ menu, które chcesz wygenerować</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="group bg-white border-2 border-gray-200 rounded-2xl p-8
                       hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">
              {t.icon}
            </span>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{t.label}</h3>
            <p className="text-sm text-slate-500">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
