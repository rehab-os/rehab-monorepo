import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RoleResponseDto } from '@rehab/shared'

interface RoleState {
    roles: RoleResponseDto[]
    selectedRole: RoleResponseDto | null
    loading: boolean
    error: string | null
}

const initialState: RoleState = {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
}

export const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        setRoles: (state, action: PayloadAction<RoleResponseDto[]>) => {
            state.roles = action.payload
            state.loading = false
            state.error = null
        },
        setSelectedRole: (state, action: PayloadAction<RoleResponseDto>) => {
            state.selectedRole = action.payload
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

export const { setRoles, setSelectedRole, setLoading, setError } = roleSlice.actions
export default roleSlice.reducer