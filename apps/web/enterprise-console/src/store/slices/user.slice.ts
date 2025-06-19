import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserResponseDto } from '@rehab/shared'

interface UserState {
    users: { users: UserResponseDto[]; total: number }
    selectedUser: UserResponseDto | null
    loading: boolean
    error: string | null
}

const initialState: UserState = {
    users: { users: [], total: 0 },
    selectedUser: null,
    loading: false,
    error: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<{ users: UserResponseDto[]; total: number }>) => {
            state.users = action.payload
            state.loading = false
            state.error = null
        },
        setSelectedUser: (state, action: PayloadAction<UserResponseDto>) => {
            state.selectedUser = action.payload
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.loading = false
        },
    },
})

export const { setUsers, setSelectedUser, setLoading, setError } = userSlice.actions
export default userSlice.reducer