import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Homework } from '@/types'
import { formatDate } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'

export default function StudentHomework() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: Homework[] }>('/student/homework')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('homework.title')}</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
      ) : (
        <div className="space-y-3">
          {items.map((h) => (
            <div key={h.id} className="card p-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="badge bg-brand-100 text-brand-700">{h.group?.course?.name ?? h.group?.name}</span>
                {h.due_date && (
                  <span className="badge bg-amber-100 text-amber-700">⏰ {formatDate(h.due_date, locale)}</span>
                )}
              </div>
              <h3 className="font-semibold text-slate-800">{h.title}</h3>
              {h.description && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{h.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
