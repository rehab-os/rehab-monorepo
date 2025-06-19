import apiClient from '../api-client';
import { ENDPOINTS } from '../endpoints';

export interface CreateUserDto {
    phone: string;
    full_name: string;
    email?: string;
    role_id: string;
}

export const userService = {
    getAll: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.USERS.BASE());
            return response.data || response;
        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    },

    getOne: async (id: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.USERS.BY_ID(id));
            return response.data || response;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    },

    create: async (data: CreateUserDto) => {
        try {
            const response = await apiClient.post(ENDPOINTS.USERS.BASE(), data);
            return response.data || response;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<CreateUserDto>) => {
        try {
            const response = await apiClient.patch(ENDPOINTS.USERS.BY_ID(id), data);
            return response.data || response;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },
};