export interface LoginDto {
    phone: string
    otp: string
}

export interface SendOtpDto {
    phone: string
}

export interface LoginResponseDto {
    access_token: string
    refresh_token: string
    user: {
        id: string
        phone: string
        full_name: string
        email?: string
        roles: Array<{
            role: string
            display_name: string
            organization_id?: string
            clinic_id?: string
            permissions: string[]
        }>
    }
}

// Organization Types
export enum OrganizationType {
    ONLY_PHYSIO = 'CHAIN',
    MULTI_SPECIALTY = 'SINGLE_CHAIN',
}

export interface CreateOrganizationDto {
    name: string
    type: OrganizationType
    registration_no?: string
    gst_no?: string
    pan_no?: string
    bank_details?: Record<string, any>
    admin_phone: string
    admin_name: string
    admin_email?: string
}

export type UpdateOrganizationDto = Partial<CreateOrganizationDto>

export interface OrganizationResponseDto {
    id: string
    name: string
    slug: string
    type: OrganizationType
    registration_no?: string
    gst_no?: string
    pan_no?: string
    logo_url?: string
    created_by: string
    is_active: boolean
    created_at: Date
    updated_at: Date
}

// Clinic Types
export interface CreateClinicDto {
    name: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    email?: string
    latitude?: number
    longitude?: number
    working_hours?: Record<string, any>
    facilities?: string[]
    total_beds?: number
    admin_phone: string
}

export type UpdateClinicDto = Partial<CreateClinicDto>

export interface ClinicResponseDto {
    id: string
    organization_id: string
    name: string
    code: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    email?: string
    latitude?: number
    longitude?: number
    working_hours?: Record<string, any>
    facilities?: string[]
    total_beds?: number
    is_active: boolean
    created_at: Date
    updated_at: Date
}

// User Types
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum BloodGroup {
    A_POSITIVE = 'A_POSITIVE',
    A_NEGATIVE = 'A_NEGATIVE',
    B_POSITIVE = 'B_POSITIVE',
    B_NEGATIVE = 'B_NEGATIVE',
    AB_POSITIVE = 'AB_POSITIVE',
    AB_NEGATIVE = 'AB_NEGATIVE',
    O_POSITIVE = 'O_POSITIVE',
    O_NEGATIVE = 'O_NEGATIVE',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export interface CreateUserDto {
    phone: string
    full_name: string
    email?: string
    date_of_birth?: string
    gender?: Gender
    blood_group?: BloodGroup
    emergency_contact?: string
    address?: string
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
    user_status?: UserStatus
}

export interface UpdateProfileDto {
    full_name?: string
    email?: string
    date_of_birth?: string
    gender?: Gender
    blood_group?: BloodGroup
    emergency_contact?: string
    address?: string
    profile_photo_url?: string
}

export interface AssignRoleDto {
    roleId: string
    organizationId?: string
    clinicId?: string
}

export interface UserListQueryDto {
    organizationId?: string
    clinicId?: string
    role?: string
    status?: UserStatus
    page?: number
    limit?: number
}

export interface UserResponseDto {
    id: string
    phone: string
    full_name: string
    email?: string
    date_of_birth?: Date
    gender?: Gender
    profile_photo_url?: string
    blood_group?: BloodGroup
    emergency_contact?: string
    address?: string
    user_status: UserStatus
    profile_completed: boolean
    created_at: Date
    updated_at: Date
    roles?: Array<{
        id: string
        role: {
            id: string
            name: string
            display_name: string
        }
        organization?: {
            id: string
            name: string
        }
        clinic?: {
            id: string
            name: string
        }
        assigned_at: Date
    }>
}

// Role Types
export interface CreateRoleDto {
    name: string
    display_name: string
    description?: string
    is_system_role?: boolean
}

export type UpdateRoleDto = Partial<CreateRoleDto>

export interface AssignPermissionsDto {
    permission_ids: string[]
}

export interface RoleResponseDto {
    id: string
    name: string
    display_name: string
    description?: string
    is_system_role: boolean
    created_at: Date
    permissions?: PermissionResponseDto[]
}

// Permission Types
export interface CreatePermissionDto {
    resource: string
    action: string
    description?: string
}

export type UpdatePermissionDto = Partial<CreatePermissionDto>

export interface PermissionResponseDto {
    id: string
    resource: string
    action: string
    name: string
    description?: string
    created_at: Date
  }