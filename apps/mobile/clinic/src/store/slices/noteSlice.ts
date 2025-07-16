import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Note {
  id: string;
  visit_id: string;
  created_by: string;
  note_type: 'SOAP' | 'DAP' | 'PROGRESS';
  note_data: {
    // SOAP Note structure
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    // DAP Note structure
    data?: string;
    // Progress Note structure
    progress?: string;
    interventions?: string;
    response?: string;
  };
  additional_notes?: string;
  treatment_codes?: string[];
  treatment_details?: string;
  goals?: string;
  outcome_measures?: string;
  attachments?: string[];
  is_signed: boolean;
  signed_by?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  visit?: any;
  creator?: any;
}

interface NoteState {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  editingNote: Note | null;
  noteType: 'SOAP' | 'DAP' | 'PROGRESS';
  formData: {
    visit_id: string;
    note_type: 'SOAP' | 'DAP' | 'PROGRESS';
    note_data: {
      subjective?: string;
      objective?: string;
      assessment?: string;
      plan?: string;
      data?: string;
      progress?: string;
      interventions?: string;
      response?: string;
    };
    additional_notes?: string;
    treatment_codes?: string[];
    treatment_details?: string;
    goals?: string;
    outcome_measures?: string;
    attachments?: string[];
  };
}

const initialState: NoteState = {
  notes: [],
  selectedNote: null,
  loading: false,
  error: null,
  editingNote: null,
  noteType: 'SOAP',
  formData: {
    visit_id: '',
    note_type: 'SOAP',
    note_data: {},
    additional_notes: '',
    treatment_codes: [],
    treatment_details: '',
    goals: '',
    outcome_measures: '',
    attachments: [],
  },
};

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
      state.error = null;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload);
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
      if (state.selectedNote?.id === action.payload.id) {
        state.selectedNote = action.payload;
      }
      if (state.editingNote?.id === action.payload.id) {
        state.editingNote = action.payload;
      }
    },
    removeNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(n => n.id !== action.payload);
      if (state.selectedNote?.id === action.payload) {
        state.selectedNote = null;
      }
      if (state.editingNote?.id === action.payload) {
        state.editingNote = null;
      }
    },
    setSelectedNote: (state, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload;
    },
    setEditingNote: (state, action: PayloadAction<Note | null>) => {
      state.editingNote = action.payload;
      if (action.payload) {
        state.formData = {
          visit_id: action.payload.visit_id,
          note_type: action.payload.note_type,
          note_data: action.payload.note_data,
          additional_notes: action.payload.additional_notes || '',
          treatment_codes: action.payload.treatment_codes || [],
          treatment_details: action.payload.treatment_details || '',
          goals: action.payload.goals || '',
          outcome_measures: action.payload.outcome_measures || '',
          attachments: action.payload.attachments || [],
        };
        state.noteType = action.payload.note_type;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setNoteType: (state, action: PayloadAction<'SOAP' | 'DAP' | 'PROGRESS'>) => {
      state.noteType = action.payload;
      state.formData.note_type = action.payload;
      // Clear note data when switching types
      state.formData.note_data = {};
    },
    updateFormData: (state, action: PayloadAction<Partial<NoteState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    updateNoteData: (state, action: PayloadAction<Partial<NoteState['formData']['note_data']>>) => {
      state.formData.note_data = { ...state.formData.note_data, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = {
        visit_id: '',
        note_type: 'SOAP',
        note_data: {},
        additional_notes: '',
        treatment_codes: [],
        treatment_details: '',
        goals: '',
        outcome_measures: '',
        attachments: [],
      };
      state.noteType = 'SOAP';
      state.editingNote = null;
      state.error = null;
    },
    resetNotes: (state) => {
      state.notes = [];
      state.selectedNote = null;
      state.editingNote = null;
      state.error = null;
    },
  },
});

export const {
  setNotes,
  addNote,
  updateNote,
  removeNote,
  setSelectedNote,
  setEditingNote,
  setLoading,
  setError,
  setNoteType,
  updateFormData,
  updateNoteData,
  resetForm,
  resetNotes,
} = noteSlice.actions;

export default noteSlice.reducer;