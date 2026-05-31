import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import type { Attendance, AttendanceStatus, Grade, GradeType, Group, Homework } from '@/types'
import { formatDate } from '@/lib/format'
import { useLocale } from '@/hooks/useLocale'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'

type Tab = 'attendance' | 'grades' | 'homework'

const ATT_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused']
const GRADE_TYPES: GradeType[] = ['lesson', 'homework', 'test', 'exam']
const todayStr = () => new Date().toISOString().slice(0, 10)

export default function TeacherGroupDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('attendance')

  // attendance
  const [date, setDate] = useState(todayStr())
  const [records, setRecords] = useState<Record<number, AttendanceStatus>>({})
  const [savingAtt, setSavingAtt] = useState(false)
  const [attMsg, setAttMsg] = useState('')

  // grades
  const [grades, setGrades] = useState<Grade[]>([])
  const [gradeOpen, setGradeOpen] = useState(false)
  const [gradeForm, setGradeForm] = useState({
    student_id: '', type: 'test' as GradeType, title: '', score: '', max_score: '100', date: todayStr(), comment: '',
  })
  const [gradeErr, setGradeErr] = useState('')
  const [savingGrade, setSavingGrade] = useState(false)

  // homework
  const [homework, setHomework] = useState<Homework[]>([])
  const [hwOpen, setHwOpen] = useState(false)
  const [hwForm, setHwForm] = useState({ title: '', description: '', due_date: '' })
  const [hwErr, setHwErr] = useState('')
  const [savingHw, setSavingHw] = useState(false)

  useEffect(() => {
    api.get<{ data: Group }>(`/teacher/groups/${id}`)
      .then((r) => setGroup(r.data.data))
      .finally(() => setLoading(false))
  }, [id])

  const loadAttendance = useCallback(() => {
    if (!group) return
    api.get<{ data: Attendance[] }>(`/teacher/groups/${id}/attendance`, { params: { date } })
      .then((r) => {
        const map: Record<number, AttendanceStatus> = {}
        group.students?.forEach((s) => { map[s.id] = 'present' })
        r.data.data.forEach((a) => { map[a.student_id] = a.status })
        setRecords(map)
      })
  }, [group, id, date])

  useEffect(() => { if (tab === 'attendance') loadAttendance() }, [tab, loadAttendance])

  const loadGrades = useCallback(() => {
    api.get<{ data: Grade[] }>(`/teacher/groups/${id}/grades`).then((r) => setGrades(r.data.data))
  }, [id])

  useEffect(() => { if (tab === 'grades') loadGrades() }, [tab, loadGrades])

  const loadHomework = useCallback(() => {
    api.get<{ data: Homework[] }>(`/teacher/groups/${id}/homework`).then((r) => setHomework(r.data.data))
  }, [id])

  useEffect(() => { if (tab === 'homework') loadHomework() }, [tab, loadHomework])

  const saveAttendance = async () => {
    setSavingAtt(true); setAttMsg('')
    try {
      await api.post(`/teacher/groups/${id}/attendance`, {
        date,
        records: Object.entries(records).map(([student_id, status]) => ({ student_id: Number(student_id), status })),
      })
      setAttMsg(t('attendance.saved'))
    } catch (err) {
      alert(getApiError(err))
    } finally {
      setSavingAtt(false)
    }
  }

  const submitGrade = async (e: FormEvent) => {
    e.preventDefault(); setGradeErr(''); setSavingGrade(true)
    try {
      await api.post(`/teacher/groups/${id}/grades`, {
        student_id: Number(gradeForm.student_id),
        type: gradeForm.type,
        title: gradeForm.title || null,
        score: Number(gradeForm.score),
        max_score: Number(gradeForm.max_score),
        date: gradeForm.date,
        comment: gradeForm.comment || null,
      })
      setGradeOpen(false)
      setGradeForm({ ...gradeForm, title: '', score: '', comment: '' })
      loadGrades()
    } catch (err) { setGradeErr(getApiError(err, t('common.error'))) } finally { setSavingGrade(false) }
  }

  const deleteGrade = async (g: Grade) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try { await api.delete(`/teacher/grades/${g.id}`); loadGrades() } catch (err) { alert(getApiError(err)) }
  }

  const submitHomework = async (e: FormEvent) => {
    e.preventDefault(); setHwErr(''); setSavingHw(true)
    try {
      await api.post(`/teacher/groups/${id}/homework`, {
        title: hwForm.title,
        description: hwForm.description || null,
        due_date: hwForm.due_date || null,
      })
      setHwOpen(false)
      setHwForm({ title: '', description: '', due_date: '' })
      loadHomework()
    } catch (err) { setHwErr(getApiError(err, t('common.error'))) } finally { setSavingHw(false) }
  }

  const deleteHomework = async (h: Homework) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try { await api.delete(`/teacher/homework/${h.id}`); loadHomework() } catch (err) { alert(getApiError(err)) }
  }

  if (loading) return <Loader />
  if (!group) return <div className="text-center text-slate-500">{t('common.noData')}</div>

  const students = group.students ?? []
  const tabs: { key: Tab; label: string }[] = [
    { key: 'attendance', label: t('attendance.title') },
    { key: 'homework', label: t('homework.title') },
    { key: 'grades', label: t('grades.title') },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/teacher/groups" className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-600">
        ← {t('nav.myGroups')}
      </Link>

      <div className="card mb-4 p-5">
        <h1 className="text-2xl font-bold text-slate-800">{group.name}</h1>
        <p className="text-slate-500">{group.course?.name} · 👥 {students.length}</p>
      </div>

      {/* Tablar */}
      <div className="mb-4 inline-flex flex-wrap rounded-lg border border-slate-300 bg-white p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === tb.key ? 'bg-brand-600 text-white' : 'text-slate-600'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* DAVOMAT */}
      {tab === 'attendance' && (
        students.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">{t('attendance.noStudents')}</div>
        ) : (
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="label mb-0">{t('attendance.date')}</label>
              <input type="date" className="input max-w-xs" value={date} onChange={(e) => setDate(e.target.value)} />
              {attMsg && <span className="text-sm text-green-600">{attMsg}</span>}
            </div>
            <div className="divide-y divide-slate-100">
              {students.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <div className="flex gap-1">
                    {ATT_STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => setRecords((r) => ({ ...r, [s.id]: st }))}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          records[s.id] === st ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t(`attendanceStatus.${st}`)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveAttendance} disabled={savingAtt} className="btn-primary mt-4">
              {savingAtt ? t('common.loading') : t('attendance.save')}
            </button>
          </div>
        )
      )}

      {/* UY VAZIFASI */}
      {tab === 'homework' && (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">{t('homework.title')}</h2>
            <button onClick={() => setHwOpen(true)} className="btn-primary">+ {t('homework.add')}</button>
          </div>
          {homework.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData')}</p>
          ) : (
            <div className="space-y-3">
              {homework.map((h) => (
                <div key={h.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-slate-800">{h.title}</h3>
                    <button onClick={() => deleteHomework(h)} className="text-sm text-red-600 hover:underline">{t('common.delete')}</button>
                  </div>
                  {h.description && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{h.description}</p>}
                  {h.due_date && (
                    <p className="mt-2 text-xs text-amber-600">⏰ {t('homework.dueDate')}: {formatDate(h.due_date, locale)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BAHOLAR */}
      {tab === 'grades' && (
        students.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">{t('attendance.noStudents')}</div>
        ) : (
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{t('grades.title')}</h2>
              <button onClick={() => setGradeOpen(true)} className="btn-primary">+ {t('grades.add')}</button>
            </div>
            {grades.length === 0 ? (
              <p className="text-sm text-slate-400">{t('common.noData')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="th">{t('grades.student')}</th>
                      <th className="th">{t('grades.type')}</th>
                      <th className="th">{t('grades.titleField')}</th>
                      <th className="th">{t('grades.score')}</th>
                      <th className="th">{t('common.date')}</th>
                      <th className="th"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.map((g) => (
                      <tr key={g.id}>
                        <td className="td">{g.student?.name ?? '—'}</td>
                        <td className="td">{t(`gradeType.${g.type}`)}</td>
                        <td className="td text-slate-500">{g.title ?? '—'}</td>
                        <td className="td font-medium">{g.score}/{g.max_score} <span className="text-slate-400">({g.percent}%)</span></td>
                        <td className="td text-slate-400">{formatDate(g.date, locale)}</td>
                        <td className="td text-right">
                          <button onClick={() => deleteGrade(g)} className="text-red-600 hover:underline">{t('common.delete')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* Baho qo'shish modal */}
      <Modal
        open={gradeOpen}
        title={t('grades.add')}
        onClose={() => setGradeOpen(false)}
        footer={
          <>
            <button onClick={() => setGradeOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="grade-form" type="submit" disabled={savingGrade} className="btn-primary">
              {savingGrade ? t('common.loading') : t('common.save')}
            </button>
          </>
        }
      >
        {gradeErr && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{gradeErr}</div>}
        <form id="grade-form" onSubmit={submitGrade} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">{t('grades.student')} *</label>
            <select className="input" value={gradeForm.student_id} onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })} required>
              <option value="">—</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('grades.type')}</label>
            <select className="input" value={gradeForm.type} onChange={(e) => setGradeForm({ ...gradeForm, type: e.target.value as GradeType })}>
              {GRADE_TYPES.map((gt) => <option key={gt} value={gt}>{t(`gradeType.${gt}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('grades.titleField')}</label>
            <input className="input" value={gradeForm.title} onChange={(e) => setGradeForm({ ...gradeForm, title: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('grades.score')} *</label>
            <input type="number" min="0" className="input" value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('grades.maxScore')}</label>
            <input type="number" min="1" className="input" value={gradeForm.max_score} onChange={(e) => setGradeForm({ ...gradeForm, max_score: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('common.date')} *</label>
            <input type="date" className="input" value={gradeForm.date} onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('grades.comment')}</label>
            <input className="input" value={gradeForm.comment} onChange={(e) => setGradeForm({ ...gradeForm, comment: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Uy vazifasi qo'shish modal */}
      <Modal
        open={hwOpen}
        title={t('homework.add')}
        onClose={() => setHwOpen(false)}
        footer={
          <>
            <button onClick={() => setHwOpen(false)} className="btn-outline">{t('common.cancel')}</button>
            <button form="hw-form" type="submit" disabled={savingHw} className="btn-primary">
              {savingHw ? t('common.loading') : t('common.save')}
            </button>
          </>
        }
      >
        {hwErr && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{hwErr}</div>}
        <form id="hw-form" onSubmit={submitHomework} className="space-y-4">
          <div>
            <label className="label">{t('homework.titleField')} *</label>
            <input className="input" value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('homework.description')}</label>
            <textarea className="input" rows={4} value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('homework.dueDate')}</label>
            <input type="date" className="input" value={hwForm.due_date} onChange={(e) => setHwForm({ ...hwForm, due_date: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
