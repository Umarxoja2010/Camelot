import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Group, Paginated, User } from '@/types'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

export default function AdminGroupDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<{ data: Group }>(`/admin/groups/${id}`)
      .then((r) => setGroup(r.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get<Paginated<User>>('/admin/users', { params: { role: 'student', per_page: 100 } })
      .then((r) => setAllStudents(r.data.data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const enrolledIds = new Set((group?.students ?? []).map((s) => s.id))
  const candidates = allStudents.filter((s) => !enrolledIds.has(s.id))

  const toggle = (sid: number) =>
    setSelected((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]))

  const enroll = async () => {
    if (selected.length === 0) return
    setSaving(true)
    try {
      await api.post(`/admin/groups/${id}/enroll`, { student_ids: selected })
      setOpen(false)
      setSelected([])
      load()
    } catch (err) {
      alert(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const removeStudent = async (sid: number) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try {
      await api.delete(`/admin/groups/${id}/students/${sid}`)
      load()
    } catch (err) {
      alert(getApiError(err))
    }
  }

  if (loading) return <Loader />
  if (!group) return <div className="text-center text-slate-500">{t('common.noData')}</div>

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/groups" className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-600">
        ← {t('groups.title')}
      </Link>

      <div className="card mb-6 p-5">
        <h1 className="text-2xl font-bold text-slate-800">{group.name}</h1>
        <p className="text-slate-500">{group.course?.name}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
          <span>👨‍🏫 {group.teacher?.name ?? t('groups.noTeacher')}</span>
          {group.room && <span>· 🚪 {group.room}</span>}
          {(group.schedule ?? []).map((s, i) => (
            <span key={i} className="badge bg-slate-100 text-slate-600">{t(`days.${s.day}`)} {s.start}-{s.end}</span>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">{t('groups.students')} ({group.students?.length ?? 0})</h2>
          <button onClick={() => setOpen(true)} className="btn-primary">+ {t('groups.enroll')}</button>
        </div>
        {(group.students?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400">{t('attendance.noStudents')}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {group.students!.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-slate-700">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.email}</div>
                </div>
                <button onClick={() => removeStudent(s.id)} className="text-sm text-red-600 hover:underline">
                  {t('groups.removeStudent')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={t('groups.enroll')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button onClick={enroll} disabled={saving || selected.length === 0} className="btn-primary">
              {saving ? t('common.loading') : `${t('common.add')} (${selected.length})`}
            </button>
          </>
        }
      >
        {candidates.length === 0 ? (
          <p className="text-sm text-slate-400">{t('common.noData')}</p>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {candidates.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                {s.name} <span className="text-slate-400">({s.email})</span>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
