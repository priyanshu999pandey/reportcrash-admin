import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './blogSlice'
import helplineReducer from './helplineSlice'
import hospitalReducer from './hospitalSlice'
import authReducer from './authSlice'
import accidentReportReducer from './accidentReportSlice'
import rolePermissionReducer from './rolePermissionSlice'

export const store = configureStore({
  reducer: {
    blogs: blogReducer,
    helplines: helplineReducer,
    hospitals: hospitalReducer,
    auth: authReducer,
    accidentReports: accidentReportReducer,
    rolesPermissions: rolePermissionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
