import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthAdminRole, AuthUser } from '../types'
import { loadAuthSession } from '../utils/auth'

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthSession(),
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        token: string
        user: AuthUser
        adminRole: AuthAdminRole
      }>,
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.adminRole = action.payload.adminRole
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.adminRole = null
      state.isAuthenticated = false
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
