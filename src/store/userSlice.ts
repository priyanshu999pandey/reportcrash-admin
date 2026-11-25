import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserApiItem, UsersApiResponse, UsersState } from '../types'

const initialState: UsersState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  isLoading: true,
  error: '',
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUsersError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setUsers: (state, action: PayloadAction<UsersApiResponse>) => {
      state.items = action.payload.data
      state.total = action.payload.pagination.totalUsers
      state.page = action.payload.pagination.currentPage
      state.limit = action.payload.pagination.limit
      state.totalPages = action.payload.pagination.totalPages
      state.error = ''
    },
    updateStoredUser: (state, action: PayloadAction<UserApiItem>) => {
      const userIndex = state.items.findIndex(
        (user) => user.id === action.payload.id,
      )
      if (userIndex >= 0) state.items[userIndex] = action.payload
    },
  },
})

export const {
  setUsers,
  setUsersError,
  setUsersLoading,
  updateStoredUser,
} = userSlice.actions

export default userSlice.reducer
