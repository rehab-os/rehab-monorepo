import { configureStore } from '@reduxjs/toolkit';
import { authSlice, organizationSlice, clinicSlice, userSlice } from './slices';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    organization: organizationSlice.reducer,
    clinic: clinicSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;