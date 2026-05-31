import { useTranslation } from 'react-i18next'
import type { Locale } from '@/types'

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const { i18n } = useTranslation()
  const locale = (i18n.resolvedLanguage || i18n.language || 'uz').slice(0, 2) as Locale
  return {
    locale,
    setLocale: (l: Locale) => i18n.changeLanguage(l),
  }
}
