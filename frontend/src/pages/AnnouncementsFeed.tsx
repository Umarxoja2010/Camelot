import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { Announcement } from '@/types'
import { formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'

export default function AnnouncementsFeed() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: Announcement[] }>('/announcements')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('announcements.feed')}</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('announcements.empty')}</div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <article key={a.id} className="card p-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="badge bg-brand-100 text-brand-700">{t(`audience.${a.audience}`)}</span>
                <span className="text-xs text-slate-400">{formatDateTime(a.created_at, locale)}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">{a.title}</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{a.body}</p>
              {a.publisher && (
                <p className="mt-2 text-xs text-slate-400">
                  {t('announcements.by')}: {a.publisher.name}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
