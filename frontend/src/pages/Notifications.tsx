import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { AppNotification } from '@/types'
import { formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'

const ICONS: Record<string, string> = {
  payment: '💳',
  attendance: '✅',
  grade: '📝',
  announcement: '📢',
  info: 'ℹ️',
}

export default function Notifications() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api
      .get<{ data: AppNotification[] }>('/notifications')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const markAllRead = async () => {
    await api.post('/notifications/read-all')
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{t('notifications.title')}</h1>
        {items.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="btn-outline">
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('notifications.empty')}</div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`card flex gap-3 p-4 ${n.is_read ? '' : 'border-l-4 border-l-brand-500'}`}>
              <span className="text-xl">{ICONS[n.type] ?? 'ℹ️'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-slate-800">{n.title}</h3>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateTime(n.created_at, locale)}</span>
                </div>
                {n.body && <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
