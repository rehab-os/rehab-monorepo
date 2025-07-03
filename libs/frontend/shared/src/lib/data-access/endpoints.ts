export const ENDPOINTS = {
    // Auth
    SEND_OTP: () => 'auth/send-otp',
    LOGIN: () => 'auth/login',
    GET_ME: () => 'auth/me',

    // Organizations
    GET_ORGANIZATIONS: () => 'organizations',
    GET_ORGANIZATION: (id: string) => `organizations/${id}`,
    CREATE_ORGANIZATION: () => 'organizations',
    UPDATE_ORGANIZATION: (id: string) => `organizations/${id}`,
    DELETE_ORGANIZATION: (id: string) => `organizations/${id}`,

    // Clinics
    GET_CLINICS: () => 'clinics',
    GET_CLINIC: (id: string) => `clinics/${id}`,
    CREATE_CLINIC: () => 'clinics',
    UPDATE_CLINIC: (id: string) => `clinics/${id}`,
    DELETE_CLINIC: (id: string) => `clinics/${id}`,

    // Users
    GET_USERS: () => 'users',
    GET_USER: (id: string) => `users/${id}`,
    CREATE_USER: () => 'users',
    UPDATE_USER: (id: string) => `users/${id}`,
    DELETE_USER: (id: string) => `users/${id}`,
    ASSIGN_ROLE: (id: string) => `users/${id}/assign-role`,
    REMOVE_ROLE: (userId: string, roleId: string) => `users/${userId}/roles/${roleId}`,
    GET_USER_PERMISSIONS: (id: string) => `users/${id}/permissions`,
    UPDATE_PROFILE: () => 'users/me',

    // Roles
    GET_ROLES: () => 'roles',
    GET_ROLE: (id: string) => `roles/${id}`,
    CREATE_ROLE: () => 'roles',
    UPDATE_ROLE: (id: string) => `roles/${id}`,
    DELETE_ROLE: (id: string) => `roles/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `roles/${id}/permissions`,
    UNASSIGN_PERMISSIONS: (id: string) => `roles/${id}/permissions`,

    // Permissions
    GET_PERMISSIONS: () => 'permissions',
    GET_PERMISSION: (id: string) => `permissions/${id}`,
    CREATE_PERMISSION: () => 'permissions',
    UPDATE_PERMISSION: (id: string) => `permissions/${id}`,
    DELETE_PERMISSION: (id: string) => `permissions/${id}`,

    // Team Management
    GET_TEAM_MEMBERS: () => 'team/members',
    ADD_TEAM_MEMBER: () => 'team/members',
    REMOVE_TEAM_MEMBER: (userId: string) => `team/members/${userId}`,
    UPDATE_TEAM_MEMBER_ROLE: (userId: string) => `team/members/${userId}/role`,
}

// export default ENDPOINTS