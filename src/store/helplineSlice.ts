import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { EmergencyHelpline, EmergencyHelplineState } from '../types'

const initialState: EmergencyHelplineState = {
  items: [],
  isLoading: false,
  error: '',
}

const helplineSlice = createSlice({
  name: 'helplines',
  initialState,
  reducers: {
    setHelplineLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setHelplineError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setHelplines: (state, action: PayloadAction<EmergencyHelpline[]>) => {
      state.items = action.payload
      state.error = ''
    },
    saveHelpline: (state, action: PayloadAction<EmergencyHelpline>) => {
      const itemIndex = state.items.findIndex(
        (helpline) => helpline._id === action.payload._id,
      )

      if (itemIndex === -1) {
        state.items.unshift(action.payload)
      } else {
        state.items[itemIndex] = action.payload
      }
    },
    removeHelpline: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (helpline) => helpline._id !== action.payload,
      )
    },
  },
})

export const {
  removeHelpline,
  saveHelpline,
  setHelplineError,
  setHelplineLoading,
  setHelplines,
} = helplineSlice.actions

export default helplineSlice.reducer
