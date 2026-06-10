import { configureStore, combineReducers, UnknownAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './services/auth';
import { submissionsApi } from './services/submissions';

import authReducer from './features/auth/authSlice';
import uiReducer from './features/ui/uiSlice';
import { rtkToastMiddleware } from './middleware/rtkToastMiddleware';

// 1. Combine all reducers (admin-only: auth + ui + authApi + submissionsApi)
const combinedReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [authApi.reducerPath]: authApi.reducer,
  [submissionsApi.reducerPath]: submissionsApi.reducer,
});

// 2. Define rootReducer that resets the entire Redux state on logout
const rootReducer = (state: ReturnType<typeof combinedReducer> | undefined, action: UnknownAction) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      rtkToastMiddleware,
      authApi.middleware,
      submissionsApi.middleware
    ),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
