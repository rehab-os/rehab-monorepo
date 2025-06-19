import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LoginResponseDto } from '@rehab/shared'
import { setTokenCookie, removeTokenCookie } from '@rehab/shared'

interface AuthState {
    isAuthenticated: boolean
    user: LoginResponseDto['user'] | null
    loading: boolean
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        loginSuccess: (state, action: PayloadAction<LoginResponseDto>) => {
            state.isAuthenticated = true
            state.user = action.payload.user
            state.loading = false
            setTokenCookie('access_token', action.payload.access_token)
            setTokenCookie('refresh_token', action.payload.refresh_token)
        },
        setUser: (state, action: PayloadAction<LoginResponseDto['user']>) => {
            state.user = action.payload
            state.isAuthenticated = true
        },
        logout: (state) => {
            state.isAuthenticated = false
            state.user = null
            removeTokenCookie('access_token')
            removeTokenCookie('refresh_token')
        },
    },
})

export const { setLoading, loginSuccess, setUser, logout } = authSlice.actions
export default authSlice.reducer