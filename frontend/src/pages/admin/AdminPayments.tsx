import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Payment, PaymentStatus, Paginated } from '@/types'
import { formatMoney, formatMonth, formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import { PaymentStatusBadge } from '@/components/Badges'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'

const STATUSES: (PaymentStatus | '')[] = ['', 'pending', 'confirmed', 'rejected']

export default function AdminPayments() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Payment[]>([])
  const [meta, setMeta] = useState<Paginated<Payment>['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<PaymentStatus | ''>('pending')
  const [preview, setPreview] = useState<Payment | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<Paginated<Payment>>('/admin/payments', { params: { page, status: status || undefined } })
      .then((r) => { setItems(r.data.data); setMeta(r.data.meta) })
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(() => { load() }, [load])

  const review = async (p: Payment, action: 'confirm' | 'reject') => {
    setBusy(true)
    try {
      await api.patch(`/admin/payments/${p.id}/${action}`)
      setPreview(null)
      load()
    } catch (err) {
      alert(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('payments.title')}</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {s ? t(`paymentStatus.${s}`) : t('common.all')}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="th">{t('payments.student')}</th>
                <th className="th">{t('payments.month')}</th>
                <th className="th">{t('payments.amount')}</th>
                <th className="th">{t('common.status')}</th>
                <th className="th">{t('common.date')}</th>
                <th className="th text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-slate-800">{p.student?.name ?? '—'}</td>
                  <td className="td">{formatMonth(p.month)}</td>
                  <td className="td font-medium">{formatMoney(p.amount, locale)}</td>
                  <td className="td"><PaymentStatusBadge status={p.status} /></td>
                  <td className="td text-slate-400">{formatDateTime(p.created_at, locale)}</td>
                  <td className="td text-right">
                    <button onClick={() => setPreview(p)} className="text-brand-600 hover:underline">{t('common.view')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onChange={setPage} />}

      <Modal
        open={!!preview}
        title={preview ? `${preview.student?.name ?? ''} · ${formatMonth(preview.month)}` : ''}
        onClose={() => setPreview(null)}
        footer={
          preview?.status === 'pending' ? (
            <>
              <button onClick={() => review(preview, 'reject')} disabled={busy} className="btn-danger">{t('payments.reject')}</button>
              <button onClick={() => review(preview, 'confirm')} disabled={busy} className="btn-success">{t('payments.confirm')}</button>
            </>
          ) : (
            <button onClick={() => setPreview(null)} className="btn-outline">{t('common.close')}</button>
          )
        }
      >
        {preview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('payments.amount')}</span>
              <span className="font-semibold">{formatMoney(preview.amount, locale)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('common.status')}</span>
              <PaymentStatusBadge status={preview.status} />
            </div>
            {preview.note && <p className="rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{preview.note}</p>}
            <div>
              <div className="mb-1 text-sm text-slate-500">{t('payments.receipt')}</div>
              {preview.receipt_url ? (
                <a href={preview.receipt_url} target="_blank" rel="noreferrer">
                  <img src={preview.receipt_url} alt="receipt" className="max-h-96 w-full rounded-lg border border-slate-200 object-contain" />
                </a>
              ) : (
                <p className="text-sm text-slate-400">{t('common.noData')}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
