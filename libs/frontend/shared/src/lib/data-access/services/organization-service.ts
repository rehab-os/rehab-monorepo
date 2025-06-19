import apiClient from '../api-client';
import { ENDPOINTS } from '../endpoints';

export interface CreateOrganizationDto {
    name: string;
    type: string;
    registration_no?: string;
    gst_no?: string;
    pan_no?: string;
    bank_details?: Record<string, any>;
    admin_phone: string;
    admin_name: string;
    admin_email?: string;
}

export const organizationService = {
    getAll: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.ORGANIZATIONS.BASE());
            return response.data || response;
        } catch (error) {
            console.error('Get organizations error:', error);
            throw error;
        }
    },

    getOne: async (id: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ORGANIZATIONS.BY_ID(id));
            return response.data || response;
        } catch (error) {
            console.error('Get organization error:', error);
            throw error;
        }
    },

    create: async (data: CreateOrganizationDto) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ORGANIZATIONS.BASE(), data);
            return response.data || response;
        } catch (error) {
            console.error('Create organization error:', error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<CreateOrganizationDto>) => {
        try {
            const response = await apiClient.patch(ENDPOINTS.ORGANIZATIONS.BY_ID(id), data);
            return response.data || response;
        } catch (error) {
            console.error('Update organization error:', error);
            throw error;
        }
    },
};