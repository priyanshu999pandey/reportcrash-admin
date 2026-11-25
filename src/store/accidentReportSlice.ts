import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AccidentReportApiItem,
  AccidentReportsState,
} from '../types'

const initialState: AccidentReportsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  selectedReport: null,
  isLoading: true,
  error: '',
  isDetailLoading: false,
  detailError: '',
}

const accidentReportSlice = createSlice({
  name: 'accidentReports',
  initialState,
  reducers: {
    setAccidentReportsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAccidentReportsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setAccidentReports: (
      state,
      action: PayloadAction<{
        items: AccidentReportApiItem[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }>,
    ) => {
      state.items = action.payload.items
      state.total = action.payload.pagination.total
      state.page = action.payload.pagination.page
      state.limit = action.payload.pagination.limit
      state.totalPages = action.payload.pagination.totalPages
      state.error = ''
    },
    setAccidentReportDetailLoading: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isDetailLoading = action.payload
    },
    setAccidentReportDetailError: (state, action: PayloadAction<string>) => {
      state.detailError = action.payload
    },
    setSelectedAccidentReport: (
      state,
      action: PayloadAction<AccidentReportApiItem>,
    ) => {
      state.selectedReport = action.payload
      state.detailError = ''
      const reportIndex = state.items.findIndex(
        (report) => report._id === action.payload._id,
      )
      if (reportIndex >= 0) state.items[reportIndex] = action.payload
    },
    removeAccidentReport: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (report) => report._id !== action.payload,
      )
      state.total = Math.max(0, state.total - 1)
      state.totalPages = Math.max(1, Math.ceil(state.total / state.limit))
      if (state.selectedReport?._id === action.payload) {
        state.selectedReport = null
      }
    },
    updateAccidentReportStatus: (
      state,
      action: PayloadAction<{ reportId: string; status: string }>,
    ) => {
      const report = state.items.find(
        (item) => item._id === action.payload.reportId,
      )
      if (report) report.status = action.payload.status
      if (state.selectedReport?._id === action.payload.reportId) {
        state.selectedReport.status = action.payload.status
      }
    },
  },
})

export const {
  removeAccidentReport,
  setAccidentReportDetailError,
  setAccidentReportDetailLoading,
  setAccidentReports,
  setAccidentReportsError,
  setAccidentReportsLoading,
  setSelectedAccidentReport,
  updateAccidentReportStatus,
} = accidentReportSlice.actions

export default accidentReportSlice.reducer
