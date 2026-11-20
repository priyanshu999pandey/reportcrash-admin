import type { AdminRole, UserProfileRow, UserRole } from '../types'

export const fullAccessRoles: readonly AdminRole[] = ['Super Admin', 'Admin']

export const allAdminRoles: readonly AdminRole[] = [
  'Super Admin',
  'Admin',
  'Content Admin',
]

export const superAdminRoles: readonly AdminRole[] = ['Super Admin']

export const getHomeRoute = (role: AdminRole) =>
  role === 'Content Admin' ? '/safety-tips' : '/dashboard'

export const getVisibleUserRoles = (role: AdminRole): readonly UserRole[] =>
  role === 'Super Admin'
    ? ['Admin', 'Content Admin', 'User']
    : role === 'Admin'
      ? ['Content Admin', 'User']
      : ['User']

export const canViewUser = (role: AdminRole, user: UserProfileRow) =>
  getVisibleUserRoles(role).includes(user.role)

export const getCreatableRoles = (role: AdminRole): readonly AdminRole[] =>
  role === 'Super Admin'
    ? ['Admin', 'Content Admin']
    : role === 'Admin'
      ? ['Content Admin']
      : []
