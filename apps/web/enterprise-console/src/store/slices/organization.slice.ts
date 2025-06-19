import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrganizationResponseDto } from '@rehab/shared'

interface OrganizationState {
    organizations: OrganizationResponseDto[]
    selectedOrganization: OrganizationResponseDto | null
    loading: boolean
    error: string | null
}

const initialState: OrganizationState = {
    organizations: [],
    selectedOrganization: null,
    loading: false,
    error: null,
}

export const organizationSlice = createSlice({
    name: 'organization',
    initialState,
    reducers: {
        setOrganizations: (state, action: PayloadAction<OrganizationResponseDto[]>) => {
            state.organizations = action.payload
            state.loading = false
            state.error = null
        },
        setSelectedOrganization: (state, action: PayloadAction<OrganizationResponseDto>) => {
            state.selectedOrganization = action.payload
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

export const { setOrganizations, setSelectedOrganization, setLoading, setError } = organizationSlice.actions
export default organizationSlice.reducer