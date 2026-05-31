import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import type { User } from '@/types'
import Loader from '@/components/Loader'

export default function ParentChildren() {
  const { t } = useTranslation()
  const [children, setChildren] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: User[] }>('/parent/children')
      .then((r) => setChildren(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('nav.children')}</h1>

      {children.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('child.empty')}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((c) => (
            <Link key={c.id} to={`/parent/children/${c.id}`} className="card flex items-center gap-4 p-5 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-slate-800">{c.name}</div>
                <div className="text-sm text-slate-500">{c.email}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
