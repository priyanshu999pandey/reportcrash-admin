import { Navigate, Outlet } from 'react-router-dom'
import type { ProtectedRouteProps } from '../../types'
import { getHomeRoute } from '../../utils/permissions'

const ProtectedRoute = ({
  currentRole,
  allowedRoles,
}: ProtectedRouteProps) => {
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to={getHomeRoute(currentRole)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
