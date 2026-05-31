import type { Role } from '@/types'

export interface NavItem {
  to: string
  labelKey: string
  icon: string
  end?: boolean
}

/** Rolning asosiy (bosh) sahifasi */
export function homePathFor(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'teacher':
      return '/teacher/groups'
    case 'student':
      return '/student'
  }
}

export function navItemsFor(role: Role): NavItem[] {
  switch (role) {
    case 'admin':
      return [
        { to: '/admin', labelKey: 'nav.dashboard', icon: '📊', end: true },
        { to: '/admin/users', labelKey: 'nav.users', icon: '👥' },
        { to: '/admin/courses', labelKey: 'nav.courses', icon: '📚' },
        { to: '/admin/groups', labelKey: 'nav.groups', icon: '👨‍🏫' },
        { to: '/admin/payments', labelKey: 'nav.payments', icon: '💳' },
        { to: '/admin/announcements', labelKey: 'nav.announcements', icon: '📢' },
      ]
    case 'teacher':
      return [
        { to: '/teacher/groups', labelKey: 'nav.myGroups', icon: '👨‍🏫' },
        { to: '/announcements', labelKey: 'nav.announcements', icon: '📢' },
      ]
    case 'student':
      return [
        { to: '/student', labelKey: 'nav.myGroups', icon: '📚', end: true },
        { to: '/student/attendance', labelKey: 'nav.attendance', icon: '✅' },
        { to: '/student/homework', labelKey: 'nav.homework', icon: '📝' },
        { to: '/student/payments', labelKey: 'nav.myPayments', icon: '💳' },
        { to: '/announcements', labelKey: 'nav.announcements', icon: '📢' },
      ]
  }
}
