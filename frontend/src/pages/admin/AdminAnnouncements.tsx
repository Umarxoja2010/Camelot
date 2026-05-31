import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Announcement, Audience, Group, Translations } from '@/types'
import { SUPPORTED_LOCALES } from '@/i18n'
import { formatDateTime } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

const LOCALE_LABELS: Record<string, string> = { uz: "O'zbekcha", ru: 'Русский', en: 'English' }
const AUDIENCES: Audience[] = ['all', 'teachers', 'students', 'group']

interface FormState {
  title: Translations
  body: Translations
  audience: Audience
  group_id: string
  notify: boolean
}

const EMPTY: FormState = { title: {}, body: {}, audience: 'all', group_id: '', notify: true }

export default function AdminAnnouncements() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [items, setItems] = useState<Announcement[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ data: Announcement[] }>('/admin/announcements')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    api.get<{ data: Group[] }>('/admin/groups').then((r) => setGroups(r.data.data))
  }, [load])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setOpen(true) }
  const openEdit = (a: Announcement) => {
    setEditing(a)
    setForm({
      title: a.title_translations || {}, body: a.body_translations || {},
      audience: a.audience, group_id: a.group_id ? String(a.group_id) : '', notify: false,
    })
    setError(''); setOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = {
      title: form.title, body: form.body, audience: form.audience,
      group_id: form.audience === 'group' ? Number(form.group_id) : null,
      is_published: true, notify: form.notify,
    }
    try {
      if (editing) await api.put(`/admin/announcements/${editing.id}`, payload)
      else await api.post('/admin/announcements', payload)
      setOpen(false); load()
    } catch (err) { setError(getApiError(err, t('common.error'))) } finally { setSaving(false) }
  }

  const remove = async (a: Announcement) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try { await api.delete(`/admin/announcements/${a.id}`); load() } catch (err) { alert(getApiError(err)) }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{t('announcements.title')}</h1>
        <button onClick={openCreate} className="btn-primary">+ {t('announcements.add')}</button>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="badge bg-brand-100 text-brand-700">{t(`audience.${a.audience}`)}</span>
                <span className="text-xs text-slate-400">{formatDateTime(a.created_at, locale)}</span>
              </div>
              <h3 className="font-semibold text-slate-800">{a.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{a.body}</p>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => openEdit(a)} className="text-sm text-brand-600 hover:underline">{t('common.edit')}</button>
                <button onClick={() => remove(a)} className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? t('announcements.edit') : t('announcements.add')}
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="ann-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </>
        }
      >
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        <form id="ann-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('announcements.titlePerLang')} *</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SUPPORTED_LOCALES.map((l) => (
                <input
                  key={l}
                  className="input"
                  placeholder={LOCALE_LABELS[l]}
                  value={form.title[l] ?? ''}
                  onChange={(e) => setForm({ ...form, title: { ...form.title, [l]: e.target.value } })}
                  required={l === 'uz'}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">{t('announcements.bodyPerLang')} *</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SUPPORTED_LOCALES.map((l) => (
                <textarea
                  key={l}
                  rows={4}
                  className="input"
                  placeholder={LOCALE_LABELS[l]}
                  value={form.body[l] ?? ''}
                  onChange={(e) => setForm({ ...form, body: { ...form.body, [l]: e.target.value } })}
                  required={l === 'uz'}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('announcements.audience')}</label>
              <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as Audience })}>
                {AUDIENCES.map((a) => <option key={a} value={a}>{t(`audience.${a}`)}</option>)}
              </select>
            </div>
            {form.audience === 'group' && (
              <div>
                <label className="label">{t('groups.title')}</label>
                <select className="input" value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} required>
                  <option value="">—</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} />
            {t('announcements.notify')}
          </label>
        </form>
      </Modal>
    </div>
  )
}
