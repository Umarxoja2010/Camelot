import { useTranslation } from 'react-i18next'
import type { AttendanceStatus, PaymentStatus } from '@/types'

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  return <span className={`badge ${PAYMENT_STYLES[status]}`}>{t(`paymentStatus.${status}`)}</span>
}

const ATTENDANCE_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-amber-100 text-amber-800',
  excused: 'bg-slate-200 text-slate-700',
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const { t } = useTranslation()
  return <span className={`badge ${ATTENDANCE_STYLES[status]}`}>{t(`attendanceStatus.${status}`)}</span>
}
