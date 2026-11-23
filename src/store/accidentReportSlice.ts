import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AccidentReportApiItem,
  AccidentReportsState,
} from '../types'

const initialState: AccidentReportsState = {
  items: [],
  total: 0,
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
      action: PayloadAction<{ items: AccidentReportApiItem[]; total: number }>,
    ) => {
      state.items = action.payload.items
      state.total = action.payload.total
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
      if (state.selectedReport?._id === action.payload) {
        state.selectedReport = null
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
} = accidentReportSlice.actions

export default accidentReportSlice.reducer
