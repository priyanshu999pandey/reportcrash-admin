import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AuthAdminRole,
  AuthPermission,
  RolesPermissionsState,
} from '../types'

const initialState: RolesPermissionsState = {
  roles: [],
  permissions: [],
  isLoading: true,
  error: '',
}

const getUniquePermissions = (roles: AuthAdminRole[]) => {
  const permissionsById = new Map<string, AuthPermission>()

  roles.forEach((role) => {
    role.permissions?.forEach((permission) => {
      permissionsById.set(permission._id, permission)
    })
  })

  return Array.from(permissionsById.values())
}

const rolePermissionSlice = createSlice({
  name: 'rolesPermissions',
  initialState,
  reducers: {
    setRolesPermissionsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setRolesPermissionsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setRoles: (state, action: PayloadAction<AuthAdminRole[]>) => {
      state.roles = action.payload.filter((role) => role.isDeleted !== true)
      state.permissions = getUniquePermissions(state.roles)
      state.error = ''
    },
    addRole: (state, action: PayloadAction<AuthAdminRole>) => {
      state.roles = [
        ...state.roles.filter((role) => role._id !== action.payload._id),
        action.payload,
      ]
      state.permissions = getUniquePermissions(state.roles)
    },
    updateStoredRole: (state, action: PayloadAction<AuthAdminRole>) => {
      const roleIndex = state.roles.findIndex(
        (role) => role._id === action.payload._id,
      )
      if (roleIndex >= 0) state.roles[roleIndex] = action.payload
      state.permissions = getUniquePermissions(state.roles)
    },
    removeStoredRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter((role) => role._id !== action.payload)
      state.permissions = getUniquePermissions(state.roles)
    },
  },
})

export const {
  addRole,
  removeStoredRole,
  setRoles,
  setRolesPermissionsError,
  setRolesPermissionsLoading,
  updateStoredRole,
} = rolePermissionSlice.actions

export default rolePermissionSlice.reducer
