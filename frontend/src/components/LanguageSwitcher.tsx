import { useLocale } from '@/hooks/useLocale'
import type { Locale } from '@/types'

const LANGS: { code: Locale; label: string }[] = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ру' },
  { code: 'en', label: 'En' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-sm">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-2.5 py-1 transition ${
            locale === lang.code ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
