import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Grade } from '@/types'
import { formatDate } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'

function scoreColor(percent: number | null): string {
  if (percent === null) return 'text-slate-700'
  if (percent >= 85) return 'text-green-600'
  if (percent >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export default function StudentGrades() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: Grade[] }>('/student/grades')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('grades.title')}</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {items.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-slate-700">
                  {g.title || t(`gradeType.${g.type}`)}
                  <span className="ml-2 badge bg-slate-100 text-slate-500">{t(`gradeType.${g.type}`)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {g.group?.course?.name ?? g.group?.name} · {formatDate(g.date, locale)}
                </div>
              </div>
              <div className={`text-right font-bold ${scoreColor(g.percent)}`}>
                {g.score}/{g.max_score}
                <div className="text-xs font-normal">{g.percent}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
