import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Group } from '@/types'
import Loader from '@/components/Loader'

export default function TeacherGroups() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: Group[] }>('/teacher/groups')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('nav.myGroups')}</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <Link key={g.id} to={`/teacher/groups/${g.id}`} className="card p-5 transition hover:shadow-md">
              <h3 className="font-semibold text-slate-800">{g.name}</h3>
              <p className="text-sm text-slate-500">{g.course?.name}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {(g.schedule ?? []).map((s, i) => (
                  <span key={i} className="badge bg-slate-100 text-slate-600">{t(`days.${s.day}`)} {s.start}</span>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium text-brand-600">
                👥 {g.students_count ?? 0} · {t('common.details')} →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
