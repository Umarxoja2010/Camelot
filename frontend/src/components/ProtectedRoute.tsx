import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homePathFor } from '@/lib/nav'
import Loader from './Loader'
import type { Role } from '@/types'

export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { isAuthenticated, loading, role } = useAuth()
  const location = useLocation()

  if (loading) return <Loader className="min-h-screen" />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Rol mos kelmasa, o'z bosh sahifasiga yo'naltiramiz
  if (roles && role && !roles.includes(role)) {
    return <Navigate to={homePathFor(role)} replace />
  }

  return <Outlet />
}
