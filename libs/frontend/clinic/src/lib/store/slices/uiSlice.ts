// libs/shared/src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    theme: 'light' | 'dark';
    isLoading: boolean;
    notification: {
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
        visible: boolean;
    } | null;
}

const initialState: UIState = {
    theme: 'light',
    isLoading: false,
    notification: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        showNotification: (state, action: PayloadAction<Omit<UIState['notification'], 'visible'>>) => {
            state.notification = { ...action.payload, visible: true };
        },
        hideNotification: (state) => {
            if (state.notification) {
                state.notification.visible = false;
            }
        },
        clearNotification: (state) => {
            state.notification = null;
        },
    },
});

export const { setTheme, setLoading, showNotification, hideNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;