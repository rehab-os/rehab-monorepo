import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ClinicResponseDto } from '@rehab/shared'

interface ClinicState {
    clinics: ClinicResponseDto[]
    selectedClinic: ClinicResponseDto | null
    loading: boolean
    error: string | null
}

const initialState: ClinicState = {
    clinics: [],
    selectedClinic: null,
    loading: false,
    error: null,
}

export const clinicSlice = createSlice({
    name: 'clinic',
    initialState,
    reducers: {
        setClinics: (state, action: PayloadAction<ClinicResponseDto[]>) => {
            state.clinics = action.payload
            state.loading = false
            state.error = null
        },
        setSelectedClinic: (state, action: PayloadAction<ClinicResponseDto>) => {
            state.selectedClinic = action.payload
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

export const { setClinics, setSelectedClinic, setLoading, setError } = clinicSlice.actions
export default clinicSlice.reducer