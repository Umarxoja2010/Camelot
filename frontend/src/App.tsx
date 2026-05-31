import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { homePathFor } from '@/lib/nav'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import Loader from '@/components/Loader'

import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import AnnouncementsFeed from '@/pages/AnnouncementsFeed'
import Notifications from '@/pages/Notifications'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminCourses from '@/pages/admin/AdminCourses'
import AdminGroups from '@/pages/admin/AdminGroups'
import AdminGroupDetail from '@/pages/admin/AdminGroupDetail'
import AdminPaymentCards from '@/pages/admin/AdminPaymentCards'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements'

import TeacherGroups from '@/pages/teacher/TeacherGroups'
import TeacherGroupDetail from '@/pages/teacher/TeacherGroupDetail'

import StudentGroups from '@/pages/student/StudentGroups'
import StudentAttendance from '@/pages/student/StudentAttendance'
import StudentGrades from '@/pages/student/StudentGrades'
import StudentPayments from '@/pages/student/StudentPayments'

import ParentChildren from '@/pages/parent/ParentChildren'
import ParentChildDetail from '@/pages/parent/ParentChildDetail'

function RoleHome() {
  const { role, loading } = useAuth()
  if (loading) return <Loader className="min-h-screen" />
  return <Navigate to={role ? homePathFor(role) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<RoleHome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/announcements" element={<AnnouncementsFeed />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/groups" element={<AdminGroups />} />
            <Route path="/admin/groups/:id" element={<AdminGroupDetail />} />
            <Route path="/admin/payment-cards" element={<AdminPaymentCards />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Teacher (admin ham kira oladi) */}
          <Route element={<ProtectedRoute roles={['teacher', 'admin']} />}>
            <Route path="/teacher/groups" element={<TeacherGroups />} />
            <Route path="/teacher/groups/:id" element={<TeacherGroupDetail />} />
          </Route>

          {/* Student */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/student" element={<StudentGroups />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/grades" element={<StudentGrades />} />
            <Route path="/student/payments" element={<StudentPayments />} />
          </Route>

          {/* Parent */}
          <Route element={<ProtectedRoute roles={['parent']} />}>
            <Route path="/parent" element={<ParentChildren />} />
            <Route path="/parent/children/:id" element={<ParentChildDetail />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
