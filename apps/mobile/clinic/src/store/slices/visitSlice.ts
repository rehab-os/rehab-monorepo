import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Visit {
  id: string;
  patient_id: string;
  clinic_id: string;
  physiotherapist_id: string;
  visit_type: 'INITIAL' | 'FOLLOW_UP' | 'DISCHARGE' | 'ASSESSMENT';
  status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  scheduled_date: string;
  scheduled_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  duration_minutes: number;
  chief_complaint?: string;
  vital_signs?: any;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  physiotherapist?: any;
  notes?: any[];
}

interface VisitState {
  visits: Visit[];
  total: number;
  selectedVisit: Visit | null;
  loading: boolean;
  error: string | null;
  filters: {
    clinic_id?: string;
    patient_id?: string;
    physiotherapist_id?: string;
    status?: string;
    visit_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
  page: number;
  limit: number;
}

const initialState: VisitState = {
  visits: [],
  total: 0,
  selectedVisit: null,
  loading: false,
  error: null,
  filters: {},
  page: 1,
  limit: 20,
};

export const visitSlice = createSlice({
  name: 'visit',
  initialState,
  reducers: {
    setVisits: (state, action: PayloadAction<{ visits: Visit[]; total: number }>) => {
      state.visits = Array.isArray(action.payload.visits) ? action.payload.visits : [];
      state.total = action.payload.total || 0;
      state.error = null;
    },
    addVisit: (state, action: PayloadAction<Visit>) => {
      if (!Array.isArray(state.visits)) {
        state.visits = [];
      }
      state.visits.unshift(action.payload);
      state.total += 1;
    },
    updateVisit: (state, action: PayloadAction<Visit>) => {
      if (!Array.isArray(state.visits)) {
        state.visits = [];
      }
      const index = state.visits.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.visits[index] = action.payload;
      }
      if (state.selectedVisit?.id === action.payload.id) {
        state.selectedVisit = action.payload;
      }
    },
    removeVisit: (state, action: PayloadAction<string>) => {
      state.visits = state.visits.filter(v => v.id !== action.payload);
      state.total -= 1;
      if (state.selectedVisit?.id === action.payload) {
        state.selectedVisit = null;
      }
    },
    setSelectedVisit: (state, action: PayloadAction<Visit | null>) => {
      state.selectedVisit = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<VisitState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetVisits: (state) => {
      state.visits = [];
      state.total = 0;
      state.selectedVisit = null;
      state.error = null;
      state.page = 1;
    },
  },
});

export const {
  setVisits,
  addVisit,
  updateVisit,
  removeVisit,
  setSelectedVisit,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  setPage,
  resetVisits,
} = visitSlice.actions;

export default visitSlice.reducer;