import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Payment, PaymentCard } from '@/types'
import { formatMoney, formatMonth, formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import { PaymentStatusBadge } from '@/components/Badges'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

const currentMonth = () => new Date().toISOString().slice(0, 7)

export default function StudentPayments() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(currentMonth())
  const [cardId, setCardId] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<{ data: PaymentCard[] }>('/student/payment-cards'),
      api.get<{ data: Payment[] }>('/student/payments'),
    ])
      .then(([c, p]) => {
        setCards(c.data.data)
        setPayments(p.data.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!file) {
      setError(t('payments.uploadReceipt'))
      return
    }
    setSaving(true)
    const fd = new FormData()
    fd.append('amount', amount)
    fd.append('month', month)
    if (cardId) fd.append('payment_card_id', cardId)
    if (note) fd.append('note', note)
    fd.append('receipt', file)

    try {
      await api.post('/student/payments', fd)
      setOpen(false)
      setAmount(''); setNote(''); setFile(null)
      load()
    } catch (err) {
      setError(getApiError(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{t('payments.myPayments')}</h1>
        <button onClick={() => setOpen(true)} disabled={cards.length === 0} className="btn-primary">
          + {t('payments.newPayment')}
        </button>
      </div>

      {/* To'lov kartalari */}
      <h2 className="mb-2 text-sm font-semibold text-slate-500">{t('payments.payToCards')}</h2>
      {cards.length === 0 ? (
        <div className="card mb-6 p-6 text-center text-sm text-slate-400">{t('payments.noCards')}</div>
      ) : (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.id} className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
              <div className="text-xs text-brand-100">{c.bank_name}</div>
              <div className="mt-2 font-mono text-lg tracking-wider">{c.card_number}</div>
              <div className="mt-2 text-sm">{c.holder_name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tarix */}
      <h2 className="mb-2 text-sm font-semibold text-slate-500">{t('payments.history')}</h2>
      {payments.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('common.noData')}</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-slate-700">{formatMonth(p.month)}</div>
                <div className="text-xs text-slate-400">{formatDateTime(p.created_at, locale)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800">{formatMoney(p.amount, locale)}</span>
                <PaymentStatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={t('payments.newPayment')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="pay-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? t('common.loading') : t('payments.submit')}
            </button>
          </>
        }
      >
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        <form id="pay-form" onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('payments.amount')} *</label>
              <input type="number" min="1" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div>
              <label className="label">{t('payments.month')} *</label>
              <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">{t('payments.selectCard')}</label>
            <select className="input" value={cardId} onChange={(e) => setCardId(e.target.value)}>
              <option value="">—</option>
              {cards.map((c) => <option key={c.id} value={c.id}>{c.bank_name} · {c.card_number}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('payments.uploadReceipt')} *</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <div>
            <label className="label">{t('grades.comment')}</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
