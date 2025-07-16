import { configureStore } from '@reduxjs/toolkit';
import { authSlice, organizationSlice, clinicSlice, userSlice } from './slices';
import patientReducer from './slices/patientSlice';
import visitReducer from './slices/visitSlice';
import noteReducer from './slices/noteSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    organization: organizationSlice.reducer,
    clinic: clinicSlice.reducer,
    user: userSlice.reducer,
    patient: patientReducer,
    visit: visitReducer,
    note: noteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;