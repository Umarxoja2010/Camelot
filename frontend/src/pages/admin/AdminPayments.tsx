import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Payment, PaymentCard, PaymentStatus, Paginated } from '@/types'
import { formatMoney, formatMonth, formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import { PaymentStatusBadge } from '@/components/Badges'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'

const STATUSES: (PaymentStatus | '')[] = ['', 'pending', 'confirmed', 'rejected']

interface CardForm {
  bank_name: string
  card_number: string
  holder_name: string
  note: string
  is_active: boolean
}
const EMPTY_CARD: CardForm = { bank_name: '', card_number: '', holder_name: '', note: '', is_active: true }

export default function AdminPayments() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [tab, setTab] = useState<'payments' | 'cards'>('payments')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('payments.title')}</h1>

      <div className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white p-1">
        {(['payments', 'cards'] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === tb ? 'bg-brand-600 text-white' : 'text-slate-600'}`}
          >
            {tb === 'payments' ? t('payments.title') : t('paymentCards.title')}
          </button>
        ))}
      </div>

      {tab === 'payments' ? <PaymentsTab locale={locale} /> : <CardsTab />}
    </div>
  )

  // ===================== To'lovlar tab =====================
  function PaymentsTab({ locale }: { locale: ReturnType<typeof useLocale>['locale'] }) {
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
      <>
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
      </>
    )
  }

  // ===================== Kartalar tab =====================
  function CardsTab() {
    const [items, setItems] = useState<PaymentCard[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<PaymentCard | null>(null)
    const [form, setForm] = useState<CardForm>(EMPTY_CARD)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const load = useCallback(() => {
      setLoading(true)
      api.get<{ data: PaymentCard[] }>('/admin/payment-cards')
        .then((r) => setItems(r.data.data))
        .finally(() => setLoading(false))
    }, [])

    useEffect(() => { load() }, [load])

    const openCreate = () => { setEditing(null); setForm(EMPTY_CARD); setError(''); setOpen(true) }
    const openEdit = (c: PaymentCard) => {
      setEditing(c)
      setForm({ bank_name: c.bank_name, card_number: c.card_number, holder_name: c.holder_name, note: c.note ?? '', is_active: c.is_active })
      setError(''); setOpen(true)
    }

    const submit = async (e: FormEvent) => {
      e.preventDefault(); setError(''); setSaving(true)
      try {
        if (editing) await api.put(`/admin/payment-cards/${editing.id}`, form)
        else await api.post('/admin/payment-cards', form)
        setOpen(false); load()
      } catch (err) { setError(getApiError(err, t('common.error'))) } finally { setSaving(false) }
    }

    const remove = async (c: PaymentCard) => {
      if (!confirm(t('common.deleteConfirm'))) return
      try { await api.delete(`/admin/payment-cards/${c.id}`); load() } catch (err) { alert(getApiError(err)) }
    }

    return (
      <>
        <div className="mb-4 flex justify-end">
          <button onClick={openCreate} className="btn-primary">+ {t('paymentCards.add')}</button>
        </div>

        {loading ? <Loader /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <div key={c.id} className="card overflow-hidden">
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
                  <div className="text-sm text-brand-100">{c.bank_name}</div>
                  <div className="mt-3 font-mono text-lg tracking-wider">{c.card_number}</div>
                  <div className="mt-3 text-sm">{c.holder_name}</div>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className={`badge ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                    {c.is_active ? t('common.active') : t('common.inactive')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-sm text-brand-600 hover:underline">{t('common.edit')}</button>
                    <button onClick={() => remove(c)} className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={open}
          title={editing ? t('paymentCards.edit') : t('paymentCards.add')}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
              <button form="card-form" type="submit" disabled={saving} className="btn-primary">
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </>
          }
        >
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
          <form id="card-form" onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">{t('paymentCards.bankName')} *</label>
              <input className="input" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('paymentCards.cardNumber')} *</label>
              <input className="input" value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} required placeholder="8600 1234 5678 9012" />
            </div>
            <div>
              <label className="label">{t('paymentCards.holder')} *</label>
              <input className="input" value={form.holder_name} onChange={(e) => setForm({ ...form, holder_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('paymentCards.note')}</label>
              <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              {t('common.active')}
            </label>
          </form>
        </Modal>
      </>
    )
  }
}
