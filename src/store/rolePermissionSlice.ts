import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AuthAdminRole,
  AuthPermission,
  RolesPermissionsState,
} from '../types'

const initialState: RolesPermissionsState = {
  roles: [],
  permissions: [],
  modules: [],
  isLoading: true,
  error: '',
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
      state.error = ''
    },
    setPermissions: (state, action: PayloadAction<AuthPermission[]>) => {
      state.permissions = action.payload.filter(
        (permission) => permission.isActive !== false,
      )
      state.error = ''
    },
    setPermissionModules: (state, action: PayloadAction<string[]>) => {
      state.modules = [...new Set(action.payload.map((module) => module.trim()))]
    },
    addRole: (state, action: PayloadAction<AuthAdminRole>) => {
      state.roles = [
        ...state.roles.filter((role) => role._id !== action.payload._id),
        action.payload,
      ]
    },
    updateStoredRole: (state, action: PayloadAction<AuthAdminRole>) => {
      const roleIndex = state.roles.findIndex(
        (role) => role._id === action.payload._id,
      )
      if (roleIndex >= 0) state.roles[roleIndex] = action.payload
    },
    removeStoredRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter((role) => role._id !== action.payload)
    },
  },
})

export const {
  addRole,
  removeStoredRole,
  setPermissionModules,
  setPermissions,
  setRoles,
  setRolesPermissionsError,
  setRolesPermissionsLoading,
  updateStoredRole,
} = rolePermissionSlice.actions

export default rolePermissionSlice.reducer
