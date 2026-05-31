import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Group, Paginated, Role, User } from '@/types'
import { SUPPORTED_LOCALES } from '@/i18n'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'

const ROLES: Role[] = ['admin', 'teacher', 'student']

interface FormState {
  name: string
  email: string
  phone: string
  role: Role
  locale: string
  password: string
  is_active: boolean
  telegram_chat_id: string
  group_ids: number[]
}

const EMPTY: FormState = {
  name: '', email: '', phone: '', role: 'student', locale: 'uz',
  password: '', is_active: true, telegram_chat_id: '', group_ids: [],
}

export default function AdminUsers() {
  const { t } = useTranslation()
  const [items, setItems] = useState<User[]>([])
  const [meta, setMeta] = useState<Paginated<User>['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [search, setSearch] = useState('')

  // o'quvchi yaratishda guruh tanlash uchun
  const [groups, setGroups] = useState<Group[]>([])

  // modal
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get<Paginated<User>>('/admin/users', {
        params: { page, role: roleFilter || undefined, search: search || undefined },
      })
      .then((r) => {
        setItems(r.data.data)
        setMeta(r.data.meta)
      })
      .finally(() => setLoading(false))
  }, [page, roleFilter, search])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    api.get<{ data: Group[] }>('/admin/groups').then((r) => setGroups(r.data.data))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setOpen(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({
      name: u.name, email: u.email, phone: u.phone ?? '', role: u.role, locale: u.locale,
      password: '', is_active: u.is_active, telegram_chat_id: '', group_ids: [],
    })
    setError('')
    setOpen(true)
  }

  const toggleGroup = (id: number) => {
    setForm((f) => {
      const set = new Set(f.group_ids)
      set.has(id) ? set.delete(id) : set.add(id)
      return { ...f, group_ids: [...set] }
    })
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload: Record<string, unknown> = {
      name: form.name, email: form.email, phone: form.phone || null,
      role: form.role, locale: form.locale, is_active: form.is_active,
      telegram_chat_id: form.telegram_chat_id || null,
    }
    if (form.password) payload.password = form.password
    // group_ids faqat YARATISHDA — tahrirlashda enrollmentlar guruh sahifasidan boshqariladi
    if (form.role === 'student' && !editing) payload.group_ids = form.group_ids

    try {
      if (editing) await api.put(`/admin/users/${editing.id}`, payload)
      else await api.post('/admin/users', payload)
      setOpen(false)
      load()
    } catch (err) {
      setError(getApiError(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (u: User) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try {
      await api.delete(`/admin/users/${u.id}`)
      load()
    } catch (err) {
      alert(getApiError(err))
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{t('users.title')}</h1>
        <button onClick={openCreate} className="btn-primary">+ {t('users.add')}</button>
      </div>

      {/* Filtrlar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setRoleFilter(''); setPage(1) }}
          className={`rounded-lg px-3 py-1.5 text-sm ${!roleFilter ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          {t('common.all')}
        </button>
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm ${roleFilter === r ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {t(`roles.${r}`)}
          </button>
        ))}
        <input
          className="input ml-auto max-w-xs"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder={t('users.searchPlaceholder')}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="th">{t('common.name')}</th>
                <th className="th">{t('common.email')}</th>
                <th className="th">{t('users.role')}</th>
                <th className="th">{t('common.phone')}</th>
                <th className="th text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-slate-800">
                    {u.name}
                    {!u.is_active && <span className="ml-2 badge bg-slate-200 text-slate-500">off</span>}
                  </td>
                  <td className="td text-slate-500">{u.email}</td>
                  <td className="td"><span className="badge bg-brand-100 text-brand-700">{t(`roles.${u.role}`)}</span></td>
                  <td className="td text-slate-500">{u.phone ?? '—'}</td>
                  <td className="td text-right">
                    <button onClick={() => openEdit(u)} className="mr-2 text-brand-600 hover:underline">{t('common.edit')}</button>
                    <button onClick={() => remove(u)} className="text-red-600 hover:underline">{t('common.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onChange={setPage} />}

      <Modal
        open={open}
        title={editing ? t('users.edit') : t('users.add')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="user-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </>
        }
      >
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        <form id="user-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t('common.name')} *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('common.email')} *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('common.phone')}</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('users.role')} *</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('users.language')}</label>
            <select className="input" value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
              {SUPPORTED_LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('users.password')} {editing ? '' : '*'}</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editing}
            />
            {editing && <p className="mt-1 text-xs text-slate-400">{t('users.passwordEditHint')}</p>}
          </div>

          {form.role === 'student' && !editing && (
            <div className="sm:col-span-2">
              <label className="label">{t('users.groups')}</label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                {groups.length === 0 && <p className="text-sm text-slate-400">{t('common.noData')}</p>}
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.group_ids.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                    {g.name} <span className="text-slate-400">({g.course?.name})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            {t('common.active')}
          </label>
        </form>
      </Modal>
    </div>
  )
}
