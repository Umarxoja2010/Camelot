import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Course, Translations } from '@/types'
import { SUPPORTED_LOCALES } from '@/i18n'
import { formatMoney } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

const LOCALE_LABELS: Record<string, string> = { uz: "O'zbekcha", ru: 'Русский', en: 'English' }

interface FormState {
  name: Translations
  description: Translations
  type: 'language' | 'school'
  level: string
  monthly_fee: string
  is_active: boolean
}

const EMPTY: FormState = { name: {}, description: {}, type: 'language', level: '', monthly_fee: '0', is_active: true }

export default function AdminCourses() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ data: Course[] }>('/admin/courses')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setOpen(true) }
  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({
      name: c.name_translations || {}, description: c.description_translations || {},
      type: c.type, level: c.level ?? '', monthly_fee: String(c.monthly_fee), is_active: c.is_active,
    })
    setError(''); setOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = {
      name: form.name, description: form.description, type: form.type,
      level: form.level || null, monthly_fee: Number(form.monthly_fee), is_active: form.is_active,
    }
    try {
      if (editing) await api.put(`/admin/courses/${editing.id}`, payload)
      else await api.post('/admin/courses', payload)
      setOpen(false); load()
    } catch (err) { setError(getApiError(err, t('common.error'))) } finally { setSaving(false) }
  }

  const remove = async (c: Course) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try { await api.delete(`/admin/courses/${c.id}`); load() } catch (err) { alert(getApiError(err)) }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{t('courses.title')}</h1>
        <button onClick={openCreate} className="btn-primary">+ {t('courses.add')}</button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="badge bg-brand-100 text-brand-700">{t(`courses.type${c.type === 'language' ? 'Language' : 'School'}`)}</span>
                {c.level && <span className="badge bg-slate-100 text-slate-600">{c.level}</span>}
                {!c.is_active && <span className="badge bg-slate-200 text-slate-500">off</span>}
              </div>
              <h3 className="font-semibold text-slate-800">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{c.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-medium text-brand-700">{formatMoney(c.monthly_fee, locale)}</span>
                <span className="text-xs text-slate-400">{c.groups_count ?? 0} {t('courses.groups')}</span>
              </div>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => openEdit(c)} className="text-sm text-brand-600 hover:underline">{t('common.edit')}</button>
                <button onClick={() => remove(c)} className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? t('courses.edit') : t('courses.add')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="course-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </>
        }
      >
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        <form id="course-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('courses.namePerLang')} *</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SUPPORTED_LOCALES.map((l) => (
                <input
                  key={l}
                  className="input"
                  placeholder={LOCALE_LABELS[l]}
                  value={form.name[l] ?? ''}
                  onChange={(e) => setForm({ ...form, name: { ...form.name, [l]: e.target.value } })}
                  required={l === 'uz'}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">{t('courses.descPerLang')}</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SUPPORTED_LOCALES.map((l) => (
                <textarea
                  key={l}
                  rows={2}
                  className="input"
                  placeholder={LOCALE_LABELS[l]}
                  value={form.description[l] ?? ''}
                  onChange={(e) => setForm({ ...form, description: { ...form.description, [l]: e.target.value } })}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">{t('courses.type')}</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'language' | 'school' })}>
                <option value="language">{t('courses.typeLanguage')}</option>
                <option value="school">{t('courses.typeSchool')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('courses.level')}</label>
              <input className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="A1 / 5-sinf" />
            </div>
            <div>
              <label className="label">{t('courses.monthlyFee')}</label>
              <input type="number" min="0" className="input" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
            </div>
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
