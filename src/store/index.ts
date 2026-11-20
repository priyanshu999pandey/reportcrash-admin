import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './blogSlice'
import helplineReducer from './helplineSlice'
import hospitalReducer from './hospitalSlice'

export const store = configureStore({
  reducer: {
    blogs: blogReducer,
    helplines: helplineReducer,
    hospitals: hospitalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
