import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/hooks/useLocale'
import { SUPPORTED_LOCALES } from '@/i18n'
import type { Locale, User } from '@/types'

export default function Profile() {
  const { t } = useTranslation()
  const { user, setUser } = useAuth()
  const { setLocale } = useLocale()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [locale, setLocaleVal] = useState<Locale>(user?.locale ?? 'uz')
  const [telegram, setTelegram] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    const payload: Record<string, unknown> = { name, phone, locale, telegram_chat_id: telegram || null }
    if (password) {
      payload.current_password = currentPassword
      payload.password = password
      payload.password_confirmation = passwordConfirm
    }

    try {
      const res = await api.put<{ data: User }>('/profile', payload)
      setUser(res.data.data)
      setLocale(locale)
      setMessage(t('profile.saved'))
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirm('')
    } catch (err) {
      setError(getApiError(err, t('common.error')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{t('profile.title')}</h1>

      {message && <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('common.name')}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">{t('common.phone')}</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('profile.language')}</label>
              <select className="input" value={locale} onChange={(e) => setLocaleVal(e.target.value as Locale)}>
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('profile.telegram')}</label>
              <input
                className="input"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="123456789"
              />
              <p className="mt-1 text-xs text-slate-400">{t('profile.telegramHint')}</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="font-semibold text-slate-800">{t('profile.changePassword')}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">{t('profile.currentPassword')}</label>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('profile.newPassword')}</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('profile.confirmPassword')}</label>
              <input
                type="password"
                className="input"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </form>
    </div>
  )
}
