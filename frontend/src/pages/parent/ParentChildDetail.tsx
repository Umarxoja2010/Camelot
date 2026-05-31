import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Attendance, Grade, Group } from '@/types'
import { formatDate } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import { AttendanceBadge } from '@/components/Badges'
import Loader from '@/components/Loader'

type Tab = 'groups' | 'attendance' | 'grades'

export default function ParentChildDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [tab, setTab] = useState<Tab>('groups')
  const [groups, setGroups] = useState<Group[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const base = `/parent/children/${id}`
    Promise.all([
      api.get<{ data: Group[] }>(`${base}/groups`),
      api.get<{ data: Attendance[] }>(`${base}/attendance`),
      api.get<{ data: Grade[] }>(`${base}/grades`),
    ])
      .then(([g, a, gr]) => {
        setGroups(g.data.data)
        setAttendance(a.data.data)
        setGrades(gr.data.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'groups', label: t('child.groups') },
    { key: 'attendance', label: t('child.attendance') },
    { key: 'grades', label: t('child.grades') },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/parent" className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-600">
        ← {t('nav.children')}
      </Link>

      <div className="mb-4 inline-flex flex-wrap rounded-lg border border-slate-300 bg-white p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === tb.key ? 'bg-brand-600 text-white' : 'text-slate-600'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : tab === 'groups' ? (
        groups.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id} className="card p-5">
                <h3 className="font-semibold text-slate-800">{g.course?.name}</h3>
                <p className="text-sm text-slate-500">{g.name} · 👨‍🏫 {g.teacher?.name ?? '—'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(g.schedule ?? []).map((s, i) => (
                    <span key={i} className="badge bg-slate-100 text-slate-600">{t(`days.${s.day}`)} {s.start}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'attendance' ? (
        attendance.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {attendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-slate-700">{a.group?.course?.name ?? a.group?.name}</div>
                  <div className="text-xs text-slate-400">{formatDate(a.date, locale)}</div>
                </div>
                <AttendanceBadge status={a.status} />
              </div>
            ))}
          </div>
        )
      ) : grades.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {grades.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-slate-700">{g.title || t(`gradeType.${g.type}`)}</div>
                <div className="text-xs text-slate-400">{g.group?.course?.name ?? g.group?.name} · {formatDate(g.date, locale)}</div>
              </div>
              <div className="text-right font-bold text-slate-700">
                {g.score}/{g.max_score}
                <div className="text-xs font-normal text-slate-400">{g.percent}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
