import apiClient from '../api-client';
import { ENDPOINTS } from '../endpoints';

export interface CreateClinicDto {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export const clinicService = {
    getAll: async (organizationId?: string) => {
        try {
            const headers = organizationId ? { 'x-organization-id': organizationId } : {};
            const response = await apiClient.get(ENDPOINTS.CLINICS.BASE());
            return response.data || response;
        } catch (error) {
            console.error('Get clinics error:', error);
            throw error;
        }
    },

    getOne: async (id: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.CLINICS.BY_ID(id));
            return response.data || response;
        } catch (error) {
            console.error('Get clinic error:', error);
            throw error;
        }
    },

    create: async (organizationId: string, data: CreateClinicDto) => {
        try {
            const response = await apiClient.post(ENDPOINTS.CLINICS.BASE(), data);
            return response.data || response;
        } catch (error) {
            console.error('Create clinic error:', error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<CreateClinicDto>) => {
        try {
            const response = await apiClient.patch(ENDPOINTS.CLINICS.BY_ID(id), data);
            return response.data || response;
        } catch (error) {
            console.error('Update clinic error:', error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            await apiClient.delete(ENDPOINTS.CLINICS.BY_ID(id));
        } catch (error) {
            console.error('Delete clinic error:', error);
            throw error;
        }
    },
};