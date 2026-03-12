import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

// Start unauthenticated — the app hydrates via getMe query on mount
const initialState: AuthState = {
  isAuthenticated: false,
  userRole: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: UserProfile; role: string }>) => {
      state.user = action.payload.user;
      state.userRole = action.payload.role;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.userRole = null;
      state.isAuthenticated = false;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, logout, setUserProfile } = authSlice.actions;
export default authSlice.reducer;
