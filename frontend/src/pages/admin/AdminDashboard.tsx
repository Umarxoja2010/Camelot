import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { AdminDashboard as Stats } from '@/types'
import { formatMoney, formatMonth, formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import { PaymentStatusBadge } from '@/components/Badges'
import Loader from '@/components/Loader'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: Stats }>('/admin/dashboard')
      .then((r) => setStats(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!stats) return null

  const cards = [
    { label: t('dashboard.students'), value: stats.totals.students, icon: '🎓', color: 'bg-blue-100' },
    { label: t('dashboard.teachers'), value: stats.totals.teachers, icon: '👨‍🏫', color: 'bg-violet-100' },
    { label: t('dashboard.parents'), value: stats.totals.parents, icon: '👪', color: 'bg-pink-100' },
    { label: t('dashboard.groups'), value: stats.totals.groups, icon: '👥', color: 'bg-amber-100' },
    { label: t('dashboard.courses'), value: stats.totals.courses, icon: '📚', color: 'bg-emerald-100' },
    { label: t('dashboard.pendingPayments'), value: stats.totals.pending_payments, icon: '⏳', color: 'bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-xl ${c.color}`}>
              {c.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800">{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 card flex items-center justify-between bg-brand-600 p-6 text-white">
        <div>
          <div className="text-sm text-brand-100">{t('dashboard.revenue')}</div>
          <div className="text-3xl font-bold">{formatMoney(stats.totals.confirmed_revenue, locale)}</div>
        </div>
        <span className="text-4xl">💰</span>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-4 font-semibold text-slate-800">{t('dashboard.recentPayments')}</h2>
        {stats.recent_payments.length === 0 ? (
          <p className="text-sm text-slate-400">{t('common.noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="th">{t('payments.student')}</th>
                  <th className="th">{t('payments.month')}</th>
                  <th className="th">{t('payments.amount')}</th>
                  <th className="th">{t('common.status')}</th>
                  <th className="th">{t('common.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_payments.map((p) => (
                  <tr key={p.id}>
                    <td className="td">{p.student_name ?? '—'}</td>
                    <td className="td">{formatMonth(p.month)}</td>
                    <td className="td font-medium">{formatMoney(p.amount, locale)}</td>
                    <td className="td"><PaymentStatusBadge status={p.status} /></td>
                    <td className="td text-slate-400">{formatDateTime(p.created_at, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
