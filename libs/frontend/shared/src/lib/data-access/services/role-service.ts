import apiClient from '../api-client';
import { ENDPOINTS } from '../endpoints';

export interface CreateRoleDto {
    name: string;
    display_name: string;
    description?: string;
    is_system_role?: boolean;
}

export interface AssignPermissionsDto {
    permission_ids: string[];
}

export const roleService = {
    getAll: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.ROLES.BASE());
            return response.data || response;
        } catch (error) {
            console.error('Get roles error:', error);
            throw error;
        }
    },

    getOne: async (id: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ROLES.BY_ID(id));
            return response.data || response;
        } catch (error) {
            console.error('Get role error:', error);
            throw error;
        }
    },

    create: async (data: CreateRoleDto) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ROLES.BASE(), data);
            return response.data || response;
        } catch (error) {
            console.error('Create role error:', error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<CreateRoleDto>) => {
        try {
            const response = await apiClient.patch(ENDPOINTS.ROLES.BY_ID(id), data);
            return response.data || response;
        } catch (error) {
            console.error('Update role error:', error);
            throw error;
        }
    },

    assignPermissions: async (id: string, data: AssignPermissionsDto) => {
        try {
            const response = await apiClient.put(ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), data);
            return response.data || response;
        } catch (error) {
            console.error('Assign permissions error:', error);
            throw error;
        }
    },

    unassignPermissions: async (id: string, permissionIds: string[]) => {
        try {
            const response = await apiClient.delete(ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id));
            return response.data || response;
        } catch (error) {
            console.error('Unassign permissions error:', error);
            throw error;
        }
    },
};