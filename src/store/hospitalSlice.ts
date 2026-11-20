import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { HospitalState, NearbyHospitalsResponse } from '../types'

const initialState: HospitalState = {
  items: [],
  total: 0,
  searchLocation: null,
  attribution: '',
  isLoading: true,
  error: '',
}

const hospitalSlice = createSlice({
  name: 'hospitals',
  initialState,
  reducers: {
    setHospitalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setHospitalError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setNearbyHospitals: (
      state,
      action: PayloadAction<NearbyHospitalsResponse>,
    ) => {
      state.items = action.payload.hospitals
      state.total = action.payload.totalHospitals
      state.searchLocation = action.payload.searchLocation
      state.attribution = action.payload.attribution
      state.error = ''
    },
  },
})

export const {
  setHospitalError,
  setHospitalLoading,
  setNearbyHospitals,
} = hospitalSlice.actions

export default hospitalSlice.reducer
