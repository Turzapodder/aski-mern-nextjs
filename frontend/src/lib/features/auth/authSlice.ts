import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  isVerified: boolean;
  status: string;
  walletBalance: number;
}

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  user: UserProfile | null;
}

// Initialize state from cookies if available, otherwise default to false/null.
// We do not load `user` from cookies as it can be large/stale and is fetched separately.
const initialState: AuthState = {
  isAuthenticated: Cookies.get('is_auth') === 'true',
  userRole: Cookies.get('user_role') || null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; role: string }>
    ) => {
      state.user = action.payload.user;
      state.userRole = action.payload.role;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.userRole = null;
      state.isAuthenticated = false;
      // Also clear cookies when explicitly dispatched
      Cookies.remove('is_auth');
      Cookies.remove('user_role');
      Cookies.remove('access_token');
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, logout, setUserProfile } = authSlice.actions;
export default authSlice.reducer;
