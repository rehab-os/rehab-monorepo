// libs/shared/src/store/slices/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LoginDto, SendOtpDto, LoginResponseDto } from '@rehab/common';
import ApiManager from '../../services/ApiManager';

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: LoginResponseDto['user'] | null;
    loading: boolean;
    error: string | null;
    otpSent: boolean;
    phoneNumber: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    loading: false,
    error: null,
    otpSent: false,
    phoneNumber: null,
};

// Async thunks
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (data: SendOtpDto) => {
        const response = await ApiManager.sendOtp(data);
        if (!response.success) {
            throw new Error(response.message);
        }
        return { phone: data.phone, ...response.data };
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (data: LoginDto) => {
        const response = await ApiManager.login(data);
        if (!response.success) {
            throw new Error(response.message);
        }
        return response.data;
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async () => {
        const response = await ApiManager.getMe();
        if (!response.success) {
            throw new Error(response.message);
        }
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.error = null;
            state.otpSent = false;
            state.phoneNumber = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
    },
    extraReducers: (builder) => {
        // Send OTP
        builder
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.otpSent = true;
                state.phoneNumber = action.payload.phone;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to send OTP';
            });

        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.accessToken = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
                state.user = action.payload.user;
                state.otpSent = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Invalid OTP';
            });

        // Fetch current user
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch user data';
                // If fetch user fails, logout
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
            });
    },
});

export const { logout, clearError, setTokens } = authSlice.actions;
export default authSlice.reducer;