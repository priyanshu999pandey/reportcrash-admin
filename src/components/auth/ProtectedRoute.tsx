import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import type { ProtectedRouteProps } from '../../types'
import { getAuthHomeRoute, hasAuthPermission } from '../../utils/auth'

const ProtectedRoute = ({ requiredPermission }: ProtectedRouteProps) => {
  const { isAuthenticated, token, user, adminRole } = useAppSelector(
    (state) => state.auth,
  )

  if (
    !isAuthenticated ||
    !token ||
    user?.role.trim().toLowerCase() !== 'admin' ||
    !adminRole ||
    adminRole.isActive === false ||
    adminRole.isDeleted === true
  ) {
    return <Navigate to="/login" replace />
  }

  if (
    requiredPermission &&
    !hasAuthPermission(adminRole, requiredPermission)
  ) {
    return <Navigate to={getAuthHomeRoute(adminRole)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
