import apiClient from '../api-client';
import  ENDPOINTS  from '../endpoints';

export interface LoginCredentials {
    phone: string;
    otp: string;
}

export interface SendOtpRequest {
    phone: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        phone: string;
        full_name: string;
        email?: string;
        roles: Array<{
            role: string;
            display_name: string;
            organization_id?: string;
            clinic_id?: string;
            permissions: string[];
        }>;
    };
}

export const authService = {
    sendOtp: async (data: SendOtpRequest): Promise<any> => {
        try {
            const response = await apiClient.post('/auth/send-otp', data);
            return response;
        } catch (error: any) {
            console.error('Send OTP error:', error);
            throw error;
        }
    },

    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response;
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post(ENDPOINTS.LOGOUT(), {});
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    getProfile: async () => {
        try {
            return await apiClient.get(ENDPOINTS.GET_PROFILE());
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    refreshToken: async () => {
        try {
            return await apiClient.post(ENDPOINTS.REFRESH_TOKEN(), {});
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    }
};