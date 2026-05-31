import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Course, Group, Paginated, ScheduleSlot, User } from '@/types'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

const DAYS: ScheduleSlot['day'][] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

interface FormState {
  course_id: string
  teacher_id: string
  name: string
  room: string
  starts_on: string
  is_active: boolean
  schedule: ScheduleSlot[]
}

const EMPTY: FormState = { course_id: '', teacher_id: '', name: '', room: '', starts_on: '', is_active: true, schedule: [] }

export default function AdminGroups() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Group[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ data: Group[] }>('/admin/groups')
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    api.get<{ data: Course[] }>('/admin/courses').then((r) => setCourses(r.data.data))
    api.get<Paginated<User>>('/admin/users', { params: { role: 'teacher', per_page: 100 } })
      .then((r) => setTeachers(r.data.data))
  }, [load])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setOpen(true) }
  const openEdit = (g: Group) => {
    setEditing(g)
    setForm({
      course_id: String(g.course?.id ?? ''),
      teacher_id: g.teacher ? String(g.teacher.id) : '',
      name: g.name, room: g.room ?? '', starts_on: g.starts_on ?? '',
      is_active: g.is_active, schedule: g.schedule ?? [],
    })
    setError(''); setOpen(true)
  }

  const addSlot = () => setForm((f) => ({ ...f, schedule: [...f.schedule, { day: 'mon', start: '18:00', end: '19:30' }] }))
  const updateSlot = (i: number, patch: Partial<ScheduleSlot>) =>
    setForm((f) => ({ ...f, schedule: f.schedule.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }))
  const removeSlot = (i: number) => setForm((f) => ({ ...f, schedule: f.schedule.filter((_, idx) => idx !== i) }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = {
      course_id: Number(form.course_id),
      teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      name: form.name, room: form.room || null,
      starts_on: form.starts_on || null, is_active: form.is_active,
      schedule: form.schedule,
    }
    try {
      if (editing) await api.put(`/admin/groups/${editing.id}`, payload)
      else await api.post('/admin/groups', payload)
      setOpen(false); load()
    } catch (err) { setError(getApiError(err, t('common.error'))) } finally { setSaving(false) }
  }

  const remove = async (g: Group) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try { await api.delete(`/admin/groups/${g.id}`); load() } catch (err) { alert(getApiError(err)) }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{t('groups.title')}</h1>
        <button onClick={openCreate} className="btn-primary">+ {t('groups.add')}</button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{g.name}</h3>
                  <p className="text-sm text-slate-500">{g.course?.name}</p>
                </div>
                {!g.is_active && <span className="badge bg-slate-200 text-slate-500">off</span>}
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                <div>👨‍🏫 {g.teacher?.name ?? t('groups.noTeacher')}</div>
                {g.room && <div>🚪 {g.room}</div>}
                <div className="flex flex-wrap gap-1">
                  {(g.schedule ?? []).map((s, i) => (
                    <span key={i} className="badge bg-slate-100 text-slate-600">{t(`days.${s.day}`)} {s.start}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <Link to={`/admin/groups/${g.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                  👥 {g.students_count ?? 0} · {t('common.details')}
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(g)} className="text-sm text-brand-600 hover:underline">{t('common.edit')}</button>
                  <button onClick={() => remove(g)} className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? t('groups.edit') : t('groups.add')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="group-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </>
        }
      >
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        <form id="group-form" onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('groups.course')} *</label>
              <select className="input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
                <option value="">—</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('groups.teacher')}</label>
              <select className="input" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
                <option value="">{t('groups.noTeacher')}</option>
                {teachers.map((tch) => <option key={tch.id} value={tch.id}>{tch.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('common.name')} *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Beginner-A" />
            </div>
            <div>
              <label className="label">{t('groups.room')}</label>
              <input className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('groups.startsOn')}</label>
              <input type="date" className="input" value={form.starts_on} onChange={(e) => setForm({ ...form, starts_on: e.target.value })} />
            </div>
          </div>

          {/* Dars jadvali */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">{t('groups.schedule')}</label>
              <button type="button" onClick={addSlot} className="text-sm text-brand-600 hover:underline">+ {t('groups.addSlot')}</button>
            </div>
            <div className="space-y-2">
              {form.schedule.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select className="input" value={s.day} onChange={(e) => updateSlot(i, { day: e.target.value as ScheduleSlot['day'] })}>
                    {DAYS.map((d) => <option key={d} value={d}>{t(`days.${d}`)}</option>)}
                  </select>
                  <input type="time" className="input" value={s.start} onChange={(e) => updateSlot(i, { start: e.target.value })} />
                  <input type="time" className="input" value={s.end} onChange={(e) => updateSlot(i, { end: e.target.value })} />
                  <button type="button" onClick={() => removeSlot(i)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">✕</button>
                </div>
              ))}
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
