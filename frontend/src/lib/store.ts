import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from './services/auth'
import { chatApi } from './services/chat'
import { tutorApi } from './services/tutor'
import { studentApi } from './services/student'
import { profileApi } from './services/profile'
import { assignmentsApi } from './services/assignments'
import { submissionsApi } from './services/submissions'
import { proposalsApi } from './services/proposals'
import { customOffersApi } from './services/customOffers'
import { reportsApi } from './services/reports'
import { notificationsApi } from './services/notifications'

import authReducer from './features/auth/authSlice'
import uiReducer from './features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [tutorApi.reducerPath]: tutorApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [assignmentsApi.reducerPath]: assignmentsApi.reducer,
    [submissionsApi.reducerPath]: submissionsApi.reducer,
    [proposalsApi.reducerPath]: proposalsApi.reducer,
    [customOffersApi.reducerPath]: customOffersApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      chatApi.middleware,
      tutorApi.middleware,
      studentApi.middleware,
      profileApi.middleware,
      assignmentsApi.middleware,
      submissionsApi.middleware,
      proposalsApi.middleware,
      customOffersApi.middleware,
      reportsApi.middleware,
      notificationsApi.middleware
    ),
})

setupListeners(store.dispatch)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
