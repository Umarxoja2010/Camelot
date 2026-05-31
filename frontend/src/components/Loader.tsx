import { useTranslation } from 'react-i18next'

export default function Loader({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    </div>
  )
}
