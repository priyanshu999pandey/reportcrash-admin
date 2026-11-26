import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './blogSlice'
import helplineReducer from './helplineSlice'
import authReducer from './authSlice'
import accidentReportReducer from './accidentReportSlice'
import rolePermissionReducer from './rolePermissionSlice'
import userReducer from './userSlice'
import sosAlertReducer from './sosAlertSlice'

export const store = configureStore({
  reducer: {
    blogs: blogReducer,
    helplines: helplineReducer,
    auth: authReducer,
    accidentReports: accidentReportReducer,
    rolesPermissions: rolePermissionReducer,
    users: userReducer,
    sosAlerts: sosAlertReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
