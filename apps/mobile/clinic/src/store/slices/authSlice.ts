import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginResponseDto } from '@rehab/shared';

interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponseDto['user'] | null;
  loading: boolean;
  otpSent: boolean;
  otpVerifying: boolean;
  phoneNumber: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  otpSent: false,
  otpVerifying: false,
  phoneNumber: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOtpSent: (state, action: PayloadAction<boolean>) => {
      state.otpSent = action.payload;
    },
    setOtpVerifying: (state, action: PayloadAction<boolean>) => {
      state.otpVerifying = action.payload;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<LoginResponseDto>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
      state.otpSent = false;
      state.otpVerifying = false;
    },
    loginFailure: (state) => {
      state.loading = false;
      state.otpVerifying = false;
    },
    setUser: (state, action: PayloadAction<LoginResponseDto['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.otpSent = false;
      state.otpVerifying = false;
      state.phoneNumber = '';
    },
  },
});

export const {
  setLoading,
  setOtpSent,
  setOtpVerifying,
  setPhoneNumber,
  loginStart,
  loginSuccess,
  loginFailure,
  setUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;