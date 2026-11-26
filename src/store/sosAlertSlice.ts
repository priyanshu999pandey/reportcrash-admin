import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  SosAlertApiItem,
  SosAlertsApiResponse,
  SosAlertsState,
} from '../types'

const initialState: SosAlertsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  selectedAlert: null,
  isLoading: false,
  error: '',
  isDetailLoading: false,
  detailError: '',
}

const sosAlertSlice = createSlice({
  name: 'sosAlerts',
  initialState,
  reducers: {
    setSosAlertsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSosAlertsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setSosAlerts: (state, action: PayloadAction<SosAlertsApiResponse>) => {
      state.items = action.payload.data
      state.total = action.payload.pagination.total
      state.page = action.payload.pagination.page
      state.limit = action.payload.pagination.limit
      state.totalPages = Math.max(1, action.payload.pagination.totalPages)
      state.error = ''
    },
    setSelectedSosAlert: (
      state,
      action: PayloadAction<SosAlertApiItem | null>,
    ) => {
      state.selectedAlert = action.payload
      state.detailError = ''
    },
    setSosAlertDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.isDetailLoading = action.payload
    },
    setSosAlertDetailError: (state, action: PayloadAction<string>) => {
      state.detailError = action.payload
    },
    updateSosAlertStatus: (
      state,
      action: PayloadAction<{
        sosId: string
        status: string
        updatedAt?: string
        statusHistory?: SosAlertApiItem['statusHistory']
      }>,
    ) => {
      const alert = state.items.find((item) => item._id === action.payload.sosId)
      if (alert) {
        alert.status = action.payload.status
        if (action.payload.updatedAt) alert.updatedAt = action.payload.updatedAt
        if (action.payload.statusHistory) {
          alert.statusHistory = action.payload.statusHistory
        }
      }
      if (state.selectedAlert?._id === action.payload.sosId) {
        state.selectedAlert.status = action.payload.status
        if (action.payload.updatedAt) {
          state.selectedAlert.updatedAt = action.payload.updatedAt
        }
        if (action.payload.statusHistory) {
          state.selectedAlert.statusHistory = action.payload.statusHistory
        }
      }
    },
  },
})

export const {
  setSelectedSosAlert,
  setSosAlertDetailError,
  setSosAlertDetailLoading,
  setSosAlerts,
  setSosAlertsError,
  setSosAlertsLoading,
  updateSosAlertStatus,
} = sosAlertSlice.actions

export default sosAlertSlice.reducer
