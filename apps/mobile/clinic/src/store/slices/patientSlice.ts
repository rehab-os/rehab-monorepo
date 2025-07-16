import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCHARGED';
  created_at: string;
  visits?: any[];
}

interface PatientState {
  patients: Patient[];
  total: number;
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: 'all' | 'ACTIVE' | 'INACTIVE' | 'DISCHARGED';
  page: number;
  viewMode: 'grid' | 'list';
}

const initialState: PatientState = {
  patients: [],
  total: 0,
  selectedPatient: null,
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'all',
  page: 1,
  viewMode: 'grid',
};

export const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setPatients: (state, action: PayloadAction<{ patients: Patient[]; total: number }>) => {
      state.patients = action.payload.patients;
      state.total = action.payload.total;
      state.error = null;
    },
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'all' | 'ACTIVE' | 'INACTIVE' | 'DISCHARGED'>) => {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    resetPatients: (state) => {
      state.patients = [];
      state.total = 0;
      state.selectedPatient = null;
      state.error = null;
      state.page = 1;
    },
  },
});

export const {
  setPatients,
  setSelectedPatient,
  setLoading,
  setError,
  setSearchTerm,
  setStatusFilter,
  setPage,
  setViewMode,
  resetPatients,
} = patientSlice.actions;

export default patientSlice.reducer;