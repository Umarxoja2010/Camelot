import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Attendance } from '@/types'
import { formatDate } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import { AttendanceBadge } from '@/components/Badges'
import Loader from '@/components/Loader'

export default function StudentAttendance() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: Attendance[] }>('/student/attendance')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('attendance.title')}</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {items.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-slate-700">{a.group?.course?.name ?? a.group?.name}</div>
                <div className="text-xs text-slate-400">{formatDate(a.date, locale)}</div>
              </div>
              <AttendanceBadge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
