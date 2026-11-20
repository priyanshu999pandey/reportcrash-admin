import type { AdminRole, AuthAdminRole, AuthState } from '../types'

const authSessionKey = 'reportCrashAuth'

export const loadAuthSession = (): AuthState => {
  const emptySession: AuthState = {
    token: null,
    user: null,
    adminRole: null,
    isAuthenticated: false,
  }

  try {
    const savedSession = localStorage.getItem(authSessionKey)
    if (!savedSession) return emptySession
    const session = JSON.parse(savedSession) as AuthState
    return session.token &&
      session.user?.role.trim().toLowerCase() === 'admin' &&
      session.adminRole &&
      session.adminRole.isActive !== false &&
      session.adminRole.isDeleted !== true
      ? { ...session, isAuthenticated: true }
      : emptySession
  } catch {
    return emptySession
  }
}

export const saveAuthSession = (session: AuthState) => {
  localStorage.setItem(authSessionKey, JSON.stringify(session))
  if (session.token) localStorage.setItem('authToken', session.token)
}

export const clearAuthSession = () => {
  localStorage.removeItem(authSessionKey)
  localStorage.removeItem('authToken')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('token')
}

export const isSuperAdminRole = (role: AuthAdminRole | null) =>
  role?.slug === 'super-admin' || role?.name.toLowerCase() === 'super admin'

export const hasAuthPermission = (
  role: AuthAdminRole | null,
  permission: string,
) =>
  role?.isActive !== false &&
  role?.isDeleted !== true &&
  (isSuperAdminRole(role) ||
    Boolean(role?.permissions?.some((item) => item.key === permission)))

export const getAuthHomeRoute = (role: AuthAdminRole | null) => {
  if (hasAuthPermission(role, 'dashboard:read')) return '/dashboard'
  if (hasAuthPermission(role, 'safety-tips:read')) return '/safety-tips'
  if (hasAuthPermission(role, 'users:read')) return '/users'
  if (hasAuthPermission(role, 'reports:read')) return '/accident-reports'
  if (hasAuthPermission(role, 'sos-alerts:read')) return '/sos-alerts'
  if (hasAuthPermission(role, 'helplines:read')) return '/emergency-helplines'
  return '/login'
}

export const getLegacyAdminRole = (role: AuthAdminRole | null): AdminRole => {
  if (isSuperAdminRole(role)) return 'Super Admin'

  const permissions = role?.permissions?.map((item) => item.key) ?? []
  const onlyContentPermissions =
    permissions.length > 0 &&
    permissions.every(
      (permission) =>
        permission.startsWith('safety-tips:') ||
        permission.startsWith('blogs:'),
    )

  return onlyContentPermissions ? 'Content Admin' : 'Admin'
}
