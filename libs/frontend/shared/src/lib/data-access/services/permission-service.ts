import apiClient from '../api-client';
import { ENDPOINTS } from '../endpoints';

export interface CreatePermissionDto {
    resource: string;
    action: string;
    description?: string;
}

export const permissionService = {
    getAll: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.PERMISSIONS.BASE());
            return response.data || response;
        } catch (error) {
            console.error('Get permissions error:', error);
            throw error;
        }
    },

    getOne: async (id: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.PERMISSIONS.BY_ID(id));
            return response.data || response;
        } catch (error) {
            console.error('Get permission error:', error);
            throw error;
        }
    },

    create: async (data: CreatePermissionDto) => {
        try {
            const response = await apiClient.post(ENDPOINTS.PERMISSIONS.BASE(), data);
            return response.data || response;
        } catch (error) {
            console.error('Create permission error:', error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<CreatePermissionDto>) => {
        try {
            const response = await apiClient.patch(ENDPOINTS.PERMISSIONS.BY_ID(id), data);
            return response.data || response;
        } catch (error) {
            console.error('Update permission error:', error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            await apiClient.delete(ENDPOINTS.PERMISSIONS.BY_ID(id));
        } catch (error) {
            console.error('Delete permission error:', error);
            throw error;
        }
    },
};