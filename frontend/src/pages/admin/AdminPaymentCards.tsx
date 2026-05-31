import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { PaymentCard } from '@/types'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

interface FormState {
  bank_name: string
  card_number: string
  holder_name: string
  note: string
  is_active: boolean
}

const EMPTY: FormState = { bank_name: '', card_number: '', holder_name: '', note: '', is_active: true }

export default function AdminPaymentCards() {
  const { t } = useTranslation()
  const [items, setItems] = useState<PaymentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentCard | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ data: PaymentCard[] }>('/admin/payment-cards')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setOpen(true) }
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
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{t('paymentCards.title')}</h1>
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
    </div>
  )
}
