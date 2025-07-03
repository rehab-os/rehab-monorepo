// libs/shared/src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import organizationReducer from './slices/organizationSlice';
import clinicReducer from './slices/clinicSlice';
import roleReducer from './slices/roleSlice';
import uiReducer from './slices/uiSlice';

// Persist config
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
    whitelist: ['auth', 'user'], // Only persist auth and user data
    blacklist: ['ui'], // Don't persist UI state
};

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    organization: organizationReducer,
    clinic: clinicReducer,
    role: roleReducer,
    ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;