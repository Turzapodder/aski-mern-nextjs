import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from './services/auth'
import { chatApi } from './services/chat'
import { tutorApi } from './services/tutor'
import { studentApi } from './services/student'
import { profileApi } from './services/profile'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [tutorApi.reducerPath]: tutorApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      chatApi.middleware,
      tutorApi.middleware,
      studentApi.middleware,
      profileApi.middleware
    ),
})

setupListeners(store.dispatch)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch