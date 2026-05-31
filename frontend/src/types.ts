export type Locale = 'uz' | 'ru' | 'en'
export type Translations = Partial<Record<Locale, string>>

export type Role = 'admin' | 'teacher' | 'student'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
  locale: Locale
  avatar: string | null
  is_active: boolean
  has_telegram: boolean
  created_at: string
}

export interface Course {
  id: number
  name: string
  description: string | null
  name_translations: Translations
  description_translations: Translations
  level: string | null
  monthly_fee: number
  is_active: boolean
  groups_count?: number
  created_at: string
}

export interface ScheduleSlot {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  start: string
  end: string
}

export interface Group {
  id: number
  name: string
  schedule: ScheduleSlot[]
  room: string | null
  starts_on: string | null
  is_active: boolean
  course?: Course
  teacher?: User
  students?: User[]
  students_count?: number
  created_at: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface Attendance {
  id: number
  group_id: number
  student_id: number
  date: string
  status: AttendanceStatus
  note: string | null
  student?: User
  group?: Group
}

export type GradeType = 'lesson' | 'homework' | 'test' | 'exam'

export interface Grade {
  id: number
  group_id: number
  student_id: number
  type: GradeType
  title: string | null
  score: number
  max_score: number
  percent: number | null
  date: string
  comment: string | null
  student?: User
  group?: Group
}

export interface PaymentCard {
  id: number
  bank_name: string
  card_number: string
  holder_name: string
  note: string | null
  is_active: boolean
  created_at: string
}

export type PaymentStatus = 'pending' | 'confirmed' | 'rejected'

export interface Payment {
  id: number
  student_id: number
  group_id: number | null
  amount: number
  month: string
  status: PaymentStatus
  note: string | null
  receipt_url: string | null
  reviewed_at: string | null
  student?: User
  group?: Group
  card?: PaymentCard
  created_at: string
}

export type Audience = 'all' | 'teachers' | 'students' | 'group'

export interface Announcement {
  id: number
  title: string
  body: string
  title_translations: Translations
  body_translations: Translations
  audience: Audience
  group_id: number | null
  group?: Group
  publisher?: User
  is_published: boolean
  created_at: string
}

export interface Homework {
  id: number
  group_id: number
  title: string
  description: string | null
  due_date: string | null
  group?: Group
  creator?: User
  created_at: string
}

export interface AppNotification {
  id: number
  type: string
  title: string
  body: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export interface AdminDashboard {
  totals: {
    students: number
    teachers: number
    groups: number
    courses: number
    pending_payments: number
    confirmed_revenue: number
  }
  recent_payments: {
    id: number
    student_name: string | null
    amount: number
    month: string
    status: PaymentStatus
    created_at: string
  }[]
}
