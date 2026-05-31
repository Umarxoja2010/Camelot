import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Group } from '@/types'
import Loader from '@/components/Loader'

export default function StudentGroups() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: Group[] }>('/student/groups')
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
            <div key={g.id} className="card p-5">
              <h3 className="font-semibold text-slate-800">{g.course?.name}</h3>
              <p className="text-sm text-slate-500">{g.name}{g.course?.level ? ` · ${g.course.level}` : ''}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                <div>👨‍🏫 {g.teacher?.name ?? t('groups.noTeacher')}</div>
                {g.room && <div>🚪 {g.room}</div>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-100 pt-3">
                {(g.schedule ?? []).map((s, i) => (
                  <span key={i} className="badge bg-brand-100 text-brand-700">{t(`days.${s.day}`)} {s.start}-{s.end}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
