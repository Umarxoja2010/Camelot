import type { Locale, Translations } from '@/types'

export function formatMoney(value: number, locale: Locale = 'uz'): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.round(value))
  const suffix: Record<Locale, string> = { uz: "so'm", ru: 'сум', en: 'UZS' }
  return `${formatted} ${suffix[locale]}`
}

export function pickTranslation(
  translations: Translations | undefined,
  locale: Locale,
  fallback = 'ru',
): string {
  if (!translations) return ''
  return (
    translations[locale] ||
    translations[fallback as Locale] ||
    Object.values(translations)[0] ||
    ''
  )
}

export function formatDate(value: string | null, locale: Locale = 'uz'): string {
  if (!value) return '—'
  const map: Record<Locale, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }
  return new Date(value).toLocaleDateString(map[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value: string | null, locale: Locale = 'uz'): string {
  if (!value) return '—'
  const map: Record<Locale, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }
  return new Date(value).toLocaleString(map[locale], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "2026-05" -> "2026 May" ko'rinishi */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-')
  const names = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  const idx = Number(m) - 1
  return `${y} ${names[idx] ?? m}`
}
