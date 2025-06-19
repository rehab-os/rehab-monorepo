export interface IPermissionsService {
    getUserPermissions(userId: string, organizationId?: string, clinicId?: string): Promise<string[]>;
}

export const PERMISSIONS_SERVICE_TOKEN = 'PERMISSIONS_SERVICE';